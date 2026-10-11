import { algumContem, normalizar, type Periodo } from "@/lib/filtros";
import type { Encomenda } from "@/types/encomenda";
import { codigoParaExibir } from "./validacao";

/** Pedidos abrem nos últimos 30 dias: o que importa é o que chegou agora. */
export const PERIODO_PADRAO: Periodo = "30";

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
  if (algumContem(campos, procurado)) return true;

  const digitos = procurado.replace(/\D/g, "");
  return digitos.length >= 4 && encomenda.contato.replace(/\D/g, "").includes(digitos);
}
