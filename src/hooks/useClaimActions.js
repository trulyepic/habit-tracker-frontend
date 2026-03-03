import { useMemo, useState } from "react";

function formatClaimedAt(raw) {
  if (!raw) return null;
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export function useClaimActions(args) {
  const {
    isAuthed,
    dailyQuestChain,
    playerLevel,
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
  } = args;

  const [claimHistory, setClaimHistory] = useState([]);
  const [dailyClaimFeedback, setDailyClaimFeedback] = useState("");
  const [weeklyClaimFeedback, setWeeklyClaimFeedback] = useState("");

  const pushClaimHistory = (label, value) => {
    setClaimHistory((prev) => [{ id: `${Date.now()}-${Math.random()}`, label, value }, ...prev].slice(0, 8));
  };

  const dailyClaimStatusText = useMemo(() => {
    if (!dailyQuestChain) return dailyClaimFeedback || "";
    if (dailyClaimFeedback) return dailyClaimFeedback;
    if (dailyQuestChain.rewardClaimed) {
      const claimedAtLabel = formatClaimedAt(dailyQuestChain.rewardClaimedAt);
      return claimedAtLabel ? `Already claimed today at ${claimedAtLabel}.` : "Already claimed today.";
    }
    if (dailyQuestChain.rewardClaimable) {
      return `Ready to claim +${dailyQuestChain.rewardXp} XP.`;
    }
    return "Complete all daily objectives to unlock this reward.";
  }, [dailyQuestChain, dailyClaimFeedback]);

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
        leveledUp: (payload.profile?.level ?? playerLevel) > playerLevel,
        nextLevel: payload.profile?.level ?? playerLevel,
      });
      if (soundEnabled && (payload.profile?.level ?? playerLevel) > playerLevel) {
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
      setDailyClaimFeedback(claimedAtLabel ? `Already claimed today at ${claimedAtLabel}.` : "Already claimed today.");
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
        leveledUp: (payload.profile?.level ?? playerLevel) > playerLevel,
        nextLevel: payload.profile?.level ?? playerLevel,
      });
      if (soundEnabled && (payload.profile?.level ?? playerLevel) > playerLevel) {
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

  const onClaimRecovery = async () => {
    if (!isAuthed) return;
    const res = await claimRecoveryQuestReward();
    const payload = res?.data?.claimRecoveryQuestReward;
    if (payload?.claimed && payload.awardedXp > 0) {
      if (soundEnabled) playSoundCue("claim");
      pushClaimHistory("Recovery Reward", `+${payload.awardedXp} XP`);
      pushReward({
        breakdown: { base: payload.awardedXp, streakBonus: 0, minutesBonus: 0, total: payload.awardedXp },
        leveledUp: (payload.profile?.level ?? playerLevel) > playerLevel,
        nextLevel: payload.profile?.level ?? playerLevel,
      });
      if (soundEnabled && (payload.profile?.level ?? playerLevel) > playerLevel) {
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

  return {
    claimHistory,
    dailyClaimFeedback,
    weeklyClaimFeedback,
    dailyClaimStatusText,
    pushClaimHistory,
    onClaimDailyReward,
    onClaimWeeklyBossReward,
    onClaimRecovery,
  };
}
