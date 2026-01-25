import React from "react";

export default function HabitCard({
  habit,
  onCheckIn,
  onToggle,
  onDelete,
  checkingIn,
  toggling,
  deleting,
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-lg font-semibold text-slate-900">{habit.name}</h3>
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

          <div className="mt-1 text-sm text-slate-600">
            Total: {habit.totalCheckins} · Last 7d: {habit.last7DaysCount} · Today:{" "}
            {habit.checkedInToday ? "✅" : "—"} · Streak: {habit.currentStreak} · Best:{" "}
            {habit.bestStreak}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onCheckIn(habit.id)}
            disabled={checkingIn}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 disabled:opacity-60"
            type="button"
          >
            {checkingIn ? "Working..." : "Check-in"}
          </button>

          <button
            onClick={() => onToggle(habit.id, !habit.isActive)}
            disabled={toggling}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 disabled:opacity-60"
            type="button"
          >
            {habit.isActive ? "Deactivate" : "Activate"}
          </button>

          <button
            onClick={() => onDelete(habit.id)}
            disabled={deleting}
            className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-60"
            type="button"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
