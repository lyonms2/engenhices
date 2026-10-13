"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { TIPOS_DE_REGISTRO, type RegistroLab, type TipoDeRegistro } from "@/types/laboratorio";
import { RegistroCard } from "./RegistroCard";

/**
 * Registros publicados com filtro por tipo. Os tipos sem nenhum registro
 * não aparecem, para não oferecer filtros vazios.
 */
export function ListaDeRegistros({ registros }: { registros: RegistroLab[] }) {
  // "modelo" não é um tipo: filtra os registros com modelo 3D para baixar.
  const [tipo, setTipo] = useState<"todos" | "modelo" | TipoDeRegistro>("todos");
  const tiposUsados = (Object.keys(TIPOS_DE_REGISTRO) as TipoDeRegistro[]).filter((valor) =>
    registros.some((registro) => registro.type === valor),
  );
  const temModelos = registros.some((registro) => registro.modelUrl);
  const visiveis = registros.filter((registro) =>
    tipo === "todos" ? true : tipo === "modelo" ? Boolean(registro.modelUrl) : registro.type === tipo,
  );

  return (
    <div>
      {(tiposUsados.length > 1 || temModelos) && (
        <div role="group" aria-label="Filtrar por tipo" className="mb-8 flex flex-wrap gap-2">
          {[
            ["todos", "Todos"] as const,
            ...(temModelos ? [["modelo", "Com modelo 3D"] as const] : []),
            ...tiposUsados.map((valor) => [valor, TIPOS_DE_REGISTRO[valor]] as const),
          ].map(
            ([valor, nome]) => (
              <button
                key={valor}
                type="button"
                aria-pressed={tipo === valor}
                onClick={() => setTipo(valor)}
                className={cn(
                  "inline-flex min-h-10 items-center border px-4 text-sm font-bold",
                  tipo === valor
                    ? "border-grafite bg-grafite text-branco"
                    : "border-grafite/20 bg-white hover:border-grafite",
                )}
              >
                {nome}
              </button>
            ),
          )}
        </div>
      )}

      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {visiveis.map((registro) => (
          <li key={registro.id}>
            <RegistroCard registro={registro} tituloComo="h2" />
          </li>
        ))}
      </ul>
    </div>
  );
}
