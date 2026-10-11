import { revalidateTag } from "next/cache";
import { verificarAdmin } from "@/lib/servidor/verificar-admin";

/**
 * Chamado pelo /admin depois de salvar ou apagar uma criação: descarta o
 * cache das criações para que a próxima visita já mostre a versão nova.
 */
export async function POST(request: Request) {
  if (!(await verificarAdmin(request))) {
    return Response.json({ erro: "Não autorizado." }, { status: 401 });
  }
  revalidateTag("criacoes", { expire: 0 });
  return Response.json({ ok: true });
}
