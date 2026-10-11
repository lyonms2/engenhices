import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";

const etapas = [
  {
    verbo: "Imaginar",
    texto: "Toda criação começa com uma pergunta. Esboçamos, medimos e definimos o que a peça precisa resolver.",
  },
  {
    verbo: "Construir",
    texto: "A ideia vira modelo e o modelo vira objeto: impressão 3D, montagem e os ajustes de bancada.",
  },
  {
    verbo: "Testar",
    texto: "Encaixe, resistência e uso real. O que falha é anotado; o que funciona é medido.",
  },
  {
    verbo: "Melhorar",
    texto: "Cada teste gera uma nova revisão, até a criação estar pronta para sair da oficina.",
  },
] as const;

export function ProcessSection() {
  return (
    <Section tom="papel" labelledBy="processo-titulo">
      <SectionHeading
        id="processo-titulo"
        eyebrow="03 — Processo"
        title="Do pensamento à criação, em quatro etapas."
        description="O mesmo ciclo vale para um produto, um protótipo ou uma encomenda. E ele se repete quantas vezes for preciso."
      />

      <ol className="mt-14 grid gap-px border border-grafite/10 bg-grafite/10 sm:grid-cols-2 lg:grid-cols-4">
        {etapas.map((etapa, indice) => (
          <li key={etapa.verbo} className="group relative bg-branco p-6 sm:p-8">
            <span
              aria-hidden="true"
              className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-laranja transition-transform duration-500 group-hover:scale-x-100"
            />
            <p className="font-mono text-sm text-laranja-escuro">
              <span className="sr-only">Etapa </span>
              {String(indice + 1).padStart(2, "0")}
            </p>
            <h3 className="mt-8 text-2xl font-extrabold tracking-tight">{etapa.verbo}</h3>
            <p className="mt-3 text-sm leading-relaxed text-cinza">{etapa.texto}</p>
          </li>
        ))}
      </ol>

      <p className="mt-6 font-mono text-xs tracking-wider text-cinza uppercase">
        ↻ Testar e melhorar se repetem até a revisão final.
      </p>
    </Section>
  );
}
