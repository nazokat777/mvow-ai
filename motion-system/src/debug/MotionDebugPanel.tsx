/**
 * <MotionDebugPanel> — Developer panel for manual tier triggering.
 *
 * Use during development to iterate on each tier without setting up
 * elaborate user states. Should be gated to dev builds in production.
 *
 * Provides:
 *   - One-click trigger for each tier (Micro → Cinematic).
 *   - Live toggle for the `Intensity` setting (Minimal / Balanced / Energetic).
 *   - Streak override for testing milestones and restraint multipliers.
 */
import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Modal,
  ScrollView,
} from 'react-native';
import { Intensity, Tier, palette } from '../tokens';

export interface MotionDebugPanelProps {
  visible: boolean;
  onClose: () => void;
  /** Fires when the developer chooses a tier to preview. */
  onTrigger: (tier: Tier) => void;
  /** Current celebration intensity (controlled). */
  intensity: Intensity;
  onIntensityChange: (i: Intensity) => void;
  /** Optional streak override — for previewing milestones. */
  streak?: number;
  onStreakChange?: (n: number) => void;
}

const TIERS: ReadonlyArray<{ tier: Tier; label: string; desc: string }> = [
  { tier: 'micro',     label: 'Micro',     desc: 'Vazifa bajarish (shivirlash)' },
  { tier: 'quiet',     label: 'Quiet',     desc: 'Kun yakuni (bosh irg\'atish)' },
  { tier: 'notable',   label: 'Notable',   desc: 'Streak 7/30/50 (qo\'l olishish)' },
  { tier: 'memorable', label: 'Memorable', desc: '100 kun / mukammal oy' },
  { tier: 'cinematic', label: 'Cinematic', desc: 'Maqsad tugadi / yil' },
];

const INTENSITIES: ReadonlyArray<{ value: Intensity; label: string }> = [
  { value: 'minimal',   label: 'Minimal' },
  { value: 'balanced',  label: 'Balanced' },
  { value: 'energetic', label: 'Energetic' },
];

const STREAK_PRESETS: ReadonlyArray<number> = [0, 3, 7, 30, 50, 100, 365];

export function MotionDebugPanel({
  visible,
  onClose,
  onTrigger,
  intensity,
  onIntensityChange,
  streak,
  onStreakChange,
}: MotionDebugPanelProps): React.ReactElement {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.scrim}>
        <View style={styles.card}>
          <Text style={styles.title}>Motion Debug</Text>

          <Text style={styles.sectionLabel}>Tier Trigger</Text>
          <ScrollView style={styles.tierList} bounces={false}>
            {TIERS.map((t) => (
              <Pressable
                key={t.tier}
                style={styles.row}
                onPress={() => onTrigger(t.tier)}
                accessibilityRole="button"
                accessibilityLabel={`Trigger ${t.label}`}
              >
                <View style={styles.rowText}>
                  <Text style={styles.rowLabel}>{t.label}</Text>
                  <Text style={styles.rowDesc}>{t.desc}</Text>
                </View>
                <Text style={styles.go}>▸</Text>
              </Pressable>
            ))}
          </ScrollView>

          <Text style={styles.sectionLabel}>Celebration Intensity</Text>
          <View style={styles.chips}>
            {INTENSITIES.map((i) => {
              const on = intensity === i.value;
              return (
                <Pressable
                  key={i.value}
                  style={[styles.chip, on && styles.chipOn]}
                  onPress={() => onIntensityChange(i.value)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: on }}
                >
                  <Text style={[styles.chipText, on && styles.chipTextOn]}>
                    {i.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {onStreakChange ? (
            <>
              <Text style={styles.sectionLabel}>Streak override</Text>
              <View style={styles.chips}>
                {STREAK_PRESETS.map((n) => {
                  const on = streak === n;
                  return (
                    <Pressable
                      key={n}
                      style={[styles.chipSmall, on && styles.chipOn]}
                      onPress={() => onStreakChange(n)}
                    >
                      <Text style={[styles.chipText, on && styles.chipTextOn]}>{n}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </>
          ) : null}

          <Pressable style={styles.close} onPress={onClose} accessibilityRole="button">
            <Text style={styles.closeText}>Yopish</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.78)',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: palette.bg.elevated,
    borderRadius: 16,
    padding: 18,
    maxHeight: '80%',
  },
  title: {
    color: palette.text.primary,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  sectionLabel: {
    color: palette.text.dim,
    fontSize: 10,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginTop: 14,
    marginBottom: 8,
  },
  tierList: { maxHeight: 280 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: palette.bg.surface,
    borderRadius: 8,
    marginBottom: 6,
  },
  rowText: { flexShrink: 1 },
  rowLabel: { color: palette.text.primary, fontSize: 14, fontWeight: '500' },
  rowDesc: { color: palette.text.dim, fontSize: 11, marginTop: 2 },
  go: { color: palette.accent.primary, fontSize: 18 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: palette.text.dim,
  },
  chipSmall: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.text.dim,
    minWidth: 42,
    alignItems: 'center',
  },
  chipOn: {
    backgroundColor: palette.accent.primary,
    borderColor: palette.accent.primary,
  },
  chipText: { color: palette.text.primary, fontSize: 12 },
  chipTextOn: { color: palette.bg.void, fontWeight: '600' },
  close: {
    marginTop: 18,
    padding: 14,
    alignItems: 'center',
    backgroundColor: palette.bg.surface,
    borderRadius: 8,
  },
  closeText: { color: palette.text.primary, fontSize: 13, letterSpacing: 1 },
});
