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

function pasta(publicId: string): string {
  return publicId.includes("/encomendas/") ? "Pedido" : "Criação";
}

/**
 * Encontra e apaga fotos do Cloudinary que nenhuma criação ou pedido usa
 * (sobras de edições abandonadas). Mostra as fotos antes de apagar.
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
      <h2 className="text-2xl font-extrabold">Fotos não usadas</h2>
      <p className="mt-2 text-sm leading-relaxed text-cinza">
        Procura no Cloudinary fotos que nenhuma criação ou pedido usa, como as de uma edição
        fechada sem salvar. Fotos enviadas nas últimas 24 horas não entram, porque podem estar
        numa edição em andamento.
      </p>

      {estado.tipo !== "resultado" && (
        <button
          type="button"
          onClick={() => void verificar()}
          disabled={estado.tipo === "verificando"}
          className="mt-6 inline-flex min-h-11 items-center bg-laranja px-5 text-sm font-bold text-grafite hover:bg-[#ff7f22] disabled:opacity-60"
        >
          {estado.tipo === "verificando" ? "Verificando…" : "Procurar fotos não usadas"}
        </button>
      )}

      {estado.tipo === "erro" && (
        <p role="alert" className="mt-4 text-sm text-red-800">
          {estado.mensagem} Nada foi apagado.
        </p>
      )}

      {estado.tipo === "limpo" && (
        <p role="status" className="mt-4 border-l-2 border-laranja bg-white px-4 py-3 text-sm">
          {estado.apagadas} {estado.apagadas === 1 ? "foto apagada" : "fotos apagadas"}, liberando{" "}
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
  const bytes = naoUsadas.reduce((soma, foto) => soma + foto.bytes, 0);

  return (
    <div role="status" className="mt-6">
      <p className="text-sm text-cinza">
        {total} {total === 1 ? "foto" : "fotos"} no Cloudinary
        {recentes > 0 && ` (${recentes} enviada${recentes === 1 ? "" : "s"} nas últimas 24 horas, fora da verificação)`}.
      </p>

      {naoUsadas.length === 0 ? (
        <p className="mt-4 border-l-2 border-laranja bg-white px-4 py-3 text-sm font-bold">
          Nenhuma foto sobrando. Está tudo em uso.
        </p>
      ) : (
        <>
          <p className="mt-4 font-bold">
            {naoUsadas.length} {naoUsadas.length === 1 ? "foto não usada" : "fotos não usadas"} (
            {tamanho(bytes)}):
          </p>
          <ul className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-5">
            {naoUsadas.map((foto) => (
              <li key={foto.publicId} className="text-xs text-cinza">
                <a href={foto.src} target="_blank" rel="noopener noreferrer" className="block">
                  <Image
                    src={foto.src}
                    alt={`Foto não usada enviada em ${dataCurta.format(new Date(foto.criadaEm))}`}
                    width={160}
                    height={160}
                    sizes="160px"
                    className="aspect-square w-full border border-grafite/15 bg-[#e7e3db] object-cover"
                  />
                </a>
                <span className="mt-1 block">
                  {pasta(foto.publicId)} · {dataCurta.format(new Date(foto.criadaEm))}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-5">
            <ConfirmarAcao
              rotulo={`Apagar ${naoUsadas.length} ${naoUsadas.length === 1 ? "foto" : "fotos"}`}
              pergunta={`Apagar ${naoUsadas.length} ${naoUsadas.length === 1 ? "foto não usada" : "fotos não usadas"} do Cloudinary?`}
              onConfirmar={async () => {
                await apagarFotosEmLotes(naoUsadas.map((foto) => foto.src));
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
