import { credenciaisCloudinary, listarArquivosDoSite, recursoDaUrl } from "@/lib/servidor/cloudinary";
import { verificarAdmin } from "@/lib/servidor/verificar-admin";

/** Fotos mais novas que isso podem estar numa edição ainda não salva. */
const CARENCIA_MS = 24 * 60 * 60 * 1000;

/**
 * Compara as fotos da pasta engenhices/ no Cloudinary com a lista de fotos em
 * uso (enviada pelo /admin, que é quem consegue ler rascunhos e pedidos) e
 * devolve as que sobram. Não apaga nada: a exclusão é um segundo passo.
 */
export async function POST(request: Request) {
  if (!(await verificarAdmin(request))) {
    return Response.json({ erro: "Não autorizado." }, { status: 401 });
  }

  const credenciais = credenciaisCloudinary();
  if (!credenciais) {
    return Response.json({ erro: "Cloudinary não configurado." }, { status: 503 });
  }

  const corpo = (await request.json().catch(() => null)) as { usadas?: unknown } | null;
  if (!Array.isArray(corpo?.usadas) || corpo.usadas.some((url) => typeof url !== "string")) {
    return Response.json({ erro: "Lista de fotos em uso inválida." }, { status: 400 });
  }
  // Chave "tipo:id": uma imagem e um arquivo 3D nunca se confundem.
  const chave = (recurso: { tipo: string; publicId: string }) => `${recurso.tipo}:${recurso.publicId}`;
  const emUso = new Set(
    (corpo.usadas as string[])
      .map((url) => recursoDaUrl(url, credenciais.cloudName))
      .filter((recurso) => recurso !== null)
      .map(chave),
  );

  try {
    const todos = await listarArquivosDoSite(credenciais);
    const limite = Date.now() - CARENCIA_MS;
    const recentes = todos.filter((arquivo) => Date.parse(arquivo.criadoEm) > limite).length;
    const naoUsadas = todos.filter(
      (arquivo) => !emUso.has(chave(arquivo)) && Date.parse(arquivo.criadoEm) <= limite,
    );
    return Response.json({ total: todos.length, recentes, naoUsadas });
  } catch (falha) {
    console.error("[fotos] Falha ao listar:", falha);
    return Response.json({ erro: "Não foi possível listar as fotos no Cloudinary." }, { status: 502 });
  }
}
