import Link from "next/link";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

type LogoProps = {
  /** "claro" para fundos escuros, "escuro" para fundos claros. */
  tom?: "claro" | "escuro";
  comSlogan?: boolean;
  className?: string;
};

/**
 * Logotipo tipográfico provisório.
 *
 * Quando o logotipo vetorial definitivo existir, basta trocar o conteúdo de
 * <Marca /> por um <svg> (ou <Image src="/marca/engenhices.svg" />) mantendo
 * o mesmo link e o mesmo nome acessível.
 */
export function Logo({ tom = "claro", comSlogan = false, className }: LogoProps) {
  return (
    <Link
      href="/"
      aria-label={`${siteConfig.name}: página inicial`}
      className={cn("group inline-flex flex-col leading-none", className)}
    >
      <Marca tom={tom} />
      {comSlogan && (
        <span
          className={cn(
            "mt-2 font-mono text-[0.7rem] tracking-wide",
            tom === "claro" ? "text-cinza-claro" : "text-cinza",
          )}
        >
          {siteConfig.slogan}
        </span>
      )}
    </Link>
  );
}

function Marca({ tom }: { tom: "claro" | "escuro" }) {
  return (
    <span
      className={cn(
        "flex items-center gap-2 text-lg font-extrabold tracking-[0.14em] sm:text-xl",
        tom === "claro" ? "text-branco" : "text-grafite",
      )}
    >
      {/* Detalhe gráfico: um bloco laranja, como um marcador de cota. */}
      <span
        aria-hidden="true"
        className="size-2.5 bg-laranja transition-transform duration-300 group-hover:rotate-45"
      />
      ENGENHICES
    </span>
  );
}
