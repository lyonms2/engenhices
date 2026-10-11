import Link from "next/link";
import { Container } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/SectionHeading";
import { analisarTikTok, analisarYouTube, chaveDoVideo, cn } from "@/lib/utils";

export type VideoDoSite = {
  plataforma: "YouTube" | "TikTok";
  url: string;
  /** Registro do Laboratório de onde o vídeo vem, se houver. */
  registro?: { titulo: string; href: string };
  /** Vídeo de apresentação da criação (vende o produto). */
  apresentacao?: boolean;
};

/** Junta os vídeos de um conteúdo, sem repetir o mesmo vídeo. */
export function videosSemRepeticao(videos: VideoDoSite[]): VideoDoSite[] {
  const vistos = new Set<string>();
  return videos.filter((video) => {
    const chave = chaveDoVideo(video.url);
    if (vistos.has(chave)) return false;
    vistos.add(chave);
    return true;
  });
}

/** Vídeos de um registro do Laboratório. */
export function videosDe(
  fonte: { youtubeUrl: string | null; tiktokUrl: string | null },
  registro?: VideoDoSite["registro"],
): VideoDoSite[] {
  const videos: VideoDoSite[] = [];
  if (fonte.youtubeUrl) videos.push({ plataforma: "YouTube", url: fonte.youtubeUrl, registro });
  if (fonte.tiktokUrl) videos.push({ plataforma: "TikTok", url: fonte.tiktokUrl, registro });
  return videos;
}

/** O vídeo de apresentação de uma criação, se houver. */
export function videoDeApresentacao(criacao: {
  youtubeUrl: string | null;
  tiktokUrl: string | null;
}): VideoDoSite[] {
  return videosDe(criacao).map((video) => ({ ...video, apresentacao: true }));
}

/**
 * Vídeos lado a lado: Shorts e TikTok em pé (9:16), vídeos comuns do
 * YouTube deitados (16:9). Link sem player reconhecível vira link.
 */
export function SecaoVideos({
  titulo,
  videos,
  contexto,
}: {
  titulo: string;
  videos: VideoDoSite[];
  /** Usado no título acessível dos players. */
  contexto: string;
}) {
  if (videos.length === 0) return null;

  return (
    <section aria-labelledby="videos-titulo" className="bg-grafite bg-prancheta py-16 text-branco sm:py-20">
      <Container>
        <Eyebrow tom="escuro">Engenhices Lab</Eyebrow>
        <h2 id="videos-titulo" className="mt-4 text-3xl font-extrabold tracking-tight">
          {titulo}
        </h2>

        <ul className="mt-10 flex flex-wrap gap-8">
          {videos.map((video) => {
            const incorporado =
              video.plataforma === "YouTube" ? analisarYouTube(video.url) : analisarTikTok(video.url);
            return (
              <li
                key={chaveDoVideo(video.url)}
                className={cn("w-full", incorporado?.vertical ? "sm:w-[320px]" : "lg:w-[640px]")}
              >
                <p className="mb-3 font-mono text-xs tracking-wider text-laranja uppercase">
                  {video.apresentacao ? `Apresentação · ${video.plataforma}` : video.plataforma}
                </p>
                {incorporado ? (
                  <iframe
                    src={incorporado.embedUrl}
                    title={`Vídeo no ${video.plataforma}: ${video.registro?.titulo ?? contexto}`}
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; fullscreen; gyroscope; picture-in-picture"
                    allowFullScreen
                    className={cn(
                      "w-full border border-branco/10 bg-grafite-escuro",
                      incorporado.vertical ? "mx-auto aspect-[9/16] max-w-[320px] sm:mx-0" : "aspect-video",
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
                {video.registro && (
                  <Link
                    href={video.registro.href}
                    className="mt-3 block text-sm text-cinza-claro underline-offset-4 hover:text-laranja hover:underline"
                  >
                    Do registro: {video.registro.titulo} →
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
