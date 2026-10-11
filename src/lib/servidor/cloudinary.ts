import { createHash, randomUUID } from "node:crypto";
import type { Extensao3d } from "@/lib/encomendas/validacao";

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

/** Só arquivos do site podem ser apagados ou listados por aqui. */
const PREFIXO_PERMITIDO = "engenhices/";

/**
 * Um arquivo no Cloudinary. Imagens ("image") e arquivos 3D ("raw") vivem em
 * espaços separados; em "raw", a extensão faz parte do public_id.
 */
export type RecursoCloudinary = { tipo: "image" | "raw"; publicId: string };

function autorizacao(credenciais: CredenciaisCloudinary): string {
  return `Basic ${Buffer.from(`${credenciais.apiKey}:${credenciais.apiSecret}`).toString("base64")}`;
}

/**
 * Lê um endereço de entrega do Cloudinary:
 * .../image/upload/v179/engenhices/criacoes/abc.png → image, engenhices/criacoes/abc
 * .../raw/upload/v179/engenhices/encomendas-arquivos/x.stl → raw, engenhices/encomendas-arquivos/x.stl
 * Devolve null para endereços de outra conta ou fora da pasta do site.
 */
export function recursoDaUrl(url: string, cloudName: string): RecursoCloudinary | null {
  for (const tipo of ["image", "raw"] as const) {
    const prefixo = `https://res.cloudinary.com/${cloudName}/${tipo}/upload/`;
    if (!url.startsWith(prefixo)) continue;
    let caminho = url.slice(prefixo.length).replace(/^v\d+\//, "");
    if (tipo === "image") caminho = caminho.replace(/\.[a-z0-9]+$/i, "");
    caminho = decodeURIComponent(caminho);
    return caminho.startsWith(PREFIXO_PERMITIDO) ? { tipo, publicId: caminho } : null;
  }
  return null;
}

/**
 * Apaga arquivos do Cloudinary (Admin API, até 100 por chamada e por tipo) e
 * limpa o cache da CDN. Arquivo já inexistente conta como apagado.
 */
export async function apagarDoServidor(recursos: RecursoCloudinary[], credenciais: CredenciaisCloudinary) {
  for (const tipo of ["image", "raw"] as const) {
    const ids = recursos.filter((recurso) => recurso.tipo === tipo).map((recurso) => recurso.publicId);
    if (ids.length === 0) continue;

    const parametros = new URLSearchParams({ invalidate: "true" });
    for (const id of ids) parametros.append("public_ids[]", id);
    const resposta = await fetch(
      `https://api.cloudinary.com/v1_1/${credenciais.cloudName}/resources/${tipo}/upload?${parametros}`,
      { method: "DELETE", headers: { Authorization: autorizacao(credenciais) } },
    );
    const dados = (await resposta.json()) as {
      deleted?: Record<string, string>;
      error?: { message?: string };
    };
    if (!resposta.ok) throw new Error(dados.error?.message ?? "Falha ao apagar no Cloudinary.");

    const falhas = Object.entries(dados.deleted ?? {}).filter(
      ([, situacao]) => situacao !== "deleted" && situacao !== "not_found",
    );
    if (falhas.length > 0) throw new Error(`Não apagou: ${falhas.map(([id]) => id).join(", ")}`);
  }
}

export type ArquivoNoCloudinary = RecursoCloudinary & {
  src: string;
  bytes: number;
  criadoEm: string;
};

/** Todos os arquivos da pasta do site no Cloudinary, imagens e 3D (Admin API, paginada). */
export async function listarArquivosDoSite(credenciais: CredenciaisCloudinary): Promise<ArquivoNoCloudinary[]> {
  const arquivos: ArquivoNoCloudinary[] = [];

  for (const tipo of ["image", "raw"] as const) {
    let cursor: string | undefined;
    do {
      const parametros = new URLSearchParams({ prefix: PREFIXO_PERMITIDO, max_results: "500" });
      if (cursor) parametros.set("next_cursor", cursor);
      const resposta = await fetch(
        `https://api.cloudinary.com/v1_1/${credenciais.cloudName}/resources/${tipo}/upload?${parametros}`,
        { headers: { Authorization: autorizacao(credenciais) } },
      );
      const dados = (await resposta.json()) as {
        resources?: { public_id: string; secure_url: string; bytes: number; created_at: string }[];
        next_cursor?: string;
        error?: { message?: string };
      };
      if (!resposta.ok) throw new Error(dados.error?.message ?? "Falha ao listar arquivos no Cloudinary.");

      for (const arquivo of dados.resources ?? []) {
        arquivos.push({
          tipo,
          publicId: arquivo.public_id,
          src: arquivo.secure_url,
          bytes: arquivo.bytes,
          criadoEm: arquivo.created_at,
        });
      }
      cursor = dados.next_cursor;
    } while (cursor);
  }

  return arquivos;
}

export const PASTA_ARQUIVOS_3D = "engenhices/encomendas-arquivos";

/**
 * Parâmetros assinados para o navegador enviar um arquivo 3D direto ao
 * Cloudinary. O nome é sorteado aqui: o cliente não escolhe onde o arquivo
 * fica nem consegue sobrescrever outro.
 */
export function parametrosDeArquivo3d(extensao: Extensao3d): Record<string, string> {
  return {
    public_id: `${PASTA_ARQUIVOS_3D}/${randomUUID()}.${extensao}`,
    timestamp: String(Math.floor(Date.now() / 1000)),
  };
}

/** Confirma que um arquivo 3D existe no Cloudinary e devolve os dados reais dele. */
export async function consultarArquivo3d(
  publicId: string,
  credenciais: CredenciaisCloudinary,
): Promise<{ src: string; bytes: number } | null> {
  const resposta = await fetch(
    `https://api.cloudinary.com/v1_1/${credenciais.cloudName}/resources/raw/upload/${publicId
      .split("/")
      .map(encodeURIComponent)
      .join("/")}`,
    { headers: { Authorization: autorizacao(credenciais) } },
  );
  if (resposta.status === 404) return null;
  const dados = (await resposta.json()) as { secure_url?: string; bytes?: number; error?: { message?: string } };
  if (!resposta.ok || !dados.secure_url) throw new Error(dados.error?.message ?? "Falha ao consultar o arquivo.");
  return { src: dados.secure_url, bytes: dados.bytes ?? 0 };
}
