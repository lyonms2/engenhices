/**
 * Modelo de uma criação (produto ou projeto) da Engenhices.
 * Espelha o documento previsto para a coleção `criacoes` do Firestore.
 */

export const CATEGORIAS = {
  utilidades: "Utilidades",
  organizacao: "Organização",
  mecanismos: "Mecanismos",
  ferramentas: "Ferramentas",
  decoracao: "Decoração",
  prototipos: "Protótipos",
} as const;

export type Categoria = keyof typeof CATEGORIAS;

/**
 * - `rascunho`: existe só para a administração.
 * - `publicado`: aparece no site.
 * - `arquivado`: saiu de linha, mas a página continua acessível.
 */
export type StatusCriacao = "rascunho" | "publicado" | "arquivado";

export type ImagemCriacao = {
  /** Caminho em /public ou URL do Firebase Storage. */
  src: string;
  /** Texto alternativo obrigatório: descreve o que a foto mostra. */
  alt: string;
  width: number;
  height: number;
};

export type Criacao = {
  id: string;
  title: string;
  slug: string;
  description: string;
  images: ImagemCriacao[];
  category: Categoria;
  featured: boolean;
  status: StatusCriacao;
  /**
   * Vídeo de apresentação do produto (um só: YouTube OU TikTok). Vídeos de
   * processo ficam nos registros do Laboratório associados à criação.
   */
  youtubeUrl: string | null;
  tiktokUrl: string | null;
  /** Anúncio oficial no Mercado Livre, onde a compra é concluída. */
  mercadoLivreUrl: string | null;
  /** Datas em ISO 8601. No Firestore viram Timestamp e são convertidas na leitura. */
  createdAt: string;
  updatedAt: string;
  /**
   * Marca conteúdo de exemplo, que não é produto real da marca.
   * O site exibe um selo "Exemplo" sempre que este campo for verdadeiro.
   */
  demo: boolean;
};
