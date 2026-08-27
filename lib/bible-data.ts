export type BibleTestament = "Antiguo" | "Nuevo";

export type BibleVerse = {
  number: number;
  text: string;
};

export type BibleBook = {
  id: string;
  name: string;
  testament: BibleTestament;
  chapters: number;
};

type BibleBookResource = Omit<BibleBook, "chapters"> & {
  chapters: BibleVerse[][];
};

type BibleResource = {
  translation: {
    id: string;
    title: string;
    attribution: string;
    license: string;
    licenseUrl: string;
    sourceUrl: string;
  };
  books: BibleBookResource[];
};

const bibleResource =
  require("../assets/bible/biblia-espanol-sencillo.json") as BibleResource;

export const BIBLE_TRANSLATION = bibleResource.translation;

export const BIBLE_BOOKS: BibleBook[] = bibleResource.books.map((book) => ({
  id: book.id,
  name: book.name,
  testament: book.testament,
  chapters: book.chapters.length,
}));

export function getBibleBook(id: string): BibleBook {
  const book = BIBLE_BOOKS.find((candidate) => candidate.id === id);
  if (!book) throw new Error(`No se encontró el libro bíblico ${id}.`);
  return book;
}

export function getChapterVerses(
  bookId: string,
  chapter: number,
): BibleVerse[] {
  const book = bibleResource.books.find((candidate) => candidate.id === bookId);
  if (!book) throw new Error(`No se encontró el libro bíblico ${bookId}.`);
  return book.chapters[chapter - 1] ?? [];
}
