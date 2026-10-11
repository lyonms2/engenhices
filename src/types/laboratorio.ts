import type { ImagemCriacao } from "./criacao";

/**
 * Registro do Engenhices Lab: a unidade editorial que documenta como uma
 * ideia vira produto (ou ainda não virou). Guarda os vídeos de PROCESSO
 * (testes, erros, bastidores); a página de uma criação mostra esses vídeos
 * junto com o vídeo de apresentação dela.
 * Espelha o documento da coleção `laboratorio` do Firestore (id = slug).
 */

export const TIPOS_DE_REGISTRO = {
  experimento: "Experimento",
  prototipo: "Protótipo",
  teste: "Teste",
  erro: "Erro",
  melhoria: "Melhoria",
  resultado: "Resultado",
  bastidores: "Bastidores",
  projeto: "Projeto",
} as const;

export type TipoDeRegistro = keyof typeof TIPOS_DE_REGISTRO;

/** O que cada tipo documenta, exibido como ajuda no painel e na página. */
export const DESCRICAO_DOS_TIPOS: Record<TipoDeRegistro, string> = {
  experimento: "Uma hipótese posta à prova: o que foi testado e o que se descobriu.",
  prototipo: "Uma versão de teste de uma ideia, ainda longe da final.",
  teste: "Resistência, encaixe, uso real: medições e resultados.",
  erro: "O que deu errado e por quê. Falhas também ensinam.",
  melhoria: "O que mudou de uma revisão para a outra.",
  resultado: "A versão final funcionando.",
  bastidores: "O caminho de um projeto, com as escolhas e os desvios.",
  projeto: "Uma ideia em desenvolvimento, que ainda não virou produto.",
};

export type StatusDoRegistro = "rascunho" | "publicado";

export type RegistroLab = {
  id: string;
  title: string;
  slug: string;
  type: TipoDeRegistro;
  /** Uma ou duas frases para cartões e buscadores. */
  summary: string;
  /** Texto completo; parágrafos separados por linha em branco. */
  body: string;
  images: ImagemCriacao[];
  youtubeUrl: string | null;
  tiktokUrl: string | null;
  /** Slug da criação associada; null em projetos e conteúdos avulsos. */
  creationSlug: string | null;
  status: StatusDoRegistro;
  /** ISO 8601. */
  createdAt: string;
  updatedAt: string;
};
