import { describe, expect, it } from "vitest";
import {
  LOCAL_MODELS,
  LOCAL_MODEL_TARGET,
  buildVerseExplanationPrompt,
  getLocalModelProfile,
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

  it("defines three downloadable local profiles ordered by size", () => {
    expect(LOCAL_MODELS).toHaveLength(3);
    expect(LOCAL_MODELS.map((model) => model.id)).toEqual([
      "light",
      "balanced",
      "deep",
    ]);
    expect(LOCAL_MODELS[0].estimatedBytes).toBeGreaterThan(
      LOCAL_MODEL_TARGET.minBytes,
    );
    expect(LOCAL_MODELS[2].estimatedBytes).toBeLessThan(
      LOCAL_MODEL_TARGET.maxBytes,
    );
    expect(LOCAL_MODELS[0].estimatedBytes).toBeLessThan(
      LOCAL_MODELS[1].estimatedBytes,
    );
    expect(LOCAL_MODELS[1].estimatedBytes).toBeLessThan(
      LOCAL_MODELS[2].estimatedBytes,
    );
  });

  it("returns the requested profile and preserves its unique file name", () => {
    const deep = getLocalModelProfile("deep");
    expect(deep.shortName).toBe("Profundo");
    expect(deep.fileName).toContain("7b");
    expect(new Set(LOCAL_MODELS.map((model) => model.fileName)).size).toBe(3);
  });
});
