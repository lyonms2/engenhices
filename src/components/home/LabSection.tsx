import { LinksDosCanais } from "@/components/brand/LinksDosCanais";
import { RegistroCard } from "@/components/laboratorio/RegistroCard";
import { ButtonLink } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getRegistrosRecentes } from "@/lib/laboratorio";
import { TIPOS_DE_REGISTRO } from "@/types/laboratorio";

/** Os registros mais recentes do Laboratório; sem registros, apresenta o que virá. */
export async function LabSection() {
  const registros = await getRegistrosRecentes(3);

  return (
    <Section tom="escuro" labelledBy="lab-titulo" className="bg-prancheta">
      <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <SectionHeading
          id="lab-titulo"
          tom="escuro"
          eyebrow="02 — Engenhices Lab"
          title="O laboratório fica aberto."
          description="Experimentos, protótipos, testes, erros e melhorias, mostrados como acontecem. É aqui que fica registrado como cada ideia vira produto."
        />
        <ButtonLink href="/laboratorio" variante="secundario" comSeta className="shrink-0">
          {registros.length > 0 ? "Ver todos os registros" : "Conhecer o laboratório"}
        </ButtonLink>
      </div>

      <LinksDosCanais className="mt-8" />

      {registros.length > 0 ? (
        <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {registros.map((registro) => (
            <li key={registro.id}>
              <RegistroCard registro={registro} tom="escuro" />
            </li>
          ))}
        </ul>
      ) : (
        <ul className="mt-12 flex flex-wrap gap-2" aria-label="Tipos de registro">
          {Object.values(TIPOS_DE_REGISTRO).map((nome) => (
            <li
              key={nome}
              className="border border-branco/15 px-3 py-2 font-mono text-xs tracking-wider text-cinza-claro uppercase"
            >
              {nome}
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}
