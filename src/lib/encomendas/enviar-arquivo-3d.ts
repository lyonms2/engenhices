"use client";

type Assinatura = {
  cloudName: string;
  apiKey: string;
  signature: string;
  parametros: Record<string, string>;
};

/**
 * Envia o modelo 3D do cliente direto ao Cloudinary: pede ao servidor a
 * autorização (que passa pelas barreiras contra robôs) e manda o arquivo,
 * informando o progresso. Devolve o endereço do arquivo no Cloudinary.
 */
export async function enviarArquivo3d(
  arquivo: File,
  contexto: { inicio: number; site: string },
  aoProgredir: (porcentagem: number) => void,
): Promise<string> {
  const resposta = await fetch("/api/encomendas/arquivo", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nome: arquivo.name, bytes: arquivo.size, ...contexto }),
  });
  const autorizacao = (await resposta.json().catch(() => ({}))) as Partial<Assinatura> & { erro?: string };
  if (!resposta.ok || !autorizacao.signature) {
    throw new Error(autorizacao.erro ?? "Não foi possível enviar o arquivo 3D.");
  }
  const { cloudName, apiKey, signature, parametros } = autorizacao as Assinatura;

  const corpo = new FormData();
  corpo.append("file", arquivo);
  corpo.append("api_key", apiKey);
  corpo.append("signature", signature);
  for (const [chave, valor] of Object.entries(parametros)) corpo.append(chave, valor);

  // XMLHttpRequest, e não fetch, porque só ele informa o progresso do envio.
  return new Promise<string>((resolver, rejeitar) => {
    const requisicao = new XMLHttpRequest();
    requisicao.open("POST", `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`);
    requisicao.upload.onprogress = (evento) => {
      if (evento.lengthComputable) aoProgredir(Math.round((evento.loaded / evento.total) * 100));
    };
    requisicao.onload = () => {
      const dados = (() => {
        try {
          return JSON.parse(requisicao.responseText) as { secure_url?: string; error?: { message?: string } };
        } catch {
          return {};
        }
      })();
      if (requisicao.status >= 200 && requisicao.status < 300 && dados.secure_url) resolver(dados.secure_url);
      else rejeitar(new Error(dados.error?.message ?? "O envio do arquivo 3D falhou. Tente de novo."));
    };
    requisicao.onerror = () => rejeitar(new Error("Sem conexão durante o envio do arquivo 3D. Tente de novo."));
    requisicao.send(corpo);
  });
}
