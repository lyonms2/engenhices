import { AvisoDemonstrativo } from "@/components/criacoes/AvisoDemonstrativo";
import { CriacoesGrid } from "@/components/criacoes/CriacoesGrid";
import { ButtonLink } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getCriacoesEmDestaque } from "@/lib/criacoes";

export async function FeaturedCriacoes() {
  const criacoes = await getCriacoesEmDestaque();

  const temExemplos = criacoes.some((criacao) => criacao.demo);

  return (
    <Section labelledBy="destaques-titulo">
      <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <SectionHeading
          id="destaques-titulo"
          eyebrow="01 — Criações"
          title="Da bancada para o mundo."
          description="Produtos e projetos desenvolvidos, testados e refinados até funcionarem de verdade."
        />
        <ButtonLink href="/criacoes" variante="secundarioClaro" comSeta className="shrink-0">
          Ver todas as criações
        </ButtonLink>
      </div>

      {temExemplos && <AvisoDemonstrativo className="mt-10" />}

      <div className="mt-8">
        {criacoes.length > 0 ? (
          <CriacoesGrid criacoes={criacoes} />
        ) : (
          <p className="mt-4 border border-dashed border-grafite/20 px-6 py-12 text-center text-cinza">
            As primeiras criações estão saindo da bancada. Em breve, aqui.
          </p>
        )}
      </div>
    </Section>
  );
}
