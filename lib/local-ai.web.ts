import {
  LOCAL_MODEL,
  LOCAL_MODEL_TARGET,
  type DownloadProgress,
  type LocalModelStatus,
  type VerseForExplanation,
  buildVerseExplanationPrompt,
} from "./local-ai-shared";

export {
  LOCAL_MODEL,
  LOCAL_MODEL_TARGET,
  type DownloadProgress,
  type LocalModelState,
  type LocalModelStatus,
  type VerseForExplanation,
  buildVerseExplanationPrompt,
  cleanExplanation,
} from "./local-ai-shared";

const unsupported: LocalModelStatus = {
  state: "unavailable",
  message: "La IA local se activa en la aplicación Android instalada.",
};

export async function getLocalModelStatus(): Promise<LocalModelStatus> {
  return unsupported;
}

export async function downloadLocalModel(
  _onProgress?: (progress: DownloadProgress) => void,
): Promise<LocalModelStatus> {
  throw new Error(unsupported.message);
}

export async function cancelModelDownload(): Promise<void> {}

export async function removeLocalModel(): Promise<void> {}

export async function generateVerseExplanation(
  _verse: VerseForExplanation,
  _book: string,
  _chapter: number,
): Promise<string> {
  throw new Error(unsupported.message);
}
