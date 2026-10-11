"use client";

import { useId, useState } from "react";
import { cn } from "@/lib/utils";

/** A partir deste tamanho o texto começa recolhido, com "Ver mais". */
const LIMITE_CARACTERES = 360;
const LIMITE_PARAGRAFOS = 3;

/**
 * Descrição de uma criação: respeita as quebras de linha digitadas no painel
 * e recolhe textos longos. O texto inteiro já está no HTML (bom para busca);
 * só a altura visível muda.
 */
export function DescricaoExpansivel({ texto, className }: { texto: string; className?: string }) {
  const id = useId();
  const [aberto, setAberto] = useState(false);
  const paragrafos = texto
    .split(/\n\s*\n|\n/)
    .map((paragrafo) => paragrafo.trim())
    .filter(Boolean);
  const longo = texto.length > LIMITE_CARACTERES || paragrafos.length > LIMITE_PARAGRAFOS;
  const recolhido = longo && !aberto;

  return (
    <div className={className}>
      <div
        id={id}
        className={cn(
          "relative space-y-4 overflow-hidden text-lg leading-relaxed text-cinza",
          recolhido && "max-h-[11.5rem]",
        )}
      >
        {paragrafos.map((paragrafo, indice) => (
          <p key={indice}>{paragrafo}</p>
        ))}
        {recolhido && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-branco to-transparent"
          />
        )}
      </div>

      {longo && (
        <button
          type="button"
          aria-expanded={aberto}
          aria-controls={id}
          onClick={() => setAberto((valor) => !valor)}
          className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-laranja-escuro underline-offset-4 hover:underline"
        >
          {aberto ? "Ver menos" : "Ver mais"}
          <span aria-hidden="true" className={cn("transition-transform", aberto && "rotate-180")}>
            ↓
          </span>
        </button>
      )}
    </div>
  );
}
