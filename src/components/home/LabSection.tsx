import { FormatoLabCard } from "@/components/laboratorio/FormatoLabCard";
import { ButtonLink } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { formatosLab } from "@/data/laboratorio-demo";

export function LabSection() {
  return (
    <Section tom="escuro" labelledBy="lab-titulo" className="bg-prancheta">
      <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <SectionHeading
          id="lab-titulo"
          tom="escuro"
          eyebrow="02 — Engenhices Lab"
          title="O laboratório fica aberto."
          description="Experimentos, protótipos, erros e melhorias, mostrados como acontecem. O canal está em preparação: os primeiros vídeos aparecem aqui assim que forem publicados."
        />
        <ButtonLink href="/laboratorio" variante="secundario" comSeta className="shrink-0">
          Conhecer o laboratório
        </ButtonLink>
      </div>

      <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {formatosLab.map((formato) => (
          <li key={formato.id}>
            <FormatoLabCard formato={formato} />
          </li>
        ))}
      </ul>
    </Section>
  );
}
