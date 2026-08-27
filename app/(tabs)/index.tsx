import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { LocalModelProfilePicker } from "@/components/local-model-profile-picker";
import {
  LOCAL_MODEL,
  LOCAL_MODELS,
  type DownloadProgress,
  type LocalModelProfile,
  type LocalModelStatus,
  cancelModelDownload,
  downloadLocalModel,
  generateVerseExplanation,
  getLocalModelStatus,
  getSelectedLocalModel,
  selectLocalModel,
} from "@/lib/local-ai";
import {
  BIBLE_BOOKS,
  BIBLE_TRANSLATION,
  getChapterVerses,
  type BibleBook,
  type BibleVerse,
} from "@/lib/bible-data";

const palette = {
  navy: "#162A46",
  ivory: "#FBF8F1",
  paper: "#FFFDF8",
  gold: "#C79A45",
  goldSoft: "#F2E8D2",
  sage: "#6B8570",
  ink: "#263342",
  muted: "#718096",
  line: "#E9E3D7",
  white: "#FFFFFF",
};
const INITIAL_BOOK =
  BIBLE_BOOKS.find((candidate) => candidate.id === "JHN") ?? BIBLE_BOOKS[0]!;

function makeVerseKey(bookId: string, chapter: number, verseNumber: number) {
  return `${bookId}.${chapter}.${verseNumber}`;
}

export default function HomeScreen() {
  const [book, setBook] = useState<BibleBook>(INITIAL_BOOK);
  const [chapter, setChapter] = useState(1);
  const [selectedVerse, setSelectedVerse] = useState<BibleVerse | null>(null);
  const [picker, setPicker] = useState<"book" | "chapter" | null>(null);
  const [saved, setSaved] = useState<string[]>([]);
  const [fontLarge, setFontLarge] = useState(false);
  const [modelPickerVisible, setModelPickerVisible] = useState(false);
  const [selectedModel, setSelectedModel] =
    useState<LocalModelProfile>(LOCAL_MODEL);
  const [modelStatus, setModelStatus] = useState<LocalModelStatus>({
    state: "checking",
  });
  const [downloadProgress, setDownloadProgress] =
    useState<DownloadProgress | null>(null);
  const [explanation, setExplanation] = useState("");
  const [explanationState, setExplanationState] = useState<
    "idle" | "generating" | "needs-model" | "unavailable" | "error"
  >("idle");
  const chapterVerses = useMemo(
    () => getChapterVerses(book.id, chapter),
    [book.id, chapter],
  );
  const firstVerseNumber = chapterVerses[0]?.number ?? 1;
  const lastVerseNumber =
    chapterVerses[chapterVerses.length - 1]?.number ?? firstVerseNumber;
  const refreshModelStatus = useCallback(async () => {
    const model = await getSelectedLocalModel();
    setSelectedModel(model);
    setModelStatus(await getLocalModelStatus(model.id));
  }, []);
  useEffect(() => {
    void refreshModelStatus();
  }, [refreshModelStatus]);
  const modelCopy = useMemo(() => {
    if (modelStatus.state === "ready")
      return {
        title: `IA ${selectedModel.shortName} lista`,
        text: "Las explicaciones se generan en tu dispositivo.",
        action: "",
      };
    if (modelStatus.state === "downloading")
      return {
        title: `Descargando IA: ${Math.round((downloadProgress?.fraction ?? 0) * 100)}%`,
        text: "Mantén la aplicación abierta. Puedes cancelar cuando quieras.",
        action: "Cancelar",
      };
    if (modelStatus.state === "unavailable")
      return {
        title: "IA local para Android",
        text: "Instala el APK para descargar el modelo y explicarlo sin API.",
        action: "",
      };
    if (modelStatus.state === "error")
      return {
        title: "No se pudo revisar la IA",
        text: modelStatus.message ?? "Inténtalo otra vez.",
        action: "Reintentar",
      };
    if (modelStatus.state === "checking")
      return {
        title: "Revisando IA local",
        text: "Comprobando el almacenamiento del dispositivo.",
        action: "",
      };
    return {
      title: `Descargar IA ${selectedModel.shortName}`,
      text: `${selectedModel.estimatedSizeLabel} · Recomendado con Wi‑Fi · Sin API`,
      action: "Descargar",
    };
  }, [downloadProgress?.fraction, modelStatus, selectedModel]);
  const handleModelAction = useCallback(async () => {
    if (
      modelStatus.state === "unavailable" ||
      modelStatus.state === "ready" ||
      modelStatus.state === "checking"
    )
      return;
    if (modelStatus.state === "downloading") {
      await cancelModelDownload(selectedModel.id);
      setDownloadProgress(null);
      await refreshModelStatus();
      return;
    }
    setModelStatus({ state: "downloading" });
    try {
      await downloadLocalModel(selectedModel.id, setDownloadProgress);
      await refreshModelStatus();
    } catch (error) {
      setModelStatus({
        state: "error",
        message:
          error instanceof Error
            ? error.message
            : "La descarga no se completó.",
      });
    }
  }, [modelStatus.state, refreshModelStatus, selectedModel.id]);
  const chooseModel = useCallback(
    async (modelId: LocalModelProfile["id"]) => {
      if (modelStatus.state === "downloading") return;
      const nextModel = await selectLocalModel(modelId);
      setSelectedModel(nextModel);
      setDownloadProgress(null);
      setModelStatus(await getLocalModelStatus(nextModel.id));
      setModelPickerVisible(false);
    },
    [modelStatus.state],
  );
  useEffect(() => {
    if (!selectedVerse) return;
    if (
      modelStatus.state === "missing" ||
      modelStatus.state === "downloading"
    ) {
      setExplanationState("needs-model");
      return;
    }
    if (modelStatus.state === "unavailable") {
      setExplanationState("unavailable");
      return;
    }
    if (modelStatus.state !== "ready") return;
    let cancelled = false;
    setExplanationState("generating");
    setExplanation("");
    void generateVerseExplanation(selectedVerse, book.name, chapter)
      .then((value) => {
        if (!cancelled) {
          setExplanation(value);
          setExplanationState("idle");
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setExplanation(
            error instanceof Error
              ? error.message
              : "No se pudo crear la explicación.",
          );
          setExplanationState("error");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [book.name, chapter, modelStatus.state, selectedVerse]);
  const chooseBook = (next: BibleBook) => {
    setBook(next);
    setChapter(1);
    setPicker("chapter");
  };
  return (
    <ScreenContainer
      containerClassName="bg-[#FBF8F1]"
      className="px-5"
      edges={["top", "left", "right"]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>BIBLIA CLARA</Text>
            <Text style={styles.title}>Lee. Comprende. Vive.</Text>
          </View>
          <View style={styles.logoMark}>
            <Text style={styles.logoGlyph}>✦</Text>
          </View>
        </View>
        <Pressable
          style={({ pressed }) => [
            styles.statusCard,
            pressed && modelCopy.action && styles.pressed,
          ]}
          onPress={() => {
            void handleModelAction();
          }}
        >
          <View
            style={[
              styles.statusIcon,
              modelStatus.state !== "ready" && styles.statusIconPending,
            ]}
          >
            <Text style={styles.statusIconText}>✦</Text>
          </View>
          <View style={styles.statusCopy}>
            <Text style={styles.statusTitle}>{modelCopy.title}</Text>
            <Text style={styles.statusText}>{modelCopy.text}</Text>
          </View>
          {modelCopy.action ? (
            <Text style={styles.statusAction}>{modelCopy.action}</Text>
          ) : (
            <View
              style={[
                styles.readyDot,
                modelStatus.state !== "ready" && styles.readyDotPending,
              ]}
            />
          )}
        </Pressable>
        <View style={styles.selectorRow}>
          <Pressable
            style={({ pressed }) => [
              styles.selector,
              pressed && styles.pressed,
            ]}
            onPress={() => setModelPickerVisible(true)}
          >
            <Text style={styles.selectorIcon}>✦</Text>
            <Text style={styles.selectorText}>
              Perfil de IA: {selectedModel.shortName}
            </Text>
            <Text style={styles.chevron}>⌄</Text>
          </Pressable>
        </View>
        <Text style={styles.sectionLabel}>CONTINUAR LEYENDO</Text>
        <Pressable
          style={({ pressed }) => [styles.readCard, pressed && styles.pressed]}
        >
          <View style={styles.readTop}>
            <Text style={styles.bookLabel}>{book.name.toUpperCase()}</Text>
            <Text style={styles.chapterLabel}>CAPÍTULO {chapter}</Text>
          </View>
          <Text style={styles.readTitle}>Biblia completa sin conexión</Text>
          <Text style={styles.readDescription}>
            Toca cualquier versículo del capítulo para recibir una explicación
            sencilla.
          </Text>
          <View style={styles.progressTrack}>
            <View style={styles.progressFill} />
          </View>
          <View style={styles.readBottom}>
            <Text style={styles.progressText}>
              {book.name} {chapter}:{firstVerseNumber}–{lastVerseNumber}
            </Text>
            <Text style={styles.arrow}>›</Text>
          </View>
        </Pressable>
        <View style={styles.selectorRow}>
          <Pressable
            style={({ pressed }) => [
              styles.selector,
              pressed && styles.pressed,
            ]}
            onPress={() => setPicker("book")}
          >
            <Text style={styles.selectorIcon}>▤</Text>
            <Text style={styles.selectorText}>Elegir libro</Text>
            <Text style={styles.chevron}>⌄</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.selector,
              pressed && styles.pressed,
            ]}
            onPress={() => setPicker("chapter")}
          >
            <Text style={styles.selectorIcon}>#</Text>
            <Text style={styles.selectorText}>Capítulo</Text>
            <Text style={styles.chevron}>⌄</Text>
          </Pressable>
        </View>
        <View style={styles.readerHeader}>
          <View>
            <Text style={styles.sectionLabel}>LECTURA ACTUAL</Text>
            <Text style={styles.readerTitle}>
              {book.name} {chapter}
            </Text>
          </View>
          <Pressable
            onPress={() => setFontLarge(!fontLarge)}
            style={styles.textButton}
          >
            <Text style={styles.textButtonLabel}>
              A<Text style={styles.smallA}>A</Text>
            </Text>
          </Pressable>
        </View>
        <View style={styles.verseCard}>
          {chapterVerses.map((verse) => {
            const verseKey = makeVerseKey(book.id, chapter, verse.number);
            const isSaved = saved.includes(verseKey);
            return (
              <Pressable
                key={verse.number}
                onPress={() => {
                  setExplanation("");
                  setExplanationState("idle");
                  setSelectedVerse(verse);
                }}
                style={({ pressed }) => [
                  styles.verseRow,
                  pressed && styles.versePressed,
                ]}
              >
                <Text
                  style={[styles.verseNumber, isSaved && styles.savedNumber]}
                >
                  {verse.number}
                </Text>
                <Text
                  style={[styles.verseText, fontLarge && styles.verseTextLarge]}
                >
                  {verse.text}
                </Text>
                {isSaved && <Text style={styles.savedStar}>★</Text>}
              </Pressable>
            );
          })}
          <Text style={styles.sourceNote}>
            {BIBLE_TRANSLATION.attribution} Texto sin adaptar.
          </Text>
        </View>
      </ScrollView>
      <LocalModelProfilePicker
        visible={modelPickerVisible}
        profiles={LOCAL_MODELS}
        selectedId={selectedModel.id}
        isDownloading={modelStatus.state === "downloading"}
        onClose={() => setModelPickerVisible(false)}
        onSelect={(modelId) => {
          void chooseModel(modelId);
        }}
      />
      <Modal
        visible={picker !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setPicker(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>
                {picker === "book"
                  ? "Elegir libro"
                  : `${book.name}: elegir capítulo`}
              </Text>
              <Pressable onPress={() => setPicker(null)}>
                <Text style={styles.close}>Cerrar</Text>
              </Pressable>
            </View>
            {picker === "book" ? (
              <ScrollView style={styles.modalList}>
                {["Antiguo", "Nuevo"].map((testament) => (
                  <View key={testament}>
                    <Text style={styles.groupTitle}>
                      {testament} Testamento
                    </Text>
                    {BIBLE_BOOKS.filter(
                      (item) => item.testament === testament,
                    ).map((item) => (
                      <Pressable
                        key={item.name}
                        style={styles.bookRow}
                        onPress={() => chooseBook(item)}
                      >
                        <Text
                          style={[
                            styles.bookRowText,
                            item.name === book.name && styles.selectedText,
                          ]}
                        >
                          {item.name}
                        </Text>
                        <Text style={styles.bookRowMeta}>
                          {item.chapters} cap.
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                ))}
              </ScrollView>
            ) : (
              <ScrollView contentContainerStyle={styles.chapterGrid}>
                {Array.from(
                  { length: book.chapters },
                  (_, index) => index + 1,
                ).map((item) => (
                  <Pressable
                    key={item}
                    style={[
                      styles.chapterButton,
                      item === chapter && styles.chapterSelected,
                    ]}
                    onPress={() => {
                      setChapter(item);
                      setPicker(null);
                    }}
                  >
                    <Text
                      style={[
                        styles.chapterText,
                        item === chapter && styles.chapterTextSelected,
                      ]}
                    >
                      {item}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
      <Modal
        visible={selectedVerse !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedVerse(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.explanationSheet}>
            <View style={styles.sheetHandle} />
            <View style={styles.explanationHeader}>
              <View>
                <Text style={styles.explanationKicker}>
                  EXPLICACIÓN SENCILLA
                </Text>
                <Text style={styles.explanationTitle}>
                  {book.name} {chapter}:{selectedVerse?.number}
                </Text>
              </View>
              <Pressable onPress={() => setSelectedVerse(null)}>
                <Text style={styles.close}>×</Text>
              </Pressable>
            </View>
            <View style={styles.quote}>
              <Text style={styles.quoteText}>“{selectedVerse?.text}”</Text>
            </View>
            {explanationState === "generating" && (
              <View style={styles.modelNotice}>
                <Text style={styles.modelNoticeTitle}>
                  Preparando una explicación clara…
                </Text>
                <Text style={styles.modelNoticeText}>
                  La IA {selectedModel.shortName} está trabajando en tu
                  dispositivo.
                </Text>
              </View>
            )}
            {explanationState === "needs-model" && (
              <View style={styles.modelNotice}>
                <Text style={styles.modelNoticeTitle}>
                  Descarga la IA {selectedModel.shortName}
                </Text>
                <Text style={styles.modelNoticeText}>
                  El modelo ocupa {selectedModel.estimatedSizeLabel} y permite
                  explicar versículos sin usar una API.
                </Text>
                <Pressable
                  style={styles.downloadButton}
                  onPress={() => {
                    void handleModelAction();
                  }}
                >
                  <Text style={styles.downloadButtonText}>
                    {modelStatus.state === "downloading"
                      ? "Cancelar descarga"
                      : "Descargar IA"}
                  </Text>
                </Pressable>
              </View>
            )}
            {explanationState === "unavailable" && (
              <View style={styles.modelNotice}>
                <Text style={styles.modelNoticeTitle}>
                  Disponible en la aplicación Android
                </Text>
                <Text style={styles.modelNoticeText}>
                  Instala el APK para descargar el modelo y generar
                  explicaciones sin conexión.
                </Text>
              </View>
            )}
            {(explanationState === "idle" || explanationState === "error") && (
              <Text style={styles.explanationText}>{explanation}</Text>
            )}
            <Text style={styles.disclaimer}>
              Explicación orientativa generada localmente. Lee también el
              contexto del capítulo.
            </Text>
            <View style={styles.actionRow}>
              <Pressable
                style={styles.saveButton}
                onPress={() => {
                  if (selectedVerse)
                    setSaved((current) => {
                      const verseKey = makeVerseKey(
                        book.id,
                        chapter,
                        selectedVerse.number,
                      );
                      return current.includes(verseKey)
                        ? current.filter((key) => key !== verseKey)
                        : [...current, verseKey];
                    });
                }}
              >
                <Text style={styles.saveButtonText}>
                  {selectedVerse &&
                  saved.includes(
                    makeVerseKey(book.id, chapter, selectedVerse.number),
                  )
                    ? "★ Guardado"
                    : "☆ Guardar"}
                </Text>
              </Pressable>
              <Pressable
                style={styles.contextButton}
                onPress={() => setSelectedVerse(null)}
              >
                <Text style={styles.contextButtonText}>Volver al capítulo</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 16, paddingBottom: 48 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 22,
  },
  eyebrow: {
    color: palette.gold,
    fontSize: 12,
    letterSpacing: 2.2,
    fontWeight: "800",
  },
  title: {
    color: palette.navy,
    fontSize: 25,
    fontWeight: "800",
    marginTop: 5,
    letterSpacing: -0.5,
  },
  logoMark: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: palette.navy,
    alignItems: "center",
    justifyContent: "center",
  },
  logoGlyph: { color: palette.gold, fontSize: 23 },
  statusCard: {
    backgroundColor: "#EEF3ED",
    borderRadius: 18,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 28,
  },
  statusIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: palette.sage,
    alignItems: "center",
    justifyContent: "center",
  },
  statusIconPending: { backgroundColor: palette.gold },
  statusIconText: { color: palette.white, fontSize: 15 },
  statusCopy: { flex: 1, marginLeft: 11 },
  statusTitle: { color: palette.sage, fontWeight: "800", fontSize: 14 },
  statusText: { color: "#617262", fontSize: 12, marginTop: 2 },
  statusAction: {
    color: palette.navy,
    fontSize: 12,
    fontWeight: "800",
    marginLeft: 8,
  },
  readyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: palette.sage,
  },
  readyDotPending: { backgroundColor: palette.gold },
  sectionLabel: {
    color: palette.muted,
    fontSize: 11,
    letterSpacing: 1.6,
    fontWeight: "800",
    marginBottom: 9,
  },
  readCard: {
    backgroundColor: palette.navy,
    borderRadius: 23,
    padding: 20,
    marginBottom: 14,
  },
  pressed: { opacity: 0.82, transform: [{ scale: 0.99 }] },
  readTop: { flexDirection: "row", justifyContent: "space-between" },
  bookLabel: {
    color: palette.gold,
    fontWeight: "800",
    fontSize: 11,
    letterSpacing: 1.4,
  },
  chapterLabel: {
    color: "#A9B8C9",
    fontWeight: "700",
    fontSize: 11,
    letterSpacing: 0.6,
  },
  readTitle: {
    color: palette.white,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "800",
    marginTop: 22,
  },
  readDescription: {
    color: "#B8C4D1",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
    maxWidth: 250,
  },
  progressTrack: {
    height: 5,
    borderRadius: 3,
    backgroundColor: "#425875",
    marginTop: 23,
  },
  progressFill: {
    height: 5,
    width: "34%",
    borderRadius: 3,
    backgroundColor: palette.gold,
  },
  readBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },
  progressText: { color: "#C5CFD9", fontSize: 12 },
  arrow: { color: palette.gold, fontSize: 27, lineHeight: 24 },
  selectorRow: { flexDirection: "row", gap: 10, marginBottom: 28 },
  selector: {
    flex: 1,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: palette.paper,
    borderRadius: 14,
    padding: 13,
    flexDirection: "row",
    alignItems: "center",
  },
  selectorIcon: {
    color: palette.gold,
    fontWeight: "800",
    fontSize: 17,
    marginRight: 7,
  },
  selectorText: {
    flex: 1,
    color: palette.ink,
    fontWeight: "700",
    fontSize: 13,
  },
  chevron: { color: palette.muted, fontSize: 17 },
  readerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 12,
  },
  readerTitle: { color: palette.navy, fontSize: 23, fontWeight: "800" },
  textButton: {
    width: 40,
    height: 34,
    borderRadius: 11,
    backgroundColor: palette.goldSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  textButtonLabel: { color: palette.navy, fontSize: 17, fontWeight: "800" },
  smallA: { fontSize: 11 },
  verseCard: {
    backgroundColor: palette.paper,
    borderRadius: 20,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: palette.line,
  },
  verseRow: {
    paddingHorizontal: 16,
    paddingVertical: 15,
    flexDirection: "row",
    alignItems: "flex-start",
    borderBottomWidth: 1,
    borderBottomColor: "#F0ECE4",
    minHeight: 67,
  },
  versePressed: { backgroundColor: "#FFF8E9" },
  verseNumber: {
    color: palette.gold,
    fontSize: 13,
    fontWeight: "800",
    width: 27,
    paddingTop: 2,
  },
  savedNumber: { color: palette.sage },
  verseText: { color: palette.ink, fontSize: 17, lineHeight: 26, flex: 1 },
  verseTextLarge: { fontSize: 20, lineHeight: 30 },
  savedStar: { color: palette.gold, marginLeft: 8, fontSize: 12 },
  sourceNote: {
    color: palette.muted,
    fontSize: 12,
    lineHeight: 18,
    padding: 16,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(11,24,40,0.45)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: palette.ivory,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: "82%",
    padding: 20,
    paddingTop: 11,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 3,
    backgroundColor: "#D6D0C4",
    alignSelf: "center",
    marginBottom: 17,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 17,
  },
  sheetTitle: { color: palette.navy, fontSize: 21, fontWeight: "800" },
  close: { color: palette.sage, fontWeight: "800", fontSize: 14 },
  modalList: { paddingBottom: 20 },
  groupTitle: {
    color: palette.muted,
    fontSize: 11,
    letterSpacing: 1.4,
    fontWeight: "800",
    marginTop: 10,
    marginBottom: 4,
  },
  bookRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: palette.line,
  },
  bookRowText: { color: palette.ink, fontSize: 17, fontWeight: "700" },
  selectedText: { color: palette.gold },
  bookRowMeta: { color: palette.muted, fontSize: 12 },
  chapterGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    paddingBottom: 25,
  },
  chapterButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: palette.paper,
    alignItems: "center",
    justifyContent: "center",
  },
  chapterSelected: { backgroundColor: palette.navy, borderColor: palette.navy },
  chapterText: { color: palette.ink, fontWeight: "700" },
  chapterTextSelected: { color: palette.white },
  explanationSheet: {
    backgroundColor: palette.ivory,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    paddingTop: 11,
  },
  explanationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  explanationKicker: {
    color: palette.gold,
    fontSize: 11,
    letterSpacing: 1.5,
    fontWeight: "800",
  },
  explanationTitle: {
    color: palette.navy,
    fontSize: 24,
    fontWeight: "800",
    marginTop: 5,
  },
  quote: {
    marginTop: 19,
    borderLeftWidth: 3,
    borderLeftColor: palette.gold,
    paddingLeft: 14,
    paddingVertical: 4,
  },
  quoteText: {
    color: palette.ink,
    fontSize: 16,
    lineHeight: 24,
    fontStyle: "italic",
  },
  explanationText: {
    color: palette.ink,
    fontSize: 17,
    lineHeight: 27,
    marginTop: 20,
  },
  modelNotice: {
    marginTop: 20,
    padding: 16,
    borderRadius: 16,
    backgroundColor: palette.goldSoft,
  },
  modelNoticeTitle: { color: palette.navy, fontWeight: "800", fontSize: 16 },
  modelNoticeText: {
    color: palette.ink,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 5,
  },
  downloadButton: {
    alignSelf: "flex-start",
    marginTop: 13,
    backgroundColor: palette.navy,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  downloadButtonText: { color: palette.white, fontWeight: "800", fontSize: 13 },
  disclaimer: {
    color: palette.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 17,
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 22,
    paddingBottom: 18,
  },
  saveButton: {
    backgroundColor: palette.navy,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 17,
  },
  saveButtonText: { color: palette.white, fontWeight: "800", fontSize: 13 },
  contextButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: palette.line,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  contextButtonText: { color: palette.navy, fontWeight: "800", fontSize: 13 },
});
