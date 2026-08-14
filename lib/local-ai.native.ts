import * as FileSystem from "expo-file-system/legacy";
import { initLlama, type LlamaContext } from "llama.rn";
import {
  LOCAL_MODEL,
  LOCAL_MODEL_TARGET,
  type DownloadProgress,
  type LocalModelStatus,
  type VerseForExplanation,
  buildVerseExplanationPrompt,
  cleanExplanation,
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

let context: LlamaContext | null = null;
let activeDownload: FileSystem.DownloadResumable | null = null;

function getModelDirectory(): string {
  if (!FileSystem.documentDirectory) {
    throw new Error("No se pudo acceder al almacenamiento local del dispositivo.");
  }
  return `${FileSystem.documentDirectory}biblia-clara-models/`;
}

function getModelPath(): string {
  return `${getModelDirectory()}${LOCAL_MODEL.fileName}`;
}

async function ensureModelDirectory(): Promise<void> {
  await FileSystem.makeDirectoryAsync(getModelDirectory(), { intermediates: true });
}

async function releaseContext(): Promise<void> {
  if (context) {
    await context.release();
    context = null;
  }
}

async function getContext(): Promise<LlamaContext> {
  if (context) return context;

  context = await initLlama({
    model: getModelPath(),
    n_ctx: 1536,
    n_batch: 256,
    n_ubatch: 256,
    n_threads: 4,
    n_gpu_layers: 0,
    use_mlock: false,
    cache_type_k: "q8_0",
    cache_type_v: "q8_0",
    flash_attn_type: "off",
  });

  return context;
}

export async function getLocalModelStatus(): Promise<LocalModelStatus> {
  try {
    const info = await FileSystem.getInfoAsync(getModelPath());
    return info.exists
      ? { state: "ready" }
      : { state: activeDownload ? "downloading" : "missing" };
  } catch (error) {
    return {
      state: "error",
      message: error instanceof Error ? error.message : "No se pudo revisar el modelo local.",
    };
  }
}

export async function downloadLocalModel(
  onProgress?: (progress: DownloadProgress) => void,
): Promise<LocalModelStatus> {
  if (activeDownload) return getLocalModelStatus();

  await ensureModelDirectory();
  await releaseContext();

  activeDownload = FileSystem.createDownloadResumable(
    LOCAL_MODEL.downloadUrl,
    getModelPath(),
    {},
    ({ totalBytesWritten, totalBytesExpectedToWrite }) => {
      const total = totalBytesExpectedToWrite || LOCAL_MODEL.estimatedBytes;
      onProgress?.({
        writtenBytes: totalBytesWritten,
        totalBytes: total,
        fraction: Math.min(totalBytesWritten / total, 1),
      });
    },
  );

  try {
    const result = await activeDownload.downloadAsync();
    if (!result?.uri) throw new Error("La descarga del modelo no se completó.");
    return { state: "ready" };
  } catch (error) {
    await FileSystem.deleteAsync(getModelPath(), { idempotent: true });
    throw error;
  } finally {
    activeDownload = null;
  }
}

export async function cancelModelDownload(): Promise<void> {
  if (activeDownload) {
    await activeDownload.pauseAsync();
    activeDownload = null;
  }
  await FileSystem.deleteAsync(getModelPath(), { idempotent: true });
}

export async function removeLocalModel(): Promise<void> {
  await releaseContext();
  await FileSystem.deleteAsync(getModelPath(), { idempotent: true });
}

export async function generateVerseExplanation(
  verse: VerseForExplanation,
  book: string,
  chapter: number,
): Promise<string> {
  const status = await getLocalModelStatus();
  if (status.state !== "ready") {
    throw new Error("Descarga la IA local para explicar este versículo.");
  }

  const llama = await getContext();
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
