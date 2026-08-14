export type VerseForExplanation = {
  number: number;
  text: string;
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
  message?: string;
};

export type DownloadProgress = {
  writtenBytes: number;
  totalBytes: number;
  fraction: number;
};

export const LOCAL_MODEL = {
  id: "qwen2.5-1.5b-instruct-q4-k-m",
  name: "Qwen2.5 1.5B en español",
  fileName: "qwen2.5-1.5b-instruct-q4_k_m.gguf",
  estimatedBytes: 1_120_000_000,
  estimatedSizeLabel: "1,12 GB",
  license: "Apache-2.0",
  downloadUrl:
    "https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct-GGUF/resolve/main/qwen2.5-1.5b-instruct-q4_k_m.gguf?download=true",
} as const;

export const LOCAL_MODEL_TARGET = {
  minBytes: 1_000_000_000,
  maxBytes: 2_000_000_000,
  status: "downloadable" as const,
};

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

  return cleaned || "No se pudo preparar una explicación clara. Inténtalo de nuevo.";
}
