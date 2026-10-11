"use client";

import { usePathname } from "next/navigation";
import { NavList } from "./NavList";

/**
 * NavList que marca a página atual. Fica dentro de <Suspense>: com Cache
 * Components, usePathname suspende em rotas cujo slug só é conhecido na
 * requisição, e o fallback mostra a mesma lista sem destaque.
 */
export function ActiveNavList({ orientacao }: { orientacao?: "horizontal" | "vertical" }) {
  const pathname = usePathname();
  return <NavList pathname={pathname} orientacao={orientacao} />;
}
