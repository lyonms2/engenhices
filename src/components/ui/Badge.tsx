import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type BadgeProps = {
  children: ReactNode;
  variante?: "neutro" | "destaque" | "aviso";
  className?: string;
};

const estilos = {
  neutro: "border-grafite/20 text-grafite",
  destaque: "border-laranja bg-laranja text-grafite",
  aviso: "border-grafite bg-grafite text-branco",
} as const;

export function Badge({ children, variante = "neutro", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center border px-2 py-1 font-mono text-[0.68rem] font-medium tracking-wider uppercase",
        estilos[variante],
        className,
      )}
    >
      {children}
    </span>
  );
}
