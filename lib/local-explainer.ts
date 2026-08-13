export type ExplainableVerse = { number: number; text: string };

export function explainVerse(verse: ExplainableVerse, book: string, chapter: number): string {
  const themes = [
    "Este versículo presenta una verdad fundamental: Dios está presente y actúa desde el comienzo.",
    "En palabras sencillas, nos recuerda que la vida y la esperanza no dependen solo de nuestras fuerzas.",
    "La idea principal es que la fe también puede ayudarnos a mirar la realidad con más claridad.",
  ];
  const theme = themes[(verse.number - 1) % themes.length];
  return `${theme} En ${book} ${chapter}:${verse.number}, el texto invita a confiar, reconocer lo bueno y poner esta enseñanza en práctica con humildad. No significa que no tendremos problemas, sino que no tenemos que enfrentarlos sin dirección ni esperanza.`;
}

export const LOCAL_MODEL_TARGET = {
  minBytes: 1_000_000_000,
  maxBytes: 2_000_000_000,
  status: "planned" as const,
};
