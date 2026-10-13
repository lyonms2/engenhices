import type { Metadata } from "next";
import { LinksDosCanais } from "@/components/brand/LinksDosCanais";
import { ListaDeRegistros } from "@/components/laboratorio/ListaDeRegistros";
import { RegistroCard } from "@/components/laboratorio/RegistroCard";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { lojaDeModelos } from "@/config/site";
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
  const comModelo = registros.filter((registro) => registro.modelUrl);

  return (
    <>
      <PageHeader
        eyebrow="Engenhices Lab"
        title="Onde as ideias são postas à prova."
        description="O Lab documenta como uma ideia vira produto: experimentos, protótipos, testes, erros, melhorias e resultados. Inclusive o que deu errado, e o que aprendemos com isso."
      >
        <LinksDosCanais className="mt-8" />
      </PageHeader>

      <Section tom="escuro" labelledBy="modelos-titulo" className="border-t border-branco/10 bg-prancheta">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            id="modelos-titulo"
            tom="escuro"
            eyebrow="Modelos 3D"
            title="Imprima em casa."
            description={`Os modelos das peças desenvolvidas aqui, prontos para a sua impressora. A compra e o download são feitos no ${lojaDeModelos.nome}.`}
          />
          <a
            href={lojaDeModelos.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 shrink-0 items-center gap-2 bg-laranja px-5 text-sm font-bold text-grafite hover:bg-[#ff7f22]"
          >
            Ver todos no {lojaDeModelos.nome}
            <span aria-hidden="true">↗</span>
            <span className="sr-only"> (abre em nova aba)</span>
          </a>
        </div>
        {comModelo.length > 0 && (
          <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {comModelo.slice(0, 6).map((registro) => (
              <li key={registro.id}>
                <RegistroCard registro={registro} tom="escuro" />
              </li>
            ))}
          </ul>
        )}
      </Section>

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
