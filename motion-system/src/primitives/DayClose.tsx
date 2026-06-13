/**
 * <DayClose> — Quiet tier (daily completion).
 *
 * Fires once per day, when the last task is completed.
 *
 * Composition (~700ms total):
 *   0–400ms   ring expands smoothly to "complete" state
 *   200–500ms "Kun yopildi" fades in
 *   400–700ms streak sub line fades in (quiet, neutral)
 *   200–800ms halo glow puffs and dissipates (subtle)
 *
 * No particles, no burst, no kinetic text. Identity belongs to NOTABLE+.
 */
import React, { useEffect } from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { duration, ease, palette, UserMotionState } from '../tokens';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useRestraintIntensity } from '../hooks/useRestraintIntensity';
import { getIdentityMessage } from '../messages/identity';

export interface DayCloseProps {
  /** Day's progress 0..1 (typically 1.0 when this fires). */
  ringProgress: number;
  /** Current motion state — used to scale the halo glow. */
  motionState: UserMotionState;
  /** Fires when the animation sequence completes (≈800ms). */
  onDone?: () => void;
  testID?: string;
}

export function DayClose({
  ringProgress,
  motionState,
  onDone,
  testID,
}: DayCloseProps): React.ReactElement {
  const reduced = useReducedMotion();
  const restraint = useRestraintIntensity(motionState);

  const ring = useSharedValue(0);
  const halo = useSharedValue(0);
  const primary = useSharedValue(0);
  const sub = useSharedValue(0);

  const msg = getIdentityMessage({
    tier: 'quiet',
    streak: motionState.streak,
  });

  useEffect(() => {
    if (reduced) {
      ring.value = ringProgress;
      primary.value = 1;
      sub.value = 0.75;
      const t = setTimeout(() => onDone?.(), 400);
      return () => clearTimeout(t);
    }

    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }

    // Ring fills smoothly — no shimmer, no flash.
    ring.value = withTiming(ringProgress, {
      duration: duration.emphasized,
      easing: Easing.bezier(...ease.standard),
    });

    // Halo: puff in, then dissipate — restraint dampens the peak.
    halo.value = withDelay(
      duration.emphasized * 0.4,
      withSequence(
        withTiming(0.25 * restraint, {
          duration: duration.emphasized,
          easing: Easing.bezier(...ease.standard),
        }),
        withTiming(0, {
          duration: duration.emphasized,
          easing: Easing.bezier(...ease.exit),
        }),
      ),
    );

    // Text — staggered fade-in.
    primary.value = withDelay(
      duration.quick,
      withTiming(1, {
        duration: duration.standard,
        easing: Easing.bezier(...ease.standard),
      }),
    );
    sub.value = withDelay(
      duration.standard,
      withTiming(0.75, {
        duration: duration.standard,
        easing: Easing.bezier(...ease.standard),
      }),
    );

    const t = setTimeout(() => onDone?.(), 800);
    return () => clearTimeout(t);
  }, [reduced, restraint, ringProgress]);

  // Ring presence: subtle scale + opacity follow progress.
  const ringStyle = useAnimatedStyle(() => ({
    opacity: 0.4 + ring.value * 0.6,
    transform: [{ scale: 0.95 + ring.value * 0.05 }],
  }));

  const haloStyle = useAnimatedStyle(() => ({
    opacity: halo.value,
    transform: [{ scale: 1 + halo.value * 0.35 }],
  }));

  const primaryStyle = useAnimatedStyle(() => ({ opacity: primary.value }));
  const subStyle = useAnimatedStyle(() => ({ opacity: sub.value }));

  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.ringWrap}>
        <Animated.View style={[styles.halo, haloStyle]} />
        <Animated.View style={[styles.ring, ringStyle]}>
          <View style={styles.checkMark} />
        </Animated.View>
      </View>
      {msg && (
        <>
          <Animated.Text style={[styles.primary, primaryStyle]}>
            {msg.primary}
          </Animated.Text>
          {msg.sub ? (
            <Animated.Text style={[styles.sub, subStyle]}>
              {msg.sub}
            </Animated.Text>
          ) : null}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 28,
  },
  ringWrap: {
    width: 88,
    height: 88,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  halo: {
    position: 'absolute',
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: palette.accent.glow,
  },
  ring: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: palette.accent.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: {
    width: 12,
    height: 7,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: palette.accent.primary,
    transform: [{ rotate: '-45deg' }],
    marginTop: -2,
  },
  primary: {
    fontSize: 16,
    fontStyle: 'italic',
    color: palette.text.primary,
    textAlign: 'center',
    lineHeight: 22,
    fontFamily: Platform.select({
      ios: 'Cormorant Garamond',
      android: 'serif',
      default: '"Cormorant Garamond", serif',
    }),
  },
  sub: {
    marginTop: 6,
    fontSize: 11,
    color: palette.text.dim,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});
