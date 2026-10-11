import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Placeholder } from "@/components/ui/Placeholder";
import { CATEGORIAS, type Criacao } from "@/types/criacao";

type CriacaoCardProps = {
  criacao: Criacao;
  /** Nível do título dentro da página (h3 numa seção, h2 numa listagem). */
  tituloComo?: "h2" | "h3";
};

export function CriacaoCard({ criacao, tituloComo: Titulo = "h3" }: CriacaoCardProps) {
  const capa = criacao.images[0];
  const href = `/criacoes/${criacao.slug}`;

  return (
    <article className="group relative flex w-full flex-col border border-grafite/10 bg-white transition-[border-color,transform] duration-300 hover:-translate-y-1 hover:border-grafite/30">
      <div className="relative overflow-hidden">
        {capa ? (
          <Image
            src={capa.src}
            alt={capa.alt}
            width={capa.width}
            height={capa.height}
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <Placeholder rotulo="Foto em breve" />
        )}
        {criacao.demo && (
          <Badge variante="aviso" className="absolute top-3 left-3">
            Exemplo
          </Badge>
        )}
      </div>

      <div className="flex flex-1 flex-col p-6">
        <p className="font-mono text-xs tracking-wider text-laranja-escuro uppercase">
          {CATEGORIAS[criacao.category]}
        </p>
        <Titulo className="mt-3 text-xl font-bold tracking-tight">
          {/* O link cobre o cartão inteiro, mas o nome acessível é só o título. */}
          <Link href={href} className="after:absolute after:inset-0 focus-visible:outline-none">
            {criacao.title}
          </Link>
        </Titulo>
        <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-cinza">{criacao.description}</p>
        <p
          aria-hidden="true"
          className="mt-6 flex items-center gap-2 text-sm font-bold text-grafite transition-colors group-hover:text-laranja-escuro"
        >
          Ver detalhes
          <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
        </p>
      </div>

      {/* Contorno de foco no cartão todo, já que o link se estende sobre ele. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -inset-1 hidden outline-2 outline-laranja group-has-[a:focus-visible]:block"
      />
    </article>
  );
}
