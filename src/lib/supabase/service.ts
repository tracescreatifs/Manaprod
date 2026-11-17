import "server-only";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseEnv, missingVariableError } from "@/lib/env";
import { deriveIpHashKey } from "@/lib/contact/ip-hash";
import type { Database } from "@/types/database";

// Client Supabase avec la clé service : contourne la RLS. Seul usage :
// formulaire de contact (insertion des messages et limitation des envois).
// Serveur uniquement (server-only), jamais dans une fonction "use cache".
// C'est le seul fichier qui lit SUPABASE_SERVICE_ROLE_KEY.

function serviceRoleKey(): string {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw missingVariableError("SUPABASE_SERVICE_ROLE_KEY");
  return key;
}

export function createServiceClient() {
  const { url } = getSupabaseEnv();
  return createClient<Database>(url, serviceRoleKey(), {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

/** Clé de l'empreinte des adresses IP, dérivée de la clé service (D62). */
export function ipHashKey(): Buffer {
  return deriveIpHashKey(serviceRoleKey());
}
