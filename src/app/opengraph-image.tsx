import { ImageResponse } from "next/og";
import { siteConfig } from "@/config/site";

/**
 * Imagem de compartilhamento gerada no build, com a marca tipográfica.
 * Quando houver uma arte definitiva, trocar por src/app/opengraph-image.png.
 */
export const alt = `${siteConfig.name} — ${siteConfig.slogan}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
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
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ width: 28, height: 28, backgroundColor: "#ff6b00" }} />
          <div style={{ fontSize: 44, fontWeight: 800, letterSpacing: 8 }}>ENGENHICES</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 88, fontWeight: 800, lineHeight: 1 }}>Ideias que ganham forma.</div>
          <div style={{ marginTop: 28, fontSize: 36, color: "#ff6b00" }}>{siteConfig.slogan}</div>
        </div>
      </div>
    ),
    size,
  );
}
