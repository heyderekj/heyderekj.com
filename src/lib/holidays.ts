/**
 * Days I'm not working, for when I'm free (functions/api/availability.ts) and how long things take
 * (lib/estimate.ts schedule): Christmas Eve through New Year's Day, and the US holidays: New Year's,
 * Memorial Day, the Fourth of July, Labor Day, and Thanksgiving with the Friday after it. Dates are
 * 'YYYY-MM-DD', read in UTC.
 */
const DAY = 86_400_000;
const at = (d: string) => new Date(`${d}T12:00:00Z`);
const iso = (t: number) => new Date(t).toISOString().slice(0, 10);

/** The nth weekday (0 = Sunday) of a month, or the last one when n is -1 */
function nth(year: number, month: number, weekday: number, n: number) {
  if (n > 0) {
    const first = new Date(Date.UTC(year, month, 1, 12)).getUTCDay();
    return iso(Date.UTC(year, month, 1 + ((weekday - first + 7) % 7) + (n - 1) * 7, 12));
  }
  const last = new Date(Date.UTC(year, month + 1, 0, 12));
  return iso(last.getTime() - ((last.getUTCDay() - weekday + 7) % 7) * DAY);
}

const cache = new Map<number, Set<string>>();
function holidays(year: number) {
  if (!cache.has(year)) {
    const thanks = nth(year, 10, 4, 4);
    cache.set(year, new Set([
      nth(year, 4, 1, -1), // Memorial Day
      `${year}-07-04`,
      nth(year, 8, 1, 1), // Labor Day
      thanks, iso(at(thanks).getTime() + DAY), // Thanksgiving and the Friday after
    ]));
  }
  return cache.get(year)!;
}

/** The Christmas break: Dec 24 through Jan 1 */
export const inBreak = (d: string) => d.slice(5) >= '12-24' || d.slice(5) === '01-01';
export const isHoliday = (d: string) => inBreak(d) || holidays(Number(d.slice(0, 4))).has(d);
export const isWorkday = (d: string) => { const w = at(d).getUTCDay(); return w !== 0 && w !== 6 && !isHoliday(d); };

/** The day itself if I'm working then, or the next day I am */
export function nextWorkday(d: string) {
  let t = at(d).getTime();
  while (!isWorkday(iso(t))) t += DAY;
  return iso(t);
}
