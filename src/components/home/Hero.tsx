import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Section";
import { siteConfig } from "@/config/site";
import { DesenhoTecnico } from "./DesenhoTecnico";

export function Hero() {
  return (
    <section
      aria-labelledby="hero-titulo"
      className="relative overflow-hidden bg-grafite bg-prancheta text-branco"
    >
      {/* Faixa laranja vertical, como a margem de uma folha técnica. */}
      <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1 bg-laranja" />

      <Container className="grid items-center gap-12 py-16 sm:py-24 lg:grid-cols-12 lg:gap-8 lg:py-28">
        <div className="lg:col-span-6 xl:col-span-6">
          <p className="animar-surgir flex items-center gap-3 font-mono text-xs tracking-[0.18em] text-laranja uppercase">
            <span aria-hidden="true" className="h-px w-8 bg-current" />
            {siteConfig.slogan}
          </p>

          <h1
            id="hero-titulo"
            className="animar-surgir mt-6 text-5xl leading-[0.95] font-extrabold tracking-tight text-balance [animation-delay:80ms] sm:text-6xl xl:text-7xl"
          >
            Ideias que ganham <span className="text-laranja">forma.</span>
          </h1>

          <p className="animar-surgir mt-8 max-w-xl text-lg leading-relaxed text-pretty text-branco/80 [animation-delay:160ms]">
            Criamos, construímos e testamos ideias que saem da imaginação para ganhar vida.
            De invenções curiosas a produtos funcionais, cada criação começa com uma
            pergunta: <em className="font-semibold text-branco not-italic">e se fosse possível?</em>
          </p>

          <div className="animar-surgir mt-10 flex flex-col gap-3 [animation-delay:240ms] sm:flex-row">
            <ButtonLink href="/criacoes" comSeta>
              Explorar criações
            </ButtonLink>
            <ButtonLink href="/laboratorio" variante="secundario">
              Conhecer o laboratório
            </ButtonLink>
          </div>
        </div>

        <div className="relative lg:col-span-6 xl:col-span-6">
          <div className="relative mx-auto max-w-lg border border-branco/10 bg-grafite-escuro/60 p-4 sm:p-6 lg:max-w-none">
            <div className="flex items-center justify-between border-b border-branco/10 pb-3 font-mono text-[0.65rem] tracking-[0.16em] text-cinza-claro uppercase">
              <span>Bancada · Peça 001</span>
              <span className="flex items-center gap-2">
                <span aria-hidden="true" className="size-1.5 animate-pulse rounded-full bg-laranja" />
                Em construção
              </span>
            </div>
            <DesenhoTecnico className="mt-4 h-auto w-full" />
          </div>
        </div>
      </Container>
    </section>
  );
}
