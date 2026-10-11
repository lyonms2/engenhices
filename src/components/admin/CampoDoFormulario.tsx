import type { ReactNode } from "react";

/** Classe dos campos de texto e seleção dos formulários do /admin. */
export const campo =
  "mt-2 block w-full border border-grafite/20 bg-white px-3 py-2.5 text-base focus:border-grafite focus-visible:outline-2 focus-visible:outline-laranja";

/** Rótulo + controle + ajuda, com contador de caracteres opcional. */
export function Campo({
  rotulo,
  ajuda,
  contador,
  children,
}: {
  rotulo: string;
  ajuda?: string;
  contador?: { atual: number; maximo: number };
  children: ReactNode;
}) {
  const perto = contador && contador.atual > contador.maximo * 0.9;
  return (
    <label className="block">
      <span className="flex items-baseline justify-between gap-4">
        <span className="font-bold">{rotulo}</span>
        {contador && (
          <span className={`font-mono text-xs ${perto ? "font-bold text-laranja-escuro" : "text-cinza"}`}>
            {contador.atual} / {contador.maximo}
          </span>
        )}
      </span>
      {children}
      {ajuda && <span className="mt-1.5 block text-sm text-cinza">{ajuda}</span>}
    </label>
  );
}
