import { useMemo, useState } from "react";
import { Activity, CalendarCheck2, Flame, Medal, Snowflake, Timer, Zap } from "lucide-react";

function resolveHabitRank(streak) {
  const value = Number(streak ?? 0);
  if (value >= 21) return { label: "Legend", tone: "bg-amber-50 text-amber-700" };
  if (value >= 10) return { label: "Elite", tone: "bg-fuchsia-50 text-fuchsia-700" };
  if (value >= 5) return { label: "Rising", tone: "bg-sky-50 text-sky-700" };
  return { label: "Novice", tone: "bg-slate-100 text-slate-700" };
}

const QUICK_MINUTES = [5, 15, 30];
const CHECKIN_MINUTES_MIN = 1;
const CHECKIN_MINUTES_MAX = 720;

export default function HabitCard({
  habit,
  onCheckIn, // NOW expects: (habitId, minutesSpent)
  onUseFreeze,
  canUseFreeze = false,
  onToggle,
  onDelete,
  checkingIn,
  consumingFreeze,
  toggling,
  deleting,
  cardSkinClass = "border-slate-200 bg-gradient-to-br from-white to-slate-50",
}) {
  const [minutes, setMinutes] = useState("");

  const minutesInt = useMemo(() => {
    const n = parseInt(minutes, 10);
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [minutes]);

  const checkInLocked = checkingIn || (habit.checkedInToday && !habit.usedFreezeToday);
  const checkInDisabled =
    checkInLocked ||
    minutesInt == null ||
    minutesInt < CHECKIN_MINUTES_MIN ||
    minutesInt > CHECKIN_MINUTES_MAX;
  const freezeEligible = canUseFreeze && !habit.checkedInToday && (habit.currentStreak ?? 0) > 0 && habit.isActive;
  const habitRank = resolveHabitRank(habit.currentStreak);

  return (
    <div className={`motion-fade-slide surface-interactive relative overflow-hidden rounded-2xl border p-4 shadow-sm sm:p-5 ${cardSkinClass}`}>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 via-cyan-400 to-fuchsia-500" />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-lg font-semibold text-slate-900">
              {habit.name}
            </h3>

            <span
              className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                habit.isActive
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {habit.isActive ? "ACTIVE" : "INACTIVE"}
            </span>
            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${habitRank.tone}`}>
              {habitRank.label}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-slate-700">
              <Activity className="h-3.5 w-3.5" />
              {habit.totalCheckins} total
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2.5 py-1 text-sky-700">
              <CalendarCheck2 className="h-3.5 w-3.5" />
              {habit.last7DaysCount} in 7d
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-fuchsia-50 px-2.5 py-1 text-fuchsia-700">
              <Flame className="h-3.5 w-3.5" />
              {habit.currentStreak} streak
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-amber-700">
              <Medal className="h-3.5 w-3.5" />
              best {habit.bestStreak}
            </span>
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 ${
              habit.checkedInToday
                ? "bg-emerald-50 text-emerald-700"
                : "bg-slate-100 text-slate-600"
            }`}>
              {habit.checkedInToday ? "Checked in today" : "Not checked in today"}
            </span>
            {habit.usedFreezeToday && (
              <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2.5 py-1 text-sky-700">
                <Snowflake className="h-3.5 w-3.5" />
                Freeze protected
              </span>
            )}
          </div>

          {/* Minutes are required for fair XP + time tracking. */}
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            {/* Mobile-first: full-width input for easier one-handed typing. */}
            <div className="flex w-full items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 transition-colors duration-200 focus-within:border-sky-300 focus-within:bg-sky-50/30 sm:w-auto">
              <Timer className="h-4 w-4 text-slate-500" />
              <input
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                inputMode="numeric"
                placeholder="Minutes (e.g. 30)"
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400 sm:w-36"
              />
            </div>

            <div className="text-xs text-slate-500">
              Required: log between {CHECKIN_MINUTES_MIN} and {CHECKIN_MINUTES_MAX} minutes.
            </div>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-500">Quick check-in:</span>
            {QUICK_MINUTES.map((m) => (
              <button
                key={`quick-${habit.id}-${m}`}
                type="button"
                disabled={checkInLocked}
                onClick={() => onCheckIn(habit.id, m)}
                className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-700 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-sm active:translate-y-0 disabled:opacity-60"
                title={`Quick check-in with ${m} minutes`}
              >
                +{m}m
              </button>
            ))}
          </div>

          <p className="mt-2 text-[11px] text-slate-500">
            Deactivate keeps habit history. Delete permanently removes the habit and its check-ins.
          </p>
        </div>

        {/* Mobile-first: stack major actions so each tap target stays large. */}
        <div className="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap sm:items-center">
          <button
            onClick={() => onCheckIn(habit.id, minutesInt)}
            disabled={checkInDisabled}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-slate-900 to-slate-700 px-3 py-2 text-sm font-semibold text-white transition-all duration-200 ease-out hover:-translate-y-0.5 hover:from-slate-800 hover:to-slate-700 hover:shadow-sm active:translate-y-0 disabled:opacity-60 sm:w-auto"
            type="button"
            title={
              habit.checkedInToday && !habit.usedFreezeToday
                ? "Already checked in today"
                : "Enter minutes or use quick check-in"
            }
          >
            <Zap className="h-4 w-4" />
            {habit.usedFreezeToday
              ? "Claim XP"
              : habit.checkedInToday
              ? "Checked in"
              : checkingIn
              ? "Working..."
              : "Check-in"}
          </button>

          <button
            onClick={() => onToggle(habit.id, !habit.isActive)}
            disabled={toggling}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-sm active:translate-y-0 disabled:opacity-60 sm:w-auto"
            type="button"
          >
            {habit.isActive ? "Deactivate" : "Activate"}
          </button>

          {freezeEligible && (
            <button
              onClick={() => onUseFreeze(habit.id)}
              disabled={consumingFreeze}
              className="w-full rounded-lg border border-sky-300 bg-sky-50 px-3 py-2 text-sm font-semibold text-sky-700 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-sky-100 hover:shadow-sm active:translate-y-0 disabled:opacity-60 sm:w-auto"
              type="button"
            >
              <span className="inline-flex items-center justify-center gap-1.5">
                <Snowflake className="h-4 w-4" />
                Use freeze
              </span>
            </button>
          )}

          <button
            onClick={() => onDelete(habit.id)}
            disabled={deleting}
            className="w-full rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-rose-100 hover:shadow-sm active:translate-y-0 disabled:opacity-60 sm:w-auto"
            type="button"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
