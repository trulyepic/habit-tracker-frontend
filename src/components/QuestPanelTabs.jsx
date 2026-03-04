import { Crown, ListChecks, PlusCircle, ShieldAlert, Target } from "lucide-react";

const ITEMS = [
  { key: "today", label: "Today", icon: Target },
  { key: "weekly", label: "Weekly", icon: Crown },
  { key: "safety", label: "Safety", icon: ShieldAlert },
  { key: "create", label: "Create", icon: PlusCircle },
  { key: "quests", label: "My Quests", icon: ListChecks },
];

export default function QuestPanelTabs({
  active,
  onChange,
  badges = {},
  activeClassName = "border-slate-900 bg-gradient-to-r from-slate-900 to-slate-700 text-white shadow-sm",
  className = "mb-4",
}) {
  return (
    // Mobile-first: horizontal rail prevents cramped multi-row tab buttons.
    <div className={`${className} flex gap-2 overflow-x-auto pb-1 sm:grid sm:grid-cols-5 sm:overflow-visible sm:pb-0`}>
      {ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = active === item.key;
        const badge = badges[item.key];
        return (
          <button
            key={item.key}
            type="button"
            onClick={() => onChange(item.key)}
            className={`shrink-0 rounded-lg border px-2.5 py-2 text-xs font-semibold transition-all duration-200 ease-out sm:shrink sm:rounded-xl sm:px-3 sm:text-sm ${
              isActive
                ? activeClassName
                : "border-slate-300 bg-white text-slate-800 hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-sm"
            }`}
          >
            <span className="inline-flex items-center gap-1.5">
              <Icon className="h-4 w-4" />
              {item.label}
              {!!badge && (
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                    isActive ? "bg-white/20 text-white" : "bg-rose-100 text-rose-700"
                  }`}
                >
                  {badge}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
