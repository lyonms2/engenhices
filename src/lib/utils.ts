/** Junta classes CSS ignorando valores vazios. */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

/** Gera um endereço amigável: "Suporte de Bancada!" → "suporte-de-bancada". */
export function gerarSlug(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/, "");
}

export type VideoIncorporado = {
  embedUrl: string;
  /** Vídeo em pé (Shorts, TikTok): exibido em 9:16 em vez de 16:9. */
  vertical: boolean;
};

/**
 * Lê um link do YouTube (watch, youtu.be, shorts ou embed) e devolve o
 * endereço de incorporação sem cookies. Null se o link não for reconhecido.
 */
export function analisarYouTube(url: string): VideoIncorporado | null {
  try {
    const endereco = new URL(url);
    const host = endereco.hostname.replace(/^www\.|^m\./, "");
    let id: string | null = null;
    let vertical = false;

    if (host === "youtu.be") {
      id = endereco.pathname.slice(1);
    } else if (host === "youtube.com") {
      if (endereco.pathname === "/watch") {
        id = endereco.searchParams.get("v");
      } else {
        const [, tipo, valor] = endereco.pathname.split("/");
        if (tipo === "shorts" || tipo === "embed") id = valor ?? null;
        vertical = tipo === "shorts";
      }
    }

    return id && /^[\w-]{11}$/.test(id)
      ? { embedUrl: `https://www.youtube-nocookie.com/embed/${id}`, vertical }
      : null;
  } catch {
    return null;
  }
}

export function getYouTubeEmbedUrl(url: string): string | null {
  return analisarYouTube(url)?.embedUrl ?? null;
}

/**
 * Lê um link de vídeo do TikTok (tiktok.com/@perfil/video/<id>) e devolve o
 * player oficial de incorporação. Links encurtados (vm.tiktok.com) não trazem
 * o id do vídeo e ficam como link comum.
 */
export function analisarTikTok(url: string): VideoIncorporado | null {
  try {
    const endereco = new URL(url);
    if (!/(^|\.)tiktok\.com$/.test(endereco.hostname)) return null;
    const id = endereco.pathname.match(/\/video\/(\d{8,25})/)?.[1];
    return id ? { embedUrl: `https://www.tiktok.com/player/v1/${id}`, vertical: true } : null;
  } catch {
    return null;
  }
}

/**
 * Identidade de um vídeo, para não mostrar o mesmo vídeo duas vezes quando
 * ele chega por caminhos diferentes (links com parâmetros, youtu.be etc.).
 */
export function chaveDoVideo(url: string): string {
  const youtube = analisarYouTube(url)?.embedUrl.split("/").pop();
  if (youtube) return `youtube:${youtube}`;
  const tiktok = analisarTikTok(url)?.embedUrl.split("/").pop();
  if (tiktok) return `tiktok:${tiktok}`;
  return url.trim();
}

/** Miniatura pública de um vídeo do YouTube, para cartões sem foto. */
export function miniaturaDoYouTube(url: string): string | null {
  const id = analisarYouTube(url)?.embedUrl.split("/").pop();
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null;
}

/**
 * Plataforma de um link de vídeo, pelo domínio. Aceita links curtos
 * (youtu.be, vm.tiktok.com), que nem sempre viram player, mas viram link.
 */
export function plataformaDoLink(url: string): "YouTube" | "TikTok" | null {
  try {
    const host = new URL(url).hostname.replace(/^www\.|^m\./, "");
    if (host === "youtube.com" || host === "youtu.be") return "YouTube";
    if (host === "tiktok.com" || host.endsWith(".tiktok.com")) return "TikTok";
    return null;
  } catch {
    return null;
  }
}

/** Nome do site de um link de modelo 3D, para o texto do botão. */
export function lojaDoModelo(url: string): string {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    if (host.endsWith("makerworld.com")) return "MakerWorld";
    if (host.endsWith("printables.com")) return "Printables";
    if (host.endsWith("thingiverse.com")) return "Thingiverse";
    if (host.endsWith("cults3d.com")) return "Cults3D";
    return host;
  } catch {
    return "site do modelo";
  }
}
