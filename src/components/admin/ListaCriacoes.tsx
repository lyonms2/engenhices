"use client";

import Image from "next/image";
import Link from "next/link";
import { useId, useState } from "react";
import { algumContem, dentroDoPeriodo, paginar, type Intervalo, type Periodo } from "@/lib/filtros";
import { CATEGORIAS, type Categoria, type Criacao, type StatusCriacao } from "@/types/criacao";
import { BuscaEPeriodo, GrupoDeFiltros, Paginacao } from "./BarraDeFiltros";

const SITUACAO: Record<StatusCriacao, { nome: string; cor: string }> = {
  publicado: { nome: "Publicado", cor: "bg-laranja text-grafite" },
  rascunho: { nome: "Rascunho", cor: "bg-grafite/10 text-grafite" },
  arquivado: { nome: "Arquivado", cor: "bg-grafite/10 text-cinza" },
};

type FiltroSituacao = "todas" | StatusCriacao;
type FiltroCategoria = "todas" | Categoria;

const botaoSecundario =
  "inline-flex min-h-11 items-center justify-center border border-grafite/25 px-5 text-sm font-bold hover:border-grafite";

function correspondeABusca(criacao: Criacao, termo: string): boolean {
  return algumContem(
    [criacao.title, criacao.slug, criacao.description, CATEGORIAS[criacao.category]],
    termo,
  );
}

/**
 * Lista de criações do /admin com busca, situação, categoria, período e
 * paginação. Diferente dos pedidos, abre em "Todo o período": uma criação
 * antiga continua no catálogo e não deve sumir da lista.
 */
export function ListaCriacoes({
  criacoes,
  onEditar,
}: {
  criacoes: Criacao[];
  onEditar: (criacao: Criacao) => void;
}) {
  const [busca, setBusca] = useState("");
  const [situacao, setSituacao] = useState<FiltroSituacao>("todas");
  const [categoria, setCategoria] = useState<FiltroCategoria>("todas");
  const [periodo, setPeriodo] = useState<Periodo>("tudo");
  const [intervalo, setIntervalo] = useState<Intervalo>({ de: "", ate: "" });
  const [pagina, setPagina] = useState(1);
  const [agora] = useState(() => Date.now());
  const idCategoria = useId();

  function filtrar(mudanca: () => void) {
    mudanca();
    setPagina(1);
  }

  if (criacoes.length === 0) {
    return (
      <p className="mt-10 border border-dashed border-grafite/20 px-6 py-10 text-center text-cinza">
        Nenhuma criação cadastrada ainda.
      </p>
    );
  }

  // Busca e período valem para todas as contagens.
  const base = criacoes.filter(
    (criacao) =>
      correspondeABusca(criacao, busca) &&
      dentroDoPeriodo(criacao.createdAt, periodo, agora, intervalo),
  );
  const daCategoria = base.filter((criacao) => categoria === "todas" || criacao.category === categoria);
  const daSituacao = base.filter((criacao) => situacao === "todas" || criacao.status === situacao);
  const visiveis = daCategoria.filter((criacao) => situacao === "todas" || criacao.status === situacao);
  const paginaAtual = paginar(visiveis, pagina);

  const contagemPorSituacao = (opcao: FiltroSituacao) =>
    daCategoria.filter((criacao) => opcao === "todas" || criacao.status === opcao).length;
  const contagemPorCategoria = (opcao: FiltroCategoria) =>
    daSituacao.filter((criacao) => opcao === "todas" || criacao.category === opcao).length;

  return (
    <div className="mt-8">
      <BuscaEPeriodo
        busca={busca}
        onBusca={(valor) => filtrar(() => setBusca(valor))}
        placeholder="Buscar por título, endereço ou descrição"
        periodo={periodo}
        onPeriodo={(valor) => filtrar(() => setPeriodo(valor))}
        intervalo={intervalo}
        onIntervalo={(valor) => filtrar(() => setIntervalo(valor))}
        extra={
          <div>
            <label htmlFor={idCategoria} className="sr-only">
              Categoria
            </label>
            <select
              id={idCategoria}
              value={categoria}
              onChange={(e) => filtrar(() => setCategoria(e.target.value as FiltroCategoria))}
              className="block min-h-11 border border-grafite/20 bg-white px-3 text-base"
            >
              <option value="todas">Todas as categorias ({contagemPorCategoria("todas")})</option>
              {(Object.entries(CATEGORIAS) as [Categoria, string][]).map(([valor, nome]) => (
                <option key={valor} value={valor}>
                  {nome} ({contagemPorCategoria(valor)})
                </option>
              ))}
            </select>
          </div>
        }
      />

      <GrupoDeFiltros<FiltroSituacao>
        rotulo="Filtrar por situação"
        opcoes={[
          ["todas", "Todas"],
          ["publicado", "Publicadas"],
          ["rascunho", "Rascunhos"],
          ["arquivado", "Arquivadas"],
        ]}
        valor={situacao}
        onEscolher={(valor) => filtrar(() => setSituacao(valor))}
        contagem={contagemPorSituacao}
      />

      {visiveis.length === 0 ? (
        <p className="border border-dashed border-grafite/20 px-6 py-10 text-center text-cinza">
          {busca.trim() ? "Nenhuma criação encontrada com essa busca." : "Nenhuma criação com esses filtros."}
        </p>
      ) : (
        <ul className="divide-y divide-grafite/10 border-y border-grafite/10">
          {paginaAtual.itens.map((criacao) => (
            <li key={criacao.id} className="flex flex-wrap items-center gap-4 py-4">
              {criacao.images[0] ? (
                <Image
                  src={criacao.images[0].src}
                  alt=""
                  width={criacao.images[0].width}
                  height={criacao.images[0].height}
                  sizes="64px"
                  className="size-16 shrink-0 bg-[#e7e3db] object-cover"
                />
              ) : (
                <span
                  aria-hidden="true"
                  className="flex size-16 shrink-0 items-center justify-center bg-[#e7e3db] font-mono text-[0.6rem] text-cinza uppercase"
                >
                  Sem foto
                </span>
              )}
              <div className="min-w-0 flex-1">
                <p className="font-bold">{criacao.title}</p>
                <p className="mt-1.5 flex flex-wrap items-center gap-2 text-xs">
                  <span
                    className={`px-2 py-0.5 font-mono tracking-wider uppercase ${SITUACAO[criacao.status].cor}`}
                  >
                    {SITUACAO[criacao.status].nome}
                  </span>
                  {criacao.featured && (
                    <span className="border border-laranja px-2 py-0.5 font-mono tracking-wider text-laranja-escuro uppercase">
                      Destaque
                    </span>
                  )}
                  <span className="text-cinza">{CATEGORIAS[criacao.category]}</span>
                </p>
              </div>
              <div className="flex gap-2">
                {criacao.status !== "rascunho" && (
                  <Link href={`/criacoes/${criacao.slug}`} className={botaoSecundario}>
                    Ver
                  </Link>
                )}
                <button type="button" onClick={() => onEditar(criacao)} className={botaoSecundario}>
                  Editar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Paginacao
        pagina={paginaAtual.pagina}
        totalDePaginas={paginaAtual.totalDePaginas}
        totalDeItens={visiveis.length}
        nomeDosItens="criações"
        onPagina={setPagina}
      />
    </div>
  );
}
