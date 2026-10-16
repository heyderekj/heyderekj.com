/**
 * Work with me (/hire/): what I offer, what it costs, and when I'm free. Every number on the page,
 * in the live estimate and in the request function (functions/api/hire.ts) comes from here, so this
 * is the one place to change a price. The starting points follow my contracts: $100 an hour,
 * $600 a page plus $600 for a CMS on a Webflow site (Agape Homes: six pages with listings, $4,200),
 * a $500/mo retainer for 5 hours, and 40% to start, 40% at design approval, 20% at launch.
 */

/** Shown at the top of /hire/ and in the home page's chip. Keep it short. */
export const availability = { open: true, line: 'Taking projects starting November' };

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

/** How payment splits, by the size of the project */
export const PAYMENT = {
  /** At or above this, three payments; below it, half and half */
  splitAt: 1500,
  big: [{ pct: 40, when: 'To start', after: 'is required upfront' }, { pct: 40, when: 'Then at design approval', after: 'is due' }, { pct: 20, when: 'To launch, the remaining', after: 'is due' }],
  small: [{ pct: 50, when: 'To start', after: 'is required upfront' }, { pct: 50, when: 'On delivery, the remaining', after: 'is due' }],
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

/** Posts that show how I think about this kind of work (slugs); topped up with the latest in these tags */
export const THINKING = { pinned: [] as string[], tags: ['work', 'design', 'branding', 'ai'], count: 4 };
/** Write-ups to show as samples, by service (slugs); otherwise the highlighted ones */
export const SAMPLES: Partial<Record<ServiceId, string[]>> = {};
