import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system/legacy";
import { initLlama, type LlamaContext } from "llama.rn";
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
  cleanExplanation,
  getLocalModelProfile,
  isLocalModelProfileId,
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

const SELECTED_MODEL_STORAGE_KEY = "biblia-clara.selected-local-model";

let context: LlamaContext | null = null;
let contextModelId: LocalModelProfileId | null = null;
let activeDownload: {
  modelId: LocalModelProfileId;
  task: FileSystem.DownloadResumable;
} | null = null;

function getModelDirectory(): string {
  if (!FileSystem.documentDirectory) {
    throw new Error(
      "No se pudo acceder al almacenamiento local del dispositivo.",
    );
  }
  return `${FileSystem.documentDirectory}biblia-clara-models/`;
}

function getModelPath(model: LocalModelProfile): string {
  return `${getModelDirectory()}${model.fileName}`;
}

async function ensureModelDirectory(): Promise<void> {
  await FileSystem.makeDirectoryAsync(getModelDirectory(), {
    intermediates: true,
  });
}

async function releaseContext(): Promise<void> {
  if (context) {
    await context.release();
    context = null;
    contextModelId = null;
  }
}

async function getContext(model: LocalModelProfile): Promise<LlamaContext> {
  if (context && contextModelId === model.id) return context;
  await releaseContext();

  context = await initLlama({
    model: getModelPath(model),
    n_ctx: model.contextTokens,
    n_batch: model.id === "deep" ? 128 : 256,
    n_ubatch: model.id === "deep" ? 128 : 256,
    n_threads: 4,
    n_gpu_layers: 0,
    use_mlock: false,
    cache_type_k: "q8_0",
    cache_type_v: "q8_0",
    flash_attn_type: "off",
  });
  contextModelId = model.id;

  return context;
}

export async function getSelectedLocalModel(): Promise<LocalModelProfile> {
  try {
    const storedId = await AsyncStorage.getItem(SELECTED_MODEL_STORAGE_KEY);
    return isLocalModelProfileId(storedId)
      ? getLocalModelProfile(storedId)
      : getLocalModelProfile(DEFAULT_LOCAL_MODEL_ID);
  } catch {
    return getLocalModelProfile(DEFAULT_LOCAL_MODEL_ID);
  }
}

export async function selectLocalModel(
  modelId: LocalModelProfileId,
): Promise<LocalModelProfile> {
  const model = getLocalModelProfile(modelId);
  await releaseContext();
  await AsyncStorage.setItem(SELECTED_MODEL_STORAGE_KEY, model.id);
  return model;
}

export async function getLocalModelStatus(
  modelId?: LocalModelProfileId,
): Promise<LocalModelStatus> {
  const model = modelId
    ? getLocalModelProfile(modelId)
    : await getSelectedLocalModel();
  try {
    const info = await FileSystem.getInfoAsync(getModelPath(model));
    return info.exists
      ? { state: "ready", modelId: model.id }
      : {
          state:
            activeDownload?.modelId === model.id ? "downloading" : "missing",
          modelId: model.id,
        };
  } catch (error) {
    return {
      state: "error",
      modelId: model.id,
      message:
        error instanceof Error
          ? error.message
          : "No se pudo revisar el modelo local.",
    };
  }
}

export async function downloadLocalModel(
  modelId: LocalModelProfileId,
  onProgress?: (progress: DownloadProgress) => void,
): Promise<LocalModelStatus> {
  const model = getLocalModelProfile(modelId);
  if (activeDownload) return getLocalModelStatus(model.id);

  await ensureModelDirectory();
  await releaseContext();

  const task = FileSystem.createDownloadResumable(
    model.downloadUrl,
    getModelPath(model),
    {},
    ({ totalBytesWritten, totalBytesExpectedToWrite }) => {
      const total = totalBytesExpectedToWrite || model.estimatedBytes;
      onProgress?.({
        writtenBytes: totalBytesWritten,
        totalBytes: total,
        fraction: Math.min(totalBytesWritten / total, 1),
      });
    },
  );
  activeDownload = { modelId: model.id, task };

  try {
    const result = await task.downloadAsync();
    if (!result?.uri) throw new Error("La descarga del modelo no se completó.");
    return { state: "ready", modelId: model.id };
  } catch (error) {
    await FileSystem.deleteAsync(getModelPath(model), { idempotent: true });
    throw error;
  } finally {
    activeDownload = null;
  }
}

export async function cancelModelDownload(
  modelId?: LocalModelProfileId,
): Promise<void> {
  if (activeDownload && (!modelId || activeDownload.modelId === modelId)) {
    const model = getLocalModelProfile(activeDownload.modelId);
    await activeDownload.task.pauseAsync();
    activeDownload = null;
    await FileSystem.deleteAsync(getModelPath(model), { idempotent: true });
  }
}

export async function removeLocalModel(
  modelId?: LocalModelProfileId,
): Promise<void> {
  const model = modelId
    ? getLocalModelProfile(modelId)
    : await getSelectedLocalModel();
  if (contextModelId === model.id) await releaseContext();
  await FileSystem.deleteAsync(getModelPath(model), { idempotent: true });
}

export async function generateVerseExplanation(
  verse: VerseForExplanation,
  book: string,
  chapter: number,
): Promise<string> {
  const model = await getSelectedLocalModel();
  const status = await getLocalModelStatus(model.id);
  if (status.state !== "ready") {
    throw new Error(
      `Descarga la IA local ${model.shortName} para explicar este versículo.`,
    );
  }

  const llama = await getContext(model);
  await llama.clearCache();
  const result = await llama.completion({
    prompt: buildVerseExplanationPrompt(verse, book, chapter),
    n_predict: 180,
    temperature: 0.3,
    top_p: 0.9,
    top_k: 30,
    stop: ["<|im_end|>", "<|endoftext|>", "\nReferencia:"],
  });

  return cleanExplanation(result.text);
}
