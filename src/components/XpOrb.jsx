import { useEffect, useMemo, useRef, useState } from "react";
import { Crown, Sparkles } from "lucide-react";

function xpIntoCurrentLevel(totalXp, level) {
  let remaining = Math.max(0, Number(totalXp || 0));
  for (let l = 1; l < Math.max(1, level); l += 1) {
    remaining -= 100 * l;
  }
  return Math.max(0, remaining);
}

export default function XpOrb({ level = 1, totalXp = 0, reward = null }) {
  const [burst, setBurst] = useState(false);
  const [gainLabel, setGainLabel] = useState("");
  const prevRewardRef = useRef(null);

  const currentLevel = Math.max(1, Number(level || 1));
  const currentXp = Math.max(0, Number(totalXp || 0));
  const levelCost = 100 * currentLevel;
  const levelXp = xpIntoCurrentLevel(currentXp, currentLevel);
  const progressPct = Math.max(0, Math.min(100, Math.round((levelXp / Math.max(levelCost, 1)) * 100)));

  const rewardTotal = useMemo(() => Number(reward?.breakdown?.total ?? 0), [reward]);

  useEffect(() => {
    if (!reward || reward === prevRewardRef.current) return;
    prevRewardRef.current = reward;

    if (rewardTotal <= 0) return;

    setGainLabel(`+${rewardTotal} XP`);
    setBurst(true);
    const t = setTimeout(() => setBurst(false), 1200);
    return () => clearTimeout(t);
  }, [reward, rewardTotal]);

  return (
    <div className="relative flex w-36 flex-col items-center gap-2">
      {burst && (
        <div className="xp-orb-float absolute -top-6 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
          {gainLabel}
        </div>
      )}

      <div
        className={`relative flex h-16 w-16 items-center justify-center rounded-full border border-sky-200 bg-gradient-to-br from-sky-200 via-cyan-100 to-fuchsia-200 ${burst ? "xp-orb-burst" : "xp-orb-pulse"}`}
      >
        <div className="absolute inset-1 rounded-full bg-white/75" />
        <div className="relative z-10 text-center">
          <div className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-slate-700">
            <Sparkles className="h-3 w-3 text-fuchsia-600" />
            LV
          </div>
          <div className="text-base font-extrabold leading-none text-slate-900">{currentLevel}</div>
        </div>
        {reward?.leveledUp && (
          <span className="absolute -right-1 -top-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 text-amber-700">
            <Crown className="h-3.5 w-3.5" />
          </span>
        )}
      </div>

      <div className="w-full">
        <div className="mb-1 flex items-center justify-between text-[10px] font-semibold uppercase tracking-wide text-white/90">
          <span>XP</span>
          <span className="font-bold text-white">{levelXp}/{levelCost}</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/40">
          <div
            className="h-full bg-gradient-to-r from-sky-500 via-cyan-500 to-fuchsia-500 transition-all duration-300 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
