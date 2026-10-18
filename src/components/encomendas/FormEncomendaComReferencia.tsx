"use client";

import { useSearchParams } from "next/navigation";
import { FormEncomenda, type ReferenciaDeProduto } from "./FormEncomenda";

const SLUG_VALIDO = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** Lê ?produto=…&titulo=… (do botão "Encomendar sob medida"), aceitando só valores plausíveis. */
function lerReferencia(parametros: URLSearchParams): ReferenciaDeProduto | undefined {
  const slug = parametros.get("produto") ?? "";
  const titulo = (parametros.get("titulo") ?? "").trim();
  if (!SLUG_VALIDO.test(slug) || slug.length > 80 || !titulo || titulo.length > 120) return undefined;
  return { slug, titulo };
}

/**
 * Formulário de encomendas com a referência do produto vinda do endereço.
 * Fica dentro de <Suspense>: com Cache Components, ler o endereço na página
 * pré-renderizada exige isso, e o fallback é o mesmo formulário sem referência.
 */
export function FormEncomendaComReferencia() {
  const parametros = useSearchParams();
  const referencia = lerReferencia(parametros);
  // A chave remonta o formulário se a referência mudar (navegação entre produtos).
  return <FormEncomenda key={referencia?.slug ?? "sem-referencia"} referencia={referencia} />;
}
