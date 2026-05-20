import type { CollectionEntry } from 'astro:content';
import { projectStartTime } from './projectStart';

export type BragStatCycle = {
  id: string;
  kicker: string;
  value: string;
  title: string;
  subtitle?: string;
};

const MS_YEAR = 365.25 * 24 * 60 * 60 * 1000;

function formatAvgPerYear(n: number): string {
  if (n >= 10) return `~${Math.round(n)}`;
  const rounded = Math.round(n * 10) / 10;
  return rounded % 1 === 0 ? `~${rounded}` : `~${rounded.toFixed(1)}`;
}

/** Fun stats to cycle in the aggregate brag panel (total first). */
export function computeBragStatCycles(
  projects: CollectionEntry<'projects'>[],
  count: number,
  startYear: number,
  now: Date = new Date(),
): BragStatCycle[] {
  const dated = projects
    .map((p) => projectStartTime(p))
    .filter((t) => t > 0);

  const cycles: BragStatCycle[] = [
    {
      id: 'total',
      kicker: 'Total',
      value: String(count),
      title: 'side projects',
      subtitle: `since ${startYear}`,
    },
  ];

  if (dated.length === 0) return cycles;

  const currentYear = now.getUTCFullYear();
  const byYear = new Map<number, number>();
  let last12 = 0;

  for (const t of dated) {
    const y = new Date(t).getUTCFullYear();
    byYear.set(y, (byYear.get(y) ?? 0) + 1);
    if (now.getTime() - t < MS_YEAR) last12++;
  }

  const currentCount = byYear.get(currentYear) ?? 0;
  const maxCount = Math.max(...byYear.values());
  const peakYear = [...byYear.entries()]
    .filter(([, c]) => c === maxCount)
    .map(([y]) => y)
    .sort((a, b) => b - a)[0];

  const push = (slide: BragStatCycle) => {
    if (!cycles.some((c) => c.id === slide.id)) cycles.push(slide);
  };

  const spanYears = currentYear - startYear + 1;
  if (spanYears >= 2) {
    push({
      id: 'avg-per-year',
      kicker: 'Average',
      value: formatAvgPerYear(dated.length / spanYears),
      title: 'project starts',
      subtitle: 'per calendar year',
    });
  }

  if (currentCount >= 2) {
    push({
      id: 'trending-year',
      kicker: 'Trending',
      value: String(currentCount),
      title: `starts in ${currentYear}`,
      subtitle:
        currentCount >= maxCount ? 'busiest year yet' : `${currentYear} is heating up`,
    });
  }

  if (last12 >= 2 && last12 !== currentCount) {
    push({
      id: 'recent',
      kicker: 'Recent',
      value: String(last12),
      title: 'in the last 12 months',
      subtitle: 'by start date',
    });
  }

  let streak = 0;
  for (let y = currentYear; (byYear.get(y) ?? 0) > 0; y--) streak++;
  if (streak >= 3) {
    push({
      id: 'streak',
      kicker: 'Streak',
      value: String(streak),
      title: 'years in a row',
      subtitle: 'with at least one start',
    });
  }

  const avgMonths = Math.round((spanYears * 12) / dated.length);
  if (dated.length >= 5 && avgMonths <= 10) {
    push({
      id: 'pace',
      kicker: 'Pace',
      value: `~${avgMonths}mo`,
      title: 'between starts',
      subtitle: 'on average',
    });
  }

  if (peakYear && maxCount >= 2 && peakYear !== currentYear) {
    push({
      id: 'peak',
      kicker: 'Peak',
      value: String(maxCount),
      title: `starts in ${peakYear}`,
      subtitle: 'best year so far',
    });
  }

  const sorted = [...dated].sort((a, b) => a - b);
  let maxGapMs = 0;
  for (let i = 1; i < sorted.length; i++) {
    const gap = sorted[i]! - sorted[i - 1]!;
    if (gap > maxGapMs) maxGapMs = gap;
  }
  const maxGapMonths = Math.round(maxGapMs / (MS_YEAR / 12));
  if (maxGapMonths >= 18) {
    push({
      id: 'gap',
      kicker: 'Dry spell',
      value: `${maxGapMonths}mo`,
      title: 'longest gap',
      subtitle: 'between project starts',
    });
  }

  return cycles;
}
