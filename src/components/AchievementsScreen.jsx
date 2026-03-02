import { useMemo } from "react";
import { Crown, Flame, Hourglass, Lock, LockOpen, Shield, Sparkles, Trophy } from "lucide-react";
import {
  ACHIEVEMENTS,
  buildAchievementContext,
  coerceUnlockedMap,
  getAchievementProgress,
  getRarityInfo,
} from "../gamification/achievements";

const pct = (n01) => Math.round(Math.max(0, Math.min(1, n01 ?? 0)) * 100);

function achievementIcon(key) {
  switch (key) {
    case "on_fire":
      return Flame;
    case "ten_hours":
      return Hourglass;
    case "iron_will":
      return Shield;
    case "centurion":
      return Crown;
    default:
      return Sparkles;
  }
}

export default function AchievementsScreen({ habits, playerProfile }) {
  const unlockedMap = useMemo(() => {
    return coerceUnlockedMap(playerProfile?.achievementsUnlocked);
  }, [playerProfile?.achievementsUnlocked]);

  const totalMinutes = playerProfile?.totalMinutesLogged ?? 0;

  const computed = useMemo(() => {
    const safeHabits = habits ?? [];
    const ctx = buildAchievementContext(safeHabits, totalMinutes);

    const items = Object.entries(ACHIEVEMENTS).map(([key, meta]) => {
      const unlocked = Boolean(unlockedMap?.[key]);
      const { progress01, progressText } = getAchievementProgress(key, ctx);
      const rarityInfo = getRarityInfo(key);

      return {
        key,
        ...meta,
        unlocked,
        progress01,
        progressText,
        ...rarityInfo,
      };
    });

    // Keep high-rarity and high-progress cards near the top.
    items.sort((a, b) => {
      if (b.rarityRank !== a.rarityRank) return b.rarityRank - a.rarityRank;
      if (Number(b.unlocked) !== Number(a.unlocked)) return Number(b.unlocked) - Number(a.unlocked);
      if (b.progress01 !== a.progress01) return b.progress01 - a.progress01;
      return String(a.title).localeCompare(String(b.title));
    });

    const unlockedCount = items.filter((i) => i.unlocked).length;
    return { items, unlockedCount, total: items.length };
  }, [habits, unlockedMap, totalMinutes]);

  const overallPct = computed.total
    ? Math.round((computed.unlockedCount / computed.total) * 100)
    : 0;

  return (
    <div className="motion-fade-slide rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Achievements</h2>
          <div className="mt-1 text-sm text-slate-600">
            {computed.unlockedCount}/{computed.total} unlocked • {overallPct}% complete
          </div>

          <div className="mt-3 h-2 w-72 max-w-[70vw] overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full bg-gradient-to-r from-amber-500 via-fuchsia-500 to-sky-500 transition-all duration-300 ease-out"
              style={{ width: `${overallPct}%` }}
            />
          </div>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-amber-100 to-fuchsia-100 shadow-sm">
          <Trophy className="h-5 w-5 text-amber-700" />
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {computed.items.map((a) => {
          const started = a.progress01 > 0;
          const Icon = achievementIcon(a.key);

          return (
            <div
              key={a.key}
              className={`surface-interactive rounded-xl border bg-gradient-to-br p-4 ${
                a.unlocked
                  ? "border-emerald-200 from-emerald-50/70 to-white"
                  : `border-slate-200 ${a.rarityCardTint}`
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="text-sm font-semibold text-slate-900">
                      <span className="mr-2">{a.emoji}</span>
                      {a.title}
                    </div>

                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${a.rarityPill}`}>
                      {a.rarityLabel}
                    </span>

                    {a.bonusXp > 0 && (
                      <span className="inline-flex items-center rounded-full bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                        +{a.bonusXp} XP
                      </span>
                    )}
                  </div>

                  <div className="mt-1 text-xs text-slate-600">{a.description}</div>
                </div>

                {!a.unlocked && (
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100">
                    {started ? (
                      <LockOpen className="h-4 w-4 text-slate-500" />
                    ) : (
                      <Lock className="h-4 w-4 text-slate-500" />
                    )}
                  </div>
                )}
              </div>

              <div className="mt-3 flex items-center justify-between">
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${a.rarityIconWrap}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="text-xs text-slate-500">{a.unlocked ? "Claimed" : "In progress"}</div>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between text-xs">
                  <div className="font-semibold text-slate-700">
                    {a.unlocked ? "Unlocked" : "Progress"}
                  </div>
                  <div className="text-slate-500">
                    {a.unlocked ? "100%" : `${pct(a.progress01)}%`}
                  </div>
                </div>

                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full transition-all duration-300 ease-out ${a.unlocked ? "bg-emerald-600" : a.rarityProgressFill}`}
                    style={{ width: `${a.unlocked ? 100 : pct(a.progress01)}%` }}
                  />
                </div>

                <div className="mt-2 text-xs text-slate-500">{a.progressText}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
