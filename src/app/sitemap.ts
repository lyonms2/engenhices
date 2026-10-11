import type { MetadataRoute } from "next";
import { mainNav, siteConfig } from "@/config/site";
import { getCriacoes } from "@/lib/criacoes";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const paginas = mainNav.map((item) => ({ url: `${siteConfig.url}${item.href === "/" ? "" : item.href}` }));

  // Exemplos ficam fora do sitemap: não são produtos reais.
  const criacoes = (await getCriacoes())
    .filter((criacao) => !criacao.demo)
    .map((criacao) => ({
      url: `${siteConfig.url}/criacoes/${criacao.slug}`,
      lastModified: criacao.updatedAt,
    }));

  return [...paginas, ...criacoes];
}
