import {
  CAMPOS,
  MAX_BYTES_ARQUIVO_3D,
  MAX_BYTES_FOTO,
  MAX_FOTOS,
  validarCampos,
} from "@/lib/encomendas/validacao";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import { gerarCodigoDoPedido } from "@/lib/encomendas/codigo";
import { gravarEncomenda } from "@/lib/firebase/servidor";
import {
  PASTA_ARQUIVOS_3D,
  consultarArquivo3d,
  credenciaisCloudinary,
  enviarDoServidor,
  recursoDaUrl,
  type CredenciaisCloudinary,
} from "@/lib/servidor/cloudinary";
import { permitirEnvio } from "@/lib/servidor/limite-de-envios";
import type { Arquivo3d, CamposEncomenda } from "@/types/encomenda";

/** Abaixo disso, o formulário foi preenchido rápido demais para ser uma pessoa. */
const TEMPO_MINIMO_MS = 4000;
/** Limite de corpo da Vercel é 4,5 MB; folga para os campos de texto. */
const TAMANHO_MAXIMO_CORPO = 4_400_000;

function erro(mensagem: string, status: number, extra?: object) {
  return Response.json({ erro: mensagem, ...extra }, { status });
}

/**
 * O arquivo 3D chega como endereço, já enviado direto ao Cloudinary. Só é
 * aceito se for um arquivo da pasta de encomendas desta conta e se existir
 * de fato lá; tamanho e endereço vêm do Cloudinary, não do navegador.
 */
async function conferirArquivo3d(
  src: string,
  nome: string,
  credenciais: CredenciaisCloudinary,
): Promise<Arquivo3d | null> {
  const recurso = recursoDaUrl(src, credenciais.cloudName);
  if (!recurso || recurso.tipo !== "raw" || !recurso.publicId.startsWith(`${PASTA_ARQUIVOS_3D}/`)) return null;
  const real = await consultarArquivo3d(recurso.publicId, credenciais);
  if (!real || real.bytes > MAX_BYTES_ARQUIVO_3D) return null;
  return { src: real.src, nome: nome.slice(0, 120) || "modelo-3d", bytes: real.bytes };
}

/**
 * Recebe uma solicitação de orçamento: confere os campos, envia as fotos de
 * referência ao Cloudinary e grava no Firestore com a chave do servidor.
 */
export async function POST(request: Request) {
  if (Number(request.headers.get("content-length") ?? 0) > TAMANHO_MAXIMO_CORPO) {
    return erro("As fotos ficaram grandes demais. Envie menos fotos ou imagens menores.", 413);
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return erro("Envio inválido.", 400);
  }

  // Campo-armadilha: invisível para pessoas, preenchido por robôs.
  // Responde como sucesso para não ensinar o robô a contornar.
  if (String(form.get("site") ?? "") !== "") {
    return Response.json({ ok: true, codigo: gerarCodigoDoPedido() });
  }

  const inicio = Number(form.get("inicio"));
  if (!Number.isFinite(inicio) || Date.now() - inicio < TEMPO_MINIMO_MS) {
    return erro("Não foi possível enviar. Revise os campos e tente de novo.", 400);
  }

  const campos = Object.fromEntries(
    CAMPOS.map((campo) => [campo, String(form.get(campo) ?? "").trim()]),
  ) as CamposEncomenda;
  const erros = validarCampos(campos);
  if (Object.keys(erros).length > 0) {
    return erro("Alguns campos precisam de ajuste.", 400, { erros });
  }

  if (form.get("consentimento") !== "sim") {
    return erro("É preciso concordar com o uso dos dados para responder ao pedido.", 400);
  }

  const fotos = form
    .getAll("fotos")
    .filter((item): item is File => item instanceof File && item.size > 0);
  if (fotos.length > MAX_FOTOS) return erro(`Envie no máximo ${MAX_FOTOS} fotos.`, 400);
  if (fotos.some((foto) => foto.size > MAX_BYTES_FOTO || !foto.type.startsWith("image/"))) {
    return erro("Uma das fotos não é uma imagem válida ou é grande demais.", 400);
  }

  // Conta só envios válidos: quem erra um campo não gasta o limite.
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "desconhecido";
  if (!permitirEnvio(ip)) {
    return erro("Muitos envios em sequência. Espere alguns minutos e tente de novo.", 429);
  }

  const arquivoSrc = String(form.get("arquivoSrc") ?? "");
  const arquivoNome = String(form.get("arquivoNome") ?? "").trim();

  const chave = process.env.ENCOMENDAS_CHAVE;
  const credenciais = credenciaisCloudinary();
  if (!chave || !isFirebaseConfigured() || ((fotos.length > 0 || arquivoSrc) && !credenciais)) {
    console.error("[encomendas] Configuração incompleta (ENCOMENDAS_CHAVE, Firebase ou Cloudinary).");
    return erro("O recebimento de pedidos está temporariamente indisponível.", 503);
  }

  let arquivo: Arquivo3d | null = null;
  if (arquivoSrc) {
    try {
      arquivo = await conferirArquivo3d(arquivoSrc, arquivoNome, credenciais!);
    } catch (falha) {
      console.error("[encomendas] Falha ao conferir o arquivo 3D:", falha);
      return erro("Não foi possível conferir o arquivo 3D agora. Tente de novo em instantes.", 502);
    }
    if (!arquivo) return erro("O arquivo 3D não foi encontrado. Envie de novo.", 400);
  }

  try {
    const fotosEnviadas = await Promise.all(
      fotos.map((foto) => enviarDoServidor(foto, "engenhices/encomendas", credenciais!)),
    );
    const codigo = await gravarEncomenda({ ...campos, fotos: fotosEnviadas, arquivo }, chave);
    return Response.json({ ok: true, codigo });
  } catch (falha) {
    console.error("[encomendas] Falha ao gravar:", falha);
    return erro("Não foi possível registrar o pedido agora. Tente de novo em instantes.", 502);
  }
}
