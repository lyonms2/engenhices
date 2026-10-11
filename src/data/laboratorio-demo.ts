/**
 * Formatos previstos para o Engenhices Lab. Ainda não há vídeos publicados:
 * cada formato fica sem URL até o primeiro conteúdo real existir.
 */

export type FormatoLab = {
  id: string;
  title: string;
  description: string;
  plataforma: "YouTube" | "TikTok" | "Site";
  /** URL do vídeo (YouTube) ou do post (TikTok). Nula até ser publicado. */
  url: string | null;
};

export const formatosLab: FormatoLab[] = [
  {
    id: "experimentos",
    title: "Experimentos",
    description:
      "Testes de resistência, encaixe e material. Medimos, quebramos e anotamos o que aprendemos.",
    plataforma: "YouTube",
    url: null,
  },
  {
    id: "bastidores",
    title: "Bastidores",
    description:
      "Do esboço ao objeto: o caminho completo de um projeto, com as escolhas e os desvios.",
    plataforma: "YouTube",
    url: null,
  },
  {
    id: "rapidos",
    title: "Vídeos curtos",
    description:
      "Um mecanismo, um truque de impressão ou um resultado, em menos de um minuto.",
    plataforma: "TikTok",
    url: null,
  },
];
