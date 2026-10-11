import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  /** Rótulo técnico acima do título, ex.: "02 — Laboratório". */
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  id?: string;
  /** Nível do título; seções da página usam h2, a página usa h1. */
  as?: "h1" | "h2";
  tom?: "claro" | "escuro";
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  id,
  as: Titulo = "h2",
  tom = "claro",
  className,
}: SectionHeadingProps) {
  const escuro = tom === "escuro";

  return (
    <div className={cn("max-w-3xl", className)}>
      {eyebrow && <Eyebrow tom={tom}>{eyebrow}</Eyebrow>}
      <Titulo
        id={id}
        className={cn(
          "mt-4 font-extrabold tracking-tight text-balance",
          Titulo === "h1"
            ? "text-4xl sm:text-5xl lg:text-6xl"
            : "text-3xl sm:text-4xl lg:text-5xl",
        )}
      >
        {title}
      </Titulo>
      {description && (
        <p
          className={cn(
            "mt-5 text-base leading-relaxed text-pretty sm:text-lg",
            escuro ? "text-cinza-claro" : "text-cinza",
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}

export function Eyebrow({
  children,
  tom = "claro",
}: {
  children: ReactNode;
  tom?: "claro" | "escuro";
}) {
  return (
    <p
      className={cn(
        "flex items-center gap-3 font-mono text-xs font-medium tracking-[0.18em] uppercase",
        tom === "escuro" ? "text-laranja" : "text-laranja-escuro",
      )}
    >
      <span aria-hidden="true" className="h-px w-8 bg-current" />
      {children}
    </p>
  );
}
