import { describe, expect, it } from "vitest";

import {
  BIBLE_BOOKS,
  BIBLE_TRANSLATION,
  getBibleBook,
  getChapterVerses,
} from "./bible-data";

describe("Biblia en Español Sencillo integrada", () => {
  it("incluye los 66 libros del canon protestante", () => {
    expect(BIBLE_BOOKS).toHaveLength(66);
    expect(
      BIBLE_BOOKS.filter((book) => book.testament === "Antiguo"),
    ).toHaveLength(39);
    expect(
      BIBLE_BOOKS.filter((book) => book.testament === "Nuevo"),
    ).toHaveLength(27);
    expect(BIBLE_BOOKS[0]?.name).toBe("Génesis");
    expect(BIBLE_BOOKS[65]?.name).toBe("Apocalipsis");
  });

  it("conserva los capítulos completos y versículos locales", () => {
    expect(getBibleBook("PSA").chapters).toBe(150);
    expect(getBibleBook("REV").chapters).toBe(22);
    expect(getChapterVerses("GEN", 1).length).toBeGreaterThan(0);
    expect(getChapterVerses("PSA", 150).length).toBeGreaterThan(0);
    expect(getChapterVerses("JHN", 1)[0]?.text.length).toBeGreaterThan(10);
  });

  it("declara la atribución de la fuente distribuida", () => {
    expect(BIBLE_TRANSLATION.id).toBe("SPNBES");
    expect(BIBLE_TRANSLATION.license).toBe("CC BY 4.0");
    expect(BIBLE_TRANSLATION.attribution).toContain("AudioBiblia.org");
  });
});
