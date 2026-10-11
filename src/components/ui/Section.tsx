import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tom = "claro" | "escuro" | "papel";

const fundos: Record<Tom, string> = {
  claro: "bg-branco text-grafite",
  papel: "bg-[#ebe8e1] text-grafite",
  escuro: "bg-grafite text-branco",
};

export function Container({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8", className)}>
      {children}
    </div>
  );
}

type SectionProps = {
  children: ReactNode;
  tom?: Tom;
  id?: string;
  /** id do título que nomeia a seção, para leitores de tela. */
  labelledBy?: string;
  className?: string;
};

export function Section({ children, tom = "claro", id, labelledBy, className }: SectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={cn("py-20 sm:py-28", fundos[tom], className)}
    >
      <Container>{children}</Container>
    </section>
  );
}
