/**
 * Projects grouped by focus, not status:
 * - focus    (tier 1) — what I'm mainly building
 * - building (tier 2) — also building / kept live
 * - more     (tier 3) — paused apps, then the archive of retired ones
 */
import { getCollection, type CollectionEntry } from 'astro:content';
import { projectStartTime } from './projectStart';

export type Project = CollectionEntry<'projects'>;

export const TIER_LABELS = {
  focus: 'Main focus',
  building: 'Also building',
  more: 'More projects',
  archive: 'Archive',
} as const;

/** Lower `order` first, then newest start date. */
export function byOrderThenNewest(a: Project, b: Project): number {
  return a.data.order - b.data.order || projectStartTime(b) - projectStartTime(a);
}

export async function getProjectsByTier() {
  const all = await getCollection('projects', ({ data }) => !data.draft);
  const tier = (n: number) => all.filter((p) => p.data.tier === n).sort(byOrderThenNewest);
  const rest = tier(3);
  return {
    all,
    focus: tier(1),
    building: tier(2),
    /** Tier 3 that's still around (paused / maintained / active) — shown as cards. */
    paused: rest.filter((p) => p.data.status !== 'retired'),
    /** Retired — shown as a compact archive, newest first. */
    archive: rest
      .filter((p) => p.data.status === 'retired')
      .sort((a, b) => projectStartTime(b) - projectStartTime(a)),
  };
}
