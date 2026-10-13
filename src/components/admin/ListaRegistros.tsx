"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { algumContem, dentroDoPeriodo, paginar, type Intervalo, type Periodo } from "@/lib/filtros";
import type { Criacao } from "@/types/criacao";
import { TIPOS_DE_REGISTRO, type RegistroLab, type StatusDoRegistro, type TipoDeRegistro } from "@/types/laboratorio";
import { BuscaEPeriodo, GrupoDeFiltros, Paginacao } from "./BarraDeFiltros";

type FiltroSituacao = "todos" | StatusDoRegistro;
type FiltroTipo = "todos" | TipoDeRegistro;

const botaoSecundario =
  "inline-flex min-h-11 items-center justify-center border border-grafite/25 px-5 text-sm font-bold hover:border-grafite";

/** Registros do Laboratório no /admin: busca, tipo, situação, período e paginação. */
export function ListaRegistros({
  registros,
  criacoes,
  onEditar,
}: {
  registros: RegistroLab[];
  criacoes: Criacao[];
  onEditar: (registro: RegistroLab) => void;
}) {
  const [busca, setBusca] = useState("");
  const [situacao, setSituacao] = useState<FiltroSituacao>("todos");
  const [tipo, setTipo] = useState<FiltroTipo>("todos");
  const [periodo, setPeriodo] = useState<Periodo>("tudo");
  const [intervalo, setIntervalo] = useState<Intervalo>({ de: "", ate: "" });
  const [pagina, setPagina] = useState(1);
  const [agora] = useState(() => Date.now());
  const idTipo = useId();

  function filtrar(mudanca: () => void) {
    mudanca();
    setPagina(1);
  }

  if (registros.length === 0) {
    return (
      <p className="mt-10 border border-dashed border-grafite/20 px-6 py-10 text-center text-cinza">
        Nenhum registro ainda. Comece documentando um experimento, um protótipo ou um projeto.
      </p>
    );
  }

  const nomeDaCriacao = (slug: string | null) =>
    slug ? (criacoes.find((criacao) => criacao.slug === slug)?.title ?? slug) : null;

  const base = registros.filter(
    (registro) =>
      algumContem(
        [registro.title, registro.slug, registro.summary, registro.body, nomeDaCriacao(registro.creationSlug) ?? ""],
        busca,
      ) && dentroDoPeriodo(registro.createdAt, periodo, agora, intervalo),
  );
  const doTipo = base.filter((registro) => tipo === "todos" || registro.type === tipo);
  const daSituacao = base.filter((registro) => situacao === "todos" || registro.status === situacao);
  const visiveis = doTipo.filter((registro) => situacao === "todos" || registro.status === situacao);
  const paginaAtual = paginar(visiveis, pagina);

  return (
    <div className="mt-8">
      <BuscaEPeriodo
        busca={busca}
        onBusca={(valor) => filtrar(() => setBusca(valor))}
        placeholder="Buscar por título, texto ou criação"
        periodo={periodo}
        onPeriodo={(valor) => filtrar(() => setPeriodo(valor))}
        intervalo={intervalo}
        onIntervalo={(valor) => filtrar(() => setIntervalo(valor))}
        extra={
          <div>
            <label htmlFor={idTipo} className="sr-only">
              Tipo
            </label>
            <select
              id={idTipo}
              value={tipo}
              onChange={(e) => filtrar(() => setTipo(e.target.value as FiltroTipo))}
              className="block min-h-11 border border-grafite/20 bg-white px-3 text-base"
            >
              <option value="todos">Todos os tipos ({daSituacao.length})</option>
              {(Object.entries(TIPOS_DE_REGISTRO) as [TipoDeRegistro, string][]).map(([valor, nome]) => (
                <option key={valor} value={valor}>
                  {nome} ({daSituacao.filter((registro) => registro.type === valor).length})
                </option>
              ))}
            </select>
          </div>
        }
      />

      <GrupoDeFiltros<FiltroSituacao>
        rotulo="Filtrar por situação"
        opcoes={[
          ["todos", "Todos"],
          ["publicado", "Publicados"],
          ["rascunho", "Rascunhos"],
        ]}
        valor={situacao}
        onEscolher={(valor) => filtrar(() => setSituacao(valor))}
        contagem={(opcao) => doTipo.filter((registro) => opcao === "todos" || registro.status === opcao).length}
      />

      {visiveis.length === 0 ? (
        <p className="border border-dashed border-grafite/20 px-6 py-10 text-center text-cinza">
          {busca.trim() ? "Nenhum registro encontrado com essa busca." : "Nenhum registro com esses filtros."}
        </p>
      ) : (
        <ul className="divide-y divide-grafite/10 border-y border-grafite/10">
          {paginaAtual.itens.map((registro) => (
            <li key={registro.id} className="flex flex-wrap items-center gap-4 py-4">
              <div className="min-w-0 flex-1">
                <p className="font-bold">{registro.title}</p>
                <p className="mt-1.5 flex flex-wrap items-center gap-2 text-xs">
                  <span
                    className={`px-2 py-0.5 font-mono tracking-wider uppercase ${
                      registro.status === "publicado" ? "bg-laranja text-grafite" : "bg-grafite/10 text-grafite"
                    }`}
                  >
                    {registro.status === "publicado" ? "Publicado" : "Rascunho"}
                  </span>
                  <span className="border border-grafite/20 px-2 py-0.5 font-mono tracking-wider uppercase">
                    {TIPOS_DE_REGISTRO[registro.type]}
                  </span>
                  {registro.creationSlug && (
                    <span className="text-cinza">↳ {nomeDaCriacao(registro.creationSlug)}</span>
                  )}
                  {(registro.youtubeUrl || registro.tiktokUrl) && <span className="text-cinza">▶ vídeo</span>}
                  {registro.modelUrl && <span className="text-cinza">◆ modelo 3D</span>}
                </p>
              </div>
              <div className="flex gap-2">
                {registro.status === "publicado" && (
                  <Link href={`/laboratorio/${registro.slug}`} className={botaoSecundario}>
                    Ver
                  </Link>
                )}
                <button type="button" onClick={() => onEditar(registro)} className={botaoSecundario}>
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
        nomeDosItens="registros"
        onPagina={setPagina}
      />
    </div>
  );
}
