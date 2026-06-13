/**
 * Cross-platform reduce-motion hook.
 * Native: AccessibilityInfo.
 * Web:    matchMedia('(prefers-reduced-motion: reduce)').
 *
 * Every primitive in this system MUST consult this hook before animating.
 * Reduce-motion never disables feedback entirely — it shortens / snaps it.
 */
import { useEffect, useState } from 'react';
import { AccessibilityInfo, Platform } from 'react-native';

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;

    // Web — matchMedia
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      const handler = (): void => {
        if (mounted) setReduced(mq.matches);
      };
      handler();
      mq.addEventListener?.('change', handler);
      return () => {
        mounted = false;
        mq.removeEventListener?.('change', handler);
      };
    }

    // Native — AccessibilityInfo
    AccessibilityInfo.isReduceMotionEnabled().then((v) => {
      if (mounted) setReduced(v);
    });
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', (v) => {
      if (mounted) setReduced(v);
    });
    return () => {
      mounted = false;
      sub.remove();
    };
  }, []);

  return reduced;
}
