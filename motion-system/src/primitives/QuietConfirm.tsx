/**
 * <QuietConfirm> — Micro tier (every task completion).
 *
 * Design contract:
 *  - NO particles, NO burst, NO kinetic text, NO sound.
 *  - The "reward" is simply that the row moved to a done state.
 *  - Animation NEVER blocks the press — onPress fires immediately.
 *  - Reduce-motion: instant state, no animation.
 */
import React, { useEffect } from 'react';
import { StyleSheet, View, Text, Pressable, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { duration, ease, palette } from '../tokens';
import { useReducedMotion } from '../hooks/useReducedMotion';

export interface QuietConfirmProps {
  /** Whether the task is currently completed. */
  done: boolean;
  /** Task label (rendered with done-state styling). */
  label: string;
  /** Optional meta text — e.g. time + duration. */
  meta?: string;
  /** Fires immediately on press (before animation). */
  onPress?: () => void;
  testID?: string;
}

export function QuietConfirm({
  done,
  label,
  meta,
  onPress,
  testID,
}: QuietConfirmProps): React.ReactElement {
  const reduced = useReducedMotion();
  const progress = useSharedValue(done ? 1 : 0);

  useEffect(() => {
    if (reduced) {
      progress.value = done ? 1 : 0;
      return;
    }
    progress.value = withTiming(done ? 1 : 0, {
      duration: duration.micro,
      easing: Easing.bezier(...ease.standard),
    });
  }, [done, reduced]);

  const checkStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: 0.85 + progress.value * 0.15 }],
  }));

  const strikeStyle = useAnimatedStyle(() => ({
    // width animation keeps the line aligned to the left edge.
    width: `${progress.value * 100}%`,
  }));

  const labelStyle = useAnimatedStyle(() => ({
    opacity: 1 - progress.value * 0.4, // dim slightly when done
  }));

  const handlePress = (): void => {
    // Haptic + callback fire BEFORE animation — animation never blocks UX.
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync().catch(() => {});
    }
    onPress?.();
  };

  return (
    <Pressable
      onPress={handlePress}
      testID={testID}
      style={styles.row}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: done }}
      accessibilityLabel={label}
    >
      <View style={styles.checkSlot}>
        {/* Empty ring (always present) */}
        <View style={styles.checkRing} />
        {/* Filled tick (animates in) */}
        <Animated.View style={[styles.checkFill, checkStyle]}>
          <View style={styles.checkMark} />
        </Animated.View>
      </View>

      <View style={styles.body}>
        <Animated.Text style={[styles.label, labelStyle]} numberOfLines={2}>
          {label}
        </Animated.Text>
        {meta ? <Text style={styles.meta}>{meta}</Text> : null}
        {/* Strike line sweeps left → right via width */}
        <Animated.View style={[styles.strike, strikeStyle]} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    gap: 14,
  },
  checkSlot: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkRing: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: palette.text.dim,
    opacity: 0.55,
  },
  checkFill: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: palette.accent.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Simple cross-platform check mark — two borders forming an "L" rotated.
  checkMark: {
    width: 10,
    height: 6,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: palette.bg.void,
    transform: [{ rotate: '-45deg' }],
    marginTop: -2,
  },
  body: {
    flex: 1,
    position: 'relative',
  },
  label: {
    fontSize: 15,
    color: palette.text.primary,
    lineHeight: 20,
  },
  meta: {
    fontSize: 11,
    color: palette.text.dim,
    marginTop: 2,
    letterSpacing: 0.3,
  },
  strike: {
    position: 'absolute',
    left: 0,
    top: 9, // align to label baseline
    height: 1,
    backgroundColor: palette.text.dim,
    opacity: 0.6,
  },
});
