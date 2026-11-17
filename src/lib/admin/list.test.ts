import { describe, expect, it } from "vitest";
import { moveItem } from "./list";

describe("moveItem", () => {
  it("monte et descend un élément", () => {
    expect(moveItem(["a", "b", "c"], 1, -1)).toEqual(["b", "a", "c"]);
    expect(moveItem(["a", "b", "c"], 1, 1)).toEqual(["a", "c", "b"]);
  });
  it("ne fait rien hors des limites et ne modifie pas la liste d'origine", () => {
    const list = ["a", "b"];
    expect(moveItem(list, 0, -1)).toEqual(["a", "b"]);
    expect(moveItem(list, 1, 1)).toEqual(["a", "b"]);
    moveItem(list, 0, 1);
    expect(list).toEqual(["a", "b"]);
  });
});
