import { describe, expect, it } from "vitest";
import { acknowledgementEmail, notificationEmail } from "./emails";
import { escapeHtml, escapeMultiline } from "./escape";
import { clientIp, deriveIpHashKey, hashIp } from "./ip-hash";
import { PURGE_AFTER_MS, RATE_LIMIT, RATE_WINDOW_MS, isRateLimited } from "./rate-limit";
import { isHoneypotFilled, parseContact } from "./schema";

const valid = {
  name: "  Awa   Diop ",
  organization: "",
  email: " awa@exemple.sn ",
  projectType: "Documentaire",
  desiredDate: "",
  message: "Bonjour,\r\n\r\n\r\n\r\nNous préparons un documentaire sur la pêche.   ",
};

describe("parseContact", () => {
  it("accepte un envoi valide et retire les espaces superflus", () => {
    const r = parseContact(valid);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.data).toEqual({
      name: "Awa Diop",
      email: "awa@exemple.sn",
      projectType: "Documentaire",
      message: "Bonjour,\n\nNous préparons un documentaire sur la pêche.",
    });
  });

  it("signale les trois champs obligatoires manquants", () => {
    const r = parseContact({});
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(Object.keys(r.errors).sort()).toEqual(["email", "message", "name"]);
    expect(r.errors.name).toBe("Indiquez votre nom.");
    expect(r.errors.email).toBe("Indiquez votre adresse email.");
    expect(r.errors.message).toBe("Décrivez votre projet en quelques lignes.");
  });

  it("refuse un email invalide, un message trop court ou trop long", () => {
    const r = parseContact({ ...valid, email: "awa@", message: "Trop court" });
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.errors.email).toContain("adresse email valide");
    expect(r.errors.message).toBe("Décrivez votre projet en au moins 20 caractères.");
    const long = parseContact({ ...valid, message: "a".repeat(5001) });
    expect(long.ok).toBe(false);
  });

  it("applique les longueurs maximales", () => {
    const r = parseContact({
      ...valid,
      name: "n".repeat(121),
      organization: "o".repeat(161),
      desiredDate: "d".repeat(61),
      email: `${"e".repeat(250)}@x.sn`,
    });
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(Object.keys(r.errors).sort()).toEqual(["desiredDate", "email", "name", "organization"]);
  });

  it("accepte « Autre » et refuse un type hors liste", () => {
    expect(parseContact({ ...valid, projectType: "Autre" }).ok).toBe(true);
    const r = parseContact({ ...valid, projectType: "Clip musical" });
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.errors.projectType).toBe("Choisissez un type de projet dans la liste.");
  });

  it("ignore les champs inconnus", () => {
    const r = parseContact({ ...valid, admin: "oui" });
    expect(r.ok && "admin" in r.data).toBe(false);
  });
});

describe("isHoneypotFilled", () => {
  it("détecte le champ piège rempli", () => {
    expect(isHoneypotFilled({ website: "http://spam.example" })).toBe(true);
    expect(isHoneypotFilled({ website: "   " })).toBe(false);
    expect(isHoneypotFilled({})).toBe(false);
  });
});

describe("empreinte de l'adresse IP", () => {
  const key = deriveIpHashKey("secret-serveur");

  it("est stable, hexadécimale et ne contient pas l'IP", () => {
    const h = hashIp("196.207.10.20", key);
    expect(h).toMatch(/^[0-9a-f]{64}$/);
    expect(h).toBe(hashIp(" 196.207.10.20 ", key));
    expect(h).not.toContain("196");
  });

  it("dépend de l'IP et du secret", () => {
    expect(hashIp("196.207.10.20", key)).not.toBe(hashIp("196.207.10.21", key));
    expect(hashIp("196.207.10.20", key)).not.toBe(
      hashIp("196.207.10.20", deriveIpHashKey("autre-secret")),
    );
  });

  it("lit la première valeur de x-forwarded-for, puis x-real-ip", () => {
    expect(clientIp(new Headers({ "x-forwarded-for": "41.82.1.2, 10.0.0.1" }))).toBe("41.82.1.2");
    expect(clientIp(new Headers({ "x-real-ip": "41.82.1.3" }))).toBe("41.82.1.3");
    expect(clientIp(new Headers())).toBe("inconnue");
  });
});

describe("échappement HTML", () => {
  it("neutralise les balises et attributs", () => {
    expect(escapeHtml(`<script>alert("x")</script> & 'y'`)).toBe(
      "&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt; &amp; &#39;y&#39;",
    );
    expect(escapeMultiline("a<b>\nc")).toBe("a&lt;b&gt;<br>c");
  });
});

describe("emails", () => {
  const data = {
    name: "Awa <b>Diop</b>",
    email: "awa@exemple.sn",
    message: "Bonjour <img src=x onerror=alert(1)>\nDeuxième ligne",
  };

  it("notification : tous les champs, valeurs échappées, objet attendu", () => {
    const mail = notificationEmail({ ...data, projectType: "Documentaire" });
    expect(mail.subject).toBe("Nouvelle demande : Awa <b>Diop</b> (Documentaire)");
    expect(mail.html).not.toContain("<img");
    expect(mail.html).not.toContain("<b>Diop");
    expect(mail.html).toContain("&lt;img src=x onerror=alert(1)&gt;<br>Deuxième ligne");
    expect(mail.text).toContain("Message :\nBonjour <img src=x onerror=alert(1)>\nDeuxième ligne");
    expect(mail.text).toContain("Organisation : Non précisée");
    expect(notificationEmail(data).subject).toBe("Nouvelle demande : Awa <b>Diop</b> (type non précisé)");
  });

  it("accusé de réception : salutation, promesse, téléphone, jamais le message", () => {
    const mail = acknowledgementEmail({
      name: data.name,
      replyPromise: "Réponse sous 24h",
      phone: "+221 78 011 43 08",
    });
    expect(mail.text).toContain("Bonjour Awa <b>Diop</b>,");
    expect(mail.html).toContain("Bonjour Awa &lt;b&gt;Diop&lt;/b&gt;,");
    expect(mail.text).toContain("Réponse sous 24h.");
    expect(mail.text).toContain("+221 78 011 43 08");
    for (const content of [mail.html, mail.text]) {
      expect(content).not.toContain("Deuxième ligne");
      expect(content).not.toContain("awa@exemple.sn");
    }
  });

  it("accusé de réception sans promesse ni téléphone", () => {
    const mail = acknowledgementEmail({ name: "Awa", replyPromise: null, phone: null });
    expect(mail.text).not.toContain("appeler");
    expect(mail.text).toContain("elle nous est bien parvenue.\n");
  });
});

describe("limitation des envois", () => {
  it("accepte jusqu'à 5 envois par heure, refuse le 6e", () => {
    expect(RATE_LIMIT).toBe(5);
    expect(RATE_WINDOW_MS).toBe(3_600_000);
    for (let recent = 0; recent < 5; recent++) expect(isRateLimited(recent)).toBe(false);
    expect(isRateLimited(5)).toBe(true);
    expect(isRateLimited(12)).toBe(true);
  });

  it("purge les envois de plus de 24 heures", () => {
    expect(PURGE_AFTER_MS).toBe(86_400_000);
  });
});
