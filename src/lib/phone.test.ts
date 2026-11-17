import { describe, expect, it } from "vitest";
import { telHref } from "./phone";

describe("telHref", () => {
  it("retire les espaces et garde le format international", () => {
    expect(telHref("+221 78 011 43 08")).toBe("tel:+221780114308");
  });

  it("retire points, tirets et parenthèses", () => {
    expect(telHref("+221 (78) 011-43.08")).toBe("tel:+221780114308");
  });

  it("ignore les espaces autour du numéro", () => {
    expect(telHref("  +221 78 011 43 08  ")).toBe("tel:+221780114308");
  });

  it("conserve un numéro sans indicatif tel quel (chiffres seuls)", () => {
    expect(telHref("78 011 43 08")).toBe("tel:780114308");
  });

  it("ne garde que le + initial", () => {
    expect(telHref("00 221+78")).toBe("tel:0022178");
  });

  it("renvoie null sans aucun chiffre", () => {
    expect(telHref("")).toBeNull();
    expect(telHref("   ")).toBeNull();
    expect(telHref("à compléter")).toBeNull();
  });
});
