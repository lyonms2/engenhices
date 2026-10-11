import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

type Variante = "primario" | "secundario" | "secundarioClaro" | "texto";

const estilos: Record<Variante, string> = {
  // Texto grafite sobre laranja: contraste 5,2:1 (branco teria só 2,9:1).
  primario: "px-5 bg-laranja text-grafite hover:bg-[#ff7f22] active:bg-[#e65f00]",
  secundario:
    "px-5 border border-branco/30 text-branco hover:border-laranja hover:text-laranja",
  secundarioClaro:
    "px-5 border border-grafite/25 text-grafite hover:border-grafite hover:bg-grafite hover:text-branco",
  texto: "text-laranja-escuro underline-offset-4 hover:underline",
};

const base =
  "inline-flex items-center justify-center gap-2 text-sm font-bold tracking-wide transition-colors duration-200";

// Sem tailwind-merge, classes conflitantes não se sobrescrevem com
// segurança; por isso o tamanho é uma prop, e não um className.
const tamanhos = {
  normal: "min-h-11 py-3",
  compacto: "min-h-10 py-2",
} as const;

type ButtonLinkProps = ComponentProps<typeof Link> & {
  variante?: Variante;
  tamanho?: keyof typeof tamanhos;
  comSeta?: boolean;
};

/** Link com aparência de botão. Para navegação; ações de formulário usam <button>. */
export function ButtonLink({
  variante = "primario",
  tamanho = "normal",
  comSeta = false,
  className,
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <Link className={cn(base, tamanhos[tamanho], estilos[variante], "group", className)} {...props}>
      {children}
      {comSeta && <Seta />}
    </Link>
  );
}

function Seta() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
    >
      <path
        d="M2 8h11M9 4l4 4-4 4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="square"
      />
    </svg>
  );
}
