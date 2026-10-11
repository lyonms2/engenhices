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
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import type { Criacao } from "@/types/criacao";
import type { Encomenda, StatusEncomenda } from "@/types/encomenda";
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

/** Token de ID do usuário logado, para o servidor confirmar quem é o administrador. */
export async function obterTokenDeId(): Promise<string> {
  const usuario = getAuth(app()).currentUser;
  if (!usuario) throw new Error("Sessão expirada. Entre de novo.");
  return usuario.getIdToken();
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

type EncomendaDoc = Omit<Encomenda, "id" | "createdAt" | "updatedAt"> & {
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
  chave?: string;
};

/** Pedidos de orçamento, mais recentes primeiro. Só o administrador lê. */
export async function listarEncomendas(): Promise<Encomenda[]> {
  const resultado = await getDocs(collection(getFirestore(app()), "encomendas"));
  return resultado.docs
    .map((documento) => {
      // A chave do servidor fica no documento, mas não interessa ao painel.
      const { chave: _chave, createdAt, updatedAt, ...dados } = documento.data() as EncomendaDoc;
      void _chave;
      return {
        ...dados,
        id: documento.id,
        fotos: dados.fotos ?? [],
        createdAt: createdAt?.toDate().toISOString() ?? new Date(0).toISOString(),
        updatedAt: updatedAt?.toDate().toISOString() ?? new Date(0).toISOString(),
      };
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function mudarStatusEncomenda(id: string, status: StatusEncomenda) {
  await updateDoc(doc(getFirestore(app()), "encomendas", id), {
    status,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Apaga fotos do Cloudinary pelo servidor (que confere o login do admin).
 * Lança erro se o Cloudinary não confirmar, para quem chamou não seguir
 * adiante e deixar fotos abandonadas.
 */
export async function apagarFotos(urls: string[]) {
  if (urls.length === 0) return;
  const resposta = await fetch("/api/fotos/apagar", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${await obterTokenDeId()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ urls }),
  });
  if (!resposta.ok) {
    const { erro } = (await resposta.json().catch(() => ({}))) as { erro?: string };
    throw new Error(erro ?? "Não foi possível apagar as fotos.");
  }
}

/**
 * Apaga um pedido e as fotos de referência. As fotos vão primeiro: se algo
 * falhar no meio, o pedido continua no painel e basta tentar de novo.
 */
export async function apagarEncomenda(encomenda: Pick<Encomenda, "id" | "fotos">) {
  await apagarFotos(encomenda.fotos.map((foto) => foto.src));
  await deleteDoc(doc(getFirestore(app()), "encomendas", encomenda.id));
}

/** Apaga uma criação e as fotos dela, na mesma ordem segura. */
export async function apagarCriacao(criacao: Pick<Criacao, "slug" | "images">) {
  await apagarFotos(criacao.images.map((imagem) => imagem.src));
  await deleteDoc(doc(getFirestore(app()), COLECAO_CRIACOES, criacao.slug));
}

/**
 * Pede ao servidor para descartar o cache das criações, para o site mostrar
 * a alteração na próxima visita. Se falhar, o cache expira sozinho em
 * alguns minutos; por isso o erro é só registrado.
 */
export async function avisarSiteAtualizado() {
  try {
    await fetch("/api/revalidar", {
      method: "POST",
      headers: { Authorization: `Bearer ${await obterTokenDeId()}` },
    });
  } catch (erro) {
    console.warn("[admin] Não foi possível atualizar o cache do site:", erro);
  }
}

export type FotoNaoUsada = { src: string; publicId: string; bytes: number; criadaEm: string };

export type ResultadoDaVerificacao = {
  total: number;
  recentes: number;
  naoUsadas: FotoNaoUsada[];
};

/**
 * Procura fotos do Cloudinary que nenhuma criação ou pedido usa. Se a
 * leitura de criações ou pedidos falhar, a função falha também: uma lista
 * "em uso" incompleta faria fotos em uso parecerem sobras.
 */
export async function buscarFotosNaoUsadas(): Promise<ResultadoDaVerificacao> {
  const [criacoes, encomendas] = await Promise.all([listarTodasAsCriacoes(), listarEncomendas()]);
  const usadas = [
    ...criacoes.flatMap((criacao) => criacao.images.map((imagem) => imagem.src)),
    ...encomendas.flatMap((encomenda) => encomenda.fotos.map((foto) => foto.src)),
  ];

  const resposta = await fetch("/api/fotos/nao-usadas", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${await obterTokenDeId()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ usadas }),
  });
  const dados = (await resposta.json().catch(() => ({}))) as ResultadoDaVerificacao & { erro?: string };
  if (!resposta.ok) throw new Error(dados.erro ?? "Não foi possível verificar as fotos.");
  return dados;
}

/** Apaga muitas fotos, em lotes do tamanho aceito pelo servidor. */
export async function apagarFotosEmLotes(urls: string[]) {
  for (let inicio = 0; inicio < urls.length; inicio += 50) {
    await apagarFotos(urls.slice(inicio, inicio + 50));
  }
}
