import type { ReactNode } from "react";
import { Container } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";

type PageHeaderProps = {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
};

/** Faixa escura de abertura das páginas internas, com o h1 da página. */
export function PageHeader({ eyebrow, title, description, children }: PageHeaderProps) {
  return (
    <div className="relative bg-grafite bg-prancheta text-branco">
      <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1 bg-laranja" />
      <Container className="py-16 sm:py-24">
        <SectionHeading as="h1" tom="escuro" eyebrow={eyebrow} title={title} description={description} />
        {children}
      </Container>
    </div>
  );
}
