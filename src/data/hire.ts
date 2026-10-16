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

/**
 * How a project gets paid, picked from what it is, never by the client: each payment lands where the work
 * changes hands. The estimate says which plan and why (lib/estimate.ts, payPlan()).
 */
type Step = { pct: number; when: string; after: string };
const start = (pct: number): Step => ({ pct, when: 'To start', after: 'is required upfront' });
export const PLANS: Record<string, { why: string; steps: Step[] }> = {
  // Feedback on its own
  full: { why: 'It’s a short piece of work, so it’s paid when you book it.', steps: [{ pct: 100, when: 'To book it', after: 'is due' }] },
  // Anything small, whatever the kind
  halves: { why: 'A smaller project: half to start, half when it’s done.', steps: [start(50), { pct: 50, when: 'On delivery, the remaining', after: 'is due' }] },
  brand: { why: 'Brand work is paid as it moves: when we start, when you pick a direction, and with the final files.', steps: [start(40), { pct: 40, when: 'When you pick a direction', after: 'is due' }, { pct: 20, when: 'With the final files, the remaining', after: 'is due' }] },
  site: { why: 'Paid in three parts, at the points where the work changes hands.', steps: [start(40), { pct: 40, when: 'Then at design approval', after: 'is due' }, { pct: 20, when: 'To launch, the remaining', after: 'is due' }] },
  siteLarge: { why: 'A bigger build, so it’s split into four smaller payments.', steps: [start(30), { pct: 30, when: 'Then at design approval', after: 'is due' }, { pct: 30, when: 'At build review', after: 'is due' }, { pct: 10, when: 'To launch, the remaining', after: 'is due' }] },
  siteDesign: { why: 'Design only: half to start, half when the designs are handed off.', steps: [start(50), { pct: 50, when: 'At design handoff, the remaining', after: 'is due' }] },
  siteBuild: { why: 'Built from your designs: half to start, half at launch.', steps: [start(50), { pct: 50, when: 'To launch, the remaining', after: 'is due' }] },
  brandSite: { why: 'The brand comes first, then the site, and each is paid as it’s approved.', steps: [start(30), { pct: 30, when: 'When the brand is approved', after: 'is due' }, { pct: 30, when: 'Then at site design approval', after: 'is due' }, { pct: 10, when: 'To launch, the remaining', after: 'is due' }] },
  ai: { why: 'Paid as it becomes real: to start, when you can use a first version, and at handoff.', steps: [start(40), { pct: 40, when: 'When the first version works for you', after: 'is due' }, { pct: 20, when: 'At handoff, the remaining', after: 'is due' }] },
  aiLarge: { why: 'A bigger build, paid as it becomes real, in four parts.', steps: [start(30), { pct: 30, when: 'When the first version works for you', after: 'is due' }, { pct: 30, when: 'After we’ve tested it together', after: 'is due' }, { pct: 10, when: 'At handoff, the remaining', after: 'is due' }] },
};
/** Under this, any project is paid in halves; at this and up, a site is paid in four parts */
export const PAY_SMALL = 1500, PAY_LARGE = 10000;
/** Starting right away takes a bigger deposit (up to half) to hold the time */
export const RUSH_DEPOSIT = { add: 10, upTo: 50, why: 'Starting right away takes a larger deposit to hold the time.' };
/** The retainer, after the project */
export const RETAINER_TERMS = 'The retainer is billed at the start of each month, beginning the month after launch.';

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

/** Examples for each service: a site write-up (its first shot) or one of my apps (its icon, or its picture). Shown in this
 *  order, so lead with the strongest: the first four make the stack, and all of them the strip you can scroll on hover. */
export type Example = { work: string } | { app: string; show?: 'icon' | 'image' };
export const EXAMPLES: Record<ServiceId, Example[]> = {
  site: ['throne', 'care-continuity', 'exodus51', 'revisemy', 'claimable', 'harvouscom', 'eternity-church-2', 'river-valley-church', 'ccc-omaha', 'david-energy'].map((work) => ({ work })),
  // Logos for Josh Pigford's projects, and my own apps' icons
  logo: [{ app: 'harvous', show: 'icon' }, { work: 'namesnag' }, { app: 'revisemy', show: 'icon' }, { work: 'revise-dev' }, { work: 'linkscout' }, { work: 'schemakit' }],
  rebrand: [{ work: 'crowdhealth' }, { work: 'scenery' }, { work: 'bowen-design-and-print' }],
  // Consulting: no examples, so these show as short rows
  feedback: [],
  ai: [],
};

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

/** The testimonials on /hire/, strongest first: clients on the work itself, then what came of it, then the craft */
export const SAID_ORDER = ['Barrett Johnson', 'Josh Pigford', 'Corey Moen', 'Shelley Martin', 'Danny Begnoche'];
