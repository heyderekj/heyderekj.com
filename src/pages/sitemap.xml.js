import { getCollection } from 'astro:content';
import { getPublishedPosts, postHref, tagCounts, topicHref, TYPE_LABELS } from '../lib/posts';
import { getRevisions } from '../lib/revisions';

export async function GET(context) {
  const site = context.site?.toString().replace(/\/$/, '') ?? 'https://heyderekj.com';

  const posts = await getPublishedPosts();
  const types = [...new Set(posts.map((p) => p.data.type))].map((t) => `/posts/${TYPE_LABELS[t].path}/`);
  const topicPaths = tagCounts(posts).map(({ tag }) => topicHref(tag));

  const staticPaths = [
    '/',
    '/posts/',
    ...types,
    '/topics/',
    ...topicPaths,
    '/work/',
    '/projects/',
    '/about/',
    '/colophon/',
  ];

  const work = await getCollection('work', ({ data }) => !data.draft);
  const projects = await getCollection('projects', ({ data }) => !data.draft && data.status !== 'retired');

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
    ...projects.map((p) => ({
      loc: `${site}/projects/${p.slug}/`,
      lastmod: null,
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
