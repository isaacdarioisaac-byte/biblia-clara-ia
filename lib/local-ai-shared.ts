export type VerseForExplanation = {
  number: number;
  text: string;
};

export type LocalModelProfileId = "light" | "balanced" | "deep";

export type LocalModelProfile = {
  id: LocalModelProfileId;
  name: string;
  shortName: string;
  description: string;
  fileName: string;
  estimatedBytes: number;
  estimatedSizeLabel: string;
  recommendedFreeStorageLabel: string;
  deviceNote: string;
  license: string;
  downloadUrl: string;
  contextTokens: number;
  isRecommended?: boolean;
};

export type LocalModelState =
  | "checking"
  | "missing"
  | "downloading"
  | "ready"
  | "error"
  | "unavailable";

export type LocalModelStatus = {
  state: LocalModelState;
  modelId?: LocalModelProfileId;
  message?: string;
};

export type DownloadProgress = {
  writtenBytes: number;
  totalBytes: number;
  fraction: number;
};

export const DEFAULT_LOCAL_MODEL_ID: LocalModelProfileId = "light";

export const LOCAL_MODELS = [
  {
    id: "light",
    name: "Qwen2.5 1.5B · Ligero",
    shortName: "Ligero",
    description:
      "La opción recomendada para explicaciones breves y uso diario.",
    fileName: "qwen2.5-1.5b-instruct-q4_k_m.gguf",
    estimatedBytes: 1_120_000_000,
    estimatedSizeLabel: "1,12 GB",
    recommendedFreeStorageLabel: "2,5 GB libres",
    deviceNote: "Funciona mejor en Android de 64 bits con espacio libre.",
    license: "Apache-2.0",
    downloadUrl:
      "https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct-GGUF/resolve/main/qwen2.5-1.5b-instruct-q4_k_m.gguf?download=true",
    contextTokens: 1536,
    isRecommended: true,
  },
  {
    id: "balanced",
    name: "Qwen2.5 3B · Equilibrado",
    shortName: "Equilibrado",
    description:
      "Ofrece más matiz, con mayor consumo de memoria y almacenamiento.",
    fileName: "qwen2.5-3b-instruct-q4_k_m.gguf",
    estimatedBytes: 2_100_000_000,
    estimatedSizeLabel: "2,10 GB",
    recommendedFreeStorageLabel: "3,5 GB libres",
    deviceNote: "Recomendado en teléfonos con buena memoria disponible.",
    license: "Qwen Research License",
    downloadUrl:
      "https://huggingface.co/Qwen/Qwen2.5-3B-Instruct-GGUF/resolve/main/qwen2.5-3b-instruct-q4_k_m.gguf?download=true",
    contextTokens: 1280,
  },
  {
    id: "deep",
    name: "Qwen2.5 7B · Profundo",
    shortName: "Profundo",
    description:
      "La mejor calidad relativa de los tres, pensada para teléfonos potentes.",
    fileName: "qwen2.5-7b-instruct-q3_k_m.gguf",
    estimatedBytes: 3_808_391_072,
    estimatedSizeLabel: "3,81 GB",
    recommendedFreeStorageLabel: "5 GB libres",
    deviceNote: "Puede ser lento o no cargar en teléfonos con poca memoria.",
    license: "Apache-2.0",
    downloadUrl:
      "https://huggingface.co/Qwen/Qwen2.5-7B-Instruct-GGUF/resolve/main/qwen2.5-7b-instruct-q3_k_m.gguf?download=true",
    contextTokens: 1024,
  },
] as const satisfies readonly LocalModelProfile[];

/** Compatibilidad con la integración inicial de un único modelo. */
export const LOCAL_MODEL = LOCAL_MODELS[0];

export const LOCAL_MODEL_TARGET = {
  minBytes: 1_000_000_000,
  maxBytes: 5_000_000_000,
  status: "downloadable" as const,
};

export function isLocalModelProfileId(
  value: string | null | undefined,
): value is LocalModelProfileId {
  return LOCAL_MODELS.some((model) => model.id === value);
}

export function getLocalModelProfile(
  id: LocalModelProfileId = DEFAULT_LOCAL_MODEL_ID,
): LocalModelProfile {
  return LOCAL_MODELS.find((model) => model.id === id) ?? LOCAL_MODEL;
}

export function buildVerseExplanationPrompt(
  verse: VerseForExplanation,
  book: string,
  chapter: number,
): string {
  return [
    "Eres Biblia Clara IA, un guía bíblico respetuoso que explica en español sencillo.",
    "Explica el versículo sin inventar detalles ni presentar tu explicación como la única interpretación posible.",
    "Usa dos párrafos breves, lenguaje cotidiano y un tono cálido. Menciona una idea principal y una aplicación práctica prudente.",
    "No des consejos médicos, legales, financieros ni afirmaciones absolutas sobre la voluntad de Dios para una persona.",
    "",
    `Referencia: ${book} ${chapter}:${verse.number}`,
    `Versículo: “${verse.text}”`,
    "",
    "Explicación sencilla:",
  ].join("\n");
}

export function cleanExplanation(text: string): string {
  const cleaned = text
    .replace(/<\|[^>]+\|>/g, "")
    .replace(/^\s*(assistant|respuesta)\s*:\s*/i, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return (
    cleaned || "No se pudo preparar una explicación clara. Inténtalo de nuevo."
  );
}
