import {
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore/lite";
import { gerarCodigoDoPedido } from "@/lib/encomendas/codigo";
import type { Criacao } from "@/types/criacao";
import type { RegistroLab } from "@/types/laboratorio";
import type { Arquivo3d, CamposEncomenda, FotoReferencia } from "@/types/encomenda";
import { getFirebaseApp } from "./client";
import {
  COLECAO_CRIACOES,
  COLECAO_LABORATORIO,
  docParaCriacao,
  docParaRegistro,
  type CriacaoDoc,
  type RegistroLabDoc,
} from "./conversao";

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

/**
 * Grava uma encomenda já validada. As regras só aceitam a criação com a
 * chave do servidor (ENCOMENDAS_CHAVE), igual à guardada em privado/servidor,
 * documento que ninguém de fora lê; gravar direto no banco é recusado.
 */
export async function gravarEncomenda(
  dados: CamposEncomenda & { fotos: FotoReferencia[]; arquivo: Arquivo3d | null },
  chave: string,
): Promise<string> {
  // O código do pedido é o id do documento. Se já existir (raríssimo), a
  // gravação vira uma alteração, que as regras recusam; tenta outro código.
  for (let tentativa = 0; tentativa < 3; tentativa++) {
    const codigo = gerarCodigoDoPedido();
    try {
      await setDoc(doc(db(), "encomendas", codigo), {
        ...dados,
        status: "nova",
        chave,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return codigo;
    } catch (erro) {
      if ((erro as { code?: string }).code !== "permission-denied" || tentativa === 2) throw erro;
    }
  }
  throw new Error("Não foi possível gerar um código de pedido.");
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

/** Registros publicados do Laboratório, mais recentes primeiro. */
export async function lerRegistrosPublicos(): Promise<RegistroLab[]> {
  try {
    const resultado = await getDocs(
      query(collection(db(), COLECAO_LABORATORIO), where("status", "==", "publicado")),
    );
    return resultado.docs
      .map((documento) => docParaRegistro(documento.id, documento.data() as RegistroLabDoc))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  } catch (erro) {
    // Regras do Laboratório ainda não publicadas: a página fica vazia, sem quebrar o build.
    if ((erro as { code?: string }).code === "permission-denied") {
      console.warn("[laboratorio] Firestore recusou a leitura pública; publique o firestore.rules.");
      return [];
    }
    throw erro;
  }
}
