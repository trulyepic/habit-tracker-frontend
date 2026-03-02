import { useMemo, useState } from "react";
import { Clock3, Filter, Snowflake, Zap } from "lucide-react";

function formatWhen(dateIso, createdAtIso) {
  const d = dateIso ? new Date(`${dateIso}T00:00:00`) : null;
  const t = createdAtIso ? new Date(createdAtIso) : null;
  const day = d && !Number.isNaN(d.valueOf()) ? d.toLocaleDateString() : "Unknown date";
  const time = t && !Number.isNaN(t.valueOf()) ? t.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";
  return time ? `${day} • ${time}` : day;
}

export default function ActivityFeed({
  items = [],
  loading = false,
  hasMore = false,
  onLoadMore,
  onCollapse,
}) {
  const [mode, setMode] = useState("all");

  const actionLabel = (action) => {
    if (action === "habit_created") return "Created quest";
    return "Check-in";
  };

  const filtered = useMemo(() => {
    if (mode === "all") return items;
    if (mode === "created") return items.filter((e) => e.action === "habit_created");
    return items.filter((e) => e.action === "checkin");
  }, [items, mode]);

  const filters = [
    { key: "all", label: "All" },
    { key: "checkin", label: "Check-ins" },
    { key: "created", label: "Created" },
  ];

  return (
    <div className="motion-fade-slide rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Recent Activity</h3>
          <p className="mt-1 text-xs text-slate-500">Your latest quest actions and XP gains.</p>
        </div>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
          {filtered.length} shown
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500">
          <Filter className="h-3.5 w-3.5" />
          Filter
        </span>
        {filters.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setMode(f.key)}
            className={`rounded-full px-2.5 py-1 text-xs font-semibold transition-colors ${
              mode === f.key
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-4 text-sm text-slate-600">
          No activity for this filter yet.
        </div>
      ) : (
        <div className="mt-4 space-y-2">
          {filtered.map((e) => (
            <div key={e.id} className="surface-interactive rounded-xl border border-slate-200 bg-gradient-to-r from-white to-slate-50 px-3 py-2">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-slate-900">{e.habitName}</div>
                  <div className="mt-0.5 inline-flex items-center gap-1 text-xs text-slate-600">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                      {actionLabel(e.action)}
                    </span>
                  </div>
                  <div className="mt-1 inline-flex items-center gap-1 text-xs text-slate-500">
                    <Clock3 className="h-3.5 w-3.5" />
                    {formatWhen(e.date, e.createdAt)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {e.usedFreeze && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2 py-0.5 text-[11px] font-semibold text-sky-700">
                      <Snowflake className="h-3 w-3" />
                      Freeze
                    </span>
                  )}
                  {e.xpAwarded > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                      <Zap className="h-3 w-3" />+{e.xpAwarded} XP
                    </span>
                  )}
                </div>
              </div>
              {typeof e.minutesSpent === "number" && e.minutesSpent > 0 && (
                <div className="mt-1 text-xs text-slate-600">{e.minutesSpent} minutes logged</div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center justify-end gap-2">
        {hasMore && (
          <button
            type="button"
            onClick={onLoadMore}
            disabled={loading}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-sm active:translate-y-0 disabled:opacity-60"
          >
            {loading ? "Loading..." : "Load 10 more"}
          </button>
        )}
        {onCollapse && (
          <button
            type="button"
            onClick={onCollapse}
            className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-200"
          >
            Collapse
          </button>
        )}
      </div>
    </div>
  );
}
