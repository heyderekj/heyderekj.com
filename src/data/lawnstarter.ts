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
    'I’m applying for the Senior Webflow Designer role because this is the type of work I already do with various other marketing teams and would like to focus on one.',
    'I’ve been in Webflow since 2018 and full-time on marketing sites since 2020, mostly with Kem Design across local businesses, startups, and health tech. I usually start in Figma for a fast first pass, then iterate in the Designer. Lately that’s meant Mast-based component libraries and CMS structures built for scale. For example, at Claimable, marketing demoed a new medication landing page in front of engineering, and it held because the templates and collections were built for it.',
    'What I like most about LawnStarter (something I confirmed with Rachel Vorm) is your small and nimble team. Something I really respect.',
  ],
};

/** LawnStarter-tuned brag feed — same cards as About, copy aimed at this role. */
export const lawnstarterClippings: BragClipping[] = [
  {
    publication: 'Webflow',
    dateline: '2018 — now',
    headline: 'Figma first, then build in Webflow',
    summary:
      'Started in Webflow in 2018; full-time on marketing sites since 2020. Local businesses, startups, and nonprofits—typically 5–15 pages that grow into larger CMS when marketing teams need more.',
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
    publication: 'Using Mast',
    dateline: '2023 — now',
    headline: 'Marketing sites that scale fast',
    summary:
      'At Claimable, marketing demoed a new medication landing page in front of engineering—in minutes, not hours or days. Mast framework on a 12-column grid: reusable blocks so the same build logic could be applied to multiple brands.',
    summaryLinks: [{ text: 'Mast framework', href: 'https://www.nocodesupply.co/mast' }],
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
    publication: 'Custom Code',
    dateline: '',
    headline: 'Webflow and custom code with AI',
    summary:
      'When native Webflow isn’t enough, I use Claude and Cursor to draft custom JS and CSS—AI Explorer’s BIOS-style page shipped in about ten hours. On Matter, that meant custom sliders and marketing form logic not native to Webflow.',
    preview: [
      {
        src: '/images/work/ai-explorer/gallery-01.png',
        alt: 'AI Explorer BIOS-style landing page with custom code',
        href: '/work/ai-explorer/',
        caption: 'AI Explorer',
      },
      {
        src: '/images/work/matter/gallery-01.webp',
        alt: 'Matter sales landing page in Webflow',
        href: '/work/matter/',
        caption: 'Matter',
      },
    ],
  },
];
