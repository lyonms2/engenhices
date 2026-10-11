"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import {
  SlugEmUsoError,
  apagarCriacao,
  apagarFotos,
  avisarSiteAtualizado,
  codigoDoErro,
  salvarCriacao,
  type DadosCriacao,
} from "@/lib/firebase/painel";
import { gerarSlug } from "@/lib/utils";
import { ConfirmarAcao } from "./ConfirmarAcao";
import { GerenciadorFotos } from "./GerenciadorFotos";
import {
  CATEGORIAS,
  type Categoria,
  type Criacao,
  type ImagemCriacao,
  type StatusCriacao,
} from "@/types/criacao";

type FormCriacaoProps = {
  /** Criação em edição; ausente ao criar uma nova. */
  criacao?: Criacao;
  onSalvo: () => void;
  onCancelar: () => void;
  /** Chamado depois de apagar a criação em edição. */
  onApagado: () => void;
};

const STATUS: Record<StatusCriacao, string> = {
  rascunho: "Rascunho — só aparece aqui",
  publicado: "Publicado — aparece no site",
  arquivado: "Arquivado — fora de linha, página continua no ar",
};

const campo =
  "mt-2 block w-full border border-grafite/20 bg-white px-3 py-2.5 text-base focus:border-grafite focus-visible:outline-2 focus-visible:outline-laranja";

export function FormCriacao({ criacao, onSalvo, onCancelar, onApagado }: FormCriacaoProps) {
  const novo = !criacao;
  const [title, setTitle] = useState(criacao?.title ?? "");
  const [slug, setSlug] = useState(criacao?.slug ?? "");
  const [slugEditado, setSlugEditado] = useState(false);
  const [description, setDescription] = useState(criacao?.description ?? "");
  const [category, setCategory] = useState<Categoria>(criacao?.category ?? "utilidades");
  const [status, setStatus] = useState<StatusCriacao>(criacao?.status ?? "rascunho");
  const [featured, setFeatured] = useState(criacao?.featured ?? false);
  const [youtubeUrl, setYoutubeUrl] = useState(criacao?.youtubeUrl ?? "");
  const [tiktokUrl, setTiktokUrl] = useState(criacao?.tiktokUrl ?? "");
  const [mercadoLivreUrl, setMercadoLivreUrl] = useState(criacao?.mercadoLivreUrl ?? "");
  const [images, setImages] = useState<ImagemCriacao[]>(criacao?.images ?? []);
  // Fotos enviadas ao Cloudinary nesta edição. Se a edição for cancelada, ou
  // se forem removidas antes de salvar, são apagadas para não ficarem órfãs.
  const enviadasNestaEdicao = useRef(new Set<string>());
  const originais = criacao?.images.map((imagem) => imagem.src) ?? [];

  function mudarFotos(novas: ImagemCriacao[]) {
    for (const imagem of novas) {
      if (!originais.includes(imagem.src)) enviadasNestaEdicao.current.add(imagem.src);
    }
    setImages(novas);
  }

  /** Fotos que existem no Cloudinary mas não estão em `mantidas`. */
  function fotosSobrando(mantidas: string[]) {
    return [...originais, ...enviadasNestaEdicao.current].filter((src) => !mantidas.includes(src));
  }
  const [enviandoFotos, setEnviandoFotos] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const slugFinal = novo && !slugEditado ? gerarSlug(title) : slug;

  // Retrato do formulário, para saber se há alterações não salvas.
  const retrato = (valores: {
    title: string; description: string; category: Categoria; status: StatusCriacao;
    featured: boolean; youtubeUrl: string; tiktokUrl: string; mercadoLivreUrl: string;
    images: ImagemCriacao[];
  }) => JSON.stringify(valores);
  const [retratoInicial] = useState(() =>
    retrato({
      title: criacao?.title ?? "",
      description: criacao?.description ?? "",
      category: criacao?.category ?? "utilidades",
      status: criacao?.status ?? "rascunho",
      featured: criacao?.featured ?? false,
      youtubeUrl: criacao?.youtubeUrl ?? "",
      tiktokUrl: criacao?.tiktokUrl ?? "",
      mercadoLivreUrl: criacao?.mercadoLivreUrl ?? "",
      images: criacao?.images ?? [],
    }),
  );
  const alterado =
    retrato({ title, description, category, status, featured, youtubeUrl, tiktokUrl, mercadoLivreUrl, images }) !==
    retratoInicial;

  // Avisa antes de fechar ou recarregar a aba com alterações não salvas.
  useEffect(() => {
    if (!alterado || salvando) return;
    const avisar = (evento: BeforeUnloadEvent) => evento.preventDefault();
    window.addEventListener("beforeunload", avisar);
    return () => window.removeEventListener("beforeunload", avisar);
  }, [alterado, salvando]);

  function cancelar() {
    if (alterado && !window.confirm("Descartar as alterações não salvas?")) return;
    // Descarta só o que foi enviado agora; as fotos já salvas continuam.
    const descartadas = [...enviadasNestaEdicao.current];
    if (descartadas.length > 0) {
      apagarFotos(descartadas).catch((falha) => console.warn("[admin] Fotos descartadas não apagadas:", falha));
    }
    onCancelar();
  }

  async function enviar(evento: FormEvent) {
    evento.preventDefault();
    setErro(null);

    if (!slugFinal) {
      setErro("Defina um título para gerar o endereço da página.");
      return;
    }

    const dados: DadosCriacao = {
      title: title.trim(),
      slug: slugFinal,
      description: description.trim(),
      images: images.map((imagem) => ({ ...imagem, alt: imagem.alt.trim() })),
      category,
      featured,
      status,
      youtubeUrl: youtubeUrl.trim() || null,
      tiktokUrl: tiktokUrl.trim() || null,
      mercadoLivreUrl: mercadoLivreUrl.trim() || null,
    };

    setSalvando(true);
    try {
      await salvarCriacao(dados, { novo, createdAt: criacao?.createdAt });
      // Só depois de salvo: apaga as fotos removidas, que o site não usa mais.
      const removidas = fotosSobrando(dados.images.map((imagem) => imagem.src));
      if (removidas.length > 0) {
        await apagarFotos(removidas).catch((falha) =>
          console.warn("[admin] Fotos removidas não apagadas:", falha),
        );
      }
      await avisarSiteAtualizado();
      onSalvo();
    } catch (falha) {
      if (falha instanceof SlugEmUsoError) setErro(falha.message);
      else if (codigoDoErro(falha) === "permission-denied")
        setErro("O Firestore recusou a gravação: confira os campos ou as regras publicadas.");
      else setErro("Não foi possível salvar. Verifique a conexão e tente de novo.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <form onSubmit={enviar} className="space-y-6">
      <h2 className="text-2xl font-extrabold">{novo ? "Nova criação" : `Editar: ${criacao.title}`}</h2>

      <Campo rotulo="Título" contador={{ atual: title.length, maximo: 120 }}>
        <input required maxLength={120} value={title} onChange={(e) => setTitle(e.target.value)} className={campo} />
      </Campo>

      <Campo
        rotulo="Endereço da página"
        ajuda={
          novo
            ? "Gerado a partir do título. Não pode ser mudado depois de salvo."
            : "Não pode ser mudado, para não quebrar links já divulgados."
        }
      >
        <div className="mt-2 flex items-stretch border border-grafite/20 bg-white focus-within:border-grafite">
          <span className="flex items-center bg-grafite/5 px-3 font-mono text-sm text-cinza">/criacoes/</span>
          <input
            required
            readOnly={!novo}
            maxLength={80}
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            title="Só letras minúsculas sem acento, números e hífens."
            value={slugFinal}
            onChange={(e) => {
              setSlugEditado(true);
              setSlug(gerarSlug(e.target.value));
            }}
            className="w-full px-3 py-2.5 font-mono text-base read-only:text-cinza focus:outline-none"
          />
        </div>
      </Campo>

      <Campo
        rotulo="Descrição"
        ajuda="Deixe uma linha em branco entre parágrafos. Textos longos aparecem com “Ver mais”."
        contador={{ atual: description.length, maximo: 2000 }}
      >
        <textarea
          rows={5}
          maxLength={2000}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={campo}
        />
      </Campo>

      <div className="grid gap-6 sm:grid-cols-2">
        <Campo rotulo="Categoria">
          <select value={category} onChange={(e) => setCategory(e.target.value as Categoria)} className={campo}>
            {Object.entries(CATEGORIAS).map(([valor, nome]) => (
              <option key={valor} value={valor}>
                {nome}
              </option>
            ))}
          </select>
        </Campo>

        <Campo rotulo="Situação">
          <select value={status} onChange={(e) => setStatus(e.target.value as StatusCriacao)} className={campo}>
            {Object.entries(STATUS).map(([valor, nome]) => (
              <option key={valor} value={valor}>
                {nome}
              </option>
            ))}
          </select>
        </Campo>
      </div>

      <label className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={featured}
          onChange={(e) => setFeatured(e.target.checked)}
          className="mt-0.5 size-5 shrink-0 accent-laranja"
        />
        <span>
          <span className="block font-bold">Destacar na página inicial</span>
          <span className="block text-sm text-cinza">
            Destaques aparecem primeiro; sem destaques, a página mostra as mais recentes.
          </span>
        </span>
      </label>

      <fieldset className="space-y-6 border-t border-grafite/10 pt-6">
        <legend className="font-mono text-xs tracking-wider text-cinza uppercase">Links (opcionais)</legend>
        <Campo rotulo="Anúncio no Mercado Livre">
          <input type="url" maxLength={500} value={mercadoLivreUrl} onChange={(e) => setMercadoLivreUrl(e.target.value)} placeholder="https://" className={campo} />
        </Campo>
        <Campo rotulo="Vídeo no YouTube">
          <input type="url" maxLength={500} value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=…" className={campo} />
        </Campo>
        <Campo rotulo="Vídeo no TikTok">
          <input type="url" maxLength={500} value={tiktokUrl} onChange={(e) => setTiktokUrl(e.target.value)} placeholder="https://www.tiktok.com/@…" className={campo} />
        </Campo>
      </fieldset>

      <GerenciadorFotos imagens={images} onChange={mudarFotos} onEnviando={setEnviandoFotos} />

      {erro && (
        <p role="alert" className="border-l-2 border-red-700 bg-red-50 px-4 py-3 text-sm text-red-800">
          {erro}
        </p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="submit"
          disabled={salvando || enviandoFotos}
          className="inline-flex min-h-11 items-center justify-center bg-laranja px-6 text-sm font-bold text-grafite hover:bg-[#ff7f22] disabled:opacity-60"
        >
          {salvando ? "Salvando…" : enviandoFotos ? "Aguardando fotos…" : "Salvar"}
        </button>
        <button
          type="button"
          onClick={cancelar}
          className="inline-flex min-h-11 items-center justify-center border border-grafite/25 px-6 text-sm font-bold hover:border-grafite"
        >
          Cancelar
        </button>
        {alterado && !salvando && (
          <p className="self-center text-sm text-cinza">Alterações não salvas.</p>
        )}
      </div>

      {!novo && (
        <div className="border-t border-grafite/10 pt-6">
          <p className="text-sm text-cinza">
            Prefira <strong>Arquivado</strong> para tirar de linha: a página continua no ar e os links
            divulgados não quebram. Apagar remove a criação do site de vez.
          </p>
          <div className="mt-2">
            <ConfirmarAcao
              rotulo="Apagar criação"
              pergunta={`Apagar "${criacao.title}"?`}
              onConfirmar={async () => {
                // Inclui fotos enviadas nesta edição e ainda não salvas.
                await apagarFotos([...enviadasNestaEdicao.current]);
                await apagarCriacao(criacao);
                await avisarSiteAtualizado();
                onApagado();
              }}
            />
          </div>
        </div>
      )}
    </form>
  );
}

function Campo({
  rotulo,
  ajuda,
  contador,
  children,
}: {
  rotulo: string;
  ajuda?: string;
  contador?: { atual: number; maximo: number };
  children: ReactNode;
}) {
  const perto = contador && contador.atual > contador.maximo * 0.9;
  return (
    <label className="block">
      <span className="flex items-baseline justify-between gap-4">
        <span className="font-bold">{rotulo}</span>
        {contador && (
          <span className={`font-mono text-xs ${perto ? "font-bold text-laranja-escuro" : "text-cinza"}`}>
            {contador.atual} / {contador.maximo}
          </span>
        )}
      </span>
      {children}
      {ajuda && <span className="mt-1.5 block text-sm text-cinza">{ajuda}</span>}
    </label>
  );
}
