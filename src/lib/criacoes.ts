import { criacoesDemo } from "@/data/criacoes-demo";
import type { Criacao } from "@/types/criacao";

/**
 * Ponto único de leitura das criações.
 *
 * Hoje lê os dados demonstrativos. Quando o Firestore for conectado, só o
 * corpo destas funções muda (ver src/lib/firebase/README.md); páginas e
 * componentes continuam chamando as mesmas assinaturas assíncronas.
 */

function publicadas(lista: Criacao[]): Criacao[] {
  return lista.filter((criacao) => criacao.status !== "rascunho");
}

export async function getCriacoes(): Promise<Criacao[]> {
  return publicadas(criacoesDemo);
}

export async function getCriacoesEmDestaque(limite = 3): Promise<Criacao[]> {
  const todas = await getCriacoes();
  return todas.filter((criacao) => criacao.featured).slice(0, limite);
}

export async function getCriacaoPorSlug(slug: string): Promise<Criacao | null> {
  const todas = await getCriacoes();
  return todas.find((criacao) => criacao.slug === slug) ?? null;
}
