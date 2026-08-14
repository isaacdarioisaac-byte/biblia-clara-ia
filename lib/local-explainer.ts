export type ExplainableVerse = { number: number; text: string };

export {
  LOCAL_MODEL,
  LOCAL_MODEL_TARGET,
  buildVerseExplanationPrompt,
  cleanExplanation,
} from "./local-ai-shared";
