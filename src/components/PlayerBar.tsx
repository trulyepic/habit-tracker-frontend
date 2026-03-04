import { Crown, Sparkles, Clock } from "lucide-react";
import { resolveTitleState } from "../gamification/titles";

type Props = {
  level: number;
  totalXp: number;
  totalMinutesLogged: number;
  achievementsUnlocked?: unknown;
  titleState?: any;
};

function xpIntoLevel(totalXp: number, level: number) {
  // compute how much XP already spent to reach this level
  let spent = 0;
  for (let l = 1; l < level; l++) spent += 100 * l;
  const inLevel = totalXp - spent;
  const needed = 100 * level;
  return { inLevel: Math.max(0, inLevel), needed };
}

function formatLoggedDuration(totalMinutesLogged: number) {
  const minutes = Math.max(0, Math.floor(Number(totalMinutesLogged || 0)));
  const hours = Math.floor(minutes / 60);
  const rem = minutes % 60;
  if (hours === 0) return `${rem}m logged`;
  if (rem === 0) return `${hours}h logged`;
  return `${hours}h ${rem}m logged`;
}

export function PlayerBar({ level, totalXp, totalMinutesLogged, achievementsUnlocked, titleState }: Props) {
  const { inLevel, needed } = xpIntoLevel(totalXp, level);
  const pct = Math.min(100, Math.round((inLevel / needed) * 100));
  const loggedDurationLabel = formatLoggedDuration(totalMinutesLogged);
  const resolvedTitleState = titleState ?? resolveTitleState({
    level,
    achievementsUnlockedRaw: achievementsUnlocked,
  });

  return (
    <div className="motion-fade-slide rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-4 shadow-sm flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-amber-100 to-fuchsia-100 flex items-center justify-center shadow-sm">
          <Crown className="h-5 w-5 text-amber-700" />
        </div>
        <div>
          <div className="font-semibold text-slate-900 flex items-center gap-2">
            Level {level}
            <span className="text-sm text-slate-600 flex items-center gap-1">
              <Sparkles className="h-4 w-4 text-fuchsia-600" />
              {totalXp} XP
            </span>
          </div>
          <div className="mt-1">
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${resolvedTitleState.current.palette.pill}`}>
              {resolvedTitleState.current.emoji} {resolvedTitleState.current.name}
            </span>
          </div>

          <div className="mt-2 w-56 max-w-[60vw] h-2 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-sky-500 via-fuchsia-500 to-amber-500 transition-all duration-300 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>

          <div className="mt-1 text-xs text-slate-500">
            {inLevel}/{needed} XP to next level
          </div>
        </div>
      </div>

      <div className="text-sm text-slate-600 flex items-center gap-2">
        <span className="rounded-md bg-sky-50 p-1">
          <Clock className="h-4 w-4 text-sky-700" />
        </span>
        {loggedDurationLabel}
      </div>
    </div>
  );
}
