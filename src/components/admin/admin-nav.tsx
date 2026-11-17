"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Film, Settings } from "lucide-react";

// Onglets du dashboard (prototype .adm__side) : uniquement ceux qui
// existent. Navigation latérale, horizontale sous 1000 px.
const TABS = [
  { href: "/admin/showreel", label: "Showreel", Icon: Film },
  { href: "/admin/reglages", label: "Réglages", Icon: Settings },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Dashboard"
      className="flex flex-row flex-wrap gap-1 border-b border-line bg-bg-2 px-[clamp(20px,4vw,64px)] py-3 min-[1000px]:flex-col min-[1000px]:border-r min-[1000px]:border-b-0 min-[1000px]:px-4 min-[1000px]:py-6"
    >
      {TABS.map(({ href, label, Icon }) => {
        const current = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            aria-current={current ? "page" : undefined}
            className={`flex min-h-11 items-center gap-3 px-3.5 py-[13px] text-[15px] leading-none font-medium no-underline transition-colors min-[1000px]:w-full ${
              current ? "bg-bg-3 text-teal" : "text-muted hover:bg-bg-3 hover:text-text"
            }`}
          >
            <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
