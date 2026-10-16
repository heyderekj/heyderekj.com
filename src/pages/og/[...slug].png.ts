/**
 * A share image for every post and website write-up, written at build time to
 * /og/posts/<slug>.png and /og/work/<slug>.png (lib/og.ts draws them). The pages point
 * og:image and twitter:image here.
 */
import type { APIRoute, GetStaticPaths } from 'astro';
import { getPublishedPosts, postTitle, TYPE_LABELS, type Post } from '../../lib/posts';
import { getPublishedWork, type Work } from '../../lib/work';
import { getApps, shotsOf, workDate } from '../../lib/deck';
import { peekFor, readingMinutes, type Subject } from '../../lib/pullquote';
import { topicLabel } from '../../data/topics';
import { renderOg, type OgCard } from '../../lib/og';

const day = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });

/** What a post could be about, with its original picture (not a resized copy), as the home page's peeks find them */
async function subjects(): Promise<Subject[]> {
  const [apps, work] = await Promise.all([getApps(), getPublishedWork()]);
  return [
    ...apps.filter((p) => p.data.image || p.data.icon).map((p) => ({ name: p.data.name, img: (p.data.image || p.data.icon)!, url: '', type: 'project' as const })),
    ...work.filter((w) => shotsOf(w).length).map((w) => ({ name: w.data.title.replace(/\.com$/, ''), img: shotsOf(w)[0], url: '', type: 'work' as const })),
  ].filter((s) => s.name.length > 3);
}

export const getStaticPaths = (async () => {
  const [posts, work, subs] = await Promise.all([getPublishedPosts(), getPublishedWork(), subjects()]);
  return [
    ...posts.map((post) => ({ params: { slug: `posts/${post.slug}` }, props: { card: postCard(post, subs) } })),
    ...work.map((w) => ({ params: { slug: `work/${w.slug}` }, props: { card: workCard(w) } })),
  ];
}) satisfies GetStaticPaths;

function postCard(post: Post, subs: Subject[]): OgCard {
  const peek = peekFor(post, subs), tag = post.data.tags[0];
  return {
    eyebrow: [TYPE_LABELS[post.data.type].one, ...(tag ? [topicLabel(tag)] : []), day(post.data.date), `${readingMinutes(post)} min read`],
    title: postTitle(post), quote: peek.quote, image: peek.img,
  };
}
function workCard(w: Work): OgCard {
  const d = w.data;
  return {
    eyebrow: ['Site', d.partnership ? `With ${d.partnership}` : 'Solo', String(workDate(w).getUTCFullYear())],
    title: d.title, quote: d.description ?? null, image: shotsOf(w)[0] ?? null,
  };
}

export const GET: APIRoute = async ({ props }) =>
  new Response(await renderOg((props as { card: OgCard }).card), { headers: { 'Content-Type': 'image/png' } });
