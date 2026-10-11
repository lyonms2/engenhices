import type { ImageLoaderProps } from "next/image";

/**
 * Loader global do next/image (ver next.config.ts). Fotos do Cloudinary são
 * entregues pelo próprio Cloudinary, já na largura pedida e em formato e
 * qualidade automáticos — sem passar pela otimização de imagens da Vercel.
 * Outros endereços (ex.: arquivos em /public) são usados como estão.
 */
export default function cloudinaryLoader({ src, width, quality }: ImageLoaderProps): string {
  const marcador = "/image/upload/";
  if (!src.includes("res.cloudinary.com") || !src.includes(marcador)) return src;

  const transformacao = ["f_auto", `q_${quality ?? "auto"}`, "c_limit", `w_${width}`].join(",");
  return src.replace(marcador, `${marcador}${transformacao}/`);
}
