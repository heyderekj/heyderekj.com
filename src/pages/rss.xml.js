import rss from '@astrojs/rss';
import { marked } from 'marked';
import { getPublishedPosts, postHref, postTitle, postExcerpt } from '../lib/posts';

/**
 * One feed for the whole stream, Daring Fireball-style:
 * - essays: title prefixed with ★ (original writing), link → permalink
 * - links:  link → the external URL; guid + trailing ★ → permalink
 * - notes:  full text; title is the note's title or opening words
 * Plain `.md` bodies are sent in full; `.mdx` (component-heavy) sends a summary.
 */
const esc = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export async function GET(context) {
  const posts = await getPublishedPosts();
  const site = context.site.toString().replace(/\/$/, '');

  return rss({
    title: 'Derek Castelli',
    description: 'Essays, notes, and links on faith, technology, and agentic design by Derek Castelli.',
    site: context.site,
    items: posts.map((post) => {
      const { type } = post.data;
      const permalink = `${site}${postHref(post)}`;
      const isMdx = post.id.endsWith('.mdx');
      const body = isMdx
        ? `<p>${esc(post.data.description ?? postExcerpt(post, 60))}</p><p><a href="${permalink}">Read on heyderekj.com →</a></p>`
        : marked.parse(post.body, { async: false });
      const star = `<p><a href="${permalink}" title="Permanent link">&nbsp;★&nbsp;</a></p>`;

      return {
        title: type === 'essay' ? `★ ${postTitle(post)}` : postTitle(post),
        pubDate: post.data.date,
        description: post.data.description ?? postExcerpt(post, 40),
        link: type === 'link' && post.data.link ? post.data.link : postHref(post),
        content: type === 'link' ? body + star : body,
        categories: post.data.tags,
        // The library derives <guid> from `link`; link posts point elsewhere,
        // so pin the guid to the permalink.
        ...(type === 'link' ? { customData: `<guid isPermaLink="true">${permalink}</guid>` } : {}),
      };
    }),
    customData: `<language>en-us</language>`,
  });
}
