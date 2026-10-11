import { createHash } from "node:crypto";
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

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    return Response.json({ erro: "Cloudinary não configurado." }, { status: 503 });
  }

  // Parâmetros assinados: o Cloudinary recusa o envio se algum for alterado.
  const parametros: Record<string, string> = {
    allowed_formats: "jpg,jpeg,png,webp,avif,heic",
    folder: "engenhices/criacoes",
    timestamp: String(Math.floor(Date.now() / 1000)),
  };
  const texto = Object.keys(parametros)
    .sort()
    .map((chave) => `${chave}=${parametros[chave]}`)
    .join("&");
  const signature = createHash("sha1").update(texto + apiSecret).digest("hex");

  return Response.json({ cloudName, apiKey, signature, parametros });
}
