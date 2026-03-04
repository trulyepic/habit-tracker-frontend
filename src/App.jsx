import { useMutation, useQuery } from "@apollo/client/react";
import { Suspense, lazy, useEffect, useMemo, useRef, useState } from "react";
import { Compass, Flame, ShieldCheck, Snowflake, Sparkles, Swords, Volume2, VolumeX } from "lucide-react";

import AuthBar from "./components/AuthBar";
import HabitCard from "./components/HabitCard";

import { useAuth } from "./hooks/useAuth";
import { useGuestHabits } from "./hooks/useGuestHabits";
import { useClaimActions } from "./hooks/useClaimActions";

import { API_BASE } from "./lib/config";
import { guestApplyCheckin, guestNewHabit } from "./lib/guestHabitUtils";
import { playSoundCue, primeSoundCues } from "./lib/soundCues";

import {
  CLAIM_DAILY_QUEST_REWARD,
  CLAIM_RECOVERY_QUEST_REWARD,
  CLAIM_WEEKLY_BOSS_REWARD,
  CHECK_IN_TODAY,
  CONSUME_STREAK_FREEZE,
  CREATE_HABIT,
  DAILY_QUEST_CHAIN,
  DELETE_HABIT,
  GET_HABITS,
  RECENT_ACTIVITY,
  TOGGLE_HABIT,
  WEEKLY_BOSS_ENCOUNTER,
} from "./graphql/operations";
import { HABIT_FIELDS } from "./graphql/fragments";
import { useGamification } from "./gamification/useGamification";
import MiniMapNav from "./components/MiniMapNav";
import QuestPanelTabs from "./components/QuestPanelTabs";
import ProfileScreen from "./components/ProfileScreen";
import { DailyQuestChain, WeeklyBossEncounter } from "./components/bosses";
import ClaimCenter from "./components/ClaimCenter";
import XpOrb from "./components/XpOrb";
import StreakComboMeter from "./components/StreakComboMeter";
import MobileQuestScreen from "./components/mobile/MobileQuestScreen";
import MobileProfileScreen from "./components/mobile/MobileProfileScreen";
import { coerceUnlockedMap } from "./gamification/achievements";
import { resolveTitleState, resolveTitleStateFromServerProfile } from "./gamification/titles";
import { getUnlockedSkins, resolveSkin } from "./gamification/skins";
import { formatCountdown, msUntilNextLocalMidnight, msUntilWeeklyReset } from "./lib/resetTimers";

const RewardToast = lazy(() => import("./components/RewardToast"));
const AchievementToast = lazy(() => import("./components/AchievementToast"));
const LevelUpScene = lazy(() => import("./components/LevelUpScene"));
const RewardChestReveal = lazy(() => import("./components/RewardChestReveal"));

const STARTER_QUESTS = [
  { name: "Morning Mobility", description: "10 minutes of stretching right after waking up." },
  { name: "Focus Sprint", description: "One 25-minute deep work sprint before noon." },
  { name: "Evening Wind-down", description: "No phone for 30 minutes before bed." },
];
const CHECKIN_MINUTES_MIN = 1;
const CHECKIN_MINUTES_MAX = 720;

const SKIN_UI = {
  classic: {
    heroClass: "from-slate-900 via-slate-800 to-slate-900",
    orb1: "bg-cyan-300/40",
    orb2: "bg-fuchsia-300/35",
    orb3: "bg-amber-300/28",
    veil: "from-cyan-100/18 via-transparent to-fuchsia-100/20",
    navActiveClass: "bg-gradient-to-r from-slate-900 to-slate-700 text-white shadow-sm",
    tabActiveClass: "border-slate-900 bg-gradient-to-r from-slate-900 to-slate-700 text-white shadow-sm",
    claimPanelClass: "border-slate-200 bg-white",
  },
  ember: {
    heroClass: "from-rose-900 via-red-800 to-orange-700",
    orb1: "bg-rose-300/35",
    orb2: "bg-orange-300/30",
    orb3: "bg-amber-300/28",
    veil: "from-rose-100/18 via-transparent to-orange-100/20",
    navActiveClass: "bg-gradient-to-r from-rose-700 to-orange-700 text-white shadow-sm",
    tabActiveClass: "border-rose-700 bg-gradient-to-r from-rose-700 to-orange-700 text-white shadow-sm",
    claimPanelClass: "border-rose-200 bg-gradient-to-br from-rose-50 to-orange-50",
  },
  chrono: {
    heroClass: "from-sky-900 via-cyan-800 to-blue-800",
    orb1: "bg-cyan-300/40",
    orb2: "bg-sky-300/35",
    orb3: "bg-blue-300/25",
    veil: "from-cyan-100/18 via-transparent to-sky-100/20",
    navActiveClass: "bg-gradient-to-r from-cyan-700 to-blue-700 text-white shadow-sm",
    tabActiveClass: "border-cyan-700 bg-gradient-to-r from-cyan-700 to-blue-700 text-white shadow-sm",
    claimPanelClass: "border-sky-200 bg-gradient-to-br from-cyan-50 to-sky-50",
  },
  aegis: {
    heroClass: "from-fuchsia-900 via-violet-800 to-indigo-800",
    orb1: "bg-fuchsia-300/35",
    orb2: "bg-violet-300/30",
    orb3: "bg-indigo-300/25",
    veil: "from-fuchsia-100/20 via-transparent to-violet-100/20",
    navActiveClass: "bg-gradient-to-r from-fuchsia-700 to-violet-700 text-white shadow-sm",
    tabActiveClass: "border-fuchsia-700 bg-gradient-to-r from-fuchsia-700 to-violet-700 text-white shadow-sm",
    claimPanelClass: "border-fuchsia-200 bg-gradient-to-br from-fuchsia-50 to-violet-50",
  },
  sunforge: {
    heroClass: "from-orange-900 via-amber-800 to-yellow-700",
    orb1: "bg-orange-300/35",
    orb2: "bg-amber-300/30",
    orb3: "bg-yellow-300/25",
    veil: "from-orange-100/20 via-transparent to-yellow-100/20",
    navActiveClass: "bg-gradient-to-r from-orange-700 to-amber-700 text-white shadow-sm",
    tabActiveClass: "border-orange-700 bg-gradient-to-r from-orange-700 to-amber-700 text-white shadow-sm",
    claimPanelClass: "border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50",
  },
  sovereign: {
    heroClass: "from-amber-900 via-orange-800 to-yellow-700",
    orb1: "bg-amber-300/35",
    orb2: "bg-yellow-300/30",
    orb3: "bg-orange-300/25",
    veil: "from-amber-100/20 via-transparent to-yellow-100/20",
    navActiveClass: "bg-gradient-to-r from-amber-700 to-orange-700 text-white shadow-sm",
    tabActiveClass: "border-amber-700 bg-gradient-to-r from-amber-700 to-orange-700 text-white shadow-sm",
    claimPanelClass: "border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50",
  },
  voidrunner: {
    heroClass: "from-indigo-900 via-violet-900 to-fuchsia-800",
    orb1: "bg-indigo-300/35",
    orb2: "bg-violet-300/30",
    orb3: "bg-fuchsia-300/25",
    veil: "from-indigo-100/20 via-transparent to-fuchsia-100/20",
    navActiveClass: "bg-gradient-to-r from-indigo-700 to-violet-700 text-white shadow-sm",
    tabActiveClass: "border-indigo-700 bg-gradient-to-r from-indigo-700 to-violet-700 text-white shadow-sm",
    claimPanelClass: "border-indigo-200 bg-gradient-to-br from-indigo-50 to-violet-50",
  },
  behemoth: {
    heroClass: "from-emerald-900 via-teal-900 to-cyan-800",
    orb1: "bg-emerald-300/35",
    orb2: "bg-teal-300/30",
    orb3: "bg-cyan-300/25",
    veil: "from-emerald-100/20 via-transparent to-cyan-100/20",
    navActiveClass: "bg-gradient-to-r from-emerald-700 to-teal-700 text-white shadow-sm",
    tabActiveClass: "border-emerald-700 bg-gradient-to-r from-emerald-700 to-teal-700 text-white shadow-sm",
    claimPanelClass: "border-emerald-200 bg-gradient-to-br from-emerald-50 to-cyan-50",
  },
  astral: {
    heroClass: "from-sky-900 via-blue-900 to-indigo-800",
    orb1: "bg-sky-300/35",
    orb2: "bg-blue-300/30",
    orb3: "bg-indigo-300/25",
    veil: "from-sky-100/20 via-transparent to-indigo-100/20",
    navActiveClass: "bg-gradient-to-r from-sky-700 to-indigo-700 text-white shadow-sm",
    tabActiveClass: "border-sky-700 bg-gradient-to-r from-sky-700 to-indigo-700 text-white shadow-sm",
    claimPanelClass: "border-sky-200 bg-gradient-to-br from-sky-50 to-indigo-50",
  },
  starlit: {
    heroClass: "from-indigo-950 via-sky-900 to-cyan-800",
    orb1: "bg-indigo-300/35",
    orb2: "bg-sky-300/30",
    orb3: "bg-cyan-300/25",
    veil: "from-indigo-100/20 via-transparent to-cyan-100/20",
    navActiveClass: "bg-gradient-to-r from-indigo-700 to-sky-700 text-white shadow-sm",
    tabActiveClass: "border-indigo-700 bg-gradient-to-r from-indigo-700 to-sky-700 text-white shadow-sm",
    claimPanelClass: "border-indigo-200 bg-gradient-to-br from-indigo-50 to-sky-50",
  },
};

const QUEST_DASHBOARD_UI = {
  classic: {
    statBase: "border-slate-200 bg-white",
    statChecked: "border-emerald-200 bg-emerald-50",
    statPending: "border-amber-200 bg-amber-50",
    statPower: "border-fuchsia-200 bg-fuchsia-50",
    winPanel: "border-indigo-200 bg-gradient-to-r from-indigo-50 via-white to-cyan-50",
    winLabel: "text-indigo-700",
    winPrimaryBtn: "border-indigo-300 text-indigo-700 hover:bg-indigo-50",
    winSecondaryBtn: "border-slate-300 text-slate-700 hover:bg-slate-50",
    activeLabel: "text-slate-500",
    activeValue: "text-slate-900",
    checkedLabel: "text-emerald-700",
    checkedValue: "text-emerald-800",
    pendingLabel: "text-amber-700",
    pendingValue: "text-amber-800",
    powerLabel: "text-fuchsia-700",
    powerValue: "text-fuchsia-800",
  },
  ember: {
    statBase: "border-rose-200 bg-rose-50/55",
    statChecked: "border-emerald-200 bg-emerald-50",
    statPending: "border-amber-200 bg-amber-50",
    statPower: "border-rose-200 bg-orange-50",
    winPanel: "border-rose-200 bg-gradient-to-r from-rose-50 via-orange-50 to-amber-50",
    winLabel: "text-rose-700",
    winPrimaryBtn: "border-rose-300 text-rose-700 hover:bg-rose-50",
    winSecondaryBtn: "border-orange-300 text-orange-700 hover:bg-orange-50",
    activeLabel: "text-rose-700",
    activeValue: "text-rose-900",
    checkedLabel: "text-emerald-700",
    checkedValue: "text-emerald-800",
    pendingLabel: "text-amber-700",
    pendingValue: "text-amber-800",
    powerLabel: "text-orange-700",
    powerValue: "text-orange-900",
  },
  chrono: {
    statBase: "border-sky-200 bg-cyan-50/55",
    statChecked: "border-emerald-200 bg-emerald-50",
    statPending: "border-amber-200 bg-amber-50",
    statPower: "border-sky-200 bg-sky-50",
    winPanel: "border-sky-200 bg-gradient-to-r from-cyan-50 via-sky-50 to-blue-50",
    winLabel: "text-sky-700",
    winPrimaryBtn: "border-sky-300 text-sky-700 hover:bg-sky-50",
    winSecondaryBtn: "border-cyan-300 text-cyan-700 hover:bg-cyan-50",
    activeLabel: "text-cyan-700",
    activeValue: "text-cyan-900",
    checkedLabel: "text-emerald-700",
    checkedValue: "text-emerald-800",
    pendingLabel: "text-amber-700",
    pendingValue: "text-amber-800",
    powerLabel: "text-sky-700",
    powerValue: "text-sky-900",
  },
  aegis: {
    statBase: "border-fuchsia-200 bg-fuchsia-50/55",
    statChecked: "border-emerald-200 bg-emerald-50",
    statPending: "border-amber-200 bg-amber-50",
    statPower: "border-violet-200 bg-violet-50",
    winPanel: "border-fuchsia-200 bg-gradient-to-r from-fuchsia-50 via-violet-50 to-indigo-50",
    winLabel: "text-fuchsia-700",
    winPrimaryBtn: "border-fuchsia-300 text-fuchsia-700 hover:bg-fuchsia-50",
    winSecondaryBtn: "border-violet-300 text-violet-700 hover:bg-violet-50",
    activeLabel: "text-fuchsia-700",
    activeValue: "text-fuchsia-900",
    checkedLabel: "text-emerald-700",
    checkedValue: "text-emerald-800",
    pendingLabel: "text-amber-700",
    pendingValue: "text-amber-800",
    powerLabel: "text-violet-700",
    powerValue: "text-violet-900",
  },
  sunforge: {
    statBase: "border-orange-200 bg-orange-50/60",
    statChecked: "border-emerald-200 bg-emerald-50",
    statPending: "border-amber-200 bg-amber-50",
    statPower: "border-yellow-200 bg-yellow-50",
    winPanel: "border-orange-200 bg-gradient-to-r from-orange-50 via-amber-50 to-yellow-50",
    winLabel: "text-orange-700",
    winPrimaryBtn: "border-orange-300 text-orange-700 hover:bg-orange-50",
    winSecondaryBtn: "border-amber-300 text-amber-700 hover:bg-amber-50",
    activeLabel: "text-orange-700",
    activeValue: "text-orange-900",
    checkedLabel: "text-emerald-700",
    checkedValue: "text-emerald-800",
    pendingLabel: "text-amber-700",
    pendingValue: "text-amber-800",
    powerLabel: "text-yellow-700",
    powerValue: "text-yellow-900",
  },
  sovereign: {
    statBase: "border-amber-200 bg-amber-50/60",
    statChecked: "border-emerald-200 bg-emerald-50",
    statPending: "border-orange-200 bg-orange-50",
    statPower: "border-yellow-200 bg-yellow-50",
    winPanel: "border-amber-200 bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50",
    winLabel: "text-amber-700",
    winPrimaryBtn: "border-amber-300 text-amber-700 hover:bg-amber-50",
    winSecondaryBtn: "border-orange-300 text-orange-700 hover:bg-orange-50",
    activeLabel: "text-amber-700",
    activeValue: "text-amber-900",
    checkedLabel: "text-emerald-700",
    checkedValue: "text-emerald-800",
    pendingLabel: "text-orange-700",
    pendingValue: "text-orange-900",
    powerLabel: "text-yellow-700",
    powerValue: "text-yellow-900",
  },
  voidrunner: {
    statBase: "border-indigo-200 bg-indigo-50/55",
    statChecked: "border-emerald-200 bg-emerald-50",
    statPending: "border-amber-200 bg-amber-50",
    statPower: "border-violet-200 bg-violet-50",
    winPanel: "border-indigo-200 bg-gradient-to-r from-indigo-50 via-violet-50 to-fuchsia-50",
    winLabel: "text-indigo-700",
    winPrimaryBtn: "border-indigo-300 text-indigo-700 hover:bg-indigo-50",
    winSecondaryBtn: "border-violet-300 text-violet-700 hover:bg-violet-50",
    activeLabel: "text-indigo-700",
    activeValue: "text-indigo-900",
    checkedLabel: "text-emerald-700",
    checkedValue: "text-emerald-800",
    pendingLabel: "text-amber-700",
    pendingValue: "text-amber-800",
    powerLabel: "text-violet-700",
    powerValue: "text-violet-900",
  },
  behemoth: {
    statBase: "border-emerald-200 bg-emerald-50/55",
    statChecked: "border-teal-200 bg-teal-50",
    statPending: "border-amber-200 bg-amber-50",
    statPower: "border-cyan-200 bg-cyan-50",
    winPanel: "border-emerald-200 bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50",
    winLabel: "text-emerald-700",
    winPrimaryBtn: "border-emerald-300 text-emerald-700 hover:bg-emerald-50",
    winSecondaryBtn: "border-teal-300 text-teal-700 hover:bg-teal-50",
    activeLabel: "text-emerald-700",
    activeValue: "text-emerald-900",
    checkedLabel: "text-teal-700",
    checkedValue: "text-teal-900",
    pendingLabel: "text-amber-700",
    pendingValue: "text-amber-800",
    powerLabel: "text-cyan-700",
    powerValue: "text-cyan-900",
  },
  astral: {
    statBase: "border-blue-200 bg-sky-50/55",
    statChecked: "border-emerald-200 bg-emerald-50",
    statPending: "border-amber-200 bg-amber-50",
    statPower: "border-indigo-200 bg-indigo-50",
    winPanel: "border-blue-200 bg-gradient-to-r from-sky-50 via-blue-50 to-indigo-50",
    winLabel: "text-blue-700",
    winPrimaryBtn: "border-blue-300 text-blue-700 hover:bg-blue-50",
    winSecondaryBtn: "border-indigo-300 text-indigo-700 hover:bg-indigo-50",
    activeLabel: "text-blue-700",
    activeValue: "text-blue-900",
    checkedLabel: "text-emerald-700",
    checkedValue: "text-emerald-800",
    pendingLabel: "text-amber-700",
    pendingValue: "text-amber-800",
    powerLabel: "text-indigo-700",
    powerValue: "text-indigo-900",
  },
  starlit: {
    statBase: "border-indigo-200 bg-indigo-50/60",
    statChecked: "border-emerald-200 bg-emerald-50",
    statPending: "border-amber-200 bg-amber-50",
    statPower: "border-sky-200 bg-sky-50",
    winPanel: "border-indigo-200 bg-gradient-to-r from-indigo-50 via-sky-50 to-cyan-50",
    winLabel: "text-indigo-700",
    winPrimaryBtn: "border-indigo-300 text-indigo-700 hover:bg-indigo-50",
    winSecondaryBtn: "border-sky-300 text-sky-700 hover:bg-sky-50",
    activeLabel: "text-indigo-700",
    activeValue: "text-indigo-900",
    checkedLabel: "text-emerald-700",
    checkedValue: "text-emerald-800",
    pendingLabel: "text-amber-700",
    pendingValue: "text-amber-800",
    powerLabel: "text-sky-700",
    powerValue: "text-sky-900",
  },
};

export default function App() {
  const { me, isAuthed, refetchMe } = useAuth();
  const { guestHabits, setGuestHabitsAndPersist, clearGuestHabits } = useGuestHabits();
  const {
    player,
    awardForCheckin,
    lastReward,
    clearLastReward,
    pushReward,
    lastUnlocks,
    clearLastUnlocks,
    syncProgressionFromServer,
  } = useGamification({
    isAuthed,
    serverProfile: me?.playerProfile ?? null,
  });

  const { data, loading, error, refetch: refetchHabits } = useQuery(GET_HABITS, {
    skip: !isAuthed,
  });
  const {
    data: dailyQuestData,
    loading: dailyQuestLoading,
    refetch: refetchDailyQuest,
  } = useQuery(DAILY_QUEST_CHAIN, {
    skip: !isAuthed,
    fetchPolicy: "network-only",
  });
  const {
    data: weeklyBossData,
    loading: weeklyBossLoading,
    refetch: refetchWeeklyBoss,
  } = useQuery(WEEKLY_BOSS_ENCOUNTER, {
    skip: !isAuthed,
    fetchPolicy: "network-only",
  });

  const [activityLimit, setActivityLimit] = useState(5);
  const { data: recentActivityData, loading: recentActivityLoading } = useQuery(RECENT_ACTIVITY, {
    variables: { limit: activityLimit },
    skip: !isAuthed,
    fetchPolicy: "network-only",
  });

  const habits = useMemo(() => (isAuthed ? data?.habits ?? [] : guestHabits), [isAuthed, data, guestHabits]);

  const [toggleHabit, { loading: togglingAuthed }] = useMutation(TOGGLE_HABIT);

  const [checkInToday, { loading: checkingInAuthed }] = useMutation(CHECK_IN_TODAY, {
    update(cache, { data }) {
      const updatedHabit = data?.checkInToday?.habit;
      if (!updatedHabit) return;

      cache.writeFragment({
        id: cache.identify(updatedHabit),
        fragment: HABIT_FIELDS,
        data: updatedHabit,
      });
    },
  });

  const [createHabit, { loading: creatingAuthed }] = useMutation(CREATE_HABIT, {
    update(cache, { data }) {
      const newHabit = data?.createHabit?.habit;
      if (!newHabit) return;

      cache.modify({
        fields: {
          habits(existingRefs = [], { readField }) {
            const newId = readField("id", newHabit);
            const alreadyExists = existingRefs.some((ref) => readField("id", ref) === newId);
            if (alreadyExists) return existingRefs;

            const newRef = cache.writeFragment({ data: newHabit, fragment: HABIT_FIELDS });
            return [newRef, ...existingRefs];
          },
        },
      });
    },
  });

  const [deleteHabit, { loading: deletingAuthed }] = useMutation(DELETE_HABIT, {
    update(cache, { data }) {
      const deletedId = data?.deleteHabit?.deletedId;
      if (!deletedId) return;

      cache.modify({
        fields: {
          habits(existingRefs = [], { readField }) {
            return existingRefs.filter((ref) => readField("id", ref) !== deletedId);
          },
        },
      });

      cache.evict({ id: cache.identify({ __typename: "HabitType", id: deletedId }) });
      cache.gc();
    },
  });

  const [claimDailyQuestReward, { loading: claimingDailyReward }] = useMutation(CLAIM_DAILY_QUEST_REWARD);
  const [claimWeeklyBossReward, { loading: claimingWeeklyBoss }] = useMutation(CLAIM_WEEKLY_BOSS_REWARD);
  const [consumeStreakFreeze, { loading: consumingFreeze }] = useMutation(CONSUME_STREAK_FREEZE);
  const [claimRecoveryQuestReward, { loading: claimingRecovery }] = useMutation(CLAIM_RECOVERY_QUEST_REWARD);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [importing, setImporting] = useState(false);
  const [view, setView] = useState("quests");
  const [isMobileView, setIsMobileView] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(max-width: 639px)").matches : false
  );
  const [questPanel, setQuestPanel] = useState("today");
  const [filterMode, setFilterMode] = useState("active");
  const [sortMode, setSortMode] = useState("next-up");
  const [claimCenterOpen, setClaimCenterOpen] = useState(false);
  const [chestReveal, setChestReveal] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem("habit-tracker:sound-enabled") !== "false";
  });
  const [selectedSkinKey, setSelectedSkinKey] = useState("classic");
  const [skinTransitionActive, setSkinTransitionActive] = useState(false);
  const [seenAchievementKeys, setSeenAchievementKeys] = useState([]);
  const [deactivateHint, setDeactivateHint] = useState("");
  const [nowMs, setNowMs] = useState(() => Date.now());
  const hasSeenInitialSkin = useRef(false);

  const creating = isAuthed ? creatingAuthed : false;
  const deleting = isAuthed ? deletingAuthed : false;
  const toggling = isAuthed ? togglingAuthed : false;
  const checkingIn = isAuthed ? checkingInAuthed : false;

  const displayedHabits = useMemo(() => {
    let list = [...habits];

    if (filterMode === "active") {
      list = list.filter((h) => h.isActive);
    } else if (filterMode === "pending") {
      list = list.filter((h) => !h.checkedInToday && h.isActive);
    }

    if (sortMode === "streak") {
      list.sort((a, b) => (b.currentStreak ?? 0) - (a.currentStreak ?? 0));
    } else if (sortMode === "best") {
      list.sort((a, b) => (b.bestStreak ?? 0) - (a.bestStreak ?? 0));
    } else if (sortMode === "alpha") {
      list.sort((a, b) => String(a.name).localeCompare(String(b.name)));
    } else {
      list.sort((a, b) => {
        const aScore = Number(a.isActive) * 2 + Number(!a.checkedInToday);
        const bScore = Number(b.isActive) * 2 + Number(!b.checkedInToday);
        if (bScore !== aScore) return bScore - aScore;
        return (b.currentStreak ?? 0) - (a.currentStreak ?? 0);
      });
    }

    return list;
  }, [habits, filterMode, sortMode]);

  const freezeCharges = me?.playerProfile?.streakFreezeCharges ?? 0;
  const recoveryQuest = me?.playerProfile?.recoveryQuest ?? null;
  const dailyQuestChain = dailyQuestData?.dailyQuestChain ?? null;
  const weeklyBossEncounter = weeklyBossData?.weeklyBossEncounter ?? null;
  const recentActivity = recentActivityData?.recentActivity ?? [];
  const recentActivityHasMore = recentActivity.length >= activityLimit;
  const unlockedAchievementsMap = coerceUnlockedMap(me?.playerProfile?.achievementsUnlocked);
  const unlockedAchievementKeys = Object.keys(unlockedAchievementsMap);
  const unseenAchievementKeys = unlockedAchievementKeys.filter((k) => !seenAchievementKeys.includes(k));
  const skinUnlockSource = isAuthed ? me?.playerProfile?.achievementsUnlocked : player?.achievementsUnlocked;
  const unlockedSkins = useMemo(() => getUnlockedSkins(skinUnlockSource), [skinUnlockSource]);
  const unlockedSkinKeys = useMemo(() => unlockedSkins.map((s) => s.key), [unlockedSkins]);
  const selectedSkin = useMemo(() => resolveSkin(selectedSkinKey), [selectedSkinKey]);
  const selectedSkinUi = useMemo(
    () => SKIN_UI[selectedSkin?.key] ?? SKIN_UI.classic,
    [selectedSkin?.key]
  );
  const questDashboardUi = useMemo(
    () => QUEST_DASHBOARD_UI[selectedSkin?.key] ?? QUEST_DASHBOARD_UI.classic,
    [selectedSkin?.key]
  );
  const skinStorageKey = `habit-tracker:skin:${isAuthed && me?.id ? me.id : "guest"}`;
  const claimableCount =
    Number(Boolean(dailyQuestChain?.rewardClaimable)) +
    Number(Boolean(weeklyBossEncounter?.rewardClaimable)) +
    Number(Boolean(recoveryQuest?.claimable)) +
    unseenAchievementKeys.length;
  const dailyResetLabel = useMemo(
    () => formatCountdown(msUntilNextLocalMidnight(new Date(nowMs))),
    [nowMs]
  );
  const weeklyResetLabel = useMemo(
    () => formatCountdown(msUntilWeeklyReset(weeklyBossEncounter?.weekEnd, new Date(nowMs))),
    [weeklyBossEncounter?.weekEnd, nowMs]
  );

  const atRiskHabits = useMemo(
    () => habits.filter((h) => h.isActive && !h.checkedInToday && (h.currentStreak ?? 0) > 0),
    [habits]
  );
  const questboardStats = useMemo(() => {
    const active = habits.filter((h) => h.isActive);
    const checkedToday = active.filter((h) => h.checkedInToday).length;
    const pendingToday = active.length - checkedToday;
    const streakPower = active.reduce((sum, h) => sum + Math.max(0, Number(h.currentStreak ?? 0)), 0);
    return {
      activeCount: active.length,
      checkedToday,
      pendingToday,
      streakPower,
      atRiskCount: atRiskHabits.length,
    };
  }, [habits, atRiskHabits.length]);

  const titleState = useMemo(() => {
    if (isAuthed) {
      const fromServer = resolveTitleStateFromServerProfile(me?.playerProfile);
      if (fromServer) return fromServer;
    }

    return resolveTitleState({
      level: player.level,
      achievementsUnlockedRaw: player?.achievementsUnlocked,
    });
  }, [isAuthed, me?.playerProfile, player.level, player?.achievementsUnlocked]);

  const {
    claimHistory,
    dailyClaimStatusText,
    weeklyClaimFeedback,
    pushClaimHistory,
    onClaimDailyReward,
    onClaimWeeklyBossReward,
    onClaimRecovery,
  } = useClaimActions({
    isAuthed,
    dailyQuestChain,
    playerLevel: player.level,
    soundEnabled,
    claimDailyQuestReward,
    claimWeeklyBossReward,
    claimRecoveryQuestReward,
    refetchMe,
    refetchHabits,
    refetchDailyQuest,
    refetchWeeklyBoss,
    pushReward,
    setChestReveal,
    playSoundCue,
  });

  useEffect(() => {
    const saved = localStorage.getItem(skinStorageKey);
    const fallback = unlockedSkinKeys.includes("classic") ? "classic" : unlockedSkinKeys[0] ?? "classic";
    const next = saved && unlockedSkinKeys.includes(saved) ? saved : fallback;
    setSelectedSkinKey(next);
  }, [skinStorageKey, unlockedSkinKeys.join("|")]);

  useEffect(() => {
    localStorage.setItem(skinStorageKey, selectedSkinKey);
  }, [skinStorageKey, selectedSkinKey]);

  useEffect(() => {
    if (!hasSeenInitialSkin.current) {
      hasSeenInitialSkin.current = true;
      return;
    }
    setSkinTransitionActive(true);
    const id = window.setTimeout(() => setSkinTransitionActive(false), 420);
    return () => window.clearTimeout(id);
  }, [selectedSkinKey]);

  useEffect(() => {
    localStorage.setItem("habit-tracker:sound-enabled", soundEnabled ? "true" : "false");
  }, [soundEnabled]);

  useEffect(() => {
    const id = window.setInterval(() => setNowMs(Date.now()), 60000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const mq = window.matchMedia("(max-width: 639px)");
    const onChange = (event) => setIsMobileView(event.matches);
    setIsMobileView(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (!soundEnabled) return;
    const onFirstInteract = () => {
      primeSoundCues();
      window.removeEventListener("pointerdown", onFirstInteract);
      window.removeEventListener("keydown", onFirstInteract);
    };
    window.addEventListener("pointerdown", onFirstInteract);
    window.addEventListener("keydown", onFirstInteract);
    return () => {
      window.removeEventListener("pointerdown", onFirstInteract);
      window.removeEventListener("keydown", onFirstInteract);
    };
  }, [soundEnabled]);

  useEffect(() => {
    if (!isAuthed || !me?.id) return;
    const key = `habit-tracker:seen-achievements:${me.id}`;
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(unlockedAchievementKeys));
      setSeenAchievementKeys(unlockedAchievementKeys);
      return;
    }
    try {
      const parsed = JSON.parse(raw);
      setSeenAchievementKeys(Array.isArray(parsed) ? parsed : []);
    } catch {
      setSeenAchievementKeys([]);
    }
  }, [isAuthed, me?.id, unlockedAchievementKeys.join("|")]);

  const createQuest = async ({ questName, questDescription = "" }) => {
    const trimmed = String(questName || "").trim();
    if (!trimmed) return false;

    const duplicate = habits.some((h) => String(h.name || "").trim().toLowerCase() === trimmed.toLowerCase());
    if (duplicate) {
      alert(`"${trimmed}" already exists.`);
      return false;
    }

    if (!isAuthed) {
      setGuestHabitsAndPersist([guestNewHabit(trimmed), ...guestHabits]);
    } else {
      await createHabit({
        variables: {
          name: trimmed,
          description: questDescription.trim() || null,
        },
      });
    }

    return true;
  };

  const onRefresh = async () => {
    if (!isAuthed) return;
    await Promise.all([refetchHabits(), refetchDailyQuest(), refetchWeeklyBoss()]);
  };

  const onCreate = async (e) => {
    e.preventDefault();
    const created = await createQuest({ questName: name, questDescription: description });
    if (!created) return;

    setName("");
    setDescription("");
  };

  const onCheckIn = async (habitId, minutesSpent) => {
    const safeMinutes = Number(minutesSpent);
    if (
      !Number.isInteger(safeMinutes) ||
      safeMinutes < CHECKIN_MINUTES_MIN ||
      safeMinutes > CHECKIN_MINUTES_MAX
    ) {
      alert(`Enter minutes between ${CHECKIN_MINUTES_MIN} and ${CHECKIN_MINUTES_MAX} to check in.`);
      return;
    }

    if (!isAuthed) {
      const habit = guestHabits.find((h) => h.id === habitId);
      const updatedHabits = guestHabits.map((h) => (h.id === habitId ? guestApplyCheckin(h, { minutesSpent: safeMinutes }) : h));
      setGuestHabitsAndPersist(updatedHabits);

      awardForCheckin({
        currentStreak: habit?.currentStreak ?? 0,
        minutesSpent: safeMinutes,
        habits: updatedHabits.map((h) => ({
          id: h.id,
          checkedInToday: h.checkedInToday,
          currentStreak: h.currentStreak,
          totalCheckins: h.totalCheckins,
        })),
      });
      if (soundEnabled) playSoundCue("checkin");
      return;
    }

    const previousUnlocked = me?.playerProfile?.achievementsUnlocked ?? {};
    const result = await checkInToday({ variables: { habitId, minutesSpent: safeMinutes } });

    const payload = result?.data?.checkInToday;
    const awardedXp = payload?.checkin?.xpAwarded;
    const nextLevel = payload?.profile?.level ?? player.level;

    if (payload?.created && typeof awardedXp === "number") {
      if (soundEnabled) playSoundCue("checkin");
      pushReward({
        breakdown: { base: awardedXp, streakBonus: 0, minutesBonus: 0, total: awardedXp },
        leveledUp: nextLevel > player.level,
        nextLevel,
      });
      if (soundEnabled && nextLevel > player.level) playSoundCue("level_up");
    }

    if (payload?.created) {
      const meRes = await refetchMe();
      const habitsRes = await refetchHabits();
      await refetchDailyQuest();
      await refetchWeeklyBoss();

      const serverProfile = meRes?.data?.me?.playerProfile;
      const serverHabits = habitsRes?.data?.habits ?? [];

      if (serverProfile) {
        syncProgressionFromServer({
          serverPlayer: serverProfile,
          serverUnlocked: serverProfile.achievementsUnlocked ?? {},
          previousUnlocked,
          habits: serverHabits.map((h) => ({
            id: h.id,
            checkedInToday: h.checkedInToday,
            currentStreak: h.currentStreak,
            totalCheckins: h.totalCheckins,
          })),
        });
      }
    }

    await refetchMe();
  };


  const onUseFreeze = async (habitId) => {
    if (!isAuthed) return;
    const res = await consumeStreakFreeze({ variables: { habitId } });
    const payload = res?.data?.consumeStreakFreeze;
    if (!payload?.consumed && payload?.reason) {
      const reasonMap = {
        no_charges: "No freeze charges left.",
        not_at_risk: "This quest is not at risk right now.",
        already_protected: "This quest is already protected today.",
        already_checked_in: "This quest is already checked in today.",
      };
      alert(reasonMap[payload.reason] ?? "Could not consume freeze.");
    }
    await Promise.all([refetchHabits(), refetchMe(), refetchDailyQuest(), refetchWeeklyBoss()]);
  };


  const onAcknowledgeAchievements = () => {
    if (!isAuthed || !me?.id || unseenAchievementKeys.length === 0) return;
    const merged = [...new Set([...seenAchievementKeys, ...unseenAchievementKeys])];
    setSeenAchievementKeys(merged);
    localStorage.setItem(`habit-tracker:seen-achievements:${me.id}`, JSON.stringify(merged));
    pushClaimHistory("Achievements Acknowledged", `${unseenAchievementKeys.length} new`);
  };

  const onToggle = async (id, isActive) => {
    if (!isAuthed) {
      setGuestHabitsAndPersist(guestHabits.map((h) => (h.id === id ? { ...h, isActive } : h)));
      if (!isActive && filterMode === "active") {
        setFilterMode("all");
        setDeactivateHint("Quest deactivated. Switched to All so it stays visible.");
      }
      return;
    }

    await toggleHabit({ variables: { id, isActive } });
    if (!isActive && filterMode === "active") {
      setFilterMode("all");
      setDeactivateHint("Quest deactivated. Switched to All so it stays visible.");
    }
  };

  const onDelete = async (id) => {
    if (!confirm("Delete this habit? This also deletes its check-ins")) return;

    if (!isAuthed) {
      setGuestHabitsAndPersist(guestHabits.filter((h) => h.id !== id));
      return;
    }
    await deleteHabit({ variables: { id } });
  };

  const onClearGuest = () => {
    if (!confirm("Clear guest data?")) return;
    clearGuestHabits();
  };

  const onLogout = async () => {
    await fetch(`${API_BASE}/api/logout/`, {
      method: "POST",
      credentials: "include",
    });
    window.location.reload();
  };

  const onImportGuestHabits = async () => {
    if (!isAuthed) return;
    if (guestHabits.length === 0) return;

    const ok = confirm(
      `Import ${guestHabits.length} guest habit(s) into your account?\n\n` +
        `If a habit name already exists, it will be skipped.`
    );
    if (!ok) return;

    setImporting(true);

    let imported = 0;
    let skipped = 0;
    const errors = [];

    for (const h of guestHabits) {
      const habitName = (h?.name ?? "").trim();
      if (!habitName) {
        skipped += 1;
        continue;
      }

      try {
        await createHabit({ variables: { name: habitName, description: null } });
        imported += 1;
      } catch (e) {
        skipped += 1;
        errors.push({ name: habitName, message: e?.message ?? String(e) });
      }
    }

    if (imported > 0) clearGuestHabits();

    setImporting(false);

    alert(
      `Import complete.\n\nImported: ${imported}\nSkipped: ${skipped}` +
        (errors.length ? `\n\nExample error:\n- ${errors[0].name}: ${errors[0].message}` : "")
    );
  };

  // Prevent stacked overlays by showing only one dialog at a time.
  const hasChestReveal = Boolean(chestReveal);
  const hasAchievementDialog = !hasChestReveal && Boolean(lastUnlocks?.length);
  const hasLevelUpDialog = !hasChestReveal && !hasAchievementDialog && Boolean(lastReward?.leveledUp);
  const hasRewardToast = !hasChestReveal && !hasAchievementDialog && !hasLevelUpDialog && Boolean(lastReward);
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-gradient-to-b from-slate-50 via-white to-sky-50/40">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className={`ambient-orb-1 absolute -left-24 top-16 h-80 w-80 rounded-full blur-3xl ${selectedSkinUi.orb1}`} />
        <div className={`ambient-orb-2 absolute right-[-8rem] top-28 h-[24rem] w-[24rem] rounded-full blur-3xl ${selectedSkinUi.orb2}`} />
        <div className={`ambient-orb-1 absolute left-1/3 top-[30rem] h-72 w-72 rounded-full blur-3xl ${selectedSkinUi.orb3}`} />
        <div className={`absolute inset-0 bg-gradient-to-br ${selectedSkinUi.veil}`} />
        <div className="absolute inset-0 opacity-[0.26] [background-image:radial-gradient(circle_at_1px_1px,rgba(15,23,42,0.10)_1px,transparent_0)] [background-size:24px_24px]" />
        <div
          className={`absolute inset-0 bg-gradient-to-br ${selectedSkinUi.veil} transition-opacity duration-500 ease-out ${
            skinTransitionActive ? "opacity-70" : "opacity-0"
          }`}
        />
      </div>
      <Suspense fallback={null}>
        {hasRewardToast && <RewardToast reward={lastReward} onClose={clearLastReward} />}
        {hasAchievementDialog && <AchievementToast unlocks={lastUnlocks} onClose={clearLastUnlocks} />}
        {hasLevelUpDialog && <LevelUpScene reward={lastReward} onClose={clearLastReward} />}
        {hasChestReveal && <RewardChestReveal reveal={chestReveal} onClose={() => setChestReveal(null)} />}
      </Suspense>

      {/* Mobile-first: extra bottom padding keeps content clear of docked nav. */}
      <div className="relative z-10 mx-auto max-w-4xl px-3 pb-40 pt-4 sm:px-4 sm:pb-10 sm:pt-10">
        {/* Mobile-first: compact top panel reduces visual noise and keeps key stats glanceable. */}
        <div className={`mb-2 rounded-2xl border border-slate-200 bg-gradient-to-r p-3 text-white shadow-sm sm:hidden ${selectedSkinUi.heroClass}`}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="text-lg font-bold tracking-tight">Habit Arena</h1>
              <p className="mt-0.5 text-[11px] text-slate-100">Quests, streaks, and daily boss runs.</p>
            </div>
            <button
              type="button"
              onClick={() => {
                const next = !soundEnabled;
                setSoundEnabled(next);
                if (next) primeSoundCues();
              }}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white"
              title={soundEnabled ? "Disable sound cues" : "Enable sound cues"}
            >
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>
          </div>
          <div className="mt-2 flex items-center justify-between gap-2 rounded-lg bg-white/10 px-2.5 py-2 text-[11px]">
            <div className="truncate">
              {isAuthed ? (
                <span className="font-semibold">{me?.username ?? "Player"}</span>
              ) : (
                <span className="font-semibold">Guest</span>
              )}
              <span className="mx-1 text-white/70">•</span>
              <span>Lv {player.level}</span>
            </div>
            {isAuthed ? (
              <button
                onClick={onLogout}
                className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold text-white"
                type="button"
              >
                Logout
              </button>
            ) : (
              <div className="flex items-center gap-1">
                <a
                  href={`${API_BASE}/login/?next=${encodeURIComponent(`${window.location.origin}/`)}`}
                  target="_self"
                  className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold text-white"
                >
                  Login
                </a>
                <a
                  href={`${API_BASE}/register/?next=${encodeURIComponent(`${window.location.origin}/`)}`}
                  target="_self"
                  className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold text-white"
                >
                  Register
                </a>
              </div>
            )}
          </div>
          <div className="mt-2 rounded-lg bg-white/10 px-2.5 py-2 text-[11px]">
            <div className="mb-1 flex items-center justify-between font-semibold">
              <span>{titleState.current.name}</span>
              <span>{player.totalXp % 300}/300 XP</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/25">
              <div
                className="h-full bg-gradient-to-r from-amber-300 via-emerald-300 to-cyan-200"
                style={{ width: `${Math.round(((player.totalXp % 300) / 300) * 100)}%` }}
              />
            </div>
          </div>
          <div className="mt-2 grid grid-cols-3 gap-2 text-[11px]">
            <div className="rounded-lg bg-white/12 px-2 py-1.5">
              <span className="font-semibold">{questboardStats.activeCount}</span> active
            </div>
            <div className="rounded-lg bg-white/12 px-2 py-1.5">
              <span className="font-semibold">{questboardStats.pendingToday}</span> pending
            </div>
            <div className="rounded-lg bg-white/12 px-2 py-1.5 text-right">
              <span className="font-semibold">{claimableCount}</span> claims
            </div>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2 text-[11px]">
            <div className="rounded-lg bg-white/12 px-2 py-1.5">
              Daily reset {dailyResetLabel}
            </div>
            <div className="rounded-lg bg-white/12 px-2 py-1.5 text-right">
              Weekly reset {weeklyResetLabel}
            </div>
          </div>
        </div>

        <div className={`motion-fade-slide mb-5 hidden rounded-2xl border border-slate-200 bg-gradient-to-r p-4 text-white shadow-sm sm:mb-6 sm:block sm:p-6 ${selectedSkinUi.heroClass}`}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Habit Arena</h1>
              <p className="mt-1 text-xs text-slate-200 sm:text-sm">
                Turn your habits into quests, build streaks, earn XP, and unlock rare achievements.
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px] sm:gap-2 sm:text-xs">
                <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1">
                  <Flame className="h-3.5 w-3.5" />
                  Streak-driven progress
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1">
                  <Sparkles className="h-3.5 w-3.5" />
                  XP + rarity system
                </span>
                <span className="hidden items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 sm:inline-flex">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Title: {titleState.current.name}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const next = !soundEnabled;
                    setSoundEnabled(next);
                    if (next) primeSoundCues();
                  }}
                  className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 font-semibold text-white hover:bg-white/15"
                  title={soundEnabled ? "Disable sound cues" : "Enable sound cues"}
                >
                  {soundEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
                  <span className="hidden sm:inline">Sound {soundEnabled ? "On" : "Off"}</span>
                </button>
                <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1">
                  <Compass className="h-3.5 w-3.5" />
                  Daily reset {dailyResetLabel}
                </span>
                <span className="hidden items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 sm:inline-flex">
                  <Swords className="h-3.5 w-3.5" />
                  Weekly reset {weeklyResetLabel}
                </span>
              </div>
            </div>
            <div className="hidden items-center gap-3 md:flex">
              <XpOrb level={player.level} totalXp={player.totalXp} reward={lastReward} />
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
                <Swords className="h-6 w-6 text-amber-300" />
              </div>
            </div>
          </div>
        </div>

        <div className="hidden sm:mb-6 sm:flex sm:flex-row sm:items-center sm:justify-between">
          <div className="hidden sm:block">
            <AuthBar isAuthed={isAuthed} me={me} onLogout={onLogout} />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {isAuthed && guestHabits.length > 0 && (
              <button
                onClick={onImportGuestHabits}
                disabled={importing}
                className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-sm active:translate-y-0 disabled:opacity-60"
                type="button"
                title="Import locally saved habits into your account"
              >
                {importing ? "Importing..." : `Import guest habits (${guestHabits.length})`}
              </button>
            )}

            {!isAuthed && guestHabits.length > 0 && (
              <button
                onClick={onClearGuest}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-sm active:translate-y-0"
                type="button"
              >
                Clear guest data
              </button>
            )}
          </div>
        </div>

        {((isAuthed && guestHabits.length > 0) || (!isAuthed && guestHabits.length > 0)) && (
          <div className="mb-2 flex sm:hidden">
            <div className="flex flex-wrap items-center gap-2">
              {isAuthed && guestHabits.length > 0 && (
                <button
                  onClick={onImportGuestHabits}
                  disabled={importing}
                  className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition-all duration-200 ease-out disabled:opacity-60"
                  type="button"
                  title="Import locally saved habits into your account"
                >
                  {importing ? "Importing..." : `Import guest habits (${guestHabits.length})`}
                </button>
              )}
              {!isAuthed && guestHabits.length > 0 && (
                <button
                  onClick={onClearGuest}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 transition-all duration-200 ease-out"
                  type="button"
                >
                  Clear guest data
                </button>
              )}
            </div>
          </div>
        )}

        <div className="mb-2 flex flex-col gap-3 sm:mb-3 sm:flex-row sm:items-center sm:justify-between">
          <MiniMapNav
            activeView={view}
            claimPanelOpen={claimCenterOpen}
            claimableCount={claimableCount}
            activeClassName={selectedSkinUi.navActiveClass}
            mobileDocked
            onSelect={(key) => {
              if (key === "claims") {
                setClaimCenterOpen((v) => !v);
                return;
              }
              setView(key);
              setClaimCenterOpen(false);
            }}
          />
          {view === "quests" && !isMobileView && (
            <div className="flex items-center gap-2">
              <span className="hidden rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600 sm:inline-flex">
                Daily reset in {dailyResetLabel}
              </span>
              <button
                onClick={onRefresh}
                disabled={!isAuthed}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-800 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-sm active:translate-y-0 disabled:opacity-60"
                title={!isAuthed ? "Login to load server habits" : "Refresh habits"}
                type="button"
              >
                Refresh
              </button>
            </div>
          )}
        </div>

        {isAuthed && claimCenterOpen && (
          <div className="mb-4">
            <ClaimCenter
              claimableCount={claimableCount}
              isOpen={claimCenterOpen}
              onToggle={() => setClaimCenterOpen(false)}
              showTrigger={false}
              panelClassName={selectedSkinUi.claimPanelClass}
              dailyClaimable={Boolean(dailyQuestChain?.rewardClaimable)}
              dailyRewardXp={dailyQuestChain?.rewardXp ?? 0}
              dailyClaimStatusText={dailyClaimStatusText}
              onClaimDaily={onClaimDailyReward}
              claimingDaily={claimingDailyReward}
              recoveryClaimable={Boolean(recoveryQuest?.claimable)}
              recoveryRewardXp={recoveryQuest?.rewardXp ?? 0}
              onClaimRecovery={onClaimRecovery}
              claimingRecovery={claimingRecovery}
              dailyResetLabel={dailyResetLabel}
              weeklyResetLabel={weeklyResetLabel}
              newAchievementsCount={unseenAchievementKeys.length}
              onAcknowledgeAchievements={onAcknowledgeAchievements}
              history={claimHistory}
            />
          </div>
        )}

        {view === "profile" && isMobileView && (
          <MobileProfileScreen
            habits={habits}
            player={player}
            playerProfile={me?.playerProfile ?? null}
            titleState={titleState}
            skinKey={selectedSkinKey}
            skinName={selectedSkin.name}
            dailyQuestChain={dailyQuestChain}
            weeklyBossEncounter={weeklyBossEncounter}
            recoveryQuest={recoveryQuest}
            freezeCharges={freezeCharges}
            recentActivity={recentActivity}
            recentActivityLoading={recentActivityLoading}
            recentActivityHasMore={recentActivityHasMore}
            onLoadMoreActivity={() => setActivityLimit((n) => Math.min(n + 10, 100))}
            onCollapseActivity={activityLimit > 5 ? () => setActivityLimit(5) : undefined}
            unlockedSkinKeys={unlockedSkinKeys}
            selectedSkinKey={selectedSkinKey}
            onSelectSkin={setSelectedSkinKey}
            dailyResetLabel={dailyResetLabel}
            weeklyResetLabel={weeklyResetLabel}
          />
        )}

        {view === "profile" && !isMobileView && (
          <ProfileScreen
            habits={habits}
            player={player}
            playerProfile={me?.playerProfile ?? null}
            titleState={titleState}
            skinKey={selectedSkinKey}
            skinName={selectedSkin.name}
            dailyQuestChain={dailyQuestChain}
            weeklyBossEncounter={weeklyBossEncounter}
            recoveryQuest={recoveryQuest}
            freezeCharges={freezeCharges}
            recentActivity={recentActivity}
            recentActivityLoading={recentActivityLoading}
            recentActivityHasMore={recentActivityHasMore}
            onLoadMoreActivity={() => setActivityLimit((n) => Math.min(n + 10, 100))}
            onCollapseActivity={activityLimit > 5 ? () => setActivityLimit(5) : undefined}
            unlockedSkinKeys={unlockedSkinKeys}
            selectedSkinKey={selectedSkinKey}
            onSelectSkin={setSelectedSkinKey}
            dailyResetLabel={dailyResetLabel}
            weeklyResetLabel={weeklyResetLabel}
          />
        )}

        {view === "quests" && isMobileView && (
          <MobileQuestScreen
            isAuthed={isAuthed}
            loading={loading}
            error={error}
            questPanel={questPanel}
            setQuestPanel={setQuestPanel}
            selectedSkinUi={selectedSkinUi}
            selectedSkin={selectedSkin}
            titleState={titleState}
            player={player}
            habits={habits}
            displayedHabits={displayedHabits}
            questboardStats={questboardStats}
            atRiskHabits={atRiskHabits}
            freezeCharges={freezeCharges}
            recoveryQuest={recoveryQuest}
            dailyQuestData={dailyQuestData}
            dailyQuestLoading={dailyQuestLoading}
            claimingDailyReward={claimingDailyReward}
            onClaimDailyReward={onClaimDailyReward}
            weeklyBossEncounter={weeklyBossEncounter}
            weeklyBossLoading={weeklyBossLoading}
            claimingWeeklyBoss={claimingWeeklyBoss}
            onClaimWeeklyBossReward={onClaimWeeklyBossReward}
            weeklyClaimFeedback={weeklyClaimFeedback}
            claimingRecovery={claimingRecovery}
            onClaimRecovery={onClaimRecovery}
            onUseFreeze={onUseFreeze}
            consumingFreeze={consumingFreeze}
            name={name}
            setName={setName}
            description={description}
            setDescription={setDescription}
            onCreate={onCreate}
            creating={creating}
            starterQuests={STARTER_QUESTS}
            filterMode={filterMode}
            setFilterMode={setFilterMode}
            sortMode={sortMode}
            setSortMode={setSortMode}
            deactivateHint={deactivateHint}
            setDeactivateHint={setDeactivateHint}
            onCheckIn={onCheckIn}
            onToggle={onToggle}
            onDelete={onDelete}
            checkingIn={checkingIn}
            toggling={toggling}
            deleting={deleting}
            dailyResetLabel={dailyResetLabel}
            weeklyResetLabel={weeklyResetLabel}
            onRefresh={onRefresh}
          />
        )}

        {view === "quests" && !isMobileView && (
          <StreakComboMeter habits={habits} />
        )}

        {view === "quests" && !isMobileView && (
          <>
            {/* Mobile-first: sticky segmented rail behaves like native section switcher. */}
            <div className="sticky top-2 z-20 -mx-1 mb-3 rounded-2xl border border-slate-200 bg-white/95 px-1 pt-1.5 shadow-sm backdrop-blur sm:hidden">
              <QuestPanelTabs
                active={questPanel}
                onChange={setQuestPanel}
                className="mb-0"
                activeClassName={selectedSkinUi.tabActiveClass}
                badges={{
                  weekly: weeklyBossEncounter?.rewardClaimable ? 1 : null,
                  safety: atRiskHabits.length > 0 ? atRiskHabits.length : null,
                  quests: displayedHabits.filter((h) => h.isActive && !h.checkedInToday).length || null,
                }}
              />
            </div>
            <div className="hidden sm:block">
              <QuestPanelTabs
                active={questPanel}
                onChange={setQuestPanel}
                activeClassName={selectedSkinUi.tabActiveClass}
                badges={{
                  weekly: weeklyBossEncounter?.rewardClaimable ? 1 : null,
                  safety: atRiskHabits.length > 0 ? atRiskHabits.length : null,
                  quests: displayedHabits.filter((h) => h.isActive && !h.checkedInToday).length || null,
                }}
              />
            </div>
          </>
        )}
        {view === "quests" && !isMobileView && (
          <div className="mb-4 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
            <span>My Quests is your habit list. Create habits, check in daily, and keep your chain alive.</span>
            <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-600">
              Next daily reset: {dailyResetLabel}
            </span>
            <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-600">
              Next weekly reset: {weeklyResetLabel}
            </span>
          </div>
        )}
        {view === "quests" && !isMobileView && (
          <div className="motion-fade-slide mb-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <div className={`rounded-xl border px-3 py-2 ${questDashboardUi.statBase}`}>
              <div className={`text-[11px] font-semibold uppercase tracking-wide ${questDashboardUi.activeLabel}`}>Active quests</div>
              <div className={`mt-1 text-base font-bold ${questDashboardUi.activeValue}`}>{questboardStats.activeCount}</div>
            </div>
            <div className={`rounded-xl border px-3 py-2 ${questDashboardUi.statChecked}`}>
              <div className={`text-[11px] font-semibold uppercase tracking-wide ${questDashboardUi.checkedLabel}`}>Checked today</div>
              <div className={`mt-1 text-base font-bold ${questDashboardUi.checkedValue}`}>{questboardStats.checkedToday}</div>
            </div>
            <div className={`rounded-xl border px-3 py-2 ${questDashboardUi.statPending}`}>
              <div className={`text-[11px] font-semibold uppercase tracking-wide ${questDashboardUi.pendingLabel}`}>Pending today</div>
              <div className={`mt-1 text-base font-bold ${questDashboardUi.pendingValue}`}>{questboardStats.pendingToday}</div>
            </div>
            <div className={`rounded-xl border px-3 py-2 ${questDashboardUi.statPower}`}>
              <div className={`text-[11px] font-semibold uppercase tracking-wide ${questDashboardUi.powerLabel}`}>Streak power</div>
              <div className={`mt-1 text-base font-bold ${questDashboardUi.powerValue}`}>{questboardStats.streakPower}</div>
            </div>
          </div>
        )}
        {view === "quests" && !isMobileView && (
          <div className={`motion-fade-slide mb-4 rounded-2xl border px-4 py-3 shadow-sm ${questDashboardUi.winPanel}`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className={`text-xs font-semibold uppercase tracking-wide ${questDashboardUi.winLabel}`}>Today win condition</div>
                <div className="mt-1 text-sm font-semibold text-slate-900">
                  Clear {questboardStats.pendingToday} pending quest{questboardStats.pendingToday === 1 ? "" : "s"} and chip away at the daily boss.
                </div>
                <div className="mt-1 text-xs text-slate-600">
                  Daily boss HP remaining: {Math.max(0, 100 - Number(dailyQuestChain?.completionPct || 0))}%.
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setQuestPanel("today")}
                  className={`rounded-lg border bg-white px-2.5 py-1.5 text-xs font-semibold transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-sm ${questDashboardUi.winPrimaryBtn}`}
                >
                  Open Daily Boss
                </button>
                <button
                  type="button"
                  onClick={() => setQuestPanel("create")}
                  className={`rounded-lg border bg-white px-2.5 py-1.5 text-xs font-semibold transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-sm ${questDashboardUi.winSecondaryBtn}`}
                >
                  Create Quest
                </button>
              </div>
            </div>
          </div>
        )}

        {view === "quests" && !isMobileView && isAuthed && loading && (
          <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600">Loading...</div>
        )}

        {view === "quests" && !isMobileView && isAuthed && error && (
          <pre className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{error.message}</pre>
        )}

        {view === "quests" && !isMobileView && questPanel === "today" && (
          <DailyQuestChain
            habits={habits}
            level={player.level}
            titleState={titleState}
            isAuthed={isAuthed}
            serverChain={dailyQuestData?.dailyQuestChain ?? null}
            loading={dailyQuestLoading}
            claiming={claimingDailyReward}
            onClaimReward={onClaimDailyReward}
            panelSkinClass={selectedSkin.bossPanelClass}
            skinHud={selectedSkin.bossHud}
          />
        )}

        {view === "quests" && !isMobileView && questPanel === "weekly" && isAuthed && (
          <WeeklyBossEncounter
            encounter={weeklyBossEncounter}
            habits={habits}
            loading={weeklyBossLoading}
            claiming={claimingWeeklyBoss}
            onClaimReward={onClaimWeeklyBossReward}
            onOpenSafety={() => setQuestPanel("safety")}
            onOpenCreate={() => setQuestPanel("create")}
            panelSkinClass={selectedSkin.bossPanelClass}
            skinHud={selectedSkin.bossHud}
            feedback={weeklyClaimFeedback}
          />
        )}

        {view === "quests" && !isMobileView && questPanel === "safety" && isAuthed && (
          <div className="mb-4 grid gap-3 md:grid-cols-2">
            <div className="motion-fade-slide rounded-2xl border border-sky-200 bg-gradient-to-r from-sky-50 to-cyan-50 p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-sky-700">Streak Safety</div>
                  <div className="mt-1 text-sm font-semibold text-slate-900">
                    {atRiskHabits.length > 0
                      ? `${atRiskHabits.length} habit${atRiskHabits.length > 1 ? "s are" : " is"} at risk today`
                      : "No habits at risk right now"}
                  </div>
                  <div className="mt-1 text-xs text-slate-600">Use freeze charges to protect streaks when you cannot check in.</div>
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-700">
                  <Snowflake className="h-3.5 w-3.5 text-sky-700" />
                  {freezeCharges} charge{freezeCharges === 1 ? "" : "s"}
                </div>
              </div>
              {atRiskHabits.length > 0 && freezeCharges > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {atRiskHabits.slice(0, 3).map((h) => (
                    <button
                      key={`freeze-${h.id}`}
                      type="button"
                      onClick={() => onUseFreeze(h.id)}
                      disabled={consumingFreeze}
                      className="rounded-lg border border-sky-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-sky-700 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-sky-50 hover:shadow-sm active:translate-y-0 disabled:opacity-60"
                    >
                      Protect {h.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="motion-fade-slide rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-4 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-wide text-amber-700">Recovery Quest</div>
              {!recoveryQuest?.active ? (
                <div className="mt-1 text-sm text-slate-700">Keep your momentum. A comeback quest appears after a missed streak day.</div>
              ) : (
                <>
                  <div className="mt-1 text-sm font-semibold text-slate-900">
                    {recoveryQuest.progressDays}/{recoveryQuest.targetDays} comeback days logged
                  </div>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/70">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300 ease-out"
                      style={{
                        width: `${Math.min(100, Math.round((recoveryQuest.progressDays / Math.max(recoveryQuest.targetDays, 1)) * 100))}%`,
                      }}
                    />
                  </div>
                  <div className="mt-2 text-xs text-slate-700">Reward: +{recoveryQuest.rewardXp} XP and +1 freeze charge</div>
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={onClaimRecovery}
                      disabled={!recoveryQuest.claimable || claimingRecovery}
                      className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-all duration-200 ease-out ${
                        recoveryQuest.claimed
                          ? "bg-emerald-100 text-emerald-700"
                          : recoveryQuest.claimable
                          ? "bg-gradient-to-r from-slate-900 to-slate-700 text-white hover:-translate-y-0.5 hover:shadow-sm"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {recoveryQuest.claimed
                        ? "Recovery claimed"
                        : claimingRecovery
                        ? "Claiming..."
                        : recoveryQuest.claimable
                        ? `Claim +${recoveryQuest.rewardXp} XP`
                        : "Complete 2 comeback days"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {view === "quests" && !isMobileView && questPanel === "create" && (
          <div className="motion-fade-slide mb-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">Create New Habit</h2>
            <p className="mt-1 text-xs text-slate-500">Every habit is treated as a quest in your arena.</p>

            <form onSubmit={onCreate} className="mt-4 grid gap-3">
              <input
                placeholder="Habit name (unique)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition-colors duration-200 focus:border-sky-400"
              />
              <input
                placeholder="Description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition-colors duration-200 focus:border-sky-400"
              />
              <button
                type="submit"
                disabled={creating}
                className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-sm active:translate-y-0 disabled:opacity-60"
              >
                {creating ? "Creating..." : "Create"}
              </button>
            </form>

            <div className="mt-4">
              <div className="mb-2 inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                <Compass className="h-3.5 w-3.5" />
                Starter Habit Ideas
              </div>
              <div className="flex flex-wrap gap-2">
                {STARTER_QUESTS.map((q) => (
                  <button
                    key={q.name}
                    type="button"
                    onClick={() => {
                      setName(q.name);
                      setDescription(q.description);
                    }}
                    className="rounded-lg border border-slate-300 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-slate-100 hover:shadow-sm active:translate-y-0"
                  >
                    {q.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {view === "quests" && !isMobileView && questPanel === "quests" && (
          <>
            <div className="motion-fade-slide mb-4 rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50 via-white to-cyan-50 p-4 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2.5 py-1 text-[11px] font-semibold text-indigo-700">
                    Habit Questboard
                  </div>
                  <div className="mt-1 text-sm font-semibold text-slate-900">
                    Train real habits through your quest log.
                  </div>
                  <div className="mt-1 text-xs text-slate-600">
                    Every quest card is a habit. Check-ins, streaks, and safety all apply here.
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
                  <div className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-slate-700">
                    <span className="font-semibold text-slate-900">{questboardStats.activeCount}</span> active
                  </div>
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-emerald-700">
                    <span className="font-semibold">{questboardStats.checkedToday}</span> done today
                  </div>
                  <div className="rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-amber-700">
                    <span className="font-semibold">{questboardStats.pendingToday}</span> pending
                  </div>
                  <div className="rounded-lg border border-fuchsia-200 bg-fuchsia-50 px-2.5 py-1.5 text-fuchsia-700">
                    <span className="font-semibold">{questboardStats.streakPower}</span> streak power
                  </div>
                  <div className="rounded-lg border border-sky-200 bg-sky-50 px-2.5 py-1.5 text-sky-700">
                    <span className="font-semibold">{freezeCharges}</span> freeze charges
                  </div>
                  <div className="rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-rose-700">
                    <span className="font-semibold">{questboardStats.atRiskCount}</span> at risk
                  </div>
                </div>
              </div>
            </div>

          <div className="motion-fade-slide mb-4 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            {/* Mobile-first: controls stack full-width for easier taps. */}
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                <div className="flex w-full items-center gap-2 sm:w-auto">
                  <span className="text-xs font-semibold text-slate-500">Filter</span>
                  <select
                    value={filterMode}
                    onChange={(e) => setFilterMode(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm text-slate-700 outline-none sm:w-auto sm:py-1.5"
                  >
                    <option value="active">Active</option>
                    <option value="all">All</option>
                    <option value="pending">Pending Today</option>
                  </select>
                </div>
                <div className="flex w-full items-center gap-2 sm:w-auto">
                  <span className="text-xs font-semibold text-slate-500">Sort</span>
                  <select
                    value={sortMode}
                    onChange={(e) => setSortMode(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm text-slate-700 outline-none sm:w-auto sm:py-1.5"
                  >
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
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    Your habit log is empty
                  </div>
                  <p className="mt-1 text-slate-500">Create your first habit or tap a starter template in the Create tab.</p>
                </div>
              )}

              {habits.length > 0 && displayedHabits.length === 0 && (
                <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600">No habits match the current filter.</div>
              )}
            </div>

            {!isAuthed && (
              <p className="mt-8 text-xs text-slate-500">Tip: Guest habits are stored locally. Login/Register to save habits to your account.</p>
            )}
          </>
        )}

        {view === "quests" && !isMobileView && questPanel === "safety" && !isAuthed && (
          <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600">
            Login to use streak freezes and recovery missions.
          </div>
        )}

        <div className="mt-2 text-xs text-slate-400">{checkingIn || toggling || deleting ? "Working…" : ""}</div>
      </div>
    </div>
  );
}
