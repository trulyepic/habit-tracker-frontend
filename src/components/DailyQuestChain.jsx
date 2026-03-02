import { useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, Flame, Lock, ShieldCheck, Sparkles, Swords, Target, Trophy } from "lucide-react";
import { buildDailyQuestChain } from "../gamification/dailyQuests";

function QuestIcon({ icon }) {
  if (icon === "swords") return <Swords className="h-4 w-4" />;
  if (icon === "flame") return <Flame className="h-4 w-4" />;
  if (icon === "shield") return <ShieldCheck className="h-4 w-4" />;
  if (icon === "sparkles") return <Sparkles className="h-4 w-4" />;
  return <Target className="h-4 w-4" />;
}

export default function DailyQuestChain({
  habits,
  level,
  titleState,
  isAuthed = false,
  serverChain = null,
  loading = false,
  claiming = false,
  onClaimReward,
}) {
  const localChain = useMemo(() => {
    return buildDailyQuestChain({ habits: habits ?? [], level: level ?? 1 });
  }, [habits, level]);
  const chain = isAuthed && serverChain ? serverChain : localChain;
  const [showClaimFx, setShowClaimFx] = useState(false);
  const prevClaimedRef = useRef(Boolean(chain.rewardClaimed));

  useEffect(() => {
    const justClaimed = !prevClaimedRef.current && Boolean(chain.rewardClaimed);
    prevClaimedRef.current = Boolean(chain.rewardClaimed);
    if (!justClaimed) return;

    setShowClaimFx(true);
    const t = setTimeout(() => setShowClaimFx(false), 1200);
    return () => clearTimeout(t);
  }, [chain.rewardClaimed]);

  const nextObjective = chain.quests.find((q) => !q.complete) ?? null;
  const canClaim = Boolean(chain.rewardClaimable && !claiming);
  const claimState = chain.rewardClaimed
    ? "claimed"
    : claiming
    ? "claiming"
    : chain.rewardClaimable
    ? "claimable"
    : "locked";

  if (isAuthed && loading && !serverChain) {
    return (
      <div className="motion-fade-slide mt-4 mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="text-sm text-slate-600">Loading daily quest chain...</div>
      </div>
    );
  }

  return (
    <div className="motion-fade-slide mt-4 mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      {showClaimFx && (
        <div className="pointer-events-none mb-3 rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50 via-lime-50 to-amber-50 px-3 py-2 text-xs font-semibold text-emerald-800 daily-claim-fx">
          Daily chain reward secured: +{chain.rewardXp} XP
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
            <Target className="h-3.5 w-3.5" />
            Today&apos;s Quest Chain
          </div>
          <p className="mt-2 text-sm text-slate-700">
            {chain.isComplete
              ? "Chain complete. Keep your momentum rolling."
              : `${chain.totalCount - chain.completedCount} objective${chain.totalCount - chain.completedCount > 1 ? "s" : ""} left today.`}
          </p>
        </div>
        <div className="text-xs text-slate-500">
          {chain.completedCount}/{chain.totalCount} complete • {chain.completionPct}%
        </div>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Reward</div>
          <div className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-slate-900">
            <Trophy className="h-4 w-4 text-amber-600" />
            +{chain.rewardXp} XP
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Next Objective</div>
          <div className="mt-1 text-sm font-semibold text-slate-900">
            {nextObjective ? nextObjective.title : "All done"}
          </div>
          {nextObjective && (
            <div className="mt-0.5 text-xs text-slate-600">
              {Math.max(nextObjective.target - nextObjective.current, 0)} to go
            </div>
          )}
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Title Progress</div>
          <div className="mt-1 text-sm font-semibold text-slate-900">
            {titleState?.isMaxTitle ? "MAX" : `${titleState?.nextProgressPct ?? 0}%`}
          </div>
          <div className="mt-0.5 text-xs text-slate-600">
            {titleState?.isMaxTitle ? titleState?.current?.name : `Toward ${titleState?.next?.name ?? "next title"}`}
          </div>
        </div>
      </div>

      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full bg-gradient-to-r from-emerald-500 via-sky-500 to-fuchsia-500 transition-all duration-300 ease-out"
          style={{ width: `${chain.completionPct}%` }}
        />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {chain.quests.map((q) => {
          const pct = Math.max(0, Math.min(100, Math.round((q.current / q.target) * 100)));

          return (
            <div
              key={q.key}
              className={`surface-interactive rounded-xl border p-3 ${
                q.complete
                  ? "border-emerald-200 bg-emerald-50"
                  : "border-slate-200 bg-gradient-to-br from-white to-slate-50"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-sm font-semibold text-slate-900">{q.title}</div>
                  <div className="mt-1 text-xs text-slate-600">{q.description}</div>
                </div>
                <span className={`inline-flex h-7 w-7 items-center justify-center rounded-lg ${q.complete ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700"}`}>
                  <QuestIcon icon={q.icon} />
                </span>
              </div>

              <div className="mt-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">
                    {q.complete ? "Complete" : "Progress"}
                  </span>
                  <span className="text-slate-500">{Math.min(q.current, q.target)}/{q.target}</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full transition-all duration-300 ease-out ${q.complete ? "bg-emerald-600" : "bg-slate-700"}`}
                    style={{ width: `${q.complete ? 100 : pct}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {isAuthed && (
        <div className="mt-4 flex items-center justify-end">
          <button
            type="button"
            onClick={onClaimReward}
            disabled={!canClaim}
            className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-all duration-200 ease-out ${
              claimState === "claimed"
                ? "bg-emerald-100 text-emerald-700"
                : claimState === "locked"
                ? "bg-slate-100 text-slate-500"
                : "bg-gradient-to-r from-slate-900 to-slate-700 text-white hover:-translate-y-0.5 hover:shadow-sm disabled:opacity-60"
            }`}
          >
            {claimState === "claimed" && (
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" />
                Claimed
              </span>
            )}
            {claimState === "claiming" && "Claiming..."}
            {claimState === "claimable" && `Claim +${chain.rewardXp} XP`}
            {claimState === "locked" && (
              <span className="inline-flex items-center gap-1.5">
                <Lock className="h-4 w-4" />
                Locked
              </span>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
