"use client";

import { obterTokenDeId } from "@/lib/firebase/painel";
import type { ImagemCriacao } from "@/types/criacao";

/** Limite do plano gratuito do Cloudinary para imagens. */
export const TAMANHO_MAXIMO_MB = 10;

type Assinatura = {
  cloudName: string;
  apiKey: string;
  signature: string;
  parametros: Record<string, string>;
};

/**
 * Envia uma foto ao Cloudinary: pede a assinatura ao servidor (que confere o
 * login do administrador) e manda o arquivo direto do navegador.
 * Devolve a imagem sem texto alternativo, que é preenchido no formulário.
 */
export async function enviarFoto(arquivo: File): Promise<Omit<ImagemCriacao, "alt">> {
  if (arquivo.size > TAMANHO_MAXIMO_MB * 1024 * 1024) {
    throw new Error(`"${arquivo.name}" passa de ${TAMANHO_MAXIMO_MB} MB.`);
  }

  const resposta = await fetch("/api/fotos/assinatura", {
    method: "POST",
    headers: { Authorization: `Bearer ${await obterTokenDeId()}` },
  });
  if (!resposta.ok) {
    const { erro } = (await resposta.json().catch(() => ({}))) as { erro?: string };
    throw new Error(erro ?? "O servidor não autorizou o envio.");
  }
  const { cloudName, apiKey, signature, parametros } = (await resposta.json()) as Assinatura;

  const corpo = new FormData();
  corpo.append("file", arquivo);
  corpo.append("api_key", apiKey);
  corpo.append("signature", signature);
  for (const [chave, valor] of Object.entries(parametros)) corpo.append(chave, valor);

  const envio = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: corpo,
  });
  const dados = (await envio.json()) as {
    secure_url?: string;
    width?: number;
    height?: number;
    error?: { message?: string };
  };
  if (!envio.ok || !dados.secure_url || !dados.width || !dados.height) {
    throw new Error(dados.error?.message ?? `Falha ao enviar "${arquivo.name}".`);
  }

  return { src: dados.secure_url, width: dados.width, height: dados.height };
}
