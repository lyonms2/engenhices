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

        {/* A visibilidade fica no contêiner: o botão já define o próprio display. */}
        <div className="hidden md:block">
          <ButtonLink href="/criacoes" tamanho="compacto">
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
