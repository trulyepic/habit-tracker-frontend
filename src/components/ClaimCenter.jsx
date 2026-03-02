import { Bell, CheckCircle2, Gift, ShieldCheck, Sparkles, Trophy } from "lucide-react";

export default function ClaimCenter({
  claimableCount = 0,
  isOpen = false,
  onToggle,
  dailyClaimable = false,
  dailyRewardXp = 0,
  onClaimDaily,
  claimingDaily = false,
  recoveryClaimable = false,
  recoveryRewardXp = 0,
  onClaimRecovery,
  claimingRecovery = false,
  newAchievementsCount = 0,
  onAcknowledgeAchievements,
  history = [],
}) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-sm"
      >
        <span className="inline-flex items-center gap-2">
          <Bell className="h-4 w-4" />
          Claim Center
          {claimableCount > 0 && (
            <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-bold text-rose-700">
              {claimableCount}
            </span>
          )}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 z-40 mt-2 w-[380px] max-w-[calc(100vw-2rem)] rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
          <div className="flex items-center justify-between gap-2">
            <div className="text-sm font-semibold text-slate-900">Claimable Rewards</div>
            <span className="text-xs text-slate-500">{claimableCount} pending</span>
          </div>

          <div className="mt-3 space-y-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm font-semibold text-slate-900 inline-flex items-center gap-1.5">
                  <Gift className="h-4 w-4 text-amber-600" />
                  Daily Quest Reward
                </div>
                <button
                  type="button"
                  onClick={onClaimDaily}
                  disabled={!dailyClaimable || claimingDaily}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
                    dailyClaimable
                      ? "bg-slate-900 text-white hover:bg-slate-800"
                      : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {claimingDaily ? "Claiming..." : dailyClaimable ? `Claim +${dailyRewardXp} XP` : "Locked"}
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm font-semibold text-slate-900 inline-flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-sky-600" />
                  Recovery Reward
                </div>
                <button
                  type="button"
                  onClick={onClaimRecovery}
                  disabled={!recoveryClaimable || claimingRecovery}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
                    recoveryClaimable
                      ? "bg-slate-900 text-white hover:bg-slate-800"
                      : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {claimingRecovery ? "Claiming..." : recoveryClaimable ? `Claim +${recoveryRewardXp} XP` : "Locked"}
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm font-semibold text-slate-900 inline-flex items-center gap-1.5">
                  <Trophy className="h-4 w-4 text-fuchsia-600" />
                  New Achievements
                </div>
                <button
                  type="button"
                  onClick={onAcknowledgeAchievements}
                  disabled={newAchievementsCount === 0}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
                    newAchievementsCount > 0
                      ? "bg-slate-900 text-white hover:bg-slate-800"
                      : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {newAchievementsCount > 0 ? `Acknowledge ${newAchievementsCount}` : "None"}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Recently Claimed</div>
            <div className="mt-2 space-y-1.5">
              {history.length === 0 ? (
                <div className="text-xs text-slate-500">No claims yet.</div>
              ) : (
                history.map((h) => (
                  <div key={h.id} className="flex items-center justify-between rounded-lg border border-slate-100 px-2.5 py-1.5 text-xs">
                    <span className="inline-flex items-center gap-1.5 text-slate-700">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      {h.label}
                    </span>
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                      <Sparkles className="h-3.5 w-3.5" />
                      {h.value}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
