import { useEffect, useRef, useState } from "react";
import { Crown, ShieldAlert, ShieldCheck, Sparkles, Swords, Target, Trophy, Wrench } from "lucide-react";
import { buffStateMeta, resolveBuffState } from "./buffLifecycle";
import { getBuffTone, getDifficultyToken, getRarityToken, STAT_CARD_TONES } from "./uiTokens";

function EncounterIcon({ icon }) {
  if (icon === "crown") return <Crown className="h-4 w-4" />;
  if (icon === "shield") return <ShieldCheck className="h-4 w-4" />;
  if (icon === "sparkles") return <Sparkles className="h-4 w-4" />;
  if (icon === "swords") return <Swords className="h-4 w-4" />;
  return <Target className="h-4 w-4" />;
}

function BuffIcon({ buffKey }) {
  const key = String(buffKey || "").toLowerCase();
  if (key.includes("barrier") || key.includes("plating") || key.includes("shell")) {
    return <ShieldCheck className="h-3.5 w-3.5" />;
  }
  if (key.includes("pressure") || key.includes("lock")) {
    return <ShieldAlert className="h-3.5 w-3.5" />;
  }
  if (key.includes("drive") || key.includes("overclock")) {
    return <Swords className="h-3.5 w-3.5" />;
  }
  return <Sparkles className="h-3.5 w-3.5" />;
}

function resolveWeeklyBannerTint(boss) {
  const key = String(boss?.key || "").toLowerCase();
  if (key.includes("void")) return "from-indigo-900 via-blue-900 to-cyan-800";
  if (key.includes("astral")) return "from-fuchsia-900 via-violet-900 to-indigo-900";
  if (key.includes("behemoth")) return "from-emerald-900 via-teal-900 to-cyan-900";
  return "from-slate-900 via-slate-800 to-indigo-900";
}

function formatClaimedAt(raw) {
  if (!raw) return null;
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

export default function WeeklyBossEncounter({
  encounter,
  habits = [],
  loading = false,
  claiming = false,
  onClaimReward,
  onOpenSafety,
  onOpenCreate,
  panelSkinClass = "border-slate-200 bg-white",
  skinHud = null,
  feedback = "",
}) {
  const [encounterTimeline, setEncounterTimeline] = useState([]);
  const prevCompletionPctRef = useRef(Number(encounter?.completionPct || 0));
  const prevCompletedCountRef = useRef(Number(encounter?.completedCount || 0));
  const prevClaimableRef = useRef(Boolean(encounter?.rewardClaimable));
  const prevClaimedRef = useRef(Boolean(encounter?.rewardClaimed));

  const pushTimeline = (label, kind = "event") => {
    const item = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      label,
      kind,
      ts: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
    };
    setEncounterTimeline((prev) => [item, ...prev].slice(0, 10));
  };

  useEffect(() => {
    if (!encounter) return;

    const currentPct = Number(encounter.completionPct || 0);
    const prevPct = prevCompletionPctRef.current;
    if (currentPct > prevPct) {
      pushTimeline(`Progress +${currentPct - prevPct}%`, "progress");
    }
    prevCompletionPctRef.current = currentPct;

    const currentDone = Number(encounter.completedCount || 0);
    const prevDone = prevCompletedCountRef.current;
    if (currentDone > prevDone) {
      pushTimeline("Mechanic broken", "break");
    }
    prevCompletedCountRef.current = currentDone;

    const currentClaimable = Boolean(encounter.rewardClaimable);
    const prevClaimable = prevClaimableRef.current;
    if (currentClaimable && !prevClaimable) {
      pushTimeline("Weekly chest unlocked", "unlock");
    }
    prevClaimableRef.current = currentClaimable;

    const currentClaimed = Boolean(encounter.rewardClaimed);
    const prevClaimed = prevClaimedRef.current;
    if (currentClaimed && !prevClaimed) {
      pushTimeline("Weekly reward claimed", "claim");
    }
    prevClaimedRef.current = currentClaimed;
  }, [encounter?.completedCount, encounter?.completionPct, encounter?.rewardClaimable, encounter?.rewardClaimed]);

  if (loading && !encounter) {
    return (
      <div className="motion-fade-slide mt-4 mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="text-sm text-slate-600">Loading weekly raid...</div>
      </div>
    );
  }

  if (!encounter) {
    return null;
  }

  const boss = encounter.boss;
  const rarityMeta = getRarityToken(boss.rarity);
  const difficultyMeta = getDifficultyToken(boss.difficulty);
  const RarityIcon = rarityMeta.Icon;
  const DifficultyIcon = difficultyMeta.Icon;
  const claimedAt = formatClaimedAt(encounter.rewardClaimedAt);
  const remainingHp = Math.max(0, 100 - Number(encounter.completionPct || 0));
  const focusedQuest = encounter.quests.find((q) => !q.complete) ?? null;
  const pendingToday = habits.filter((h) => h.isActive && !h.checkedInToday).length;
  const atRisk = habits.filter((h) => h.isActive && !h.checkedInToday && (h.currentStreak ?? 0) > 0).length;
  const claimState = encounter.rewardClaimed
    ? "claimed"
    : claiming
    ? "claiming"
    : encounter.rewardClaimable
    ? "claimable"
    : "locked";
  const anticipationReady =
    !encounter.rewardClaimed && !encounter.rewardClaimable && Number(encounter.completionPct || 0) >= 75;
  const hpFillClass = skinHud?.hpFillClass ?? "from-cyan-300 via-indigo-200 to-white";
  const badgeRingClass = skinHud?.badgeRingClass ?? "ring-slate-200/80";
  const focusRingClass = skinHud?.focusRingClass ?? "ring-indigo-300";
  const anticipationGlowClass =
    skinHud?.anticipationGlowClass ?? "shadow-[0_0_0_2px_rgba(99,102,241,0.18),0_0_22px_rgba(99,102,241,0.22)]";
  const onJumpToObjective = () => {
    if (!focusedQuest) return;
    const el = document.getElementById(`weekly-objective-${focusedQuest.key}`);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <div className={`motion-fade-slide mt-4 mb-6 overflow-visible rounded-2xl border shadow-sm ${panelSkinClass}`}>
      <div className={`relative rounded-t-2xl bg-gradient-to-r ${resolveWeeklyBannerTint(boss)} px-4 py-3 text-white`}>
        <div className="pointer-events-none absolute inset-0 bg-slate-950/20" />
        <div className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-cyan-200/20 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-8 left-12 h-24 w-24 rounded-full bg-indigo-200/20 blur-2xl" />

        <div className="relative mb-2 flex items-center justify-between gap-3">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide">
            Weekly Raid
          </div>
          <div className="text-right text-xs font-bold text-white">
            {encounter.completedCount}/{encounter.totalCount} mechanics
          </div>
        </div>

        <div className="relative inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-xs font-semibold">
          <EncounterIcon icon={boss.icon} />
          {boss.name}
        </div>
        <p className="text-shadow-strong relative mt-1.5 text-sm text-white">{boss.subtitle}</p>
        <div className="relative mt-1.5 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide">
          <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 ring-1 ${badgeRingClass} ${rarityMeta.className}`}>
            <RarityIcon className="h-3 w-3" />
            {rarityMeta.label}
          </span>
          <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 ring-1 ${badgeRingClass} ${difficultyMeta.className}`}>
            <DifficultyIcon className="h-3 w-3" />
            {difficultyMeta.label}
          </span>
          <span className="rounded-full bg-white/20 px-2 py-0.5">{encounter.weekKey}</span>
        </div>

        {boss.buffs?.length > 0 && (
          <div className="relative mt-1.5 flex items-center gap-1.5 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible">
            {boss.buffs.map((buff, idx) => {
              const lifecycle = resolveBuffState({
                completionPct: encounter.completionPct,
                buffIndex: idx,
                buffCount: boss.buffs.length,
              });
              const state = buffStateMeta(lifecycle);
              return (
              <div key={buff.key} className="group relative">
                <button
                  type="button"
                  className={`relative inline-flex h-8 w-8 items-center justify-center rounded-md border ${getBuffTone(buff.key)} ${state.chipClass} transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70`}
                  aria-label={`${buff.name}: ${buff.description}`}
                >
                  <BuffIcon buffKey={buff.key} />
                  <span className={`absolute -bottom-1 -right-1 rounded-full border px-1 text-[9px] font-bold ${state.pillClass}`}>
                    {state.label[0]}
                  </span>
                </button>
                <div className="pointer-events-none invisible absolute bottom-full left-1/2 z-30 mb-1 w-56 -translate-x-1/2 rounded-md border border-slate-700 bg-slate-900/95 px-2 py-1.5 text-[11px] text-slate-100 opacity-0 shadow-lg transition-all duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                  <div className="font-semibold text-white">{buff.name}</div>
                  <div className={`mt-0.5 inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] font-semibold ${state.pillClass}`}>
                    {state.label}
                  </div>
                  <div className="mt-0.5 text-slate-200">{buff.description}</div>
                </div>
              </div>
            );})}
            <span className="hidden pl-1 text-[11px] text-white/85 sm:inline">Raid buffs active</span>
          </div>
        )}

        <div className="relative mt-2.5">
          <div className="mb-1 flex items-center justify-between text-[11px] font-bold uppercase tracking-wide text-white">
            <span>Raid Boss HP</span>
            <span>{remainingHp}% remaining</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/25">
            <div
              className={`weekly-raid-fill h-full bg-gradient-to-r ${hpFillClass} transition-all duration-500 ease-out`}
              style={{ width: `${encounter.completionPct}%` }}
            />
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="mb-3 flex gap-2 overflow-x-auto pb-1 sm:grid sm:grid-cols-3 sm:overflow-visible">
          <div
            className={`motion-stagger-item w-56 shrink-0 rounded-xl border px-3 py-2 sm:w-auto ${
              STAT_CARD_TONES.reward
            } ${anticipationReady ? `chest-anticipation ${anticipationGlowClass}` : ""}`}
            style={{ animationDelay: "40ms" }}
          >
            <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Weekly Chest</div>
            <div className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-slate-900">
              <Trophy className="h-4 w-4 text-amber-600" />
              +{encounter.rewardXp} XP
            </div>
            {anticipationReady && (
              <div className="mt-0.5 text-[11px] font-semibold text-indigo-700">
                Chest charging... {Math.max(0, 100 - Number(encounter.completionPct || 0))}% to unlock
              </div>
            )}
          </div>
          <div
            className={`motion-stagger-item w-56 shrink-0 rounded-xl border px-3 py-2 sm:w-auto ${STAT_CARD_TONES.progress}`}
            style={{ animationDelay: "90ms" }}
          >
            <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Raid Progress</div>
            <div className="mt-1 text-sm font-semibold text-slate-900">{encounter.completionPct}% breached</div>
            <div className="mt-0.5 text-xs text-slate-600">
              Week {encounter.weekStart} to {encounter.weekEnd}
            </div>
          </div>
          <div
            className={`motion-stagger-item w-56 shrink-0 rounded-xl border px-3 py-2 sm:w-auto ${STAT_CARD_TONES.intel}`}
            style={{ animationDelay: "140ms" }}
          >
            <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Raid Intel</div>
            <div className="mt-1 text-sm font-semibold text-slate-900">{pendingToday} pending today</div>
            <div className="mt-0.5 text-xs text-slate-600">{atRisk} quests at streak risk</div>
          </div>
        </div>

        <div className="mb-3 rounded-xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-cyan-50 p-3">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-indigo-700">
            <Wrench className="h-3.5 w-3.5" />
            Raid Tools
          </div>
          <div className="mt-2 flex gap-2 overflow-x-auto pb-1 sm:grid sm:grid-cols-3 sm:overflow-visible">
            <button
              type="button"
              onClick={onOpenCreate}
              className="surface-interactive w-56 shrink-0 rounded-lg border border-indigo-200 bg-white px-2.5 py-2 text-left sm:w-auto"
            >
              <div className="text-xs font-semibold text-indigo-800">Quest Forge</div>
              <div className="text-[11px] text-indigo-700">Create quests to increase weekly options.</div>
            </button>
            <button
              type="button"
              onClick={onOpenSafety}
              className="surface-interactive w-56 shrink-0 rounded-lg border border-indigo-200 bg-white px-2.5 py-2 text-left sm:w-auto"
            >
              <div className="text-xs font-semibold text-indigo-800">Safety Ops</div>
              <div className="text-[11px] text-indigo-700">Open Safety tab and protect risky streaks.</div>
            </button>
            <div className="w-56 shrink-0 rounded-lg border border-indigo-200 bg-white px-2.5 py-2 sm:w-auto">
              <div className="text-xs font-semibold text-indigo-800">Focus Target</div>
              <div className="text-[11px] text-indigo-700">
                {focusedQuest
                  ? `${focusedQuest.title} (${Math.max(focusedQuest.target - focusedQuest.current, 0)} steps left)`
                  : "Raid complete. Claim your weekly chest."}
              </div>
            </div>
          </div>
        </div>

        <div className="mb-3 rounded-xl border border-slate-200 bg-white px-3 py-2">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Raid Timeline</div>
          <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
            {encounterTimeline.length === 0 && (
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-600">
                No events yet. Start breaking mechanics.
              </div>
            )}
            {encounterTimeline.map((entry) => (
              <div
                key={entry.id}
                className={`shrink-0 rounded-lg border px-2.5 py-1.5 text-xs ${
                  entry.kind === "claim"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : entry.kind === "unlock"
                    ? "border-amber-200 bg-amber-50 text-amber-800"
                    : entry.kind === "break"
                    ? "border-indigo-200 bg-indigo-50 text-indigo-800"
                    : "border-slate-200 bg-slate-50 text-slate-700"
                }`}
              >
                <div className="font-semibold">{entry.label}</div>
                <div className="mt-0.5 text-[10px] opacity-80">{entry.ts}</div>
              </div>
            ))}
          </div>
        </div>

        {focusedQuest && (
          <div className="mb-3 flex items-center justify-between gap-2 rounded-xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-cyan-50 px-3 py-2">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wide text-indigo-700">Best Next Action</div>
              <div className="text-sm font-semibold text-slate-900">{focusedQuest.title}</div>
            </div>
            <button
              type="button"
              onClick={onJumpToObjective}
              className="surface-interactive rounded-lg border border-indigo-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-indigo-700"
            >
              Jump
            </button>
          </div>
        )}

        {boss.mechanics?.length > 0 && (
          <div className="mb-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-600">Raid Mechanics</div>
            <div className="mt-2 flex gap-2 overflow-x-auto pb-1 sm:grid sm:grid-cols-2 sm:overflow-visible">
              {boss.mechanics.map((line, idx) => (
                <div
                  key={`${boss.key}-m-${idx}`}
                  className="flex w-72 shrink-0 items-start gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 sm:w-auto"
                >
                  <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-[11px] font-bold text-indigo-700">
                    {idx + 1}
                  </span>
                  <span className="text-xs text-slate-700">{line}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          {encounter.quests.map((q, idx) => {
            const pct = Math.max(0, Math.min(100, Math.round((q.current / q.target) * 100)));
            const isFocus = focusedQuest?.key === q.key;
            return (
              <div
                id={`weekly-objective-${q.key}`}
                key={q.key}
                className={`motion-stagger-item surface-interactive rounded-xl border p-3 ${
                  q.complete
                    ? "border-emerald-200 bg-emerald-50"
                    : "border-slate-200 bg-gradient-to-br from-white to-indigo-50/40"
                } ${isFocus ? `ring-2 ${focusRingClass}` : ""}`}
                style={{ animationDelay: `${180 + idx * 55}ms` }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{q.title}</div>
                    <div className="mt-1 text-xs text-slate-600">{q.description}</div>
                  </div>
                  <span
                    className={`inline-flex h-7 w-7 items-center justify-center rounded-lg ${
                      q.complete ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    <EncounterIcon icon={q.icon} />
                  </span>
                </div>
                <div className="mt-3">
                  <div className="mb-1 flex items-center justify-between text-xs text-slate-600">
                    <span>
                      {Math.min(q.current, q.target)}/{q.target}
                    </span>
                    <span>{pct}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full transition-all duration-300 ease-out ${
                        q.complete ? "bg-emerald-600" : "bg-indigo-600"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-3">
          <button
            type="button"
            onClick={onClaimReward}
            disabled={claimState !== "claimable"}
            className={`inline-flex w-full items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition-all duration-200 ease-out ${
              claimState === "claimable"
                ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:-translate-y-0.5 hover:shadow-sm"
                : claimState === "claimed"
                ? "cursor-default bg-emerald-100 text-emerald-800"
                : "cursor-not-allowed bg-slate-100 text-slate-500"
            }`}
          >
            {claimState === "claiming" && "Claiming..."}
            {claimState === "claimable" && `Open Weekly Chest +${encounter.rewardXp} XP`}
            {claimState === "claimed" && "Weekly chest claimed"}
            {claimState === "locked" && "Raid in progress"}
          </button>
          <div className="mt-2 text-xs text-slate-600">
            {feedback && <div className="mb-1 font-medium text-indigo-700">{feedback}</div>}
            {claimState === "claimed" &&
              `${claimedAt ? `Claimed at ${claimedAt}` : "Already claimed this week"} (+${
                encounter.rewardAwardedXp || encounter.rewardXp
              } XP)`}
            {claimState === "claimable" && "Weekly boss defeated. Reward chest is ready."}
            {claimState === "locked" && "Break all weekly mechanics to unlock the chest."}
          </div>
        </div>
      </div>
    </div>
  );
}
