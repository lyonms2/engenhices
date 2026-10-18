"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from "react";
import { comprimirImagem } from "@/lib/encomendas/comprimir-imagem";
import { enviarArquivo3d } from "@/lib/encomendas/enviar-arquivo-3d";
import {
  EXTENSOES_3D,
  LIMITES,
  MAX_BYTES_ARQUIVO_3D,
  MAX_BYTES_FOTO,
  MAX_FOTOS,
  extensaoDe,
  validarCampos,
  type ErrosEncomenda,
} from "@/lib/encomendas/validacao";
import { cn } from "@/lib/utils";
import type { CamposEncomenda } from "@/types/encomenda";

type Envio =
  | { tipo: "editando" }
  | { tipo: "enviando" }
  | { tipo: "enviado"; codigo: string | null }
  | { tipo: "falhou"; mensagem: string };

type FotoSelecionada = { arquivo: File; previa: string };

const VAZIO: CamposEncomenda = {
  nome: "",
  contato: "",
  descricao: "",
  finalidade: "",
  medidas: "",
  observacoes: "",
  linkArquivo: "",
};

function tamanhoLegivel(bytes: number): string {
  return bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

/** Arquivo 3D escolhido e, se já foi enviado ao Cloudinary, o endereço dele. */
type Arquivo3dSelecionado = { arquivo: File; enviadoEm?: string };

const campoBase =
  "mt-2 block w-full border bg-white px-3 py-2.5 text-base focus:border-grafite focus-visible:outline-2 focus-visible:outline-laranja";

/** Produto de onde o cliente veio pelo botão "Encomendar sob medida". */
export type ReferenciaDeProduto = { slug: string; titulo: string };

function textoDaReferencia(referencia: ReferenciaDeProduto): string {
  return `Quero uma versão sob medida de "${referencia.titulo}" (página: /criacoes/${referencia.slug}).\n\n`;
}

export function FormEncomenda({ referencia: referenciaInicial }: { referencia?: ReferenciaDeProduto } = {}) {
  const [referencia, setReferencia] = useState(referenciaInicial ?? null);
  // Já abre com a referência no texto, para o pedido chegar dizendo de qual produto partiu.
  const [campos, setCampos] = useState<CamposEncomenda>(() =>
    referenciaInicial ? { ...VAZIO, descricao: textoDaReferencia(referenciaInicial) } : VAZIO,
  );
  const [erros, setErros] = useState<ErrosEncomenda>({});
  const [fotos, setFotos] = useState<FotoSelecionada[]>([]);
  const [erroFotos, setErroFotos] = useState<string | null>(null);
  const [preparandoFotos, setPreparandoFotos] = useState(false);
  const [arquivo3d, setArquivo3d] = useState<Arquivo3dSelecionado | null>(null);
  const [erroArquivo, setErroArquivo] = useState<string | null>(null);
  const [progresso, setProgresso] = useState<number | null>(null);
  const [consentimento, setConsentimento] = useState(false);
  const [envio, setEnvio] = useState<Envio>({ tipo: "editando" });
  // Momento em que o formulário apareceu: robôs enviam em milissegundos.
  const inicio = useRef(0);
  const resumoRef = useRef<HTMLDivElement>(null);
  const fotosId = useId();
  const arquivoId = useId();

  useEffect(() => {
    inicio.current = Date.now();
  }, []);

  // Libera da memória as prévias que ainda existirem ao sair da página.
  const fotosAtuais = useRef(fotos);
  useEffect(() => {
    fotosAtuais.current = fotos;
  }, [fotos]);
  useEffect(() => () => fotosAtuais.current.forEach((foto) => URL.revokeObjectURL(foto.previa)), []);

  function removerFoto(indice: number) {
    URL.revokeObjectURL(fotos[indice].previa);
    setFotos((atuais) => atuais.filter((_, i) => i !== indice));
  }

  function removerReferencia() {
    if (!referencia) return;
    const prefixo = textoDaReferencia(referencia);
    setCampos((atuais) =>
      atuais.descricao.startsWith(prefixo)
        ? { ...atuais, descricao: atuais.descricao.slice(prefixo.length) }
        : atuais,
    );
    setReferencia(null);
  }

  function alterar(campo: keyof CamposEncomenda, valor: string) {
    setCampos((atuais) => ({ ...atuais, [campo]: valor }));
    if (erros[campo]) setErros((atuais) => ({ ...atuais, [campo]: undefined }));
  }

  async function escolherFotos(evento: ChangeEvent<HTMLInputElement>) {
    const escolhidas = Array.from(evento.target.files ?? []);
    evento.target.value = "";
    setErroFotos(null);
    if (fotos.length + escolhidas.length > MAX_FOTOS) {
      setErroFotos(`Envie no máximo ${MAX_FOTOS} fotos.`);
      return;
    }

    setPreparandoFotos(true);
    const prontas: FotoSelecionada[] = [];
    for (const original of escolhidas) {
      const arquivo = await comprimirImagem(original);
      if (arquivo.size > MAX_BYTES_FOTO) {
        setErroFotos(`"${original.name}" é grande demais. Tente uma foto em JPG ou uma captura de tela.`);
        continue;
      }
      prontas.push({ arquivo, previa: URL.createObjectURL(arquivo) });
    }
    setFotos((atuais) => [...atuais, ...prontas]);
    setPreparandoFotos(false);
  }

  function escolherArquivo(evento: ChangeEvent<HTMLInputElement>) {
    const escolhido = evento.target.files?.[0];
    evento.target.value = "";
    setErroArquivo(null);
    if (!escolhido) return;
    if (!extensaoDe(escolhido.name)) {
      setErroArquivo("Envie um arquivo .stl, .3mf, .obj, .step ou .stp.");
      return;
    }
    if (escolhido.size > MAX_BYTES_ARQUIVO_3D) {
      setErroArquivo(
        `O arquivo tem ${tamanhoLegivel(escolhido.size)}, e o limite é 10 MB. Cole um link para ele no campo abaixo.`,
      );
      return;
    }
    setArquivo3d({ arquivo: escolhido });
  }

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const encontrados = validarCampos(campos);
    setErros(encontrados);
    if (Object.keys(encontrados).length > 0 || !consentimento) {
      setEnvio({ tipo: "falhou", mensagem: "Confira os campos destacados." });
      resumoRef.current?.focus();
      return;
    }

    const site = (evento.currentTarget.elements.namedItem("site") as HTMLInputElement).value;

    // O arquivo 3D vai antes, direto ao Cloudinary. Se o pedido falhar depois,
    // o endereço fica guardado e o arquivo não é enviado de novo.
    let arquivoSrc = arquivo3d?.enviadoEm ?? "";
    if (arquivo3d && !arquivoSrc) {
      setEnvio({ tipo: "enviando" });
      setProgresso(0);
      try {
        arquivoSrc = await enviarArquivo3d(arquivo3d.arquivo, { inicio: inicio.current, site }, setProgresso);
        setArquivo3d({ ...arquivo3d, enviadoEm: arquivoSrc });
      } catch (falha) {
        setEnvio({ tipo: "falhou", mensagem: (falha as Error).message });
        resumoRef.current?.focus();
        return;
      } finally {
        setProgresso(null);
      }
    }

    const corpo = new FormData();
    for (const [campo, valor] of Object.entries(campos)) corpo.append(campo, valor.trim());
    if (arquivo3d && arquivoSrc) {
      corpo.append("arquivoSrc", arquivoSrc);
      corpo.append("arquivoNome", arquivo3d.arquivo.name);
    }
    for (const foto of fotos) corpo.append("fotos", foto.arquivo);
    corpo.append("consentimento", "sim");
    corpo.append("inicio", String(inicio.current));
    corpo.append("site", site);

    setEnvio({ tipo: "enviando" });
    try {
      const resposta = await fetch("/api/encomendas", { method: "POST", body: corpo });
      const dados = (await resposta.json().catch(() => ({}))) as {
        erro?: string;
        erros?: ErrosEncomenda;
        codigo?: string;
      };
      if (!resposta.ok) {
        if (dados.erros) setErros(dados.erros);
        setEnvio({ tipo: "falhou", mensagem: dados.erro ?? "Não foi possível enviar. Tente de novo." });
        resumoRef.current?.focus();
        return;
      }
      setEnvio({ tipo: "enviado", codigo: dados.codigo ?? null });
    } catch {
      setEnvio({ tipo: "falhou", mensagem: "Sem conexão. Verifique a internet e tente de novo." });
      resumoRef.current?.focus();
    }
  }

  if (envio.tipo === "enviado") {
    return (
      <div role="status" className="border-l-2 border-laranja bg-white px-6 py-8">
        <p className="font-mono text-xs tracking-wider text-laranja-escuro uppercase">Pedido recebido</p>
        <p className="mt-3 text-2xl font-extrabold">Obrigado! Sua ideia chegou à bancada.</p>
        {envio.codigo && (
          <p className="mt-5">
            <span className="block text-sm text-cinza">Número do seu pedido</span>
            <span className="mt-1 inline-block bg-grafite px-3 py-1.5 font-mono text-2xl font-medium tracking-[0.2em] text-branco select-all">
              #{envio.codigo}
            </span>
          </p>
        )}
        <p className="mt-5 leading-relaxed text-cinza">
          Vamos analisar a viabilidade e responder pelo contato que você informou
          {envio.codigo ? ", citando este número" : ""}. Se for possível fazer, enviamos o
          orçamento; nenhum valor é cobrado antes disso.
        </p>
      </div>
    );
  }

  const enviando = envio.tipo === "enviando";

  return (
    <form onSubmit={enviar} noValidate className="space-y-6">
      <div ref={resumoRef} tabIndex={-1} aria-live="polite" className="focus:outline-none">
        {envio.tipo === "falhou" && (
          <p className="border-l-2 border-red-700 bg-red-50 px-4 py-3 text-sm text-red-800">
            {envio.mensagem}
          </p>
        )}
      </div>

      {referencia && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-l-2 border-laranja bg-white px-4 py-3 text-sm">
          <p>
            <span className="block font-mono text-xs tracking-wider text-cinza uppercase">Pedido baseado em</span>
            <a href={`/criacoes/${referencia.slug}`} className="font-bold underline-offset-4 hover:underline">
              {referencia.titulo}
            </a>
          </p>
          <button
            type="button"
            onClick={removerReferencia}
            className="font-bold text-cinza underline-offset-4 hover:text-grafite hover:underline"
          >
            Remover
          </button>
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <Campo nome="nome" rotulo="Seu nome" erro={erros.nome}>
          {(props) => <input {...props} autoComplete="name" value={campos.nome} onChange={(e) => alterar("nome", e.target.value)} />}
        </Campo>
        <Campo nome="contato" rotulo="E-mail ou WhatsApp" erro={erros.contato} ajuda="Onde respondemos com a análise.">
          {(props) => <input {...props} autoComplete="email" value={campos.contato} onChange={(e) => alterar("contato", e.target.value)} />}
        </Campo>
      </div>

      <Campo nome="descricao" rotulo="O que você precisa?" erro={erros.descricao} ajuda="Descreva a peça ou o problema com as suas palavras.">
        {(props) => <textarea {...props} rows={5} value={campos.descricao} onChange={(e) => alterar("descricao", e.target.value)} />}
      </Campo>

      <Campo nome="finalidade" rotulo="Para que vai ser usada?" erro={erros.finalidade} ajuda="Onde e como: isso define o material e a resistência.">
        {(props) => <input {...props} value={campos.finalidade} onChange={(e) => alterar("finalidade", e.target.value)} />}
      </Campo>

      <Campo nome="medidas" rotulo="Medidas aproximadas" opcional erro={erros.medidas} ajuda="Comprimento, largura e altura, mesmo que estimadas.">
        {(props) => <input {...props} placeholder="Ex.: 12 × 4 × 3 cm" value={campos.medidas} onChange={(e) => alterar("medidas", e.target.value)} />}
      </Campo>

      <fieldset>
        <legend className="font-bold">
          Fotos de referência <span className="font-normal text-cinza">(opcional, até {MAX_FOTOS})</span>
        </legend>
        <p className="mt-1 text-sm text-cinza">
          Da peça quebrada, do lugar onde vai encaixar ou de algo parecido.
        </p>
        {fotos.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-3">
            {fotos.map((foto, indice) => (
              <li key={foto.previa} className="relative">
                {/* Prévia local (blob:), por isso <img> e não next/image. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={foto.previa} alt={`Foto ${indice + 1} selecionada`} className="size-24 border border-grafite/15 object-cover" />
                <button
                  type="button"
                  onClick={() => removerFoto(indice)}
                  className="absolute -top-2 -right-2 flex size-7 items-center justify-center bg-grafite text-sm font-bold text-branco"
                >
                  <span aria-hidden="true">×</span>
                  <span className="sr-only">Remover foto {indice + 1}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
        {fotos.length < MAX_FOTOS && (
          <label
            htmlFor={fotosId}
            className="mt-3 inline-flex min-h-11 cursor-pointer items-center border border-dashed border-grafite/40 bg-white px-5 text-sm font-bold hover:border-grafite has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-laranja"
          >
            {preparandoFotos ? "Preparando fotos…" : "Adicionar fotos"}
            <input
              id={fotosId}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/heic"
              multiple
              disabled={preparandoFotos}
              onChange={escolherFotos}
              className="sr-only"
            />
          </label>
        )}
        {erroFotos && (
          <p role="alert" className="mt-2 text-sm text-red-800">
            {erroFotos}
          </p>
        )}
      </fieldset>

      <fieldset>
        <legend className="font-bold">
          Arquivo 3D <span className="font-normal text-cinza">(opcional)</span>
        </legend>
        <p className="mt-1 text-sm text-cinza">
          Se você já tem o modelo da peça: {EXTENSOES_3D.map((extensao) => `.${extensao}`).join(", ")}, até 10 MB.
        </p>

        {arquivo3d ? (
          <div className="mt-3 flex flex-wrap items-center gap-3 border border-grafite/15 bg-white px-4 py-3">
            <span aria-hidden="true" className="font-mono text-xs font-medium tracking-wider text-laranja-escuro uppercase">
              {extensaoDe(arquivo3d.arquivo.name)}
            </span>
            <span className="min-w-0 flex-1 truncate text-sm font-bold">{arquivo3d.arquivo.name}</span>
            <span className="text-sm text-cinza">{tamanhoLegivel(arquivo3d.arquivo.size)}</span>
            {progresso === null && (
              <button
                type="button"
                onClick={() => setArquivo3d(null)}
                className="text-sm font-bold text-red-800 underline-offset-4 hover:underline"
              >
                Remover
              </button>
            )}
            {progresso !== null && (
              <div
                role="progressbar"
                aria-label="Envio do arquivo 3D"
                aria-valuenow={progresso}
                aria-valuemin={0}
                aria-valuemax={100}
                className="h-1.5 w-full bg-grafite/10"
              >
                <div className="h-full bg-laranja transition-[width]" style={{ width: `${progresso}%` }} />
              </div>
            )}
          </div>
        ) : (
          <label
            htmlFor={arquivoId}
            className="mt-3 inline-flex min-h-11 cursor-pointer items-center border border-dashed border-grafite/40 bg-white px-5 text-sm font-bold hover:border-grafite has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-laranja"
          >
            Escolher arquivo 3D
            <input
              id={arquivoId}
              type="file"
              accept={EXTENSOES_3D.map((extensao) => `.${extensao}`).join(",")}
              onChange={escolherArquivo}
              className="sr-only"
            />
          </label>
        )}
        {erroArquivo && (
          <p role="alert" className="mt-2 text-sm text-red-800">
            {erroArquivo}
          </p>
        )}

        <div className="mt-5">
          <Campo
            nome="linkArquivo"
            rotulo="Ou um link para o arquivo"
            opcional
            erro={erros.linkArquivo}
            ajuda="Para arquivos maiores: Google Drive, Dropbox, Printables, Thingiverse. Deixe o link aberto para quem tiver o endereço."
          >
            {(props) => (
              <input
                {...props}
                type="url"
                inputMode="url"
                placeholder="https://"
                value={campos.linkArquivo}
                onChange={(e) => alterar("linkArquivo", e.target.value)}
              />
            )}
          </Campo>
        </div>
      </fieldset>

      <Campo nome="observacoes" rotulo="Observações" opcional erro={erros.observacoes} ajuda="Prazo desejado, cor, quantidade ou outro detalhe.">
        {(props) => <textarea {...props} rows={3} value={campos.observacoes} onChange={(e) => alterar("observacoes", e.target.value)} />}
      </Campo>

      {/* Campo-armadilha para robôs: fora da tela e fora da navegação por teclado. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Não preencha este campo
          <input type="text" name="site" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>

      <label className="flex items-start gap-3 text-sm">
        <input
          type="checkbox"
          checked={consentimento}
          onChange={(e) => setConsentimento(e.target.checked)}
          aria-invalid={envio.tipo === "falhou" && !consentimento}
          className="mt-0.5 size-5 shrink-0 accent-laranja"
        />
        <span className={cn(envio.tipo === "falhou" && !consentimento && "text-red-800")}>
          Concordo que a Engenhices use estes dados apenas para analisar e responder a este pedido.
        </span>
      </label>

      <button
        type="submit"
        disabled={enviando || preparandoFotos}
        className="inline-flex min-h-12 w-full items-center justify-center bg-laranja px-6 text-base font-bold text-grafite transition-colors hover:bg-[#ff7f22] disabled:opacity-60 sm:w-auto"
      >
        {progresso !== null
          ? `Enviando arquivo 3D… ${progresso}%`
          : enviando
            ? "Enviando…"
            : "Enviar pedido de orçamento"}
      </button>
    </form>
  );
}

type PropsDoControle = {
  id: string;
  name: string;
  required: boolean;
  maxLength: number;
  "aria-invalid": boolean;
  "aria-describedby"?: string;
  className: string;
};

function Campo({
  nome,
  rotulo,
  ajuda,
  erro,
  opcional = false,
  children,
}: {
  nome: keyof CamposEncomenda;
  rotulo: string;
  ajuda?: string;
  erro?: string;
  opcional?: boolean;
  children: (props: PropsDoControle) => ReactNode;
}) {
  const id = useId();
  const descricoes = [ajuda && `${id}-ajuda`, erro && `${id}-erro`].filter(Boolean).join(" ");

  return (
    <div>
      <label htmlFor={id} className="font-bold">
        {rotulo} {opcional && <span className="font-normal text-cinza">(opcional)</span>}
      </label>
      {children({
        id,
        name: nome,
        required: !opcional,
        maxLength: LIMITES[nome].max,
        "aria-invalid": Boolean(erro),
        "aria-describedby": descricoes || undefined,
        className: cn(campoBase, erro ? "border-red-700" : "border-grafite/20"),
      })}
      {ajuda && (
        <p id={`${id}-ajuda`} className="mt-1.5 text-sm text-cinza">
          {ajuda}
        </p>
      )}
      {erro && (
        <p id={`${id}-erro`} className="mt-1.5 text-sm font-bold text-red-800">
          {erro}
        </p>
      )}
    </div>
  );
}
