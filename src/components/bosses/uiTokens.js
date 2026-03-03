import { Crown, ShieldAlert, ShieldCheck, Sparkles, Swords, Target } from "lucide-react";

export function getRarityToken(rarity) {
  const r = String(rarity || "common").toLowerCase();
  if (r === "legendary") {
    return { label: "Legendary", className: "border-amber-200 bg-amber-100/90 text-amber-950", Icon: Crown };
  }
  if (r === "epic") {
    return { label: "Epic", className: "border-fuchsia-200 bg-fuchsia-100/90 text-fuchsia-950", Icon: Sparkles };
  }
  if (r === "rare") {
    return { label: "Rare", className: "border-sky-200 bg-sky-100/90 text-sky-950", Icon: Sparkles };
  }
  return { label: "Common", className: "border-slate-200 bg-slate-100/90 text-slate-950", Icon: Target };
}

export function getDifficultyToken(difficulty) {
  const d = String(difficulty || "rookie").toLowerCase();
  if (d === "hard") {
    return { label: "Hard", className: "border-rose-200 bg-rose-100/90 text-rose-950", Icon: Swords };
  }
  if (d === "challenging") {
    return { label: "Challenging", className: "border-orange-200 bg-orange-100/90 text-orange-950", Icon: Swords };
  }
  if (d === "veteran") {
    return { label: "Veteran", className: "border-indigo-200 bg-indigo-100/90 text-indigo-950", Icon: ShieldAlert };
  }
  return { label: "Rookie", className: "border-emerald-200 bg-emerald-100/90 text-emerald-950", Icon: ShieldCheck };
}

export function getBuffTone(buffKey) {
  const key = String(buffKey || "").toLowerCase();
  if (key.includes("barrier") || key.includes("shield") || key.includes("plating") || key.includes("shell")) {
    return "border-cyan-200 bg-cyan-100/70 text-cyan-950";
  }
  if (key.includes("pressure") || key.includes("lock")) {
    return "border-rose-200 bg-rose-100/70 text-rose-950";
  }
  if (key.includes("combo") || key.includes("drive") || key.includes("overclock") || key.includes("strike")) {
    return "border-fuchsia-200 bg-fuchsia-100/70 text-fuchsia-950";
  }
  if (key.includes("regen") || key.includes("ember") || key.includes("burn")) {
    return "border-amber-200 bg-amber-100/70 text-amber-950";
  }
  return "border-violet-200 bg-violet-100/70 text-violet-950";
}

export const STAT_CARD_TONES = {
  reward: "border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50",
  progress: "border-indigo-200 bg-gradient-to-r from-indigo-50 to-cyan-50",
  intel: "border-violet-200 bg-gradient-to-r from-violet-50 to-fuchsia-50",
};
