import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { LocalModelProfile, LocalModelProfileId } from "@/lib/local-ai";

const colors = {
  navy: "#162A46",
  ivory: "#FBF8F1",
  paper: "#FFFDF8",
  gold: "#C79A45",
  goldSoft: "#F2E8D2",
  ink: "#263342",
  muted: "#718096",
  line: "#E9E3D7",
  sage: "#6B8570",
  white: "#FFFFFF",
};

type LocalModelProfilePickerProps = {
  visible: boolean;
  profiles: readonly LocalModelProfile[];
  selectedId: LocalModelProfileId;
  isDownloading: boolean;
  onClose: () => void;
  onSelect: (id: LocalModelProfileId) => void;
};

export function LocalModelProfilePicker({
  visible,
  profiles,
  selectedId,
  isDownloading,
  onClose,
  onSelect,
}: LocalModelProfilePickerProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <View>
              <Text style={styles.kicker}>IA LOCAL</Text>
              <Text style={styles.title}>Elige la calidad</Text>
            </View>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [
                styles.closeButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.closeText}>Cerrar</Text>
            </Pressable>
          </View>
          <Text style={styles.intro}>
            Elige solo un perfil para usar. Los modelos se descargan cuando tú
            lo indiques y funcionan sin API.
          </Text>
          {isDownloading && (
            <View style={styles.downloadNotice}>
              <Text style={styles.downloadNoticeText}>
                Termina o cancela la descarga actual antes de cambiar de perfil.
              </Text>
            </View>
          )}
          <ScrollView
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          >
            {profiles.map((profile) => {
              const selected = profile.id === selectedId;
              return (
                <Pressable
                  key={profile.id}
                  disabled={isDownloading}
                  onPress={() => onSelect(profile.id)}
                  style={({ pressed }) => [
                    styles.card,
                    selected && styles.cardSelected,
                    pressed && !isDownloading && styles.pressed,
                    isDownloading && styles.disabled,
                  ]}
                >
                  <View style={styles.cardHeader}>
                    <View style={styles.titleGroup}>
                      <Text style={styles.cardTitle}>{profile.shortName}</Text>
                      {profile.isRecommended && (
                        <Text style={styles.recommended}>RECOMENDADO</Text>
                      )}
                    </View>
                    {selected && <Text style={styles.selected}>✓ Elegido</Text>}
                  </View>
                  <Text style={styles.description}>{profile.description}</Text>
                  <View style={styles.metaRow}>
                    <View style={styles.metaPill}>
                      <Text style={styles.metaText}>
                        {profile.estimatedSizeLabel}
                      </Text>
                    </View>
                    <Text style={styles.storage}>
                      {profile.recommendedFreeStorageLabel}
                    </Text>
                  </View>
                  <Text style={styles.deviceNote}>{profile.deviceNote}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
          <Text style={styles.disclaimer}>
            La calidad y la velocidad dependen de la memoria y el procesador del
            teléfono.
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(11,24,40,0.45)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: colors.ivory,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: "88%",
    padding: 20,
    paddingTop: 11,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 3,
    backgroundColor: "#D6D0C4",
    alignSelf: "center",
    marginBottom: 17,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  kicker: {
    color: colors.gold,
    fontSize: 11,
    letterSpacing: 1.5,
    fontWeight: "800",
  },
  title: { color: colors.navy, fontSize: 23, fontWeight: "800", marginTop: 4 },
  closeButton: { paddingHorizontal: 8, paddingVertical: 7, borderRadius: 10 },
  closeText: { color: colors.sage, fontWeight: "800", fontSize: 14 },
  intro: { color: colors.muted, fontSize: 13, lineHeight: 19, marginTop: 13 },
  downloadNotice: {
    backgroundColor: colors.goldSoft,
    borderRadius: 12,
    marginTop: 13,
    padding: 11,
  },
  downloadNoticeText: {
    color: colors.ink,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
  },
  list: { gap: 10, paddingTop: 17, paddingBottom: 8 },
  card: {
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 18,
    padding: 15,
  },
  cardSelected: { borderColor: colors.sage, backgroundColor: "#EEF3ED" },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  titleGroup: { flexDirection: "row", alignItems: "center", gap: 8 },
  cardTitle: { color: colors.navy, fontSize: 17, fontWeight: "800" },
  recommended: {
    color: colors.sage,
    backgroundColor: "#DCE8DC",
    borderRadius: 6,
    fontSize: 9,
    letterSpacing: 0.7,
    fontWeight: "800",
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  selected: { color: colors.sage, fontSize: 12, fontWeight: "800" },
  description: {
    color: colors.ink,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 7,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    marginTop: 12,
  },
  metaPill: {
    backgroundColor: colors.goldSoft,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  metaText: { color: colors.navy, fontSize: 11, fontWeight: "800" },
  storage: { color: colors.muted, fontSize: 12, fontWeight: "700" },
  deviceNote: {
    color: colors.muted,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 8,
  },
  disclaimer: {
    color: colors.muted,
    fontSize: 11,
    lineHeight: 16,
    paddingTop: 10,
    paddingBottom: 4,
  },
  pressed: { opacity: 0.82, transform: [{ scale: 0.99 }] },
  disabled: { opacity: 0.55 },
});
