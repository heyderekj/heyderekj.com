/**
 * The estimate for a /hire/ request, from its answers: one scope line per service, a total, anything
 * monthly, and how the payments split. Pure (no DOM, no Astro), so the page, the form
 * (client/hire.ts) and the request function (functions/api/hire.ts) all price it the same way;
 * the function recalculates rather than trusting the browser's number.
 */
import { EXTRAS, PAYMENT, PRICES, RATE, SERVICES, TIMELINE, type ServiceId } from '../data/hire';

export interface Answers {
  services: ServiceId[];
  site?: { kind: 'new' | 'redesign'; pages: number; cms: boolean; scope: 'both' | 'design' | 'build'; platform: 'webflow' | 'open' };
  logo?: { kind: 'new' | 'refresh'; type: 'wordmark' | 'mark' | 'both' };
  rebrand?: { has: 'keepLogo' | 'full' };
  feedback?: { on: 'site' | 'app' | 'brand'; how: 'notes' | 'call' };
  ai?: { kind: 'workflow' | 'tool' | 'prototype'; size: 'small' | 'medium' | 'large' };
  retainer?: boolean;
  timeline?: keyof typeof TIMELINE;
  /** Extras picked (ids from EXTRAS), only for the services chosen */
  extras?: string[];
}

/** step: the form screen where this line's answers live, so the proposal can open it */
export interface Line { title: string; desc: string; price: number; unit?: '/hr' | '/mo'; step?: string }
export interface Estimate { lines: Line[]; total: number; monthly: number; payments: { when: string; pct: number; amount: number; after: string }[] }

export const DEFAULTS = {
  site: { kind: 'new', pages: 5, cms: false, scope: 'both', platform: 'webflow' },
  logo: { kind: 'new', type: 'both' },
  rebrand: { has: 'full' },
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
  if (services.includes('rebrand')) a.rebrand = { has: pick(o('rebrand').has, ['keepLogo', 'full'] as const, DEFAULTS.rebrand.has) };
  if (services.includes('feedback')) { const s = o('feedback'); a.feedback = { on: pick(s.on, ['site', 'app', 'brand'] as const, DEFAULTS.feedback.on), how: pick(s.how, ['notes', 'call'] as const, DEFAULTS.feedback.how) }; }
  if (services.includes('ai')) { const s = o('ai'); a.ai = { kind: pick(s.kind, ['workflow', 'tool', 'prototype'] as const, DEFAULTS.ai.kind), size: pick(s.size, ['small', 'medium', 'large'] as const, DEFAULTS.ai.size) }; }
  return a;
}

export function estimate(a: Answers): Estimate {
  const lines: Line[] = [];
  if (a.site) {
    const { pages, cms, scope, kind, platform } = a.site, P = PRICES.site, n = Math.max(P.minPages, pages);
    const what = scope === 'design' ? 'Design' : scope === 'build' ? 'Build from your designs' : 'Design and build';
    lines.push({
      title: `${kind === 'redesign' ? 'Website redesign' : 'New website'}`,
      desc: `${what} across ${pages} page${pages === 1 ? '' : 's'}${platform === 'webflow' ? ' on Webflow' : ''}${cms ? ', with a CMS your team can update' : ''}.${pages < P.minPages ? ` Priced at the ${P.minPages}-page minimum.` : ''}${scope !== 'build' ? ' Two rounds of revision in design and two in the build.' : ' Two rounds of revision in the build.'}`,
      price: round50(n * P.perPage * P.scope[scope] + (cms ? P.cms * (scope === 'design' ? 0.5 : 1) : 0)),
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
    lines.push(a.rebrand.has === 'keepLogo'
      ? { title: 'Rebrand, keeping your logo', desc: 'Type, color and a short guide built around the logo you have.', price: PRICES.rebrand.keepLogo, step: 'rebrand' }
      : { title: 'Full rebrand', desc: 'A new logo with the type, color and short guide around it, so everything feels like the same place.', price: PRICES.rebrand.full, step: 'rebrand' });
  }
  if (a.feedback) {
    const on = { site: 'your site', app: 'your app', brand: 'your brand' }[a.feedback.on];
    lines.push({ title: 'Feedback', desc: a.feedback.how === 'call' ? `An hour-long call walking through ${on}, after I’ve spent time with it first.` : `A careful look at ${on}, written up: what’s working, what isn’t, and what I’d do next.`, price: PRICES.feedback[a.feedback.how], step: 'feedback' });
  }
  if (a.ai) {
    const kind = { workflow: 'An AI workflow or automation', tool: 'An internal tool with AI in it', prototype: 'A first version of an app' }[a.ai.kind];
    const hrs = Math.round(PRICES.ai[a.ai.size] / RATE);
    lines.push({ title: { workflow: 'AI workflow', tool: 'AI tool', prototype: 'App prototype' }[a.ai.kind], desc: `${kind}, ${a.ai.size} in scope (about ${hrs} hours).${a.ai.size === 'large' ? ' Large ones get scoped together before a final number.' : ''}`, price: PRICES.ai[a.ai.size], step: 'ai' });
  }
  // Extras, under the service they belong to
  for (const x of EXTRAS) if (a.extras?.includes(x.id)) lines.push({ title: x.name, desc: x.desc, price: x.price, step: x.service });
  // Starting right away moves other work around
  const rush = TIMELINE[a.timeline ?? 'flexible'].rush, core = lines.reduce((t, l) => t + l.price, 0);
  if (rush && core) lines.push({ title: 'Starting right away', desc: `A ${Math.round(rush * 100)}% rush, for moving other work around to begin within a few weeks.`, price: round50(core * rush), step: 'timing' });
  if (lines.length && (a.site || a.logo || a.rebrand)) {
    lines.push({ title: 'More than the included revisions', desc: 'Any round beyond what’s included above.', price: RATE, unit: '/hr' });
  }
  if (a.retainer) {
    lines.push({ title: 'Monthly retainer', desc: `${PRICES.retainer.hours} hours a month for updates, fixes and new pages after launch.`, price: PRICES.retainer.monthly, unit: '/mo', step: 'timing' });
  }
  const total = lines.filter((l) => !l.unit).reduce((t, l) => t + l.price, 0);
  const monthly = lines.filter((l) => l.unit === '/mo').reduce((t, l) => t + l.price, 0);
  const plan = PAYMENT.find((p) => total < p.under)!.steps;
  let left = total;
  const payments = plan.map((p, i) => {
    const amount = i === plan.length - 1 ? left : Math.round((total * p.pct) / 100);
    left -= amount;
    return { when: p.when, pct: p.pct, amount, after: p.after };
  });
  return { lines, total, monthly, payments: total ? payments : [] };
}
