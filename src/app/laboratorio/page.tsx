import type { Metadata } from "next";
import { FormatoLabCard } from "@/components/laboratorio/FormatoLabCard";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { formatosLab } from "@/data/laboratorio-demo";

export const metadata: Metadata = {
  title: "Laboratório",
  description:
    "Engenhices Lab: experimentos, protótipos, testes e bastidores dos projetos, em vídeos no YouTube e no TikTok.",
  alternates: { canonical: "/laboratorio" },
};

const pautas = [
  { titulo: "Experimentos", texto: "Hipótese, teste e resultado, com os números que o teste produziu." },
  { titulo: "Erros", texto: "Peças que quebraram, encaixes que não fecharam e o motivo de cada falha." },
  { titulo: "Melhorias", texto: "O que mudou de uma revisão para a outra, e por quê." },
  { titulo: "Resultados", texto: "A versão final em uso real, depois de passar por tudo isso." },
] as const;

export default function LaboratorioPage() {
  return (
    <>
      <PageHeader
        eyebrow="Engenhices Lab"
        title="Onde as ideias são postas à prova."
        description="O Lab é o lado aberto da oficina: vídeos, experimentos, protótipos e bastidores. Mostramos o processo inteiro, inclusive o que dá errado no caminho."
      />

      <Section tom="escuro" labelledBy="formatos-titulo" className="border-t border-branco/10">
        <SectionHeading
          id="formatos-titulo"
          tom="escuro"
          eyebrow="Formatos"
          title="Os vídeos estão a caminho."
          description="O canal está em preparação. Assim que os primeiros vídeos forem publicados, eles aparecem aqui."
        />
        <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {formatosLab.map((formato) => (
            <li key={formato.id}>
              <FormatoLabCard formato={formato} />
            </li>
          ))}
        </ul>
      </Section>

      <Section labelledBy="pautas-titulo">
        <SectionHeading
          id="pautas-titulo"
          eyebrow="O que você vai ver"
          title="O processo, sem cortes."
        />
        <dl className="mt-12 grid gap-px border border-grafite/10 bg-grafite/10 sm:grid-cols-2">
          {pautas.map((pauta) => (
            <div key={pauta.titulo} className="bg-branco p-6 sm:p-8">
              <dt className="text-xl font-extrabold">{pauta.titulo}</dt>
              <dd className="mt-2 text-sm leading-relaxed text-cinza">{pauta.texto}</dd>
            </div>
          ))}
        </dl>
      </Section>
    </>
  );
}
