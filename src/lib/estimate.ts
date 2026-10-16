/**
 * The estimate for a /hire/ request, from its answers: one scope line per service, a total, anything
 * monthly, and how the payments split. Pure (no DOM, no Astro), so the page, the form
 * (client/hire.ts) and the request function (functions/api/hire.ts) all price it the same way;
 * the function recalculates rather than trusting the browser's number.
 */
import { BUDGETS, BUDGET_STRETCH, CAPACITY, EXTRAS, PAY_LARGE, PAY_SMALL, PLANS, PRICES, RATE, RETAINER_TERMS, RUSH_DEPOSIT, SERVICES, TIMELINE, type ServiceId } from '../data/hire';

export interface Answers {
  services: ServiceId[];
  site?: { kind: 'new' | 'redesign'; pages: number; cms: boolean; scope: 'both' | 'design' | 'build'; platform: 'webflow' | 'open' };
  logo?: { kind: 'new' | 'refresh'; type: 'wordmark' | 'mark' | 'both' };
  rebrand?: { has: 'keepLogo' | 'full'; sprints: '1' | '2' | '3' };
  feedback?: { on: 'site' | 'app' | 'brand'; how: 'notes' | 'call' };
  ai?: { kind: 'workflow' | 'tool' | 'prototype'; size: 'small' | 'medium' | 'large' };
  retainer?: boolean;
  timeline?: keyof typeof TIMELINE;
  /** Extras picked (ids from EXTRAS), only for the services chosen */
  extras?: string[];
}

/** step: the form screen where this line's answers live, so the proposal can open it */
export interface Line { title: string; desc: string; price: number; unit?: '/hr' | '/mo'; step?: string }
/** plan: which of PLANS it's paid by; terms: why, in a sentence or two, for the proposal */
export interface Estimate { lines: Line[]; total: number; monthly: number; plan: string; terms: string; payments: { when: string; pct: number; amount: number; after: string }[] }

export const DEFAULTS = {
  site: { kind: 'new', pages: 5, cms: false, scope: 'both', platform: 'webflow' },
  logo: { kind: 'new', type: 'both' },
  rebrand: { has: 'full', sprints: '1' },
  feedback: { on: 'site', how: 'notes' },
  ai: { kind: 'workflow', size: 'small' },
} as const;

const round50 = (n: number) => Math.round(n / 50) * 50;
export const money = (n: number) => `$${Math.round(n).toLocaleString('en-US')}`;
const pick = <T extends string>(v: unknown, ok: readonly T[], d: T): T => (ok.includes(v as T) ? (v as T) : d);

/** Answers from anywhere (a form, a JSON body) made safe: known services, known options, sane numbers */
export function clean(raw: unknown): Answers {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, Record<string, unknown> | unknown>;
  const ids = SERVICES.map((s) => s.id);
  const services = Array.isArray(r.services) ? [...new Set(r.services.filter((s): s is ServiceId => ids.includes(s as ServiceId)))] : [];
  const o = (k: string) => (r[k] && typeof r[k] === 'object' ? (r[k] as Record<string, unknown>) : {});
  const a: Answers = { services, retainer: r.retainer === true, timeline: pick(r.timeline, ['asap', 'soon', 'flexible'] as const, 'flexible') };
  a.extras = Array.isArray(r.extras) ? [...new Set(r.extras.filter((id): id is string => EXTRAS.some((x) => x.id === id && services.includes(x.service))))] : [];
  if (services.includes('site')) {
    const s = o('site'), pages = Math.round(Number(s.pages));
    a.site = {
      kind: pick(s.kind, ['new', 'redesign'] as const, DEFAULTS.site.kind), cms: s.cms === true,
      pages: Number.isFinite(pages) ? Math.min(PRICES.site.maxPages, Math.max(1, pages)) : DEFAULTS.site.pages,
      scope: pick(s.scope, ['both', 'design', 'build'] as const, DEFAULTS.site.scope), platform: pick(s.platform, ['webflow', 'open'] as const, DEFAULTS.site.platform),
    };
  }
  if (services.includes('logo')) { const s = o('logo'); a.logo = { kind: pick(s.kind, ['new', 'refresh'] as const, DEFAULTS.logo.kind), type: pick(s.type, ['wordmark', 'mark', 'both'] as const, DEFAULTS.logo.type) }; }
  if (services.includes('rebrand')) a.rebrand = { has: pick(o('rebrand').has, ['keepLogo', 'full'] as const, DEFAULTS.rebrand.has), sprints: pick(String(o('rebrand').sprints ?? ''), ['1', '2', '3'] as const, DEFAULTS.rebrand.sprints) };
  if (services.includes('feedback')) { const s = o('feedback'); a.feedback = { on: pick(s.on, ['site', 'app', 'brand'] as const, DEFAULTS.feedback.on), how: pick(s.how, ['notes', 'call'] as const, DEFAULTS.feedback.how) }; }
  if (services.includes('ai')) { const s = o('ai'); a.ai = { kind: pick(s.kind, ['workflow', 'tool', 'prototype'] as const, DEFAULTS.ai.kind), size: pick(s.size, ['small', 'medium', 'large'] as const, DEFAULTS.ai.size) }; }
  return a;
}

/** Pages an extra is priced on: the site's, as picked */
const extraPages = (a: Answers) => a.site?.pages ?? DEFAULTS.site.pages;
/** An extra's price for these answers: flat, or per page of the site */
export const extraPrice = (x: (typeof EXTRAS)[number], a: Answers) => (x.perPage ? x.price * extraPages(a) : x.price);

export function estimate(a: Answers): Estimate {
  const lines: Line[] = [];
  if (a.site) {
    const { pages, cms, scope, kind, platform } = a.site, P = PRICES.site, n = Math.max(P.minPages, pages);
    const what = scope === 'design' ? 'Design' : scope === 'build' ? 'Build from your designs' : 'Design and build';
    lines.push({
      title: `${kind === 'redesign' ? 'Website redesign' : 'New website'}`,
      desc: `${what} across ${pages} page${pages === 1 ? '' : 's'}${platform === 'webflow' ? ' on Webflow' : ''}${cms ? ', with a CMS your team can update' : ''}.${pages < P.minPages ? ` Priced at the ${P.minPages}-page minimum.` : ''}${scope !== 'build' ? ' Two rounds of revision in design and two in the build.' : ' Two rounds of revision in the build.'}`,
      price: round50((P.base + (n - 1) * P.perPage) * P.scope[scope] + (cms ? P.cms * (scope === 'design' ? 0.5 : 1) : 0)),
      step: 'site',
    });
  }
  if (a.logo) {
    const { kind, type } = a.logo;
    lines.push(kind === 'refresh'
      ? { title: 'Logo refresh', desc: 'Tightening what you have: proportions, spacing and a cleaner set of files. Two rounds of revision.', price: PRICES.logo.refresh, step: 'logo' }
      : { title: `New logo`, desc: `${type === 'wordmark' ? 'A wordmark' : type === 'mark' ? 'A mark' : 'A mark and a wordmark'}, from a few directions down to one. Two rounds of revision, and every file you’ll need.`, price: PRICES.logo.new[type], step: 'logo' });
  }
  if (a.rebrand) {
    const n = Number(a.rebrand.sprints), core = a.rebrand.has === 'keepLogo' ? 'type, color and a short guide around the logo you have' : 'a logo, type, color and a short guide';
    lines.push({
      title: `Brand sprint${n > 1 ? 's' : ''} × ${n}`,
      desc: `A week each. The first gets ${core}.${n > 1 ? ' The second puts it to work: templates, social and a fuller guide.' : ''}${n > 2 ? ' The third leaves room for more directions and more of it in use.' : ''}`,
      price: n * PRICES.rebrand.sprint, step: 'rebrand',
    });
  }
  if (a.feedback) {
    const on = { site: 'your site', app: 'your app', brand: 'your brand' }[a.feedback.on];
    lines.push({ title: 'Feedback', desc: a.feedback.how === 'call' ? `An hour-long call walking through ${on}, after I’ve spent time with it first. $${PRICES.feedback.rate}/hr.` : `A careful look at ${on}, written up: what’s working, what isn’t, and what I’d do next. About ${PRICES.feedback.hours.notes} hours at $${PRICES.feedback.rate}/hr.`, price: PRICES.feedback.rate * PRICES.feedback.hours[a.feedback.how], step: 'feedback' });
  }
  if (a.ai) {
    const kind = { workflow: 'An AI workflow or automation', tool: 'An internal tool with AI in it', prototype: 'A first version of an app' }[a.ai.kind];
    const hrs = Math.round(PRICES.ai[a.ai.size] / RATE);
    lines.push({ title: { workflow: 'AI workflow', tool: 'AI tool', prototype: 'App prototype' }[a.ai.kind], desc: `${kind}, ${a.ai.size} in scope (about ${hrs} hours).${a.ai.size === 'large' ? ' Large ones get scoped together before a final number.' : ''}`, price: PRICES.ai[a.ai.size], step: 'ai' });
  }
  // Extras, under the service they belong to
  for (const x of EXTRAS) if (a.extras?.includes(x.id)) lines.push({ title: x.name, desc: x.perPage ? `${x.desc} ${extraPages(a)} pages at $${x.price} each.` : x.desc, price: extraPrice(x, a), step: x.service });
  // Starting right away moves other work around
  const rush = TIMELINE[a.timeline ?? 'flexible'].rush, core = lines.reduce((t, l) => t + l.price, 0);
  if (rush && core) lines.push({ title: 'Starting right away', desc: `A ${Math.round(rush * 100)}% rush, for moving other work around to begin within a few weeks.`, price: round50(core * rush), step: 'timing' });
  // Sprints are time-boxed, so only sites and logos count rounds of revision
  if (lines.length && (a.site || a.logo)) {
    lines.push({ title: 'More than the included revisions', desc: 'Any round beyond what’s included above.', price: RATE, unit: '/hr' });
  }
  if (a.retainer) {
    lines.push({ title: 'Monthly retainer', desc: `${PRICES.retainer.hours} hours a month for updates, fixes and new pages after launch.`, price: PRICES.retainer.monthly, unit: '/mo', step: 'timing' });
  }
  const total = lines.filter((l) => !l.unit).reduce((t, l) => t + l.price, 0);
  const monthly = lines.filter((l) => l.unit === '/mo').reduce((t, l) => t + l.price, 0);
  const plan = payPlan(a, lines, total), sprints = Number(a.rebrand?.sprints ?? 1);
  // Sprints: one is half to book and half when it wraps; more are each paid as they start
  const steps = plan !== 'sprints' ? PLANS[plan].steps.map((x) => ({ ...x }))
    : sprints === 1 ? [{ pct: 50, when: 'To book the sprint', after: 'is due' }, { pct: 50, when: 'When it wraps, the remaining', after: 'is due' }]
    : Array.from({ length: sprints }, (_, i) => ({ pct: Math.round(100 / sprints), when: i ? `At the start of sprint ${i + 1}` : 'To book the first sprint', after: 'is due' }));
  if (plan === 'sprints') steps[steps.length - 1].pct = 100 - steps.slice(0, -1).reduce((t, x) => t + x.pct, 0);
  // Starting right away moves some of the second payment into the deposit
  const asap = plan !== 'sprints' && a.timeline === 'asap' && steps.length > 1 && steps[0].pct < RUSH_DEPOSIT.upTo;
  if (asap) { const d = Math.min(RUSH_DEPOSIT.add, RUSH_DEPOSIT.upTo - steps[0].pct, steps[1].pct - 10); steps[0].pct += d; steps[1].pct -= d; }
  let left = total;
  const payments = steps.map((p, i) => {
    // Sprints split evenly to the dollar; the rest by percent, the last taking what's left
    const amount = i === steps.length - 1 ? left : plan === 'sprints' ? Math.round(total / steps.length) : Math.round((total * p.pct) / 100);
    left -= amount;
    return { when: p.when, pct: p.pct, amount, after: p.after };
  });
  const why = plan === 'sprints' && sprints === 1 ? 'One sprint: half to book it, half when it wraps.' : PLANS[plan].why;
  const terms = [total ? why : '', total && asap ? RUSH_DEPOSIT.why : '', monthly ? RETAINER_TERMS : ''].filter(Boolean).join(' ');
  return { lines, total, monthly, plan, terms, payments: total ? payments : [] };
}

/** Which way it gets paid: by the kind of work leading it, how it's scoped, and how big it is */
export function payPlan(a: Answers, lines: Line[], total: number): string {
  const work = a.services.filter((s) => s !== 'feedback');
  if (!work.length) return total < PAY_SMALL ? 'full' : 'halves';
  if (total < PAY_SMALL) return 'halves';
  const brand = a.logo || a.rebrand;
  if (a.site && brand) return 'brandSite';
  if (a.site) return a.site.scope === 'design' ? 'siteDesign' : a.site.scope === 'build' ? 'siteBuild' : total >= PAY_LARGE ? 'siteLarge' : 'site';
  // AI and brand work together: paid the way the bigger part is
  const sum = (steps: string[]) => lines.filter((l) => l.step && steps.includes(l.step)).reduce((t, l) => t + l.price, 0);
  if (a.ai && (!brand || sum(['ai']) >= sum(['logo', 'rebrand']))) return a.ai.size === 'large' ? 'aiLarge' : 'ai';
  return a.rebrand ? 'sprints' : 'brand';
}

// ---- When it happens

export interface Schedule { approveBy: string; steps: { title: string; when: string; desc?: string }[] }

const DAY = 86_400_000;
const at = (iso: string) => new Date(`${iso}T12:00:00Z`).getTime();
const iso = (t: number) => new Date(t).toISOString().slice(0, 10);
const plus = (d: string, days: number) => iso(at(d) + Math.round(days) * DAY);
/** The Monday on or after; the Friday nearest (phases start on Mondays and wrap up on Fridays) */
const monday = (d: string) => plus(d, (8 - new Date(at(d)).getUTCDay()) % 7);
const friday = (d: string) => { const w = new Date(at(d)).getUTCDay(); return plus(d, w === 6 ? -1 : w === 0 ? -2 : 5 - w); };
/** Christmas to New Year's is off: a phase that runs into it takes a week longer, and nothing starts in it */
const off = (d: string) => d.slice(5) >= '12-24' || d.slice(5) === '01-01';
const pastBreak = (from: string, to: string) => { for (let d = from; d <= to; d = plus(d, 1)) if (off(d)) return true; return false; };
/** "Sep 1" */
export const short = (d: string) => new Date(at(d)).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });

/**
 * A rough timeline, in the shape of my proposals: when it can start, and when each phase wraps up.
 * It starts when my freelance hours free up (`free`, from Notion or src/data/hire.ts), unless they asked
 * for right away (the rush moves other work aside), and is paced by those hours: the estimate's hours
 * spread over CAPACITY.hoursPerWeek, plus the time reviews take. Fit to Agape: Homes ($4,200) ran Sep 1,
 * design to Sep 18, build to Oct 2, launch Oct 8; Development ($12,700) Oct 13, Nov 13, Dec 4, Dec 11.
 */
export function schedule(a: Answers, e: Estimate, free: string, today: string): Schedule | null {
  if (!e.total) return null;
  // Feedback is a couple of hours, so it fits around booked work
  const fits = !a.services.some((x) => x !== 'feedback');
  const open = fits || free === 'now' || !/^\d{4}-\d{2}-\d{2}$/.test(free) || free < today ? today : free;
  const ready = { asap: plus(today, 14), soon: [open, plus(today, 21)].sort()[1], flexible: [open, plus(today, 7)].sort()[1] }[a.timeline ?? 'flexible'];
  let start = monday(a.timeline === 'asap' ? [ready, open].sort()[0] : ready);
  while (off(start) || pastBreak(start, plus(start, 4))) start = monday(plus(start, 7));
  const hours = (steps: string[]) => e.lines.filter((l) => !l.unit && l.step && steps.includes(l.step)).reduce((t, l) => t + l.price, 0) / RATE;
  const weeks = (h: number) => h / CAPACITY.hoursPerWeek;
  const steps: Schedule['steps'] = [];
  let t = start;
  const phase = (w: number) => {
    let end = friday(plus(t, w * 7));
    if (pastBreak(t, end)) end = friday(plus(end, 7));
    while (off(end)) end = friday(plus(end, 7));
    return (t = end);
  };

  const brand = a.logo || a.rebrand, W = weeks(hours(['site', 'logo', 'rebrand', 'ai', 'feedback']));
  if (brand && a.site) {
    const b = weeks(hours(['logo', 'rebrand'])), s = weeks(hours(['site']));
    if (a.rebrand) { const n = Number(a.rebrand.sprints); steps.push({ title: `Brand sprint${n > 1 ? 's' : ''}`, when: start, desc: `${n > 1 ? `${n} weeks, ` : 'A week, '}final files by ${short(phase(n - 3 / 7))}.` }); }
    else steps.push({ title: 'Brand kickoff', when: start, desc: `First directions by ${short(phase(Math.max(1.5, 0.4 * b + 1)))}, final files by ${short(phase(Math.max(1, 0.6 * b + 1)))}.` });
    const site = t = monday(plus(t, 1));
    steps.push({ title: 'Site kickoff', when: site, desc: `Design through ${short(phase(Math.max(2, 0.5 * s + 1.5)))}, build through ${short(phase(Math.max(1.5, 0.3 * s + 1.2)))}.` });
    steps.push({ title: 'Launch', when: phase(1) });
  } else if (a.site) {
    const scope = a.site.scope;
    if (scope === 'design') { steps.push({ title: 'Kickoff', when: start, desc: 'Designs for every page, ready to hand off.' }); steps.push({ title: 'Design handoff', when: phase(Math.max(2, W + 1)) }); }
    else if (scope === 'build') { steps.push({ title: 'Kickoff', when: start, desc: `Build through ${short(phase(Math.max(1.5, W + 1)))}.` }); steps.push({ title: 'Launch', when: phase(1) }); }
    else { steps.push({ title: 'Kickoff', when: start, desc: `Design through ${short(phase(Math.max(2, 0.5 * W + 1.5)))}, build through ${short(phase(Math.max(1.5, 0.3 * W + 1.2)))}.` }); steps.push({ title: 'Launch', when: phase(1) }); }
  } else if (a.rebrand) {
    // A sprint is a calendar week, Monday to Friday
    const n = Number(a.rebrand.sprints);
    for (let i = 1; i <= n; i++) steps.push({ title: `Sprint ${i}`, when: i === 1 ? start : plus(t, 3), desc: `Wraps ${short(phase(i === 1 ? 4 / 7 : 1))}${i === n ? ', with your final files' : ''}.` });
  } else if (brand) {
    steps.push({ title: 'Kickoff', when: start, desc: `First directions by ${short(phase(Math.max(1.5, 0.4 * W + 1)))}.` });
    steps.push({ title: 'Final files', when: phase(Math.max(1, 0.6 * W + 1)) });
  } else if (a.ai) {
    steps.push({ title: 'Kickoff', when: start, desc: `A first version to try by ${short(phase(Math.max(1, 0.6 * W + 1)))}.` });
    steps.push({ title: 'Handoff', when: phase(Math.max(1, 0.4 * W + 1)) });
  } else {
    steps.push({ title: a.feedback?.how === 'call' ? 'Our call' : 'Your notes', when: friday(plus(today, 7)), desc: 'Within a week of booking.' });
    return { approveBy: today, steps };
  }
  let approveBy = plus(start, -3);
  while (off(approveBy)) approveBy = plus(approveBy, -1);
  return { approveBy, steps };
}

// ---- When the budget won't cover it

/** A change to the answers, merged one level deep (so { site: { cms: false } } keeps the rest of site) */
export type Patch = Partial<{ [K in keyof Answers]: Answers[K] extends object | undefined ? Partial<NonNullable<Answers[K]>> : Answers[K] }>;
export const patched = <T extends Answers>(a: T, p: Patch): T => {
  const out = structuredClone(a) as T & Record<string, unknown>;
  for (const [k, v] of Object.entries(p)) out[k] = v && typeof v === 'object' && !Array.isArray(v) ? { ...(out[k] as object), ...v } : v;
  return out;
};

export interface Gap { top: number; total: number; ideas: { text: string; patch: Patch; total: number }[]; fits: boolean }

/**
 * When the estimate is well past their budget (more than BUDGET_STRETCH over its top), the ways to bring
 * it down, each with what it would come to, biggest saving first, and all of them together if that helps.
 */
export function budgetGap(a: Answers, budget: string): Gap | null {
  const top = BUDGETS[budget], total = estimate(a).total;
  if (!top || top === Infinity || total <= top * BUDGET_STRETCH) return null;
  const tries: { text: string; patch: Patch }[] = [];
  if (a.timeline === 'asap') tries.push({ text: 'Start when I’m free, without the rush', patch: { timeline: 'flexible' } });
  if (a.extras?.length) tries.push({ text: 'Leave out the extras for now', patch: { extras: [] } });
  if (a.site) {
    const P = PRICES.site;
    if (a.site.cms) tries.push({ text: 'Skip the CMS', patch: { site: { cms: false } } });
    if (a.site.scope === 'both') tries.push({ text: 'Design now, build later', patch: { site: { scope: 'design' } } });
    // The most pages that would fit, everything else as it is
    let n = a.site.pages;
    while (n > P.minPages && estimate(patched(a, { site: { pages: n } })).total > top) n--;
    if (n < a.site.pages) tries.push({ text: `Start with ${n} page${n === 1 ? '' : 's'}`, patch: { site: { pages: n } } });
  }
  if (a.rebrand && a.rebrand.sprints !== '1') tries.push({ text: 'One brand sprint to start', patch: { rebrand: { sprints: '1' } } });
  if (a.logo?.kind === 'new' && a.logo.type !== 'wordmark') tries.push({ text: 'A wordmark on its own', patch: { logo: { type: 'wordmark' } } });
  if (a.ai && a.ai.size !== 'small') tries.push({ text: `A ${a.ai.size === 'large' ? 'medium' : 'small'} first version`, patch: { ai: { size: a.ai.size === 'large' ? 'medium' : 'small' } } });
  const near = top * BUDGET_STRETCH, cost = (p: Patch) => estimate(clean(patched(a, p))).total;
  const ideas = tries.map((t) => ({ ...t, total: cost(t.patch) })).filter((t) => t.total < total).sort((x, y) => x.total - y.total);
  // If no one change gets close, stack them, biggest saving first, only until it does
  if (ideas.length > 1 && ideas[0].total > near) {
    let patch: Patch = {}, used: string[] = [], sum = total;
    for (const i of ideas) {
      patch = patched(patch as Answers, i.patch) as Patch; used.push(i.text[0].toLowerCase() + i.text.slice(1)); sum = cost(patch);
      if (sum <= near) break;
    }
    if (used.length > 1) ideas.unshift({ text: `Together, ${used.slice(0, -1).join(', ')} and ${used[used.length - 1]}`, patch, total: sum });
  }
  const top3 = ideas.slice(0, 3);
  return { top, total, ideas: top3, fits: top3.some((i) => i.total <= near) };
}
