/**
 * Content for the home page's work deck, chips and previews: the websites (highlighted
 * work), the apps (Testament Made), and the pictures that stand for each.
 */
import { getCollection, type CollectionEntry } from 'astro:content';
import { getPublishedWork, type Work } from './work';
import { imgSrc } from './img';

type Project = CollectionEntry<'projects'>;

/** Testament Made's apps, in the order of its six-block mark, with each block's colour. */
export const TM_TILES: [slug: string, color: string][] = [
  ['harvous', '#1a8cff'], ['heres-my-church', '#7a3fc4'], ['revisemy', '#ffc53d'],
  ['koati', '#1fe06b'], ['dinky', '#3b28f6'], ['binky', '#f51d68'],
];
/** The order apps appear in the deck. */
const APP_ORDER = ['harvous', 'koati', 'revisemy', 'heres-my-church', 'dinky', 'binky'];
/** Highlighted work left out of the home deck (ReviseMy and Harvous already show in the apps half). */
const NOT_IN_DECK = ['revisemy', 'harvouscom', 'david-energy', 'tutorme', 'ai-explorer'];
/** The three Kem Design sites the Kem chip fans out, left to right. */
const KEM_FAN = ['care-continuity', 'throne', 'claimable'];
/** The websites the deck opens with, in this order; the rest follow newest first. */
const DECK_FIRST = ['throne', 'river-valley-church', 'scenery', 'exodus51'];

export const host = (u?: string | null) => { try { return u ? new URL(u).host.replace(/^www\./, '') : ''; } catch { return ''; } };

/** A page in a preview: a screenshot, or an app icon on its mesh. */
export type DeckPage = { src: string } | { mesh: string; icon: string };
export interface DeckSlide {
  kind: 'client' | 'app';
  slug: string;
  title: string;
  sub: string;
  url: string;
  pages: DeckPage[];
  link: { href: string; label: string; external: boolean };
  partner?: string | null;
}

/** A work entry's screenshots, first page first. */
export function shotsOf(w: Work): string[] {
  const d = w.data;
  return [d.thumbnail, ...(d.gallery ?? [])].filter((s): s is string => Boolean(s)).slice(0, 5);
}
export const shot = (src: string, w = 1280) => imgSrc(src, w);
export const workDate = (w: Work) => (w.data.dateCompleted ?? w.data.date);

export async function getApps(): Promise<Project[]> {
  const all = await getCollection('projects', ({ data }) => !data.draft);
  return APP_ORDER.map((slug) => all.find((p) => p.slug === slug)).filter((p): p is Project => Boolean(p));
}

function appPages(p: Project): DeckPage[] {
  const d = p.data;
  const imgs = [d.image, d.hero, ...(d.media ?? []).filter((m) => m.type === 'image').map((m) => m.src)]
    .filter((s): s is string => Boolean(s));
  return [...(d.icon ? [{ mesh: p.slug, icon: shot(d.icon, 320) }] : []), ...[...new Set(imgs)].slice(0, 4).map((s) => ({ src: shot(s) }))];
}

export async function getDeck() {
  const work = (await getPublishedWork()).sort((a, b) => workDate(b).valueOf() - workDate(a).valueOf());
  const apps = await getApps();
  const clients = work.filter((w) => w.data.highlight && shotsOf(w).length && !NOT_IN_DECK.includes(w.slug));
  const rank = (slug: string) => { const i = DECK_FIRST.indexOf(slug); return i < 0 ? DECK_FIRST.length : i; };
  clients.sort((a, b) => rank(a.slug) - rank(b.slug));
  const slides: DeckSlide[] = [
    ...clients.map((w) => ({
      kind: 'client' as const, slug: w.slug, title: w.data.title, partner: w.data.partnership ?? null,
      sub: `${w.data.partnership ? `With ${w.data.partnership}` : 'Solo'} · ${workDate(w).getUTCFullYear()}`,
      url: host(w.data.liveLink ?? w.data.waybackUrl),
      pages: shotsOf(w).map((s) => ({ src: shot(s) })),
      link: { href: `/work/${w.slug}/`, label: 'Read the write-up →', external: false },
    })),
    ...apps.map((p) => ({
      kind: 'app' as const, slug: p.slug, title: p.data.name, sub: p.data.tagline ?? '',
      url: host(p.data.url) || 'testamentmade.com',
      pages: appPages(p),
      link: p.data.url
        ? { href: p.data.url, label: `${host(p.data.url)} ↗`, external: true }
        : { href: 'https://testamentmade.com', label: 'Coming soon ↗', external: true },
    })),
  ];
  const kem = KEM_FAN.map((slug) => work.find((w) => w.slug === slug)).filter((w): w is Work => Boolean(w && shotsOf(w).length));
  const icons = Object.fromEntries(apps.map((p) => [p.slug, { title: p.data.name, icon: p.data.icon ? shot(p.data.icon, 160) : '' }]));
  return { slides, clients, apps, kem, icons, work };
}
