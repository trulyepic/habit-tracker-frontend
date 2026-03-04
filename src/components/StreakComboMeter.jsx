import { Flame, Gauge, Zap } from "lucide-react";

const TIERS = [
  { key: "idle", label: "Idle", min: 0, next: 3 },
  { key: "warmup", label: "Warm-up", min: 3, next: 10 },
  { key: "breaker", label: "Chain Breaker", min: 10, next: 20 },
  { key: "core", label: "Momentum Core", min: 20, next: 35 },
  { key: "overdrive", label: "Overdrive", min: 35, next: null },
];

function clamp01(n) {
  return Math.max(0, Math.min(1, n));
}

function resolveTier(score) {
  let tier = TIERS[0];
  for (const t of TIERS) {
    if (score >= t.min) tier = t;
  }
  return tier;
}

export default function StreakComboMeter({ habits = [] }) {
  const activeToday = habits.filter((h) => h.isActive && h.checkedInToday);
  const comboScore = activeToday.reduce((sum, h) => sum + Math.max(1, Number(h.currentStreak ?? 0)), 0);
  const tier = resolveTier(comboScore);
  const nextGoal = tier.next;
  const inTierProgress =
    nextGoal == null
      ? 1
      : clamp01((comboScore - tier.min) / Math.max(1, nextGoal - tier.min));
  const pct = Math.round(inTierProgress * 100);

  return (
    <div className="motion-fade-slide mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
            <Gauge className="h-3.5 w-3.5" />
            Streak Combo Meter
          </div>
          <div className="mt-2 flex items-center gap-2">
            <div className="text-lg font-bold text-slate-900">{comboScore}</div>
            <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2 py-0.5 text-xs font-semibold text-orange-700">
              <Flame className="h-3.5 w-3.5" />
              {tier.label}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-600">
            {nextGoal == null
              ? "Max tier reached. Keep your combo alive."
              : `${Math.max(nextGoal - comboScore, 0)} points to reach ${TIERS.find((t) => t.min === nextGoal)?.label ?? "next tier"}.`}
          </p>
        </div>

        <div className="text-right text-xs text-slate-500">
          <div>{activeToday.length} habits checked in today</div>
          <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 font-semibold text-emerald-700">
            <Zap className="h-3.5 w-3.5" />
            Combo {pct}%
          </div>
        </div>
      </div>

      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full bg-gradient-to-r from-orange-500 via-amber-500 to-fuchsia-500 transition-all duration-300 ease-out"
          style={{ width: `${Math.max(6, pct)}%` }}
        />
      </div>
    </div>
  );
}
