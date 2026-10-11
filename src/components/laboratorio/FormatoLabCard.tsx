import { Placeholder } from "@/components/ui/Placeholder";
import type { FormatoLab } from "@/data/laboratorio-demo";
import { getYouTubeEmbedUrl } from "@/lib/utils";

/**
 * Cartão de um formato do Lab. Com URL do YouTube, incorpora o vídeo (sem
 * cookies); com URL do TikTok, mostra um link; sem URL, um espaço reservado.
 */
export function FormatoLabCard({
  formato,
  tituloComo: Titulo = "h3",
}: {
  formato: FormatoLab;
  tituloComo?: "h2" | "h3";
}) {
  const embed =
    formato.url && formato.plataforma === "YouTube" ? getYouTubeEmbedUrl(formato.url) : null;
  const vertical = formato.plataforma === "TikTok";

  return (
    <article className="flex h-full flex-col border border-branco/10 bg-grafite-escuro">
      {embed ? (
        <iframe
          src={embed}
          title={`Vídeo: ${formato.title}`}
          loading="lazy"
          allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="aspect-video w-full"
        />
      ) : (
        <Placeholder
          tom="escuro"
          proporcao="16/9"
          rotulo={vertical ? "Vídeos curtos em breve" : "Vídeo em breve"}
        />
      )}

      <div className="flex flex-1 flex-col p-6">
        <p className="font-mono text-xs tracking-wider text-laranja uppercase">
          {formato.plataforma}
        </p>
        <Titulo className="mt-3 text-xl font-bold">{formato.title}</Titulo>
        <p className="mt-3 flex-1 text-sm leading-relaxed text-cinza-claro">
          {formato.description}
        </p>
        {formato.url && !embed && (
          <a
            href={formato.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 text-sm font-bold text-laranja underline-offset-4 hover:underline"
          >
            Assistir no {formato.plataforma}
            <span className="sr-only"> (abre em nova aba)</span>
          </a>
        )}
      </div>
    </article>
  );
}
