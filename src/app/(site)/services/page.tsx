import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { ContactCta } from "@/components/contact-cta";
import { Reveal } from "@/components/motion/reveal";
import { SectionRow } from "@/components/section-row";
import { METHOD_STEPS, SERVICES, SERVICES_INTRO, WHY_MANA_PROD } from "@/content/marque";
import { getSiteSettings } from "@/lib/data/settings";

export const metadata: Metadata = pageMetadata({
  title: "Services | Mana Prod",
  description:
    "Production vidéo, motion design, photographie, communication digitale, captation et événementiel, drone et direction artistique, depuis Dakar.",
  path: "/services",
});

// Page Services (cahier 6.5, prototype) : services, méthode, arguments.
export default async function ServicesPage() {
  const settings = await getSiteSettings();

  return (
    <>
      <main className="wrap pt-[clamp(128px,14vw,210px)] pb-[clamp(72px,10vw,150px)]">
        <h1 className="text-[clamp(40px,6.8vw,112px)] leading-[0.98] font-extrabold tracking-[-0.035em]">
          Services
        </h1>
        <p className="mt-[clamp(24px,3vw,40px)] max-w-[34em] text-[clamp(22px,2.3vw,34px)] leading-[1.28] font-medium tracking-[-0.01em] text-pretty text-[#C5D3D6]">
          {SERVICES_INTRO}
        </p>

        <ul className="mt-[clamp(40px,5vw,72px)]">
          {SERVICES.map((service) => (
            <li key={service.title}>
              <Reveal className="group grid items-baseline gap-x-12 gap-y-2.5 border-t border-line py-[clamp(22px,2.4vw,34px)] min-[761px]:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
                {/* Titre turquoise au survol, souris seulement (Tailwind limite hover aux pointeurs qui survolent). */}
                <h2 className="text-[clamp(24px,3.2vw,46px)] leading-[1.05] font-bold tracking-[-0.025em] transition-colors duration-[250ms] group-hover:text-teal">
                  {service.title}
                </h2>
                <p className="max-w-[36ch] text-muted">{service.text}</p>
              </Reveal>
            </li>
          ))}
        </ul>
        <div className="border-t border-line" />

        <SectionRow title="Comment nous travaillons" className="mt-[clamp(56px,7vw,110px)]">
          <ol className="grid gap-7">
            {METHOD_STEPS.map((step, i) => (
              <li key={step.title} className="grid grid-cols-[44px_minmax(0,1fr)] gap-2">
                <span aria-hidden="true" className="font-bold text-teal">
                  {i + 1}
                </span>
                <div>
                  <h3 className="mb-1.5 text-xl leading-[1.05] font-bold tracking-[-0.01em]">
                    {step.title}
                  </h3>
                  <p className="max-w-[46ch] text-muted">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </SectionRow>

        <SectionRow title="Pourquoi Mana Prod">
          <ul className="grid gap-x-[clamp(28px,5vw,80px)] gap-y-9 min-[641px]:grid-cols-2">
            {WHY_MANA_PROD.map((item) => (
              <li key={item.title}>
                <h3 className="mb-2 text-xl leading-[1.05] font-bold tracking-[-0.01em]">
                  {item.title}
                </h3>
                <p className="max-w-[40ch] text-muted">{item.text}</p>
              </li>
            ))}
          </ul>
        </SectionRow>
      </main>
      <ContactCta settings={settings} />
    </>
  );
}
