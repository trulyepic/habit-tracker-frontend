import { Sparkles, Crown } from "lucide-react";

export default function RewardToast({ reward, onClose }) {
  if (!reward) return null;

  const { breakdown, leveledUp, nextLevel } = reward;

  return (
    <div className="fixed right-4 top-4 z-50 w-[320px] max-w-[calc(100vw-2rem)] rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-4 shadow-lg">
      <div className="flex gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-100 to-fuchsia-100">
          {leveledUp ? (
            <Crown className="h-5 w-5 text-amber-700" />
          ) : (
            <Sparkles className="h-5 w-5 text-fuchsia-700" />
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div className="font-semibold text-slate-900">
              +{breakdown.total} XP
            </div>
            <button
              onClick={onClose}
              className="text-xs font-semibold text-slate-500 hover:text-slate-700"
            >
              Close
            </button>
          </div>

          {leveledUp && (
            <div className="mt-1 text-sm font-semibold text-amber-700">
              LEVEL UP → {nextLevel}
            </div>
          )}

          <div className="mt-2 text-xs text-slate-600">
            Base {breakdown.base} • Streak {breakdown.streakBonus} • Time{" "}
            {breakdown.minutesBonus}
          </div>
        </div>
      </div>
    </div>
  );
}
