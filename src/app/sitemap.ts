import type { MetadataRoute } from "next";
import { mainNav, siteConfig } from "@/config/site";
import { getCriacoes } from "@/lib/criacoes";
import { getRegistros } from "@/lib/laboratorio";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const paginas = [...mainNav, { href: "/privacidade" }, { href: "/termos" }].map((item) => ({
    url: `${siteConfig.url}${item.href === "/" ? "" : item.href}`,
  }));

  // Exemplos ficam fora do sitemap: não são produtos reais.
  const criacoes = (await getCriacoes())
    .filter((criacao) => !criacao.demo)
    .map((criacao) => ({
      url: `${siteConfig.url}/criacoes/${criacao.slug}`,
      lastModified: criacao.updatedAt,
    }));

  const registros = (await getRegistros()).map((registro) => ({
    url: `${siteConfig.url}/laboratorio/${registro.slug}`,
    lastModified: registro.updatedAt,
  }));

  return [...paginas, ...criacoes, ...registros];
}
