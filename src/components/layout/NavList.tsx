import Link from "next/link";
import { mainNav } from "@/config/site";
import { cn } from "@/lib/utils";

type NavListProps = {
  /** Rota atual; null enquanto ainda não é conhecida (pré-renderização). */
  pathname?: string | null;
  orientacao?: "horizontal" | "vertical";
};

export function isAtivo(href: string, pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

/** Lista de links principais, sem estado. Usada no cabeçalho e no menu móvel. */
export function NavList({ pathname = null, orientacao = "horizontal" }: NavListProps) {
  const vertical = orientacao === "vertical";

  return (
    <ul className={cn("flex", vertical ? "flex-col" : "items-center gap-1")}>
      {mainNav.map((item) => {
        const ativo = isAtivo(item.href, pathname);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={ativo ? "page" : undefined}
              className={cn(
                "relative block font-medium transition-colors",
                vertical
                  ? "border-b border-branco/10 py-4 text-2xl font-bold"
                  : "px-3 py-2 text-sm",
                ativo ? "text-laranja" : "text-branco/80 hover:text-branco",
              )}
            >
              {item.label}
              {ativo && !vertical && (
                <span aria-hidden="true" className="absolute inset-x-3 -bottom-px h-0.5 bg-laranja" />
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
