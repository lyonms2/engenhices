"use client";

import { useId, type ReactNode } from "react";
import { PERIODOS, POR_PAGINA, type Intervalo, type Periodo } from "@/lib/filtros";
import { cn } from "@/lib/utils";

/** Campo de busca + período (com datas personalizadas), usado nas listas do /admin. */
export function BuscaEPeriodo({
  busca,
  onBusca,
  placeholder,
  periodo,
  onPeriodo,
  intervalo,
  onIntervalo,
  extra,
}: {
  busca: string;
  onBusca: (valor: string) => void;
  placeholder: string;
  periodo: Periodo;
  onPeriodo: (valor: Periodo) => void;
  intervalo: Intervalo;
  onIntervalo: (valor: Intervalo) => void;
  /** Controles a mais na mesma linha (ex.: categoria). */
  extra?: ReactNode;
}) {
  const idBusca = useId();
  const idPeriodo = useId();

  return (
    <div className="mb-5 flex flex-wrap gap-3">
      <div className="min-w-[14rem] flex-1">
        <label htmlFor={idBusca} className="sr-only">
          Buscar
        </label>
        <input
          id={idBusca}
          type="search"
          value={busca}
          onChange={(e) => onBusca(e.target.value)}
          placeholder={placeholder}
          className="block min-h-11 w-full border border-grafite/20 bg-white px-3 text-base focus:border-grafite"
        />
      </div>
      {extra}
      <div>
        <label htmlFor={idPeriodo} className="sr-only">
          Período
        </label>
        <select
          id={idPeriodo}
          value={periodo}
          onChange={(e) => onPeriodo(e.target.value as Periodo)}
          className="block min-h-11 border border-grafite/20 bg-white px-3 text-base"
        >
          {PERIODOS.map(([valor, nome]) => (
            <option key={valor} value={valor}>
              {nome}
            </option>
          ))}
        </select>
      </div>
      {periodo === "personalizado" && (
        <div className="flex w-full flex-wrap items-end gap-3">
          <label className="text-sm">
            <span className="font-bold">De</span>
            <input
              type="date"
              value={intervalo.de}
              max={intervalo.ate || undefined}
              onChange={(e) => onIntervalo({ ...intervalo, de: e.target.value })}
              className="mt-1 block min-h-11 border border-grafite/20 bg-white px-3 text-base"
            />
          </label>
          <label className="text-sm">
            <span className="font-bold">Até</span>
            <input
              type="date"
              value={intervalo.ate}
              min={intervalo.de || undefined}
              onChange={(e) => onIntervalo({ ...intervalo, ate: e.target.value })}
              className="mt-1 block min-h-11 border border-grafite/20 bg-white px-3 text-base"
            />
          </label>
        </div>
      )}
    </div>
  );
}

/** Botões de filtro com contagem; `nivel` 2 é a linha de subfiltros. */
export function GrupoDeFiltros<T extends string>({
  rotulo,
  opcoes,
  valor,
  onEscolher,
  contagem,
  nivel = 1,
}: {
  rotulo: string;
  opcoes: readonly (readonly [T, string])[];
  valor: T;
  onEscolher: (valor: T) => void;
  contagem: (valor: T) => number;
  nivel?: 1 | 2;
}) {
  return (
    <div
      role="group"
      aria-label={rotulo}
      className={cn(
        "mb-5 flex flex-wrap items-center gap-2",
        nivel === 2 && "-mt-2 border-l-2 border-grafite/15 pl-3",
      )}
    >
      {opcoes.map(([opcao, nome]) => (
        <button
          key={opcao}
          type="button"
          aria-pressed={valor === opcao}
          onClick={() => onEscolher(opcao)}
          className={cn(
            "inline-flex items-center gap-2 border text-sm font-bold",
            nivel === 1 ? "min-h-10 px-4" : "min-h-9 px-3",
            valor === opcao
              ? nivel === 1
                ? "border-grafite bg-grafite text-branco"
                : "border-grafite text-grafite"
              : nivel === 1
                ? "border-grafite/20 bg-white hover:border-grafite"
                : "border-transparent text-cinza hover:text-grafite",
          )}
        >
          {nome}
          <span className="font-mono text-xs font-medium opacity-70">{contagem(opcao)}</span>
        </button>
      ))}
    </div>
  );
}

export function Paginacao({
  pagina,
  totalDePaginas,
  totalDeItens,
  nomeDosItens,
  onPagina,
}: {
  pagina: number;
  totalDePaginas: number;
  totalDeItens: number;
  /** No plural, ex.: "pedidos". */
  nomeDosItens: string;
  onPagina: (pagina: number) => void;
}) {
  if (totalDeItens <= POR_PAGINA) return null;

  const botao =
    "inline-flex min-h-10 items-center border border-grafite/20 bg-white px-4 text-sm font-bold hover:border-grafite disabled:opacity-40";

  return (
    <nav aria-label={`Páginas de ${nomeDosItens}`} className="mt-6 flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-cinza">
        {(pagina - 1) * POR_PAGINA + 1}–{Math.min(pagina * POR_PAGINA, totalDeItens)} de {totalDeItens}{" "}
        {nomeDosItens}
      </p>
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => onPagina(pagina - 1)} disabled={pagina === 1} className={botao}>
          ← Anterior
        </button>
        <span className="px-2 font-mono text-sm" aria-live="polite">
          {pagina} / {totalDePaginas}
        </span>
        <button
          type="button"
          onClick={() => onPagina(pagina + 1)}
          disabled={pagina === totalDePaginas}
          className={botao}
        >
          Próxima →
        </button>
      </div>
    </nav>
  );
}
