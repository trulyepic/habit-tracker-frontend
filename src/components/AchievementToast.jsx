import { useEffect, useMemo } from "react";
import { Crown, Flame, Hourglass, Shield, Sparkles, Trophy } from "lucide-react";
import { ACHIEVEMENTS, getRarityInfo } from "../gamification/achievements";

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

export default function AchievementToast({ unlocks, onClose }) {
  useEffect(() => {
    if (!unlocks?.length) return;
    const t = setTimeout(() => onClose(), 3200);
    return () => clearTimeout(t);
  }, [unlocks, onClose]);

  const normalized = useMemo(() => {
    if (!unlocks?.length) return [];

    const items = unlocks
      .map((u) => {
        const meta = ACHIEVEMENTS[u.key];
        if (!meta) return null;
        const rarity = getRarityInfo(u.key);
        return {
          key: u.key,
          ...meta,
          rank: rarity.toastRank,
          label: rarity.toastLabel,
          pill: rarity.toastPill,
          iconWrap: rarity.toastIconWrap,
        };
      })
      .filter(Boolean);

    items.sort((a, b) => b.rank - a.rank);
    return items;
  }, [unlocks]);

  if (!normalized.length) return null;

  const title = normalized.length === 1 ? "Achievement Unlocked" : "Achievements Unlocked";
  const shown = normalized.slice(0, 3);
  const extraCount = Math.max(0, normalized.length - shown.length);

  return (
    <div className="fixed right-4 top-24 z-50 w-[360px] max-w-[calc(100vw-2rem)] rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-4 shadow-lg">
      <div className="flex gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-100 to-fuchsia-100">
          <Trophy className="h-5 w-5 text-amber-700" />
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div className="font-semibold text-slate-900">{title}</div>
            <button
              onClick={onClose}
              className="text-xs font-semibold text-slate-500 hover:text-slate-700"
              type="button"
            >
              Close
            </button>
          </div>

          <div className="mt-3 space-y-2">
            {shown.map((a) => {
              const Icon = achievementIcon(a.key);
              return (
              <div key={a.key} className="rounded-xl border border-slate-100 bg-slate-50 p-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${a.iconWrap}`}>
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <span>
                      {a.emoji} {a.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${a.pill}`}>
                      {a.label}
                    </span>
                    {a.bonusXp > 0 && (
                      <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                        +{a.bonusXp} XP
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-1 text-xs text-slate-600">{a.description}</div>
              </div>
            )})}

            {extraCount > 0 && (
              <div className="text-xs text-slate-500">+{extraCount} more unlocked</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
