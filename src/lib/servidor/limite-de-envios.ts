/**
 * Limite simples de envios por IP, em memória.
 *
 * Na Vercel cada instância tem a sua memória, então isto não é um bloqueio
 * absoluto: é uma barreira barata contra repetição em sequência. A proteção
 * forte contra gravações forjadas está na chave exigida por firestore.rules.
 */

const JANELA_MS = 10 * 60 * 1000;
const MAXIMO_POR_JANELA = 5;
const envios = new Map<string, number[]>();

export function permitirEnvio(ip: string, agora = Date.now()): boolean {
  const recentes = (envios.get(ip) ?? []).filter((momento) => agora - momento < JANELA_MS);
  if (recentes.length >= MAXIMO_POR_JANELA) {
    envios.set(ip, recentes);
    return false;
  }
  recentes.push(agora);
  envios.set(ip, recentes);

  // Evita crescer sem fim numa instância que fique muito tempo no ar.
  if (envios.size > 5000) envios.clear();
  return true;
}
