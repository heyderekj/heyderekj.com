/**
 * Everything the bottom bar can find: essays, website write-ups and apps.
 * Fetched the first time search opens (client/bar.ts).
 */
import type { APIRoute } from 'astro';
import { getPublishedPosts, postHref, postTitle, TYPE_LABELS } from '../lib/posts';
import { getPublishedWork } from '../lib/work';
import { getApps, workDate } from '../lib/deck';
import type { SearchItem } from '../lib/bar';

export const GET: APIRoute = async () => {
  const posts = await getPublishedPosts();
  const work = await getPublishedWork();
  const apps = await getApps();
  const items: SearchItem[] = [
    ...posts.map((p) => ({
      k: TYPE_LABELS[p.data.type].one as SearchItem['k'], t: postTitle(p), h: postHref(p), y: String(p.data.date.getUTCFullYear()),
      s: [postTitle(p), p.data.description, ...p.data.tags].filter(Boolean).join(' ').toLowerCase(),
    })),
    ...work.map((w) => ({
      k: 'Website' as const, t: w.data.title, h: `/work/${w.slug}/`, y: String(workDate(w).getUTCFullYear()),
      s: [w.data.title, w.data.description, w.data.partnership, w.data.workType, ...(w.data.industry ?? [])].filter(Boolean).join(' ').toLowerCase(),
    })),
    ...apps.map((p) => ({
      k: 'App' as const, t: p.data.name, h: p.data.url || 'https://testamentmade.com', y: String(p.data.year ?? ''), x: 1 as const,
      s: [p.data.name, p.data.tagline, p.data.summary].filter(Boolean).join(' ').toLowerCase(),
    })),
  ];
  return new Response(JSON.stringify(items), { headers: { 'Content-Type': 'application/json' } });
};
