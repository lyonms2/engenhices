/**
 * Solicitação de orçamento enviada pelo formulário de /encomendas.
 * Espelha o documento da coleção `encomendas` do Firestore.
 */

export const STATUS_ENCOMENDA = {
  nova: "Nova",
  "em-analise": "Em análise",
  "orcamento-enviado": "Orçamento enviado",
  concluida: "Concluída",
  recusada: "Recusada",
} as const;

export type StatusEncomenda = keyof typeof STATUS_ENCOMENDA;

export type FotoReferencia = {
  src: string;
  width: number;
  height: number;
};

export type CamposEncomenda = {
  nome: string;
  contato: string;
  descricao: string;
  finalidade: string;
  medidas: string;
  observacoes: string;
  /** Link para um arquivo 3D maior que o limite de envio (Drive, Printables…). */
  linkArquivo: string;
};

/** Modelo 3D enviado pelo cliente direto ao Cloudinary. */
export type Arquivo3d = {
  src: string;
  /** Nome original, para o administrador reconhecer o arquivo. */
  nome: string;
  bytes: number;
};

export type Encomenda = CamposEncomenda & {
  id: string;
  fotos: FotoReferencia[];
  arquivo: Arquivo3d | null;
  status: StatusEncomenda;
  /** ISO 8601. */
  createdAt: string;
  updatedAt: string;
};
