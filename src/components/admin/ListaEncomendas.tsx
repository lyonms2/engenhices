"use client";

import Image from "next/image";
import { useEffect, useId, useState, type ReactNode } from "react";
import {
  analisarContato,
  linkEmail,
  linkWhatsApp,
  mensagemDeResposta,
} from "@/lib/encomendas/contato";
import {
  PERIODOS,
  PERIODO_PADRAO,
  POR_PAGINA,
  correspondeABusca,
  dentroDoPeriodo,
  type Periodo,
} from "@/lib/encomendas/filtros";
import { codigoParaExibir } from "@/lib/encomendas/validacao";
import {
  apagarEncomenda,
  codigoDoErro,
  listarEncomendas,
  mudarStatusEncomenda,
} from "@/lib/firebase/painel";
import { cn } from "@/lib/utils";
import { ConfirmarAcao } from "./ConfirmarAcao";
import { STATUS_ENCOMENDA, type Encomenda, type StatusEncomenda } from "@/types/encomenda";

const dataHora = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" });

const corDoStatus: Record<StatusEncomenda, string> = {
  nova: "bg-laranja text-grafite",
  "em-analise": "bg-grafite text-branco",
  "orcamento-enviado": "bg-grafite/10 text-grafite",
  concluida: "bg-grafite/10 text-cinza",
  recusada: "bg-grafite/10 text-cinza",
};

type Estado =
  | { tipo: "carregando" }
  | { tipo: "erro"; mensagem: string }
  | { tipo: "pronto"; encomendas: Encomenda[] };

/** Concluídas e recusadas saem da frente; o resto ainda pede atenção. */
const ENCERRADAS: StatusEncomenda[] = ["concluida", "recusada"];
type Filtro = "abertas" | "encerradas" | "todas";
/** Segundo nível do filtro: todas as situações do grupo, ou uma só. */
type Subfiltro = "todas" | StatusEncomenda;

const SUBFILTROS: Partial<Record<Filtro, readonly (readonly [StatusEncomenda, string])[]>> = {
  abertas: [
    ["nova", "Novas"],
    ["em-analise", "Em análise"],
    ["orcamento-enviado", "Orçamento enviado"],
  ],
  encerradas: [
    ["concluida", "Concluídos"],
    ["recusada", "Recusados"],
  ],
};

const VAZIO_POR_SITUACAO: Record<StatusEncomenda, string> = {
  nova: "Nenhum pedido novo.",
  "em-analise": "Nenhum pedido em análise.",
  "orcamento-enviado": "Nenhum pedido com orçamento enviado.",
  concluida: "Nenhum pedido concluído.",
  recusada: "Nenhum pedido recusado.",
};

function passaNoFiltro(encomenda: Encomenda, filtro: Filtro): boolean {
  if (filtro === "todas") return true;
  const encerrada = ENCERRADAS.includes(encomenda.status);
  return filtro === "encerradas" ? encerrada : !encerrada;
}

export function ListaEncomendas({ onContagem }: { onContagem?: (novas: number) => void }) {
  const [estado, setEstado] = useState<Estado>({ tipo: "carregando" });
  const [aberta, setAberta] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<Filtro>("abertas");
  const [subfiltro, setSubfiltro] = useState<Subfiltro>("todas");
  const [busca, setBusca] = useState("");
  const [periodo, setPeriodo] = useState<Periodo>(PERIODO_PADRAO);
  const [intervalo, setIntervalo] = useState({ de: "", ate: "" });
  const [pagina, setPagina] = useState(1);
  // Momento de referência para "últimos N dias", fixado ao abrir a lista.
  const [agora] = useState(() => Date.now());
  const idBusca = useId();
  const idPeriodo = useId();

  function irParaPagina(numero: number) {
    setPagina(numero);
    setAberta(null);
  }

  /** Qualquer mudança de filtro volta para a primeira página. */
  function filtrar(mudanca: () => void) {
    mudanca();
    setPagina(1);
    setAberta(null);
  }

  useEffect(() => {
    let ativo = true;
    listarEncomendas()
      .then((encomendas) => {
        if (!ativo) return;
        setEstado({ tipo: "pronto", encomendas });
        onContagem?.(encomendas.filter((encomenda) => encomenda.status === "nova").length);
      })
      .catch((erro: unknown) => {
        if (!ativo) return;
        setEstado({
          tipo: "erro",
          mensagem:
            codigoDoErro(erro) === "permission-denied"
              ? "As regras do Firestore ainda não liberam a leitura de encomendas. Publique o firestore.rules atualizado."
              : "Não foi possível carregar as encomendas.",
        });
      });
    return () => {
      ativo = false;
    };
  }, [onContagem]);

  async function mudarStatus(encomenda: Encomenda, status: StatusEncomenda) {
    if (estado.tipo !== "pronto") return;
    const anteriores = estado.encomendas;
    const atualizadas = anteriores.map((item) => (item.id === encomenda.id ? { ...item, status } : item));
    setEstado({ tipo: "pronto", encomendas: atualizadas });
    onContagem?.(atualizadas.filter((item) => item.status === "nova").length);
    try {
      await mudarStatusEncomenda(encomenda.id, status);
    } catch {
      setEstado({ tipo: "pronto", encomendas: anteriores });
      window.alert("Não foi possível mudar a situação. Tente de novo.");
    }
  }

  async function apagar(encomenda: Encomenda) {
    if (estado.tipo !== "pronto") return;
    await apagarEncomenda(encomenda);
    const restantes = estado.encomendas.filter((item) => item.id !== encomenda.id);
    setEstado({ tipo: "pronto", encomendas: restantes });
    onContagem?.(restantes.filter((item) => item.status === "nova").length);
    setAberta(null);
  }

  if (estado.tipo === "carregando") return <p className="text-cinza">Carregando encomendas…</p>;
  if (estado.tipo === "erro") return <p className="text-sm text-red-800">{estado.mensagem}</p>;

  if (estado.encomendas.length === 0) {
    return (
      <p className="border border-dashed border-grafite/20 px-6 py-10 text-center text-cinza">
        Nenhum pedido de orçamento ainda.
      </p>
    );
  }

  // Busca e período valem para tudo, inclusive para as contagens dos filtros.
  const encontradas = estado.encomendas.filter((encomenda) => correspondeABusca(encomenda, busca));
  const base = encontradas.filter((encomenda) =>
    dentroDoPeriodo(encomenda.createdAt, periodo, agora, intervalo),
  );
  // Pedidos abertos escondidos só pelo período: avisa para não passarem despercebidos.
  const abertasForaDoPeriodo =
    encontradas.filter((encomenda) => passaNoFiltro(encomenda, "abertas")).length -
    base.filter((encomenda) => passaNoFiltro(encomenda, "abertas")).length;

  const doGrupo = base.filter((encomenda) => passaNoFiltro(encomenda, filtro));
  const visiveis = doGrupo.filter(
    (encomenda) => subfiltro === "todas" || encomenda.status === subfiltro,
  );
  const contagem = (opcao: Filtro) =>
    base.filter((encomenda) => passaNoFiltro(encomenda, opcao)).length;

  const totalDePaginas = Math.max(1, Math.ceil(visiveis.length / POR_PAGINA));
  const paginaAtual = Math.min(pagina, totalDePaginas);
  const daPagina = visiveis.slice((paginaAtual - 1) * POR_PAGINA, paginaAtual * POR_PAGINA);
  const contagemDoGrupo = (opcao: Subfiltro) =>
    opcao === "todas"
      ? doGrupo.length
      : doGrupo.filter((encomenda) => encomenda.status === opcao).length;
  const subfiltros = SUBFILTROS[filtro];

  return (
    <>
      <div className="mb-5 grid gap-3 sm:grid-cols-[1fr_auto]">
        <div>
          <label htmlFor={idBusca} className="sr-only">
            Buscar pedido
          </label>
          <input
            id={idBusca}
            type="search"
            value={busca}
            onChange={(e) => filtrar(() => setBusca(e.target.value))}
            placeholder="Buscar por código, nome, contato ou texto"
            className="block min-h-11 w-full border border-grafite/20 bg-white px-3 text-base focus:border-grafite"
          />
        </div>
        <div>
          <label htmlFor={idPeriodo} className="sr-only">
            Período
          </label>
          <select
            id={idPeriodo}
            value={periodo}
            onChange={(e) => filtrar(() => setPeriodo(e.target.value as Periodo))}
            className="block min-h-11 w-full border border-grafite/20 bg-white px-3 text-base sm:w-auto"
          >
            {PERIODOS.map(([valor, nome]) => (
              <option key={valor} value={valor}>
                {nome}
              </option>
            ))}
          </select>
        </div>
        {periodo === "personalizado" && (
          <div className="flex flex-wrap items-end gap-3 sm:col-span-2">
            <label className="text-sm">
              <span className="font-bold">De</span>
              <input
                type="date"
                value={intervalo.de}
                max={intervalo.ate || undefined}
                onChange={(e) => filtrar(() => setIntervalo((atual) => ({ ...atual, de: e.target.value })))}
                className="mt-1 block min-h-11 border border-grafite/20 bg-white px-3 text-base"
              />
            </label>
            <label className="text-sm">
              <span className="font-bold">Até</span>
              <input
                type="date"
                value={intervalo.ate}
                min={intervalo.de || undefined}
                onChange={(e) => filtrar(() => setIntervalo((atual) => ({ ...atual, ate: e.target.value })))}
                className="mt-1 block min-h-11 border border-grafite/20 bg-white px-3 text-base"
              />
            </label>
          </div>
        )}
      </div>

      {abertasForaDoPeriodo > 0 && (
        <p className="mb-5 border-l-2 border-laranja bg-white px-4 py-3 text-sm">
          {abertasForaDoPeriodo === 1
            ? "1 pedido aberto é mais antigo que o período escolhido."
            : `${abertasForaDoPeriodo} pedidos abertos são mais antigos que o período escolhido.`}{" "}
          <button
            type="button"
            onClick={() => filtrar(() => setPeriodo("tudo"))}
            className="font-bold underline underline-offset-4"
          >
            Ver todo o período
          </button>
        </p>
      )}

      <div role="group" aria-label="Filtrar pedidos" className="mb-5 flex flex-wrap gap-2">
        {(
          [
            ["abertas", "Abertos"],
            ["encerradas", "Encerrados"],
            ["todas", "Todos"],
          ] as const
        ).map(([valor, nome]) => (
          <button
            key={valor}
            type="button"
            aria-pressed={filtro === valor}
            onClick={() =>
              filtrar(() => {
                setFiltro(valor);
                setSubfiltro("todas");
              })
            }
            className={cn(
              "inline-flex min-h-10 items-center gap-2 border px-4 text-sm font-bold",
              filtro === valor
                ? "border-grafite bg-grafite text-branco"
                : "border-grafite/20 bg-white hover:border-grafite",
            )}
          >
            {nome}
            <span className="font-mono text-xs font-medium opacity-70">{contagem(valor)}</span>
          </button>
        ))}
      </div>

      {subfiltros && (
        <div
          role="group"
          aria-label={filtro === "abertas" ? "Filtrar pedidos abertos" : "Filtrar pedidos encerrados"}
          className="-mt-2 mb-5 flex flex-wrap items-center gap-2 border-l-2 border-grafite/15 pl-3"
        >
          {[["todas", "Todos"] as const, ...subfiltros].map(([valor, nome]) => (
            <button
              key={valor}
              type="button"
              aria-pressed={subfiltro === valor}
              onClick={() => filtrar(() => setSubfiltro(valor))}
              className={cn(
                "inline-flex min-h-9 items-center gap-2 border px-3 text-sm font-bold",
                subfiltro === valor
                  ? "border-grafite text-grafite"
                  : "border-transparent text-cinza hover:text-grafite",
              )}
            >
              {nome}
              <span className="font-mono text-xs font-medium opacity-70">
                {contagemDoGrupo(valor)}
              </span>
            </button>
          ))}
        </div>
      )}

      {visiveis.length === 0 && (
        <p className="border border-dashed border-grafite/20 px-6 py-10 text-center text-cinza">
          {busca.trim()
            ? "Nenhum pedido encontrado com essa busca neste período."
            : subfiltro !== "todas"
              ? VAZIO_POR_SITUACAO[subfiltro]
              : filtro === "abertas"
                ? "Nenhum pedido em aberto neste período."
                : "Nenhum pedido neste período."}
        </p>
      )}

      <ul className="space-y-3">
        {daPagina.map((encomenda) => {
          const expandida = aberta === encomenda.id;
          return (
            <li key={encomenda.id} className="border border-grafite/10 bg-white">
              <button
                type="button"
                aria-expanded={expandida}
                onClick={() => setAberta(expandida ? null : encomenda.id)}
                className="flex w-full flex-wrap items-center gap-x-4 gap-y-2 px-4 py-4 text-left hover:bg-grafite/[0.03]"
              >
                <span
                  className={cn(
                    "px-2 py-1 font-mono text-[0.68rem] tracking-wider uppercase",
                    corDoStatus[encomenda.status],
                  )}
                >
                  {STATUS_ENCOMENDA[encomenda.status]}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-bold">
                    <span className="mr-2 font-mono text-sm font-medium text-cinza">
                      #{codigoParaExibir(encomenda.id)}
                    </span>
                    {encomenda.nome}
                  </span>
                  <span className="block truncate text-sm text-cinza">{encomenda.descricao}</span>
                </span>
                <span className="font-mono text-xs text-cinza">
                  {dataHora.format(new Date(encomenda.createdAt))}
                </span>
              </button>

              {expandida && (
                <div className="space-y-5 border-t border-grafite/10 px-4 py-5 text-sm">
                  <Detalhe rotulo="Contato">
                    <span className="select-all font-bold">{encomenda.contato}</span>
                    <BotaoResponder encomenda={encomenda} />
                  </Detalhe>
                  <Detalhe rotulo="O que precisa">{encomenda.descricao}</Detalhe>
                  <Detalhe rotulo="Finalidade">{encomenda.finalidade}</Detalhe>
                  {encomenda.medidas && <Detalhe rotulo="Medidas">{encomenda.medidas}</Detalhe>}
                  {encomenda.observacoes && <Detalhe rotulo="Observações">{encomenda.observacoes}</Detalhe>}

                  {encomenda.fotos.length > 0 && (
                    <Detalhe rotulo="Fotos de referência">
                      <span className="mt-1 flex flex-wrap gap-3">
                        {encomenda.fotos.map((foto, indice) => (
                          <a key={foto.src} href={foto.src} target="_blank" rel="noopener noreferrer">
                            <Image
                              src={foto.src}
                              alt={`Foto de referência ${indice + 1}`}
                              width={foto.width}
                              height={foto.height}
                              sizes="128px"
                              className="size-32 border border-grafite/15 object-cover"
                            />
                          </a>
                        ))}
                      </span>
                    </Detalhe>
                  )}

                  <label className="block max-w-xs">
                    <span className="font-mono text-xs tracking-wider text-cinza uppercase">Situação</span>
                    <select
                      value={encomenda.status}
                      onChange={(e) => void mudarStatus(encomenda, e.target.value as StatusEncomenda)}
                      className="mt-1 block w-full border border-grafite/20 bg-white px-3 py-2 text-base"
                    >
                      {Object.entries(STATUS_ENCOMENDA).map(([valor, nome]) => (
                        <option key={valor} value={valor}>
                          {nome}
                        </option>
                      ))}
                    </select>
                  </label>

                  <div className="border-t border-grafite/10 pt-4">
                    <ConfirmarAcao
                      rotulo="Apagar pedido"
                      pergunta={`Apagar o pedido #${codigoParaExibir(encomenda.id)} de ${encomenda.nome}?`}
                      onConfirmar={() => apagar(encomenda)}
                    />
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {visiveis.length > POR_PAGINA && (
        <nav aria-label="Páginas de pedidos" className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-cinza">
            {(paginaAtual - 1) * POR_PAGINA + 1}–{Math.min(paginaAtual * POR_PAGINA, visiveis.length)} de{" "}
            {visiveis.length} pedidos
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => irParaPagina(paginaAtual - 1)}
              disabled={paginaAtual === 1}
              className="inline-flex min-h-10 items-center border border-grafite/20 bg-white px-4 text-sm font-bold hover:border-grafite disabled:opacity-40"
            >
              ← Anterior
            </button>
            <span className="px-2 font-mono text-sm" aria-live="polite">
              {paginaAtual} / {totalDePaginas}
            </span>
            <button
              type="button"
              onClick={() => irParaPagina(paginaAtual + 1)}
              disabled={paginaAtual === totalDePaginas}
              className="inline-flex min-h-10 items-center border border-grafite/20 bg-white px-4 text-sm font-bold hover:border-grafite disabled:opacity-40"
            >
              Próxima →
            </button>
          </div>
        </nav>
      )}
    </>
  );
}

/** Abre o WhatsApp ou o e-mail do cliente com a mensagem já começada. */
function BotaoResponder({ encomenda }: { encomenda: Encomenda }) {
  const contato = analisarContato(encomenda.contato);
  if (contato.tipo === "desconhecido") return null;

  const codigo = codigoParaExibir(encomenda.id);
  const mensagem = mensagemDeResposta(encomenda.nome, codigo);
  const whatsapp = contato.tipo === "whatsapp";

  return (
    <a
      href={whatsapp ? linkWhatsApp(contato.numero, mensagem) : linkEmail(contato.email, codigo, mensagem)}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-3 flex min-h-11 w-fit items-center gap-2 bg-laranja px-5 text-sm font-bold text-grafite hover:bg-[#ff7f22]"
    >
      {whatsapp ? "Responder no WhatsApp" : "Responder por e-mail"}
      <span aria-hidden="true">↗</span>
      <span className="sr-only"> (abre em nova aba)</span>
    </a>
  );
}

function Detalhe({ rotulo, children }: { rotulo: string; children: ReactNode }) {
  return (
    <div>
      <p className="font-mono text-xs tracking-wider text-cinza uppercase">{rotulo}</p>
      <div className="mt-1 leading-relaxed whitespace-pre-line">{children}</div>
    </div>
  );
}
