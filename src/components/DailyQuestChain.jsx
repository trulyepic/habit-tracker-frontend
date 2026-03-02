import { useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, Crown, Flame, Lock, ShieldCheck, Sparkles, Swords, Target, Trophy } from "lucide-react";
import { buildDailyQuestChain } from "../gamification/dailyQuests";

function QuestIcon({ icon }) {
  if (icon === "swords") return <Swords className="h-4 w-4" />;
  if (icon === "flame") return <Flame className="h-4 w-4" />;
  if (icon === "shield") return <ShieldCheck className="h-4 w-4" />;
  if (icon === "sparkles") return <Sparkles className="h-4 w-4" />;
  return <Target className="h-4 w-4" />;
}

function resolveBossProfile(quests = [], isComplete = false) {
  if (isComplete) {
    return {
      name: "Conquered Overlord",
      subtitle: "All mechanics broken. Victory secured.",
      icon: Crown,
      tint: "from-emerald-500 to-lime-500",
    };
  }

  const keys = new Set((quests || []).map((q) => q.key));
  if (keys.has("streak_guard") || keys.has("streak_unit")) {
    return {
      name: "Streak Warden",
      subtitle: "Protect your chain and crush attrition.",
      icon: ShieldCheck,
      tint: "from-sky-500 to-cyan-500",
    };
  }
  if (keys.has("combo_session") || keys.has("first_strike")) {
    return {
      name: "Combo Sentinel",
      subtitle: "Rapid check-ins break its defenses.",
      icon: Swords,
      tint: "from-fuchsia-500 to-violet-500",
    };
  }
  if (keys.has("clean_sweep")) {
    return {
      name: "Order Titan",
      subtitle: "Complete every active quest to finish the fight.",
      icon: Target,
      tint: "from-amber-500 to-orange-500",
    };
  }

  return {
    name: "Daily Warden",
    subtitle: "Complete objectives to drain its health bar.",
    icon: Flame,
    tint: "from-slate-700 to-slate-500",
  };
}

function formatClaimedAt(raw) {
  if (!raw) return null;
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
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
  panelSkinClass = "border-slate-200 bg-white",
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

  const boss = resolveBossProfile(chain.quests, chain.isComplete);
  const BossIcon = boss.icon;
  const nextObjective = chain.quests.find((q) => !q.complete) ?? null;
  const canClaim = Boolean(chain.rewardClaimable && !claiming);
  const claimState = chain.rewardClaimed
    ? "claimed"
    : claiming
    ? "claiming"
    : chain.rewardClaimable
    ? "claimable"
    : "locked";
  const claimedAtLabel = formatClaimedAt(chain.rewardClaimedAt);

  if (isAuthed && loading && !serverChain) {
    return (
      <div className="motion-fade-slide mt-4 mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="text-sm text-slate-600">Loading daily boss encounter...</div>
      </div>
    );
  }

  return (
    <div className={`motion-fade-slide mt-4 mb-6 overflow-hidden rounded-2xl border shadow-sm ${panelSkinClass}`}>
      <div className={`relative bg-gradient-to-r ${boss.tint} px-4 py-4 text-white`}>
        <div className="pointer-events-none absolute inset-0 bg-slate-900/10" />
        <div className="relative">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide">
              Daily Boss
            </div>
            <div className="text-shadow-strong px-1 text-right text-xs font-bold text-white">
              <div>{chain.completedCount}/{chain.totalCount} mechanics broken</div>
              <div className="text-white/95">{chain.completionPct}% encounter progress</div>
            </div>
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-1 text-xs font-semibold">
              <BossIcon className="h-3.5 w-3.5" />
              {boss.name}
            </div>
            <p className="mt-2 text-sm text-white">{boss.subtitle}</p>
          </div>
        </div>

        <div className="relative mt-3">
          <div className="mb-1 flex items-center justify-between text-[11px] font-bold uppercase tracking-wide text-white">
            <span>Boss HP</span>
            <span>{Math.max(0, 100 - chain.completionPct)}% remaining</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/25">
            <div
              className="h-full bg-gradient-to-r from-lime-300 via-emerald-200 to-white transition-all duration-300 ease-out"
              style={{ width: `${chain.completionPct}%` }}
            />
          </div>
        </div>
      </div>

      <div className="p-4">
        {showClaimFx && (
          <div className="daily-claim-fx mb-3 rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50 via-lime-50 to-amber-50 px-3 py-2 text-xs font-semibold text-emerald-800">
            Boss defeated. Reward chest opened: +{chain.rewardXp} XP
          </div>
        )}

        <div className="mb-3 grid gap-2 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Reward Chest</div>
            <div className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-slate-900">
              <Trophy className="h-4 w-4 text-amber-600" />
              +{chain.rewardXp} XP
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Next Mechanic</div>
            <div className="mt-1 text-sm font-semibold text-slate-900">
              {nextObjective ? nextObjective.title : "Boss defeated"}
            </div>
            {nextObjective && (
              <div className="mt-0.5 text-xs text-slate-600">
                {Math.max(nextObjective.target - nextObjective.current, 0)} steps to break
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

        <div className="grid gap-3 sm:grid-cols-3">
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
                      {q.complete ? "Mechanic Broken" : "Mechanic Integrity"}
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
            <div className="text-right">
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
                    Chest Claimed
                  </span>
                )}
                {claimState === "claiming" && "Claiming..."}
                {claimState === "claimable" && `Open Chest +${chain.rewardXp} XP`}
                {claimState === "locked" && (
                  <span className="inline-flex items-center gap-1.5">
                    <Lock className="h-4 w-4" />
                    Chest Locked
                  </span>
                )}
              </button>
              <div className="mt-1 text-xs text-slate-500">
                {claimState === "claimed" &&
                  `${claimedAtLabel ? `Claimed at ${claimedAtLabel}` : "Already claimed today"} (+${chain.rewardAwardedXp || chain.rewardXp} XP)`}
                {claimState === "claimable" && "Boss defeated. Reward chest is ready to open."}
                {claimState === "locked" && "Break all mechanics to unlock the reward chest."}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
