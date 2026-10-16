/**
 * Share images (1200 × 630) for posts and website write-ups, drawn at build time
 * (pages/og/[...slug].png.ts): the site's paper and dot grid, Figtree, a picture of what
 * the piece is about when there is one (or a line from inside it), and my face and signature.
 * Satori lays it out as SVG with the text as outlines; sharp turns that into a PNG.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import satori from 'satori';
import sharp from 'sharp';
import { signatureInk, signatureViewBox } from '../data/signature';

const require = createRequire(import.meta.url);
export const OG_W = 1200, OG_H = 630;
const PAPER = '#faf9f7', CARD = '#fdfcfa', INK = '#161513', MUTED = '#6c6760', HAIR = '#e3e0da', ORANGE = '#ea580c';
const PUBLIC = path.resolve('public');

// ---- What a card shows
export interface OgCard {
  /** Small caps over the title: kind, topic, date, length */
  eyebrow: string[];
  title: string;
  /** A sentence from inside it, when there's no picture */
  quote?: string | null;
  /** A path under public/ to show beside the title (a site or app screenshot) */
  image?: string | null;
}

// ---- Things every card shares, loaded once
let fonts: Promise<{ name: string; data: Buffer; weight: 400 | 500 | 600 | 700; style: 'normal' }[]> | null = null;
const loadFonts = () => (fonts ??= Promise.all(([400, 500, 600, 700] as const).map(async (weight) => ({
  name: 'Figtree', weight, style: 'normal' as const,
  data: await fs.readFile(require.resolve(`@fontsource/figtree/files/figtree-latin-${weight}-normal.woff`)),
}))));
let face: Promise<string> | null = null;
const loadFace = () => (face ??= sharp(path.join(PUBLIC, 'derekj-profile.jpeg')).resize(144, 144).jpeg({ quality: 82 }).toBuffer().then((b) => `data:image/jpeg;base64,${b.toString('base64')}`));
const PAPER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="${OG_W}" height="${OG_H}"><defs><pattern id="d" width="28" height="28" patternUnits="userSpaceOnUse"><circle cx="14" cy="14" r="1.6" fill="${INK}" fill-opacity="0.13"/></pattern></defs><rect width="100%" height="100%" fill="${PAPER}"/><rect width="100%" height="100%" fill="url(#d)"/></svg>`;
const signature = `data:image/svg+xml;base64,${Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${signatureViewBox}"><g fill="${INK}">${signatureInk.map((d) => `<path d="${d}"/>`).join('')}</g></svg>`).toString('base64')}`;
/** A public/ image as a PNG data URI, scaled to fit (satori can't read WebP) */
async function picture(src: string, w: number, h: number): Promise<string | null> {
  try {
    const buf = await sharp(path.join(PUBLIC, decodeURI(src.split('?')[0]))).resize(w * 2, h * 2, { fit: 'cover', position: 'top' }).png({ compressionLevel: 9 }).toBuffer();
    return `data:image/png;base64,${buf.toString('base64')}`;
  } catch { return null; }
}

// ---- A tiny element builder for satori (no JSX here)
type El = { type: string; props: Record<string, unknown> };
const h = (type: string, style: Record<string, unknown>, ...children: (El | string | null | false | undefined)[]): El =>
  ({ type, props: { style: { display: 'flex', ...style }, children: children.filter((c) => c != null && c !== false) } });
const img = (src: string, style: Record<string, unknown>): El => ({ type: 'img', props: { src, style } });

/** Title size by length, so short titles fill the card and long ones still fit three lines */
const titleSize = (t: string, narrow: boolean) => {
  const n = t.length * (narrow ? 1.45 : 1);
  return n <= 26 ? 88 : n <= 44 ? 76 : n <= 70 ? 64 : n <= 100 ? 54 : 46;
};
const clip = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1).replace(/\s+\S*$/, '')}…` : s);

export async function renderOg(card: OgCard): Promise<Buffer> {
  const [fontList, me] = await Promise.all([loadFonts(), loadFace()]);
  const pic = card.image ? await picture(card.image, 440, 330) : null;
  const size = titleSize(card.title, Boolean(pic));

  const text = h('div', { flexDirection: 'column', flex: 1, gap: 26, minWidth: 0 },
    h('div', { gap: pic ? 11 : 14, alignItems: 'center', fontSize: pic ? 18 : 22, fontWeight: 600, letterSpacing: pic ? 2.2 : 3, textTransform: 'uppercase', color: MUTED, whiteSpace: 'nowrap' },
      ...card.eyebrow.flatMap((e, i) => [i ? h('div', { width: 5, height: 5, borderRadius: 5, background: HAIR, flexShrink: 0 }) : null, h('div', { color: i === 0 ? ORANGE : MUTED, flexShrink: 0 }, e)])),
    h('div', { fontSize: size, fontWeight: 700, lineHeight: 1.06, letterSpacing: -size * 0.025, color: INK }, clip(card.title, 120)),
    !pic && card.quote ? h('div', { fontSize: 30, lineHeight: 1.4, color: MUTED, maxWidth: 940 }, `“${clip(card.quote.replace(/^[“"]|[”"]$/g, ''), 130)}”`) : null,
  );

  const PAD = 72, FOOT = 64;
  const tree = h('div', { width: OG_W, height: OG_H, flexDirection: 'column', paddingTop: 64, paddingLeft: PAD, paddingRight: PAD, fontFamily: 'Figtree', position: 'relative' },
    h('div', { width: OG_W - PAD * 2, gap: 48, alignItems: 'flex-start' },
      text,
      pic ? h('div', { width: 440, height: 330, flexShrink: 0, borderRadius: 22, overflow: 'hidden', background: CARD, border: `1px solid ${HAIR}`, boxShadow: '0 18px 40px -18px rgba(22,21,19,0.35)', transform: 'rotate(2deg)', marginTop: 8 },
        img(pic, { width: 440, height: 330, objectFit: 'cover' })) : null,
    ),
    h('div', { position: 'absolute', left: PAD, top: OG_H - 52 - FOOT, width: OG_W - PAD * 2, height: FOOT, alignItems: 'center', justifyContent: 'space-between' },
      h('div', { alignItems: 'center', gap: 18 },
        img(me, { width: 64, height: 64, borderRadius: 18 }),
        h('div', { flexDirection: 'column', gap: 2 },
          h('div', { fontSize: 26, fontWeight: 600, color: INK }, 'Derek Castelli'),
          h('div', { fontSize: 21, fontWeight: 500, color: MUTED }, 'heyderekj.com'))),
      img(signature, { width: 230, height: 57, opacity: 0.85 }),
    ),
  );

  const svg = await satori(tree as never, { width: OG_W, height: OG_H, fonts: fontList });
  // On the site's dot paper, drawn underneath (satori's gradients don't survive the trip to PNG)
  return sharp(Buffer.from(PAPER_SVG)).composite([{ input: Buffer.from(svg) }]).png({ compressionLevel: 9 }).toBuffer();
}
