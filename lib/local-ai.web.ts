import {
  DEFAULT_LOCAL_MODEL_ID,
  LOCAL_MODEL,
  LOCAL_MODELS,
  LOCAL_MODEL_TARGET,
  type DownloadProgress,
  type LocalModelProfile,
  type LocalModelProfileId,
  type LocalModelStatus,
  type VerseForExplanation,
  buildVerseExplanationPrompt,
  getLocalModelProfile,
} from "./local-ai-shared";

export {
  DEFAULT_LOCAL_MODEL_ID,
  LOCAL_MODEL,
  LOCAL_MODELS,
  LOCAL_MODEL_TARGET,
  type DownloadProgress,
  type LocalModelProfile,
  type LocalModelProfileId,
  type LocalModelState,
  type LocalModelStatus,
  type VerseForExplanation,
  buildVerseExplanationPrompt,
  cleanExplanation,
  getLocalModelProfile,
} from "./local-ai-shared";

const unsupported: LocalModelStatus = {
  state: "unavailable",
  message: "La IA local se activa en la aplicación Android instalada.",
};

let selectedModel: LocalModelProfile = LOCAL_MODEL;

export async function getSelectedLocalModel(): Promise<LocalModelProfile> {
  return selectedModel;
}

export async function selectLocalModel(
  modelId: LocalModelProfileId,
): Promise<LocalModelProfile> {
  selectedModel = getLocalModelProfile(modelId);
  return selectedModel;
}

export async function getLocalModelStatus(
  modelId?: LocalModelProfileId,
): Promise<LocalModelStatus> {
  return { ...unsupported, modelId: modelId ?? selectedModel.id };
}

export async function downloadLocalModel(
  _modelId: LocalModelProfileId,
  _onProgress?: (progress: DownloadProgress) => void,
): Promise<LocalModelStatus> {
  throw new Error(unsupported.message);
}

export async function cancelModelDownload(
  _modelId?: LocalModelProfileId,
): Promise<void> {}

export async function removeLocalModel(
  _modelId?: LocalModelProfileId,
): Promise<void> {}

export async function generateVerseExplanation(
  _verse: VerseForExplanation,
  _book: string,
  _chapter: number,
): Promise<string> {
  throw new Error(unsupported.message);
}
