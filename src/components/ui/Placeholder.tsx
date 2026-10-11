import { cn } from "@/lib/utils";

type PlaceholderProps = {
  /** Texto curto exibido no centro, ex.: "Foto em breve". */
  rotulo: string;
  /** Proporção do espaço reservado. */
  proporcao?: "4/3" | "16/9" | "1/1" | "9/16";
  tom?: "claro" | "escuro";
  className?: string;
};

const proporcoes = {
  "4/3": "aspect-[4/3]",
  "16/9": "aspect-video",
  "1/1": "aspect-square",
  "9/16": "aspect-[9/16]",
} as const;

/**
 * Espaço reservado para foto ou vídeo que ainda não existe. Desenhado como
 * uma área de prancheta com marcas de corte, para não parecer imagem quebrada.
 */
export function Placeholder({
  rotulo,
  proporcao = "4/3",
  tom = "claro",
  className,
}: PlaceholderProps) {
  const escuro = tom === "escuro";

  return (
    <div
      role="img"
      aria-label={rotulo}
      className={cn(
        "relative flex items-center justify-center overflow-hidden",
        proporcoes[proporcao],
        escuro
          ? "bg-grafite-claro bg-prancheta text-cinza-claro"
          : "bg-[#e7e3db] bg-prancheta-clara text-cinza",
        className,
      )}
    >
      {/* Marcas de canto, como num desenho técnico. */}
      {["top-3 left-3 border-t border-l", "top-3 right-3 border-t border-r", "bottom-3 left-3 border-b border-l", "bottom-3 right-3 border-b border-r"].map(
        (posicao) => (
          <span
            key={posicao}
            aria-hidden="true"
            className={cn("absolute size-3", posicao, escuro ? "border-cinza" : "border-cinza/60")}
          />
        ),
      )}
      <span aria-hidden="true" className="font-mono text-[0.7rem] tracking-[0.16em] uppercase">
        {rotulo}
      </span>
    </div>
  );
}
