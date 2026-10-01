import { getCollection, type CollectionEntry } from 'astro:content';

export type Work = CollectionEntry<'work'>;

/** Published work, newest first. */
export async function getPublishedWork(): Promise<Work[]> {
  return (await getCollection('work', ({ data }) => !data.draft)).sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf(),
  );
}

export const partnerSlug = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export const partnerHref = (name: string) => `/work/with/${partnerSlug(name)}/`;

/** Studios I've partnered with, linked from their filter page. */
export const PARTNER_SITES: Record<string, string> = {
  'Kem Design': 'https://kemdesign.co',
};

export interface Partner {
  name: string;
  slug: string;
  count: number;
}

/** Partners with at least `min` published entries, most work first. */
export function partnersOf(work: Work[], min = 2): Partner[] {
  const counts = new Map<string, number>();
  for (const w of work) {
    const p = w.data.partnership?.trim();
    if (p) counts.set(p, (counts.get(p) ?? 0) + 1);
  }
  return [...counts]
    .filter(([, count]) => count >= min)
    .map(([name, count]) => ({ name, slug: partnerSlug(name), count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}
