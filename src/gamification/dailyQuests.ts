export type HabitLite = {
  isActive?: boolean;
  checkedInToday?: boolean;
  currentStreak?: number;
};

export type DailyQuestProgress = {
  key: string;
  title: string;
  description: string;
  icon: "target" | "swords" | "flame" | "shield" | "sparkles";
  current: number;
  target: number;
  complete: boolean;
};

type QuestDef = {
  key: string;
  title: string;
  description: string;
  icon: DailyQuestProgress["icon"];
  evaluate: (ctx: QuestContext) => Omit<DailyQuestProgress, "key" | "title" | "description" | "icon">;
};

type QuestContext = {
  activeCount: number;
  checkedInTodayCount: number;
  maxStreak: number;
  activeWithStreak3: number;
  level: number;
};

function clampMinOne(n: number): number {
  return Math.max(1, Math.round(n));
}

function daySeed(date = new Date()): number {
  // Stable date-based seed so all users get a predictable daily rotation.
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth() + 1;
  const d = date.getUTCDate();
  return y * 10000 + m * 100 + d;
}

const QUEST_POOL: QuestDef[] = [
  {
    key: "first_strike",
    title: "First Strike",
    description: "Complete your first quest check-in today.",
    icon: "target",
    evaluate: ({ checkedInTodayCount }) => ({
      current: checkedInTodayCount,
      target: 1,
      complete: checkedInTodayCount >= 1,
    }),
  },
  {
    key: "combo_session",
    title: "Combo Session",
    description: "Complete multiple quest check-ins today.",
    icon: "swords",
    evaluate: ({ checkedInTodayCount, level }) => {
      const target = clampMinOne(level >= 10 ? 3 : 2);
      return {
        current: checkedInTodayCount,
        target,
        complete: checkedInTodayCount >= target,
      };
    },
  },
  {
    key: "streak_guard",
    title: "Streak Guard",
    description: "Maintain at least one strong streak.",
    icon: "shield",
    evaluate: ({ maxStreak, level }) => {
      const target = clampMinOne(level >= 12 ? 7 : 4);
      return {
        current: maxStreak,
        target,
        complete: maxStreak >= target,
      };
    },
  },
  {
    key: "active_squad",
    title: "Active Squad",
    description: "Keep a stable set of active quests.",
    icon: "sparkles",
    evaluate: ({ activeCount, level }) => {
      const target = clampMinOne(level >= 10 ? 4 : 3);
      return {
        current: activeCount,
        target,
        complete: activeCount >= target,
      };
    },
  },
  {
    key: "streak_unit",
    title: "Streak Unit",
    description: "Have multiple quests with 3+ streak days.",
    icon: "flame",
    evaluate: ({ activeWithStreak3, level }) => {
      const target = clampMinOne(level >= 10 ? 2 : 1);
      return {
        current: activeWithStreak3,
        target,
        complete: activeWithStreak3 >= target,
      };
    },
  },
  {
    key: "clean_sweep",
    title: "Clean Sweep",
    description: "Check in all active quests today.",
    icon: "target",
    evaluate: ({ activeCount, checkedInTodayCount }) => {
      const target = clampMinOne(activeCount);
      return {
        current: checkedInTodayCount,
        target,
        complete: activeCount > 0 && checkedInTodayCount >= activeCount,
      };
    },
  },
];

function pickDailyQuestDefs(seed: number, count = 3): QuestDef[] {
  const size = QUEST_POOL.length;
  const picks: QuestDef[] = [];
  const used = new Set<number>();

  let cursor = Math.abs(seed) % size;
  while (picks.length < Math.min(count, size)) {
    if (!used.has(cursor)) {
      picks.push(QUEST_POOL[cursor]);
      used.add(cursor);
    }
    cursor = (cursor + 2) % size;
  }

  return picks;
}

export function buildDailyQuestChain(args: {
  habits: HabitLite[];
  level: number;
  date?: Date;
}) {
  const habits = args.habits ?? [];
  const level = Number.isFinite(args.level) ? Number(args.level) : 1;

  const activeHabits = habits.filter((h) => !!h.isActive);
  const ctx: QuestContext = {
    activeCount: activeHabits.length,
    checkedInTodayCount: activeHabits.filter((h) => !!h.checkedInToday).length,
    maxStreak: Math.max(0, ...activeHabits.map((h) => h.currentStreak ?? 0)),
    activeWithStreak3: activeHabits.filter((h) => (h.currentStreak ?? 0) >= 3).length,
    level,
  };

  const defs = pickDailyQuestDefs(daySeed(args.date), 3);
  const quests: DailyQuestProgress[] = defs.map((def) => {
    const progress = def.evaluate(ctx);
    return {
      key: def.key,
      title: def.title,
      description: def.description,
      icon: def.icon,
      current: progress.current,
      target: progress.target,
      complete: progress.complete,
    };
  });

  const completedCount = quests.filter((q) => q.complete).length;
  const totalCount = quests.length;
  const completionPct = totalCount ? Math.round((completedCount / totalCount) * 100) : 0;

  return {
    quests,
    completedCount,
    totalCount,
    completionPct,
    isComplete: completedCount === totalCount,
  };
}
