/**
 * Hook that returns the current restraint multiplier.
 *
 * Primitives multiply key intensities (scale deltas, opacity peaks, glow strength)
 * by this number. As streak grows, the number drops automatically.
 */
import { useMemo } from 'react';
import { computeRestraint, UserMotionState } from '../tokens';

export function useRestraintIntensity(state: UserMotionState): number {
  return useMemo(
    () => computeRestraint(state),
    [state.streak, state.recovering, state.intensity],
  );
}
