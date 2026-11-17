import { ExternalLink, LogOut } from "lucide-react";
import { logout } from "@/app/admin/actions";
import { Logo } from "@/components/logo";
import { btnLine, btnSmall } from "@/components/admin/ui";

// Barre supérieure du dashboard (prototype .adm__bar) : logo, compte
// connecté, ouverture du site dans un nouvel onglet, déconnexion.
export function AdminBar({ email }: { email: string | null }) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-line bg-bg-2 px-[clamp(20px,4vw,64px)] py-3.5">
      <Logo width={150} className="block shrink-0 text-white" />
      <div className="flex min-w-0 flex-wrap items-center gap-2.5">
        {email ? (
          <span className="min-w-0 text-sm break-all text-muted">
            <span className="sr-only">Connecté en tant que </span>
            {email}
          </span>
        ) : null}
        <a href="/" target="_blank" rel="noopener" className={`${btnLine} ${btnSmall}`}>
          <ExternalLink size={16} strokeWidth={1.8} aria-hidden="true" />
          Ouvrir le site
          <span className="sr-only"> (nouvel onglet)</span>
        </a>
        <form action={logout}>
          <button type="submit" className={`${btnLine} ${btnSmall}`}>
            <LogOut size={16} strokeWidth={1.8} aria-hidden="true" />
            Déconnexion
          </button>
        </form>
      </div>
    </header>
  );
}
