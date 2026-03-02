import { useMemo, useState } from "react";
import { Activity, CalendarCheck2, Flame, Medal, Snowflake, Timer, Zap } from "lucide-react";

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

  const checkInDisabled = checkingIn || (habit.checkedInToday && !habit.usedFreezeToday);
  const freezeEligible = canUseFreeze && !habit.checkedInToday && (habit.currentStreak ?? 0) > 0 && habit.isActive;

  return (
    <div className={`motion-fade-slide surface-interactive rounded-2xl border p-5 shadow-sm ${cardSkinClass}`}>
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

          {/* Minutes input (optional) */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 transition-colors duration-200 focus-within:border-sky-300 focus-within:bg-sky-50/30">
              <Timer className="h-4 w-4 text-slate-500" />
              <input
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                inputMode="numeric"
                placeholder="Minutes (e.g. 30)"
                className="w-36 bg-transparent text-sm outline-none placeholder:text-slate-400"
              />
            </div>

            <div className="text-xs text-slate-500">
              Optional time log for XP bonus.
            </div>
          </div>

          <p className="mt-2 text-[11px] text-slate-500">
            Deactivate keeps quest history. Delete permanently removes the quest and its check-ins.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onCheckIn(habit.id, minutesInt)}
            disabled={checkInDisabled}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-slate-900 to-slate-700 px-3 py-2 text-sm font-semibold text-white transition-all duration-200 ease-out hover:-translate-y-0.5 hover:from-slate-800 hover:to-slate-700 hover:shadow-sm active:translate-y-0 disabled:opacity-60"
            type="button"
            title={habit.checkedInToday && !habit.usedFreezeToday ? "Already checked in today" : "Check in"}
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
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-sm active:translate-y-0 disabled:opacity-60"
            type="button"
          >
            {habit.isActive ? "Deactivate" : "Activate"}
          </button>

          {freezeEligible && (
            <button
              onClick={() => onUseFreeze(habit.id)}
              disabled={consumingFreeze}
              className="rounded-lg border border-sky-300 bg-sky-50 px-3 py-2 text-sm font-semibold text-sky-700 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-sky-100 hover:shadow-sm active:translate-y-0 disabled:opacity-60"
              type="button"
            >
              <span className="inline-flex items-center gap-1.5">
                <Snowflake className="h-4 w-4" />
                Use freeze
              </span>
            </button>
          )}

          <button
            onClick={() => onDelete(habit.id)}
            disabled={deleting}
            className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-rose-100 hover:shadow-sm active:translate-y-0 disabled:opacity-60"
            type="button"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
