import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DescricaoExpansivel } from "@/components/criacoes/DescricaoExpansivel";
import { Galeria } from "@/components/criacoes/Galeria";
import { RegistroCard } from "@/components/laboratorio/RegistroCard";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Section";
import { SecaoVideos, videosDe, videosSemRepeticao } from "@/components/videos/SecaoVideos";
import { getCriacaoPorSlug, getCriacoes } from "@/lib/criacoes";
import { getRegistrosDaCriacao } from "@/lib/laboratorio";
import { CATEGORIAS } from "@/types/criacao";

/**
 * Com Cache Components, a lista não pode ser vazia. Enquanto não houver
 * criações publicadas, um slug provisório (que responde 404) mantém o build
 * válido; as criações novas são geradas na primeira visita.
 */
export async function generateStaticParams() {
  const criacoes = await getCriacoes();
  return criacoes.length > 0
    ? criacoes.map((criacao) => ({ slug: criacao.slug }))
    : [{ slug: "em-breve" }];
}

/** Resumo para buscadores e redes: a descrição corrida, cortada numa palavra. */
function resumir(texto: string, limite = 160): string {
  const corrido = texto.replace(/\s+/g, " ").trim();
  if (corrido.length <= limite) return corrido;
  return `${corrido.slice(0, corrido.lastIndexOf(" ", limite - 1))}…`;
}

export async function generateMetadata({
  params,
}: PageProps<"/criacoes/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const criacao = await getCriacaoPorSlug(slug);
  if (!criacao) return { title: "Criação não encontrada" };

  const capa = criacao.images[0];
  const description = resumir(criacao.description);

  return {
    title: criacao.title,
    description,
    alternates: { canonical: `/criacoes/${criacao.slug}` },
    openGraph: capa
      ? {
          title: criacao.title,
          description,
          images: [{ url: capa.src, width: capa.width, height: capa.height, alt: capa.alt }],
        }
      : undefined,
    // Páginas de exemplo não devem ser indexadas como produtos reais.
    robots: criacao.demo ? { index: false, follow: true } : undefined,
  };
}

export default async function CriacaoPage({ params }: PageProps<"/criacoes/[slug]">) {
  const { slug } = await params;
  const criacao = await getCriacaoPorSlug(slug);
  if (!criacao) notFound();

  // Os vídeos vêm dos registros do Laboratório associados a esta criação.
  // Os campos antigos de vídeo da criação ainda entram (sem repetir) até
  // serem movidos para um registro pelo painel.
  const registros = await getRegistrosDaCriacao(criacao.slug);
  const videos = videosSemRepeticao([
    ...registros.flatMap((registro) =>
      videosDe(registro, { titulo: registro.title, href: `/laboratorio/${registro.slug}` }),
    ),
    ...videosDe(criacao),
  ]);

  return (
    <article>
      <div className="border-b border-grafite/10 bg-branco">
        <Container className="py-4">
          <nav aria-label="Trilha de navegação">
            <ol className="flex flex-wrap items-center gap-2 font-mono text-xs text-cinza">
              <li>
                <Link href="/criacoes" className="hover:text-grafite">
                  Criações
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="text-grafite">
                {criacao.title}
              </li>
            </ol>
          </nav>
        </Container>
      </div>

      <Container className="grid gap-10 py-10 sm:py-14 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-7">
          <Galeria imagens={criacao.images} />
        </div>

        <div className="lg:col-span-5">
          <div className="flex flex-wrap gap-2">
            <Badge>{CATEGORIAS[criacao.category]}</Badge>
            {criacao.demo && <Badge variante="aviso">Exemplo</Badge>}
            {criacao.status === "arquivado" && <Badge>Fora de linha</Badge>}
          </div>

          <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">
            {criacao.title}
          </h1>

          {criacao.demo && (
            <p className="mt-6 border-l-2 border-laranja bg-grafite/5 px-4 py-3 text-sm text-cinza">
              Esta é uma página de exemplo. Ela mostra como cada criação será apresentada e
              não corresponde a um produto à venda.
            </p>
          )}

          {/* Compra antes da descrição: visível sem rolar a página. */}
          <div className="mt-6">
            {criacao.mercadoLivreUrl && criacao.status === "publicado" ? (
              <>
                <a
                  href={criacao.mercadoLivreUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-12 w-full items-center justify-center gap-2 bg-laranja px-6 py-3 text-base font-bold tracking-wide text-grafite transition-colors hover:bg-[#ff7f22] sm:w-auto"
                >
                  Comprar no Mercado Livre
                  <span aria-hidden="true">↗</span>
                  <span className="sr-only"> (abre em nova aba)</span>
                </a>
                <p className="mt-2 text-xs text-cinza">
                  A compra, o pagamento e a entrega são feitos pelo Mercado Livre.
                </p>
              </>
            ) : (
              <p className="text-sm text-cinza">
                {criacao.demo
                  ? "Exemplos não estão à venda."
                  : criacao.status === "arquivado"
                    ? "Esta criação saiu de linha."
                    : "Esta criação ainda não está disponível para compra."}
              </p>
            )}
          </div>

          {criacao.description && (
            <DescricaoExpansivel
              texto={criacao.description}
              className="mt-8 border-t border-grafite/10 pt-8"
            />
          )}

          <ButtonLink href="/criacoes" variante="texto" className="mt-8">
            ← Voltar para as criações
          </ButtonLink>
        </div>
      </Container>

      <SecaoVideos titulo="Veja funcionando" videos={videos} contexto={criacao.title} />

      {registros.length > 0 && (
        <section aria-labelledby="lab-da-criacao-titulo" className="bg-branco py-16 sm:py-20">
          <Container>
            <p className="font-mono text-xs tracking-[0.18em] text-laranja-escuro uppercase">Do Laboratório</p>
            <h2 id="lab-da-criacao-titulo" className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">
              Como esta criação foi desenvolvida
            </h2>
            <ol className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {registros.map((registro) => (
                <li key={registro.id}>
                  <RegistroCard registro={registro} />
                </li>
              ))}
            </ol>
          </Container>
        </section>
      )}
    </article>
  );
}
