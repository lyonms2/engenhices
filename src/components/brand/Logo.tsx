import Link from "next/link";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { LOGOTIPO } from "./logotipoDados";

type LogoProps = {
  /** "claro" para fundos escuros, "escuro" para fundos claros. */
  tom?: "claro" | "escuro";
  comSlogan?: boolean;
  className?: string;
};

/**
 * Logotipo da Engenhices: "ENGENHICES" em Saira Expanded convertida em contornos,
 * com a barra de cima do primeiro E em laranja (a mesma do símbolo do canal).
 * Os contornos vêm de logotipoDados.ts, gerado pelo estúdio do canal (`ed artes`).
 */
export function Logo({ tom = "claro", comSlogan = false, className }: LogoProps) {
  return (
    <Link
      href="/"
      aria-label={`${siteConfig.name}: página inicial`}
      className={cn("group inline-flex shrink-0 flex-col leading-none", className)}
    >
      <Logotipo
        id={`logo-${tom}${comSlogan ? "-slogan" : ""}`}
        className={cn("h-4 w-auto sm:h-[1.125rem]", tom === "claro" ? "text-branco" : "text-grafite")}
      />
      {comSlogan && (
        <span
          className={cn(
            "mt-2.5 font-mono text-[0.7rem] tracking-wide",
            tom === "claro" ? "text-cinza-claro" : "text-cinza",
          )}
        >
          {siteConfig.slogan}
        </span>
      )}
    </Link>
  );
}

/**
 * O desenho do logotipo, sem link. As letras usam a cor do texto (currentColor).
 * `id` precisa ser único na página (cabeçalho e rodapé mostram o logotipo ao mesmo tempo).
 */
export function Logotipo({ id = "logotipo", className }: { id?: string; className?: string }) {
  const { largura, cap, corteLaranja, vao, letras } = LOGOTIPO;
  const [primeiro, ...resto] = letras;
  return (
    <svg viewBox={`0 0 ${largura} ${cap}`} className={className} aria-hidden="true" focusable="false">
      <defs>
        <clipPath id={`${id}-e-topo`}>
          <rect x={-10} y={-10} width={800} height={corteLaranja + 10} />
        </clipPath>
        <clipPath id={`${id}-e-base`}>
          <rect x={-10} y={corteLaranja + vao} width={800} height={cap} />
        </clipPath>
      </defs>
      <path d={primeiro} className="fill-laranja" clipPath={`url(#${id}-e-topo)`} />
      <path d={primeiro} fill="currentColor" clipPath={`url(#${id}-e-base)`} />
      {resto.map((d, i) => (
        <path key={i} d={d} fill="currentColor" />
      ))}
    </svg>
  );
}
