/**
 * The bottom bar's context: what it says at rest, and the extras it offers on each kind of page.
 * See components/Bar.astro and client/bar.ts.
 */
export type BarLink = { href: string; title: string };
export type BarContext =
  | { kind: 'home' }
  | { kind: 'essay'; title: string; figures?: { id: string; no: string; title: string }[]; newer?: BarLink; older?: BarLink }
  | { kind: 'writeup'; title: string; newer?: BarLink; older?: BarLink }
  | { kind: 'page'; title: string };

/** Topic chips: each groups a few post tags. Shared by the home paragraph and the bar's menu. */
export const TOPICS: { key: string; label: string; tags: string[] }[] = [
  { key: 'making', label: 'making things', tags: ['making'] },
  { key: 'faith', label: 'faith', tags: ['faith'] },
  { key: 'life', label: 'life', tags: ['life', 'family', 'milestones'] },
  { key: 'interests', label: 'things that interest me', tags: ['design', 'tech', 'ai', 'branding'] },
];

/** One searchable thing: an essay, a write-up or an app. Short keys keep /search.json small. */
export interface SearchItem { k: 'Post' | 'Note' | 'Link' | 'Site' | 'App' | 'Game'; t: string; h: string; y: string; x?: 1; s: string }
