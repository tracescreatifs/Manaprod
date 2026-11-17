import { Suspense } from "react";
import type { Metadata } from "next";
import { Gate, GateNotice } from "@/components/admin/gate";
import { ForgotForm } from "./forgot-form";

export const metadata: Metadata = { title: "Mot de passe oublié | MANA PROD" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

async function LinkNotice({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  if (params.lien === "invalide" || params.lien === "expire") {
    return (
      <GateNotice tone="error">
        Ce lien de réinitialisation n’est plus valide : il a expiré ou a déjà été utilisé. Demandez un nouveau lien
        ci-dessous.
      </GateNotice>
    );
  }
  return null;
}

export default function ForgotPasswordPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <Gate
      title="Mot de passe oublié"
      intro="Indiquez votre adresse email : vous recevrez un lien pour choisir un nouveau mot de passe."
    >
      <Suspense fallback={null}>
        <LinkNotice searchParams={searchParams} />
      </Suspense>
      <ForgotForm />
    </Gate>
  );
}
