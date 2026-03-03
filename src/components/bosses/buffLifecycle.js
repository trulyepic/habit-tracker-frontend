export function resolveBuffState({
  completionPct = 0,
  buffIndex = 0,
  buffCount = 1,
}) {
  const pct = Math.max(0, Math.min(100, Number(completionPct || 0)));
  const count = Math.max(1, Number(buffCount || 1));
  const index = Math.max(0, Number(buffIndex || 0));

  // Buffs degrade in sequence as encounter progress rises.
  const slice = 100 / (count + 1);
  const weakenAt = slice * (index + 1);
  const breakAt = Math.min(100, weakenAt + slice * 0.6);

  if (pct >= breakAt) return "broken";
  if (pct >= weakenAt) return "weakened";
  return "active";
}

export function buffStateMeta(state) {
  if (state === "broken") {
    return {
      label: "Broken",
      pillClass: "border-emerald-200 bg-emerald-100/90 text-emerald-900",
      chipClass: "buff-state-broken",
    };
  }
  if (state === "weakened") {
    return {
      label: "Weakened",
      pillClass: "border-amber-200 bg-amber-100/90 text-amber-900",
      chipClass: "buff-state-weakened",
    };
  }
  return {
    label: "Active",
    pillClass: "border-rose-200 bg-rose-100/90 text-rose-900",
    chipClass: "buff-state-active",
  };
}
