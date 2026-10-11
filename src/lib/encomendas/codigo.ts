import { randomInt } from "node:crypto";
import { TAMANHO_DO_CODIGO as TAMANHO } from "./validacao";

/**
 * Letras e números sem os que se confundem ao ler ou ditar
 * (0/O, 1/I/L, 5/S, 8/B). 6 caracteres: cerca de 387 milhões de códigos.
 */
const ALFABETO = "234679ACDEFGHJKMNPQRTUVWXYZ";

/** Código curto do pedido, ex.: "A7K2Q9". Também é o id do documento. */
export function gerarCodigoDoPedido(): string {
  let codigo = "";
  for (let i = 0; i < TAMANHO; i++) codigo += ALFABETO[randomInt(ALFABETO.length)];
  return codigo;
}

