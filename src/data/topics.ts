/**
 * Topic registry — labels + one-line descriptions for `/topics/` pages.
 * Post frontmatter `tags` use these slugs; unknown slugs still work (the
 * label falls back to a title-cased slug) and are flagged at build time.
 */
export interface Topic {
  label: string;
  description?: string;
}

export const topics: Record<string, Topic> = {};

export function topicLabel(slug: string): string {
  return (
    topics[slug]?.label ??
    slug
      .split('-')
      .map((w) => (w === 'ai' ? 'AI' : w[0].toUpperCase() + w.slice(1)))
      .join(' ')
  );
}
