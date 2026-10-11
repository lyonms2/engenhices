"use client";

import Image from "next/image";
import { useState } from "react";
import { Placeholder } from "@/components/ui/Placeholder";
import { cn } from "@/lib/utils";
import type { ImagemCriacao } from "@/types/criacao";

/** Foto principal com miniaturas; clicar numa miniatura troca a principal. */
export function Galeria({ imagens }: { imagens: ImagemCriacao[] }) {
  const [atual, setAtual] = useState(0);
  const principal = imagens[atual];

  if (!principal) return <Placeholder rotulo="Fotos em breve" />;

  return (
    <div>
      <div className="relative aspect-[4/3] overflow-hidden bg-[#e7e3db]">
        <Image
          key={principal.src}
          src={principal.src}
          alt={principal.alt}
          fill
          preload={atual === 0}
          sizes="(min-width: 1024px) 58vw, 100vw"
          className="object-contain"
        />
      </div>

      {imagens.length > 1 && (
        <ul className="mt-3 grid grid-cols-4 gap-3 sm:grid-cols-5">
          {imagens.map((imagem, indice) => (
            <li key={imagem.src}>
              <button
                type="button"
                onClick={() => setAtual(indice)}
                aria-label={`Mostrar foto ${indice + 1}: ${imagem.alt}`}
                aria-pressed={indice === atual}
                className={cn(
                  "relative block aspect-square w-full overflow-hidden border-2 transition-colors",
                  indice === atual ? "border-laranja" : "border-transparent hover:border-grafite/30",
                )}
              >
                <Image src={imagem.src} alt="" fill sizes="120px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
