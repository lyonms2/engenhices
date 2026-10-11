import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Section";
import { Placeholder } from "@/components/ui/Placeholder";
import { getCriacaoPorSlug, getCriacoes } from "@/lib/criacoes";
import { getYouTubeEmbedUrl } from "@/lib/utils";
import { CATEGORIAS } from "@/types/criacao";

export async function generateStaticParams() {
  const criacoes = await getCriacoes();
  return criacoes.map((criacao) => ({ slug: criacao.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/criacoes/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const criacao = await getCriacaoPorSlug(slug);
  if (!criacao) return { title: "Criação não encontrada" };

  return {
    title: criacao.title,
    description: criacao.description,
    alternates: { canonical: `/criacoes/${criacao.slug}` },
    // Páginas de exemplo não devem ser indexadas como produtos reais.
    robots: criacao.demo ? { index: false, follow: true } : undefined,
  };
}

export default async function CriacaoPage({ params }: PageProps<"/criacoes/[slug]">) {
  const { slug } = await params;
  const criacao = await getCriacaoPorSlug(slug);
  if (!criacao) notFound();

  const [capa, ...galeria] = criacao.images;
  const videoEmbed = criacao.youtubeUrl ? getYouTubeEmbedUrl(criacao.youtubeUrl) : null;

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

      <Container className="grid gap-10 py-12 sm:py-16 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-7">
          {capa ? (
            <Image
              src={capa.src}
              alt={capa.alt}
              width={capa.width}
              height={capa.height}
              priority
              sizes="(min-width: 1024px) 58vw, 100vw"
              className="aspect-[4/3] w-full object-cover"
            />
          ) : (
            <Placeholder rotulo="Fotos em breve" />
          )}

          {galeria.length > 0 && (
            <ul className="mt-4 grid grid-cols-3 gap-4">
              {galeria.map((imagem) => (
                <li key={imagem.src}>
                  <Image
                    src={imagem.src}
                    alt={imagem.alt}
                    width={imagem.width}
                    height={imagem.height}
                    sizes="20vw"
                    className="aspect-square w-full object-cover"
                  />
                </li>
              ))}
            </ul>
          )}
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
          <p className="mt-5 text-lg leading-relaxed text-cinza">{criacao.description}</p>

          {criacao.demo && (
            <p className="mt-6 border-l-2 border-laranja bg-grafite/5 px-4 py-3 text-sm text-cinza">
              Esta é uma página de exemplo. Ela mostra como cada criação será apresentada e
              não corresponde a um produto à venda.
            </p>
          )}

          <div className="mt-8 border-t border-grafite/10 pt-8">
            {criacao.mercadoLivreUrl ? (
              <>
                <a
                  href={criacao.mercadoLivreUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 w-full items-center justify-center bg-laranja px-5 py-3 text-sm font-bold tracking-wide text-grafite transition-colors hover:bg-[#ff7f22] sm:w-auto"
                >
                  Comprar no Mercado Livre
                  <span className="sr-only"> (abre em nova aba)</span>
                </a>
                <p className="mt-3 text-xs text-cinza">
                  A compra, o pagamento e a entrega são feitos pelo Mercado Livre.
                </p>
              </>
            ) : (
              <p className="text-sm text-cinza">
                {criacao.demo
                  ? "Exemplos não estão à venda."
                  : "Esta criação ainda não está disponível para compra."}
              </p>
            )}

            {criacao.tiktokUrl && (
              <a
                href={criacao.tiktokUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-block text-sm font-bold text-laranja-escuro underline-offset-4 hover:underline"
              >
                Ver vídeo curto no TikTok
                <span className="sr-only"> (abre em nova aba)</span>
              </a>
            )}
          </div>

          <ButtonLink href="/criacoes" variante="texto" className="mt-8">
            ← Voltar para as criações
          </ButtonLink>
        </div>
      </Container>

      {videoEmbed && (
        <section aria-labelledby="video-titulo" className="bg-grafite py-16 text-branco">
          <Container>
            <h2 id="video-titulo" className="text-2xl font-extrabold">
              Do laboratório
            </h2>
            <iframe
              src={videoEmbed}
              title={`Vídeo sobre ${criacao.title}`}
              loading="lazy"
              allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="mt-6 aspect-video w-full max-w-4xl"
            />
          </Container>
        </section>
      )}
    </article>
  );
}
