import { Bell, CheckCircle2, Clock3, Gift, ShieldCheck, Sparkles, Trophy } from "lucide-react";

export default function ClaimCenter({
  claimableCount = 0,
  isOpen = false,
  onToggle,
  showTrigger = true,
  dailyClaimable = false,
  dailyRewardXp = 0,
  dailyClaimStatusText = "",
  onClaimDaily,
  claimingDaily = false,
  recoveryClaimable = false,
  recoveryRewardXp = 0,
  onClaimRecovery,
  claimingRecovery = false,
  dailyResetLabel = "",
  weeklyResetLabel = "",
  newAchievementsCount = 0,
  onAcknowledgeAchievements,
  history = [],
  panelClassName = "border-slate-200 bg-white",
}) {
  return (
    <div className="relative">
      {showTrigger && (
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
      )}

      {isOpen && (
        <div
          className={`${
            showTrigger
              ? "absolute right-0 z-40 mt-2 w-[380px] max-w-[calc(100vw-1.5rem)] sm:max-w-[calc(100vw-2rem)]"
              : "w-full"
          } rounded-2xl border p-3 shadow-xl sm:p-4 ${panelClassName}`}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="text-sm font-semibold text-slate-900">Claimable Rewards</div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500">{claimableCount} pending</span>
              <button
                type="button"
                onClick={onToggle}
                className="text-xs font-semibold text-slate-500 hover:text-slate-700"
              >
                Close
              </button>
            </div>
          </div>

          <div className="mt-3 space-y-2">
            {(dailyResetLabel || weeklyResetLabel) && (
              <div className="rounded-xl border border-slate-200 bg-white/90 p-2.5">
                <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                  {dailyResetLabel && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 font-semibold text-slate-700">
                      <Clock3 className="h-3 w-3 text-slate-500" />
                      Daily reset {dailyResetLabel}
                    </span>
                  )}
                  {weeklyResetLabel && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 font-semibold text-slate-700">
                      <Clock3 className="h-3 w-3 text-slate-500" />
                      Weekly reset {weeklyResetLabel}
                    </span>
                  )}
                </div>
              </div>
            )}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              {/* Mobile-first: stack card header + CTA to avoid tiny buttons. */}
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
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
              {dailyClaimStatusText && (
                <div className="mt-1 text-xs text-slate-600">{dailyClaimStatusText}</div>
              )}
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
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
              {dailyResetLabel && (
                <div className="mt-1 text-xs text-slate-600">Recovery objectives refresh with daily reset ({dailyResetLabel}).</div>
              )}
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
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
