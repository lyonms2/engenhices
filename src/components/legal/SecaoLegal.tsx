import type { ReactNode } from "react";

/** Seção de texto das páginas institucionais (privacidade, termos). */
export function SecaoLegal({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-extrabold tracking-tight">{titulo}</h2>
      {children}
    </section>
  );
}
