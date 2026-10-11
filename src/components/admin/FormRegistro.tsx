"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  SlugEmUsoError,
  apagarFotos,
  apagarRegistro,
  avisarSiteAtualizado,
  codigoDoErro,
  limparVideosDaCriacao,
  salvarRegistro,
  type DadosRegistro,
} from "@/lib/firebase/painel";
import { gerarSlug } from "@/lib/utils";
import type { Criacao, ImagemCriacao } from "@/types/criacao";
import {
  DESCRICAO_DOS_TIPOS,
  TIPOS_DE_REGISTRO,
  type RegistroLab,
  type StatusDoRegistro,
  type TipoDeRegistro,
} from "@/types/laboratorio";
import { Campo, campo } from "./CampoDoFormulario";
import { ConfirmarAcao } from "./ConfirmarAcao";
import { GerenciadorFotos } from "./GerenciadorFotos";

/** Valores iniciais de um registro novo (ex.: vídeos movidos de uma criação). */
export type RascunhoDeRegistro = Partial<
  Pick<RegistroLab, "title" | "type" | "summary" | "youtubeUrl" | "tiktokUrl" | "creationSlug">
> & {
  /** Slug da criação cujos campos antigos de vídeo serão esvaziados ao salvar. */
  migrarVideosDe?: string;
};

type FormRegistroProps = {
  /** Registro em edição; ausente ao criar um novo. */
  registro?: RegistroLab;
  rascunho?: RascunhoDeRegistro;
  criacoes: Criacao[];
  onSalvo: () => void;
  onCancelar: () => void;
  onApagado: () => void;
};

const SITUACOES: Record<StatusDoRegistro, string> = {
  rascunho: "Rascunho — só aparece aqui",
  publicado: "Publicado — aparece no Laboratório e na criação associada",
};

export function FormRegistro({ registro, rascunho, criacoes, onSalvo, onCancelar, onApagado }: FormRegistroProps) {
  const novo = !registro;
  const inicial = {
    title: registro?.title ?? rascunho?.title ?? "",
    type: registro?.type ?? rascunho?.type ?? ("experimento" as TipoDeRegistro),
    summary: registro?.summary ?? rascunho?.summary ?? "",
    body: registro?.body ?? "",
    youtubeUrl: registro?.youtubeUrl ?? rascunho?.youtubeUrl ?? "",
    tiktokUrl: registro?.tiktokUrl ?? rascunho?.tiktokUrl ?? "",
    creationSlug: registro?.creationSlug ?? rascunho?.creationSlug ?? "",
    status: registro?.status ?? ("rascunho" as StatusDoRegistro),
    images: registro?.images ?? ([] as ImagemCriacao[]),
  };

  const [title, setTitle] = useState(inicial.title);
  const [slug, setSlug] = useState(registro?.slug ?? "");
  const [slugEditado, setSlugEditado] = useState(false);
  const [type, setType] = useState<TipoDeRegistro>(inicial.type);
  const [summary, setSummary] = useState(inicial.summary);
  const [body, setBody] = useState(inicial.body);
  const [youtubeUrl, setYoutubeUrl] = useState(inicial.youtubeUrl);
  const [tiktokUrl, setTiktokUrl] = useState(inicial.tiktokUrl);
  const [creationSlug, setCreationSlug] = useState(inicial.creationSlug);
  const [status, setStatus] = useState<StatusDoRegistro>(inicial.status);
  const [images, setImages] = useState<ImagemCriacao[]>(inicial.images);
  const [enviandoFotos, setEnviandoFotos] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const slugFinal = novo && !slugEditado ? gerarSlug(title) : slug;

  // Fotos enviadas nesta edição: apagadas se a edição for cancelada ou se
  // forem removidas antes de salvar, para não ficarem órfãs no Cloudinary.
  const enviadasNestaEdicao = useRef(new Set<string>());
  const originais = registro?.images.map((imagem) => imagem.src) ?? [];

  function mudarFotos(novas: ImagemCriacao[]) {
    for (const imagem of novas) {
      if (!originais.includes(imagem.src)) enviadasNestaEdicao.current.add(imagem.src);
    }
    setImages(novas);
  }

  const [retratoInicial] = useState(() => JSON.stringify(inicial));
  const alterado =
    JSON.stringify({ title, type, summary, body, youtubeUrl, tiktokUrl, creationSlug, status, images }) !==
      retratoInicial || Boolean(rascunho && novo);

  useEffect(() => {
    if (!alterado || salvando) return;
    const avisar = (evento: BeforeUnloadEvent) => evento.preventDefault();
    window.addEventListener("beforeunload", avisar);
    return () => window.removeEventListener("beforeunload", avisar);
  }, [alterado, salvando]);

  function cancelar() {
    if (alterado && !window.confirm("Descartar as alterações não salvas?")) return;
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

    const dados: DadosRegistro = {
      title: title.trim(),
      slug: slugFinal,
      type,
      summary: summary.trim(),
      body: body.trim(),
      images: images.map((imagem) => ({ ...imagem, alt: imagem.alt.trim() })),
      youtubeUrl: youtubeUrl.trim() || null,
      tiktokUrl: tiktokUrl.trim() || null,
      creationSlug: creationSlug || null,
      status,
    };

    setSalvando(true);
    try {
      await salvarRegistro(dados, { novo, createdAt: registro?.createdAt });
      // Não fatal: se falhar, o site não repete o vídeo (os dois caminhos são unificados).
      if (rascunho?.migrarVideosDe) {
        await limparVideosDaCriacao(rascunho.migrarVideosDe).catch((falha) =>
          console.warn("[admin] Vídeos antigos da criação não foram esvaziados:", falha),
        );
      }

      const mantidas = dados.images.map((imagem) => imagem.src);
      const removidas = [...originais, ...enviadasNestaEdicao.current].filter((src) => !mantidas.includes(src));
      if (removidas.length > 0) {
        await apagarFotos(removidas).catch((falha) => console.warn("[admin] Fotos removidas não apagadas:", falha));
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

  const criacaoEscolhida = criacoes.find((criacao) => criacao.slug === creationSlug);

  return (
    <form onSubmit={enviar} className="space-y-6">
      <h2 className="text-2xl font-extrabold">{novo ? "Novo registro do Laboratório" : `Editar: ${registro.title}`}</h2>

      {rascunho?.migrarVideosDe && (
        <p className="border-l-2 border-laranja bg-white px-4 py-3 text-sm">
          Os vídeos de <strong>{criacaoEscolhida?.title ?? rascunho.migrarVideosDe}</strong> vieram para este
          registro. Ao salvar, eles saem do cadastro da criação e passam a ser exibidos a partir daqui, na
          página dela e no Laboratório.
        </p>
      )}

      <Campo rotulo="Título" contador={{ atual: title.length, maximo: 120 }}>
        <input required maxLength={120} value={title} onChange={(e) => setTitle(e.target.value)} className={campo} />
      </Campo>

      <Campo
        rotulo="Endereço da página"
        ajuda={novo ? "Gerado a partir do título. Não pode ser mudado depois de salvo." : "Não pode ser mudado, para não quebrar links já divulgados."}
      >
        <div className="mt-2 flex items-stretch border border-grafite/20 bg-white focus-within:border-grafite">
          <span className="flex items-center bg-grafite/5 px-3 font-mono text-sm text-cinza">/laboratorio/</span>
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

      <div className="grid gap-6 sm:grid-cols-2">
        <Campo rotulo="Tipo" ajuda={DESCRICAO_DOS_TIPOS[type]}>
          <select value={type} onChange={(e) => setType(e.target.value as TipoDeRegistro)} className={campo}>
            {Object.entries(TIPOS_DE_REGISTRO).map(([valor, nome]) => (
              <option key={valor} value={valor}>
                {nome}
              </option>
            ))}
          </select>
        </Campo>

        <Campo
          rotulo="Criação associada"
          ajuda={
            creationSlug
              ? "Os vídeos e o registro aparecem também na página desta criação."
              : "Projetos e conteúdos que ainda não viraram produto ficam sem associação."
          }
        >
          <select value={creationSlug} onChange={(e) => setCreationSlug(e.target.value)} className={campo}>
            <option value="">Nenhuma</option>
            {criacoes.map((criacao) => (
              <option key={criacao.slug} value={criacao.slug}>
                {criacao.title}
                {criacao.status === "rascunho" ? " (rascunho)" : ""}
              </option>
            ))}
          </select>
        </Campo>
      </div>

      <Campo
        rotulo="Resumo"
        ajuda="Uma ou duas frases. Aparece nos cartões e nos buscadores."
        contador={{ atual: summary.length, maximo: 300 }}
      >
        <textarea rows={2} maxLength={300} value={summary} onChange={(e) => setSummary(e.target.value)} className={campo} />
      </Campo>

      <Campo
        rotulo="Texto"
        ajuda="O que foi feito, o que deu certo, o que deu errado e o que se aprendeu. Deixe uma linha em branco entre parágrafos."
        contador={{ atual: body.length, maximo: 10000 }}
      >
        <textarea rows={10} maxLength={10000} value={body} onChange={(e) => setBody(e.target.value)} className={campo} />
      </Campo>

      <fieldset className="space-y-6 border-t border-grafite/10 pt-6">
        <legend className="font-mono text-xs tracking-wider text-cinza uppercase">Vídeos (opcionais)</legend>
        <Campo rotulo="Vídeo no YouTube" ajuda="Para Shorts, use o link /shorts/… do botão Compartilhar.">
          <input type="url" maxLength={500} value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=…" className={campo} />
        </Campo>
        <Campo rotulo="Vídeo no TikTok">
          <input type="url" maxLength={500} value={tiktokUrl} onChange={(e) => setTiktokUrl(e.target.value)} placeholder="https://www.tiktok.com/@…/video/…" className={campo} />
        </Campo>
      </fieldset>

      <GerenciadorFotos imagens={images} onChange={mudarFotos} onEnviando={setEnviandoFotos} pasta="laboratorio" />

      <Campo rotulo="Situação">
        <select value={status} onChange={(e) => setStatus(e.target.value as StatusDoRegistro)} className={campo}>
          {Object.entries(SITUACOES).map(([valor, nome]) => (
            <option key={valor} value={valor}>
              {nome}
            </option>
          ))}
        </select>
      </Campo>

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
        {alterado && !salvando && <p className="self-center text-sm text-cinza">Alterações não salvas.</p>}
      </div>

      {!novo && (
        <div className="border-t border-grafite/10 pt-6">
          <ConfirmarAcao
            rotulo="Apagar registro"
            pergunta={`Apagar "${registro.title}"?`}
            onConfirmar={async () => {
              await apagarFotos([...enviadasNestaEdicao.current]);
              await apagarRegistro(registro);
              await avisarSiteAtualizado();
              onApagado();
            }}
          />
        </div>
      )}
    </form>
  );
}
