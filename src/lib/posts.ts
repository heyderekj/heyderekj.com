/**
 * Single entry point for the typed writing stream (essays, notes, links).
 * Pages, feeds and the sitemap read posts through here so drafts, sorting,
 * titles and URLs stay consistent.
 */
import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'posts'>;
export type PostType = Post['data']['type'];

export const TYPE_LABELS: Record<PostType, { one: string; many: string; path: string }> = {
  essay: { one: 'Essay', many: 'Essays', path: 'essays' },
  note: { one: 'Note', many: 'Notes', path: 'notes' },
  link: { one: 'Link', many: 'Links', path: 'links' },
};

export const STATUS_LABELS: Record<Post['data']['status'], string> = {
  working: 'Working draft',
  stable: 'Stable',
  outdated: 'Outdated',
};

let cache: Promise<Post[]> | null = null;

/** Published posts, newest first. */
export function getPublishedPosts(): Promise<Post[]> {
  const load = () =>
    getCollection('posts', ({ data }) => !data.draft).then((posts) =>
      posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf()),
    );
  // Memoize for the build (every page asks); always fresh in dev so edits show.
  if (import.meta.env.DEV) return load();
  cache ??= load();
  return cache;
}

export function postHref(post: Post): string {
  return `/posts/${post.slug}/`;
}

export function topicHref(tag: string): string {
  return `/topics/${tag}/`;
}

export function typeHref(type: PostType): string {
  return `/posts/${TYPE_LABELS[type].path}/`;
}

/** Markdown / MDX body → plain text (good enough for excerpts and feed summaries). */
export function plainText(body: string): string {
  return body
    .replace(/^import\s.+$/gm, '')
    .replace(/^export\s.+$/gm, '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/\[\^[^\]]+\]:?/g, '')
    .replace(/[*_`>#~|]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function postExcerpt(post: Post, words = 28): string {
  const text = plainText(post.body);
  const parts = text.split(' ');
  return parts.length > words ? `${parts.slice(0, words).join(' ')}…` : text;
}

const fmtShort = (d: Date) =>
  d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });

/** Display title — untitled notes fall back to their opening words, then the date. */
export function postTitle(post: Post): string {
  if (post.data.title?.trim()) return post.data.title.trim();
  const excerpt = postExcerpt(post, 8);
  return excerpt || `Note, ${fmtShort(post.data.date)}`;
}

/** Posts sharing the most tags, then recent posts of the same type. */
export function relatedPosts(post: Post, all: Post[], n = 3): Post[] {
  const tags = new Set(post.data.tags);
  const others = all.filter((p) => p.id !== post.id);
  const scored = others
    .map((p) => ({ p, score: p.data.tags.filter((t) => tags.has(t)).length }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || b.p.data.date.valueOf() - a.p.data.date.valueOf())
    .map(({ p }) => p);
  if (scored.length >= n) return scored.slice(0, n);
  const fill = others.filter((p) => p.data.type === post.data.type && !scored.includes(p));
  return [...scored, ...fill].slice(0, n);
}

/** Chronological neighbours: `newer` and `older` than this post. */
export function adjacentPosts(post: Post, all: Post[]): { newer?: Post; older?: Post } {
  const i = all.findIndex((p) => p.id === post.id);
  if (i === -1) return {};
  return { newer: all[i - 1], older: all[i + 1] };
}

/** All tags in use with counts, most-used first. */
export function tagCounts(all: Post[]): { tag: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const p of all) for (const t of p.data.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}
