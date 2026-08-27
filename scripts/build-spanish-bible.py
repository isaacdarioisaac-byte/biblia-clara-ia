#!/usr/bin/env python3
"""Convierte el archivo USFX de La Biblia en Español Sencillo a JSON local.

Uso:
  python3 scripts/build-spanish-bible.py \
    /ruta/spa-bes.usfx.xml \
    assets/bible/biblia-espanol-sencillo.json
"""

from __future__ import annotations

import json
import re
import sys
import xml.etree.ElementTree as element_tree
from pathlib import Path


BOOK_METADATA = {
    "GEN": ("Génesis", "Antiguo"),
    "EXO": ("Éxodo", "Antiguo"),
    "LEV": ("Levítico", "Antiguo"),
    "NUM": ("Números", "Antiguo"),
    "DEU": ("Deuteronomio", "Antiguo"),
    "JOS": ("Josué", "Antiguo"),
    "JDG": ("Jueces", "Antiguo"),
    "RUT": ("Rut", "Antiguo"),
    "1SA": ("1 Samuel", "Antiguo"),
    "2SA": ("2 Samuel", "Antiguo"),
    "1KI": ("1 Reyes", "Antiguo"),
    "2KI": ("2 Reyes", "Antiguo"),
    "1CH": ("1 Crónicas", "Antiguo"),
    "2CH": ("2 Crónicas", "Antiguo"),
    "EZR": ("Esdras", "Antiguo"),
    "NEH": ("Nehemías", "Antiguo"),
    "EST": ("Ester", "Antiguo"),
    "JOB": ("Job", "Antiguo"),
    "PSA": ("Salmos", "Antiguo"),
    "PRO": ("Proverbios", "Antiguo"),
    "ECC": ("Eclesiastés", "Antiguo"),
    "SNG": ("Cantares", "Antiguo"),
    "ISA": ("Isaías", "Antiguo"),
    "JER": ("Jeremías", "Antiguo"),
    "LAM": ("Lamentaciones", "Antiguo"),
    "EZK": ("Ezequiel", "Antiguo"),
    "DAN": ("Daniel", "Antiguo"),
    "HOS": ("Oseas", "Antiguo"),
    "JOL": ("Joel", "Antiguo"),
    "AMO": ("Amós", "Antiguo"),
    "OBA": ("Abdías", "Antiguo"),
    "JON": ("Jonás", "Antiguo"),
    "MIC": ("Miqueas", "Antiguo"),
    "NAM": ("Nahúm", "Antiguo"),
    "HAB": ("Habacuc", "Antiguo"),
    "ZEP": ("Sofonías", "Antiguo"),
    "HAG": ("Hageo", "Antiguo"),
    "ZEC": ("Zacarías", "Antiguo"),
    "MAL": ("Malaquías", "Antiguo"),
    "MAT": ("Mateo", "Nuevo"),
    "MRK": ("Marcos", "Nuevo"),
    "LUK": ("Lucas", "Nuevo"),
    "JHN": ("Juan", "Nuevo"),
    "ACT": ("Hechos", "Nuevo"),
    "ROM": ("Romanos", "Nuevo"),
    "1CO": ("1 Corintios", "Nuevo"),
    "2CO": ("2 Corintios", "Nuevo"),
    "GAL": ("Gálatas", "Nuevo"),
    "EPH": ("Efesios", "Nuevo"),
    "PHP": ("Filipenses", "Nuevo"),
    "COL": ("Colosenses", "Nuevo"),
    "1TH": ("1 Tesalonicenses", "Nuevo"),
    "2TH": ("2 Tesalonicenses", "Nuevo"),
    "1TI": ("1 Timoteo", "Nuevo"),
    "2TI": ("2 Timoteo", "Nuevo"),
    "TIT": ("Tito", "Nuevo"),
    "PHM": ("Filemón", "Nuevo"),
    "HEB": ("Hebreos", "Nuevo"),
    "JAS": ("Santiago", "Nuevo"),
    "1PE": ("1 Pedro", "Nuevo"),
    "2PE": ("2 Pedro", "Nuevo"),
    "1JN": ("1 Juan", "Nuevo"),
    "2JN": ("2 Juan", "Nuevo"),
    "3JN": ("3 Juan", "Nuevo"),
    "JUD": ("Judas", "Nuevo"),
    "REV": ("Apocalipsis", "Nuevo"),
}


def tag_name(element: element_tree.Element) -> str:
    """Elimina un espacio de nombres XML si la fuente llegara a tenerlo."""

    return element.tag.rsplit("}", 1)[-1]


def normalize_text(parts: list[str]) -> str:
    text = " ".join("".join(parts).split())
    text = re.sub(r"\s+([,.;:?!])", r"\1", text)
    text = re.sub(r"([¿¡])\s+", r"\1", text)
    return text.strip()


def build_bible(source_path: Path) -> dict[str, object]:
    root = element_tree.parse(source_path).getroot()
    books: dict[str, dict[str, object]] = {}
    book_order: list[str] = []
    current_book_id: str | None = None
    current_chapter = 0
    current_verse_number: int | None = None
    current_parts: list[str] = []

    def flush_verse() -> None:
        nonlocal current_verse_number, current_parts
        if (
            current_book_id is None
            or current_chapter < 1
            or current_verse_number is None
        ):
            current_parts = []
            return
        text = normalize_text(current_parts)
        if text:
            book = books[current_book_id]
            chapters = book["chapters"]
            assert isinstance(chapters, list)
            while len(chapters) < current_chapter:
                chapters.append([])
            chapter_verses = chapters[current_chapter - 1]
            assert isinstance(chapter_verses, list)
            chapter_verses.append({"number": current_verse_number, "text": text})
        current_verse_number = None
        current_parts = []

    for element in root.iter():
        name = tag_name(element)
        if name == "book":
            flush_verse()
            current_book_id = element.attrib["id"]
            title, testament = BOOK_METADATA[current_book_id]
            books[current_book_id] = {
                "id": current_book_id,
                "name": title,
                "testament": testament,
                "chapters": [],
            }
            book_order.append(current_book_id)
            current_chapter = 0
            continue
        if name == "c":
            flush_verse()
            current_chapter = int(element.attrib["id"])
            continue
        if name == "v":
            flush_verse()
            current_verse_number = int(element.attrib["id"])
            if element.tail:
                current_parts.append(element.tail)
            continue
        if name == "ve":
            flush_verse()
            continue
        if current_verse_number is not None:
            if element.text:
                current_parts.append(element.text)
            if element.tail:
                current_parts.append(element.tail)

    flush_verse()
    ordered_books = [books[book_id] for book_id in book_order]
    if len(ordered_books) != 66:
        raise ValueError(f"Se esperaban 66 libros y se encontraron {len(ordered_books)}.")

    verse_count = sum(
        len(chapter)
        for book in ordered_books
        for chapter in book["chapters"]
    )
    if verse_count < 31_000:
        raise ValueError(f"La extracción produjo solo {verse_count} versículos.")

    return {
        "translation": {
            "id": "SPNBES",
            "title": "La Biblia en Español Sencillo",
            "copyright": "© 2018, 2019 AudioBiblia.org / Irma Flores",
            "license": "CC BY 4.0",
            "licenseUrl": "https://creativecommons.org/licenses/by/4.0/",
            "sourceUrl": "https://ebible.org/details.php?id=SPNBES",
            "attribution": "La Biblia en Español Sencillo © 2018, 2019 AudioBiblia.org / Irma Flores, CC BY 4.0.",
        },
        "books": ordered_books,
    }


def main() -> None:
    if len(sys.argv) != 3:
        raise SystemExit(__doc__)
    source_path = Path(sys.argv[1])
    output_path = Path(sys.argv[2])
    bible = build_bible(source_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(
        json.dumps(bible, ensure_ascii=False, separators=(",", ":")),
        encoding="utf-8",
    )
    books = bible["books"]
    assert isinstance(books, list)
    chapters = sum(len(book["chapters"]) for book in books)
    verses = sum(
        len(chapter)
        for book in books
        for chapter in book["chapters"]
    )
    print(f"Generados {len(books)} libros, {chapters} capítulos y {verses} versículos.")


if __name__ == "__main__":
    main()
