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
  },
  {
    key: "ember",
    name: "Ember Forge",
    description: "Unlocked by On Fire (7-day streak).",
    unlockAchievement: "on_fire",
    previewClass: "from-rose-50 to-red-100 border-rose-300",
    cardClass: "border-rose-300 bg-gradient-to-br from-rose-50/90 to-red-100/90",
    bossPanelClass: "border-rose-300 bg-gradient-to-br from-rose-50/75 to-red-100/75",
  },
  {
    key: "chrono",
    name: "Chrono Circuit",
    description: "Unlocked by 10 Hours Logged.",
    unlockAchievement: "ten_hours",
    previewClass: "from-cyan-50 to-sky-50 border-sky-200",
    cardClass: "border-sky-200 bg-gradient-to-br from-cyan-50/90 to-sky-50/90",
    bossPanelClass: "border-sky-200 bg-gradient-to-br from-cyan-50/75 to-sky-50/75",
  },
  {
    key: "aegis",
    name: "Aegis Vault",
    description: "Unlocked by Iron Will (30-day streak).",
    unlockAchievement: "iron_will",
    previewClass: "from-fuchsia-50 to-violet-50 border-fuchsia-200",
    cardClass: "border-fuchsia-200 bg-gradient-to-br from-fuchsia-50/90 to-violet-50/90",
    bossPanelClass: "border-fuchsia-200 bg-gradient-to-br from-fuchsia-50/75 to-violet-50/75",
  },
  {
    key: "sovereign",
    name: "Sovereign Crest",
    description: "Unlocked by Centurion (100 check-ins).",
    unlockAchievement: "centurion",
    previewClass: "from-yellow-50 via-amber-50 to-orange-100 border-yellow-300",
    cardClass: "border-yellow-300 bg-gradient-to-br from-yellow-50/95 via-amber-50/95 to-orange-100/90",
    bossPanelClass: "border-yellow-300 bg-gradient-to-br from-yellow-50/80 via-amber-50/80 to-orange-100/75",
  },
  {
    key: "voidrunner",
    name: "Voidrunner Sigil",
    description: "Unlocked by Raid Initiate (first weekly boss claim).",
    unlockAchievement: "raid_initiate",
    previewClass: "from-indigo-50 via-violet-50 to-fuchsia-100 border-indigo-300",
    cardClass: "border-indigo-300 bg-gradient-to-br from-indigo-50/95 via-violet-50/90 to-fuchsia-100/85",
    bossPanelClass: "border-indigo-300 bg-gradient-to-br from-indigo-50/80 via-violet-50/75 to-fuchsia-100/70",
  },
  {
    key: "behemoth",
    name: "Behemoth Plate",
    description: "Unlocked by Behemoth Bane (hard weekly boss).",
    unlockAchievement: "behemoth_bane",
    previewClass: "from-emerald-50 via-teal-50 to-cyan-100 border-emerald-300",
    cardClass: "border-emerald-300 bg-gradient-to-br from-emerald-50/95 via-teal-50/90 to-cyan-100/85",
    bossPanelClass: "border-emerald-300 bg-gradient-to-br from-emerald-50/80 via-teal-50/75 to-cyan-100/70",
  },
  {
    key: "astral",
    name: "Astral Crown",
    description: "Unlocked by Voidbreaker (2 legendary weekly bosses).",
    unlockAchievement: "voidbreaker",
    previewClass: "from-sky-50 via-blue-50 to-indigo-100 border-sky-300",
    cardClass: "border-sky-300 bg-gradient-to-br from-sky-50/95 via-blue-50/90 to-indigo-100/85",
    bossPanelClass: "border-sky-300 bg-gradient-to-br from-sky-50/80 via-blue-50/75 to-indigo-100/70",
  },
];

export function resolveSkin(skinKey) {
  return QUEST_SKINS.find((s) => s.key === skinKey) ?? QUEST_SKINS[0];
}

export function getUnlockedSkins(achievementsUnlockedRaw) {
  const unlockedMap = coerceUnlockedMap(achievementsUnlockedRaw);
  return QUEST_SKINS.filter((skin) => !skin.unlockAchievement || Boolean(unlockedMap[skin.unlockAchievement]));
}
