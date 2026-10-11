"use client";

import type { User } from "firebase/auth";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import {
  codigoDoErro,
  entrarComGoogle,
  listarEncomendas,
  listarRegistros,
  listarTodasAsCriacoes,
  observarUsuario,
  sair,
} from "@/lib/firebase/painel";
import type { Criacao } from "@/types/criacao";
import type { RegistroLab } from "@/types/laboratorio";
import { FormCriacao } from "./FormCriacao";
import { FormRegistro, type RascunhoDeRegistro } from "./FormRegistro";
import { ListaRegistros } from "./ListaRegistros";
import { ListaCriacoes } from "./ListaCriacoes";
import { LimpezaFotos } from "./LimpezaFotos";
import { ListaEncomendas } from "./ListaEncomendas";

type Estado =
  | { tipo: "carregando" }
  | { tipo: "deslogado" }
  | { tipo: "sem-permissao"; usuario: User }
  | { tipo: "erro"; usuario: User }
  | {
      tipo: "pronto";
      usuario: User;
      criacoes: Criacao[];
      registros: RegistroLab[];
      /** As regras do Laboratório ainda não foram publicadas. */
      registrosIndisponiveis: boolean;
    };

/** Edição em andamento; null = listas. Sem `criacao`/`registro` = item novo. */
type Edicao =
  | null
  | { tipo: "criacao"; criacao?: Criacao }
  | { tipo: "registro"; registro?: RegistroLab; rascunho?: RascunhoDeRegistro };

type Aba = "criacoes" | "laboratorio" | "encomendas" | "fotos";

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
  const [aba, setAba] = useState<Aba>("criacoes");
  const [novas, setNovas] = useState(0);

  const carregar = useCallback(async (usuario: User) => {
    try {
      const criacoes = await listarTodasAsCriacoes();
      // O Laboratório não pode derrubar o painel se as regras dele ainda não
      // foram publicadas: a aba avisa e o resto funciona.
      const registros = await listarRegistros().catch(() => null);
      setEstado({
        tipo: "pronto",
        usuario,
        criacoes,
        registros: registros ?? [],
        registrosIndisponiveis: registros === null,
      });
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

  const recarregar = () => {
    setEdicao(null);
    void carregar(estado.usuario);
  };

  function abrirNovoRegistro(criacao: Criacao, moverVideosAntigos: boolean) {
    setAba("laboratorio");
    setEdicao({
      tipo: "registro",
      rascunho: moverVideosAntigos
        ? {
            title: `${criacao.title} em uso`,
            type: "resultado",
            creationSlug: criacao.slug,
            youtubeUrl: criacao.youtubeUrl,
            tiktokUrl: criacao.tiktokUrl,
            migrarVideosDe: criacao.slug,
          }
        : { creationSlug: criacao.slug },
    });
  }

  const editor =
    edicao?.tipo === "criacao" ? (
      <div className="max-w-2xl">
        <FormCriacao
          criacao={edicao.criacao}
          registros={estado.registros.filter((registro) => registro.creationSlug === edicao.criacao?.slug)}
          onNovoRegistro={abrirNovoRegistro}
          onEditarRegistro={(registro) => {
            setAba("laboratorio");
            setEdicao({ tipo: "registro", registro });
          }}
          onCancelar={() => setEdicao(null)}
          onApagado={recarregar}
          onSalvo={recarregar}
        />
      </div>
    ) : edicao?.tipo === "registro" ? (
      <div className="max-w-2xl">
        <FormRegistro
          registro={edicao.registro}
          rascunho={edicao.rascunho}
          criacoes={estado.criacoes}
          onCancelar={() => setEdicao(null)}
          onApagado={recarregar}
          onSalvo={recarregar}
        />
      </div>
    ) : null;

  const abas = (
    <div role="tablist" aria-label="Seções do painel" className="mb-8 flex flex-wrap gap-1 border-b border-grafite/10">
      {(
        [
          ["criacoes", "Criações", 0],
          ["laboratorio", "Laboratório", 0],
          ["encomendas", "Encomendas", novas],
          ["fotos", "Fotos", 0],
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

  return (
    <>
      {barra}
      {editor}
      {/* Escondido, não desmontado: busca e filtros sobrevivem à edição. */}
      <div hidden={Boolean(edicao)}>
        {abas}

        {aba === "criacoes" && (
          <>
            <Cabecalho
              titulo="Criações"
              descricao="O site é atualizado assim que você salva."
              acao="Nova criação"
              onAcao={() => setEdicao({ tipo: "criacao" })}
            />
            <ListaCriacoes criacoes={estado.criacoes} onEditar={(criacao) => setEdicao({ tipo: "criacao", criacao })} />
          </>
        )}

        {aba === "laboratorio" &&
          (estado.registrosIndisponiveis ? (
            <Aviso titulo="O Laboratório ainda não está liberado">
              Publique o firestore.rules atualizado (Firestore → Regras) e recarregue a página.
            </Aviso>
          ) : (
            <>
              <Cabecalho
                titulo="Laboratório"
                descricao="Experimentos, protótipos, testes, erros, melhorias, resultados, bastidores e projetos."
                acao="Novo registro"
                onAcao={() => setEdicao({ tipo: "registro" })}
              />
              <ListaRegistros
                registros={estado.registros}
                criacoes={estado.criacoes}
                onEditar={(registro) => setEdicao({ tipo: "registro", registro })}
              />
            </>
          ))}

        {aba === "encomendas" && <ListaEncomendas onContagem={setNovas} />}
        {aba === "fotos" && <LimpezaFotos />}
      </div>
    </>
  );
}

function Cabecalho({
  titulo,
  descricao,
  acao,
  onAcao,
}: {
  titulo: string;
  descricao: string;
  acao: string;
  onAcao: () => void;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h2 className="text-2xl font-extrabold">{titulo}</h2>
        <p className="mt-1 text-sm text-cinza">{descricao}</p>
      </div>
      <button type="button" onClick={onAcao} className={botaoPrimario}>
        {acao}
      </button>
    </div>
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
