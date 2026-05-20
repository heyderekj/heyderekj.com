import { getCollection } from 'astro:content';

export async function GET(context) {
  const site = context.site?.toString().replace(/\/$/, '') ?? 'https://heyderekj.com';

  const staticPaths = ['/', '/posts/', '/work/', '/projects/', '/about/', '/brag/', '/tools/'];

  const posts = await getCollection('posts', ({ data }) => !data.draft);
  const work = await getCollection('work', ({ data }) => !data.draft);
  const projects = await getCollection('projects', ({ data }) => !data.draft);

  const urls = [
    ...staticPaths.map((p) => ({ loc: `${site}${p}`, lastmod: null })),
    ...posts.map((p) => ({
      loc: `${site}/posts/${p.slug}/`,
      lastmod: p.data.date.toISOString().slice(0, 10),
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
