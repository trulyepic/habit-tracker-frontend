import { useMutation, useQuery } from "@apollo/client/react";
import { useEffect, useMemo, useState } from "react";
import { Compass, Flame, ShieldCheck, Snowflake, Sparkles, Swords, Volume2, VolumeX } from "lucide-react";

import AuthBar from "./components/AuthBar";
import HabitCard from "./components/HabitCard";

import { useAuth } from "./hooks/useAuth";
import { useGuestHabits } from "./hooks/useGuestHabits";

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
import RewardToast from "./components/RewardToast";
import AchievementToast from "./components/AchievementToast";
import MiniMapNav from "./components/MiniMapNav";
import QuestPanelTabs from "./components/QuestPanelTabs";
import ProfileScreen from "./components/ProfileScreen";
import DailyQuestChain from "./components/DailyQuestChain";
import WeeklyBossEncounter from "./components/WeeklyBossEncounter";
import ClaimCenter from "./components/ClaimCenter";
import XpOrb from "./components/XpOrb";
import LevelUpScene from "./components/LevelUpScene";
import StreakComboMeter from "./components/StreakComboMeter";
import RewardChestReveal from "./components/RewardChestReveal";
import { coerceUnlockedMap } from "./gamification/achievements";
import { resolveTitleState, resolveTitleStateFromServerProfile } from "./gamification/titles";
import { getUnlockedSkins, resolveSkin } from "./gamification/skins";

const STARTER_QUESTS = [
  { name: "Morning Mobility", description: "10 minutes of stretching right after waking up." },
  { name: "Focus Sprint", description: "One 25-minute deep work sprint before noon." },
  { name: "Evening Wind-down", description: "No phone for 30 minutes before bed." },
];

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
  const [questPanel, setQuestPanel] = useState("today");
  const [filterMode, setFilterMode] = useState("active");
  const [sortMode, setSortMode] = useState("next-up");
  const [claimCenterOpen, setClaimCenterOpen] = useState(false);
  const [claimHistory, setClaimHistory] = useState([]);
  const [dailyClaimFeedback, setDailyClaimFeedback] = useState("");
  const [weeklyClaimFeedback, setWeeklyClaimFeedback] = useState("");
  const [chestReveal, setChestReveal] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem("habit-tracker:sound-enabled") !== "false";
  });
  const [selectedSkinKey, setSelectedSkinKey] = useState("classic");
  const [seenAchievementKeys, setSeenAchievementKeys] = useState([]);
  const [deactivateHint, setDeactivateHint] = useState("");

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
  const skinStorageKey = `habit-tracker:skin:${isAuthed && me?.id ? me.id : "guest"}`;
  const claimableCount =
    Number(Boolean(dailyQuestChain?.rewardClaimable)) +
    Number(Boolean(weeklyBossEncounter?.rewardClaimable)) +
    Number(Boolean(recoveryQuest?.claimable)) +
    unseenAchievementKeys.length;

  const atRiskHabits = useMemo(
    () => habits.filter((h) => h.isActive && !h.checkedInToday && (h.currentStreak ?? 0) > 0),
    [habits]
  );

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

  const formatClaimedAt = (raw) => {
    if (!raw) return null;
    const parsed = new Date(raw);
    if (Number.isNaN(parsed.getTime())) return null;
    return parsed.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  };

  const dailyClaimStatusText = useMemo(() => {
    if (!dailyQuestChain) return dailyClaimFeedback || "";
    if (dailyClaimFeedback) return dailyClaimFeedback;
    if (dailyQuestChain.rewardClaimed) {
      const claimedAtLabel = formatClaimedAt(dailyQuestChain.rewardClaimedAt);
      return claimedAtLabel
        ? `Already claimed today at ${claimedAtLabel}.`
        : "Already claimed today.";
    }
    if (dailyQuestChain.rewardClaimable) {
      return `Ready to claim +${dailyQuestChain.rewardXp} XP.`;
    }
    return "Complete all daily objectives to unlock this reward.";
  }, [
    dailyQuestChain?.rewardClaimed,
    dailyQuestChain?.rewardClaimable,
    dailyQuestChain?.rewardClaimedAt,
    dailyQuestChain?.rewardXp,
    dailyClaimFeedback,
  ]);

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
    localStorage.setItem("habit-tracker:sound-enabled", soundEnabled ? "true" : "false");
  }, [soundEnabled]);

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

  const pushClaimHistory = (label, value) => {
    setClaimHistory((prev) => [{ id: `${Date.now()}-${Math.random()}`, label, value }, ...prev].slice(0, 8));
  };

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
    if (!isAuthed) {
      const habit = guestHabits.find((h) => h.id === habitId);
      const updatedHabits = guestHabits.map((h) => (h.id === habitId ? guestApplyCheckin(h, { minutesSpent }) : h));
      setGuestHabitsAndPersist(updatedHabits);

      awardForCheckin({
        currentStreak: habit?.currentStreak ?? 0,
        minutesSpent: minutesSpent ?? null,
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
    const result = await checkInToday({ variables: { habitId, minutesSpent: minutesSpent ?? null } });

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

  const onClaimDailyReward = async () => {
    if (!isAuthed) return;

    const res = await claimDailyQuestReward();
    const payload = res?.data?.claimDailyQuestReward;
    if (!payload) return;

    if (payload.claimed && payload.awardedXp > 0) {
      if (soundEnabled) playSoundCue("claim");
      pushClaimHistory("Daily Quest Reward", `+${payload.awardedXp} XP`);
      pushReward({
        breakdown: { base: payload.awardedXp, streakBonus: 0, minutesBonus: 0, total: payload.awardedXp },
        leveledUp: (payload.profile?.level ?? player.level) > player.level,
        nextLevel: payload.profile?.level ?? player.level,
      });
      if (soundEnabled && (payload.profile?.level ?? player.level) > player.level) {
        playSoundCue("level_up");
      }
      await refetchMe();
      setDailyClaimFeedback("Daily reward claimed.");
      setChestReveal({
        title: "Daily Quest Chest",
        subtitle: "Boss reward secured.",
        xp: payload.awardedXp,
        bonusText: "Your chain reward has been added to progression.",
      });
    } else if (payload.claimReason === "already_claimed") {
      const claimedAtLabel = formatClaimedAt(payload.chain?.rewardClaimedAt);
      setDailyClaimFeedback(
        claimedAtLabel ? `Already claimed today at ${claimedAtLabel}.` : "Already claimed today."
      );
    } else if (payload.claimReason === "incomplete") {
      setDailyClaimFeedback("Daily chain incomplete. Finish all objectives first.");
    }

    await refetchDailyQuest();
  };

  const onClaimWeeklyBossReward = async () => {
    if (!isAuthed) return;

    const res = await claimWeeklyBossReward();
    const payload = res?.data?.claimWeeklyBossReward;
    if (!payload) return;

    if (payload.claimed && payload.awardedXp > 0) {
      if (soundEnabled) playSoundCue("claim");
      pushClaimHistory("Weekly Boss Reward", `+${payload.awardedXp} XP`);
      pushReward({
        breakdown: { base: payload.awardedXp, streakBonus: 0, minutesBonus: 0, total: payload.awardedXp },
        leveledUp: (payload.profile?.level ?? player.level) > player.level,
        nextLevel: payload.profile?.level ?? player.level,
      });
      if (soundEnabled && (payload.profile?.level ?? player.level) > player.level) {
        playSoundCue("level_up");
      }
      await refetchMe();
      setWeeklyClaimFeedback("Weekly boss reward claimed.");
      setChestReveal({
        title: "Weekly Raid Chest",
        subtitle: "Raid victory secured.",
        xp: payload.awardedXp,
        bonusText: "A tougher encounter, a bigger payout.",
      });
    } else if (payload.claimReason === "already_claimed") {
      setWeeklyClaimFeedback("Weekly reward already claimed.");
    } else if (payload.claimReason === "incomplete") {
      setWeeklyClaimFeedback("Weekly raid incomplete. Break every mechanic first.");
    }

    await refetchWeeklyBoss();
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

  const onClaimRecovery = async () => {
    if (!isAuthed) return;
    const res = await claimRecoveryQuestReward();
    const payload = res?.data?.claimRecoveryQuestReward;
    if (payload?.claimed && payload.awardedXp > 0) {
      if (soundEnabled) playSoundCue("claim");
      pushClaimHistory("Recovery Reward", `+${payload.awardedXp} XP`);
      pushReward({
        breakdown: { base: payload.awardedXp, streakBonus: 0, minutesBonus: 0, total: payload.awardedXp },
        leveledUp: (payload.profile?.level ?? player.level) > player.level,
        nextLevel: payload.profile?.level ?? player.level,
      });
      if (soundEnabled && (payload.profile?.level ?? player.level) > player.level) {
        playSoundCue("level_up");
      }
      setChestReveal({
        title: "Recovery Chest",
        subtitle: "Comeback mission complete.",
        xp: payload.awardedXp,
        bonusText: "+1 freeze charge also awarded.",
      });
    }
    await Promise.all([refetchMe(), refetchHabits(), refetchDailyQuest(), refetchWeeklyBoss()]);
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

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-50 via-white to-sky-50/40">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="ambient-orb-1 absolute -left-24 top-16 h-80 w-80 rounded-full bg-cyan-300/40 blur-3xl" />
        <div className="ambient-orb-2 absolute right-[-8rem] top-28 h-[24rem] w-[24rem] rounded-full bg-fuchsia-300/35 blur-3xl" />
        <div className="ambient-orb-1 absolute left-1/3 top-[30rem] h-72 w-72 rounded-full bg-amber-300/28 blur-3xl" />
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-100/18 via-transparent to-fuchsia-100/20" />
        <div className="absolute inset-0 opacity-[0.26] [background-image:radial-gradient(circle_at_1px_1px,rgba(15,23,42,0.10)_1px,transparent_0)] [background-size:24px_24px]" />
      </div>
      <RewardToast reward={lastReward} onClose={clearLastReward} />
      <AchievementToast unlocks={lastUnlocks} onClose={clearLastUnlocks} />
      <LevelUpScene reward={lastReward} onClose={clearLastReward} />
      <RewardChestReveal reveal={chestReveal} onClose={() => setChestReveal(null)} />

      <div className="relative z-10 mx-auto max-w-4xl px-4 py-10">
        <div className="motion-fade-slide mb-6 rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Quest Habit Arena</h1>
              <p className="mt-1 text-sm text-slate-200">Build streaks, earn XP, and unlock rare achievements every day.</p>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1">
                  <Flame className="h-3.5 w-3.5" />
                  Streak-driven progress
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1">
                  <Sparkles className="h-3.5 w-3.5" />
                  XP + rarity system
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1">
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
                  Sound {soundEnabled ? "On" : "Off"}
                </button>
              </div>
            </div>
            <div className="hidden items-center gap-3 sm:flex">
              <XpOrb level={player.level} totalXp={player.totalXp} reward={lastReward} />
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
                <Swords className="h-6 w-6 text-amber-300" />
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <AuthBar isAuthed={isAuthed} me={me} onLogout={onLogout} />

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

        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <MiniMapNav
            activeView={view}
            claimPanelOpen={claimCenterOpen}
            claimableCount={claimableCount}
            onSelect={(key) => {
              if (key === "claims") {
                setClaimCenterOpen((v) => !v);
                return;
              }
              setView(key);
              setClaimCenterOpen(false);
            }}
          />
          {view === "quests" && (
            <div className="flex items-center gap-2">
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
              dailyClaimable={Boolean(dailyQuestChain?.rewardClaimable)}
              dailyRewardXp={dailyQuestChain?.rewardXp ?? 0}
              dailyClaimStatusText={dailyClaimStatusText}
              onClaimDaily={onClaimDailyReward}
              claimingDaily={claimingDailyReward}
              recoveryClaimable={Boolean(recoveryQuest?.claimable)}
              recoveryRewardXp={recoveryQuest?.rewardXp ?? 0}
              onClaimRecovery={onClaimRecovery}
              claimingRecovery={claimingRecovery}
              newAchievementsCount={unseenAchievementKeys.length}
              onAcknowledgeAchievements={onAcknowledgeAchievements}
              history={claimHistory}
            />
          </div>
        )}

        {view === "profile" && (
          <ProfileScreen
            habits={habits}
            player={player}
            playerProfile={me?.playerProfile ?? null}
            titleState={titleState}
            recentActivity={recentActivity}
            recentActivityLoading={recentActivityLoading}
            recentActivityHasMore={recentActivityHasMore}
            onLoadMoreActivity={() => setActivityLimit((n) => Math.min(n + 10, 100))}
            onCollapseActivity={activityLimit > 5 ? () => setActivityLimit(5) : undefined}
            unlockedSkinKeys={unlockedSkinKeys}
            selectedSkinKey={selectedSkinKey}
            onSelectSkin={setSelectedSkinKey}
          />
        )}

        {view === "quests" && (
          <StreakComboMeter habits={habits} />
        )}

        {view === "quests" && (
          <QuestPanelTabs
            active={questPanel}
            onChange={setQuestPanel}
            badges={{
              weekly: weeklyBossEncounter?.rewardClaimable ? 1 : null,
              safety: atRiskHabits.length > 0 ? atRiskHabits.length : null,
              quests: displayedHabits.filter((h) => h.isActive && !h.checkedInToday).length || null,
            }}
          />
        )}

        {view === "quests" && isAuthed && loading && (
          <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600">Loading...</div>
        )}

        {view === "quests" && isAuthed && error && (
          <pre className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{error.message}</pre>
        )}

        {view === "quests" && questPanel === "today" && (
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
          />
        )}

        {view === "quests" && questPanel === "weekly" && isAuthed && (
          <WeeklyBossEncounter
            encounter={weeklyBossEncounter}
            habits={habits}
            loading={weeklyBossLoading}
            claiming={claimingWeeklyBoss}
            onClaimReward={onClaimWeeklyBossReward}
            onOpenSafety={() => setQuestPanel("safety")}
            onOpenCreate={() => setQuestPanel("create")}
            panelSkinClass={selectedSkin.bossPanelClass}
            feedback={weeklyClaimFeedback}
          />
        )}

        {view === "quests" && questPanel === "safety" && isAuthed && (
          <div className="mb-4 grid gap-3 md:grid-cols-2">
            <div className="motion-fade-slide rounded-2xl border border-sky-200 bg-gradient-to-r from-sky-50 to-cyan-50 p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-sky-700">Streak Safety</div>
                  <div className="mt-1 text-sm font-semibold text-slate-900">
                    {atRiskHabits.length > 0
                      ? `${atRiskHabits.length} quest${atRiskHabits.length > 1 ? "s are" : " is"} at risk today`
                      : "No quests at risk right now"}
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

        {view === "quests" && questPanel === "create" && (
          <div className="motion-fade-slide mb-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">Create New Quest</h2>
            <p className="mt-1 text-xs text-slate-500">Add one focused habit and keep the chain alive.</p>

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
                Starter Quest Ideas
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

        {view === "quests" && questPanel === "quests" && (
          <>
            <div className="motion-fade-slide mb-4 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500">Filter</span>
                  <select
                    value={filterMode}
                    onChange={(e) => setFilterMode(e.target.value)}
                    className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-700 outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="all">All</option>
                    <option value="pending">Pending Today</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500">Sort</span>
                  <select
                    value={sortMode}
                    onChange={(e) => setSortMode(e.target.value)}
                    className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-700 outline-none"
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
                    Your quest log is empty
                  </div>
                  <p className="mt-1 text-slate-500">Create your first quest or tap a starter template in the Create tab.</p>
                </div>
              )}

              {habits.length > 0 && displayedHabits.length === 0 && (
                <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600">No quests match the current filter.</div>
              )}
            </div>

            {!isAuthed && (
              <p className="mt-8 text-xs text-slate-500">Tip: Guest habits are stored locally. Login/Register to save habits to your account.</p>
            )}
          </>
        )}

        {view === "quests" && questPanel === "safety" && !isAuthed && (
          <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600">
            Login to use streak freezes and recovery quests.
          </div>
        )}

        <div className="mt-2 text-xs text-slate-400">{checkingIn || toggling || deleting ? "Working…" : ""}</div>
      </div>
    </div>
  );
}
