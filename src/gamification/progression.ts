import {
  ACHIEVEMENT_KEYS,
  AchievementKey,
  buildAchievementContext,
  shouldUnlockAchievement,
} from "./achievements";

export type HabitSnapshot = {
  id: string | number;
  checkedInToday: boolean;
  currentStreak: number;
  totalCheckins: number;
};

export type PlayerProgress = {
  totalXp: number;
  level: number;
  totalMinutesLogged: number;
  achievementsUnlocked: Record<string, string>; // key -> ISO date
};

export type GoalKey = "daily_discipline";

export type GoalResult = {
  key: GoalKey;
  completed: boolean;
};

export type AchievementUnlock = {
  key: AchievementKey;
  unlockedAtIso: string;
};

export type ProgressionResult = {
  goals: GoalResult[];
  newlyUnlocked: AchievementUnlock[];
};

/** Helper: YYYY-MM-DD string in local time. */
export function todayYmd(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function evaluateDailyDiscipline(habits: HabitSnapshot[]): boolean {
  return habits.some((h) => !!h.checkedInToday);
}

/**
 * Pure evaluation:
 * - does NOT mutate input
 * - does NOT write storage
 * - returns only what should change
 */
export function evaluateProgression(args: {
  player: PlayerProgress;
  habits: HabitSnapshot[];
  now?: Date;
}): ProgressionResult {
  const { player, habits, now } = args;
  const iso = (now ?? new Date()).toISOString();
  const unlocked = player.achievementsUnlocked ?? {};

  // Context is computed once so all achievements evaluate against same snapshot.
  const ctx = buildAchievementContext(habits, player.totalMinutesLogged);

  const newlyUnlocked: AchievementUnlock[] = [];
  for (const key of ACHIEVEMENT_KEYS) {
    if (unlocked[key]) continue;
    if (shouldUnlockAchievement(key, ctx)) {
      newlyUnlocked.push({ key, unlockedAtIso: iso });
    }
  }

  const goals: GoalResult[] = [
    { key: "daily_discipline", completed: evaluateDailyDiscipline(habits) },
  ];

  return { goals, newlyUnlocked };
}

/** Apply only the achievement unlocks to player state (pure, returns new object). */
export function applyAchievementUnlocks(
  player: PlayerProgress,
  unlocks: AchievementUnlock[]
): PlayerProgress {
  if (!unlocks.length) return player;

  const nextUnlocked = { ...(player.achievementsUnlocked ?? {}) };
  for (const u of unlocks) {
    nextUnlocked[u.key] = u.unlockedAtIso;
  }

  return {
    ...player,
    achievementsUnlocked: nextUnlocked,
  };
}
