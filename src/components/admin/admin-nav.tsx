"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Camera, Film, FolderOpen, Mail, Settings, UserRound, Users } from "lucide-react";

// Onglets du dashboard (prototype .adm__side), dans l'ordre du cahier.
// Navigation latérale, horizontale sous 1000 px. L'onglet Messages porte le
// nombre de messages à traiter.
const TABS = [
  { href: "/admin/showreel", label: "Showreel", Icon: Film },
  { href: "/admin/projets", label: "Projets", Icon: FolderOpen },
  { href: "/admin/clients", label: "Clients", Icon: Users },
  { href: "/admin/equipe", label: "Équipe", Icon: UserRound },
  { href: "/admin/coulisses", label: "Coulisses", Icon: Camera },
  { href: "/admin/reglages", label: "Réglages", Icon: Settings },
  { href: "/admin/messages", label: "Messages", Icon: Mail },
];

export function AdminNav({ unhandled }: { unhandled: number }) {
  return <NavList pathname={usePathname()} unhandled={unhandled} />;
}

/** Même navigation sans onglet actif ni compteur (repli pendant la lecture). */
export function AdminNavFallback() {
  return <NavList pathname={null} unhandled={0} />;
}

function NavList({ pathname, unhandled }: { pathname: string | null; unhandled: number }) {
  return (
    <nav
      aria-label="Dashboard"
      className="flex flex-row flex-wrap gap-1 border-b border-line bg-bg-2 px-[clamp(20px,4vw,64px)] py-3 min-[1000px]:flex-col min-[1000px]:border-r min-[1000px]:border-b-0 min-[1000px]:px-4 min-[1000px]:py-6"
    >
      {TABS.map(({ href, label, Icon }) => {
        const current = pathname !== null && (pathname === href || pathname.startsWith(`${href}/`));
        return (
          <Link
            key={href}
            href={href}
            aria-current={pathname === href ? "page" : current ? "true" : undefined}
            className={`flex min-h-11 items-center gap-3 px-3.5 py-[13px] text-[15px] leading-none font-medium no-underline transition-colors min-[1000px]:w-full ${
              current ? "bg-bg-3 text-teal" : "text-muted hover:bg-bg-3 hover:text-text"
            }`}
          >
            <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
            {label}
            {href === "/admin/messages" && unhandled > 0 ? (
              <span className="ml-auto inline-grid min-w-6 place-items-center bg-teal px-1.5 py-1 text-xs font-bold text-ink">
                {unhandled}
                <span className="sr-only"> à traiter</span>
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
