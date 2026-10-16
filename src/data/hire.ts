/**
 * Work with me (/hire/): what I offer, what it costs, and when I'm free. Every number on the page,
 * in the live estimate and in the request function (functions/api/hire.ts) comes from here, so this
 * is the one place to change a price. The starting points follow my contracts: $100 an hour,
 * a site from $1,600 for its first page and $400 for each after, plus $600 for a CMS (Agape Homes: six
 * pages with listings, 1,600 + 5 × 400 + 600 = $4,200),
 * a $500/mo retainer for 5 hours, and 40% to start, 40% at design approval, 20% at launch.
 */

/** Shown at the top of /hire/, in the home page's chip and the bar menu: open or not, and from when (a date, or 'now').
 *  When Notion is connected (functions/api/availability.ts), the date comes from my projects instead; this is the fallback.
 *  Agape Development launches about Dec 11, plus a week. */
export const availability = { open: true, from: '2026-12-18' as string };
/** The date as people read it: "Dec 18" */
export const availabilityWhen = availability.from === 'now' ? 'now' : new Date(`${availability.from}T12:00:00Z`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
export const availabilityLine = availability.open ? (availability.from === 'now' ? 'Taking projects now' : `Taking projects from ${availabilityWhen}`) : 'Booked up for now';

/**
 * How much of my week goes to freelance work. Every booked project (Agape now, anything else in Notion)
 * comes out of these hours, so a new one starts when they free up, and its timeline is paced by them:
 * an estimate's hours (its price at RATE) spread over this many hours a week.
 */
export const CAPACITY = { hoursPerWeek: 20 };

export const RATE = 100; // per hour, for anything beyond the scope (like a fifth round of revisions)

export const PRICES = {
  site: {
    /** The first page (with the setup every site needs), then each page after it */
    base: 1600,
    perPage: 400,
    minPages: 1,
    maxPages: 20,
    cms: 600, // posts, listings, a team page: content they can update themselves
    /** Design only, or building from someone else's designs */
    scope: { both: 1, design: 0.5, build: 0.6 },
  },
  // From $250 (a refresh); a new one by what it includes. Drafts between those, to adjust
  logo: { new: { wordmark: 400, mark: 600, both: 800 }, refresh: 250 },
  /**
   * Rebrands are brand sprints: a week of my freelance hours (20 × $100) on the brand. One sprint is the
   * core identity: logo, type, color and a short guide (my CrowdHealth concept took a few days). More
   * sprints put it to work (templates, social, a fuller guide) and leave room for more directions.
   */
  rebrand: { sprint: 2000 },
  // By the hour: written notes take about two, a call about one
  feedback: { rate: 125, hours: { notes: 2, call: 1 } },
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
  // Brand sprints, each paid as it starts (lib/estimate.ts writes the steps for the number of sprints)
  sprints: { why: 'Paid by the sprint: each one when it starts.', steps: [] },
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
  { id: 'site', name: 'Websites', icon: 'laptop', line: 'Designed and built in Webflow or custom code, with content your team can update. Two rounds of revisions in design, two in the build.', from: `from $${PRICES.site.base.toLocaleString()}`, tags: ['design', 'work'] },
  { id: 'logo', name: 'Logos', icon: 'pencil', line: 'A mark or wordmark that fits who you are, with the files you need for everything.', from: `from $${PRICES.logo.refresh.toLocaleString()}`, tags: ['branding'] },
  { id: 'rebrand', name: 'Rebrands', icon: 'palette', line: 'Week-long brand sprints: logo, type, color and a short guide, so everything starts to feel like the same place.', from: `$${PRICES.rebrand.sprint.toLocaleString()} a sprint`, tags: ['branding'] },
  { id: 'feedback', name: 'Feedback', icon: 'eye', line: 'A careful look at your site, app or brand: what’s working, what isn’t, and what I’d do next.', from: `$${PRICES.feedback.rate}/hr`, tags: ['design'] },
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
/** `perPage`: the price is for each page of the site (lib/estimate.ts extraPrice) */
export const EXTRAS: { id: string; service: ServiceId; name: string; desc: string; price: number; perPage?: boolean }[] = [
  { id: 'site.copy', service: 'site', name: 'Help with the words', desc: 'Writing or editing the copy with you, page by page.', price: 150, perPage: true },
  { id: 'site.move', service: 'site', name: 'Moving your content over', desc: 'Posts, listings or pages from your current site.', price: 400 },
  { id: 'site.seo', service: 'site', name: 'Search and analytics', desc: 'Titles, redirects, a sitemap and analytics, set up.', price: 300 },
  { id: 'logo.kit', service: 'logo', name: 'Social and icon kit', desc: 'Avatars, a favicon and app icons from the new logo.', price: 200 },
  { id: 'logo.motion', service: 'logo', name: 'A little motion', desc: 'An animated version for video and the web.', price: 400 },
  { id: 'feedback.followup', service: 'feedback', name: 'A second look', desc: 'Another review after you’ve made changes, about an hour.', price: 125 },
  { id: 'ai.handoff', service: 'ai', name: 'Docs and a walkthrough', desc: 'So your team can run it and change it without me.', price: 300 },
];

/** The testimonials on /hire/, strongest first: clients on the work itself, then what came of it, then the craft */
export const SAID_ORDER = ['Barrett Johnson', 'Josh Pigford', 'Corey Moen', 'Shelley Martin', 'Danny Begnoche'];

/**
 * The budgets people can pick, by their top. An estimate more than STRETCH past the top won't meet it,
 * so the form says so and offers ways to get closer (lib/estimate.ts budgetGap).
 */
export const BUDGETS: Record<string, number> = { 'Under $2k': 2000, '$2–5k': 5000, '$5–10k': 10000, '$10k+': Infinity };
export const BUDGET_STRETCH = 1.3;
