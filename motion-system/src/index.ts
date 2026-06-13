// Public API.
// Consumers import from 'brend-motion'.

// Tokens & types
export {
  duration,
  ease,
  spring,
  palette,
  glow,
  Tier,
  Intensity,
  computeRestraint,
} from './tokens';
export type {
  DurationKey,
  EaseKey,
  SpringKey,
  UserMotionState,
} from './tokens';

// Hooks
export { useReducedMotion } from './hooks/useReducedMotion';
export { useRestraintIntensity } from './hooks/useRestraintIntensity';

// Messages
export { getIdentityMessage } from './messages/identity';
export type { IdentityInput, IdentityMessage } from './messages/identity';

// Primitives
export { QuietConfirm } from './primitives/QuietConfirm';
export type { QuietConfirmProps } from './primitives/QuietConfirm';

export { DayClose } from './primitives/DayClose';
export type { DayCloseProps } from './primitives/DayClose';

export { MilestoneMark } from './primitives/MilestoneMark';
export type { MilestoneMarkProps } from './primitives/MilestoneMark';

export { StreakCounter } from './primitives/StreakCounter';
export type { StreakCounterProps } from './primitives/StreakCounter';

// Debug
export { MotionDebugPanel } from './debug/MotionDebugPanel';
export type { MotionDebugPanelProps } from './debug/MotionDebugPanel';
