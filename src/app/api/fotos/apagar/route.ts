import {
  apagarDoServidor,
  credenciaisCloudinary,
  publicIdDaUrl,
} from "@/lib/servidor/cloudinary";
import { verificarAdmin } from "@/lib/servidor/verificar-admin";

const MAXIMO_POR_PEDIDO = 50;

/**
 * Apaga fotos do Cloudinary a pedido do /admin (ao apagar uma criação ou um
 * pedido, ou ao remover fotos de uma criação). Só o administrador usa, e só
 * fotos da pasta engenhices/ podem ser apagadas.
 */
export async function POST(request: Request) {
  if (!(await verificarAdmin(request))) {
    return Response.json({ erro: "Não autorizado." }, { status: 401 });
  }

  const credenciais = credenciaisCloudinary();
  if (!credenciais) {
    return Response.json({ erro: "Cloudinary não configurado." }, { status: 503 });
  }

  const corpo = (await request.json().catch(() => null)) as { urls?: unknown } | null;
  const urls = Array.isArray(corpo?.urls)
    ? corpo.urls.filter((url): url is string => typeof url === "string")
    : null;
  if (!urls || urls.length > MAXIMO_POR_PEDIDO) {
    return Response.json({ erro: "Lista de fotos inválida." }, { status: 400 });
  }

  const publicIds = urls.map((url) => publicIdDaUrl(url, credenciais.cloudName));
  if (publicIds.some((id) => id === null)) {
    return Response.json({ erro: "Só fotos do site podem ser apagadas." }, { status: 400 });
  }

  try {
    await apagarDoServidor(publicIds as string[], credenciais);
  } catch (falha) {
    console.error("[fotos] Falha ao apagar:", falha);
    return Response.json({ erro: "O Cloudinary não confirmou a exclusão das fotos." }, { status: 502 });
  }
  return Response.json({ ok: true, apagadas: publicIds.length });
}
