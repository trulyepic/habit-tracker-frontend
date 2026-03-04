export function formatCountdown(msRemaining) {
  const totalMinutes = Math.max(0, Math.floor(Number(msRemaining || 0) / 60000));
  const days = Math.floor(totalMinutes / (24 * 60));
  const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export function msUntilNextLocalMidnight(now = new Date()) {
  const next = new Date(now);
  next.setHours(24, 0, 0, 0);
  return next.getTime() - now.getTime();
}

function msUntilNextMondayMidnight(now = new Date()) {
  const next = new Date(now);
  const weekday = next.getDay(); // 0=Sun ... 6=Sat
  let daysUntilMonday = (8 - weekday) % 7;
  if (daysUntilMonday === 0) daysUntilMonday = 7;
  next.setDate(next.getDate() + daysUntilMonday);
  next.setHours(0, 0, 0, 0);
  return next.getTime() - now.getTime();
}

export function msUntilWeeklyReset(weekEndIso, now = new Date()) {
  if (typeof weekEndIso !== "string" || weekEndIso.length === 0) {
    return msUntilNextMondayMidnight(now);
  }

  const resetDate = new Date(`${weekEndIso}T00:00:00`);
  if (Number.isNaN(resetDate.getTime())) {
    return msUntilNextMondayMidnight(now);
  }

  resetDate.setDate(resetDate.getDate() + 1); // Monday after week end
  resetDate.setHours(0, 0, 0, 0);

  while (resetDate.getTime() <= now.getTime()) {
    resetDate.setDate(resetDate.getDate() + 7);
  }

  return resetDate.getTime() - now.getTime();
}
