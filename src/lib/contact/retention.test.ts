import { describe, expect, it } from "vitest";
import { MESSAGE_RETENTION_MONTHS, retentionCutoff } from "./retention";

describe("retentionCutoff", () => {
  it("recule de 24 mois exactement", () => {
    expect(MESSAGE_RETENTION_MONTHS).toBe(24);
    expect(retentionCutoff(new Date("2026-11-17T10:30:00Z")).toISOString()).toBe("2024-11-17T10:30:00.000Z");
  });
  it("ramène un jour inexistant au dernier jour du mois", () => {
    expect(retentionCutoff(new Date("2028-02-29T00:00:00Z")).toISOString()).toBe("2026-02-28T00:00:00.000Z");
    expect(retentionCutoff(new Date("2026-03-31T12:00:00Z"), 1).toISOString()).toBe("2026-02-28T12:00:00.000Z");
  });
  it("garde un message reçu juste après la limite et efface celui reçu juste avant", () => {
    const cutoff = retentionCutoff(new Date("2026-11-17T10:30:00Z"));
    expect(new Date("2024-11-17T10:30:01Z") < cutoff).toBe(false);
    expect(new Date("2024-11-17T10:29:59Z") < cutoff).toBe(true);
  });
});
