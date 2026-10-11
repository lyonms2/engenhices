import { assinar, credenciaisCloudinary, parametrosDeEnvio } from "@/lib/servidor/cloudinary";
import { verificarAdmin } from "@/lib/servidor/verificar-admin";

/**
 * Assina um envio de foto para o Cloudinary. Só o administrador recebe a
 * assinatura; com ela, o navegador envia o arquivo direto ao Cloudinary,
 * sem que o CLOUDINARY_API_SECRET saia do servidor.
 */
export async function POST(request: Request) {
  if (!(await verificarAdmin(request))) {
    return Response.json({ erro: "Não autorizado." }, { status: 401 });
  }

  const credenciais = credenciaisCloudinary();
  if (!credenciais) {
    return Response.json({ erro: "Cloudinary não configurado." }, { status: 503 });
  }

  // Só pastas conhecidas; qualquer outro valor cai em criações.
  const corpo = (await request.json().catch(() => ({}))) as { pasta?: unknown };
  const pasta = corpo.pasta === "laboratorio" ? "laboratorio" : "criacoes";

  // Parâmetros assinados: o Cloudinary recusa o envio se algum for alterado.
  const parametros = parametrosDeEnvio(`engenhices/${pasta}`);
  return Response.json({
    cloudName: credenciais.cloudName,
    apiKey: credenciais.apiKey,
    signature: assinar(parametros, credenciais.apiSecret),
    parametros,
  });
}
