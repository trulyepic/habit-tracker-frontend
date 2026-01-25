const GUEST_KEY = "guest_habits_v1";

export function loadGuestHabits() {
  try {
    return JSON.parse(localStorage.getItem(GUEST_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveGuestHabits(habits) {
  localStorage.setItem(GUEST_KEY, JSON.stringify(habits));
}

export function guestNewHabit(name) {
  return {
    __typename: "HabitType",
    id: `guest-${crypto.randomUUID()}`,
    name,
    isActive: true,
    totalCheckins: 0,
    checkedInToday: false,
    last7DaysCount: 0,
    currentStreak: 0,
    bestStreak: 0,
  };
}

export function guestApplyCheckin(h) {
  if (h.checkedInToday) return h;

  const total = (h.totalCheckins ?? 0) + 1;
  const last7 = (h.last7DaysCount ?? 0) + 1;
  const currentStreak = (h.currentStreak ?? 0) + 1;
  const bestStreak = Math.max(h.bestStreak ?? 0, currentStreak);

  return {
    ...h,
    checkedInToday: true,
    totalCheckins: total,
    last7DaysCount: last7,
    currentStreak,
    bestStreak,
  };
}
