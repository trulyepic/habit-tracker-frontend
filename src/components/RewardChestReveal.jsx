import { Gift, Sparkles, Trophy, X } from "lucide-react";

export default function RewardChestReveal({ reveal, onClose }) {
  if (!reveal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/55 backdrop-blur-[2px]" />

      <div className="chest-reveal-scene relative w-full max-w-md overflow-hidden rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-orange-50 p-5 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 rounded-full bg-white/80 p-1 text-slate-500 hover:text-slate-700"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-amber-200/60 blur-2xl" />
        <div className="pointer-events-none absolute -left-8 -bottom-8 h-24 w-24 rounded-full bg-fuchsia-200/50 blur-2xl" />

        <div className="relative text-center">
          <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-200 to-yellow-100 chest-pop">
            <Gift className="h-7 w-7 text-amber-700" />
          </div>
          <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-slate-700">
            <Sparkles className="h-3.5 w-3.5 text-fuchsia-600" />
            Chest Opened
          </div>
          <h3 className="mt-3 text-xl font-black tracking-tight text-slate-900">{reveal.title}</h3>
          <p className="mt-1 text-sm text-slate-600">{reveal.subtitle}</p>
        </div>

        <div className="mt-4 rounded-xl border border-slate-200 bg-white/80 p-3">
          <div className="flex items-center justify-between text-sm">
            <span className="inline-flex items-center gap-1.5 font-semibold text-slate-700">
              <Trophy className="h-4 w-4 text-amber-600" />
              Loot
            </span>
            <span className="font-bold text-emerald-700">+{reveal.xp} XP</span>
          </div>
          {reveal.bonusText && <div className="mt-1 text-xs text-slate-600">{reveal.bonusText}</div>}
        </div>

        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
          >
            Collect Loot
          </button>
        </div>
      </div>
    </div>
  );
}
