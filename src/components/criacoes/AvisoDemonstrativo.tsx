import { cn } from "@/lib/utils";

/** Aviso exibido onde houver conteúdo de exemplo no lugar de produtos reais. */
export function AvisoDemonstrativo({ className }: { className?: string }) {
  return (
    <p
      className={cn(
        "flex items-start gap-3 border-l-2 border-laranja bg-grafite/5 px-4 py-3 text-sm text-cinza",
        className,
      )}
    >
      <span className="font-mono text-xs font-medium tracking-wider text-grafite uppercase">
        Exemplo
      </span>
      <span>
        Os itens abaixo são demonstrativos e mostram como o catálogo vai funcionar. As
        criações reais da Engenhices serão publicadas aqui em breve.
      </span>
    </p>
  );
}
