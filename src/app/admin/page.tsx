import type { Metadata } from "next";
import { PainelAdmin } from "@/components/admin/PainelAdmin";
import { Container } from "@/components/ui/Section";

export const metadata: Metadata = {
  title: "Administração",
  robots: { index: false, follow: false },
};

/**
 * Painel administrativo. A página em si é pública (só HTML vazio); o que
 * protege os dados é o login Google somado às regras do Firestore, que
 * recusam leitura de rascunhos e qualquer gravação fora da conta do admin.
 */
export default function AdminPage() {
  return (
    <Container className="py-12 sm:py-16">
      <p className="font-mono text-xs tracking-[0.18em] text-laranja-escuro uppercase">Engenhices</p>
      <h1 className="mt-3 mb-10 text-3xl font-extrabold tracking-tight sm:text-4xl">Administração</h1>
      <PainelAdmin />
    </Container>
  );
}
