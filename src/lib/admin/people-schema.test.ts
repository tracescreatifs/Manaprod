import { describe, expect, it } from "vitest";
import { clientSchema, teamMemberSchema, TEAM_LIMITS, validate } from "./schemas";

describe("clientSchema", () => {
  it("exige un nom et le nettoie", () => {
    expect(validate(clientSchema, { name: "  UNICEF " })).toEqual({ ok: true, data: { name: "UNICEF" } });
    const r = validate(clientSchema, { name: "  " });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.name).toBe("Indiquez le nom du client.");
  });
});

describe("teamMemberSchema", () => {
  it("rend facultatifs le titre et la présentation", () => {
    const r = validate(teamMemberSchema, { name: "Babou", role: "", bio: " " });
    expect(r).toEqual({ ok: true, data: { name: "Babou", role: null, bio: null } });
  });
  it("réduit la présentation à une ligne et limite sa longueur", () => {
    const r = validate(teamMemberSchema, { name: "Sidy", role: "Motion designer", bio: "Ligne 1\nLigne 2" });
    expect(r.ok && r.data.bio).toBe("Ligne 1 Ligne 2");
    const long = validate(teamMemberSchema, { name: "Sidy", role: "", bio: "a".repeat(TEAM_LIMITS.bio + 1) });
    expect(long.ok).toBe(false);
    if (!long.ok) expect(long.errors.bio).toMatch(/300 caractères/);
  });
});
