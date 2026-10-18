"use client";

import Image from "next/image";
import { useEffect, useState, type ReactNode } from "react";
import {
  analisarContato,
  linkEmail,
  linkWhatsApp,
  mensagemDeResposta,
} from "@/lib/encomendas/contato";
import { PERIODO_PADRAO, correspondeABusca } from "@/lib/encomendas/filtros";
import { DIAS_DE_GUARDA, estaVencido, prazoDeGuarda, prazoEmTexto } from "@/lib/encomendas/prazo";
import { codigoParaExibir } from "@/lib/encomendas/validacao";
import {
  apagarEncomenda,
  codigoDoErro,
  listarEncomendas,
  mudarStatusEncomenda,
} from "@/lib/firebase/painel";
import { dentroDoPeriodo, paginar, type Intervalo, type Periodo } from "@/lib/filtros";
import { cn } from "@/lib/utils";
import { BuscaEPeriodo, GrupoDeFiltros, Paginacao } from "./BarraDeFiltros";
import { ConfirmarAcao } from "./ConfirmarAcao";
import { STATUS_ENCOMENDA, type Encomenda, type StatusEncomenda } from "@/types/encomenda";

function tamanhoDoArquivo(bytes: number): string {
  return bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

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
  const [intervalo, setIntervalo] = useState<Intervalo>({ de: "", ate: "" });
  const [pagina, setPagina] = useState(1);
  // Mostra só os pedidos com prazo de guarda vencido (aviso da política de privacidade).
  const [soVencidos, setSoVencidos] = useState(false);
  // Momento de referência para "últimos N dias", fixado ao abrir a lista.
  const [agora] = useState(() => Date.now());

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

  async function apagarVencidos(alvo: Encomenda[]) {
    if (estado.tipo !== "pronto") return;
    let restantes = estado.encomendas;
    try {
      for (const encomenda of alvo) {
        await apagarEncomenda(encomenda);
        restantes = restantes.filter((item) => item.id !== encomenda.id);
      }
    } finally {
      // Mesmo se um falhar no meio, a lista mostra o que já foi apagado.
      setEstado({ tipo: "pronto", encomendas: restantes });
      onContagem?.(restantes.filter((item) => item.status === "nova").length);
      setAberta(null);
    }
    setSoVencidos(false);
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

  // Vencidos contam sobre todos os pedidos: o prazo não depende de busca ou período.
  const vencidos = estado.encomendas.filter((encomenda) => estaVencido(encomenda, agora));

  const doGrupo = base.filter((encomenda) => passaNoFiltro(encomenda, filtro));
  const visiveis = soVencidos
    ? vencidos
    : doGrupo.filter((encomenda) => subfiltro === "todas" || encomenda.status === subfiltro);
  const contagem = (opcao: Filtro) =>
    base.filter((encomenda) => passaNoFiltro(encomenda, opcao)).length;
  const contagemDoGrupo = (opcao: Subfiltro) =>
    opcao === "todas"
      ? doGrupo.length
      : doGrupo.filter((encomenda) => encomenda.status === opcao).length;
  const subfiltros = SUBFILTROS[filtro];

  const paginaAtual = paginar(visiveis, pagina);

  return (
    <>
      {vencidos.length > 0 && (
        <div role="status" className="mb-6 border-l-2 border-red-700 bg-red-50 px-4 py-4 text-sm">
          <p className="font-bold text-red-900">
            {vencidos.length === 1
              ? "1 pedido passou do prazo de guarda"
              : `${vencidos.length} pedidos passaram do prazo de guarda`}{" "}
            da política de privacidade.
          </p>
          <p className="mt-1 text-red-900/80">
            Recusados e orçamentos sem resposta ficam até {prazoEmTexto(DIAS_DE_GUARDA.recusada ?? 0)};
            concluídos, até {prazoEmTexto(DIAS_DE_GUARDA.concluida ?? 0)}. Depois disso, a política
            promete apagar.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => {
                setSoVencidos((valor) => !valor);
                setPagina(1);
                setAberta(null);
              }}
              className="font-bold text-red-900 underline underline-offset-4"
            >
              {soVencidos ? "Voltar à lista completa" : "Ver pedidos vencidos"}
            </button>
            <ConfirmarAcao
              rotulo={vencidos.length === 1 ? "Apagar o pedido vencido" : `Apagar os ${vencidos.length} pedidos vencidos`}
              pergunta={`Apagar ${vencidos.length === 1 ? "o pedido vencido" : `os ${vencidos.length} pedidos vencidos`}, com fotos e arquivos?`}
              onConfirmar={() => apagarVencidos(vencidos)}
            />
          </div>
        </div>
      )}

      {soVencidos ? (
        <p className="mb-5 text-sm text-cinza">
          Mostrando só os pedidos com prazo de guarda vencido, de qualquer data.
        </p>
      ) : (
      <>
      <BuscaEPeriodo
        busca={busca}
        onBusca={(valor) => filtrar(() => setBusca(valor))}
        placeholder="Buscar por código, nome, contato ou texto"
        periodo={periodo}
        onPeriodo={(valor) => filtrar(() => setPeriodo(valor))}
        intervalo={intervalo}
        onIntervalo={(valor) => filtrar(() => setIntervalo(valor))}
      />

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

      <GrupoDeFiltros
        rotulo="Filtrar pedidos"
        opcoes={[
          ["abertas", "Abertos"],
          ["encerradas", "Encerrados"],
          ["todas", "Todos"],
        ]}
        valor={filtro}
        onEscolher={(valor) =>
          filtrar(() => {
            setFiltro(valor);
            setSubfiltro("todas");
          })
        }
        contagem={contagem}
      />

      {subfiltros && (
        <GrupoDeFiltros<Subfiltro>
          rotulo={filtro === "abertas" ? "Filtrar pedidos abertos" : "Filtrar pedidos encerrados"}
          nivel={2}
          opcoes={[["todas", "Todos"], ...subfiltros]}
          valor={subfiltro}
          onEscolher={(valor) => filtrar(() => setSubfiltro(valor))}
          contagem={contagemDoGrupo}
        />
      )}

      </>
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
        {paginaAtual.itens.map((encomenda) => {
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
                {estaVencido(encomenda, agora) && (
                  <span className="bg-red-800 px-2 py-1 font-mono text-[0.68rem] tracking-wider text-white uppercase">
                    Prazo vencido
                  </span>
                )}
                <span className="min-w-0 flex-1">
                  <span className="block font-bold">
                    <span className="mr-2 font-mono text-sm font-medium text-cinza">
                      #{codigoParaExibir(encomenda.id)}
                    </span>
                    {encomenda.nome}
                    {(encomenda.arquivo || encomenda.linkArquivo) && (
                      <span className="ml-2 border border-laranja-escuro px-1.5 font-mono text-[0.65rem] font-medium tracking-wider text-laranja-escuro uppercase">
                        3D
                        <span className="sr-only"> (com arquivo 3D)</span>
                      </span>
                    )}
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

                  {encomenda.arquivo && (
                    <Detalhe rotulo="Arquivo 3D">
                      <span className="flex flex-wrap items-center gap-3">
                        <span className="font-bold break-all">{encomenda.arquivo.nome}</span>
                        <span className="text-cinza">{tamanhoDoArquivo(encomenda.arquivo.bytes)}</span>
                        <a
                          href={encomenda.arquivo.src}
                          download={encomenda.arquivo.nome}
                          className="inline-flex min-h-10 items-center bg-laranja px-4 text-sm font-bold text-grafite hover:bg-[#ff7f22]"
                        >
                          Baixar
                        </a>
                      </span>
                    </Detalhe>
                  )}

                  {encomenda.linkArquivo && (
                    <Detalhe rotulo="Link do arquivo (enviado pelo cliente)">
                      <a
                        href={encomenda.linkArquivo}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        className="font-bold break-all text-laranja-escuro underline underline-offset-4"
                      >
                        {encomenda.linkArquivo}
                        <span className="sr-only"> (abre em nova aba)</span>
                      </a>
                      <span className="mt-1 block text-xs text-cinza">
                        Link externo: confira o endereço antes de abrir.
                      </span>
                    </Detalhe>
                  )}
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

                  <PrazoDoPedido encomenda={encomenda} agora={agora} />

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

      <Paginacao
        pagina={paginaAtual.pagina}
        totalDePaginas={paginaAtual.totalDePaginas}
        totalDeItens={visiveis.length}
        nomeDosItens="pedidos"
        onPagina={irParaPagina}
      />
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

const dataCurta = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" });

/** Quanto tempo o pedido ainda pode ficar guardado, conforme a política de privacidade. */
function PrazoDoPedido({ encomenda, agora }: { encomenda: Encomenda; agora: number }) {
  const prazo = prazoDeGuarda(encomenda, agora);
  if (prazo.tipo === "em-andamento") return null;
  return (
    <p className={prazo.tipo === "vencido" ? "text-sm font-bold text-red-800" : "text-sm text-cinza"}>
      {prazo.tipo === "vencido"
        ? `Prazo de guarda vencido em ${dataCurta.format(prazo.venceuEm)}: a política pede para apagar este pedido.`
        : `Guardado até ${dataCurta.format(prazo.venceEm)} (faltam ${prazo.diasRestantes} dias), conforme a política de privacidade.`}
    </p>
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
