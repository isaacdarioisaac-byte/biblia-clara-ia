import { describe, expect, it } from "vitest";
import {
  LOCAL_MODEL,
  LOCAL_MODEL_TARGET,
  buildVerseExplanationPrompt,
} from "./local-ai";

describe("local explainer", () => {
  it("creates a Spanish prompt tied to the selected verse", () => {
    const prompt = buildVerseExplanationPrompt(
      { number: 5, text: "La luz brilla en la oscuridad." },
      "Juan",
      1,
    );
    expect(prompt).toContain("Juan 1:5");
    expect(prompt).toContain("lenguaje cotidiano");
    expect(prompt).toContain("sin inventar detalles");
  });

  it("defines a downloadable model between one and two GB", () => {
    expect(LOCAL_MODEL_TARGET.minBytes).toBe(1_000_000_000);
    expect(LOCAL_MODEL_TARGET.maxBytes).toBe(2_000_000_000);
    expect(LOCAL_MODEL.estimatedBytes).toBeGreaterThan(LOCAL_MODEL_TARGET.minBytes);
    expect(LOCAL_MODEL.estimatedBytes).toBeLessThan(LOCAL_MODEL_TARGET.maxBytes);
  });
});
