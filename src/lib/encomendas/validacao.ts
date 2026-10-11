import type { CamposEncomenda } from "@/types/encomenda";

/**
 * Regras do formulário de encomendas, usadas pelo navegador (para avisar
 * cedo) e pelo servidor (que é quem decide). Os limites batem com os de
 * firestore.rules.
 */

export const LIMITES: Record<keyof CamposEncomenda, { min: number; max: number }> = {
  nome: { min: 2, max: 100 },
  contato: { min: 5, max: 150 },
  descricao: { min: 20, max: 3000 },
  finalidade: { min: 3, max: 500 },
  medidas: { min: 0, max: 300 },
  observacoes: { min: 0, max: 1500 },
  linkArquivo: { min: 0, max: 500 },
};

/** Limite do plano gratuito do Cloudinary para arquivos que não são imagem. */
export const MAX_BYTES_ARQUIVO_3D = 10 * 1024 * 1024;

/** Formatos de modelo 3D aceitos (sem .zip: pode trazer qualquer coisa). */
export const EXTENSOES_3D = ["stl", "3mf", "obj", "step", "stp"] as const;
export type Extensao3d = (typeof EXTENSOES_3D)[number];

export function extensaoDe(nome: string): Extensao3d | null {
  const extensao = nome.toLowerCase().split(".").pop() ?? "";
  return (EXTENSOES_3D as readonly string[]).includes(extensao) ? (extensao as Extensao3d) : null;
}

export const MAX_FOTOS = 3;

/** Por foto, já reduzida no navegador. Três delas cabem no limite da Vercel (4,5 MB). */
export const MAX_BYTES_FOTO = 1_400_000;

export const CAMPOS = Object.keys(LIMITES) as (keyof CamposEncomenda)[];

export type ErrosEncomenda = Partial<Record<keyof CamposEncomenda, string>>;

export function validarCampos(campos: CamposEncomenda): ErrosEncomenda {
  const erros: ErrosEncomenda = {};
  for (const campo of CAMPOS) {
    const { min, max } = LIMITES[campo];
    const tamanho = campos[campo].trim().length;
    if (min > 0 && tamanho === 0) erros[campo] = "Campo obrigatório.";
    else if (tamanho < min) erros[campo] = `Escreva pelo menos ${min} caracteres.`;
    else if (tamanho > max) erros[campo] = `Use no máximo ${max} caracteres.`;
  }
  const link = campos.linkArquivo.trim();
  if (link && !erros.linkArquivo && !/^https?:\/\/\S+\.\S+/i.test(link)) {
    erros.linkArquivo = "Cole o endereço completo, começando com https://";
  }
  return erros;
}

export const TAMANHO_DO_CODIGO = 6;

/** Código do pedido para exibir: pedidos antigos têm o id longo do Firestore. */
export function codigoParaExibir(id: string): string {
  return id.length <= TAMANHO_DO_CODIGO ? id : id.slice(0, TAMANHO_DO_CODIGO).toUpperCase();
}
