"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { motion } from "motion/react";
import { Logo } from "@/components/logo";
import { NAV_LINKS } from "@/lib/site";

const SCROLL_THRESHOLD = 60;
const MOBILE_QUERY = "(max-width: 820px)";

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

// En-tête fixe (cahier 6.1, prototype .hdr) : transparent sur l'accueil puis
// opaque avec flou après 60 px de défilement, opaque sur les autres pages.
// Sur mobile (820 px et moins), menu plein écran.
// L'adresse est lue dans une frontière Suspense (layout du site) : sur une
// route dynamique (fiche projet), la coquille régénérée à l'exécution ne la
// connaît pas encore (audit 2, D89).
export function SiteHeader() {
  return <HeaderContent pathname={usePathname()} />;
}

/** Même en-tête sans lien actif, le temps de lire l'adresse. */
export function SiteHeaderFallback() {
  return <HeaderContent pathname={null} />;
}

function HeaderContent({ pathname: currentPath }: { pathname: string | null }) {
  const pathname = currentPath ?? "";
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const isHome = pathname === "/";
  const solid = !isHome || scrolled;

  const close = useCallback((restoreFocus: boolean) => {
    setOpen(false);
    if (restoreFocus) buttonRef.current?.focus();
  }, []);

  // Suivi du défilement, seulement utile sur l'accueil.
  useEffect(() => {
    if (!isHome) return;
    const onScroll = () => setScrolled(window.scrollY > SCROLL_THRESHOLD);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  // Fermeture du menu à chaque changement de page.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  // Menu ouvert : défilement bloqué, reste de la page inerte, focus piégé
  // dans l'en-tête, fermeture par Échap, fermeture si l'écran s'élargit.
  useEffect(() => {
    if (!open) return;
    const header = headerRef.current;
    if (!header) return;

    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = "hidden";

    const siblings = Array.from(header.parentElement?.children ?? []).filter(
      (el): el is HTMLElement =>
        el !== header &&
        el instanceof HTMLElement &&
        !["SCRIPT", "NOSCRIPT", "TEMPLATE"].includes(el.tagName),
    );
    siblings.forEach((el) => el.setAttribute("inert", ""));

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close(true);
        return;
      }
      if (event.key !== "Tab") return;
      const focusables = Array.from(
        header.querySelectorAll<HTMLElement>("a[href], button:not([disabled])"),
      ).filter((el) => el.offsetParent !== null);
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    const media = window.matchMedia(MOBILE_QUERY);
    const onMediaChange = () => {
      if (!media.matches) close(false);
    };

    document.addEventListener("keydown", onKeyDown);
    media.addEventListener("change", onMediaChange);
    return () => {
      root.style.overflow = previousOverflow;
      siblings.forEach((el) => el.removeAttribute("inert"));
      document.removeEventListener("keydown", onKeyDown);
      media.removeEventListener("change", onMediaChange);
    };
  }, [open, close]);

  return (
    <header
      ref={headerRef}
      className={`fixed inset-x-0 top-0 z-40 border-b py-5 transition-[background-color,border-color] duration-300 ${
        open
          ? // Pas de flou quand le menu est ouvert : backdrop-filter ferait du
            // header le repère du menu en position fixe, qui ne couvrirait plus l'écran.
            "border-line bg-bg"
          : solid
            ? "border-line bg-[rgba(10,16,19,0.92)] backdrop-blur-[14px]"
            : "border-transparent bg-transparent"
      }`}
    >
      <div className="wrap flex items-center justify-between gap-6">
        <Link
          href="/"
          aria-label="MANA PROD, accueil"
          className="relative z-10 block w-[clamp(150px,13vw,196px)] shrink-0 text-text"
        >
          <Logo width="100%" />
        </Link>

        <nav aria-label="Navigation principale" className="hidden min-[821px]:block">
          <ul className="flex items-center gap-[clamp(22px,3vw,48px)] text-[15px] font-medium">
            {NAV_LINKS.map((link) => {
              const active = isActive(pathname, link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={`inline-flex min-h-11 items-center border-b transition-colors duration-200 ${
                      active
                        ? "border-teal text-text"
                        : "border-transparent text-muted hover:text-text"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <button
          ref={buttonRef}
          type="button"
          aria-expanded={open}
          aria-controls="menu-mobile"
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          onClick={() => setOpen((value) => !value)}
          className="relative z-10 grid size-11 place-items-center border border-line text-text min-[821px]:hidden"
        >
          {open ? <X size={22} strokeWidth={1.8} /> : <Menu size={22} strokeWidth={1.8} />}
        </button>
      </div>

      <motion.nav
        id="menu-mobile"
        aria-label="Navigation principale"
        hidden={!open}
        initial={false}
        animate={{ opacity: open ? 1 : 0 }}
        transition={{ duration: 0.25 }}
        data-reveal=""
        className="fixed inset-0 h-svh bg-bg px-[clamp(20px,4vw,64px)] min-[821px]:hidden"
      >
        <ul className="flex h-full flex-col items-start justify-center gap-[22px] overflow-y-auto py-24">
          {NAV_LINKS.map((link) => {
            const active = isActive(pathname, link.href);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  onClick={() => setOpen(false)}
                  className={`inline-flex min-h-11 items-center border-b text-[clamp(34px,10vw,52px)] leading-none font-extrabold tracking-[-0.03em] ${
                    active ? "border-teal text-text" : "border-transparent text-muted hover:text-text"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </motion.nav>
    </header>
  );
}
