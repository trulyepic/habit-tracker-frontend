export type PlayerState = {
    totalXp: number;
    level: number;
    totalMinutesLogged: number;
    achievementsUnlocked: Record<string, string>; //key -> ISO date
};

export type XpBreakdown = {
    base: number;
    streakBonus: number;
    minutesBonus: number;
    total: number;
};

export const DEFAULT_PLAYER: PlayerState = {
    totalXp: 0,
    level: 1,
    totalMinutesLogged: 0,
    achievementsUnlocked: {}
};

export function levelFromXp(totalXp: number): number {
    let level = 1;
    let remaining = totalXp;

    while (true) {
        const cost = 100 * level;
        if (remaining < cost) return level;
        remaining -= cost;
        level += 1;
    }
}

export function computeXpAward(currentStreak: number, minutesSpent?: number | null): XpBreakdown {
    const base = 10;
    const streakBonus = Math.min(2 * Math.max(currentStreak, 0), 20);
    const minutesBonus =
        minutesSpent == null ? 0 : Math.min(Math.floor(minutesSpent / 10), 30);
    const total = base + streakBonus + minutesBonus;
    return { base, streakBonus, minutesBonus, total};
}

export function applyLocalRewards(
    player: PlayerState,
    opts: { currentStreak: number; minutesSpent?: number | null }
): { next: PlayerState; breakdown: XpBreakdown; leveledUp: boolean } {
    const breakdown = computeXpAward(opts.currentStreak, opts.minutesSpent);
    const nextXp = player.totalXp + breakdown.total;
    const nextMinutes = player.totalMinutesLogged + (opts.minutesSpent ?? 0);
    const nextLevel = levelFromXp(nextXp);

    return {
        breakdown,
        leveledUp: nextLevel > player.level,
        next: {
            ...player,
            totalXp: nextXp,
            level: nextLevel,
            totalMinutesLogged: nextMinutes,
        },
    };
}
