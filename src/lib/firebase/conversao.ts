import type { Criacao } from "@/types/criacao";
import type { RegistroLab } from "@/types/laboratorio";

/**
 * Formato do documento na coleção `criacoes`. O id do documento é o slug;
 * as datas são Timestamp do Firestore (aqui, qualquer objeto com toDate()).
 * Serve tanto ao SDK completo (painel) quanto ao Lite (servidor).
 */
type ComData = { toDate(): Date };

export type CriacaoDoc = Omit<Criacao, "id" | "demo" | "createdAt" | "updatedAt"> & {
  createdAt: ComData | null;
  updatedAt: ComData | null;
};

export const COLECAO_CRIACOES = "criacoes";

export function docParaCriacao(id: string, dados: CriacaoDoc): Criacao {
  return {
    ...dados,
    id,
    images: dados.images ?? [],
    // Um serverTimestamp ainda não confirmado chega como null.
    createdAt: dados.createdAt?.toDate().toISOString() ?? new Date(0).toISOString(),
    updatedAt: dados.updatedAt?.toDate().toISOString() ?? new Date(0).toISOString(),
    demo: false,
  };
}

export const COLECAO_LABORATORIO = "laboratorio";

export type RegistroLabDoc = Omit<RegistroLab, "id" | "createdAt" | "updatedAt"> & {
  createdAt: ComData | null;
  updatedAt: ComData | null;
};

export function docParaRegistro(id: string, dados: RegistroLabDoc): RegistroLab {
  return {
    ...dados,
    id,
    images: dados.images ?? [],
    createdAt: dados.createdAt?.toDate().toISOString() ?? new Date(0).toISOString(),
    updatedAt: dados.updatedAt?.toDate().toISOString() ?? new Date(0).toISOString(),
  };
}
