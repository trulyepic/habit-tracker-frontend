import { useState } from "react";
import { loadGuestHabits, saveGuestHabits } from "../lib/guestHabitUtils";

export function useGuestHabits() {
  const [guestHabits, setGuestHabits] = useState(() => loadGuestHabits());

  const setGuestHabitsAndPersist = (next) => {
    setGuestHabits(next);
    saveGuestHabits(next);
  };

  const clearGuestHabits = () => setGuestHabitsAndPersist([]);

  return { guestHabits, setGuestHabitsAndPersist, clearGuestHabits };
}
