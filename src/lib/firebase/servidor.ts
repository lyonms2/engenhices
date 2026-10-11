import {
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  query,
  where,
} from "firebase/firestore/lite";
import type { Criacao } from "@/types/criacao";
import { getFirebaseApp } from "./client";
import { COLECAO_CRIACOES, docParaCriacao, type CriacaoDoc } from "./conversao";

/**
 * Leituras públicas feitas no servidor (Firestore Lite, sem conexão em tempo
 * real). Só pedem o que as regras liberam ao público: criações publicadas ou
 * arquivadas. Quem chama garante que o Firebase está configurado.
 */

const STATUS_PUBLICOS = ["publicado", "arquivado"];

function db() {
  const app = getFirebaseApp();
  if (!app) throw new Error("Firebase não configurado.");
  return getFirestore(app);
}

export async function lerCriacoesPublicas(): Promise<Criacao[]> {
  const consulta = query(
    collection(db(), COLECAO_CRIACOES),
    where("status", "in", STATUS_PUBLICOS),
  );
  let resultado;
  try {
    resultado = await getDocs(consulta);
  } catch (erro) {
    // Regras ainda não publicadas (o banco começa todo fechado): o site
    // segue no ar com o catálogo vazio em vez de derrubar o build.
    if ((erro as { code?: string }).code === "permission-denied") {
      console.warn("[criacoes] Firestore recusou a leitura pública; publique o firestore.rules.");
      return [];
    }
    throw erro;
  }
  return resultado.docs
    .map((documento) => docParaCriacao(documento.id, documento.data() as CriacaoDoc))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function lerCriacaoPublica(slug: string): Promise<Criacao | null> {
  try {
    const documento = await getDoc(doc(db(), COLECAO_CRIACOES, slug));
    return documento.exists()
      ? docParaCriacao(documento.id, documento.data() as CriacaoDoc)
      : null;
  } catch (erro) {
    // Rascunho ou documento inexistente: as regras negam a leitura.
    if ((erro as { code?: string }).code === "permission-denied") return null;
    throw erro;
  }
}
