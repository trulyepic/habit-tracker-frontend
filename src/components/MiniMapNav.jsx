import { Bell, ListChecks, UserRound } from "lucide-react";

const ITEMS = [
  { key: "quests", label: "Quests", icon: ListChecks },
  { key: "profile", label: "Profile", icon: UserRound },
  { key: "claims", label: "Claims", icon: Bell },
];

export default function MiniMapNav({
  activeView = "quests",
  claimPanelOpen = false,
  claimableCount = 0,
  onSelect,
}) {
  return (
    <div className="grid grid-cols-3 gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
      {ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive =
          item.key === "claims" ? claimPanelOpen : activeView === item.key;

        return (
          <button
            key={item.key}
            type="button"
            onClick={() => onSelect?.(item.key)}
            className={`relative rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-200 ${
              isActive
                ? "bg-gradient-to-r from-slate-900 to-slate-700 text-white shadow-sm"
                : "bg-white text-slate-700 hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-sm"
            }`}
          >
            <span className="inline-flex items-center gap-1.5">
              <Icon className="h-4 w-4" />
              {item.label}
            </span>
            {item.key === "claims" && claimableCount > 0 && (
              <span className={`absolute -right-1 -top-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${isActive ? "bg-white/20 text-white" : "bg-rose-100 text-rose-700"}`}>
                {claimableCount}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

