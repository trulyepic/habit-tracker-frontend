import { ListChecks, UserRound } from "lucide-react";

export default function TopTabs({ active, onChange }) {
  const cls = (key) =>
    `rounded-xl px-3 py-2 text-sm font-semibold border transition-all duration-200 ease-out ${
      active === key
        ? "bg-gradient-to-r from-slate-900 to-slate-700 text-white border-slate-900 shadow-sm"
        : "bg-white text-slate-800 border-slate-300 hover:bg-slate-50 hover:-translate-y-0.5 hover:shadow-sm"
    }`;

  return (
    <div className="flex items-center gap-2">
      <button type="button" className={cls("quests")} onClick={() => onChange("quests")}>
        <span className="inline-flex items-center gap-1.5">
          <ListChecks className="h-4 w-4" />
          Quests
        </span>
      </button>
      <button
        type="button"
        className={cls("profile")}
        onClick={() => onChange("profile")}
      >
        <span className="inline-flex items-center gap-1.5">
          <UserRound className="h-4 w-4" />
          Profile
        </span>
      </button>
    </div>
  );
}
