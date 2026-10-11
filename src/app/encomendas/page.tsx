import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";

export const metadata: Metadata = {
  title: "Encomendas",
  description:
    "Peças e soluções personalizadas: envie sua ideia, analisamos a viabilidade e preparamos um orçamento.",
  alternates: { canonical: "/encomendas" },
};

/**
 * Campos previstos para o formulário de solicitação (etapa futura, gravando
 * na coleção `encomendas` do Firestore e as fotos no Storage). Por enquanto
 * são só apresentados, sem campos de entrada nem envio.
 */
const camposPrevistos = [
  { nome: "Nome", detalhe: "Como podemos te chamar." },
  { nome: "E-mail ou contato", detalhe: "Onde respondemos com a análise e o orçamento." },
  { nome: "Descrição da necessidade", detalhe: "O que você precisa, com suas palavras." },
  { nome: "Finalidade da peça", detalhe: "Onde e como ela vai ser usada: isso define material e resistência." },
  { nome: "Medidas aproximadas", detalhe: "Comprimento, largura e altura, mesmo que estimadas." },
  { nome: "Fotos de referência", detalhe: "Da peça quebrada, do lugar onde vai encaixar ou de algo parecido." },
  { nome: "Observações", detalhe: "Prazo desejado, cor, quantidade ou qualquer outro detalhe." },
] as const;

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

      <Section tom="papel" labelledBy="pedido-titulo">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHeading
              id="pedido-titulo"
              eyebrow="Seu pedido"
              title="O que vamos perguntar."
              description="Estas são as informações que o formulário de solicitação vai pedir. Separá-las desde já agiliza a análise."
            />
            <p className="mt-8 border-l-2 border-laranja bg-branco px-4 py-4 text-sm leading-relaxed">
              <strong className="font-bold">O formulário ainda não está no ar.</strong> O
              recebimento de solicitações será aberto em breve, junto com um canal de contato
              oficial.
            </p>
          </div>

          <ul className="divide-y divide-grafite/10 border-y border-grafite/10 lg:col-span-7">
            {camposPrevistos.map((campo, indice) => (
              <li key={campo.nome} className="grid grid-cols-[2.5rem_1fr] gap-4 py-5">
                <span aria-hidden="true" className="pt-0.5 font-mono text-xs text-cinza">
                  {String(indice + 1).padStart(2, "0")}
                </span>
                <div>
                  <p className="font-bold">{campo.nome}</p>
                  <p className="mt-1 text-sm text-cinza">{campo.detalhe}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </Section>
    </>
  );
}
