import { Crown, Sparkles } from "lucide-react";
import { resolveTitleState } from "../gamification/titles";

export default function TitleBanner({ level, achievementsUnlocked, titleState }) {
  const resolved = titleState ?? resolveTitleState({
    level,
    achievementsUnlockedRaw: achievementsUnlocked,
  });

  const current = resolved.current;
  const next = resolved.next;

  return (
    <div className="motion-fade-slide rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
            <Sparkles className="h-3.5 w-3.5" />
            Title Progression
          </div>

          <div className="mt-2 flex items-center gap-2">
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${current.palette.pill}`}>
              {current.emoji} {current.name}
            </span>
          </div>

          <p className="mt-1 text-sm text-slate-600">{current.flavor}</p>
        </div>

        <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${current.palette.glow}`}>
          <Crown className="h-5 w-5 text-slate-700" />
        </div>
      </div>

      {next ? (
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="font-semibold text-slate-700">Next: {next.emoji} {next.name}</span>
            <span className="text-slate-500">{resolved.nextProgressPct}%</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full bg-gradient-to-r from-sky-500 via-fuchsia-500 to-amber-500 transition-all duration-300 ease-out"
              style={{ width: `${resolved.nextProgressPct}%` }}
            />
          </div>
          <div className="mt-2 text-xs text-slate-600">
            {resolved.nextMissingLevels > 0 && (
              <span>{resolved.nextMissingLevels} level{resolved.nextMissingLevels > 1 ? "s" : ""} to go</span>
            )}
            {resolved.nextMissingLevels > 0 && resolved.nextMissingAchievements.length > 0 && <span> • </span>}
            {resolved.nextMissingAchievements.length > 0 && (
              <span>Missing achievements: {resolved.nextMissingAchievements.join(", ")}</span>
            )}
            {resolved.nextMissingLevels === 0 && resolved.nextMissingAchievements.length === 0 && (
              <span>Ready to claim on your next sync.</span>
            )}
          </div>
        </div>
      ) : (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-700">
          Max title unlocked. You reached the top of the ladder.
        </div>
      )}
    </div>
  );
}
