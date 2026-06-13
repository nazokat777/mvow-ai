/**
 * Example integration: Home screen with StreakCounter + day-close + debug.
 *
 * This file demonstrates:
 *  - StreakCounter with AmbientPulse activating at streak >= 30.
 *  - DayClose firing when all tasks completed.
 *  - MilestoneMark firing at streak 7/30/50.
 *  - MotionDebugPanel for manual tier triggering.
 *
 * Wire it to your real task state — the structure here is intentional and minimal.
 */
import React, { useState, useMemo } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import {
  QuietConfirm,
  DayClose,
  MilestoneMark,
  StreakCounter,
  MotionDebugPanel,
  Intensity,
  Tier,
  palette,
  type UserMotionState,
} from '../src';

interface Task {
  id: string;
  name: string;
  meta: string;
  done: boolean;
}

const SAMPLE: ReadonlyArray<Task> = [
  { id: '1', name: 'Ingliz tili — speaking',  meta: "07:00 · 60 daq", done: false },
  { id: '2', name: 'Sport — yugurish',         meta: '09:00 · 30 daq', done: false },
  { id: '3', name: 'Kitob — IELTS hadis',      meta: '14:00 · 45 daq', done: false },
];

const GOAL_TEXT = 'Ingliz tilidan IELTS 7.0 olish';

export function HomeScreenExample(): React.ReactElement {
  const [tasks, setTasks] = useState<Task[]>(SAMPLE.map((t) => ({ ...t })));
  const [intensity, setIntensity] = useState<Intensity>('balanced');
  const [streak, setStreak] = useState<number>(43);
  const [recovering, setRecovering] = useState<boolean>(false);

  // Triggers — driven by app state in production.
  const [closeOpen, setCloseOpen] = useState<boolean>(false);
  const [milestoneOpen, setMilestoneOpen] = useState<boolean>(false);
  const [debugOpen, setDebugOpen] = useState<boolean>(false);

  const motionState: UserMotionState = useMemo(
    () => ({ streak, recovering, intensity }),
    [streak, recovering, intensity],
  );

  const totalDone = tasks.filter((t) => t.done).length;
  const ringProgress = tasks.length === 0 ? 0 : totalDone / tasks.length;

  const toggleTask = (id: string): void => {
    setTasks((prev) => {
      const next = prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
      const allDone = next.length > 0 && next.every((t) => t.done);
      if (allDone) setCloseOpen(true);   // Quiet tier
      return next;
    });
  };

  const onTriggerTier = (tier: Tier): void => {
    setDebugOpen(false);
    if (tier === 'micro') {
      const first = tasks.find((t) => !t.done);
      if (first) toggleTask(first.id);
    }
    if (tier === 'quiet') setCloseOpen(true);
    if (tier === 'notable') setMilestoneOpen(true);
    // Memorable / Cinematic — wire when those primitives are added.
  };

  return (
    <View style={styles.container}>
      {/* Streak counter (AmbientPulse active at streak >= 30) */}
      <View style={styles.headerArea}>
        <Text style={styles.greeting}>Xayrli tong, Nazokat.</Text>
        <StreakCounter streak={streak} motionState={motionState} />
      </View>

      {/* Task list — each is a QuietConfirm row */}
      <View style={styles.list}>
        {tasks.map((t) => (
          <QuietConfirm
            key={t.id}
            done={t.done}
            label={t.name}
            meta={t.meta}
            onPress={() => toggleTask(t.id)}
          />
        ))}
      </View>

      <View style={{ flexGrow: 1 }} />

      <Pressable style={styles.debug} onPress={() => setDebugOpen(true)}>
        <Text style={styles.debugText}>Motion Debug</Text>
      </Pressable>

      {/* Quiet — Day close */}
      {closeOpen ? (
        <Overlay onDismiss={() => setCloseOpen(false)}>
          <DayClose
            ringProgress={ringProgress}
            motionState={motionState}
            onDone={() => setTimeout(() => setCloseOpen(false), 1200)}
          />
        </Overlay>
      ) : null}

      {/* Notable — Milestone */}
      {milestoneOpen ? (
        <Overlay onDismiss={() => setMilestoneOpen(false)}>
          <MilestoneMark
            streak={streak >= 7 ? streak : 7}
            goalText={GOAL_TEXT}
            motionState={motionState}
            onDone={() => setTimeout(() => setMilestoneOpen(false), 1200)}
          />
        </Overlay>
      ) : null}

      <MotionDebugPanel
        visible={debugOpen}
        onClose={() => setDebugOpen(false)}
        onTrigger={onTriggerTier}
        intensity={intensity}
        onIntensityChange={setIntensity}
        streak={streak}
        onStreakChange={setStreak}
      />
    </View>
  );
}

// Small overlay shell — wraps a tier celebration in a modal-like presentation.
function Overlay({
  children,
  onDismiss,
}: {
  children: React.ReactNode;
  onDismiss: () => void;
}): React.ReactElement {
  return (
    <Pressable style={styles.overlay} onPress={onDismiss}>
      <View style={styles.overlayCard}>{children}</View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.bg.void,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  headerArea: {
    alignItems: 'center',
    marginBottom: 18,
  },
  greeting: {
    color: palette.text.primary,
    fontSize: 22,
    fontStyle: 'italic',
  },
  list: {
    backgroundColor: palette.bg.elevated,
    borderRadius: 14,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  debug: {
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: palette.text.dim,
    borderRadius: 18,
    opacity: 0.6,
  },
  debugText: {
    color: palette.text.dim,
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  overlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayCard: {
    backgroundColor: palette.bg.elevated,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 24,
    minWidth: 280,
    alignItems: 'center',
  },
});
