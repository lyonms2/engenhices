/**
 * Interpreta o campo "E-mail ou WhatsApp" de uma encomenda para montar o
 * atalho de resposta no /admin.
 */

export type Contato =
  | { tipo: "whatsapp"; numero: string }
  | { tipo: "email"; email: string }
  | { tipo: "desconhecido" };

export function analisarContato(texto: string): Contato {
  const email = texto.match(/[^\s@<>()]+@[^\s@<>()]+\.[a-z]{2,}/i)?.[0];
  if (email) return { tipo: "email", email };

  const digitos = texto.replace(/\D/g, "");
  // Brasil: DDD + número (10 ou 11 dígitos), com ou sem o 55 na frente.
  if (digitos.length === 10 || digitos.length === 11) {
    return { tipo: "whatsapp", numero: `55${digitos}` };
  }
  if (digitos.length === 12 || digitos.length === 13) {
    return { tipo: "whatsapp", numero: digitos };
  }
  return { tipo: "desconhecido" };
}

function primeiroNome(nome: string): string {
  return nome.trim().split(/\s+/)[0] ?? "";
}

/** Mensagem inicial da resposta, já com o número do pedido. */
export function mensagemDeResposta(nome: string, codigo: string): string {
  const saudacao = primeiroNome(nome) ? `Olá, ${primeiroNome(nome)}!` : "Olá!";
  return `${saudacao} Aqui é da Engenhices, sobre o seu pedido de orçamento #${codigo}. `;
}

export function linkWhatsApp(numero: string, mensagem: string): string {
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
}

export function linkEmail(email: string, codigo: string, mensagem: string): string {
  const assunto = `Engenhices — pedido de orçamento #${codigo}`;
  return `mailto:${email}?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(mensagem)}`;
}
