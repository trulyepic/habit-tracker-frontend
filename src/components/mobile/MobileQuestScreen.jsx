import { Compass, Flame, ShieldCheck, Snowflake, Swords, Target, Trophy } from "lucide-react";
import HabitCard from "../HabitCard";

const QUEST_TABS = [
  { key: "today", label: "Today", icon: Target },
  { key: "weekly", label: "Weekly", icon: Swords },
  { key: "safety", label: "Safety", icon: ShieldCheck },
  { key: "create", label: "Create", icon: Compass },
  { key: "quests", label: "Quests", icon: Flame },
];

function ProgressBar({ pct = 0, tone = "from-indigo-500 to-sky-500" }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
      <div className={`h-full bg-gradient-to-r ${tone} transition-all duration-300 ease-out`} style={{ width: `${Math.max(0, Math.min(100, pct))}%` }} />
    </div>
  );
}

function MobileQuestTabs({ active, onChange, badges }) {
  return (
    <div className="sticky top-2 z-20 rounded-2xl border border-slate-200 bg-white/95 p-1.5 shadow-sm backdrop-blur">
      <div className="flex gap-1.5 overflow-x-auto pb-0.5">
        {QUEST_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = active === tab.key;
          const badge = badges?.[tab.key];
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onChange(tab.key)}
              className={`relative shrink-0 rounded-xl px-3 py-2 text-xs font-semibold ${
                isActive ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"
              }`}
            >
              <span className="inline-flex items-center gap-1.5">
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </span>
              {!!badge && (
                <span className={`absolute -right-1 -top-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${isActive ? "bg-white/20 text-white" : "bg-rose-100 text-rose-700"}`}>
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function MobileQuestScreen({
  isAuthed,
  loading,
  error,
  questPanel,
  setQuestPanel,
  selectedSkin,
  titleState,
  habits,
  displayedHabits,
  questboardStats,
  atRiskHabits,
  freezeCharges,
  recoveryQuest,
  dailyQuestData,
  claimingDailyReward,
  onClaimDailyReward,
  weeklyBossEncounter,
  claimingWeeklyBoss,
  onClaimWeeklyBossReward,
  claimingRecovery,
  onClaimRecovery,
  onUseFreeze,
  consumingFreeze,
  name,
  setName,
  description,
  setDescription,
  onCreate,
  creating,
  starterQuests,
  filterMode,
  setFilterMode,
  sortMode,
  setSortMode,
  deactivateHint,
  setDeactivateHint,
  onCheckIn,
  onToggle,
  onDelete,
  checkingIn,
  toggling,
  deleting,
  dailyResetLabel,
  weeklyResetLabel,
  onRefresh,
}) {
  const daily = dailyQuestData?.dailyQuestChain ?? null;

  return (
    <div className="space-y-3 sm:hidden">
      <MobileQuestTabs
        active={questPanel}
        onChange={setQuestPanel}
        badges={{
          weekly: weeklyBossEncounter?.rewardClaimable ? 1 : null,
          safety: atRiskHabits.length > 0 ? atRiskHabits.length : null,
          quests: displayedHabits.filter((h) => h.isActive && !h.checkedInToday).length || null,
        }}
      />

      <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2">
        <div className="text-[11px] font-semibold text-slate-600">
          Daily {dailyResetLabel}
          <span className="mx-1 text-slate-300">•</span>
          Weekly {weeklyResetLabel}
        </div>
        <button
          onClick={onRefresh}
          disabled={!isAuthed}
          type="button"
          className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 disabled:opacity-60"
        >
          Refresh
        </button>
      </div>

      {isAuthed && loading && <div className="rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-600">Loading...</div>}
      {isAuthed && error && <pre className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{error.message}</pre>}

      {questPanel === "today" && (
        <div className="space-y-2">
          <div className="rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-sky-50 p-4 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-indigo-700">Daily Boss</div>
                <div className="mt-1 text-sm font-semibold text-slate-900">{daily?.boss?.name ?? "Daily Warden"}</div>
                <div className="text-xs text-slate-600">{daily?.boss?.subtitle ?? "Complete daily objectives to drain HP."}</div>
              </div>
              <span className="rounded-full bg-white px-2 py-1 text-[11px] font-semibold text-slate-700">
                {Number(daily?.completionPct ?? 0)}%
              </span>
            </div>
            <div className="mt-2">
              <ProgressBar pct={Number(daily?.completionPct ?? 0)} />
            </div>
            <div className="mt-2 text-xs text-slate-600">
              {daily?.completedCount ?? 0}/{daily?.totalCount ?? 0} mechanics broken
            </div>
            <button
              type="button"
              onClick={onClaimDailyReward}
              disabled={!daily?.rewardClaimable || claimingDailyReward}
              className={`mt-3 w-full rounded-lg px-3 py-2 text-sm font-semibold ${
                daily?.rewardClaimed
                  ? "bg-emerald-100 text-emerald-700"
                  : daily?.rewardClaimable
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              {daily?.rewardClaimed
                ? "Reward claimed"
                : claimingDailyReward
                ? "Claiming..."
                : daily?.rewardClaimable
                ? `Claim +${daily?.rewardXp ?? 0} XP`
                : "Complete objectives to unlock chest"}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {(daily?.quests ?? []).map((q) => (
              <div key={q.key} className={`rounded-xl border p-3 ${q.complete ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-white"}`}>
                <div className="text-xs font-semibold text-slate-900">{q.title}</div>
                <div className="mt-1 text-[11px] text-slate-600">{q.current}/{q.target}</div>
                <div className="mt-2"><ProgressBar pct={Math.round((Number(q.current || 0) / Math.max(1, Number(q.target || 1))) * 100)} tone={q.complete ? "from-emerald-500 to-teal-500" : "from-indigo-500 to-sky-500"} /></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {questPanel === "weekly" && (
        <div className="space-y-2">
          <div className="rounded-2xl border border-slate-300 bg-gradient-to-r from-slate-900 to-indigo-900 p-4 text-white shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-200">Weekly Raid</div>
                <div className="mt-1 text-sm font-semibold">{weeklyBossEncounter?.boss?.name ?? "Weekly Raid"}</div>
                <div className="text-xs text-slate-200">{weeklyBossEncounter?.boss?.subtitle ?? "Long-form boss encounter."}</div>
              </div>
              <span className="rounded-full bg-white/15 px-2 py-1 text-[11px] font-semibold">
                {Number(weeklyBossEncounter?.completionPct ?? 0)}%
              </span>
            </div>
            <div className="mt-2"><ProgressBar pct={Number(weeklyBossEncounter?.completionPct ?? 0)} tone="from-cyan-400 to-indigo-300" /></div>
            <div className="mt-2 text-xs text-slate-200">
              {weeklyBossEncounter?.completedCount ?? 0}/{weeklyBossEncounter?.totalCount ?? 0} mechanics
            </div>
            <button
              type="button"
              onClick={onClaimWeeklyBossReward}
              disabled={!weeklyBossEncounter?.rewardClaimable || claimingWeeklyBoss}
              className={`mt-3 w-full rounded-lg px-3 py-2 text-sm font-semibold ${
                weeklyBossEncounter?.rewardClaimed
                  ? "bg-emerald-100 text-emerald-700"
                  : weeklyBossEncounter?.rewardClaimable
                  ? "bg-white text-slate-900"
                  : "bg-slate-700 text-slate-300"
              }`}
            >
              {weeklyBossEncounter?.rewardClaimed
                ? "Reward claimed"
                : claimingWeeklyBoss
                ? "Claiming..."
                : weeklyBossEncounter?.rewardClaimable
                ? `Claim +${weeklyBossEncounter?.rewardXp ?? 0} XP`
                : "Complete weekly mechanics"}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {(weeklyBossEncounter?.quests ?? []).map((q) => (
              <div key={q.key} className={`rounded-xl border p-3 ${q.complete ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-white"}`}>
                <div className="text-xs font-semibold text-slate-900">{q.title}</div>
                <div className="mt-1 text-[11px] text-slate-600">{q.current}/{q.target}</div>
                <div className="mt-2"><ProgressBar pct={Math.round((Number(q.current || 0) / Math.max(1, Number(q.target || 1))) * 100)} tone={q.complete ? "from-emerald-500 to-teal-500" : "from-cyan-500 to-indigo-500"} /></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {questPanel === "safety" && (
        <div className="space-y-2">
          <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-sky-700">Safety Ops</div>
                <div className="mt-1 text-sm font-semibold text-slate-900">{atRiskHabits.length} quests at risk</div>
              </div>
              <div className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 text-xs font-semibold text-slate-700">
                <Snowflake className="h-3.5 w-3.5 text-sky-700" />
                {freezeCharges}
              </div>
            </div>
            {atRiskHabits.length > 0 && freezeCharges > 0 && (
              <div className="mt-3 grid gap-2">
                {atRiskHabits.slice(0, 4).map((h) => (
                  <button key={h.id} type="button" onClick={() => onUseFreeze(h.id)} disabled={consumingFreeze} className="rounded-lg border border-sky-300 bg-white px-3 py-2 text-left text-xs font-semibold text-sky-700 disabled:opacity-60">
                    Protect {h.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-amber-700">Recovery Quest</div>
            {!recoveryQuest?.active ? (
              <div className="mt-1 text-sm text-slate-600">Inactive until a miss day occurs.</div>
            ) : (
              <>
                <div className="mt-1 text-sm font-semibold text-slate-900">{recoveryQuest.progressDays}/{recoveryQuest.targetDays} comeback days</div>
                <div className="mt-2"><ProgressBar pct={Math.round((Number(recoveryQuest.progressDays || 0) / Math.max(1, Number(recoveryQuest.targetDays || 1))) * 100)} tone="from-amber-500 to-orange-500" /></div>
                <button
                  type="button"
                  onClick={onClaimRecovery}
                  disabled={!recoveryQuest.claimable || claimingRecovery}
                  className={`mt-3 w-full rounded-lg px-3 py-2 text-sm font-semibold ${
                    recoveryQuest.claimed
                      ? "bg-emerald-100 text-emerald-700"
                      : recoveryQuest.claimable
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {recoveryQuest.claimed
                    ? "Recovery claimed"
                    : claimingRecovery
                    ? "Claiming..."
                    : recoveryQuest.claimable
                    ? `Claim +${recoveryQuest.rewardXp} XP`
                    : "Complete comeback days"}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {questPanel === "create" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Create Habit</h2>
          <form onSubmit={onCreate} className="mt-3 grid gap-2">
            <input placeholder="Habit name" value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none" />
            <input placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none" />
            <button type="submit" disabled={creating} className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60">
              {creating ? "Creating..." : "Create"}
            </button>
          </form>
          <div className="mt-3 flex flex-wrap gap-2">
            {starterQuests.map((q) => (
              <button key={q.name} type="button" onClick={() => { setName(q.name); setDescription(q.description); }} className="rounded-lg border border-slate-300 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700">
                {q.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {questPanel === "quests" && (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl border border-slate-200 bg-white px-3 py-2"><div className="text-[11px] font-semibold text-slate-500">Active</div><div className="text-base font-bold text-slate-900">{questboardStats.activeCount}</div></div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2"><div className="text-[11px] font-semibold text-emerald-700">Checked</div><div className="text-base font-bold text-emerald-800">{questboardStats.checkedToday}</div></div>
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2"><div className="text-[11px] font-semibold text-amber-700">Pending</div><div className="text-base font-bold text-amber-800">{questboardStats.pendingToday}</div></div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="grid gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">Filter</span>
                <select value={filterMode} onChange={(e) => setFilterMode(e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm text-slate-700 outline-none">
                  <option value="active">Active</option>
                  <option value="all">All</option>
                  <option value="pending">Pending Today</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">Sort</span>
                <select value={sortMode} onChange={(e) => setSortMode(e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm text-slate-700 outline-none">
                  <option value="next-up">Next Up</option>
                  <option value="streak">Current Streak</option>
                  <option value="best">Best Streak</option>
                  <option value="alpha">A-Z</option>
                </select>
              </div>
            </div>
            {deactivateHint && (
              <div className="mt-2 inline-flex items-center gap-2 rounded-lg bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700">
                {deactivateHint}
                <button type="button" className="text-sky-800 hover:underline" onClick={() => setDeactivateHint("")}>Dismiss</button>
              </div>
            )}
          </div>

          <div className="grid gap-3">
            {displayedHabits.map((h) => (
              <HabitCard
                key={h.id}
                habit={h}
                cardSkinClass={selectedSkin.cardClass}
                onCheckIn={onCheckIn}
                onUseFreeze={onUseFreeze}
                canUseFreeze={isAuthed && freezeCharges > 0}
                onToggle={onToggle}
                onDelete={onDelete}
                checkingIn={checkingIn}
                consumingFreeze={consumingFreeze}
                toggling={toggling}
                deleting={deleting}
              />
            ))}

            {habits.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-600">
                <div className="flex items-center gap-2 font-semibold text-slate-800">
                  <Trophy className="h-4 w-4 text-emerald-600" />
                  Your quest log is empty
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
