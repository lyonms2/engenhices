"use client";

import {
  GoogleAuthProvider,
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import {
  Timestamp,
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import type { Criacao } from "@/types/criacao";
import { getFirebaseApp } from "./client";
import { COLECAO_CRIACOES, docParaCriacao, type CriacaoDoc } from "./conversao";

/**
 * Operações do painel /admin, executadas no navegador com o login do dono.
 * Quem garante a segurança são as regras em firestore.rules: qualquer
 * gravação de uma conta que não seja a do administrador é recusada pelo
 * próprio Firestore.
 */

function app() {
  const instancia = getFirebaseApp();
  if (!instancia) throw new Error("Firebase não configurado.");
  return instancia;
}

export function observarUsuario(callback: (usuario: User | null) => void) {
  return onAuthStateChanged(getAuth(app()), callback);
}

export async function entrarComGoogle() {
  const provedor = new GoogleAuthProvider();
  provedor.setCustomParameters({ prompt: "select_account" });
  await signInWithPopup(getAuth(app()), provedor);
}

export async function sair() {
  await signOut(getAuth(app()));
}

/** Todas as criações, inclusive rascunhos. Só o administrador consegue ler. */
export async function listarTodasAsCriacoes(): Promise<Criacao[]> {
  const resultado = await getDocs(collection(getFirestore(app()), COLECAO_CRIACOES));
  return resultado.docs
    .map((documento) => docParaCriacao(documento.id, documento.data() as CriacaoDoc))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export type DadosCriacao = Pick<
  Criacao,
  | "title"
  | "slug"
  | "description"
  | "images"
  | "category"
  | "featured"
  | "status"
  | "youtubeUrl"
  | "tiktokUrl"
  | "mercadoLivreUrl"
>;

export class SlugEmUsoError extends Error {}

/**
 * Cria (quando `novo`) ou atualiza uma criação. O slug é o id do documento
 * e não muda depois de criado, para não quebrar links já divulgados.
 */
export async function salvarCriacao(dados: DadosCriacao, opcoes: { novo: boolean; createdAt?: string }) {
  const db = getFirestore(app());
  const referencia = doc(db, COLECAO_CRIACOES, dados.slug);

  if (opcoes.novo && (await getDoc(referencia)).exists()) {
    throw new SlugEmUsoError(`Já existe uma criação com o endereço "${dados.slug}".`);
  }

  await setDoc(referencia, {
    ...dados,
    createdAt:
      opcoes.novo || !opcoes.createdAt
        ? serverTimestamp()
        : Timestamp.fromDate(new Date(opcoes.createdAt)),
    updatedAt: serverTimestamp(),
  });
}

export function codigoDoErro(erro: unknown): string | undefined {
  return (erro as { code?: string } | null)?.code;
}
