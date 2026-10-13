import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Galeria } from "@/components/criacoes/Galeria";
import { RegistroCard, SeloDoTipo } from "@/components/laboratorio/RegistroCard";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Section";
import { SecaoVideos, videosDe } from "@/components/videos/SecaoVideos";
import { getCriacaoPorSlug } from "@/lib/criacoes";
import { getRegistroPorSlug, getRegistros } from "@/lib/laboratorio";
import { lojaDoModelo } from "@/lib/utils";

/** Com Cache Components a lista não pode ser vazia; o slug provisório responde 404. */
export async function generateStaticParams() {
  const registros = await getRegistros();
  return registros.length > 0
    ? registros.map((registro) => ({ slug: registro.slug }))
    : [{ slug: "em-breve" }];
}

export async function generateMetadata({ params }: PageProps<"/laboratorio/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const registro = await getRegistroPorSlug(slug);
  if (!registro) return { title: "Registro não encontrado" };

  const capa = registro.images[0];
  return {
    title: registro.title,
    description: registro.summary || undefined,
    alternates: { canonical: `/laboratorio/${registro.slug}` },
    openGraph: {
      type: "article",
      title: registro.title,
      description: registro.summary || undefined,
      publishedTime: registro.createdAt,
      images: capa ? [{ url: capa.src, width: capa.width, height: capa.height, alt: capa.alt }] : undefined,
    },
  };
}

const dataLonga = new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" });

export default async function RegistroPage({ params }: PageProps<"/laboratorio/[slug]">) {
  const { slug } = await params;
  const registro = await getRegistroPorSlug(slug);
  if (!registro) notFound();

  // A criação associada só vira link se estiver publicada ou arquivada.
  const criacao = registro.creationSlug ? await getCriacaoPorSlug(registro.creationSlug) : null;
  const todos = await getRegistros();
  const relacionados = (
    criacao
      ? todos.filter((outro) => outro.creationSlug === criacao.slug && outro.id !== registro.id)
      : todos.filter((outro) => outro.id !== registro.id)
  ).slice(0, 3);

  const paragrafos = registro.body
    .split(/\n\s*\n|\n/)
    .map((paragrafo) => paragrafo.trim())
    .filter(Boolean);

  return (
    <article>
      <div className="border-b border-grafite/10 bg-branco">
        <Container className="py-4">
          <nav aria-label="Trilha de navegação">
            <ol className="flex flex-wrap items-center gap-2 font-mono text-xs text-cinza">
              <li>
                <Link href="/laboratorio" className="hover:text-grafite">
                  Laboratório
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="text-grafite">
                {registro.title}
              </li>
            </ol>
          </nav>
        </Container>
      </div>

      <Container className="py-10 sm:py-14">
        <header className="max-w-3xl">
          <div className="flex flex-wrap items-center gap-3">
            <SeloDoTipo tipo={registro.type} />
            <time dateTime={registro.createdAt} className="text-sm text-cinza">
              {dataLonga.format(new Date(registro.createdAt))}
            </time>
          </div>
          <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-balance sm:text-5xl">
            {registro.title}
          </h1>
          {registro.summary && (
            <p className="mt-5 text-xl leading-relaxed text-cinza">{registro.summary}</p>
          )}
        </header>

        {criacao && (
          <aside className="mt-8 flex max-w-3xl flex-wrap items-center justify-between gap-4 border-l-2 border-laranja bg-white px-5 py-4">
            <p className="text-sm">
              <span className="block font-mono text-xs tracking-wider text-cinza uppercase">
                Este registro faz parte de
              </span>
              <span className="mt-1 block text-lg font-bold">{criacao.title}</span>
            </p>
            <ButtonLink href={`/criacoes/${criacao.slug}`} comSeta>
              Ver o produto
            </ButtonLink>
          </aside>
        )}

        {registro.modelUrl && (
          <aside className="mt-8 flex max-w-3xl flex-wrap items-center justify-between gap-4 bg-grafite px-5 py-5 text-branco">
            <p>
              <span className="block font-mono text-xs tracking-wider text-laranja uppercase">Modelo 3D</span>
              <span className="mt-1 block text-lg font-bold">Imprima você mesmo</span>
              <span className="mt-1 block text-sm text-cinza-claro">
                A compra e o download são feitos no {lojaDoModelo(registro.modelUrl)}.
              </span>
            </p>
            <a
              href={registro.modelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-2 bg-laranja px-5 text-sm font-bold text-grafite hover:bg-[#ff7f22]"
            >
              Baixar no {lojaDoModelo(registro.modelUrl)}
              <span aria-hidden="true">↗</span>
              <span className="sr-only"> (abre em nova aba)</span>
            </a>
          </aside>
        )}

        {registro.images.length > 0 && (
          <div className="mt-10 max-w-4xl">
            <Galeria imagens={registro.images} />
          </div>
        )}

        {paragrafos.length > 0 && (
          <div className="mt-10 max-w-3xl space-y-5 text-lg leading-relaxed">
            {paragrafos.map((paragrafo, indice) => (
              <p key={indice}>{paragrafo}</p>
            ))}
          </div>
        )}
      </Container>

      <SecaoVideos titulo="Em vídeo" videos={videosDe(registro)} contexto={registro.title} />

      {relacionados.length > 0 && (
        <section aria-labelledby="relacionados-titulo" className="bg-branco py-16 sm:py-20">
          <Container>
            <h2 id="relacionados-titulo" className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              {criacao ? `Outros registros de ${criacao.title}` : "Mais do Laboratório"}
            </h2>
            <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relacionados.map((outro) => (
                <li key={outro.id}>
                  <RegistroCard registro={outro} />
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}
    </article>
  );
}
