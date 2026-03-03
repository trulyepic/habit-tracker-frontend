export const ACHIEVEMENT_KEYS = [
  "first_step",
  "on_fire",
  "ten_hours",
  "iron_will",
  "centurion",
  "raid_initiate",
  "behemoth_bane",
  "voidbreaker",
] as const;

export type AchievementKey = (typeof ACHIEVEMENT_KEYS)[number];
export type AchievementRarity = "common" | "rare" | "epic" | "legendary";

export type HabitAchievementSnapshot = {
  currentStreak?: number;
  totalCheckins?: number;
};

export type AchievementContext = {
  anyCheckin: boolean;
  maxStreak: number;
  totalCheckins: number;
  totalMinutesLogged: number;
  weeklyBossWins: number;
  weeklyHardBossWins: number;
  weeklyLegendaryBossWins: number;
};

export const RARITY_META: Record<
  AchievementRarity,
  {
    label: string;
    rank: number;
    pill: string;
    iconWrap: string;
    cardTint: string;
    progressFill: string;
  }
> = {
  common: {
    label: "Common",
    rank: 1,
    pill: "bg-slate-100 text-slate-700",
    iconWrap: "bg-slate-100 text-slate-700",
    cardTint: "from-slate-50/70 to-white",
    progressFill: "bg-slate-700",
  },
  rare: {
    label: "Rare",
    rank: 2,
    pill: "bg-sky-50 text-sky-700",
    iconWrap: "bg-sky-100 text-sky-700",
    cardTint: "from-sky-50/80 to-white",
    progressFill: "bg-sky-600",
  },
  epic: {
    label: "Epic",
    rank: 3,
    pill: "bg-fuchsia-50 text-fuchsia-700",
    iconWrap: "bg-fuchsia-100 text-fuchsia-700",
    cardTint: "from-fuchsia-50/80 to-white",
    progressFill: "bg-fuchsia-600",
  },
  legendary: {
    label: "Legendary",
    rank: 4,
    pill: "bg-amber-50 text-amber-800",
    iconWrap: "bg-amber-100 text-amber-700",
    cardTint: "from-amber-50/90 to-white",
    progressFill: "bg-amber-600",
  },
};

// Frontend display + rarity bonus mirror backend catalog keys/rarity.
export const ACHIEVEMENTS: Record<
  AchievementKey,
  {
    title: string;
    description: string;
    emoji: string;
    rarity: AchievementRarity;
    bonusXp: number;
  }
> = {
  first_step: {
    title: "First Step",
    description: "Complete your first check-in.",
    emoji: "🏁",
    rarity: "common",
    bonusXp: 10,
  },
  on_fire: {
    title: "On Fire",
    description: "Reach a 7-day streak on any habit.",
    emoji: "🔥",
    rarity: "rare",
    bonusXp: 25,
  },
  ten_hours: {
    title: "10 Hours Logged",
    description: "Log 10 hours total time invested.",
    emoji: "⏱️",
    rarity: "rare",
    bonusXp: 25,
  },
  iron_will: {
    title: "Iron Will",
    description: "Reach a 30-day streak on any habit.",
    emoji: "🛡️",
    rarity: "epic",
    bonusXp: 75,
  },
  centurion: {
    title: "Centurion",
    description: "Complete 100 total check-ins across all habits.",
    emoji: "👑",
    rarity: "legendary",
    bonusXp: 200,
  },
  raid_initiate: {
    title: "Raid Initiate",
    description: "Claim your first Weekly Boss reward.",
    emoji: "🗺️",
    rarity: "rare",
    bonusXp: 25,
  },
  behemoth_bane: {
    title: "Behemoth Bane",
    description: "Defeat a hard Weekly Boss.",
    emoji: "🪓",
    rarity: "epic",
    bonusXp: 75,
  },
  voidbreaker: {
    title: "Voidbreaker",
    description: "Defeat two legendary Weekly Bosses.",
    emoji: "🌌",
    rarity: "legendary",
    bonusXp: 200,
  },
};

const clamp01 = (n: number) => Math.max(0, Math.min(1, Number.isFinite(n) ? n : 0));

export function buildAchievementContext(
  habits: HabitAchievementSnapshot[] = [],
  totalMinutesLogged = 0
): AchievementContext {
  const maxStreak = Math.max(0, ...habits.map((h) => h.currentStreak ?? 0));
  const anyCheckin = habits.some((h) => (h.totalCheckins ?? 0) > 0);
  const totalCheckins = habits.reduce((sum, h) => sum + (h.totalCheckins ?? 0), 0);

  return {
    anyCheckin,
    maxStreak,
    totalCheckins,
    totalMinutesLogged: totalMinutesLogged ?? 0,
    weeklyBossWins: 0,
    weeklyHardBossWins: 0,
    weeklyLegendaryBossWins: 0,
  };
}

export function shouldUnlockAchievement(key: AchievementKey, ctx: AchievementContext): boolean {
  switch (key) {
    case "first_step":
      return ctx.anyCheckin;
    case "on_fire":
      return ctx.maxStreak >= 7;
    case "ten_hours":
      return ctx.totalMinutesLogged >= 600;
    case "iron_will":
      return ctx.maxStreak >= 30;
    case "centurion":
      return ctx.totalCheckins >= 100;
    case "raid_initiate":
      return ctx.weeklyBossWins >= 1;
    case "behemoth_bane":
      return ctx.weeklyHardBossWins >= 1;
    case "voidbreaker":
      return ctx.weeklyLegendaryBossWins >= 2;
    default:
      return false;
  }
}

export function getAchievementProgress(
  key: AchievementKey,
  ctx: AchievementContext
): { progress01: number; progressText: string } {
  switch (key) {
    case "first_step":
      return {
        progress01: ctx.anyCheckin ? 1 : 0,
        progressText: ctx.anyCheckin ? "1 / 1 check-in" : "0 / 1 check-in",
      };
    case "on_fire":
      return {
        progress01: clamp01(ctx.maxStreak / 7),
        progressText: `${Math.min(ctx.maxStreak, 7)} / 7 day streak`,
      };
    case "ten_hours":
      return {
        progress01: clamp01(ctx.totalMinutesLogged / 600),
        progressText: `${Math.min(ctx.totalMinutesLogged, 600)} / 600 minutes`,
      };
    case "iron_will":
      return {
        progress01: clamp01(ctx.maxStreak / 30),
        progressText: `${Math.min(ctx.maxStreak, 30)} / 30 day streak`,
      };
    case "centurion":
      return {
        progress01: clamp01(ctx.totalCheckins / 100),
        progressText: `${Math.min(ctx.totalCheckins, 100)} / 100 check-ins`,
      };
    case "raid_initiate":
      return {
        progress01: clamp01(ctx.weeklyBossWins / 1),
        progressText: `${Math.min(ctx.weeklyBossWins, 1)} / 1 weekly boss`,
      };
    case "behemoth_bane":
      return {
        progress01: clamp01(ctx.weeklyHardBossWins / 1),
        progressText: `${Math.min(ctx.weeklyHardBossWins, 1)} / 1 hard weekly boss`,
      };
    case "voidbreaker":
      return {
        progress01: clamp01(ctx.weeklyLegendaryBossWins / 2),
        progressText: `${Math.min(ctx.weeklyLegendaryBossWins, 2)} / 2 legendary weekly bosses`,
      };
    default:
      return { progress01: 0, progressText: "Locked" };
  }
}

export function getRarityInfo(key: AchievementKey) {
  const achievement = ACHIEVEMENTS[key];
  const meta = RARITY_META[achievement.rarity] ?? RARITY_META.common;

  return {
    rarity: achievement.rarity,
    bonusXp: achievement.bonusXp,
    rarityLabel: meta.label,
    rarityRank: meta.rank,
    rarityPill: meta.pill,
    rarityIconWrap: meta.iconWrap,
    rarityCardTint: meta.cardTint,
    rarityProgressFill: meta.progressFill,
    toastLabel: meta.label,
    toastRank: meta.rank,
    toastPill: meta.pill,
    toastIconWrap: meta.iconWrap,
  };
}

export function coerceUnlockedMap(raw: unknown): Record<string, string> {
  if (!raw) return {};
  if (typeof raw === "object") return raw as Record<string, string>;

  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? (parsed as Record<string, string>) : {};
    } catch {
      return {};
    }
  }

  return {};
}
