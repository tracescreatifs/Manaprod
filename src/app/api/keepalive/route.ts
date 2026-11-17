import { createHash, timingSafeEqual } from "node:crypto";
import { connection } from "next/server";
import { getSupabaseEnv, missingVariableError } from "@/lib/env";
import { createPublicClient } from "@/lib/supabase/public";

// Maintien de la base active (cahier 3, décision D08) : appelée par Vercel Cron
// tous les 6 jours, avec l'en-tête Authorization: Bearer CRON_SECRET.
// Jamais mise en cache, aucune donnée de la base dans la réponse.

// Comparaison à temps constant : les empreintes ont toujours la même longueur.
function sameSecret(received: string, expected: string): boolean {
  const a = createHash("sha256").update(received).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}

export async function GET(request: Request) {
  await connection();

  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return Response.json(
      { ok: false, error: missingVariableError("CRON_SECRET").message },
      { status: 500 },
    );
  }

  const authorization = request.headers.get("authorization") ?? "";
  if (!sameSecret(authorization, `Bearer ${secret}`)) {
    return new Response(null, { status: 401 });
  }

  const supabase = createPublicClient(getSupabaseEnv());
  const { error } = await supabase.from("site_settings").select("id").limit(1);
  if (error) {
    console.error(`[MANA PROD] Keepalive : lecture de la base impossible (${error.message}).`);
    return Response.json(
      { ok: false, error: "Lecture de la base impossible, voir les logs." },
      { status: 500 },
    );
  }

  return Response.json({ ok: true, at: new Date().toISOString() });
}
