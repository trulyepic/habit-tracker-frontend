import { DEFAULT_PLAYER, PlayerState } from "./engine";

const KEY = "habit-tracker:gami:v1";

export function loadGuestPlayer(): PlayerState {
    try {
        const raw = localStorage.getItem(KEY);
        if (!raw) return DEFAULT_PLAYER;
        const parsed = JSON.parse(raw) as PlayerState;
        return {...DEFAULT_PLAYER, ...parsed };
    } catch {
        return DEFAULT_PLAYER;
    }
}

export function saveGuestPlayer(player: PlayerState) {
    localStorage.setItem(KEY, JSON.stringify(player));
}