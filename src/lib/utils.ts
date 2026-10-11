/** Junta classes CSS ignorando valores vazios. */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

/**
 * Converte um link do YouTube (watch, youtu.be ou shorts) no endereço de
 * incorporação sem cookies. Devolve null se o link não for reconhecido.
 */
export function getYouTubeEmbedUrl(url: string): string | null {
  try {
    const endereco = new URL(url);
    const host = endereco.hostname.replace(/^www\.|^m\./, "");
    let id: string | null = null;

    if (host === "youtu.be") {
      id = endereco.pathname.slice(1);
    } else if (host === "youtube.com") {
      if (endereco.pathname === "/watch") {
        id = endereco.searchParams.get("v");
      } else {
        const [, tipo, valor] = endereco.pathname.split("/");
        if (tipo === "shorts" || tipo === "embed") id = valor ?? null;
      }
    }

    return id && /^[\w-]{11}$/.test(id)
      ? `https://www.youtube-nocookie.com/embed/${id}`
      : null;
  } catch {
    return null;
  }
}
