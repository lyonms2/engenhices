import { AvisoDemonstrativo } from "@/components/criacoes/AvisoDemonstrativo";
import { CriacoesGrid } from "@/components/criacoes/CriacoesGrid";
import { ButtonLink } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getCriacoesEmDestaque } from "@/lib/criacoes";

export async function FeaturedCriacoes() {
  const criacoes = await getCriacoesEmDestaque();
  if (criacoes.length === 0) return null;

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
        <CriacoesGrid criacoes={criacoes} />
      </div>
    </Section>
  );
}
