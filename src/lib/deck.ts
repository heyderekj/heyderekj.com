/**
 * Content for the home page's work deck, chips and previews: the websites (highlighted
 * work), the apps (Testament Made), and the pictures that stand for each.
 */
import { getCollection, type CollectionEntry } from 'astro:content';
import { getPublishedWork, type Work } from './work';
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
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

/**
 * A page in a preview: a screenshot, or an app icon on its mesh. An app screenshot exported inside a
 * device frame (transparent margin, shadow, dark bezel) carries `frame`: the screen's box as
 * fractions of the image, so the preview shows just the screen, filling the window. (The deck's
 * website shots keep their frame on purpose; the Kem fan's small windows crop it.)
 */
export interface Frame { x: number; y: number; w: number; h: number; ratio: number }
export type DeckPage = { src: string; frame?: Frame } | { mesh: string; icon: string; collage?: string[] } | { video: string; poster?: string };

const frames = new Map<string, Promise<Frame | undefined>>();
async function findFrame(src: string): Promise<Frame | undefined> {
  const file = path.join(process.cwd(), 'public', decodeURI(src));
  if (!/\.(png|webp)$/i.test(src) || !fs.existsSync(file)) return undefined;
  try {
    const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const { width: W, height: H, channels: C } = info;
    const px = (x: number, y: number) => (y * W + x) * C;
    const solid = (x: number, y: number) => data[px(x, y) + 3] === 255;
    const dark = (x: number, y: number) => { const i = px(x, y); return data[i + 3] === 255 && data[i] < 40 && data[i + 1] < 40 && data[i + 2] < 40; };
    // The opaque window, scanning in from the middle of each edge
    const cx = W >> 1, cy = H >> 1;
    let l = 0; while (l < cx && !solid(l, cy)) l++;
    let r = W - 1; while (r > cx && !solid(r, cy)) r--;
    let t = 0; while (t < cy && !solid(cx, t)) t++;
    let b = H - 1; while (b > cy && !solid(cx, b)) b--;
    if (l < W * 0.01 && t < H * 0.01) return undefined; // full-bleed already
    // Then past the dark bezel (and its 1px highlight), at most ~1.5% in
    const max = Math.round(W * 0.015);
    const skip = (start: number, step: number, at: (n: number) => [number, number]) => {
      let n = start; while (Math.abs(n - start) < max && (dark(...at(n)) || !dark(...at(n)) && Math.abs(n - start) < 2)) n += step;
      return n;
    };
    l = skip(l, 1, (n) => [n, cy]); r = skip(r, -1, (n) => [n, cy]);
    t = skip(t, 1, (n) => [cx, n]); b = skip(b, -1, (n) => [cx, n]);
    return { x: l / W, y: t / H, w: (r - l + 1) / W, h: (b - t + 1) / H, ratio: W / H };
  } catch { return undefined; }
}
/** A screenshot page, sized for `w`, with its device frame found (once per image). */
export function pageOf(src: string, w = 1280): Promise<DeckPage> {
  if (!frames.has(src)) frames.set(src, findFrame(src));
  return frames.get(src)!.then((frame) => ({ src: shot(src, w), ...(frame ? { frame } : {}) }));
}
/** Inline style and class for a framed screenshot's <img>. */
export const frameAttrs = (p: DeckPage) => 'frame' in p && p.frame
  ? { class: 'framed', style: `--fx:${p.frame.x.toFixed(4)};--fy:${p.frame.y.toFixed(4)};--fw:${p.frame.w.toFixed(4)};--fh:${p.frame.h.toFixed(4)};--fr:${p.frame.ratio.toFixed(4)}` }
  : { class: '', style: undefined };
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

/** An app is one page: three of its screenshot cards collaged on its mesh, with its icon. */
async function appPages(p: Project): Promise<DeckPage[]> {
  const d = p.data;
  const imgs = [d.image, d.hero, ...(d.media ?? []).filter((m) => m.type === 'image').map((m) => m.src)]
    .filter((s): s is string => Boolean(s));
  return [{ mesh: p.slug, icon: d.icon ? shot(d.icon, 320) : '', collage: [...new Set(imgs)].slice(0, 3).map((s) => shot(s, 960)) }];
}

export async function getDeck() {
  const work = (await getPublishedWork()).sort((a, b) => workDate(b).valueOf() - workDate(a).valueOf());
  const apps = await getApps();
  const clients = work.filter((w) => w.data.highlight && shotsOf(w).length && !NOT_IN_DECK.includes(w.slug));
  const rank = (slug: string) => { const i = DECK_FIRST.indexOf(slug); return i < 0 ? DECK_FIRST.length : i; };
  clients.sort((a, b) => rank(a.slug) - rank(b.slug));
  const appPageList = await Promise.all(apps.map(appPages));
  const slides: DeckSlide[] = [
    ...clients.map((w) => ({
      kind: 'client' as const, slug: w.slug, title: w.data.title, partner: w.data.partnership ?? null,
      sub: `${w.data.partnership ? `With ${w.data.partnership}` : 'Solo'} · ${workDate(w).getUTCFullYear()}`,
      url: host(w.data.liveLink ?? w.data.waybackUrl),
      // The site tour leads when there is one, then the screenshots
      pages: [...(w.data.video ? [{ video: w.data.video, poster: w.data.videoPoster ? shot(w.data.videoPoster) : undefined }] : []), ...shotsOf(w).map((s) => ({ src: shot(s) }))],
      link: { href: `/work/${w.slug}/`, label: 'Read the write-up →', external: false },
    })),
    ...apps.map((p, i) => ({
      kind: 'app' as const, slug: p.slug, title: p.data.name, sub: p.data.tagline ?? '',
      url: host(p.data.url) || 'testamentmade.com',
      pages: appPageList[i],
      link: p.data.url
        ? { href: p.data.url, label: `${host(p.data.url)} ↗`, external: true }
        : { href: 'https://testamentmade.com', label: 'Coming soon ↗', external: true },
    })),
  ];
  const kem = KEM_FAN.map((slug) => work.find((w) => w.slug === slug)).filter((w): w is Work => Boolean(w && shotsOf(w).length));
  const icons = Object.fromEntries(apps.map((p) => [p.slug, { title: p.data.name, icon: p.data.icon ? shot(p.data.icon, 160) : '' }]));
  return { slides, clients, apps, kem, icons, work };
}
