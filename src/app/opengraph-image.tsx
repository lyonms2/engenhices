import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { LOGOTIPO } from "@/components/brand/logotipoDados";
import { siteConfig } from "@/config/site";

/**
 * Imagem de compartilhamento gerada no build, com o logotipo da marca
 * (contornos de logotipoDados.ts, gerados pelo estúdio do canal).
 */
export const alt = `${siteConfig.name} — ${siteConfig.slogan}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// A fonte do site (Archivo) em arquivo local: o gerador de imagens não usa a next/font.
const pastaFontes = join(process.cwd(), "assets/fonts");
const archivoExtraBold = await readFile(join(pastaFontes, "Archivo-ExtraBold.ttf"));
const archivoRegular = await readFile(join(pastaFontes, "Archivo-Regular.ttf"));

/** O logotipo como SVG em data URI (o gerador de imagens desenha SVG por imagem). */
function logotipoDataUri(): string {
  const { largura, cap, corteLaranja, vao, letras } = LOGOTIPO;
  const [primeiro, ...resto] = letras;
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${largura} ${cap}">` +
    `<clipPath id="t"><rect x="-10" y="-10" width="800" height="${corteLaranja + 10}"/></clipPath>` +
    `<clipPath id="b"><rect x="-10" y="${corteLaranja + vao}" width="800" height="${cap}"/></clipPath>` +
    `<path d="${primeiro}" fill="#ff6b00" clip-path="url(#t)"/>` +
    `<path d="${primeiro}" fill="#f5f3ee" clip-path="url(#b)"/>` +
    resto.map((d) => `<path d="${d}" fill="#f5f3ee"/>`).join("") +
    `</svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

export default function OpenGraphImage() {
  const alturaLogo = 46;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          backgroundColor: "#1f2426",
          backgroundImage:
            "linear-gradient(to right, rgba(245,243,238,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(245,243,238,0.05) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          borderLeft: "16px solid #ff6b00",
          color: "#f5f3ee",
          fontFamily: "Archivo",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse só aceita <img> */}
        <img
          src={logotipoDataUri()}
          alt=""
          width={Math.round((alturaLogo * LOGOTIPO.largura) / LOGOTIPO.cap)}
          height={alturaLogo}
        />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 88, fontWeight: 800, lineHeight: 1 }}>Ideias que ganham forma.</div>
          <div style={{ marginTop: 28, fontSize: 36, fontWeight: 400, color: "#ff6b00" }}>{siteConfig.slogan}</div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Archivo", data: archivoExtraBold, style: "normal", weight: 800 },
        { name: "Archivo", data: archivoRegular, style: "normal", weight: 400 },
      ],
    },
  );
}
