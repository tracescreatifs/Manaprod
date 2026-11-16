import Link from "next/link";
import { cacheLife } from "next/cache";
import { Logo } from "@/components/logo";
import { CONTACT, NAV_LINKS, SIGNATURE } from "@/lib/site";

// Année courante pour la mention ©. Avec Cache Components, un appel direct à
// new Date() casserait le prérendu : l'année est calculée dans une fonction
// mise en cache et réévaluée chaque jour (décision D39).
async function CurrentYear() {
  "use cache";
  cacheLife("days");
  return <>{new Date().getFullYear()}</>;
}

const linkClass = "inline-flex min-h-11 items-center transition-colors duration-200";

// Pied de page (cahier 6.8, prototype .ftr). Aucun lien vers /admin.
export function SiteFooter() {
  return (
    <footer className="border-t border-line pt-[clamp(40px,5vw,72px)] pb-8">
      <div className="wrap">
        <div className="flex flex-wrap justify-between gap-x-16 gap-y-8">
          <div>
            <Link href="/" aria-label="MANA PROD, accueil" className="mb-[18px] block w-[180px] text-text">
              <Logo width="100%" />
            </Link>
            <p className="max-w-[24em] text-[15px] text-muted">
              Production audiovisuelle à Dakar. Films institutionnels, spots, documentaires, motion
              design et drone.
            </p>
          </div>

          <nav aria-label="Pied de page">
            <ul className="flex flex-col text-[15px]">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={`${linkClass} text-muted hover:text-text`}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="text-sm text-muted">Contact</p>
            <ul>
              <li>
                <a href={CONTACT.phoneHref} className={`${linkClass} hover:text-teal`}>
                  {CONTACT.phone}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${CONTACT.email}`}
                  className={`${linkClass} break-all hover:text-teal`}
                >
                  {CONTACT.email}
                </a>
              </li>
              <li>{CONTACT.city}</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 text-sm text-muted">
          <p className="flex flex-wrap items-center gap-x-6">
            <span>
              © <CurrentYear /> Mana Prod
            </span>
            <Link href="/mentions-legales" className={`${linkClass} hover:text-teal`}>
              Mentions légales
            </Link>
          </p>
          <p>{SIGNATURE}</p>
        </div>
      </div>
    </footer>
  );
}
