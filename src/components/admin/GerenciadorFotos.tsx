"use client";

import Image from "next/image";
import { useId, useState, type ChangeEvent } from "react";
import { TAMANHO_MAXIMO_MB, enviarFoto } from "@/lib/cloudinary/envio";
import type { ImagemCriacao } from "@/types/criacao";

/** Mesmo limite das regras do Firestore. */
const MAXIMO_DE_FOTOS = 12;

type GerenciadorFotosProps = {
  imagens: ImagemCriacao[];
  onChange: (imagens: ImagemCriacao[]) => void;
  /** Avisa o formulário para não salvar no meio de um envio. */
  onEnviando: (enviando: boolean) => void;
};

/**
 * Lista de fotos de uma criação. A primeira é a capa. Cada foto exige um
 * texto alternativo, lido por leitores de tela e buscadores.
 */
export function GerenciadorFotos({ imagens, onChange, onEnviando }: GerenciadorFotosProps) {
  const inputId = useId();
  const [enviando, setEnviando] = useState(0);
  const [erro, setErro] = useState<string | null>(null);

  async function selecionar(evento: ChangeEvent<HTMLInputElement>) {
    const arquivos = Array.from(evento.target.files ?? []);
    evento.target.value = "";
    if (arquivos.length === 0) return;

    const vagas = MAXIMO_DE_FOTOS - imagens.length;
    if (arquivos.length > vagas) {
      setErro(`Cabem no máximo ${MAXIMO_DE_FOTOS} fotos por criação.`);
      return;
    }

    setErro(null);
    setEnviando(arquivos.length);
    onEnviando(true);

    const novas: ImagemCriacao[] = [];
    const falhas: string[] = [];
    for (const arquivo of arquivos) {
      try {
        novas.push({ ...(await enviarFoto(arquivo)), alt: "" });
      } catch (falha) {
        falhas.push((falha as Error).message);
      }
      setEnviando((restantes) => restantes - 1);
    }

    onChange([...imagens, ...novas]);
    onEnviando(false);
    if (falhas.length > 0) setErro(falhas.join(" "));
  }

  function atualizar(indice: number, mudanca: Partial<ImagemCriacao>) {
    onChange(imagens.map((imagem, i) => (i === indice ? { ...imagem, ...mudanca } : imagem)));
  }

  function tornarCapa(indice: number) {
    const copia = [...imagens];
    const [escolhida] = copia.splice(indice, 1);
    onChange([escolhida, ...copia]);
  }

  return (
    <fieldset className="space-y-4 border-t border-grafite/10 pt-6">
      <legend className="font-mono text-xs tracking-wider text-cinza uppercase">Fotos</legend>

      {imagens.length > 0 && (
        <ul className="space-y-4">
          {imagens.map((imagem, indice) => (
            <li key={imagem.src} className="flex gap-4 border border-grafite/10 bg-white p-3">
              <Image
                src={imagem.src}
                alt=""
                width={imagem.width}
                height={imagem.height}
                sizes="96px"
                className="size-24 shrink-0 object-cover"
              />
              <div className="min-w-0 flex-1">
                {indice === 0 && (
                  <p className="mb-2 font-mono text-[0.68rem] tracking-wider text-laranja-escuro uppercase">
                    Capa
                  </p>
                )}
                <label className="block text-sm">
                  <span className="font-bold">Descrição da foto</span>
                  <input
                    required
                    maxLength={200}
                    value={imagem.alt}
                    onChange={(e) => atualizar(indice, { alt: e.target.value })}
                    placeholder="Ex.: suporte preto segurando um celular na bancada"
                    className="mt-1 block w-full border border-grafite/20 px-2 py-1.5 text-base"
                  />
                </label>
                <div className="mt-2 flex gap-4 text-sm">
                  {indice > 0 && (
                    <button type="button" onClick={() => tornarCapa(indice)} className="font-bold underline-offset-4 hover:underline">
                      Tornar capa
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onChange(imagens.filter((_, i) => i !== indice))}
                    className="font-bold text-red-800 underline-offset-4 hover:underline"
                  >
                    Remover
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {imagens.length < MAXIMO_DE_FOTOS && (
        <div>
          <label
            htmlFor={inputId}
            className="inline-flex min-h-11 cursor-pointer items-center border border-dashed border-grafite/40 px-5 text-sm font-bold hover:border-grafite has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-laranja"
          >
            {enviando > 0 ? `Enviando… (${enviando})` : "Adicionar fotos"}
            <input
              id={inputId}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif,image/heic"
              multiple
              disabled={enviando > 0}
              onChange={selecionar}
              className="sr-only"
            />
          </label>
          <p className="mt-2 text-sm text-cinza">
            JPG, PNG, WebP, AVIF ou HEIC, até {TAMANHO_MAXIMO_MB} MB cada. A primeira foto é a capa.
          </p>
        </div>
      )}

      {erro && (
        <p role="alert" className="text-sm text-red-800">
          {erro}
        </p>
      )}
    </fieldset>
  );
}
