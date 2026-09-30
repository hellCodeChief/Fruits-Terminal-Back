const TEHRAN_OFFSET_MS = (3 * 60 + 30) * 60 * 1000;

/** Start and end of the Asia/Tehran calendar day that contains `now`. Iran is UTC+03:30 year-round. */
export function tehranDayRange(now = new Date()): { start: Date; end: Date } {
  const shifted = new Date(now.getTime() + TEHRAN_OFFSET_MS);
  const start = new Date(
    Date.UTC(
      shifted.getUTCFullYear(),
      shifted.getUTCMonth(),
      shifted.getUTCDate(),
      0,
      0,
      0,
      0,
    ) - TEHRAN_OFFSET_MS,
  );
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  return { start, end };
}

export function tehranDateLabel(now = new Date()): string {
  return new Intl.DateTimeFormat('fa-IR', {
    timeZone: 'Asia/Tehran',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(now);
}
