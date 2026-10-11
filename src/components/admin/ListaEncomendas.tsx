"use client";

import Image from "next/image";
import { useEffect, useState, type ReactNode } from "react";
import { codigoDoErro, listarEncomendas, mudarStatusEncomenda } from "@/lib/firebase/painel";
import { cn } from "@/lib/utils";
import { STATUS_ENCOMENDA, type Encomenda, type StatusEncomenda } from "@/types/encomenda";

const dataHora = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" });

const corDoStatus: Record<StatusEncomenda, string> = {
  nova: "bg-laranja text-grafite",
  "em-analise": "bg-grafite text-branco",
  "orcamento-enviado": "bg-grafite/10 text-grafite",
  concluida: "bg-grafite/10 text-cinza",
  recusada: "bg-grafite/10 text-cinza",
};

type Estado =
  | { tipo: "carregando" }
  | { tipo: "erro"; mensagem: string }
  | { tipo: "pronto"; encomendas: Encomenda[] };

export function ListaEncomendas({ onContagem }: { onContagem?: (novas: number) => void }) {
  const [estado, setEstado] = useState<Estado>({ tipo: "carregando" });
  const [aberta, setAberta] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;
    listarEncomendas()
      .then((encomendas) => {
        if (!ativo) return;
        setEstado({ tipo: "pronto", encomendas });
        onContagem?.(encomendas.filter((encomenda) => encomenda.status === "nova").length);
      })
      .catch((erro: unknown) => {
        if (!ativo) return;
        setEstado({
          tipo: "erro",
          mensagem:
            codigoDoErro(erro) === "permission-denied"
              ? "As regras do Firestore ainda não liberam a leitura de encomendas. Publique o firestore.rules atualizado."
              : "Não foi possível carregar as encomendas.",
        });
      });
    return () => {
      ativo = false;
    };
  }, [onContagem]);

  async function mudarStatus(encomenda: Encomenda, status: StatusEncomenda) {
    if (estado.tipo !== "pronto") return;
    const anteriores = estado.encomendas;
    const atualizadas = anteriores.map((item) => (item.id === encomenda.id ? { ...item, status } : item));
    setEstado({ tipo: "pronto", encomendas: atualizadas });
    onContagem?.(atualizadas.filter((item) => item.status === "nova").length);
    try {
      await mudarStatusEncomenda(encomenda.id, status);
    } catch {
      setEstado({ tipo: "pronto", encomendas: anteriores });
      window.alert("Não foi possível mudar a situação. Tente de novo.");
    }
  }

  if (estado.tipo === "carregando") return <p className="text-cinza">Carregando encomendas…</p>;
  if (estado.tipo === "erro") return <p className="text-sm text-red-800">{estado.mensagem}</p>;

  if (estado.encomendas.length === 0) {
    return (
      <p className="border border-dashed border-grafite/20 px-6 py-10 text-center text-cinza">
        Nenhum pedido de orçamento ainda.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {estado.encomendas.map((encomenda) => {
        const expandida = aberta === encomenda.id;
        return (
          <li key={encomenda.id} className="border border-grafite/10 bg-white">
            <button
              type="button"
              aria-expanded={expandida}
              onClick={() => setAberta(expandida ? null : encomenda.id)}
              className="flex w-full flex-wrap items-center gap-x-4 gap-y-2 px-4 py-4 text-left hover:bg-grafite/[0.03]"
            >
              <span
                className={cn(
                  "px-2 py-1 font-mono text-[0.68rem] tracking-wider uppercase",
                  corDoStatus[encomenda.status],
                )}
              >
                {STATUS_ENCOMENDA[encomenda.status]}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-bold">{encomenda.nome}</span>
                <span className="block truncate text-sm text-cinza">{encomenda.descricao}</span>
              </span>
              <span className="font-mono text-xs text-cinza">
                {dataHora.format(new Date(encomenda.createdAt))}
              </span>
            </button>

            {expandida && (
              <div className="space-y-5 border-t border-grafite/10 px-4 py-5 text-sm">
                <Detalhe rotulo="Contato">
                  <span className="select-all font-bold">{encomenda.contato}</span>
                </Detalhe>
                <Detalhe rotulo="O que precisa">{encomenda.descricao}</Detalhe>
                <Detalhe rotulo="Finalidade">{encomenda.finalidade}</Detalhe>
                {encomenda.medidas && <Detalhe rotulo="Medidas">{encomenda.medidas}</Detalhe>}
                {encomenda.observacoes && <Detalhe rotulo="Observações">{encomenda.observacoes}</Detalhe>}

                {encomenda.fotos.length > 0 && (
                  <Detalhe rotulo="Fotos de referência">
                    <span className="mt-1 flex flex-wrap gap-3">
                      {encomenda.fotos.map((foto, indice) => (
                        <a key={foto.src} href={foto.src} target="_blank" rel="noopener noreferrer">
                          <Image
                            src={foto.src}
                            alt={`Foto de referência ${indice + 1}`}
                            width={foto.width}
                            height={foto.height}
                            sizes="128px"
                            className="size-32 border border-grafite/15 object-cover"
                          />
                        </a>
                      ))}
                    </span>
                  </Detalhe>
                )}

                <label className="block max-w-xs">
                  <span className="font-mono text-xs tracking-wider text-cinza uppercase">Situação</span>
                  <select
                    value={encomenda.status}
                    onChange={(e) => void mudarStatus(encomenda, e.target.value as StatusEncomenda)}
                    className="mt-1 block w-full border border-grafite/20 bg-white px-3 py-2 text-base"
                  >
                    {Object.entries(STATUS_ENCOMENDA).map(([valor, nome]) => (
                      <option key={valor} value={valor}>
                        {nome}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function Detalhe({ rotulo, children }: { rotulo: string; children: ReactNode }) {
  return (
    <div>
      <p className="font-mono text-xs tracking-wider text-cinza uppercase">{rotulo}</p>
      <div className="mt-1 leading-relaxed whitespace-pre-line">{children}</div>
    </div>
  );
}
