import { Suspense } from "react";
import { Logo } from "@/components/brand/Logo";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Section";
import { ActiveNavList } from "./ActiveNavList";
import { MobileMenu } from "./MobileMenu";
import { NavList } from "./NavList";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-branco/10 bg-grafite">
      <a
        href="#conteudo"
        className="sr-only bg-laranja px-4 py-2 font-bold text-grafite focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[60]"
      >
        Pular para o conteúdo
      </a>
      <Container className="flex h-16 items-center justify-between gap-6">
        <Logo />

        <nav aria-label="Principal" className="hidden md:block">
          <Suspense fallback={<NavList />}>
            <ActiveNavList />
          </Suspense>
        </nav>

        {/* A visibilidade fica no contêiner: o botão já define o próprio display.
            Só a partir de lg: entre md e lg o menu ocupa a largura e o botão quebrava em duas linhas
            (o link "Criações" do menu leva ao mesmo lugar). */}
        <div className="hidden shrink-0 lg:block">
          <ButtonLink href="/criacoes" tamanho="compacto" className="whitespace-nowrap">
            Explorar criações
          </ButtonLink>
        </div>

        <MobileMenu>
          <Suspense fallback={<NavList orientacao="vertical" />}>
            <ActiveNavList orientacao="vertical" />
          </Suspense>
          <ButtonLink href="/criacoes" comSeta className="mt-8 w-full">
            Explorar criações
          </ButtonLink>
        </MobileMenu>
      </Container>
    </header>
  );
}
