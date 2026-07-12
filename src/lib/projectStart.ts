import type { CollectionEntry } from 'astro:content';

function projectStartDate(project: CollectionEntry<'projects'>): Date | null {
  const { started, year } = project.data;
  if (started) return started;
  if (year != null) return new Date(Date.UTC(year, 0, 1));
  return null;
}

function formatMonthYear(d: Date): string {
  const month = new Intl.DateTimeFormat('en-US', { month: 'long', timeZone: 'UTC' }).format(d);
  return `${month} ${d.getUTCFullYear()}`;
}

function sameProjectMonth(a: Date, b: Date): boolean {
  return a.getUTCFullYear() === b.getUTCFullYear() && a.getUTCMonth() === b.getUTCMonth();
}

/** UTC ms for sorting; prefers `started`, else Jan 1 UTC of `year`. */
export function projectStartTime(project: CollectionEntry<'projects'>): number {
  return projectStartDate(project)?.getTime() ?? 0;
}

/** "March 2024" style label for cards and project detail meta. */
export function formatProjectStartLabel(project: CollectionEntry<'projects'>): string {
  const d = projectStartDate(project);
  return d ? formatMonthYear(d) : '';
}

/** "July 2026" when `updated` differs from start month; empty otherwise. */
export function formatProjectUpdatedLabel(project: CollectionEntry<'projects'>): string {
  const { updated } = project.data;
  if (!updated) return '';
  const start = projectStartDate(project);
  if (start && sameProjectMonth(start, updated)) return '';
  return formatMonthYear(updated);
}
