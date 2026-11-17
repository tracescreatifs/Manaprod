import { Suspense } from "react";
import type { Metadata } from "next";
import { Gate, GateNotice } from "@/components/admin/gate";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Connexion | MANA PROD" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

async function LoginNotice({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  if (params.refus === "1") return <GateNotice tone="error">Accès réservé aux administrateurs</GateNotice>;
  if (params.deconnecte === "1") return <GateNotice tone="info">Vous êtes déconnecté.</GateNotice>;
  return null;
}

export default function LoginPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <Gate title="Connexion" intro="Espace réservé à l’équipe MANA PROD.">
      <Suspense fallback={null}>
        <LoginNotice searchParams={searchParams} />
      </Suspense>
      <LoginForm />
    </Gate>
  );
}
