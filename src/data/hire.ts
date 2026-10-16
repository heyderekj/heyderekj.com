/**
 * Work with me (/hire/): what I offer, what it costs, and when I'm free. Every number on the page,
 * in the live estimate and in the request function (functions/api/hire.ts) comes from here, so this
 * is the one place to change a price. The starting points follow my contracts: $100 an hour,
 * $600 a page plus $600 for a CMS on a Webflow site (Agape Homes: six pages with listings, $4,200),
 * a $500/mo retainer for 5 hours, and 40% to start, 40% at design approval, 20% at launch.
 */

/** Shown at the top of /hire/, in the home page's chip and the bar menu: open or not, and from when (a month, or 'now').
 *  When Notion is connected (functions/api/availability.ts), the date comes from my projects instead; this is the fallback. */
export const availability = { open: true, from: 'November' };
export const availabilityLine = availability.open ? (availability.from === 'now' ? 'Taking projects now' : `Taking projects from ${availability.from}`) : 'Booked up for now';

export const RATE = 100; // per hour, for anything beyond the scope (like a fifth round of revisions)

export const PRICES = {
  site: {
    perPage: 600,
    minPages: 3,
    maxPages: 20,
    cms: 600, // posts, listings, a team page: content they can update themselves
    /** Design only, or building from someone else's designs */
    scope: { both: 1, design: 0.5, build: 0.6 },
  },
  logo: { new: { wordmark: 900, mark: 1200, both: 1200 }, refresh: 800 },
  rebrand: { keepLogo: 2000, full: 3000 },
  feedback: { notes: 200, call: 200 },
  ai: { small: 1000, medium: 2500, large: 5000 },
  retainer: { monthly: 500, hours: 5 },
} as const;

/** How payment splits, by the size of the project: the first tier it's under. Every proposal spells this out. */
export const PAYMENT: { under: number; steps: { pct: number; when: string; after: string }[] }[] = [
  { under: 1500, steps: [{ pct: 50, when: 'To start', after: 'is required upfront' }, { pct: 50, when: 'On delivery, the remaining', after: 'is due' }] },
  { under: 10000, steps: [{ pct: 40, when: 'To start', after: 'is required upfront' }, { pct: 40, when: 'Then at design approval', after: 'is due' }, { pct: 20, when: 'To launch, the remaining', after: 'is due' }] },
  { under: Infinity, steps: [{ pct: 30, when: 'To start', after: 'is required upfront' }, { pct: 30, when: 'Then at design approval', after: 'is due' }, { pct: 30, when: 'At build review', after: 'is due' }, { pct: 10, when: 'To launch, the remaining', after: 'is due' }] },
];

/** When it starts. Starting right away means moving other work around, so it costs a little more. */
export const TIMELINE = {
  asap: { label: 'As soon as possible', short: 'ASAP', rush: 0.2 },
  soon: { label: 'In the next month or two', short: 'In 1–2 months', rush: 0 },
  flexible: { label: 'Whenever works', short: 'Flexible', rush: 0 },
} as const;

export type ServiceId = 'site' | 'logo' | 'rebrand' | 'feedback' | 'ai';

/** The five things I do, in the order they're offered */
export const SERVICES: { id: ServiceId; name: string; icon: string; line: string; from: string; tags: string[] }[] = [
  { id: 'site', name: 'Websites', icon: 'laptop', line: 'Designed and built in Webflow, with content your team can update. Two rounds of revisions in design, two in the build.', from: `from $${PRICES.site.perPage}/page`, tags: ['design', 'work'] },
  { id: 'logo', name: 'Logos', icon: 'pencil', line: 'A mark or wordmark that fits who you are, with the files you need for everything.', from: `from $${PRICES.logo.refresh.toLocaleString()}`, tags: ['branding'] },
  { id: 'rebrand', name: 'Rebrands', icon: 'palette', line: 'Logo, type, color and a short guide, so everything starts to feel like the same place.', from: `from $${PRICES.rebrand.keepLogo.toLocaleString()}`, tags: ['branding'] },
  { id: 'feedback', name: 'Feedback', icon: 'eye', line: 'A careful look at your site, app or brand: what’s working, what isn’t, and what I’d do next.', from: `$${PRICES.feedback.notes}`, tags: ['design'] },
  { id: 'ai', name: 'AI workflows & apps', icon: 'branch', line: 'Putting AI to work where it actually helps: an automation, an internal tool, or a first version of an app.', from: `from $${PRICES.ai.small.toLocaleString()}`, tags: ['ai', 'making'] },
];

/** Write-ups to show as samples, by service (slugs); otherwise the highlighted ones */
export const SAMPLES: Partial<Record<ServiceId, string[]>> = {};

/** Things a project can include beyond the core, by service (drafts: change freely) */
export const EXTRAS: { id: string; service: ServiceId; name: string; desc: string; price: number }[] = [
  { id: 'site.copy', service: 'site', name: 'Help with the words', desc: 'Writing or editing the copy with you, page by page.', price: 800 },
  { id: 'site.move', service: 'site', name: 'Moving your content over', desc: 'Posts, listings or pages from your current site.', price: 400 },
  { id: 'site.seo', service: 'site', name: 'Search and analytics', desc: 'Titles, redirects, a sitemap and analytics, set up.', price: 300 },
  { id: 'logo.kit', service: 'logo', name: 'Social and icon kit', desc: 'Avatars, a favicon and app icons from the new logo.', price: 200 },
  { id: 'logo.motion', service: 'logo', name: 'A little motion', desc: 'An animated version for video and the web.', price: 400 },
  { id: 'rebrand.templates', service: 'rebrand', name: 'Templates', desc: 'Slides, social posts and documents in the new look.', price: 600 },
  { id: 'feedback.followup', service: 'feedback', name: 'A second look', desc: 'Another review after you’ve made changes.', price: 150 },
  { id: 'ai.handoff', service: 'ai', name: 'Docs and a walkthrough', desc: 'So your team can run it and change it without me.', price: 300 },
];
