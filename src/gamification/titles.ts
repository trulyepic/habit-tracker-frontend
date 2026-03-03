import { AchievementKey, coerceUnlockedMap } from "./achievements";

export type TitleDef = {
  key: string;
  name: string;
  emoji: string;
  flavor: string;
  minLevel: number;
  requiredAchievements: AchievementKey[];
  palette: {
    pill: string;
    glow: string;
  };
};

export const TITLE_TRACK: TitleDef[] = [
  {
    key: "rookie",
    name: "Rookie Spark",
    emoji: "✨",
    flavor: "You have begun the quest.",
    minLevel: 1,
    requiredAchievements: [],
    palette: { pill: "bg-slate-100 text-slate-700", glow: "from-slate-100 to-white" },
  },
  {
    key: "pathfinder",
    name: "Pathfinder",
    emoji: "🧭",
    flavor: "You show up when it matters.",
    minLevel: 3,
    requiredAchievements: ["first_step"],
    palette: { pill: "bg-sky-100 text-sky-700", glow: "from-sky-100 to-white" },
  },
  {
    key: "ember_keeper",
    name: "Ember Keeper",
    emoji: "🔥",
    flavor: "Your streak is alive and growing.",
    minLevel: 6,
    requiredAchievements: ["on_fire"],
    palette: { pill: "bg-orange-100 text-orange-700", glow: "from-orange-100 to-white" },
  },
  {
    key: "time_weaver",
    name: "Time Weaver",
    emoji: "⏳",
    flavor: "You convert time into mastery.",
    minLevel: 8,
    requiredAchievements: ["ten_hours"],
    palette: { pill: "bg-indigo-100 text-indigo-700", glow: "from-indigo-100 to-white" },
  },
  {
    key: "iron_vanguard",
    name: "Iron Vanguard",
    emoji: "🛡️",
    flavor: "Consistency has become your edge.",
    minLevel: 12,
    requiredAchievements: ["iron_will"],
    palette: { pill: "bg-fuchsia-100 text-fuchsia-700", glow: "from-fuchsia-100 to-white" },
  },
  {
    key: "centurion_prime",
    name: "Centurion Prime",
    emoji: "👑",
    flavor: "A true veteran of daily discipline.",
    minLevel: 16,
    requiredAchievements: ["centurion"],
    palette: { pill: "bg-amber-100 text-amber-800", glow: "from-amber-100 to-white" },
  },
  {
    key: "raidbreaker",
    name: "Raidbreaker",
    emoji: "⚔️",
    flavor: "You bring discipline into weekly raids.",
    minLevel: 18,
    requiredAchievements: ["raid_initiate"],
    palette: { pill: "bg-indigo-100 text-indigo-700", glow: "from-indigo-100 to-white" },
  },
  {
    key: "voidmarshal",
    name: "Void Marshal",
    emoji: "🌌",
    flavor: "You stand firm against hard weekly bosses.",
    minLevel: 22,
    requiredAchievements: ["behemoth_bane"],
    palette: { pill: "bg-violet-100 text-violet-700", glow: "from-violet-100 to-white" },
  },
  {
    key: "astral_sovereign",
    name: "Astral Sovereign",
    emoji: "🜂",
    flavor: "Legendary weekly encounters bow to your routine.",
    minLevel: 26,
    requiredAchievements: ["voidbreaker"],
    palette: { pill: "bg-cyan-100 text-cyan-800", glow: "from-cyan-100 to-white" },
  },
  {
    key: "legend_of_routine",
    name: "Legend of Routine",
    emoji: "🌟",
    flavor: "Master of streaks, time, and repetition.",
    minLevel: 30,
    requiredAchievements: ["on_fire", "ten_hours", "iron_will", "centurion", "voidbreaker"],
    palette: { pill: "bg-emerald-100 text-emerald-700", glow: "from-emerald-100 to-white" },
  },
];

function titleByKey(key?: string | null): TitleDef {
  const found = TITLE_TRACK.find((t) => t.key === key);
  return found ?? TITLE_TRACK[0];
}

function hasRequirements(def: TitleDef, level: number, unlockedKeys: Set<string>) {
  if (level < def.minLevel) return false;
  return def.requiredAchievements.every((k) => unlockedKeys.has(k));
}

export function resolveTitleState(args: {
  level: number;
  achievementsUnlockedRaw: unknown;
}) {
  const unlocked = coerceUnlockedMap(args.achievementsUnlockedRaw);
  const unlockedKeys = new Set(Object.keys(unlocked));

  const unlockedTitles = TITLE_TRACK.filter((t) => hasRequirements(t, args.level, unlockedKeys));
  const current = unlockedTitles.at(-1) ?? TITLE_TRACK[0];

  const currentIndex = TITLE_TRACK.findIndex((t) => t.key === current.key);
  const next = TITLE_TRACK[currentIndex + 1] ?? null;

  if (!next) {
    return {
      current,
      next: null,
      nextProgressPct: 100,
      nextMissingAchievements: [] as AchievementKey[],
      nextMissingLevels: 0,
      isMaxTitle: true,
    };
  }

  const nextMissingAchievements = next.requiredAchievements.filter((k) => !unlockedKeys.has(k));
  const nextMissingLevels = Math.max(next.minLevel - args.level, 0);

  const levelProgress = next.minLevel > 0 ? Math.min(args.level / next.minLevel, 1) : 1;
  const achievementProgress = next.requiredAchievements.length
    ? (next.requiredAchievements.length - nextMissingAchievements.length) / next.requiredAchievements.length
    : 1;

  const nextProgressPct = Math.round((levelProgress * 0.6 + achievementProgress * 0.4) * 100);

  return {
    current,
    next,
    nextProgressPct,
    nextMissingAchievements,
    nextMissingLevels,
    isMaxTitle: false,
  };
}

function normalizeServerTitle(raw: any): TitleDef {
  const base = titleByKey(raw?.key);
  if (!raw) return base;
  return {
    ...base,
    key: raw.key ?? base.key,
    name: raw.name ?? base.name,
    emoji: raw.emoji ?? base.emoji,
    flavor: raw.flavor ?? base.flavor,
    minLevel: Number.isFinite(raw.minLevel) ? raw.minLevel : base.minLevel,
    requiredAchievements: Array.isArray(raw.requiredAchievements)
      ? raw.requiredAchievements
      : base.requiredAchievements,
  };
}

export function resolveTitleStateFromServerProfile(profile: any) {
  if (!profile?.currentTitle) return null;

  const current = normalizeServerTitle(profile.currentTitle);
  const next = profile.nextTitle ? normalizeServerTitle(profile.nextTitle) : null;

  return {
    current,
    next,
    nextProgressPct: Number(profile.nextTitleProgressPct ?? (next ? 0 : 100)),
    nextMissingAchievements: Array.isArray(profile.nextTitleMissingAchievements)
      ? profile.nextTitleMissingAchievements
      : [],
    nextMissingLevels: Number(profile.nextTitleMissingLevels ?? 0),
    isMaxTitle: Boolean(profile.isMaxTitle ?? !next),
  };
}
