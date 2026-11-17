import { describe, expect, it } from "vitest";
import { progressShare, recapOf, relevantAnswers, stepsFor } from "./steps";

describe("parcours du formulaire Contact", () => {
  it("couverture d'événement : 4 étapes", () => {
    expect(stepsFor("Couverture événement")).toEqual([
      "type",
      "eventDays",
      "eventDate",
      "details",
    ]);
  });
  it("photographie : 4 étapes", () => {
    expect(stepsFor("Photographie")).toEqual([
      "type",
      "photo",
      "when",
      "details",
    ]);
  });
  it("autre catégorie ou type non choisi : 3 étapes", () => {
    expect(stepsFor("Documentaire")).toEqual(["type", "when", "details"]);
    expect(stepsFor("Autre")).toEqual(["type", "when", "details"]);
    expect(stepsFor(undefined)).toEqual(["type", "when", "details"]);
  });
  it("anneau : part des étapes franchies, plein après l'envoi", () => {
    expect(progressShare("type", undefined)).toBe(0);
    expect(progressShare("eventDate", "Couverture événement")).toBe(0.5);
    expect(progressShare("details", "Documentaire")).toBeCloseTo(2 / 3);
    expect(progressShare("done", "Documentaire")).toBe(1);
  });
  it("écarte les réponses d'un autre parcours après un changement de type", () => {
    const answers = {
      projectType: "Documentaire",
      photoKind: "Reportage",
      eventDuration: "Une journée",
      eventDate: "Mai",
      desiredDate: "Plus tard",
    };
    expect(relevantAnswers(answers)).toEqual({
      projectType: "Documentaire",
      desiredDate: "Plus tard",
    });
    expect(recapOf(answers)).toEqual(["Documentaire", "Plus tard"]);
    expect(
      recapOf({
        ...answers,
        projectType: "Couverture événement",
        eventDate: "  ",
      }),
    ).toEqual(["Couverture événement", "Une journée"]);
  });
});
