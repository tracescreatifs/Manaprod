import { describe, expect, it } from "vitest";
import {
  forgotPasswordSchema,
  loginSchema,
  newPasswordSchema,
  settingsSchema,
  showreelSchema,
  validate,
} from "./schemas";

describe("connexion", () => {
  it("accepte un email et un mot de passe", () => {
    const r = validate(loginSchema, { email: " admin@exemple.sn ", password: "secret" });
    expect(r).toEqual({ ok: true, data: { email: "admin@exemple.sn", password: "secret" } });
  });

  it("signale les champs manquants et l'email invalide", () => {
    const r = validate(loginSchema, { email: "admin@", password: "" });
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.errors.email).toContain("adresse email valide");
    expect(r.errors.password).toBe("Indiquez votre mot de passe.");
  });

  it("mot de passe oublié : email obligatoire", () => {
    expect(validate(forgotPasswordSchema, { email: "" }).ok).toBe(false);
    expect(validate(forgotPasswordSchema, { email: "a@b.sn" }).ok).toBe(true);
  });
});

describe("nouveau mot de passe", () => {
  it("exige 12 caractères et deux saisies identiques", () => {
    const short = validate(newPasswordSchema, { password: "court", confirmation: "court" });
    expect(short.ok).toBe(false);
    if (!short.ok) expect(short.errors.password).toBe("Le mot de passe doit contenir au moins 12 caractères.");

    const differ = validate(newPasswordSchema, {
      password: "un mot de passe long",
      confirmation: "un autre mot de passe",
    });
    expect(differ.ok).toBe(false);
    if (!differ.ok) expect(differ.errors.confirmation).toBe("Les deux mots de passe ne sont pas identiques.");

    expect(
      validate(newPasswordSchema, { password: "douze caract", confirmation: "douze caract" }).ok,
    ).toBe(true);
  });

  it("refuse plus de 72 caractères", () => {
    const long = "x".repeat(73);
    expect(validate(newPasswordSchema, { password: long, confirmation: long }).ok).toBe(false);
  });
});

describe("showreel", () => {
  it("extrait l'identifiant de tous les formats YouTube", () => {
    for (const url of [
      "https://youtu.be/dQw4w9WgXcQ",
      "https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=3",
      "https://www.youtube.com/shorts/dQw4w9WgXcQ",
      "dQw4w9WgXcQ",
    ]) {
      const r = validate(showreelSchema, { url, title: "Showreel 2026" });
      expect(r.ok && r.data.youtubeId).toBe("dQw4w9WgXcQ");
    }
  });

  it("titre vide : « Showreel » par défaut", () => {
    const r = validate(showreelSchema, { url: "https://youtu.be/dQw4w9WgXcQ", title: "  " });
    expect(r.ok && r.data.title).toBe("Showreel");
  });

  it("refuse un lien non YouTube ou vide avec un message clair", () => {
    const r = validate(showreelSchema, { url: "https://vimeo.com/12345", title: "" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.url).toContain("n’est pas reconnu comme une vidéo YouTube");
    const empty = validate(showreelSchema, { url: "", title: "" });
    expect(empty.ok).toBe(false);
    if (!empty.ok) expect(empty.errors.url).toBe("Collez le lien de la vidéo YouTube.");
  });
});

describe("réglages", () => {
  const valid = {
    heroTitle: " C’est toujours celui qui éclaire  qui demeure dans l’obscurité. ",
    heroSub: "Mana Prod, production audiovisuelle à Dakar",
    stats: [
      { value: "20+", label: "Réalisations" },
      { value: "24h", label: "Délai de réponse" },
    ],
    phone: "+221 78 011 43 08",
    email: "amathndiaye@manaprod.com",
    city: "",
    replyPromise: "Réponse sous 24h",
  };

  it("accepte des réglages valides, champs facultatifs vides en null", () => {
    const r = validate(settingsSchema, valid);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.data.heroTitle).toBe("C’est toujours celui qui éclaire qui demeure dans l’obscurité.");
    expect(r.data.city).toBeNull();
    expect(r.data.stats).toHaveLength(2);
  });

  it("phrase du hero et promesse de réponse obligatoires", () => {
    const r = validate(settingsSchema, { ...valid, heroTitle: "", replyPromise: " " });
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.errors.heroTitle).toBe("Indiquez la phrase du hero.");
    expect(r.errors.replyPromise).toBe("Indiquez la promesse de réponse.");
  });

  it("chiffres clés : 4 au plus, valeur et libellé obligatoires, erreurs par ligne", () => {
    const five = Array.from({ length: 5 }, () => ({ value: "1", label: "Un" }));
    const r = validate(settingsSchema, { ...valid, stats: five });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.stats).toBe("4 chiffres clés au maximum.");

    const missing = validate(settingsSchema, { ...valid, stats: [{ value: "8+", label: "" }] });
    expect(missing.ok).toBe(false);
    if (!missing.ok) expect(missing.errors["stats.0.label"]).toBe("Indiquez le libellé.");

    expect(validate(settingsSchema, { ...valid, stats: [] }).ok).toBe(true);
  });

  it("email facultatif mais valide", () => {
    expect(validate(settingsSchema, { ...valid, email: "" }).ok).toBe(true);
    const r = validate(settingsSchema, { ...valid, email: "pas-un-email" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.email).toContain("adresse email valide");
  });
});
