/** Content for `/brag/`. Edit here; layout lives in `src/pages/brag/index.astro`. */

import type { Testimonial } from './about';
import { testimonials } from './about';

export type BragFavoritePost = {
  title: string;
  href: string;
  /** ISO date for on-site posts */
  date?: string;
  /** Like count for X posts — rendered as “{likes} likes on X” */
  likes?: string;
  external?: boolean;
};

const X_SNOWFLAKE_EPOCH_MS = 1288834974657;

/** Sort key for favorite-post lists (newest first). */
export function bragFavoritePostTime(post: BragFavoritePost): number {
  if (post.date) return new Date(`${post.date}T12:00:00Z`).getTime();
  const statusId = post.href.match(/status\/(\d+)/)?.[1];
  if (statusId) return Number((BigInt(statusId) >> 22n) + BigInt(X_SNOWFLAKE_EPOCH_MS));
  return 0;
}

export function sortBragFavoritePosts(posts: BragFavoritePost[]): BragFavoritePost[] {
  return [...posts].sort((a, b) => bragFavoritePostTime(b) - bragFavoritePostTime(a));
}

export type BragProjectStat = {
  name: string;
  href: string;
  /** Right-column metrics, e.g. "1.4k+ likes · 180k+ views" */
  metrics: string;
};

export type BragPreview = {
  /** Image path under `public/` */
  src?: string;
  alt: string;
  href?: string;
  /** Phosphor icon name without weight prefix, e.g. `read-cv-logo` */
  icon?: string;
  caption?: string;
  /** About-page experience card, post list, or project stats */
  variant?: 'image' | 'experience' | 'posts' | 'stats' | 'link';
  range?: string;
  name?: string;
  description?: string;
  linkLabel?: string;
  favoritePosts?: BragFavoritePost[];
  projectStats?: BragProjectStat[];
  /** Single row: total non-draft projects from earliest start year to now */
  aggregateProjects?: boolean;
};

export type BragSummaryLink = {
  text: string;
  href: string;
};

export type BragClipping = {
  publication: string;
  dateline: string;
  headline: string;
  /** Supporting copy — three complete lines at default width (~180 chars); no mid-sentence clamp */
  summary: string;
  /** Inline links matched by exact `text` in `summary` */
  summaryLinks?: BragSummaryLink[];
  href?: string;
  /** Client recommendation — same copy as `/work/` testimonials */
  testimonial?: Testimonial;
  /** One or more visual references (project shots, work thumbs, icons) */
  preview?: BragPreview | BragPreview[];
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeAttr(value: string): string {
  return escapeHtml(value).replace(/'/g, '&#39;');
}

/** Escape summary text and wrap configured phrases in external links. */
export function bragSummaryHtml(summary: string, links?: BragSummaryLink[]): string {
  let html = escapeHtml(summary);
  if (!links?.length) return html;

  for (const { text, href } of links) {
    const needle = escapeHtml(text);
    const index = html.indexOf(needle);
    if (index === -1) continue;
    const anchor = `<a href="${escapeAttr(href)}" target="_blank" rel="noopener noreferrer">${needle}</a>`;
    html = html.slice(0, index) + anchor + html.slice(index + needle.length);
  }

  return html;
}

const barrettJohnsonTestimonial =
  testimonials.find((t) => t.author === 'Barrett Johnson') ?? testimonials[0]!;

export const bragMeta = {
  title: 'Brag — Derek Castelli',
  description:
    'Derek Castelli — making websites and apps. Webflow freelancer in Des Moines; native Mac apps and faith-tech on the side.',
};

/** Hero copy aligned with linkedin.com/in/heyderekj */
export const bragHero = {
  photoSrc: '/assets/about/derek-photo.jpeg',
  photoAlt: 'Derek Castelli',
  headline: 'Derek Castelli',
  location: 'Des Moines, Iowa metro',
  bio: 'Self-taught designer designing brands and making websites for non-profits and startups since 2010. Oh and always working on a side project or three.',
  profileHref: 'https://www.linkedin.com/in/heyderekj',
};

export type BragRightNowItem = {
  label: string;
  href?: string;
};

/** Active focus — surfaced above the clippings feed. */
export const bragRightNow: BragRightNowItem[] = [
  {
    label: 'Designing & developing websites with Kem Design',
    href: 'https://kemdesign.co',
  },
  {
    label: 'Making websites with other various clients',
    href: '/work/',
  },
  {
    label: 'Making 3 apps on the side',
    href: 'https://testamentmade.com',
  },
];

/** Skills reflected across the brag feed — two-column checklist below Right now. */
export const bragSkills: string[] = [
  'Webflow & website design',
  'UI/UX thinking',
  'Brand & logo design',
  'Working with teams',
  'Product design',
  'Prompt communication',
  'Customer support',
  'Writing in public',
  'Actively using AI tools',
];

export const bragConnect = [
  { label: 'x.com/heyderekj', href: 'https://x.com/heyderekj' },
  { label: 'linkedin.com/in/heyderekj', href: 'https://www.linkedin.com/in/heyderekj' },
  { label: 'derekj@hey.com', href: 'mailto:derekj@hey.com' },
];

export const bragEpigraphNote =
  'I miss Robin. I’d like to think we’d be good friends if we ever met.';

export const bragCredit = {
  intent:
    'A /brag page is a quick snapshot of who you are, what you’re up to, and what you’re proud of.',
  episodeLabel: 'Episode 132 of Mostly Technical',
  episodeUrl: 'https://youtu.be/4_UDsQ_I7vQ',
};

export const bragClippings: BragClipping[] = [
  {
    publication: 'The Mac Desk',
    dateline: 'May 2026',
    headline: 'First Mac Apps, Built with AI',
    summary:
      'It started when another Mac app crashed on me—I built Binky and Dinky with Claude and Cursor, my first shipped Mac apps. Both within weeks would get 200+ stars on GitHub.',
    href: '/projects/binky/',
    preview: [
      {
        src: '/assets/images/projects/binky-sorting-2.webp',
        alt: 'Binky sorting files in the Downloads folder',
        href: '/projects/binky/',
        caption: 'Binky',
      },
      {
        src: '/assets/images/projects/dinky-og.png',
        alt: 'Dinky file compression app on macOS',
        href: '/projects/dinky/',
        caption: 'Dinky',
      },
      {
        variant: 'posts',
        alt: 'Mac app posts on X',
        favoritePosts: [
          {
            title: 'Binky sorting animation',
            href: 'https://x.com/heyderekj/status/2051669495995912305',
            likes: '1.5k',
            external: true,
          },
          {
            title: 'Dinky 2.0',
            href: 'https://x.com/heyderekj/status/2044789183613460545?s=20',
            likes: '455',
            external: true,
          },
        ],
      },
    ],
  },
  {
    publication: 'Church & Code',
    dateline: '2024 — NOW',
    headline: 'Faith-Tech Side Projects',
    summary:
      'Harvous is the Bible app I dogfood—threads, scripture, cross-refs, and group sharing. 3,685+ commits, early access at harvous.com. Here’s My Church indexed 256k+ churches on day one.',
    href: '/projects/harvous/',
    preview: [
      {
        src: '/assets/images/projects/harvous-preview.webp',
        alt: 'Harvous Bible study notes app',
        href: '/projects/harvous/',
        caption: 'Harvous',
      },
      {
        src: '/assets/images/projects/heresmychurch-og.png',
        alt: "Here's My Church interactive map",
        href: '/projects/heres-my-church/',
        caption: "Here's My Church",
      },
      {
        variant: 'posts',
        alt: 'Faith-tech posts on X',
        favoritePosts: [
          {
            title: 'The 48 hour project',
            href: '/posts/2026-03-22-the-48-hour-project/',
            date: '2026-03-22',
          },
          {
            title: 'I accidentally made a free crowdsourced database of churches in America.',
            href: 'https://x.com/heyderekj/status/2030730217140994310',
            likes: '137',
            external: true,
          },
          {
            title: 'Splash page',
            href: 'https://x.com/heyderekj/status/1993165228700209195',
            likes: '476',
            external: true,
          },
          {
            title: 'Button animation',
            href: 'https://x.com/heyderekj/status/1893052042295287981',
            likes: '785',
            external: true,
          },
          {
            title: 'The Bible notes app I’ve been making',
            href: 'https://x.com/heyderekj/status/1884366451118858554',
            likes: '686',
            external: true,
          },
          {
            title: 'My church I once designed for',
            href: '/posts/2022-01-06-my-church-i-once-designed-for/',
            date: '2022-01-06',
          },
        ],
      },
    ],
  },
  {
    publication: 'The Client Desk',
    dateline: '2023 — 2025',
    headline: 'Marketing Sites That Scale',
    summary:
      'Claimable through Kem Design—marketing and engineering praised the Mast build for easy new pages. For Scenery I did brand, logo, and site before Adobe acquired them.',
    href: '/work/claimable/',
    preview: [
      {
        src: '/images/work/claimable/thumbnail.webp',
        alt: 'Claimable marketing website',
        href: '/work/claimable/',
        caption: 'Claimable',
      },
      {
        src: '/images/work/scenery/thumbnail.webp',
        alt: 'Scenery video editor website',
        href: '/work/scenery/',
        caption: 'Scenery',
      },
    ],
    testimonial: barrettJohnsonTestimonial,
  },
  {
    publication: 'The Builder’s Journal',
    dateline: '2008 — 2026',
    headline: 'Learning by Doing',
    summary:
      'Apple Retail, then design lead at a large church, then indie full-time in 2020. Since then: Kem, clients, my own apps, open source, and family—still chasing rectangles that matter.',
    href: '/about/',
    preview: {
      variant: 'stats',
      alt: 'Project count',
      href: '/projects/',
      linkLabel: 'All projects',
      aggregateProjects: true,
    },
  },
  {
    publication: 'The First Client',
    dateline: '2010',
    headline: 'A $100 Logo for Chris Ducker',
    summary:
      'The year was 2010. I was still in college playing in Sketch. Business man across the pond, Chris Ducker, would pay me $100 for a logo he still uses today (slightly revised).',
    href: '/about/',
    preview: {
      variant: 'link',
      alt: 'First client project',
      href: 'https://www.chrisducker.com/',
      linkLabel: 'chrisducker.com',
    },
  },
  {
    publication: 'Iowa State Daily',
    dateline: '2010 — 2014',
    headline: 'Name in the Paper',
    summary:
      'I was a columnist for the Iowa State Daily. I wrote about Apple, social media, and campus life. It started the habit of publishing in public—before design blogs, clients, or my own site.',
    href: 'https://iowastatedaily.com/staff_name/derek-jensen/',
    preview: {
      variant: 'link',
      alt: 'Iowa State Daily writing',
      href: 'https://iowastatedaily.com/staff_name/derek-jensen/',
      linkLabel: 'Articles at Iowa State Daily',
    },
  },
  {
    publication: 'The Public Feed',
    dateline: 'Ongoing',
    headline: 'Posts That Landed',
    summary:
      'I write about dogfooding AI, faith apps that wow, and making rectangles. A SimCity post hit 883 likes and 30k+ views. Honest shipping and reflection is what lands.',
    href: '/posts/',
    preview: {
      variant: 'posts',
      alt: 'Favorite posts',
      favoritePosts: [
        {
          title: 'The AI Checkbox Fallacy',
          href: '/posts/2025-03-01-the-ai-checkbox-fallacy/',
          date: '2025-03-01',
        },
        {
          title: 'Faith apps deserve a wow',
          href: '/posts/2026-02-15-faith-apps-deserve-a-wow/',
          date: '2026-02-15',
        },
        {
          title: 'Goodbye to Webflow for my personal site',
          href: 'https://x.com/heyderekj/status/2047861332758650989',
          likes: '380',
          external: true,
        },
        {
          title: 'SimCity 3000 nostalgia',
          href: 'https://x.com/heyderekj/status/2038750666714182107',
          likes: '882',
          external: true,
        },
        {
          title: "Predicting Max Verstappen's retirement",
          href: 'https://x.com/heyderekj/status/1939330079362040099',
          likes: '1.3k',
          external: true,
        },
      ],
    },
  },
];
