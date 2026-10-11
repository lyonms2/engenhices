import type { Metadata } from "next";
import { ListaDeRegistros } from "@/components/laboratorio/ListaDeRegistros";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getRegistros } from "@/lib/laboratorio";
import { DESCRICAO_DOS_TIPOS, TIPOS_DE_REGISTRO, type TipoDeRegistro } from "@/types/laboratorio";

export const metadata: Metadata = {
  title: "Laboratório",
  description:
    "Engenhices Lab: experimentos, protótipos, testes, erros, melhorias e resultados. O registro de como cada ideia vira produto.",
  alternates: { canonical: "/laboratorio" },
};

export default async function LaboratorioPage() {
  const registros = await getRegistros();

  return (
    <>
      <PageHeader
        eyebrow="Engenhices Lab"
        title="Onde as ideias são postas à prova."
        description="O Lab documenta como uma ideia vira produto: experimentos, protótipos, testes, erros, melhorias e resultados. Inclusive o que deu errado, e o que aprendemos com isso."
      />

      <Section labelledBy="registros-titulo">
        <SectionHeading
          id="registros-titulo"
          eyebrow="Registros"
          title="Diário da bancada."
          description="Cada registro conta uma etapa. Quando ela faz parte de um produto, o registro leva até ele."
        />
        <div className="mt-10">
          {registros.length > 0 ? (
            <ListaDeRegistros registros={registros} />
          ) : (
            <p className="border border-dashed border-grafite/20 px-6 py-12 text-center text-cinza">
              Os primeiros registros estão saindo da bancada. Em breve, aqui.
            </p>
          )}
        </div>
      </Section>

      <Section tom="papel" labelledBy="tipos-titulo">
        <SectionHeading
          id="tipos-titulo"
          eyebrow="O que documentamos"
          title="Do primeiro esboço ao resultado."
          description="Nem toda ideia vira produto, e nem todo teste dá certo. Por isso registramos o processo inteiro."
        />
        <dl className="mt-12 grid gap-px border border-grafite/10 bg-grafite/10 sm:grid-cols-2 lg:grid-cols-4">
          {(Object.keys(TIPOS_DE_REGISTRO) as TipoDeRegistro[]).map((tipo) => (
            <div key={tipo} className="bg-branco p-6">
              <dt className="text-lg font-extrabold">{TIPOS_DE_REGISTRO[tipo]}</dt>
              <dd className="mt-2 text-sm leading-relaxed text-cinza">{DESCRICAO_DOS_TIPOS[tipo]}</dd>
            </div>
          ))}
        </dl>
      </Section>
    </>
  );
}
