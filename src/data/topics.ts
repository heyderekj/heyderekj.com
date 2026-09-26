/**
 * Topic registry — labels + one-line descriptions for `/topics/` pages.
 * Post frontmatter `tags` use these slugs; unknown slugs still work (the
 * label falls back to a title-cased slug) and are flagged at build time.
 */
export interface Topic {
  label: string;
  description?: string;
}

export const topics: Record<string, Topic> = {
  ai: { label: 'AI', description: 'Using AI in products and in my own practice — the useful parts, and the sparkle.' },
  design: { label: 'Design', description: 'The craft: interfaces, details, and how I work.' },
  branding: { label: 'Branding', description: 'Logos, voice, and what makes a brand feel like itself.' },
  making: { label: 'Making', description: 'Building my own apps and side projects — Harvous, Hike, and the ones that didn’t make it.' },
  work: { label: 'Work', description: 'Career, freelancing, agencies, and knowing when to move on.' },
  tech: { label: 'Tech', description: 'Apple, Webflow, the web, and the industry around them.' },
  faith: { label: 'Faith', description: 'God, church, the Bible, and where faith meets technology.' },
  family: { label: 'Family', description: 'Family, marriage, and the people (and dogs) who shaped me.' },
  milestones: { label: 'Milestones', description: 'Birthdays, year-in-reviews, and marking time.' },
  life: { label: 'Life', description: 'Everything else — small observations, poems, and hard days.' },
};

export function topicLabel(slug: string): string {
  return (
    topics[slug]?.label ??
    slug
      .split('-')
      .map((w) => (w === 'ai' ? 'AI' : w[0].toUpperCase() + w.slice(1)))
      .join(' ')
  );
}
