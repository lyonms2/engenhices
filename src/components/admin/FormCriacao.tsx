"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  SlugEmUsoError,
  apagarCriacao,
  apagarFotos,
  avisarSiteAtualizado,
  codigoDoErro,
  salvarCriacao,
  type DadosCriacao,
} from "@/lib/firebase/painel";
import { analisarTikTok, analisarYouTube, gerarSlug, plataformaDoLink } from "@/lib/utils";
import { Campo, campo } from "./CampoDoFormulario";
import { ConfirmarAcao } from "./ConfirmarAcao";
import { GerenciadorFotos } from "./GerenciadorFotos";
import {
  CATEGORIAS,
  type Categoria,
  type Criacao,
  type ImagemCriacao,
  type StatusCriacao,
} from "@/types/criacao";
import { TIPOS_DE_REGISTRO, type RegistroLab } from "@/types/laboratorio";

type FormCriacaoProps = {
  /** Criação em edição; ausente ao criar uma nova. */
  criacao?: Criacao;
  onSalvo: () => void;
  onCancelar: () => void;
  /** Chamado depois de apagar a criação em edição. */
  onApagado: () => void;
  /** Registros do Laboratório associados a esta criação. */
  registros: RegistroLab[];
  /** Abre um registro novo do Laboratório já associado a esta criação. */
  onNovoRegistro: (criacao: Criacao) => void;
  onEditarRegistro: (registro: RegistroLab) => void;
};

const STATUS: Record<StatusCriacao, string> = {
  rascunho: "Rascunho — só aparece aqui",
  publicado: "Publicado — aparece no site",
  arquivado: "Arquivado — fora de linha, página continua no ar",
};


export function FormCriacao({
  criacao,
  onSalvo,
  onCancelar,
  onApagado,
  registros,
  onNovoRegistro,
  onEditarRegistro,
}: FormCriacaoProps) {
  const novo = !criacao;
  const [title, setTitle] = useState(criacao?.title ?? "");
  const [slug, setSlug] = useState(criacao?.slug ?? "");
  const [slugEditado, setSlugEditado] = useState(false);
  const [description, setDescription] = useState(criacao?.description ?? "");
  const [category, setCategory] = useState<Categoria>(criacao?.category ?? "utilidades");
  const [status, setStatus] = useState<StatusCriacao>(criacao?.status ?? "rascunho");
  const [featured, setFeatured] = useState(criacao?.featured ?? false);
  // Vídeo de apresentação: um campo só; ao salvar, vai para youtubeUrl ou
  // tiktokUrl conforme o domínio do link.
  const [video, setVideo] = useState(criacao?.youtubeUrl ?? criacao?.tiktokUrl ?? "");
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

  const videoLimpo = video.trim() || null;
  const plataformaDoVideo = videoLimpo ? plataformaDoLink(videoLimpo) : null;
  // Link reconhecido mas sem player (ex.: vm.tiktok.com): vira botão no site.
  const videoSemPlayer =
    videoLimpo !== null &&
    plataformaDoVideo !== null &&
    !(plataformaDoVideo === "YouTube" ? analisarYouTube(videoLimpo) : analisarTikTok(videoLimpo));

  // Retrato do formulário, para saber se há alterações não salvas.
  const retrato = (valores: {
    title: string; description: string; category: Categoria; status: StatusCriacao;
    featured: boolean; video: string; mercadoLivreUrl: string;
    images: ImagemCriacao[];
  }) => JSON.stringify(valores);
  const [retratoInicial] = useState(() =>
    retrato({
      title: criacao?.title ?? "",
      description: criacao?.description ?? "",
      category: criacao?.category ?? "utilidades",
      status: criacao?.status ?? "rascunho",
      featured: criacao?.featured ?? false,
      video: criacao?.youtubeUrl ?? criacao?.tiktokUrl ?? "",
      mercadoLivreUrl: criacao?.mercadoLivreUrl ?? "",
      images: criacao?.images ?? [],
    }),
  );
  const alterado =
    retrato({ title, description, category, status, featured, video, mercadoLivreUrl, images }) !==
    retratoInicial;

  // Avisa antes de fechar ou recarregar a aba com alterações não salvas.
  useEffect(() => {
    if (!alterado || salvando) return;
    const avisar = (evento: BeforeUnloadEvent) => evento.preventDefault();
    window.addEventListener("beforeunload", avisar);
    return () => window.removeEventListener("beforeunload", avisar);
  }, [alterado, salvando]);

  /** Sai da edição sem salvar (cancelar ou ir para um registro do Lab). */
  function sair(depois: () => void) {
    if (alterado && !window.confirm("Descartar as alterações não salvas?")) return;
    // Descarta só o que foi enviado agora; as fotos já salvas continuam.
    const descartadas = [...enviadasNestaEdicao.current];
    if (descartadas.length > 0) {
      apagarFotos(descartadas).catch((falha) => console.warn("[admin] Fotos descartadas não apagadas:", falha));
    }
    depois();
  }

  const cancelar = () => sair(onCancelar);

  async function enviar(evento: FormEvent) {
    evento.preventDefault();
    setErro(null);

    if (!slugFinal) {
      setErro("Defina um título para gerar o endereço da página.");
      return;
    }
    if (videoLimpo && !plataformaDoVideo) {
      setErro("O vídeo de apresentação precisa ser um link do YouTube ou do TikTok.");
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
      youtubeUrl: plataformaDoVideo === "YouTube" ? videoLimpo : null,
      tiktokUrl: plataformaDoVideo === "TikTok" ? videoLimpo : null,
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
        <legend className="font-mono text-xs tracking-wider text-cinza uppercase">Venda e apresentação (opcionais)</legend>
        <Campo rotulo="Anúncio no Mercado Livre">
          <input type="url" maxLength={500} value={mercadoLivreUrl} onChange={(e) => setMercadoLivreUrl(e.target.value)} placeholder="https://" className={campo} />
        </Campo>
        <Campo
          rotulo="Vídeo de apresentação"
          ajuda="Um vídeo curto do produto em uso, do YouTube ou do TikTok. Aparece só na página do produto, antes dos vídeos do Laboratório."
        >
          <input
            type="url"
            maxLength={500}
            value={video}
            onChange={(e) => setVideo(e.target.value)}
            placeholder="https://www.youtube.com/shorts/… ou https://www.tiktok.com/@…/video/…"
            className={campo}
          />
        </Campo>
        {videoLimpo && !plataformaDoVideo && (
          <p className="-mt-3 text-sm font-bold text-red-800">Use um link do YouTube ou do TikTok.</p>
        )}
        {videoSemPlayer && (
          <p className="-mt-3 text-sm text-cinza">
            Este link vai aparecer como botão &ldquo;Assistir no {plataformaDoVideo}&rdquo;. Para o vídeo tocar
            na página, use o link completo do vídeo (para o TikTok: tiktok.com/@perfil/video/…).
          </p>
        )}
      </fieldset>

      <fieldset className="space-y-4 border-t border-grafite/10 pt-6">
        <legend className="font-mono text-xs tracking-wider text-cinza uppercase">Laboratório</legend>
        <p className="text-sm text-cinza">
          Testes, erros, melhorias e bastidores desta criação são registros do Laboratório. Cada
          registro associado aparece no Laboratório e aqui, na página da criação, com os vídeos dele.
        </p>

        {registros.length > 0 && (
          <ul className="divide-y divide-grafite/10 border-y border-grafite/10">
            {registros.map((registro) => (
              <li key={registro.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
                <span>
                  <span className="mr-2 font-mono text-xs tracking-wider text-laranja-escuro uppercase">
                    {TIPOS_DE_REGISTRO[registro.type]}
                  </span>
                  <span className="font-bold">{registro.title}</span>
                  {registro.status === "rascunho" && <span className="ml-2 text-cinza">(rascunho)</span>}
                  {(registro.youtubeUrl || registro.tiktokUrl) && <span className="ml-2 text-cinza">▶</span>}
                </span>
                <button
                  type="button"
                  onClick={() => sair(() => onEditarRegistro(registro))}
                  className="font-bold underline-offset-4 hover:underline"
                >
                  Editar registro
                </button>
              </li>
            ))}
          </ul>
        )}

        {criacao ? (
          <button
            type="button"
            onClick={() => sair(() => onNovoRegistro(criacao))}
            className="inline-flex min-h-10 items-center border border-grafite/25 px-4 text-sm font-bold hover:border-grafite"
          >
            Novo registro para esta criação
          </button>
        ) : (
          <p className="text-sm text-cinza">Salve a criação para poder associar registros do Laboratório a ela.</p>
        )}
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
