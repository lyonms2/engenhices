import type { Encomenda, StatusEncomenda } from "@/types/encomenda";

/**
 * Prazo de guarda dos pedidos, o mesmo prometido na política de privacidade
 * (/privacidade). Conta a partir da última mudança de situação (updatedAt).
 * Pedidos novos ou em análise ainda estão em andamento e não vencem.
 *
 * Concluídos ficam 5 anos, com a identidade do cliente: é o prazo do CDC
 * (art. 27) para reclamar de danos, e a guarda serve para comprovar o que foi
 * pedido e entregue (LGPD, art. 7º, VI).
 */
export const DIAS_DE_GUARDA: Partial<Record<StatusEncomenda, number>> = {
  recusada: 90,
  "orcamento-enviado": 90,
  concluida: 5 * 365,
};

/** Prazo em texto, para a política e o painel: "90 dias", "5 anos". */
export function prazoEmTexto(dias: number): string {
  if (dias % 365 === 0) return dias === 365 ? "1 ano" : `${dias / 365} anos`;
  return `${dias} dias`;
}

const DIA_MS = 24 * 60 * 60 * 1000;

export type PrazoDeGuarda =
  | { tipo: "em-andamento" }
  | { tipo: "guardando"; venceEm: Date; diasRestantes: number }
  | { tipo: "vencido"; venceuEm: Date; diasVencido: number };

export function prazoDeGuarda(encomenda: Pick<Encomenda, "status" | "updatedAt">, agora: number): PrazoDeGuarda {
  const dias = DIAS_DE_GUARDA[encomenda.status];
  if (dias === undefined) return { tipo: "em-andamento" };

  const vence = Date.parse(encomenda.updatedAt) + dias * DIA_MS;
  if (agora < vence) {
    return { tipo: "guardando", venceEm: new Date(vence), diasRestantes: Math.ceil((vence - agora) / DIA_MS) };
  }
  return { tipo: "vencido", venceuEm: new Date(vence), diasVencido: Math.floor((agora - vence) / DIA_MS) };
}

export function estaVencido(encomenda: Pick<Encomenda, "status" | "updatedAt">, agora: number): boolean {
  return prazoDeGuarda(encomenda, agora).tipo === "vencido";
}
