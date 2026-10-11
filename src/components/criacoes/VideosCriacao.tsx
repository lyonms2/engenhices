import { Container } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/SectionHeading";
import { analisarTikTok, analisarYouTube, cn, type VideoIncorporado } from "@/lib/utils";
import type { Criacao } from "@/types/criacao";

type Video = {
  plataforma: "YouTube" | "TikTok";
  url: string;
  incorporado: VideoIncorporado | null;
};

/**
 * Vídeos da criação lado a lado: Shorts e TikTok em pé (9:16), vídeos
 * comuns do YouTube deitados (16:9). Link sem player reconhecível vira link.
 */
export function VideosCriacao({ criacao }: { criacao: Criacao }) {
  const videos: Video[] = [];
  if (criacao.youtubeUrl) {
    videos.push({ plataforma: "YouTube", url: criacao.youtubeUrl, incorporado: analisarYouTube(criacao.youtubeUrl) });
  }
  if (criacao.tiktokUrl) {
    videos.push({ plataforma: "TikTok", url: criacao.tiktokUrl, incorporado: analisarTikTok(criacao.tiktokUrl) });
  }
  if (videos.length === 0) return null;

  return (
    <section aria-labelledby="videos-titulo" className="bg-grafite bg-prancheta py-16 text-branco sm:py-20">
      <Container>
        <Eyebrow tom="escuro">Engenhices Lab</Eyebrow>
        <h2 id="videos-titulo" className="mt-4 text-3xl font-extrabold tracking-tight">
          Veja funcionando
        </h2>

        <ul className="mt-10 flex flex-wrap gap-8">
          {videos.map((video) => (
            <li
              key={video.plataforma}
              className={cn(
                "w-full",
                video.incorporado?.vertical ? "sm:w-[320px]" : "lg:w-[640px]",
              )}
            >
              <p className="mb-3 font-mono text-xs tracking-wider text-laranja uppercase">
                {video.plataforma}
              </p>
              {video.incorporado ? (
                <iframe
                  src={video.incorporado.embedUrl}
                  title={`Vídeo no ${video.plataforma}: ${criacao.title}`}
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; fullscreen; gyroscope; picture-in-picture"
                  allowFullScreen
                  className={cn(
                    "w-full border border-branco/10 bg-grafite-escuro",
                    video.incorporado.vertical
                      ? "mx-auto aspect-[9/16] max-w-[320px] sm:mx-0"
                      : "aspect-video",
                  )}
                />
              ) : (
                <a
                  href={video.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center border border-branco/30 px-5 text-sm font-bold hover:border-laranja hover:text-laranja"
                >
                  Assistir no {video.plataforma}
                  <span className="sr-only"> (abre em nova aba)</span>
                </a>
              )}
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
