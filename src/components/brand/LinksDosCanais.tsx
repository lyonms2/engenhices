import { perfisAtivos } from "@/config/site";
import { cn } from "@/lib/utils";

/**
 * Atalhos para os canais oficiais (os perfis de `socialLinks` que já têm
 * endereço). Usado onde se fala de vídeos: Laboratório e seção do Lab na home.
 */
export function LinksDosCanais({
  tom = "escuro",
  className,
}: {
  /** "escuro" para fundos escuros, "claro" para fundos claros. */
  tom?: "claro" | "escuro";
  className?: string;
}) {
  if (perfisAtivos.length === 0) return null;
  const escuro = tom === "escuro";

  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      <span className={cn("font-mono text-xs tracking-wider uppercase", escuro ? "text-cinza-claro" : "text-cinza")}>
        Acompanhe
      </span>
      {perfisAtivos.map((perfil) => (
        <a
          key={perfil.href}
          href={perfil.href}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "inline-flex min-h-10 items-center gap-2 border px-4 text-sm font-bold transition-colors",
            escuro
              ? "border-branco/30 text-branco hover:border-laranja hover:text-laranja"
              : "border-grafite/25 text-grafite hover:border-grafite hover:bg-grafite hover:text-branco",
          )}
        >
          {perfil.label}
          <span aria-hidden="true">↗</span>
          <span className="sr-only"> (abre em nova aba)</span>
        </a>
      ))}
    </div>
  );
}
