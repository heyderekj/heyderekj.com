import { getPublishedPosts, postHref, tagCounts, topicHref, TYPE_LABELS } from '../lib/posts';
import { getRevisions } from '../lib/revisions';
import { getPublishedWork, partnerHref, partnersOf } from '../lib/work';

export async function GET(context) {
  const site = context.site?.toString().replace(/\/$/, '') ?? 'https://heyderekj.com';

  const posts = await getPublishedPosts();
  const work = await getPublishedWork();
  const types = [...new Set(posts.map((p) => p.data.type))].map((t) => `/posts/${TYPE_LABELS[t].path}/`);
  const topicPaths = tagCounts(posts).map(({ tag }) => topicHref(tag));

  const staticPaths = [
    '/',
    ...types,
    '/topics/',
    ...topicPaths,
    '/work/',
    '/projects/',
    ...partnersOf(work).map((p) => partnerHref(p.name)),
    '/about/',
    '/colophon/',
  ];

  const urls = [
    ...staticPaths.map((p) => ({ loc: `${site}${p}`, lastmod: null })),
    ...posts.map((p) => ({
      loc: `${site}${postHref(p)}`,
      lastmod: (getRevisions(p).updated ?? p.data.date).toISOString().slice(0, 10),
    })),
    ...work.map((p) => ({
      loc: `${site}/work/${p.slug}/`,
      lastmod: p.data.date.toISOString().slice(0, 10),
    })),
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(({ loc, lastmod }) => `  <url><loc>${loc}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}</url>`)
  .join('\n')}
</urlset>`;

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml' },
  });
}
