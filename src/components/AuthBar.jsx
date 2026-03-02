import React from "react";
import { API_BASE, APP_BASE } from "../lib/config";

export default function AuthBar({ isAuthed, me, onLogout }) {
  const next = encodeURIComponent(`${APP_BASE}/`);

  return (
    <div className="text-sm text-slate-600">
      {isAuthed ? (
        <div className="flex flex-wrap items-center gap-2">
          <span>
            Logged in as <span className="font-semibold text-slate-900">{me.username}</span>
          </span>
          <span className="text-slate-300">·</span>
          <button
            onClick={onLogout}
            className="text-blue-600 hover:text-blue-700 hover:underline"
            type="button"
          >
            Logout
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <span>Guest mode (saved locally).</span>
          <a
            href={`${API_BASE}/login/?next=${next}`}
            target="_self"
            className="text-blue-600 hover:text-blue-700 hover:underline"
          >
            Login
          </a>
          <span className="text-slate-300">·</span>
          <a
            href={`${API_BASE}/register/?next=${next}`}
            target="_self"
            className="text-blue-600 hover:text-blue-700 hover:underline"
          >
            Register
          </a>
        </div>
      )}
    </div>
  );
}
