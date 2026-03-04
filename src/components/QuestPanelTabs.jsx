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
}) {
  return (
    <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
      {ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = active === item.key;
        const badge = badges[item.key];
        return (
          <button
            key={item.key}
            type="button"
            onClick={() => onChange(item.key)}
            className={`rounded-xl border px-3 py-2 text-sm font-semibold transition-all duration-200 ease-out ${
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
