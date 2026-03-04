import { useMemo, useState } from "react";
import { BarChart3, CheckCircle2, Clock3, Flame, Gift, Palette, Shield, Snowflake, Trophy, Zap } from "lucide-react";

import {
  ACHIEVEMENTS,
  buildAchievementContext,
  coerceUnlockedMap,
  getAchievementProgress,
} from "../../gamification/achievements";
import { QUEST_SKINS } from "../../gamification/skins";

const PROFILE_TABS = [
  { key: "overview", label: "Overview", icon: BarChart3 },
  { key: "inventory", label: "Inventory", icon: Palette },
  { key: "achievements", label: "Achievements", icon: Trophy },
];

const INVENTORY_TABS = [
  { key: "rewards", label: "Rewards" },
  { key: "tools", label: "Tools" },
  { key: "skins", label: "Skins" },
];

const RARITY_MOBILE = {
  common: {
    badge: "bg-slate-100 text-slate-700",
    bar: "bg-slate-700",
    card: "border-slate-200 bg-white",
    orb: "bg-slate-100 text-slate-700",
  },
  rare: {
    badge: "bg-sky-50 text-sky-700",
    bar: "bg-sky-600",
    card: "border-sky-200 bg-sky-50/40",
    orb: "bg-sky-100 text-sky-700",
  },
  epic: {
    badge: "bg-fuchsia-50 text-fuchsia-700",
    bar: "bg-fuchsia-600",
    card: "border-fuchsia-200 bg-fuchsia-50/35",
    orb: "bg-fuchsia-100 text-fuchsia-700",
  },
  legendary: {
    badge: "bg-amber-50 text-amber-700",
    bar: "bg-amber-600",
    card: "border-amber-200 bg-amber-50/45",
    orb: "bg-amber-100 text-amber-700",
  },
};

function ProgressBar({ pct = 0, tone = "from-indigo-500 to-sky-500" }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
      <div className={`h-full bg-gradient-to-r ${tone} transition-all duration-300 ease-out`} style={{ width: `${Math.max(0, Math.min(100, pct))}%` }} />
    </div>
  );
}

function MobileStat({ icon: Icon, label, value, tint }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500">
        <span className={`inline-flex h-6 w-6 items-center justify-center rounded-lg ${tint}`}>
          <Icon className="h-3.5 w-3.5" />
        </span>
        {label}
      </div>
      <div className="mt-1 text-xl font-bold text-slate-900">{value}</div>
    </div>
  );
}

function MobileSkinTile({ skin, unlocked, selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={!unlocked}
      className={`relative rounded-xl border p-1.5 text-left transition-all ${
        selected
          ? "border-indigo-400 bg-indigo-50 shadow-sm"
          : unlocked
          ? "border-slate-200 bg-white"
          : "border-slate-200 bg-slate-50/80 opacity-85"
      }`}
      title={skin.name}
    >
      <div className={`h-10 rounded-lg border bg-gradient-to-r ${skin.previewClass}`} />
      <div className="mt-1 truncate text-[10px] font-semibold text-slate-700">{skin.name}</div>
      <div className="text-[10px] text-slate-500">{unlocked ? (selected ? "Equipped" : "Tap equip") : "Locked"}</div>
      {!unlocked && (
        <span className="absolute right-1 top-1 rounded-full bg-slate-900/70 px-1 py-0.5 text-[9px] font-semibold text-white">
          Locked
        </span>
      )}
    </button>
  );
}

function MobileActivity({ items = [], loading = false, hasMore = false, onLoadMore, onCollapse }) {
  const [mode, setMode] = useState("all");
  const filtered = useMemo(() => {
    if (mode === "all") return items;
    if (mode === "created") return items.filter((e) => e.action === "habit_created");
    return items.filter((e) => e.action === "checkin");
  }, [items, mode]);

  const formatWhen = (dateIso, createdAtIso) => {
    const d = dateIso ? new Date(`${dateIso}T00:00:00`) : null;
    const t = createdAtIso ? new Date(createdAtIso) : null;
    const day = d && !Number.isNaN(d.valueOf()) ? d.toLocaleDateString() : "Unknown";
    const time = t && !Number.isNaN(t.valueOf()) ? t.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";
    return time ? `${day} • ${time}` : day;
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-slate-900">Recent Activity</div>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">{filtered.length}</span>
      </div>
      <div className="mt-2 flex gap-1.5">
        {["all", "checkin", "created"].map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setMode(k)}
            className={`rounded-lg px-2 py-1 text-[11px] font-semibold ${mode === k ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"}`}
          >
            {k === "all" ? "All" : k === "checkin" ? "Check-ins" : "Created"}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="mt-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-3 text-xs text-slate-600">No activity yet.</div>
      ) : (
        <div className="mt-2 space-y-2">
          {filtered.map((e) => (
            <div key={e.id} className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-slate-900">{e.habitName}</div>
                  <div className="mt-0.5 text-[11px] text-slate-500">{e.action === "habit_created" ? "Created" : "Check-in"} • {formatWhen(e.date, e.createdAt)}</div>
                </div>
                {e.xpAwarded > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                    <Zap className="h-3 w-3" />+{e.xpAwarded}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-2 flex justify-end gap-2">
        {hasMore && (
          <button type="button" onClick={onLoadMore} disabled={loading} className="rounded-lg border border-slate-300 bg-white px-3 py-1 text-[11px] font-semibold text-slate-700 disabled:opacity-60">
            {loading ? "Loading..." : "Load more"}
          </button>
        )}
        {onCollapse && (
          <button type="button" onClick={onCollapse} className="rounded-lg bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-700">
            Collapse
          </button>
        )}
      </div>
    </div>
  );
}

export default function MobileProfileScreen({
  habits,
  player,
  playerProfile,
  titleState,
  skinName = "Classic Ledger",
  dailyQuestChain = null,
  weeklyBossEncounter = null,
  recoveryQuest = null,
  freezeCharges = 0,
  recentActivity = [],
  recentActivityLoading = false,
  recentActivityHasMore = false,
  onLoadMoreActivity,
  onCollapseActivity,
  unlockedSkinKeys = [],
  selectedSkinKey = "classic",
  onSelectSkin,
  dailyResetLabel = "",
  weeklyResetLabel = "",
}) {
  const source = playerProfile ?? player;
  const [profileTab, setProfileTab] = useState("overview");
  const [inventoryTab, setInventoryTab] = useState("rewards");

  const unlockedSet = useMemo(() => new Set(unlockedSkinKeys), [unlockedSkinKeys]);

  const stats = useMemo(() => {
    const safeHabits = habits ?? [];
    const unlockedMap = coerceUnlockedMap(source?.achievementsUnlocked);
    return {
      totalHabits: safeHabits.length,
      checkedInToday: safeHabits.filter((h) => h.checkedInToday).length,
      maxStreak: Math.max(0, ...safeHabits.map((h) => h.currentStreak ?? 0)),
      unlockedAchievements: Object.keys(unlockedMap).length,
      freezeCharges: Number(source?.streakFreezeCharges ?? 0),
      xpCurrent: Number(source?.totalXp ?? 0) % 300,
    };
  }, [habits, source?.achievementsUnlocked, source?.streakFreezeCharges, source?.totalXp]);

  const achievementRows = useMemo(() => {
    const unlockedMap = coerceUnlockedMap(source?.achievementsUnlocked);
    const ctx = buildAchievementContext(habits ?? [], source?.totalMinutesLogged ?? 0);

    return Object.entries(ACHIEVEMENTS)
      .map(([key, meta]) => {
        const unlocked = Boolean(unlockedMap[key]);
        const progress = getAchievementProgress(key, ctx);
        return {
          key,
          ...meta,
          unlocked,
          progressPct: Math.round(Math.max(0, Math.min(1, progress.progress01)) * 100),
          progressText: progress.progressText,
        };
      })
      .sort((a, b) => Number(b.unlocked) - Number(a.unlocked));
  }, [source?.achievementsUnlocked, source?.totalMinutesLogged, habits]);

  return (
    <div className="space-y-3 sm:hidden">
      <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-slate-900">Player Profile</div>
            <div className="mt-0.5 text-xs text-slate-500">{titleState?.current?.name ?? "Recruit"} · {skinName}</div>
          </div>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700">Lv {player.level}</span>
        </div>
        <div className="mt-2">
          <div className="mb-1 flex items-center justify-between text-[11px] font-semibold text-slate-500">
            <span>XP</span>
            <span>{stats.xpCurrent}/300</span>
          </div>
          <ProgressBar pct={Math.round((stats.xpCurrent / 300) * 100)} />
        </div>
      </div>

      <div className="sticky top-2 z-20 rounded-2xl border border-slate-200 bg-white/95 p-1.5 shadow-sm backdrop-blur">
        <div className="grid grid-cols-3 gap-1.5">
          {PROFILE_TABS.map((tab) => {
            const Icon = tab.icon;
            const active = profileTab === tab.key;
            return (
              <button key={tab.key} type="button" onClick={() => setProfileTab(tab.key)} className={`rounded-xl px-2 py-2 text-xs font-semibold ${active ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-700"}`}>
                <span className="inline-flex items-center gap-1.5"><Icon className="h-3.5 w-3.5" />{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {profileTab === "overview" && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <MobileStat icon={BarChart3} label="Habits" value={stats.totalHabits} tint="bg-slate-100 text-slate-700" />
            <MobileStat icon={CheckCircle2} label="Done Today" value={stats.checkedInToday} tint="bg-emerald-100 text-emerald-700" />
            <MobileStat icon={Flame} label="Top Streak" value={stats.maxStreak} tint="bg-orange-100 text-orange-700" />
            <MobileStat icon={Trophy} label="Unlocked" value={stats.unlockedAchievements} tint="bg-fuchsia-100 text-fuchsia-700" />
            <MobileStat icon={Snowflake} label="Freeze" value={stats.freezeCharges} tint="bg-sky-100 text-sky-700" />
          </div>

          <MobileActivity
            items={recentActivity}
            loading={recentActivityLoading}
            hasMore={recentActivityHasMore}
            onLoadMore={onLoadMoreActivity}
            onCollapse={onCollapseActivity}
          />
        </div>
      )}

      {profileTab === "inventory" && (
        <div className="space-y-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm">
            <div className="grid grid-cols-3 gap-1.5">
              {INVENTORY_TABS.map((tab) => {
                const active = inventoryTab === tab.key;
                return (
                  <button key={tab.key} type="button" onClick={() => setInventoryTab(tab.key)} className={`rounded-lg px-2 py-1.5 text-xs font-semibold ${active ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-700"}`}>
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {inventoryTab === "rewards" && (
            <div className="grid gap-2">
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                <div className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700"><Gift className="h-3.5 w-3.5" /> Daily Chest</div>
                <div className="mt-1 text-sm font-semibold text-slate-900">{dailyQuestChain?.rewardClaimed ? "Claimed" : dailyQuestChain?.rewardClaimable ? "Ready" : "Locked"}</div>
                {dailyResetLabel && <div className="mt-1 text-[11px] text-amber-700">Resets in {dailyResetLabel}</div>}
              </div>
              <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-3">
                <div className="text-xs font-semibold text-indigo-700">Weekly Chest</div>
                <div className="mt-1 text-sm font-semibold text-slate-900">{weeklyBossEncounter?.rewardClaimed ? "Claimed" : weeklyBossEncounter?.rewardClaimable ? "Ready" : "Locked"}</div>
                {weeklyResetLabel && <div className="mt-1 text-[11px] text-indigo-700">Resets in {weeklyResetLabel}</div>}
              </div>
            </div>
          )}

          {inventoryTab === "tools" && (
            <div className="grid gap-2">
              <div className="rounded-xl border border-sky-200 bg-sky-50 p-3">
                <div className="inline-flex items-center gap-1 text-xs font-semibold text-sky-700"><Shield className="h-3.5 w-3.5" /> Freeze Charges</div>
                <div className="mt-1 text-xl font-bold text-slate-900">{freezeCharges}</div>
              </div>
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                <div className="text-xs font-semibold text-amber-700">Recovery Quest</div>
                {!recoveryQuest?.active ? <div className="mt-1 text-sm text-slate-600">Inactive</div> : <div className="mt-1 text-sm text-slate-700">{recoveryQuest.progressDays}/{recoveryQuest.targetDays} days · +{recoveryQuest.rewardXp} XP</div>}
              </div>
            </div>
          )}

          {inventoryTab === "skins" && (
            <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
              <div className="mb-2 text-xs font-semibold text-slate-500">Cosmetics</div>
              <div className="grid grid-cols-4 gap-2">
                {QUEST_SKINS.map((skin) => {
                  const unlocked = unlockedSet.has(skin.key);
                  const selected = selectedSkinKey === skin.key;
                  return <MobileSkinTile key={skin.key} skin={skin} unlocked={unlocked} selected={selected} onSelect={() => unlocked && onSelectSkin?.(skin.key)} />;
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {profileTab === "achievements" && (
        <div className="grid gap-2">
          {achievementRows.map((a) => {
            const rarity = RARITY_MOBILE[a.rarity] ?? RARITY_MOBILE.common;
            return (
              <div key={a.key} className={`rounded-xl border p-3 shadow-sm ${rarity.card}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2">
                    <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl text-lg shadow-sm ${rarity.orb}`}>
                      {a.emoji}
                    </span>
                    <div>
                      <div className="text-sm font-semibold text-slate-900">{a.title}</div>
                      <div className="mt-0.5 text-[11px] text-slate-500">{a.description}</div>
                    </div>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${rarity.badge}`}>{a.rarity}</span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div className={`h-full ${a.unlocked ? "bg-emerald-500" : rarity.bar}`} style={{ width: `${a.unlocked ? 100 : a.progressPct}%` }} />
                </div>
                <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                  <span>{a.unlocked ? "Unlocked" : a.progressText}</span>
                  <span className="font-semibold text-slate-600">{a.unlocked ? "100%" : `${a.progressPct}%`}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
