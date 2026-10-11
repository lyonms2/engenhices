"use client";

import type { User } from "firebase/auth";
import Link from "next/link";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import {
  codigoDoErro,
  entrarComGoogle,
  listarEncomendas,
  listarTodasAsCriacoes,
  observarUsuario,
  sair,
} from "@/lib/firebase/painel";
import { CATEGORIAS, type Criacao } from "@/types/criacao";
import { FormCriacao } from "./FormCriacao";
import { ListaEncomendas } from "./ListaEncomendas";

type Estado =
  | { tipo: "carregando" }
  | { tipo: "deslogado" }
  | { tipo: "sem-permissao"; usuario: User }
  | { tipo: "erro"; usuario: User }
  | { tipo: "pronto"; usuario: User; criacoes: Criacao[] };

/** Edição em andamento: null = lista; "nova" = formulário vazio. */
type Edicao = null | "nova" | Criacao;

const ERROS_DE_LOGIN: Record<string, string> = {
  "auth/operation-not-allowed":
    "O login com Google não está ativado (Firebase → Authentication → Sign-in method).",
  "auth/unauthorized-domain":
    "Este domínio não está autorizado (Firebase → Authentication → Settings → Authorized domains).",
  "auth/popup-blocked": "O navegador bloqueou a janela de login. Permita pop-ups para este site.",
  "auth/network-request-failed": "Sem conexão com o Firebase. Verifique a internet.",
};

const botaoPrimario =
  "inline-flex min-h-11 items-center justify-center bg-laranja px-5 text-sm font-bold text-grafite hover:bg-[#ff7f22]";
const botaoSecundario =
  "inline-flex min-h-11 items-center justify-center border border-grafite/25 px-5 text-sm font-bold hover:border-grafite";

export function PainelAdmin() {
  if (!isFirebaseConfigured()) {
    return (
      <Aviso titulo="Firebase não configurado">
        Defina as variáveis NEXT_PUBLIC_FIREBASE_* (veja o .env.example) para usar o painel.
      </Aviso>
    );
  }
  return <Painel />;
}

function Painel() {
  const [estado, setEstado] = useState<Estado>({ tipo: "carregando" });
  const [edicao, setEdicao] = useState<Edicao>(null);
  const [erroLogin, setErroLogin] = useState<string | null>(null);
  const [aba, setAba] = useState<"criacoes" | "encomendas">("criacoes");
  const [novas, setNovas] = useState(0);

  const carregar = useCallback(async (usuario: User) => {
    try {
      const criacoes = await listarTodasAsCriacoes();
      setEstado({ tipo: "pronto", usuario, criacoes });
      // Contagem para o selo da aba; se as regras ainda não liberam, fica zero.
      listarEncomendas()
        .then((lista) => setNovas(lista.filter((item) => item.status === "nova").length))
        .catch(() => setNovas(0));
    } catch (erro) {
      setEstado(
        codigoDoErro(erro) === "permission-denied"
          ? { tipo: "sem-permissao", usuario }
          : { tipo: "erro", usuario },
      );
    }
  }, []);

  useEffect(
    () =>
      observarUsuario((usuario) => {
        setEdicao(null);
        if (usuario) void carregar(usuario);
        else setEstado({ tipo: "deslogado" });
      }),
    [carregar],
  );

  async function entrar() {
    setErroLogin(null);
    try {
      await entrarComGoogle();
    } catch (erro) {
      const codigo = codigoDoErro(erro);
      if (codigo === "auth/popup-closed-by-user" || codigo === "auth/cancelled-popup-request") return;
      setErroLogin(
        ERROS_DE_LOGIN[codigo ?? ""] ?? `Não foi possível entrar (${codigo ?? "erro desconhecido"}).`,
      );
    }
  }

  if (estado.tipo === "carregando") {
    return <p className="text-cinza">Carregando…</p>;
  }

  if (estado.tipo === "deslogado") {
    return (
      <div className="max-w-md">
        <p className="text-cinza">Entre com a conta Google de administrador para gerenciar as criações.</p>
        <button type="button" onClick={entrar} className={`${botaoPrimario} mt-6`}>
          Entrar com Google
        </button>
        {erroLogin && (
          <p role="alert" className="mt-4 text-sm text-red-800">
            {erroLogin}
          </p>
        )}
      </div>
    );
  }

  const barra = (
    <div className="mb-10 flex flex-wrap items-center justify-between gap-4 border-b border-grafite/10 pb-6">
      <p className="text-sm text-cinza">
        Conectado como <strong className="text-grafite">{estado.usuario.email}</strong>
      </p>
      <button type="button" onClick={() => void sair()} className="text-sm font-bold underline-offset-4 hover:underline">
        Sair
      </button>
    </div>
  );

  if (estado.tipo === "sem-permissao") {
    return (
      <>
        {barra}
        <Aviso titulo="Esta conta não é administradora">
          <p>
            As regras do Firestore só liberam o painel para o UID do administrador. Se esta é a sua
            conta, coloque o UID abaixo no lugar de <code className="font-mono">UID_DO_ADMIN</code> em
            firestore.rules e publique as regras.
          </p>
          <p className="mt-4 font-mono text-sm break-all select-all bg-white px-3 py-2 border border-grafite/15">
            {estado.usuario.uid}
          </p>
        </Aviso>
      </>
    );
  }

  if (estado.tipo === "erro") {
    return (
      <>
        {barra}
        <Aviso titulo="Não foi possível carregar as criações">
          Verifique a conexão e recarregue a página.
        </Aviso>
      </>
    );
  }

  if (edicao) {
    return (
      <>
        {barra}
        <div className="max-w-2xl">
          <FormCriacao
            criacao={edicao === "nova" ? undefined : edicao}
            onCancelar={() => setEdicao(null)}
            onSalvo={() => {
              setEdicao(null);
              void carregar(estado.usuario);
            }}
          />
        </div>
      </>
    );
  }

  const abas = (
    <div role="tablist" aria-label="Seções do painel" className="mb-8 flex gap-1 border-b border-grafite/10">
      {(
        [
          ["criacoes", "Criações", 0],
          ["encomendas", "Encomendas", novas],
        ] as const
      ).map(([valor, nome, contagem]) => (
        <button
          key={valor}
          type="button"
          role="tab"
          aria-selected={aba === valor}
          onClick={() => setAba(valor)}
          className={`-mb-px flex min-h-11 items-center gap-2 border-b-2 px-4 text-sm font-bold ${
            aba === valor ? "border-laranja text-grafite" : "border-transparent text-cinza hover:text-grafite"
          }`}
        >
          {nome}
          {contagem > 0 && (
            <span className="bg-laranja px-1.5 font-mono text-xs text-grafite">
              {contagem}
              <span className="sr-only"> {contagem === 1 ? "nova" : "novas"}</span>
            </span>
          )}
        </button>
      ))}
    </div>
  );

  if (aba === "encomendas") {
    return (
      <>
        {barra}
        {abas}
        <ListaEncomendas onContagem={setNovas} />
      </>
    );
  }

  return (
    <>
      {barra}
      {abas}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold">Criações</h2>
          <p className="mt-1 text-sm text-cinza">
            Alterações aparecem no site em até alguns minutos.
          </p>
        </div>
        <button type="button" onClick={() => setEdicao("nova")} className={botaoPrimario}>
          Nova criação
        </button>
      </div>

      {estado.criacoes.length === 0 ? (
        <p className="mt-10 border border-dashed border-grafite/20 px-6 py-10 text-center text-cinza">
          Nenhuma criação cadastrada ainda.
        </p>
      ) : (
        <ul className="mt-8 divide-y divide-grafite/10 border-y border-grafite/10">
          {estado.criacoes.map((criacao) => (
            <li key={criacao.id} className="flex flex-wrap items-center justify-between gap-4 py-4">
              <div>
                <p className="font-bold">{criacao.title}</p>
                <p className="mt-1 font-mono text-xs text-cinza">
                  {CATEGORIAS[criacao.category]} · {criacao.status}
                  {criacao.featured && " · destaque"}
                </p>
              </div>
              <div className="flex gap-2">
                {criacao.status !== "rascunho" && (
                  <Link href={`/criacoes/${criacao.slug}`} className={botaoSecundario}>
                    Ver
                  </Link>
                )}
                <button type="button" onClick={() => setEdicao(criacao)} className={botaoSecundario}>
                  Editar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function Aviso({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <div className="max-w-2xl border-l-2 border-laranja bg-grafite/5 px-5 py-5">
      <h2 className="font-extrabold">{titulo}</h2>
      <div className="mt-2 text-sm leading-relaxed text-cinza">{children}</div>
    </div>
  );
}
