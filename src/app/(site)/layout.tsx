import { Suspense, type ReactNode } from "react";
import { CursorRing } from "@/components/motion/cursor-ring";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader, SiteHeaderFallback } from "@/components/site-header";

// Mise en page du site public : en-tête, pied de page et curseur anneau (D101). Le dashboard
// (/admin) a sa propre mise en page, sans eux.
export default function SiteLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <>
      <Suspense fallback={<SiteHeaderFallback />}>
        <SiteHeader />
      </Suspense>
      {children}
      <SiteFooter />
      <CursorRing />
    </>
  );
}
