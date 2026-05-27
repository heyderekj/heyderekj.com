/** Content for `/lawnstarter/` — curated for LawnStarter Growth team application. */

import type { BragClipping } from './brag';

export const lawnstarterMeta = {
  title: 'Derek Castelli — Webflow portfolio (LawnStarter)',
  description:
    'Webflow design systems, CMS at scale, and marketing sites—curated for the LawnStarter team.',
  ogImage: '/images/work/claimable/thumbnail.webp',
};

export const lawnstarterLetter = {
  to: 'LawnStarter',
  from: 'Derek Castelli',
  salutation: 'Hey LawnStarter team,',
  paragraphs: [
    'I’m applying for the Senior Webflow Designer role because it’s the work I already do—marketing sites in Webflow where a marketing team can ship landing pages and tests without a designer or engineer.',
    'I’ve been in Webflow since 2018 and full-time on marketing sites since 2020, mostly with Kem Design across local businesses, startups, and health tech. I usually start in Figma for a fast first pass, then iterate in the Designer. Lately that’s meant Mast-based component libraries and CMS structures built for scale—at Claimable, marketing demoed a new medication landing page in front of engineering, and it held because the templates and collections were built for it.',
    'What draws me to LawnStarter—something Rachel Vorm and I talked through—isn’t the size of the company. It’s how small and nimble the team is: a designer, Technical Growth Manager, and CRO Specialist in the same loop, moving fast when the system supports it. That’s the kind of team I do my best work with. The cards below are the proof.',
  ],
};

/** LawnStarter-tuned brag feed — same cards as About, copy aimed at this role. */
export const lawnstarterClippings: BragClipping[] = [
  {
    publication: 'Webflow',
    dateline: '2018 — now',
    headline: 'Design and build, not handoff',
    summary:
      'Started in Webflow in 2018; full-time on marketing sites since 2020. Local businesses, startups, and nonprofits—typically 5–15 pages that grow into larger CMS portfolios when Growth needs scale.',
    preview: [
      {
        src: '/images/work/david-energy/thumbnail.webp',
        alt: 'David Energy marketing website',
        href: '/work/david-energy/',
        caption: 'David Energy',
      },
      {
        src: '/images/work/scenery/thumbnail.webp',
        alt: 'Scenery video editor marketing site',
        href: '/work/scenery/',
        caption: 'Scenery',
      },
    ],
  },
  {
    publication: 'The growth desk',
    dateline: '2023 — 2025',
    headline: 'Marketing sites that scale',
    summary:
      'At Claimable, marketing demoed a new medication landing page in front of engineering—in minutes, not hours or days. Mast framework on a 12-column grid: reusable blocks so the same build logic could stretch across four brands the way Home Gnome, LawnStarter, Lawn Love, and ProBase share a foundation without drifting.',
    href: '/work/claimable/',
    preview: [
      {
        src: '/images/work/claimable/thumbnail.webp',
        alt: 'Claimable marketing website',
        href: '/work/claimable/',
        caption: 'Claimable',
      },
      {
        src: '/images/work/miravoice/thumbnail.png',
        alt: 'Miravoice marketing website',
        href: '/work/miravoice/',
        caption: 'Miravoice',
      },
    ],
  },
  {
    publication: 'Building fast',
    dateline: 'AI for assist',
    headline: 'Webflow first, code when it helps',
    summary:
      'Matter’s sales landing page went from Figma to live Webflow in a day. When native Webflow isn’t enough, I use Claude and Cursor to draft custom JS and CSS—AI Explorer’s BIOS-style page shipped in about ten hours.',
    preview: [
      {
        src: '/images/work/matter/gallery-01.webp',
        alt: 'Matter sales landing page in Webflow',
        href: '/work/matter/',
        caption: 'Matter · 1 day',
      },
      {
        src: '/images/work/ai-explorer/gallery-01.png',
        alt: 'AI Explorer BIOS-style landing page with custom code',
        href: '/work/ai-explorer/',
        caption: 'AI Explorer · custom JS',
      },
    ],
  },
];
