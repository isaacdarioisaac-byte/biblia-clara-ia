import { describe, expect, it } from "vitest";
import { explainVerse, LOCAL_MODEL_TARGET } from "./local-explainer";

describe("local explainer", () => {
  it("creates a simple explanation tied to the verse reference", () => {
    const result = explainVerse({ number: 5, text: "La luz brilla en la oscuridad." }, "Juan", 1);
    expect(result).toContain("Juan 1:5");
    expect(result).toContain("En palabras sencillas");
  });

  it("defines the planned local model size between one and two GB", () => {
    expect(LOCAL_MODEL_TARGET.minBytes).toBe(1_000_000_000);
    expect(LOCAL_MODEL_TARGET.maxBytes).toBe(2_000_000_000);
  });
});
