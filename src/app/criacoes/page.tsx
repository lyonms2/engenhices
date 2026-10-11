import type { Metadata } from "next";
import { AvisoDemonstrativo } from "@/components/criacoes/AvisoDemonstrativo";
import { CriacoesGrid } from "@/components/criacoes/CriacoesGrid";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/ui/Section";
import { getCriacoes } from "@/lib/criacoes";

export const metadata: Metadata = {
  title: "Criações",
  description:
    "Produtos e projetos da Engenhices: peças funcionais, mecanismos, ferramentas e invenções desenvolvidas na bancada.",
  alternates: { canonical: "/criacoes" },
};

export default async function CriacoesPage() {
  const criacoes = await getCriacoes();
  const temExemplos = criacoes.some((criacao) => criacao.demo);

  return (
    <>
      <PageHeader
        eyebrow="Engenhices Produtos e Projetos"
        title="Criações"
        description="Cada criação tem uma página própria, com fotos, vídeos do processo e, quando estiver à venda, o link para o anúncio oficial no Mercado Livre, onde a compra é concluída."
      />

      <Section labelledBy="catalogo-titulo" className="sm:py-20">
        <h2 id="catalogo-titulo" className="sr-only">
          Catálogo
        </h2>
        {temExemplos && <AvisoDemonstrativo className="mb-10" />}

        {criacoes.length > 0 ? (
          <CriacoesGrid criacoes={criacoes} />
        ) : (
          <p className="text-cinza">Nenhuma criação publicada ainda.</p>
        )}
      </Section>
    </>
  );
}
