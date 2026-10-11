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
};

export type Encomenda = CamposEncomenda & {
  id: string;
  fotos: FotoReferencia[];
  status: StatusEncomenda;
  /** ISO 8601. */
  createdAt: string;
  updatedAt: string;
};
