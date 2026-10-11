import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { ButtonLink } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";

export const metadata: Metadata = {
  title: "Sobre",
  description:
    "A Engenhices é uma marca de invenções, experimentação e produtos físicos. Do pensamento à criação.",
  alternates: { canonical: "/sobre" },
};

const frentes = [
  {
    nome: "Engenhices Lab",
    texto: "Vídeos, experimentos, protótipos, testes e bastidores. O processo à mostra.",
    href: "/laboratorio",
    acao: "Conhecer o laboratório",
  },
  {
    nome: "Engenhices Produtos",
    texto: "Produtos físicos desenvolvidos e testados pela marca, à venda pelo Mercado Livre.",
    href: "/criacoes",
    acao: "Ver as criações",
  },
  {
    nome: "Engenhices Projetos",
    texto: "Invenções próprias, soluções personalizadas e o desenvolvimento de novas ideias.",
    href: "/encomendas",
    acao: "Como funcionam as encomendas",
  },
] as const;

export default function SobrePage() {
  return (
    <>
      <PageHeader
        eyebrow="Sobre a Engenhices"
        title="Do pensamento à criação."
        description="A Engenhices nasceu da vontade de tirar ideias do papel e transformá-las em objetos reais: úteis, curiosos ou simplesmente bem resolvidos."
      />

      <Section labelledBy="manifesto-titulo">
        <div className="grid gap-12 lg:grid-cols-12">
          <SectionHeading
            id="manifesto-titulo"
            eyebrow="O que nos move"
            title="Curiosidade com método."
            className="lg:col-span-5"
          />
          <div className="space-y-5 text-lg leading-relaxed text-cinza lg:col-span-7">
            <p>
              Toda criação começa com uma pergunta: <em>e se fosse possível?</em> A partir dela,
              imaginamos, construímos, testamos e melhoramos, quantas vezes forem necessárias.
            </p>
            <p>
              A impressão 3D é o nosso ponto de partida, mas não o limite. Mecanismos,
              eletrônica, ferramentas e outras formas de fabricação digital fazem parte do
              caminho que queremos percorrer.
            </p>
            <p>
              Mostramos o processo de forma aberta, inclusive os erros, porque é neles que a
              maior parte do aprendizado acontece.
            </p>
          </div>
        </div>
      </Section>

      <Section tom="escuro" labelledBy="frentes-titulo" className="bg-prancheta">
        <SectionHeading
          id="frentes-titulo"
          tom="escuro"
          eyebrow="Três frentes, uma oficina"
          title="Como a Engenhices se organiza."
        />
        <ul className="mt-12 grid gap-6 md:grid-cols-3">
          {frentes.map((frente) => (
            <li key={frente.nome} className="flex flex-col border border-branco/10 bg-grafite-escuro p-6 sm:p-8">
              <h3 className="text-xl font-extrabold">{frente.nome}</h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-cinza-claro">{frente.texto}</p>
              <ButtonLink href={frente.href} variante="secundario" comSeta className="mt-8 self-start">
                {frente.acao}
              </ButtonLink>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}
