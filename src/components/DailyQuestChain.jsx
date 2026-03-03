import { useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, Crown, Flame, Lock, ShieldCheck, Sparkles, Swords, Target, Trophy } from "lucide-react";
import { buildDailyQuestChain } from "../gamification/dailyQuests";

function QuestIcon({ icon }) {
  if (icon === "crown") return <Crown className="h-4 w-4" />;
  if (icon === "swords") return <Swords className="h-4 w-4" />;
  if (icon === "flame") return <Flame className="h-4 w-4" />;
  if (icon === "shield") return <ShieldCheck className="h-4 w-4" />;
  if (icon === "sparkles") return <Sparkles className="h-4 w-4" />;
  return <Target className="h-4 w-4" />;
}

function resolveBossProfile(quests = [], isComplete = false) {
  if (isComplete) {
    return {
      key: "fallback_complete",
      name: "Conquered Overlord",
      subtitle: "All mechanics broken. Victory secured.",
      icon: Crown,
      tint: "from-emerald-500 to-lime-500",
      rarity: "epic",
      difficulty: "rookie",
      mechanics: ["Finish all objectives to conquer the encounter."],
      buffs: [],
    };
  }

  const keys = new Set((quests || []).map((q) => q.key));
  if (keys.has("streak_guard") || keys.has("streak_unit")) {
    return {
      key: "fallback_streak",
      name: "Streak Warden",
      subtitle: "Protect your chain and crush attrition.",
      icon: ShieldCheck,
      tint: "from-sky-500 to-cyan-500",
      rarity: "rare",
      difficulty: "rookie",
      mechanics: ["Clear streak-oriented objectives to drain HP."],
      buffs: [],
    };
  }
  if (keys.has("combo_session") || keys.has("first_strike")) {
    return {
      key: "fallback_combo",
      name: "Combo Sentinel",
      subtitle: "Rapid check-ins break its defenses.",
      icon: Swords,
      tint: "from-fuchsia-500 to-violet-500",
      rarity: "rare",
      difficulty: "rookie",
      mechanics: ["Stack quick check-ins to accelerate encounter progress."],
      buffs: [],
    };
  }
  if (keys.has("clean_sweep")) {
    return {
      key: "fallback_order",
      name: "Order Titan",
      subtitle: "Complete every active quest to finish the fight.",
      icon: Target,
      tint: "from-amber-500 to-orange-500",
      rarity: "epic",
      difficulty: "veteran",
      mechanics: ["Clear all active quests to crack the final defense."],
      buffs: [],
    };
  }

  return {
    key: "fallback_daily",
    name: "Daily Warden",
    subtitle: "Complete objectives to drain its health bar.",
    icon: Flame,
    tint: "from-slate-700 to-slate-500",
    rarity: "common",
    difficulty: "rookie",
    mechanics: ["Any completed objective damages this boss."],
    buffs: [],
  };
}

function formatClaimedAt(raw) {
  if (!raw) return null;
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function resolveDailyBannerTint(boss) {
  const key = String(boss?.key || "").toLowerCase();
  if (key.includes("combo")) return "from-fuchsia-700 via-violet-700 to-indigo-700";
  if (key.includes("streak")) return "from-sky-700 via-cyan-700 to-teal-700";
  if (key.includes("order")) return "from-amber-700 via-orange-700 to-red-700";
  if (key.includes("ember")) return "from-rose-700 via-orange-700 to-amber-600";
  if (key.includes("conquered") || key.includes("complete")) return "from-emerald-700 via-lime-700 to-teal-700";

  const rarity = String(boss?.rarity || "common").toLowerCase();
  if (rarity === "legendary") return "from-emerald-700 via-teal-600 to-cyan-500";
  if (rarity === "epic") return "from-rose-700 via-orange-600 to-amber-500";
  if (rarity === "rare") return "from-indigo-700 via-blue-700 to-cyan-600";
  return "from-slate-800 via-slate-700 to-sky-700";
}

function BuffIcon({ buffKey }) {
  const key = String(buffKey || "").toLowerCase();
  if (key.includes("armor") || key.includes("barrier") || key.includes("shield") || key.includes("plating")) {
    return <ShieldCheck className="h-3.5 w-3.5" />;
  }
  if (key.includes("combo") || key.includes("drive") || key.includes("strike")) {
    return <Swords className="h-3.5 w-3.5" />;
  }
  if (key.includes("regen") || key.includes("ember") || key.includes("burn")) {
    return <Flame className="h-3.5 w-3.5" />;
  }
  if (key.includes("orbit") || key.includes("shell") || key.includes("aura") || key.includes("pressure")) {
    return <Sparkles className="h-3.5 w-3.5" />;
  }
  return <Crown className="h-3.5 w-3.5" />;
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

  const fallbackBoss = resolveBossProfile(chain.quests, chain.isComplete);
  const boss = chain?.boss
    ? {
        ...chain.boss,
        mechanics: chain.boss.mechanics ?? [],
        buffs: chain.boss.buffs ?? [],
      }
    : fallbackBoss;
  const BossIcon = chain?.boss ? null : boss.icon;
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
    <div className={`motion-fade-slide mt-4 mb-6 overflow-visible rounded-2xl border shadow-sm ${panelSkinClass}`}>
      <div className={`relative rounded-t-2xl bg-gradient-to-r ${resolveDailyBannerTint(boss)} px-4 py-3 text-white`}>
        <div className="pointer-events-none absolute inset-0 bg-slate-950/18" />
        <div className="pointer-events-none absolute -left-8 -top-8 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -right-10 bottom-0 h-28 w-28 rounded-full bg-cyan-200/20 blur-2xl" />
        <div className="relative">
          <div className="mb-2.5 flex items-center justify-between gap-3">
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
              {chain?.boss ? <QuestIcon icon={boss.icon} /> : <BossIcon className="h-3.5 w-3.5" />}
              {boss.name}
            </div>
            <p className="text-shadow-strong mt-1.5 text-sm text-white">{boss.subtitle}</p>
            <div className="mt-1.5 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-white/95">
              <span className="rounded-full bg-white/20 px-2 py-0.5">{boss.rarity}</span>
              <span className="rounded-full bg-white/20 px-2 py-0.5">{boss.difficulty}</span>
            </div>
            {boss.buffs?.length > 0 && (
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                {boss.buffs.map((buff) => (
                  <div key={buff.key} className="group relative">
                    <button
                      type="button"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/30 bg-white/15 text-white transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-white/25 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                      aria-label={`${buff.name}: ${buff.description}`}
                    >
                      <BuffIcon buffKey={buff.key} />
                    </button>
                    <div className="pointer-events-none invisible absolute bottom-full left-1/2 z-30 mb-1 w-52 -translate-x-1/2 rounded-md border border-slate-700 bg-slate-900/95 px-2 py-1.5 text-[11px] text-slate-100 opacity-0 shadow-lg transition-all duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                      <div className="font-semibold text-white">{buff.name}</div>
                      <div className="mt-0.5 text-slate-200">{buff.description}</div>
                    </div>
                  </div>
                ))}
                <span className="pl-1 text-[11px] text-white/90">Hover buffs to inspect effects</span>
              </div>
            )}
          </div>
        </div>

        <div className="relative mt-2.5">
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

        {boss.mechanics?.length > 0 && (
          <div className="mb-3 rounded-xl border border-slate-200 bg-white p-3">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Mechanics</div>
            <div className="mt-2 grid gap-1.5">
              {boss.mechanics.slice(0, 2).map((line, idx) => (
                <div key={`${boss.key}-mechanic-${idx}`} className="text-xs text-slate-700">
                  {line}
                </div>
              ))}
            </div>
          </div>
        )}

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
