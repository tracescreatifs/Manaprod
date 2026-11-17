import { Suspense } from "react";
import type { Metadata } from "next";
import { PageHead, PanelLoading } from "@/components/admin/page-head";
import { getAdminSettings } from "@/lib/admin/settings";
import { PasswordForm } from "./password-form";
import { SettingsForm } from "./settings-form";
import { StudioHeroPanel } from "./studio-hero-panel";

export const metadata: Metadata = { title: "Réglages | Dashboard MANA PROD" };

async function SettingsContent() {
  const s = await getAdminSettings();
  return (
    <>
      <SettingsForm
        initial={{
          heroTitle: s.hero_title,
          heroSub: s.hero_sub ?? "",
          phone: s.phone ?? "",
          email: s.email ?? "",
          city: s.city ?? "",
          replyPromise: s.reply_promise,
          stats: Array.isArray(s.stats) ? s.stats.map(({ value, label }) => ({ value, label })) : [],
        }}
      />
      {/* Colonne absente tant que la migration 0004 n'est pas exécutée. */}
      <StudioHeroPanel path={s.studio_hero_path ?? null} available={"studio_hero_path" in s} />
      <PasswordForm />
    </>
  );
}

export default function SettingsPage() {
  return (
    <>
      <PageHead title="Réglages" lead="Textes du hero, chiffres clés, coordonnées et photo d’ouverture du studio affichés sur le site." />
      <Suspense fallback={<PanelLoading />}>
        <SettingsContent />
      </Suspense>
    </>
  );
}
