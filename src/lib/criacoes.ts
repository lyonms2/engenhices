import { cacheLife, cacheTag } from "next/cache";
import { criacoesDemo } from "@/data/criacoes-demo";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import { lerCriacaoPublica, lerCriacoesPublicas } from "@/lib/firebase/servidor";
import type { Criacao } from "@/types/criacao";

/**
 * Ponto único de leitura das criações para as páginas públicas.
 *
 * Com o Firebase configurado, lê o Firestore; sem ele (desenvolvimento sem
 * .env.local), usa os dados demonstrativos. O resultado fica em cache por
 * alguns minutos: o que for alterado no /admin aparece no site nesse prazo.
 */

export async function getCriacoes(): Promise<Criacao[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("criacoes");

  if (!isFirebaseConfigured()) {
    return criacoesDemo.filter((criacao) => criacao.status !== "rascunho");
  }
  return lerCriacoesPublicas();
}

export async function getCriacoesEmDestaque(limite = 3): Promise<Criacao[]> {
  const todas = await getCriacoes();
  return todas
    .filter((criacao) => criacao.featured && criacao.status === "publicado")
    .slice(0, limite);
}

export async function getCriacaoPorSlug(slug: string): Promise<Criacao | null> {
  "use cache";
  cacheLife("minutes");
  cacheTag("criacoes");

  if (!isFirebaseConfigured()) {
    return criacoesDemo.find((criacao) => criacao.slug === slug) ?? null;
  }
  return lerCriacaoPublica(slug);
}
