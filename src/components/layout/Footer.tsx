import { cacheLife } from "next/cache";
import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/brand/Logo";
import { Container } from "@/components/ui/Section";
import { legalLinks, mainNav, siteConfig, socialLinks, type SocialLink } from "@/config/site";

export function Footer() {
  return (
    <footer className="bg-grafite-escuro text-branco">
      <Container className="grid gap-12 py-16 md:grid-cols-12">
        <div className="md:col-span-4">
          <Logo comSlogan />
          <p className="mt-6 max-w-sm text-sm leading-relaxed text-cinza-claro">
            Invenções, experimentos e produtos físicos. A impressão 3D é o ponto de
            partida, não o limite.
          </p>
        </div>

        <ColunaLinks titulo="Navegação" className="md:col-span-2">
          {mainNav.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="text-branco/80 transition-colors hover:text-laranja">
                {item.label}
              </Link>
            </li>
          ))}
        </ColunaLinks>

        <ColunaLinks titulo="Redes sociais" className="md:col-span-3">
          {socialLinks.map((rede) => (
            <ItemExterno key={rede.label} link={rede} />
          ))}
        </ColunaLinks>

        <ColunaLinks titulo="Institucional" className="md:col-span-3">
          {legalLinks.map((pagina) => (
            <ItemExterno key={pagina.label} link={pagina} />
          ))}
        </ColunaLinks>
      </Container>

      <div className="border-t border-branco/10">
        <Container className="flex flex-col gap-2 py-6 font-mono text-xs text-cinza-claro sm:flex-row sm:justify-between">
          <p>
            © <AnoAtual /> {siteConfig.name}. Todos os direitos reservados.
          </p>
          <p>{siteConfig.slogan}</p>
        </Container>
      </div>
    </footer>
  );
}

/**
 * Com Cache Components, `new Date()` não pode rodar no HTML pré-renderizado
 * sem cache; o ano fica guardado e é recalculado uma vez por dia.
 */
async function AnoAtual() {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}

function ColunaLinks({
  titulo,
  className,
  children,
}: {
  titulo: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <h2 className="font-mono text-xs font-medium tracking-[0.18em] text-laranja uppercase">
        {titulo}
      </h2>
      <ul className="mt-5 space-y-3 text-sm">{children}</ul>
    </div>
  );
}

/** Link que ainda não tem endereço aparece como texto, marcado "em breve". */
function ItemExterno({ link }: { link: SocialLink }) {
  if (link.href?.startsWith("/")) {
    return (
      <li>
        <Link href={link.href} className="text-branco/80 transition-colors hover:text-laranja">
          {link.label}
        </Link>
      </li>
    );
  }

  if (link.href) {
    return (
      <li>
        <a
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-branco/80 transition-colors hover:text-laranja"
        >
          {link.label}
          <span className="sr-only"> (abre em nova aba)</span>
        </a>
      </li>
    );
  }

  return (
    <li className="text-cinza-claro">
      {link.label}
      <span className="mt-0.5 block font-mono text-[0.65rem] tracking-wider uppercase">Em breve</span>
    </li>
  );
}
