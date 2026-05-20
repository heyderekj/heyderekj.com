/** Content for `/brag/`. Edit here; layout lives in `src/pages/brag/index.astro`. */

export type BragFavoritePost = {
  title: string;
  href: string;
  /** ISO date for on-site posts */
  date?: string;
  /** Like count for X posts — rendered as “{likes} likes on X” */
  likes?: string;
  external?: boolean;
};

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

export type BragClipping = {
  publication: string;
  dateline: string;
  headline: string;
  /** Supporting copy — three complete lines at default width (~180 chars); no mid-sentence clamp */
  summary: string;
  href?: string;
  relatedLinks?: { label: string; href: string }[];
  /** One or more visual references (project shots, work thumbs, icons) */
  preview?: BragPreview | BragPreview[];
};

export const bragMeta = {
  title: 'Brag — Derek Castelli',
  description:
    'Selected wins as news clippings — macOS apps, faith-tech, Webflow client work, and writing.',
};

export const bragIntro =
  'Here are things I tell my best friends. Not a résumé — just things I wanna brag about...';

export const bragEpigraphNote =
  'I miss Robin. I’d like to think we’d be good friends if we ever met.';

export const bragCredit = {
  episodeLabel: 'Episode 132 of Mostly Technical',
  episodeUrl: 'https://youtu.be/4_UDsQ_I7vQ',
};

export const bragClippings: BragClipping[] = [
  {
    publication: 'The Mac Desk',
    dateline: 'May 2026',
    headline: 'Mac Apps That Ship',
    summary:
      'Binky sorts Downloads with rules; Dinky compresses images and PDFs. Sorting demos hit 1.4k+ likes and 180k+ views; Dinky 2.0 drew 455 likes and 300+ GitHub stars. Native Mac tools still win.',
    href: '/projects/binky/',
    relatedLinks: [
      { label: 'Binky', href: 'https://binkyfiles.com' },
      { label: 'Dinky', href: '/projects/dinky/' },
    ],
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
            title: 'Binky Downloads sorting',
            href: 'https://x.com/heyderekj/status/2051669495995912305',
            likes: '1.5k',
            external: true,
          },
          {
            title: 'Dinky 2.0 — website + smarter compression',
            href: 'https://x.com/heyderekj/status/2044833721748988188',
            likes: '455',
            external: true,
          },
        ],
      },
    ],
  },
  {
    publication: 'Faith & Code',
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
            title: 'Button animation',
            href: 'https://x.com/heyderekj/status/1893052042295287981',
            likes: '785',
            external: true,
          },
          {
            title: 'I accidentally made a free crowdsourced database of churches in America.',
            href: 'https://x.com/heyderekj/status/2030730217140994310',
            likes: '137',
            external: true,
          },
          {
            title: 'The Bible notes app I’ve been making',
            href: 'https://x.com/heyderekj/status/1884366451118858554',
            likes: '686',
            external: true,
          },
          {
            title: 'Splash page',
            href: 'https://x.com/heyderekj/status/1993165228700209195',
            likes: '476',
            external: true,
          },
        ],
      },
    ],
    relatedLinks: [
      { label: 'harvous.com', href: 'https://harvous.com' },
      { label: "Here's My Church", href: '/projects/heres-my-church/' },
    ],
  },
  {
    publication: 'Design Review',
    dateline: '2023 — 2025',
    headline: 'Webflow Client Wins',
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
    relatedLinks: [{ label: 'Scenery', href: '/work/scenery/' }],
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
          title: 'Faith apps deserve a wow',
          href: '/posts/2026-02-15-faith-apps-deserve-a-wow/',
          date: '2026-02-15',
        },
        {
          title: 'Dogfood or die because of AI',
          href: '/posts/2026-02-22-dogfood-or-die-because-of-ai/',
          date: '2026-02-22',
        },
        {
          title: 'Goodbye to Webflow for my personal site',
          href: 'https://x.com/heyderekj/status/2047861332758650989',
          likes: '380',
          external: true,
        },
        {
          title: "Predicting Max Verstappen's retirement",
          href: 'https://x.com/heyderekj/status/1939330079362040099',
          likes: '1.3k',
          external: true,
        },
        {
          title: 'SimCity 3000 nostalgia',
          href: 'https://x.com/heyderekj/status/2038750666714182107',
          likes: '882',
          external: true,
        },
      ],
    },
  },
  {
    publication: 'The Builder’s Journal',
    dateline: '2008 — 2026',
    headline: 'Learning by Playing',
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
    publication: 'Client Zero',
    dateline: '2010',
    headline: 'A $100 Logo for Chris Ducker',
    summary:
      'Chris Ducker was my first client—a $100 blog logo in college, 2010. Themeforest themes, design blogs, and a Daily opinion column followed. The mark’s refined; the core still shows.',
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
    headline: 'Opinion Column in the Student Paper',
    summary:
      'At Iowa State I wrote a Daily opinion column on Apple, social media, and campus life. It started the habit of publishing in public—before design blogs, clients, or my own site.',
    href: 'https://iowastatedaily.com/staff_name/derek-jensen/',
    preview: {
      variant: 'link',
      alt: 'Iowa State Daily writing',
      href: 'https://iowastatedaily.com/staff_name/derek-jensen/',
      linkLabel: 'Articles at Iowa State Daily',
    },
  },
];
