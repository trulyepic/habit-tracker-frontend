import React from "react";
import { BadgeCheck, Crown, Shield, Swords, User } from "lucide-react";
import { API_BASE, APP_BASE } from "../lib/config";

export default function AuthBar({ isAuthed, me, onLogout }) {
  const next = encodeURIComponent(`${APP_BASE}/`);
  const profile = me?.playerProfile ?? null;
  const currentTitle = profile?.currentTitle ?? null;
  const level = Number(profile?.level ?? 1);

  return (
    <div className="text-sm text-slate-600">
      {isAuthed ? (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
            <User className="h-3.5 w-3.5" />
            {me.username}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">
            <Shield className="h-3.5 w-3.5" />
            Lv {level}
          </span>
          {currentTitle?.name && (
            <span className="hidden items-center gap-1 rounded-full bg-fuchsia-50 px-2 py-1 text-xs font-semibold text-fuchsia-700 sm:inline-flex">
              <Crown className="h-3.5 w-3.5" />
              {currentTitle.emoji ? `${currentTitle.emoji} ` : ""}
              {currentTitle.name}
            </span>
          )}
          <span className="hidden items-center gap-1 rounded-full bg-sky-50 px-2 py-1 text-xs font-semibold text-sky-700 sm:inline-flex">
            <BadgeCheck className="h-3.5 w-3.5" />
            Online
          </span>
          <button
            onClick={onLogout}
            className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white transition-colors hover:bg-slate-800"
            type="button"
          >
            <Swords className="h-3.5 w-3.5" />
            Logout
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
            <User className="h-3.5 w-3.5" />
            Guest mode
          </span>
          <span className="hidden text-xs text-slate-500 sm:inline">Saved locally</span>
          <a
            href={`${API_BASE}/login/?next=${next}`}
            target="_self"
            className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white transition-colors hover:bg-slate-800"
          >
            <Swords className="h-3.5 w-3.5" />
            Login
          </a>
          <a
            href={`${API_BASE}/register/?next=${next}`}
            target="_self"
            className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            <Crown className="h-3.5 w-3.5" />
            Register
          </a>
        </div>
      )}
    </div>
  );
}
