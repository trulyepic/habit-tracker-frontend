import { Crown, Sparkles, Swords } from "lucide-react";

export default function LevelUpScene({ reward, onClose }) {
  if (!reward?.leveledUp) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px]" onClick={onClose} />

      <div className="levelup-scene relative w-full max-w-md overflow-hidden rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-fuchsia-50 p-6 shadow-2xl">
        <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-amber-200/60 blur-2xl" />
        <div className="pointer-events-none absolute -left-8 -bottom-8 h-28 w-28 rounded-full bg-fuchsia-200/60 blur-2xl" />

        <div className="relative">
          <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-200 to-amber-100 text-amber-700">
            <Crown className="h-7 w-7" />
          </div>

          <div className="mt-4 text-center">
            <div className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-slate-700">
              <Sparkles className="h-3.5 w-3.5 text-fuchsia-600" />
              Level Up
            </div>

            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900">
              Level {reward.nextLevel}
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              You gained <span className="font-semibold text-slate-900">+{reward.breakdown?.total ?? 0} XP</span> and advanced your adventurer rank.
            </p>
          </div>

          <div className="mt-5 flex items-center justify-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
              <Swords className="h-3.5 w-3.5" />
              Keep the streak alive
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
              +{reward.breakdown?.total ?? 0} XP
            </span>
          </div>

          <div className="mt-5 flex justify-center">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
            >
              Continue Questing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
