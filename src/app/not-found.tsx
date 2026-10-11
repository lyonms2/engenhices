import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Section";

export default function NotFound() {
  return (
    <div className="bg-grafite bg-prancheta text-branco">
      <Container className="py-24 sm:py-32">
        <p className="font-mono text-sm text-laranja">Erro 404</p>
        <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
          Esta peça não saiu da bancada.
        </h1>
        <p className="mt-5 max-w-xl text-lg text-branco/80">
          A página que você procura não existe ou mudou de endereço.
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="/">Voltar ao início</ButtonLink>
          <ButtonLink href="/criacoes" variante="secundario">
            Explorar criações
          </ButtonLink>
        </div>
      </Container>
    </div>
  );
}
