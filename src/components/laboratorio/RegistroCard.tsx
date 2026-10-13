import Image from "next/image";
import Link from "next/link";
import { Placeholder } from "@/components/ui/Placeholder";
import { miniaturaDoYouTube } from "@/lib/utils";
import { TIPOS_DE_REGISTRO, type RegistroLab } from "@/types/laboratorio";

const dataCurta = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" });

/** Selo do tipo de registro (Experimento, Erro, Projeto…). */
export function SeloDoTipo({ tipo, tom = "claro" }: { tipo: RegistroLab["type"]; tom?: "claro" | "escuro" }) {
  return (
    <span
      className={
        tom === "escuro"
          ? "inline-flex border border-laranja px-2 py-1 font-mono text-[0.68rem] tracking-wider text-laranja uppercase"
          : "inline-flex border border-laranja-escuro px-2 py-1 font-mono text-[0.68rem] tracking-wider text-laranja-escuro uppercase"
      }
    >
      {TIPOS_DE_REGISTRO[tipo]}
    </span>
  );
}

/** Cartão de um registro. A capa é a primeira foto; sem foto, a miniatura do vídeo. */
export function RegistroCard({
  registro,
  tituloComo: Titulo = "h3",
  tom = "claro",
}: {
  registro: RegistroLab;
  tituloComo?: "h2" | "h3";
  tom?: "claro" | "escuro";
}) {
  const foto = registro.images[0];
  const miniatura = !foto && registro.youtubeUrl ? miniaturaDoYouTube(registro.youtubeUrl) : null;
  const escuro = tom === "escuro";

  return (
    <article
      className={
        escuro
          ? "group relative flex h-full flex-col border border-branco/10 bg-grafite-escuro transition-colors hover:border-branco/30"
          : "group relative flex h-full flex-col border border-grafite/10 bg-white transition-colors hover:border-grafite/30"
      }
    >
      <div className="relative aspect-video overflow-hidden">
        {foto ? (
          <Image
            src={foto.src}
            alt={foto.alt}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : miniatura ? (
          <Image src={miniatura} alt="" fill sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover" />
        ) : (
          <Placeholder rotulo={registro.tiktokUrl ? "Vídeo no TikTok" : "Registro"} proporcao="16/9" tom={tom} className="h-full" />
        )}
        {registro.modelUrl && (
          <span className="absolute bottom-3 left-3 bg-laranja px-2 py-1 font-mono text-[0.65rem] tracking-wider text-grafite uppercase">
            Modelo 3D
          </span>
        )}
        {(registro.youtubeUrl || registro.tiktokUrl) && (
          <span className="absolute right-3 bottom-3 bg-grafite/85 px-2 py-1 font-mono text-[0.65rem] tracking-wider text-branco uppercase">
            ▶ Vídeo
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center gap-3">
          <SeloDoTipo tipo={registro.type} tom={tom} />
          <time dateTime={registro.createdAt} className={escuro ? "text-xs text-cinza-claro" : "text-xs text-cinza"}>
            {dataCurta.format(new Date(registro.createdAt))}
          </time>
        </div>
        <Titulo className="mt-3 text-lg leading-snug font-bold">
          <Link href={`/laboratorio/${registro.slug}`} className="after:absolute after:inset-0 focus-visible:outline-none">
            {registro.title}
          </Link>
        </Titulo>
        {registro.summary && (
          <p className={escuro ? "mt-2 line-clamp-3 text-sm leading-relaxed text-cinza-claro" : "mt-2 line-clamp-3 text-sm leading-relaxed text-cinza"}>
            {registro.summary}
          </p>
        )}
      </div>

      <span
        aria-hidden="true"
        className="pointer-events-none absolute -inset-1 hidden outline-2 outline-laranja group-has-[a:focus-visible]:block"
      />
    </article>
  );
}
