import { useEffect, useState } from "react";
import { guestRolloverIfNewDay } from "../lib/guestHabitUtils";

const KEY = "habit-tracker:guest-habits:v1";

export function useGuestHabits() {
  const [guestHabits, setGuestHabits] = useState(() => {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return guestRolloverIfNewDay(parsed);
  });

  // persist on change
  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(guestHabits));
  }, [guestHabits]);

  // ✅ OPTIONAL midnight rollover for long-open tabs
  useEffect(() => {
    const id = setInterval(() => {
      setGuestHabits((prev) => guestRolloverIfNewDay(prev));
    }, 60 * 1000);

    return () => clearInterval(id);
  }, []);

  const setGuestHabitsAndPersist = (next) => setGuestHabits(next);

  const clearGuestHabits = () => {
    localStorage.removeItem(KEY);
    setGuestHabits([]);
  };

  return { guestHabits, setGuestHabitsAndPersist, clearGuestHabits };
}
