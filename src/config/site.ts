/**
 * Configuração central da marca e da navegação.
 * Textos e links que aparecem em vários lugares do site moram aqui.
 */

export const siteConfig = {
  name: "Engenhices",
  slogan: "Do pensamento à criação.",
  description:
    "Engenhices é uma marca maker de invenções, experimentos e produtos físicos. Criamos, construímos e testamos ideias até que ganhem forma.",
  locale: "pt_BR",
  /**
   * URL pública do site. Definida pela variável NEXT_PUBLIC_SITE_URL;
   * sem ela, usa localhost (o suficiente para desenvolvimento).
   */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
} as const;

export type NavItem = {
  label: string;
  href: string;
};

export const mainNav: readonly NavItem[] = [
  { label: "Início", href: "/" },
  { label: "Criações", href: "/criacoes" },
  { label: "Laboratório", href: "/laboratorio" },
  { label: "Encomendas", href: "/encomendas" },
  { label: "Sobre", href: "/sobre" },
];

/**
 * Redes sociais da marca. Os perfis ainda não existem: cada entrada fica sem
 * `href` até o endereço oficial ser informado, e o rodapé mostra "em breve".
 */
export type SocialLink = {
  label: string;
  href?: string;
};

export const socialLinks: readonly SocialLink[] = [
  { label: "YouTube" },
  { label: "TikTok" },
  { label: "Instagram" },
];

/** Páginas legais previstas, ainda não escritas. */
export const legalLinks: readonly SocialLink[] = [
  { label: "Política de privacidade" },
  { label: "Termos de uso" },
];
