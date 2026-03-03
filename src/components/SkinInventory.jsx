import { Lock, Palette, Sparkles } from "lucide-react";
import { QUEST_SKINS } from "../gamification/skins";
import { buildAchievementContext, getAchievementProgress } from "../gamification/achievements";

export default function SkinInventory({
  unlockedSkinKeys = [],
  selectedSkinKey = "classic",
  onSelectSkin,
  habits = [],
  totalMinutesLogged = 0,
}) {
  const unlockedSet = new Set(unlockedSkinKeys);
  const progressCtx = buildAchievementContext(habits, totalMinutesLogged);

  return (
    <div className="motion-fade-slide rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Skin Inventory</h2>
          <p className="mt-1 text-sm text-slate-600">
            Cosmetic quest card themes unlocked via achievements.
          </p>
        </div>
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-100 to-fuchsia-100">
          <Palette className="h-5 w-5 text-slate-700" />
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {QUEST_SKINS.map((skin) => {
          const unlocked = unlockedSet.has(skin.key);
          const selected = selectedSkinKey === skin.key;
          const unlockProgress = skin.unlockAchievement
            ? getAchievementProgress(skin.unlockAchievement, progressCtx)
            : null;
          const unlockPct = unlockProgress
            ? Math.round(Math.max(0, Math.min(1, unlockProgress.progress01)) * 100)
            : 100;
          return (
            <div
              key={skin.key}
              className={`rounded-xl border p-3 transition-all duration-200 ${
                selected ? "border-slate-900 shadow-sm" : "border-slate-200"
              }`}
            >
              <div className={`mb-2 h-14 rounded-lg border bg-gradient-to-r ${skin.previewClass}`} />
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-sm font-semibold text-slate-900">{skin.name}</div>
                  <div className="mt-0.5 text-xs text-slate-600">{skin.description}</div>
                </div>
                {unlocked ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                    <Sparkles className="h-3.5 w-3.5" />
                    Unlocked
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                    <Lock className="h-3.5 w-3.5" />
                    Locked
                  </span>
                )}
              </div>

              <button
                type="button"
                disabled={!unlocked}
                onClick={() => onSelectSkin?.(skin.key)}
                className={`mt-3 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  selected
                    ? "bg-slate-900 text-white"
                    : unlocked
                    ? "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {selected ? "Equipped" : unlocked ? "Equip Skin" : "Locked"}
              </button>

              {!unlocked && unlockProgress && (
                <div className="mt-3">
                  <div className="mb-1 flex items-center justify-between text-[11px] font-semibold text-slate-600">
                    <span>Unlock Progress</span>
                    <span>{unlockPct}%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full bg-gradient-to-r from-sky-500 to-fuchsia-500 transition-all duration-300 ease-out"
                      style={{ width: `${unlockPct}%` }}
                    />
                  </div>
                  <div className="mt-1 text-[11px] text-slate-500">{unlockProgress.progressText}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
