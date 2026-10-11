import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/SectionHeading";

export function EncomendasCta() {
  return (
    <section aria-labelledby="encomendas-titulo" className="bg-branco py-20 sm:py-28">
      <Container>
        <div className="relative overflow-hidden bg-grafite px-6 py-12 text-branco sm:px-12 sm:py-16">
          <span aria-hidden="true" className="absolute inset-y-0 right-0 hidden w-1/3 bg-prancheta lg:block" />
          <span aria-hidden="true" className="absolute top-0 left-0 h-1 w-24 bg-laranja" />

          <div className="relative grid gap-10 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8">
              <Eyebrow tom="escuro">04 — Encomendas</Eyebrow>
              <h2
                id="encomendas-titulo"
                className="mt-4 text-3xl font-extrabold tracking-tight text-balance sm:text-4xl lg:text-5xl"
              >
                Tem uma ideia ou um problema para resolver?
              </h2>
              <p className="mt-5 max-w-2xl leading-relaxed text-branco/80">
                Desenvolvemos peças e soluções sob medida: uma peça de reposição, um suporte que
                não existe à venda, um protótipo para testar uma ideia. Tudo começa com uma
                solicitação de orçamento. Analisamos a viabilidade de cada pedido antes de
                propor qualquer valor.
              </p>
            </div>
            <div className="lg:col-span-4 lg:flex lg:justify-end">
              <ButtonLink href="/encomendas#pedido" comSeta>
                Pedir um orçamento
              </ButtonLink>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
