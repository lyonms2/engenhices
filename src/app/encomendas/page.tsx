import type { Metadata } from "next";
import { FormEncomenda } from "@/components/encomendas/FormEncomenda";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";

export const metadata: Metadata = {
  title: "Encomendas",
  description:
    "Peças e soluções personalizadas: envie sua ideia, analisamos a viabilidade e preparamos um orçamento.",
  alternates: { canonical: "/encomendas" },
};

const etapas = [
  { titulo: "Você descreve", texto: "Conta o que precisa, com medidas e fotos de referência." },
  { titulo: "Analisamos", texto: "Avaliamos se a peça é viável e qual o melhor processo para fazê-la." },
  { titulo: "Orçamento", texto: "Se for viável, enviamos a proposta. Nenhum valor é cobrado antes disso." },
] as const;

export default function EncomendasPage() {
  return (
    <>
      <PageHeader
        eyebrow="Engenhices Projetos"
        title="Encomendas personalizadas"
        description="Peças de reposição, suportes que não existem à venda, adaptações e protótipos. Se dá para imaginar, vale perguntar."
      />

      <Section labelledBy="como-titulo">
        <SectionHeading
          id="como-titulo"
          eyebrow="Como funciona"
          title="Tudo começa com uma solicitação de orçamento."
          description="Cada pedido passa por uma análise de viabilidade. Nem toda ideia pode ser fabricada do jeito imaginado; quando não puder, explicamos o motivo e, se houver, sugerimos alternativas."
        />
        <ol className="mt-12 grid gap-6 md:grid-cols-3">
          {etapas.map((etapa, indice) => (
            <li key={etapa.titulo} className="border-t-2 border-grafite pt-6">
              <p className="font-mono text-sm text-laranja-escuro">
                <span className="sr-only">Passo </span>
                {String(indice + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-3 text-xl font-extrabold">{etapa.titulo}</h3>
              <p className="mt-2 text-sm leading-relaxed text-cinza">{etapa.texto}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section tom="papel" labelledBy="pedido-titulo" id="pedido">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionHeading
              id="pedido-titulo"
              eyebrow="Seu pedido"
              title="Conte sua ideia."
              description="Quanto mais detalhes, mais rápida a análise. Medidas e fotos ajudam muito, mesmo que aproximadas."
            />
            <ul className="mt-8 space-y-3 text-sm text-cinza">
              <li className="flex gap-3">
                <span aria-hidden="true" className="mt-1.5 size-1.5 shrink-0 bg-laranja" />
                Enviar o pedido não gera nenhum compromisso nem cobrança.
              </li>
              <li className="flex gap-3">
                <span aria-hidden="true" className="mt-1.5 size-1.5 shrink-0 bg-laranja" />
                Respondemos pelo e-mail ou WhatsApp que você informar.
              </li>
              <li className="flex gap-3">
                <span aria-hidden="true" className="mt-1.5 size-1.5 shrink-0 bg-laranja" />
                Seus dados são usados só para responder a este pedido.
              </li>
            </ul>
          </div>

          <div className="lg:col-span-8">
            <FormEncomenda />
          </div>
        </div>
      </Section>
    </>
  );
}
