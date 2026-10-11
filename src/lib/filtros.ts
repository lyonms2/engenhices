/**
 * Busca, período e paginação das listas do /admin (criações e pedidos).
 * Funções puras, sem React, para serem testadas isoladamente.
 */

export type Periodo = "7" | "30" | "90" | "ano" | "tudo" | "personalizado";
export type Intervalo = { de: string; ate: string };

export const PERIODOS: readonly (readonly [Periodo, string])[] = [
  ["7", "Últimos 7 dias"],
  ["30", "Últimos 30 dias"],
  ["90", "Últimos 90 dias"],
  ["ano", "Este ano"],
  ["tudo", "Todo o período"],
  ["personalizado", "Escolher datas"],
];

export const POR_PAGINA = 20;

const DIA_MS = 24 * 60 * 60 * 1000;

/** "2026-10-11" (do <input type="date">) → meia-noite local desse dia. */
function inicioDoDia(data: string): number {
  const [ano, mes, dia] = data.split("-").map(Number);
  return new Date(ano, mes - 1, dia).getTime();
}

export function dentroDoPeriodo(
  criadoEm: string,
  periodo: Periodo,
  agora: number,
  intervalo: Intervalo = { de: "", ate: "" },
): boolean {
  const momento = Date.parse(criadoEm);
  switch (periodo) {
    case "tudo":
      return true;
    case "ano":
      return new Date(momento).getFullYear() === new Date(agora).getFullYear();
    case "personalizado":
      return (
        (!intervalo.de || momento >= inicioDoDia(intervalo.de)) &&
        (!intervalo.ate || momento < inicioDoDia(intervalo.ate) + DIA_MS)
      );
    default:
      return momento >= agora - Number(periodo) * DIA_MS;
  }
}

/** Minúsculas e sem acentos: "Análise" e "analise" se encontram. */
export function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

/** Verdadeiro se algum dos textos contém o termo (sem acentos nem maiúsculas). */
export function algumContem(textos: string[], termo: string): boolean {
  const procurado = normalizar(termo);
  return !procurado || textos.some((texto) => normalizar(texto).includes(procurado));
}

/** Fatia da lista para a página pedida (que é ajustada se passar do fim). */
export function paginar<T>(itens: T[], pagina: number) {
  const totalDePaginas = Math.max(1, Math.ceil(itens.length / POR_PAGINA));
  const atual = Math.min(Math.max(1, pagina), totalDePaginas);
  return {
    itens: itens.slice((atual - 1) * POR_PAGINA, atual * POR_PAGINA),
    pagina: atual,
    totalDePaginas,
  };
}
