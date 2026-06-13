/**
 * <StreakCounter> — Home screen integration.
 *
 * Display rules:
 *   - Number is always shown quietly (no flame, no glow by default).
 *   - AmbientPulse fires ONLY when streak >= 30: a very slow breathing glow,
 *     dampened further by restraint multiplier. Presence, not invitation.
 *   - Reduce-motion: pulse is disabled entirely.
 *
 * Identity belongs in the message ABOVE this counter ("Siz N kun davomida...").
 * This counter is plain presence: "still here".
 */
import React, { useEffect } from 'react';
import { StyleSheet, View, Text, Platform } from 'react-native';
import Animated, {
  cancelAnimation,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { duration, ease, palette, UserMotionState } from '../tokens';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useRestraintIntensity } from '../hooks/useRestraintIntensity';

export interface StreakCounterProps {
  streak: number;
  /** Short label below the number — default "kun yo'l". */
  label?: string;
  motionState: UserMotionState;
  testID?: string;
}

export function StreakCounter({
  streak,
  label = "kun yo'l",
  motionState,
  testID,
}: StreakCounterProps): React.ReactElement {
  const reduced = useReducedMotion();
  const restraint = useRestraintIntensity(motionState);

  // AmbientPulse fires ONLY when streak >= 30 (identity-bound user).
  const showPulse = streak >= 30 && !reduced;
  const pulse = useSharedValue(0);

  useEffect(() => {
    if (!showPulse) {
      cancelAnimation(pulse);
      pulse.value = 0;
      return;
    }

    // Very slow breathing — presence, not invitation.
    // Restraint dampens the high point.
    pulse.value = withRepeat(
      withSequence(
        withTiming(0.18 * restraint, {
          duration: duration.ambient,
          easing: Easing.bezier(...ease.standard),
        }),
        withTiming(0.08 * restraint, {
          duration: duration.ambient,
          easing: Easing.bezier(...ease.standard),
        }),
      ),
      -1,
      false,
    );

    return () => cancelAnimation(pulse);
  }, [showPulse, restraint]);

  const haloStyle = useAnimatedStyle(() => ({
    opacity: pulse.value,
    transform: [{ scale: 1 + pulse.value * 0.15 }],
  }));

  return (
    <View style={styles.container} testID={testID}>
      {showPulse ? (
        <Animated.View
          pointerEvents="none"
          style={[styles.halo, haloStyle]}
        />
      ) : null}
      <Text style={styles.number}>{streak}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  halo: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: palette.accent.glow,
  },
  number: {
    fontSize: 52,
    color: palette.accent.primary,
    fontWeight: '500',
    lineHeight: 56,
    fontFamily: Platform.select({
      ios: 'Cormorant Garamond',
      android: 'serif',
      default: '"Cormorant Garamond", serif',
    }),
  },
  label: {
    fontSize: 10,
    color: palette.text.dim,
    letterSpacing: 4,
    textTransform: 'uppercase',
    marginTop: 4,
  },
});
