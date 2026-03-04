import { useMemo, useState } from "react";
import {
  BarChart3,
  CheckCircle2,
  Flame,
  Gift,
  ListChecks,
  Package,
  Palette,
  Shield,
  Snowflake,
  Sparkles,
  Trophy,
} from "lucide-react";
import { PlayerBar } from "./PlayerBar";
import TitleBanner from "./TitleBanner";
import AchievementsScreen from "./AchievementsScreen";
import ActivityFeed from "./ActivityFeed";
import SkinInventory from "./SkinInventory";
import { coerceUnlockedMap } from "../gamification/achievements";

const PROFILE_SKIN_THEME = {
  classic: {
    headerClass: "border-slate-200 bg-gradient-to-r from-white to-slate-50",
    chipClass: "bg-slate-100 text-slate-700",
    cardBorder: "border-slate-200",
  },
  ember: {
    headerClass: "border-rose-200 bg-gradient-to-r from-rose-50 to-orange-50",
    chipClass: "bg-rose-100 text-rose-700",
    cardBorder: "border-rose-200",
  },
  chrono: {
    headerClass: "border-sky-200 bg-gradient-to-r from-cyan-50 to-sky-50",
    chipClass: "bg-sky-100 text-sky-700",
    cardBorder: "border-sky-200",
  },
  aegis: {
    headerClass: "border-fuchsia-200 bg-gradient-to-r from-fuchsia-50 to-violet-50",
    chipClass: "bg-fuchsia-100 text-fuchsia-700",
    cardBorder: "border-fuchsia-200",
  },
  sunforge: {
    headerClass: "border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50",
    chipClass: "bg-orange-100 text-orange-700",
    cardBorder: "border-orange-200",
  },
  sovereign: {
    headerClass: "border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50",
    chipClass: "bg-amber-100 text-amber-700",
    cardBorder: "border-amber-200",
  },
  voidrunner: {
    headerClass: "border-indigo-200 bg-gradient-to-r from-indigo-50 to-violet-50",
    chipClass: "bg-indigo-100 text-indigo-700",
    cardBorder: "border-indigo-200",
  },
  behemoth: {
    headerClass: "border-emerald-200 bg-gradient-to-r from-emerald-50 to-cyan-50",
    chipClass: "bg-emerald-100 text-emerald-700",
    cardBorder: "border-emerald-200",
  },
  astral: {
    headerClass: "border-blue-200 bg-gradient-to-r from-sky-50 to-indigo-50",
    chipClass: "bg-blue-100 text-blue-700",
    cardBorder: "border-blue-200",
  },
  starlit: {
    headerClass: "border-indigo-200 bg-gradient-to-r from-indigo-50 to-sky-50",
    chipClass: "bg-indigo-100 text-indigo-700",
    cardBorder: "border-indigo-200",
  },
};

function StatCard({ icon: Icon, label, value, tint }) {
  return (
    <div className="surface-interactive rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-slate-300">
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <span className={`inline-flex h-7 w-7 items-center justify-center rounded-lg ${tint}`}>
          <Icon className="h-4 w-4" />
        </span>
        {label}
      </div>
      <div className="mt-2 text-2xl font-bold text-slate-900">{value}</div>
    </div>
  );
}

export default function ProfileScreen({
  habits,
  player,
  playerProfile,
  titleState,
  skinKey = "classic",
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
  const profileTheme = PROFILE_SKIN_THEME[skinKey] ?? PROFILE_SKIN_THEME.classic;
  const [profileTab, setProfileTab] = useState("overview");
  const [inventoryTab, setInventoryTab] = useState("rewards");
  const profileTabs = [
    { key: "overview", label: "Overview", icon: BarChart3 },
    { key: "inventory", label: "Inventory", icon: Package },
    { key: "achievements", label: "Achievements", icon: Trophy },
  ];

  // Keep profile metrics in one memo so all cards render from same snapshot.
  const stats = useMemo(() => {
    const safeHabits = habits ?? [];
    const unlockedMap = coerceUnlockedMap(source?.achievementsUnlocked);

    return {
      totalHabits: safeHabits.length,
      checkedInToday: safeHabits.filter((h) => h.checkedInToday).length,
      maxStreak: Math.max(0, ...safeHabits.map((h) => h.currentStreak ?? 0)),
      unlockedAchievements: Object.keys(unlockedMap).length,
      freezeCharges: Number(source?.streakFreezeCharges ?? 0),
    };
  }, [habits, source?.achievementsUnlocked, source?.streakFreezeCharges]);

  return (
    <div className="space-y-4">
      <div className={`rounded-2xl border p-4 shadow-sm ${profileTheme.headerClass}`}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-slate-900">Player Profile</div>
            <div className="mt-1 text-xs text-slate-600">Progress, stats, activity, and cosmetic loadout.</div>
          </div>
          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${profileTheme.chipClass}`}>
            <Palette className="h-3.5 w-3.5" />
            Skin: {skinName}
          </span>
        </div>
      </div>

      {/* Mobile-first: sticky segmented tabs keep profile sections reachable on long scrolls. */}
      <div className="sticky top-2 z-20 -mx-1 rounded-2xl border border-slate-200 bg-white/95 p-1 shadow-sm backdrop-blur sm:hidden">
        <div className="grid grid-cols-3 gap-1.5">
          {profileTabs.map((tab) => {
            const Icon = tab.icon;
            const active = profileTab === tab.key;
            return (
              <button
                key={`mobile-${tab.key}`}
                type="button"
                onClick={() => setProfileTab(tab.key)}
                className={`rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-200 ${
                  active
                    ? "bg-gradient-to-r from-slate-900 to-slate-700 text-white shadow-sm"
                    : "bg-white text-slate-700 hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-sm"
                }`}
              >
                <span className="inline-flex items-center gap-1.5">
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="hidden grid-cols-3 gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm sm:grid">
        {profileTabs.map((tab) => {
          const Icon = tab.icon;
          const active = profileTab === tab.key;
          return (
            <button
              key={`desktop-${tab.key}`}
              type="button"
              onClick={() => setProfileTab(tab.key)}
              className={`rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-200 ${
                active
                  ? "bg-gradient-to-r from-slate-900 to-slate-700 text-white shadow-sm"
                  : "bg-white text-slate-700 hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-sm"
              }`}
            >
              <span className="inline-flex items-center gap-1.5">
                <Icon className="h-4 w-4" />
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      {profileTab === "overview" && (
        <>
          <PlayerBar
            level={player.level}
            totalXp={player.totalXp}
            totalMinutesLogged={player.totalMinutesLogged}
            achievementsUnlocked={source?.achievementsUnlocked}
            titleState={titleState}
          />

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className={profileTheme.cardBorder + " rounded-xl border"}>
              <StatCard icon={ListChecks} label="Total Habits" value={stats.totalHabits} tint="bg-slate-100 text-slate-700" />
            </div>
            <div className={profileTheme.cardBorder + " rounded-xl border"}>
              <StatCard icon={CheckCircle2} label="Done Today" value={stats.checkedInToday} tint="bg-emerald-100 text-emerald-700" />
            </div>
            <div className={profileTheme.cardBorder + " rounded-xl border"}>
              <StatCard icon={Flame} label="Top Streak" value={stats.maxStreak} tint="bg-orange-100 text-orange-700" />
            </div>
            <div className={profileTheme.cardBorder + " rounded-xl border"}>
              <StatCard icon={BarChart3} label="Unlocked Achievements" value={stats.unlockedAchievements} tint="bg-fuchsia-100 text-fuchsia-700" />
            </div>
            <div className={profileTheme.cardBorder + " rounded-xl border"}>
              <StatCard icon={Snowflake} label="Freeze Charges" value={stats.freezeCharges} tint="bg-sky-100 text-sky-700" />
            </div>
          </div>

          <TitleBanner
            level={player.level}
            achievementsUnlocked={source?.achievementsUnlocked}
            titleState={titleState}
          />

          <ActivityFeed
            skinKey={skinKey}
            items={recentActivity}
            loading={recentActivityLoading}
            hasMore={recentActivityHasMore}
            onLoadMore={onLoadMoreActivity}
            onCollapse={onCollapseActivity}
          />
        </>
      )}

      {profileTab === "inventory" && (
        <div className={`rounded-2xl border p-4 shadow-sm ${profileTheme.headerClass}`}>
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-slate-900">Personal Inventory</div>
              <div className="mt-1 text-xs text-slate-600">
                Store consumables, manage rewards timing, and equip cosmetics.
              </div>
            </div>
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${profileTheme.chipClass}`}>
              <Sparkles className="h-3.5 w-3.5" />
              Skin Active: {skinName}
            </span>
          </div>

          <div className="mb-3 grid grid-cols-3 gap-2 rounded-xl border border-slate-200 bg-white p-2">
            {[
              { key: "rewards", label: "Rewards", icon: Gift },
              { key: "consumables", label: "Consumables", icon: Shield },
              { key: "cosmetics", label: "Cosmetics", icon: Palette },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = inventoryTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setInventoryTab(tab.key)}
                  className={`rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                    active
                      ? "bg-gradient-to-r from-slate-900 to-slate-700 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  <span className="inline-flex items-center gap-1.5">
                    <Icon className="h-3.5 w-3.5" />
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>

          {inventoryTab === "rewards" && (
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                <div className="text-xs font-semibold uppercase tracking-wide text-amber-700">Daily Chest</div>
                <div className="mt-1 text-sm font-semibold text-slate-900">
                  {dailyQuestChain?.rewardClaimed
                    ? "Claimed"
                    : dailyQuestChain?.rewardClaimable
                    ? "Ready to claim"
                    : "Locked"}
                </div>
                <div className="mt-1 text-xs text-slate-600">Strategic tip: leave unclaimed until you want an XP burst.</div>
                {dailyResetLabel && (
                  <div className="mt-1 text-[11px] font-semibold text-amber-700">Resets in {dailyResetLabel}</div>
                )}
              </div>
              <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-3">
                <div className="text-xs font-semibold uppercase tracking-wide text-indigo-700">Weekly Chest</div>
                <div className="mt-1 text-sm font-semibold text-slate-900">
                  {weeklyBossEncounter?.rewardClaimed
                    ? "Claimed"
                    : weeklyBossEncounter?.rewardClaimable
                    ? "Ready to claim"
                    : "Locked"}
                </div>
                <div className="mt-1 text-xs text-slate-600">High-value payout. Save for level timing if needed.</div>
                {weeklyResetLabel && (
                  <div className="mt-1 text-[11px] font-semibold text-indigo-700">Resets in {weeklyResetLabel}</div>
                )}
              </div>
              <div className="rounded-xl border border-sky-200 bg-sky-50 p-3">
                <div className="text-xs font-semibold uppercase tracking-wide text-sky-700">Recovery Reward</div>
                <div className="mt-1 text-sm font-semibold text-slate-900">
                  {recoveryQuest?.claimed
                    ? "Claimed"
                    : recoveryQuest?.claimable
                    ? "Ready to claim"
                    : recoveryQuest?.active
                    ? "In progress"
                    : "Inactive"}
                </div>
                <div className="mt-1 text-xs text-slate-600">Comeback rewards can be banked until you are ready.</div>
                {dailyResetLabel && (
                  <div className="mt-1 text-[11px] font-semibold text-sky-700">Daily cycle resets in {dailyResetLabel}</div>
                )}
              </div>
            </div>
          )}

          {inventoryTab === "consumables" && (
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-xl border border-sky-200 bg-sky-50 p-3">
                <div className="text-xs font-semibold uppercase tracking-wide text-sky-700">Streak Freeze Charges</div>
                <div className="mt-1 text-2xl font-bold text-slate-900">{freezeCharges}</div>
                <div className="mt-1 text-xs text-slate-600">Use only when a streak habit is at risk and cannot be checked in.</div>
              </div>
              <div className="rounded-xl border border-violet-200 bg-violet-50 p-3">
                <div className="text-xs font-semibold uppercase tracking-wide text-violet-700">Consumable Strategy</div>
                <ul className="mt-1 space-y-1 text-xs text-slate-600">
                  <li>1. Protect longest streak habits first.</li>
                  <li>2. Claim rewards when you want XP spikes.</li>
                  <li>3. Keep one freeze charge as emergency buffer.</li>
                </ul>
              </div>
            </div>
          )}

          {inventoryTab === "cosmetics" && (
            <SkinInventory
              skinKey={skinKey}
              unlockedSkinKeys={unlockedSkinKeys}
              selectedSkinKey={selectedSkinKey}
              onSelectSkin={onSelectSkin}
              habits={habits}
              totalMinutesLogged={source?.totalMinutesLogged ?? 0}
            />
          )}
        </div>
      )}

      {profileTab === "achievements" && (
        <AchievementsScreen skinKey={skinKey} habits={habits} playerProfile={source} />
      )}
    </div>
  );
}
