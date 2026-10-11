import type { Encomenda } from "@/types/encomenda";
import { codigoParaExibir } from "./validacao";

/**
 * Busca e filtro por data da lista de pedidos do /admin. Funções puras, sem
 * React, para serem testadas isoladamente.
 */

export type Periodo = "7" | "30" | "90" | "ano" | "tudo" | "personalizado";

export const PERIODOS: readonly (readonly [Periodo, string])[] = [
  ["7", "Últimos 7 dias"],
  ["30", "Últimos 30 dias"],
  ["90", "Últimos 90 dias"],
  ["ano", "Este ano"],
  ["tudo", "Todo o período"],
  ["personalizado", "Escolher datas"],
];

export const PERIODO_PADRAO: Periodo = "30";
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
  intervalo: { de: string; ate: string } = { de: "", ate: "" },
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

/**
 * Procura o termo no código do pedido (com ou sem "#"), no nome, no contato
 * e nos textos. Telefones também batem só pelos dígitos: "98765-4321"
 * encontra "(11) 987654321".
 */
export function correspondeABusca(encomenda: Encomenda, termo: string): boolean {
  const procurado = normalizar(termo).replace(/^#/, "");
  if (!procurado) return true;

  const campos = [
    codigoParaExibir(encomenda.id),
    encomenda.nome,
    encomenda.contato,
    encomenda.descricao,
    encomenda.finalidade,
    encomenda.medidas,
    encomenda.observacoes,
  ];
  if (campos.some((campo) => normalizar(campo).includes(procurado))) return true;

  const digitos = procurado.replace(/\D/g, "");
  return digitos.length >= 4 && encomenda.contato.replace(/\D/g, "").includes(digitos);
}
