"use client";

import Image from "next/image";
import { useState } from "react";
import {
  apagarFotosEmLotes,
  buscarFotosNaoUsadas,
  type ResultadoDaVerificacao,
} from "@/lib/firebase/painel";
import { ConfirmarAcao } from "./ConfirmarAcao";

type Estado =
  | { tipo: "inicio" }
  | { tipo: "verificando" }
  | { tipo: "erro"; mensagem: string }
  | { tipo: "resultado"; resultado: ResultadoDaVerificacao }
  | { tipo: "limpo"; apagadas: number; bytes: number };

const dataCurta = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" });

function tamanho(bytes: number): string {
  return bytes >= 1_000_000
    ? `${(bytes / 1_000_000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} MB`
    : `${Math.max(1, Math.round(bytes / 1000))} KB`;
}

function origem(publicId: string): string {
  if (publicId.includes("/encomendas-arquivos/")) return "Arquivo 3D de pedido";
  if (publicId.includes("/encomendas/")) return "Foto de pedido";
  if (publicId.includes("/laboratorio/")) return "Laboratório";
  return "Criação";
}

function plural(quantidade: number, singular: string, varios: string): string {
  return `${quantidade} ${quantidade === 1 ? singular : varios}`;
}

/**
 * Encontra e apaga fotos e arquivos 3D do Cloudinary que nenhuma criação,
 * registro do Laboratório ou pedido usa (sobras de edições abandonadas ou de
 * envios não concluídos). Mostra tudo antes de apagar.
 */
export function LimpezaFotos() {
  const [estado, setEstado] = useState<Estado>({ tipo: "inicio" });

  async function verificar() {
    setEstado({ tipo: "verificando" });
    try {
      setEstado({ tipo: "resultado", resultado: await buscarFotosNaoUsadas() });
    } catch (falha) {
      setEstado({
        tipo: "erro",
        mensagem: falha instanceof Error ? falha.message : "Não foi possível verificar as fotos.",
      });
    }
  }

  return (
    <div className="max-w-3xl">
      <h2 className="text-2xl font-extrabold">Fotos e arquivos não usados</h2>
      <p className="mt-2 text-sm leading-relaxed text-cinza">
        Procura no Cloudinary fotos e arquivos 3D que nenhuma criação, registro ou pedido usa,
        como os de uma edição fechada sem salvar ou de um pedido não concluído. O que foi
        enviado nas últimas 24 horas não entra, porque pode estar numa edição em andamento.
      </p>

      {estado.tipo !== "resultado" && (
        <button
          type="button"
          onClick={() => void verificar()}
          disabled={estado.tipo === "verificando"}
          className="mt-6 inline-flex min-h-11 items-center bg-laranja px-5 text-sm font-bold text-grafite hover:bg-[#ff7f22] disabled:opacity-60"
        >
          {estado.tipo === "verificando" ? "Verificando…" : "Procurar o que não é usado"}
        </button>
      )}

      {estado.tipo === "erro" && (
        <p role="alert" className="mt-4 text-sm text-red-800">
          {estado.mensagem} Nada foi apagado.
        </p>
      )}

      {estado.tipo === "limpo" && (
        <p role="status" className="mt-4 border-l-2 border-laranja bg-white px-4 py-3 text-sm">
          {plural(estado.apagadas, "item apagado", "itens apagados")}, liberando{" "}
          {tamanho(estado.bytes)}.
        </p>
      )}

      {estado.tipo === "resultado" && (
        <Resultado
          resultado={estado.resultado}
          onVerificarDeNovo={() => void verificar()}
          onLimpo={(apagadas, bytes) => setEstado({ tipo: "limpo", apagadas, bytes })}
        />
      )}
    </div>
  );
}

function Resultado({
  resultado,
  onVerificarDeNovo,
  onLimpo,
}: {
  resultado: ResultadoDaVerificacao;
  onVerificarDeNovo: () => void;
  onLimpo: (apagadas: number, bytes: number) => void;
}) {
  const { naoUsadas, total, recentes } = resultado;
  const bytes = naoUsadas.reduce((soma, item) => soma + item.bytes, 0);

  return (
    <div role="status" className="mt-6">
      <p className="text-sm text-cinza">
        {plural(total, "item", "itens")} no Cloudinary
        {recentes > 0 && ` (${plural(recentes, "enviado", "enviados")} nas últimas 24 horas, fora da verificação)`}.
      </p>

      {naoUsadas.length === 0 ? (
        <p className="mt-4 border-l-2 border-laranja bg-white px-4 py-3 text-sm font-bold">
          Nada sobrando. Está tudo em uso.
        </p>
      ) : (
        <>
          <p className="mt-4 font-bold">
            {plural(naoUsadas.length, "item não usado", "itens não usados")} ({tamanho(bytes)}):
          </p>
          <ul className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-5">
            {naoUsadas.map((item) => (
              <li key={`${item.tipo}:${item.publicId}`} className="text-xs text-cinza">
                <a href={item.src} target="_blank" rel="noopener noreferrer" className="block">
                  {item.tipo === "image" ? (
                    <Image
                      src={item.src}
                      alt={`Foto não usada enviada em ${dataCurta.format(new Date(item.criadoEm))}`}
                      width={160}
                      height={160}
                      sizes="160px"
                      className="aspect-square w-full border border-grafite/15 bg-[#e7e3db] object-cover"
                    />
                  ) : (
                    <span className="flex aspect-square w-full flex-col items-center justify-center gap-1 border border-grafite/15 bg-[#e7e3db] font-mono text-grafite">
                      <span className="text-sm font-medium uppercase">{item.publicId.split(".").pop()}</span>
                      <span>{tamanho(item.bytes)}</span>
                    </span>
                  )}
                </a>
                <span className="mt-1 block">
                  {origem(item.publicId)} · {dataCurta.format(new Date(item.criadoEm))}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-5">
            <ConfirmarAcao
              rotulo={`Apagar ${plural(naoUsadas.length, "item", "itens")}`}
              pergunta={`Apagar ${plural(naoUsadas.length, "item não usado", "itens não usados")} do Cloudinary?`}
              onConfirmar={async () => {
                await apagarFotosEmLotes(naoUsadas.map((item) => item.src));
                onLimpo(naoUsadas.length, bytes);
              }}
            />
          </div>
        </>
      )}

      <button
        type="button"
        onClick={onVerificarDeNovo}
        className="mt-6 text-sm font-bold underline-offset-4 hover:underline"
      >
        Verificar de novo
      </button>
    </div>
  );
}
