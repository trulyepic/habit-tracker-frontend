import { coerceUnlockedMap } from "./achievements";

export const QUEST_SKINS = [
  {
    key: "classic",
    name: "Classic Ledger",
    description: "Clean default skin for focused tracking.",
    unlockAchievement: null,
    previewClass: "from-white to-slate-50 border-slate-200",
    cardClass: "border-slate-200 bg-gradient-to-br from-white to-slate-50",
    bossPanelClass: "border-slate-200 bg-white",
    bossHud: {
      hpFillClass: "from-lime-300 via-emerald-200 to-white",
      badgeRingClass: "ring-slate-200/80",
      focusRingClass: "ring-indigo-300",
      anticipationGlowClass: "shadow-[0_0_0_2px_rgba(99,102,241,0.18),0_0_22px_rgba(99,102,241,0.22)]",
    },
  },
  {
    key: "ember",
    name: "Ember Forge",
    description: "Unlocked by On Fire (7-day streak).",
    unlockAchievement: "on_fire",
    previewClass: "from-rose-50 to-red-100 border-rose-300",
    cardClass: "border-rose-300 bg-gradient-to-br from-rose-50/90 to-red-100/90",
    bossPanelClass: "border-rose-300 bg-gradient-to-br from-rose-50/75 to-red-100/75",
    bossHud: {
      hpFillClass: "from-rose-300 via-orange-200 to-amber-100",
      badgeRingClass: "ring-rose-200/80",
      focusRingClass: "ring-rose-300",
      anticipationGlowClass: "shadow-[0_0_0_2px_rgba(244,63,94,0.2),0_0_24px_rgba(251,113,133,0.26)]",
    },
  },
  {
    key: "chrono",
    name: "Chrono Circuit",
    description: "Unlocked by 10 Hours Logged.",
    unlockAchievement: "ten_hours",
    previewClass: "from-cyan-50 to-sky-50 border-sky-200",
    cardClass: "border-sky-200 bg-gradient-to-br from-cyan-50/90 to-sky-50/90",
    bossPanelClass: "border-sky-200 bg-gradient-to-br from-cyan-50/75 to-sky-50/75",
    bossHud: {
      hpFillClass: "from-cyan-300 via-sky-200 to-blue-100",
      badgeRingClass: "ring-sky-200/80",
      focusRingClass: "ring-cyan-300",
      anticipationGlowClass: "shadow-[0_0_0_2px_rgba(14,165,233,0.2),0_0_24px_rgba(34,211,238,0.26)]",
    },
  },
  {
    key: "aegis",
    name: "Aegis Vault",
    description: "Unlocked by Iron Will (30-day streak).",
    unlockAchievement: "iron_will",
    previewClass: "from-fuchsia-50 to-violet-50 border-fuchsia-200",
    cardClass: "border-fuchsia-200 bg-gradient-to-br from-fuchsia-50/90 to-violet-50/90",
    bossPanelClass: "border-fuchsia-200 bg-gradient-to-br from-fuchsia-50/75 to-violet-50/75",
    bossHud: {
      hpFillClass: "from-fuchsia-300 via-violet-200 to-indigo-100",
      badgeRingClass: "ring-fuchsia-200/80",
      focusRingClass: "ring-fuchsia-300",
      anticipationGlowClass: "shadow-[0_0_0_2px_rgba(217,70,239,0.2),0_0_24px_rgba(192,132,252,0.28)]",
    },
  },
  {
    key: "sunforge",
    name: "Sunforge Mantle",
    description: "Unlocked by 25 Hours Logged.",
    unlockAchievement: "twenty_five_hours",
    previewClass: "from-orange-50 via-amber-50 to-yellow-100 border-orange-300",
    cardClass: "border-orange-300 bg-gradient-to-br from-orange-50/95 via-amber-50/90 to-yellow-100/85",
    bossPanelClass: "border-orange-300 bg-gradient-to-br from-orange-50/80 via-amber-50/75 to-yellow-100/70",
    bossHud: {
      hpFillClass: "from-orange-300 via-amber-200 to-yellow-100",
      badgeRingClass: "ring-orange-200/80",
      focusRingClass: "ring-orange-300",
      anticipationGlowClass: "shadow-[0_0_0_2px_rgba(249,115,22,0.22),0_0_24px_rgba(245,158,11,0.3)]",
    },
  },
  {
    key: "sovereign",
    name: "Sovereign Crest",
    description: "Unlocked by Centurion (100 check-ins).",
    unlockAchievement: "centurion",
    previewClass: "from-yellow-50 via-amber-50 to-orange-100 border-yellow-300",
    cardClass: "border-yellow-300 bg-gradient-to-br from-yellow-50/95 via-amber-50/95 to-orange-100/90",
    bossPanelClass: "border-yellow-300 bg-gradient-to-br from-yellow-50/80 via-amber-50/80 to-orange-100/75",
    bossHud: {
      hpFillClass: "from-yellow-300 via-amber-200 to-orange-100",
      badgeRingClass: "ring-amber-200/80",
      focusRingClass: "ring-amber-300",
      anticipationGlowClass: "shadow-[0_0_0_2px_rgba(245,158,11,0.2),0_0_24px_rgba(251,191,36,0.3)]",
    },
  },
  {
    key: "starlit",
    name: "Starlit Reliquary",
    description: "Unlocked by 100 Hours Logged.",
    unlockAchievement: "hundred_hours",
    previewClass: "from-slate-900 via-indigo-900 to-sky-800 border-indigo-400",
    cardClass: "border-indigo-300 bg-gradient-to-br from-indigo-100/95 via-sky-100/90 to-cyan-100/85",
    bossPanelClass: "border-indigo-300 bg-gradient-to-br from-indigo-100/80 via-sky-100/75 to-cyan-100/70",
    bossHud: {
      hpFillClass: "from-indigo-300 via-sky-200 to-cyan-100",
      badgeRingClass: "ring-indigo-200/80",
      focusRingClass: "ring-indigo-300",
      anticipationGlowClass: "shadow-[0_0_0_2px_rgba(99,102,241,0.24),0_0_24px_rgba(56,189,248,0.32)]",
    },
  },
  {
    key: "voidrunner",
    name: "Voidrunner Sigil",
    description: "Unlocked by Raid Initiate (first weekly boss claim).",
    unlockAchievement: "raid_initiate",
    previewClass: "from-indigo-50 via-violet-50 to-fuchsia-100 border-indigo-300",
    cardClass: "border-indigo-300 bg-gradient-to-br from-indigo-50/95 via-violet-50/90 to-fuchsia-100/85",
    bossPanelClass: "border-indigo-300 bg-gradient-to-br from-indigo-50/80 via-violet-50/75 to-fuchsia-100/70",
    bossHud: {
      hpFillClass: "from-indigo-300 via-violet-200 to-fuchsia-100",
      badgeRingClass: "ring-indigo-200/80",
      focusRingClass: "ring-violet-300",
      anticipationGlowClass: "shadow-[0_0_0_2px_rgba(99,102,241,0.24),0_0_24px_rgba(167,139,250,0.3)]",
    },
  },
  {
    key: "behemoth",
    name: "Behemoth Plate",
    description: "Unlocked by Behemoth Bane (hard weekly boss).",
    unlockAchievement: "behemoth_bane",
    previewClass: "from-emerald-50 via-teal-50 to-cyan-100 border-emerald-300",
    cardClass: "border-emerald-300 bg-gradient-to-br from-emerald-50/95 via-teal-50/90 to-cyan-100/85",
    bossPanelClass: "border-emerald-300 bg-gradient-to-br from-emerald-50/80 via-teal-50/75 to-cyan-100/70",
    bossHud: {
      hpFillClass: "from-emerald-300 via-teal-200 to-cyan-100",
      badgeRingClass: "ring-emerald-200/80",
      focusRingClass: "ring-emerald-300",
      anticipationGlowClass: "shadow-[0_0_0_2px_rgba(16,185,129,0.22),0_0_24px_rgba(45,212,191,0.3)]",
    },
  },
  {
    key: "astral",
    name: "Astral Crown",
    description: "Unlocked by Voidbreaker (2 legendary weekly bosses).",
    unlockAchievement: "voidbreaker",
    previewClass: "from-sky-50 via-blue-50 to-indigo-100 border-sky-300",
    cardClass: "border-sky-300 bg-gradient-to-br from-sky-50/95 via-blue-50/90 to-indigo-100/85",
    bossPanelClass: "border-sky-300 bg-gradient-to-br from-sky-50/80 via-blue-50/75 to-indigo-100/70",
    bossHud: {
      hpFillClass: "from-sky-300 via-blue-200 to-indigo-100",
      badgeRingClass: "ring-sky-200/80",
      focusRingClass: "ring-sky-300",
      anticipationGlowClass: "shadow-[0_0_0_2px_rgba(56,189,248,0.22),0_0_24px_rgba(59,130,246,0.28)]",
    },
  },
];

export function resolveSkin(skinKey) {
  return QUEST_SKINS.find((s) => s.key === skinKey) ?? QUEST_SKINS[0];
}

export function getUnlockedSkins(achievementsUnlockedRaw) {
  const unlockedMap = coerceUnlockedMap(achievementsUnlockedRaw);
  return QUEST_SKINS.filter((skin) => !skin.unlockAchievement || Boolean(unlockedMap[skin.unlockAchievement]));
}
