import { useMemo } from "react";
import { BarChart3, CheckCircle2, Flame, ListChecks, Snowflake } from "lucide-react";
import { PlayerBar } from "./PlayerBar";
import TitleBanner from "./TitleBanner";
import AchievementsScreen from "./AchievementsScreen";
import ActivityFeed from "./ActivityFeed";
import SkinInventory from "./SkinInventory";
import { coerceUnlockedMap } from "../gamification/achievements";

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
  recentActivity = [],
  recentActivityLoading = false,
  recentActivityHasMore = false,
  onLoadMoreActivity,
  onCollapseActivity,
  unlockedSkinKeys = [],
  selectedSkinKey = "classic",
  onSelectSkin,
}) {
  const source = playerProfile ?? player;

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
    <div className="motion-fade-slide space-y-4">
      <PlayerBar
        level={player.level}
        totalXp={player.totalXp}
        totalMinutesLogged={player.totalMinutesLogged}
        achievementsUnlocked={source?.achievementsUnlocked}
        titleState={titleState}
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={ListChecks} label="Total Quests" value={stats.totalHabits} tint="bg-slate-100 text-slate-700" />
        <StatCard icon={CheckCircle2} label="Done Today" value={stats.checkedInToday} tint="bg-emerald-100 text-emerald-700" />
        <StatCard icon={Flame} label="Top Streak" value={stats.maxStreak} tint="bg-orange-100 text-orange-700" />
        <StatCard icon={BarChart3} label="Unlocked Achievements" value={stats.unlockedAchievements} tint="bg-fuchsia-100 text-fuchsia-700" />
        <StatCard icon={Snowflake} label="Freeze Charges" value={stats.freezeCharges} tint="bg-sky-100 text-sky-700" />
      </div>

      <TitleBanner
        level={player.level}
        achievementsUnlocked={source?.achievementsUnlocked}
        titleState={titleState}
      />

      <ActivityFeed
        items={recentActivity}
        loading={recentActivityLoading}
        hasMore={recentActivityHasMore}
        onLoadMore={onLoadMoreActivity}
        onCollapse={onCollapseActivity}
      />

      <SkinInventory
        unlockedSkinKeys={unlockedSkinKeys}
        selectedSkinKey={selectedSkinKey}
        onSelectSkin={onSelectSkin}
        habits={habits}
        totalMinutesLogged={source?.totalMinutesLogged ?? 0}
      />

      <AchievementsScreen habits={habits} playerProfile={source} />
    </div>
  );
}
