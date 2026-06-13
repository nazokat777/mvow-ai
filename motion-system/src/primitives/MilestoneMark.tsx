/**
 * <MilestoneMark> — Notable tier (streak milestones, 50%-of-goal, perfect month).
 *
 * The flame IGNITES only here — never during ordinary completion.
 * Color reflects streak depth:
 *   7–29  → novice (yellow)
 *   30–99 → steady (pink)
 *   100+  → deep   (red)
 *
 * Composition (~1500ms total):
 *   0–500ms   flame springs in (bouncy) + glow halo grows
 *   400–900ms identity message fades in (Garamond italic)
 *   800–1300ms sub message fades in
 *   1500ms    onDone fires
 *
 * Identity belongs HERE, not earlier. The text is the actual reward.
 */
import React, { useEffect } from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import {
  duration,
  ease,
  spring,
  palette,
  UserMotionState,
} from '../tokens';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useRestraintIntensity } from '../hooks/useRestraintIntensity';
import { getIdentityMessage } from '../messages/identity';

export interface MilestoneMarkProps {
  /** Current streak in days — also drives flame color. */
  streak: number;
  /** Goal text — woven into the identity sentence when set. */
  goalText?: string;
  /** True if the trigger is a perfect month (30/30 tasks). */
  perfectMonth?: boolean;
  motionState: UserMotionState;
  onDone?: () => void;
  testID?: string;
}

function flameColorFor(streak: number): string {
  if (streak >= 100) return palette.flame.deep;
  if (streak >= 30) return palette.flame.steady;
  return palette.flame.novice;
}

export function MilestoneMark({
  streak,
  goalText,
  perfectMonth,
  motionState,
  onDone,
  testID,
}: MilestoneMarkProps): React.ReactElement | null {
  const reduced = useReducedMotion();
  const restraint = useRestraintIntensity(motionState);

  const flameScale = useSharedValue(0);
  const flameGlow = useSharedValue(0);
  const primary = useSharedValue(0);
  const sub = useSharedValue(0);

  const msg = getIdentityMessage({
    tier: 'notable',
    streak,
    goalText,
    perfectMonth,
  });

  const flameColor = flameColorFor(streak);

  useEffect(() => {
    if (reduced) {
      flameScale.value = 1;
      flameGlow.value = 0.4;
      primary.value = 1;
      sub.value = 0.85;
      const t = setTimeout(() => onDone?.(), 600);
      return () => clearTimeout(t);
    }

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    }

    // Flame ignites — spring for the "ignition" feel.
    flameScale.value = withSpring(restraint, spring.bouncy);
    flameGlow.value = withTiming(0.5 * restraint, {
      duration: duration.emphasized,
      easing: Easing.bezier(...ease.standard),
    });

    // Identity text — staggered, with breathing space.
    primary.value = withDelay(
      duration.emphasized,
      withTiming(1, {
        duration: duration.standard,
        easing: Easing.bezier(...ease.standard),
      }),
    );
    sub.value = withDelay(
      duration.emphasized + duration.standard,
      withTiming(0.85, {
        duration: duration.standard,
        easing: Easing.bezier(...ease.standard),
      }),
    );

    const t = setTimeout(() => onDone?.(), 1500);
    return () => clearTimeout(t);
  }, [reduced, restraint, streak]);

  const flameStyle = useAnimatedStyle(() => ({
    transform: [{ scale: flameScale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: flameGlow.value,
    transform: [{ scale: 1 + flameGlow.value * 0.4 }],
  }));

  const primaryStyle = useAnimatedStyle(() => ({ opacity: primary.value }));
  const subStyle = useAnimatedStyle(() => ({ opacity: sub.value }));

  if (!msg) return null;

  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.flameWrap}>
        <Animated.View style={[styles.glow, glowStyle, { backgroundColor: palette.flame.glow }]} />
        <Animated.View style={[styles.flame, flameStyle, { backgroundColor: flameColor }]}>
          <Animated.Text style={styles.flameNumber}>{streak}</Animated.Text>
        </Animated.View>
      </View>

      <Animated.Text style={[styles.primary, primaryStyle]}>
        {msg.primary}
      </Animated.Text>
      {msg.sub ? (
        <Animated.Text style={[styles.sub, subStyle]}>{msg.sub}</Animated.Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingVertical: 36,
  },
  flameWrap: {
    width: 96,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
  },
  glow: {
    position: 'absolute',
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  flame: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flameNumber: {
    fontSize: 22,
    fontWeight: '600',
    color: palette.bg.void,
    letterSpacing: 0.5,
  },
  primary: {
    fontSize: 19,
    fontStyle: 'italic',
    color: palette.identity,
    textAlign: 'center',
    lineHeight: 26,
    maxWidth: 280,
    fontFamily: Platform.select({
      ios: 'Cormorant Garamond',
      android: 'serif',
      default: '"Cormorant Garamond", serif',
    }),
  },
  sub: {
    marginTop: 10,
    fontSize: 13,
    color: palette.text.dim,
    textAlign: 'center',
    letterSpacing: 0.4,
    maxWidth: 280,
  },
});
