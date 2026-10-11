import { MAX_BYTES_ARQUIVO_3D, extensaoDe } from "@/lib/encomendas/validacao";
import { assinar, credenciaisCloudinary, parametrosDeArquivo3d } from "@/lib/servidor/cloudinary";
import { permitirEnvio } from "@/lib/servidor/limite-de-envios";

/** Mesmo critério do formulário: abaixo disso, foi rápido demais para ser uma pessoa. */
const TEMPO_MINIMO_MS = 4000;

/**
 * Autoriza o envio de UM arquivo 3D do formulário de encomendas direto ao
 * Cloudinary (o arquivo não passa pelo servidor, que limita envios a 4,5 MB).
 * Aplica as mesmas barreiras do pedido: campo-armadilha, tempo mínimo de
 * preenchimento e limite por IP. O nome do arquivo no Cloudinary é sorteado
 * aqui, e a assinatura só vale para ele.
 */
export async function POST(request: Request) {
  const corpo = (await request.json().catch(() => null)) as {
    nome?: unknown;
    bytes?: unknown;
    inicio?: unknown;
    site?: unknown;
  } | null;
  if (!corpo) return Response.json({ erro: "Envio inválido." }, { status: 400 });

  if (typeof corpo.site === "string" && corpo.site !== "") {
    return Response.json({ erro: "Não foi possível enviar o arquivo." }, { status: 400 });
  }
  const inicio = Number(corpo.inicio);
  if (!Number.isFinite(inicio) || Date.now() - inicio < TEMPO_MINIMO_MS) {
    return Response.json({ erro: "Não foi possível enviar o arquivo. Tente de novo." }, { status: 400 });
  }

  const extensao = typeof corpo.nome === "string" ? extensaoDe(corpo.nome) : null;
  if (!extensao) {
    return Response.json({ erro: "Envie um arquivo .stl, .3mf, .obj, .step ou .stp." }, { status: 400 });
  }
  const bytes = Number(corpo.bytes);
  if (!Number.isFinite(bytes) || bytes <= 0 || bytes > MAX_BYTES_ARQUIVO_3D) {
    return Response.json(
      { erro: "O arquivo passa de 10 MB. Use o campo de link para arquivos maiores." },
      { status: 413 },
    );
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "desconhecido";
  if (!permitirEnvio(ip, "arquivo")) {
    return Response.json(
      { erro: "Muitos envios em sequência. Espere alguns minutos e tente de novo." },
      { status: 429 },
    );
  }

  const credenciais = credenciaisCloudinary();
  if (!credenciais) {
    return Response.json({ erro: "O envio de arquivos está temporariamente indisponível." }, { status: 503 });
  }

  const parametros = parametrosDeArquivo3d(extensao);
  return Response.json({
    cloudName: credenciais.cloudName,
    apiKey: credenciais.apiKey,
    signature: assinar(parametros, credenciais.apiSecret),
    parametros,
  });
}
