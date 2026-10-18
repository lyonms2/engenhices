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
  url: resolverUrlDoSite(),
} as const;

/** Domínio oficial. engenhices.com (sem www) redireciona para cá na Vercel. */
const DOMINIO_DE_PRODUCAO = "https://www.engenhices.com";

/**
 * URL pública do site, em ordem de preferência:
 * 1. NEXT_PUBLIC_SITE_URL, quando definida (para trocar o domínio sem mexer no código);
 * 2. o domínio oficial, nos builds de produção da Vercel;
 * 3. o endereço da própria pré-visualização, nos deploys de preview;
 * 4. localhost, em desenvolvimento.
 */
function resolverUrlDoSite(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_ENV === "production") return DOMINIO_DE_PRODUCAO;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

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
 * Redes sociais da marca. Uma entrada sem `href` é um perfil que ainda não
 * existe: o rodapé mostra "em breve" no lugar do link.
 */
export type SocialLink = {
  label: string;
  href?: string;
};

const PERFIL_MAKERWORLD = "https://makerworld.com/pt/@Engenhices";

export const socialLinks: readonly SocialLink[] = [
  { label: "YouTube", href: "https://www.youtube.com/@Engenhices" },
  { label: "TikTok", href: "https://www.tiktok.com/@engenhices" },
  { label: "MakerWorld", href: PERFIL_MAKERWORLD },
  { label: "Instagram" },
];

/** Páginas legais. Sem `href`, a página ainda não existe e aparece "em breve". */
export const legalLinks: readonly SocialLink[] = [
  { label: "Política de privacidade", href: "/privacidade" },
  { label: "Termos de uso", href: "/termos" },
];

/** Perfis com endereço, para links e para os dados estruturados (sameAs). */
export const perfisAtivos = socialLinks.filter(
  (rede): rede is SocialLink & { href: string } => Boolean(rede.href),
);

/** Loja de modelos 3D (STL) da marca: a venda e o download acontecem lá. */
export const lojaDeModelos = {
  nome: "MakerWorld",
  href: PERFIL_MAKERWORLD,
} as const;

/**
 * Responsável pelo tratamento dos dados pessoais (LGPD, art. 9º, III), exibido
 * na política de privacidade: nome da pessoa ou razão social, documento
 * (CNPJ, se houver; opcional) e um e-mail de contato. Sem nome e e-mail, o
 * build de produção da página /privacidade falha de propósito.
 */
export const responsavelPelosDados = {
  nome: "Leonardo Moreno",
  documento: "",
  email: "engenhices@gmail.com",
} as const;
