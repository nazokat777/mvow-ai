/**
 * Identity message generator.
 *
 * Language is the actual reward — animation is the frame, not the gift.
 * Never use "+1", "🎉", "Tabriklayman" — those are excitement words.
 * Use "Siz becoming" framing: present tense, identity reinforcement.
 *
 * Returns `null` if the tier doesn't need a message (e.g. Micro is silent).
 */
import { Tier } from '../tokens';

export interface IdentityInput {
  tier: Tier;
  /** Current streak in days. */
  streak: number;
  /** Optional primary goal text — used to make message specific. */
  goalText?: string;
  /** User just returned after >= 2 missed days. */
  recovering?: boolean;
  /** Whether the trigger was "perfect month" (30/30). */
  perfectMonth?: boolean;
}

export interface IdentityMessage {
  primary: string;
  sub?: string;
}

export function getIdentityMessage(input: IdentityInput): IdentityMessage | null {
  const { tier, streak, goalText, recovering, perfectMonth } = input;

  // Recovery never celebrates a number — it celebrates presence.
  if (recovering) {
    return {
      primary: 'Qaytdingiz.',
      sub: "Yo'l davom etadi.",
    };
  }

  if (tier === 'micro') {
    // Micro is silent — animation is enough.
    return null;
  }

  if (tier === 'quiet') {
    return {
      primary: 'Kun yopildi.',
      sub: streak > 0 ? `Streak: ${streak}` : undefined,
    };
  }

  if (tier === 'notable') {
    if (perfectMonth) {
      return { primary: "Oy mukammal o'tdi.", sub: '30 / 30 kun.' };
    }
    if (streak === 7) {
      return {
        primary: "Siz 7 kun davomida shu yo'ldasiz.",
        sub: goalText ? `«${goalText}»` : undefined,
      };
    }
    if (streak === 30) {
      return {
        primary: "Siz 30 kun davomida shu odam bo'lib yashayapsiz.",
        sub: goalText ? `«${goalText}» yo'lida.` : undefined,
      };
    }
    if (streak === 50) {
      return { primary: 'Siz allaqachon shu odamsiz.', sub: `${streak} kun.` };
    }
    // Other notable triggers (e.g. goal at 50%) — generic.
    return { primary: `${streak} kun.`, sub: 'Yo\'lda davom etmoqdasiz.' };
  }

  if (tier === 'memorable') {
    if (streak === 100) {
      return {
        primary: '100 kun.',
        sub: "Endi shubha yo'q. Bu — sizning shaxsingiz.",
      };
    }
    if (streak === 365) {
      return { primary: 'Bir yil.', sub: "Siz o'sha odamsiz." };
    }
    return { primary: `${streak} kun.`, sub: 'Bu — sizning shaxsiyatingiz.' };
  }

  if (tier === 'cinematic') {
    return {
      primary: "Yo'l tugadi.",
      sub: 'Endi siz boshqa odamsiz.',
    };
  }

  return null;
}
