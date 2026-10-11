"use client";

import { useState } from "react";

type ConfirmarAcaoProps = {
  /** Texto do botão inicial, ex.: "Apagar pedido". */
  rotulo: string;
  /** Pergunta exibida antes de executar. */
  pergunta: string;
  onConfirmar: () => Promise<void>;
};

/**
 * Botão de ação irreversível em dois passos: o primeiro clique só mostra a
 * pergunta; a ação acontece no "Sim". Evita apagar algo com um clique errado.
 */
export function ConfirmarAcao({ rotulo, pergunta, onConfirmar }: ConfirmarAcaoProps) {
  const [confirmando, setConfirmando] = useState(false);
  const [executando, setExecutando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function confirmar() {
    setExecutando(true);
    setErro(null);
    try {
      await onConfirmar();
    } catch (falha) {
      setErro(`${falha instanceof Error ? falha.message : "Não foi possível concluir."} Tente de novo.`);
      setExecutando(false);
    }
  }

  if (!confirmando) {
    return (
      <button
        type="button"
        onClick={() => setConfirmando(true)}
        className="inline-flex min-h-11 items-center text-sm font-bold text-red-800 underline-offset-4 hover:underline"
      >
        {rotulo}
      </button>
    );
  }

  return (
    <div role="alertdialog" aria-label={pergunta} className="border border-red-800/30 bg-red-50 px-4 py-3">
      <p className="text-sm font-bold text-red-900">{pergunta}</p>
      <p className="mt-1 text-sm text-red-900/80">Isso não pode ser desfeito.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void confirmar()}
          disabled={executando}
          autoFocus
          className="inline-flex min-h-10 items-center bg-red-800 px-4 text-sm font-bold text-white hover:bg-red-900 disabled:opacity-60"
        >
          {executando ? "Apagando…" : "Sim, apagar"}
        </button>
        <button
          type="button"
          onClick={() => setConfirmando(false)}
          disabled={executando}
          className="inline-flex min-h-10 items-center border border-grafite/25 bg-white px-4 text-sm font-bold"
        >
          Cancelar
        </button>
      </div>
      {erro && (
        <p role="alert" className="mt-2 text-sm text-red-800">
          {erro}
        </p>
      )}
    </div>
  );
}
