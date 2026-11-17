import type { Metadata } from "next";
import { Gate } from "@/components/admin/gate";
import { NewPasswordForm } from "./new-password-form";

export const metadata: Metadata = { title: "Nouveau mot de passe | MANA PROD" };

// Accessible uniquement avec la session ouverte par le lien de
// réinitialisation (contrôle dans le proxy et dans la Server Action).
export default function NewPasswordPage() {
  return (
    <Gate title="Nouveau mot de passe" intro="Choisissez votre nouveau mot de passe.">
      <NewPasswordForm />
    </Gate>
  );
}
