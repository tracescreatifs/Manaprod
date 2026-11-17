import { Symbole } from "@/components/symbole";
import { HeroBackground } from "@/components/home/hero-background";
import { ShowreelPlayer } from "@/components/home/showreel-player";

// Hero de l'accueil (cahier 6.2.1, prototype .hero). Le texte est rendu côté
// serveur et révélé en CSS (D41) : c'est l'élément LCP, aucune image ni
// iframe ne le retarde.
export function Hero({
  sub,
  title,
  showreelId,
  showreelTitle,
}: {
  sub: string | null;
  title: string | null;
  showreelId: string | null;
  showreelTitle: string;
}) {
  const words = title ? title.split(" ") : [];

  return (
    <section className="relative flex h-svh min-h-[560px] items-end overflow-hidden bg-black">
      {showreelId ? (
        <HeroBackground videoId={showreelId} />
      ) : (
        <div
          aria-hidden="true"
          className="absolute inset-0 overflow-hidden bg-[radial-gradient(120%_90%_at_80%_10%,#16262c_0%,#0d161a_55%,#0a1013_100%)]"
        >
          <span className="hero-glow absolute top-[-20%] left-[55%] size-[70vmax] bg-[radial-gradient(closest-side,rgba(46,196,207,0.28),rgba(46,196,207,0)_70%)] blur-[10px]" />
          <span className="absolute top-1/2 right-[-6vw] -translate-y-[58%] opacity-[0.06]">
            <Symbole width="min(58vw, 820px)" />
          </span>
        </div>
      )}

      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(to_top,rgba(10,16,19,0.9)_0%,rgba(10,16,19,0.15)_50%,rgba(10,16,19,0.45)_100%)]"
      />

      <div className="wrap relative flex flex-wrap items-end justify-between gap-8 pb-[clamp(32px,5vw,64px)]">
        <div className="flex min-w-0 flex-[1_1_560px] flex-col gap-[18px]">
          {sub ? <p className="hero-rise text-sm text-[#C5D3D6]">{sub}</p> : null}
          {words.length > 0 ? (
            <h1 className="max-w-[19em] text-[clamp(28px,3.9vw,60px)] leading-[1.08] font-bold tracking-[-0.025em] text-balance">
              {words.map((word, i) => (
                <span key={i}>
                  <span className="hero-word">
                    <span style={{ "--i": i } as React.CSSProperties}>{word}</span>
                  </span>
                  {i < words.length - 1 ? " " : null}
                </span>
              ))}
            </h1>
          ) : (
            <h1 className="sr-only">MANA PROD</h1>
          )}
        </div>
        {showreelId ? (
          <div className="hero-rise [animation-delay:0.2s]">
            <ShowreelPlayer videoId={showreelId} title={showreelTitle} />
          </div>
        ) : null}
      </div>
    </section>
  );
}
