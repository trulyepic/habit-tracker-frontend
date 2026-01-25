import { useMutation, useQuery } from "@apollo/client/react";
import { useMemo, useState } from "react";

import AuthBar from "./components/AuthBar";
import HabitCard from "./components/HabitCard";

import { useAuth } from "./hooks/useAuth";
import { useGuestHabits } from "./hooks/useGuestHabits";

import { API_BASE } from "./lib/config";
import { guestApplyCheckin, guestNewHabit } from "./lib/guestHabitUtils";

import {
  CHECK_IN_TODAY,
  CREATE_HABIT,
  DELETE_HABIT,
  GET_HABITS,
  TOGGLE_HABIT,
} from "./graphql/operations";
import { HABIT_FIELDS } from "./graphql/fragments";

export default function App() {
  const { me, isAuthed } = useAuth();
  const { guestHabits, setGuestHabitsAndPersist, clearGuestHabits } = useGuestHabits();

  const {
    data,
    loading,
    error,
    refetch: refetchHabits,
  } = useQuery(GET_HABITS, {
    skip: !isAuthed,
  });

  const habits = useMemo(() => {
    return isAuthed ? data?.habits ?? [] : guestHabits;
  }, [isAuthed, data, guestHabits]);

  // Mutations (authed)
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
            const alreadyExists = existingRefs.some(
              (ref) => readField("id", ref) === newId
            );
            if (alreadyExists) return existingRefs;

            const newRef = cache.writeFragment({
              data: newHabit,
              fragment: HABIT_FIELDS,
            });

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

  // UI state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [importing, setImporting] = useState(false);

  const creating = isAuthed ? creatingAuthed : false;
  const deleting = isAuthed ? deletingAuthed : false;
  const toggling = isAuthed ? togglingAuthed : false;
  const checkingIn = isAuthed ? checkingInAuthed : false;

  // Actions
  const onRefresh = async () => {
    if (!isAuthed) return;
    await refetchHabits();
  };

  const onCreate = async (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;

    if (!isAuthed) {
      setGuestHabitsAndPersist([guestNewHabit(trimmed), ...guestHabits]);
    } else {
      await createHabit({
        variables: {
          name: trimmed,
          description: description.trim() || null,
        },
      });
    }

    setName("");
    setDescription("");
  };

  const onCheckIn = async (habitId) => {
    if (!isAuthed) {
      setGuestHabitsAndPersist(
        guestHabits.map((h) => (h.id === habitId ? guestApplyCheckin(h) : h))
      );
      return;
    }
    await checkInToday({ variables: { habitId } });
  };

  const onToggle = async (id, isActive) => {
    if (!isAuthed) {
      setGuestHabitsAndPersist(
        guestHabits.map((h) => (h.id === id ? { ...h, isActive } : h))
      );
      return;
    }
    await toggleHabit({ variables: { id, isActive } });
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
        (errors.length
          ? `\n\nExample error:\n- ${errors[0].name}: ${errors[0].message}`
          : "")
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-10">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Habit Tracker
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Django + GraphQL + React (Apollo)
          </p>
        </div>

        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <AuthBar isAuthed={isAuthed} me={me} onLogout={onLogout} />

          <div className="flex flex-wrap items-center gap-2">
            {isAuthed && guestHabits.length > 0 && (
              <button
                onClick={onImportGuestHabits}
                disabled={importing}
                className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                type="button"
                title="Import locally saved habits into your account"
              >
                {importing ? "Importing..." : `Import guest habits (${guestHabits.length})`}
              </button>
            )}

            {!isAuthed && guestHabits.length > 0 && (
              <button
                onClick={onClearGuest}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                type="button"
              >
                Clear guest data
              </button>
            )}
          </div>
        </div>

        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">Create Habit</h2>

          <form onSubmit={onCreate} className="mt-4 grid gap-3">
            <input
              placeholder="Habit name (unique)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-400"
            />
            <input
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-400"
            />
            <button
              type="submit"
              disabled={creating}
              className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {creating ? "Creating..." : "Create"}
            </button>
          </form>
        </div>

        <div className="mb-3 flex items-center gap-3">
          <h2 className="text-lg font-semibold text-slate-900">Habits</h2>
          <button
            onClick={onRefresh}
            disabled={!isAuthed}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-60"
            title={!isAuthed ? "Login to load server habits" : "Refresh habits"}
            type="button"
          >
            Refresh
          </button>
        </div>

        {isAuthed && loading && (
          <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600">
            Loading...
          </div>
        )}

        {isAuthed && error && (
          <pre className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
            {error.message}
          </pre>
        )}

        <div className="grid gap-3">
          {habits.map((h) => (
            <HabitCard
              key={h.id}
              habit={h}
              onCheckIn={onCheckIn}
              onToggle={onToggle}
              onDelete={onDelete}
              checkingIn={checkingIn}
              toggling={toggling}
              deleting={deleting}
            />
          ))}

          {habits.length === 0 && (
            <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600">
              No habits yet. Create one above.
            </div>
          )}
        </div>

        {!isAuthed && (
          <p className="mt-8 text-xs text-slate-500">
            Tip: Guest habits are stored locally. Login/Register to save habits to your account.
          </p>
        )}

        <div className="mt-2 text-xs text-slate-400">
          {checkingIn || toggling || deleting ? "Working…" : ""}
        </div>
      </div>
    </div>
  );
}
