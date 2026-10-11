"use client";

import { useEffect, useId, useRef, useState, type MouseEvent, type ReactNode } from "react";

/**
 * Botão e painel do menu móvel. Os links chegam prontos como `children`
 * (renderizados no servidor); aqui só se controla abrir e fechar.
 */
export function MobileMenu({ children }: { children: ReactNode }) {
  const [aberto, setAberto] = useState(false);
  const painelId = useId();
  const botaoRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!aberto) return;

    const fecharComEsc = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") {
        setAberto(false);
        botaoRef.current?.focus();
      }
    };
    const fecharEmTelaGrande = () => {
      if (window.matchMedia("(min-width: 768px)").matches) setAberto(false);
    };

    document.addEventListener("keydown", fecharComEsc);
    window.addEventListener("resize", fecharEmTelaGrande);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", fecharComEsc);
      window.removeEventListener("resize", fecharEmTelaGrande);
      document.body.style.overflow = "";
    };
  }, [aberto]);

  // Fecha ao seguir qualquer link de dentro do painel.
  const fecharAoNavegar = (evento: MouseEvent<HTMLDivElement>) => {
    if ((evento.target as HTMLElement).closest("a")) setAberto(false);
  };

  return (
    <div className="md:hidden">
      <button
        ref={botaoRef}
        type="button"
        aria-expanded={aberto}
        aria-controls={painelId}
        onClick={() => setAberto((valor) => !valor)}
        className="relative z-50 -mr-2 flex size-11 items-center justify-center text-branco"
      >
        <span className="sr-only">{aberto ? "Fechar menu" : "Abrir menu"}</span>
        <span aria-hidden="true" className="relative block h-3.5 w-6">
          <span
            className={`absolute left-0 block h-0.5 w-6 bg-current transition-transform duration-200 ${aberto ? "top-1.5 rotate-45" : "top-0"}`}
          />
          <span
            className={`absolute left-0 block h-0.5 w-6 bg-current transition-transform duration-200 ${aberto ? "top-1.5 -rotate-45" : "top-3"}`}
          />
        </span>
      </button>

      <div
        id={painelId}
        hidden={!aberto}
        onClick={fecharAoNavegar}
        className="fixed inset-x-0 top-16 bottom-0 z-40 overflow-y-auto bg-grafite-escuro bg-prancheta px-4 pt-4 pb-10"
      >
        <nav aria-label="Menu principal">{children}</nav>
      </div>
    </div>
  );
}
