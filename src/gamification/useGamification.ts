import { useEffect, useMemo, useState } from "react";
import {
    DEFAULT_PLAYER,
    PlayerState,
    applyLocalRewards,
    XpBreakdown,
} from "./engine";
import { loadGuestPlayer, saveGuestPlayer } from "./storage";
import {
    AchievementUnlock,
    applyAchievementUnlocks,
    evaluateProgression,
    HabitSnapshot
} from "./progression";
import { ACHIEVEMENT_KEYS, AchievementKey } from "./achievements";

type ServerProfile = {
    totalXp: number;
    level: number;
    totalMinutesLogged: number;
};

export type RewardEvent = {
    breakdown: XpBreakdown;
    leveledUp: boolean;
    nextLevel: number;
};

function toAchievementKey(key: string): AchievementKey | null {
    return ACHIEVEMENT_KEYS.includes(key as AchievementKey) ? (key as AchievementKey) : null;
}

export function useGamification(opts: {
    isAuthed: boolean;
    serverProfile?: ServerProfile | null;
}) {
    const [guestPlayer, setGuestPlayer] = useState<PlayerState>(() => loadGuestPlayer());
    const [lastReward, setLastReward] = useState<RewardEvent | null>(null);
    const [lastUnlocks, setLastUnlocks] = useState<AchievementUnlock[] | null>(null);

    useEffect(() => {
        if (!opts.isAuthed) saveGuestPlayer(guestPlayer);
    }, [guestPlayer, opts.isAuthed]);

    const player = useMemo(() => {
        if (opts.isAuthed) {
            // ✅ THIS is the key: render from serverProfile
            if (!opts.serverProfile) return DEFAULT_PLAYER;

            return {
                ...DEFAULT_PLAYER,
                totalXp: opts.serverProfile.totalXp,
                level: opts.serverProfile.level,
                totalMinutesLogged: opts.serverProfile.totalMinutesLogged,
            };
        }

        return guestPlayer;
    }, [opts.isAuthed, opts.serverProfile, guestPlayer]);

    function clearLastReward() {
        setLastReward(null);
    }

    function clearLastUnlocks() {
        setLastUnlocks(null);
    }

    function awardForCheckin(args: {
        currentStreak: number;
        minutesSpent?: number | null;
        habits?: HabitSnapshot[];
    }) {
        if (opts.isAuthed) return null; // server drives authed rewards

        const { next, breakdown, leveledUp } = applyLocalRewards(guestPlayer, args);

        let finalNext = next;

        // ✅ Evaluate achievements/goals if habits were provided
        if (args.habits) {
            const result = evaluateProgression({
                player: {
                    totalXp: next.totalXp,
                    level: next.level,
                    totalMinutesLogged: next.totalMinutesLogged,
                    achievementsUnlocked: next.achievementsUnlocked ?? {},
                },
                habits: args.habits,
            });

            if (result.newlyUnlocked.length) {
                finalNext = applyAchievementUnlocks(next, result.newlyUnlocked);
                setLastUnlocks(result.newlyUnlocked);
            }
        }

        // ✅ ONE write: persist the final merged player
        setGuestPlayer(finalNext);

        setLastReward({
            breakdown,
            leveledUp,
            nextLevel: finalNext.level,
        });

        return { next: finalNext, breakdown, leveledUp };

    }

    function pushReward(reward: RewardEvent) {
        setLastReward(reward)
    }

    function syncProgressionFromServer(args: {
        serverPlayer: { totalXp: number; level: number; totalMinutesLogged: number };
        serverUnlocked: Record<string, string>;
        previousUnlocked?: Record<string, string>;
        habits: HabitSnapshot[];
    }) {
        // Preferred path: backend is source of truth for unlock state.
        const previousUnlocked = args.previousUnlocked ?? {};
        const serverUnlocked = args.serverUnlocked ?? {};
        const newlyUnlockedFromServer: AchievementUnlock[] = Object.entries(serverUnlocked)
            .filter(([key]) => !previousUnlocked[key])
            .map(([key, unlockedAtIso]) => {
                const achievementKey = toAchievementKey(key);
                if (!achievementKey) return null;
                return {
                    key: achievementKey,
                    unlockedAtIso: String(unlockedAtIso),
                };
            })
            .filter((u): u is AchievementUnlock => !!u);

        if (newlyUnlockedFromServer.length) {
            setLastUnlocks(newlyUnlockedFromServer);
            return;
        }

        // Fallback path: if backend unlock persistence is unavailable, evaluate locally.
        const result = evaluateProgression({
            player: {
                totalXp: args.serverPlayer.totalXp,
                level: args.serverPlayer.level,
                totalMinutesLogged: args.serverPlayer.totalMinutesLogged,
                achievementsUnlocked: serverUnlocked,
            },
            habits: args.habits,
        });

        if (result.newlyUnlocked.length) {
            setLastUnlocks(result.newlyUnlocked);
        }
    }


    return {
        player,
        awardForCheckin,
        lastReward,
        clearLastReward,
        pushReward,
        lastUnlocks,
        clearLastUnlocks,
        syncProgressionFromServer,
    };
}
