import { cacheLife, cacheTag } from "next/cache";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import { lerRegistrosPublicos } from "@/lib/firebase/servidor";
import type { RegistroLab } from "@/types/laboratorio";

/**
 * Leitura dos registros do Laboratório para as páginas públicas. Tudo sai
 * de uma única consulta em cache: a página do Lab, a do registro, a da
 * criação associada e a home usam a mesma lista.
 */

export async function getRegistros(): Promise<RegistroLab[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("laboratorio");

  if (!isFirebaseConfigured()) return [];
  return lerRegistrosPublicos();
}

export async function getRegistroPorSlug(slug: string): Promise<RegistroLab | null> {
  return (await getRegistros()).find((registro) => registro.slug === slug) ?? null;
}

/** Registros associados a uma criação, do mais antigo ao mais novo: contam a história. */
export async function getRegistrosDaCriacao(creationSlug: string): Promise<RegistroLab[]> {
  return (await getRegistros())
    .filter((registro) => registro.creationSlug === creationSlug)
    .reverse();
}

export async function getRegistrosRecentes(limite = 3): Promise<RegistroLab[]> {
  return (await getRegistros()).slice(0, limite);
}
