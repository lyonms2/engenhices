import type { Criacao } from "@/types/criacao";
import { CriacaoCard } from "./CriacaoCard";

type CriacoesGridProps = {
  criacoes: Criacao[];
  tituloComo?: "h2" | "h3";
};

export function CriacoesGrid({ criacoes, tituloComo }: CriacoesGridProps) {
  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {criacoes.map((criacao) => (
        <li key={criacao.id} className="flex">
          <CriacaoCard criacao={criacao} tituloComo={tituloComo} />
        </li>
      ))}
    </ul>
  );
}
