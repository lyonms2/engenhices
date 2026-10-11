import { createHash } from "node:crypto";

/**
 * Funções do Cloudinary que dependem do API secret: só rodam no servidor.
 */

export type CredenciaisCloudinary = { cloudName: string; apiKey: string; apiSecret: string };

export function credenciaisCloudinary(): CredenciaisCloudinary | null {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  return cloudName && apiKey && apiSecret ? { cloudName, apiKey, apiSecret } : null;
}

export const FORMATOS_PERMITIDOS = "jpg,jpeg,png,webp,avif,heic";

/** Assinatura de envio: parâmetros em ordem alfabética + secret, em SHA-1. */
export function assinar(parametros: Record<string, string>, apiSecret: string): string {
  const texto = Object.keys(parametros)
    .sort()
    .map((chave) => `${chave}=${parametros[chave]}`)
    .join("&");
  return createHash("sha1").update(texto + apiSecret).digest("hex");
}

export function parametrosDeEnvio(pasta: string): Record<string, string> {
  return {
    allowed_formats: FORMATOS_PERMITIDOS,
    folder: pasta,
    timestamp: String(Math.floor(Date.now() / 1000)),
  };
}

/** Envia um arquivo ao Cloudinary a partir do servidor. */
export async function enviarDoServidor(
  arquivo: Blob,
  pasta: string,
  credenciais: CredenciaisCloudinary,
): Promise<{ src: string; width: number; height: number }> {
  const parametros = parametrosDeEnvio(pasta);
  const corpo = new FormData();
  corpo.append("file", arquivo);
  corpo.append("api_key", credenciais.apiKey);
  corpo.append("signature", assinar(parametros, credenciais.apiSecret));
  for (const [chave, valor] of Object.entries(parametros)) corpo.append(chave, valor);

  const resposta = await fetch(
    `https://api.cloudinary.com/v1_1/${credenciais.cloudName}/image/upload`,
    { method: "POST", body: corpo },
  );
  const dados = (await resposta.json()) as {
    secure_url?: string;
    width?: number;
    height?: number;
    error?: { message?: string };
  };
  if (!resposta.ok || !dados.secure_url || !dados.width || !dados.height) {
    throw new Error(dados.error?.message ?? "Falha no envio ao Cloudinary.");
  }
  return { src: dados.secure_url, width: dados.width, height: dados.height };
}
