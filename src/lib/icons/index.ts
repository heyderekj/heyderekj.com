/**
 * Icons as inline SVG strings, built at build time. `Icon.astro` renders one;
 * data files that hold raw HTML (the application pages' chips) call
 * `iconSvg()` directly.
 *
 * Every icon is 1em square and takes `currentColor`, so it sizes and colours
 * with the text around it. Strokes are 1.4 on the 16 grid and scale with the
 * drawing (`--icon-stroke` overrides).
 *
 * `loop` adds the icon's morph loop (morphs.ts, client/icon-morph.ts):
 * `always` while on screen, or `hover` while it or its parent is hovered or
 * focused.
 */
import { BRANDS } from './brands';
import { GLYPHS, type Shape } from './glyphs';
import { squircle } from './squircle';
import { MORPHS, TEMPO, type FrameShape } from './morphs';
import { normalize, serialize, signature } from './path';

export type GlyphName = keyof typeof GLYPHS;
export type BrandName = keyof typeof BRANDS;
export type IconName = GlyphName | BrandName;

export const ICON_NAMES = [...Object.keys(GLYPHS), ...Object.keys(BRANDS)] as IconName[];
export const ICON_STROKE = 1.4;

export interface IconOptions {
  /** px; omit to size with the font (1em). */
  size?: number;
  /** Stroke width on the 16 grid (default 1.4). */
  stroke?: number;
  /** Morph loop: `hover` (default) plays while the icon's link/button/parent
   *  is hovered or focused; `always` while on screen; `false` never. */
  loop?: 'always' | 'hover' | false;
  /** Accessible name. Without one the icon is decoration (aria-hidden). */
  title?: string;
  class?: string;
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

function paint(s: Shape): string {
  if (s.solid) return ' fill="currentColor" stroke="none"';
  let a = s.fill ? ' fill="currentColor"' : '';
  const css: string[] = [];
  if ('dash' in s && s.dash) css.push(`stroke-dasharray:${s.dash}`);
  if (s.w != null) css.push(`stroke-width:${s.w}`);
  if (css.length) a += ` style="${css.join(';')}"`;
  return a;
}

/* No circles in this set: a "circle" is drawn as a full squircle of the same
   size — lenses, faces, heads, dots, all of it. */
const circle = ([cx, cy, r]: [number, number, number]) => squircle(cx - r, cy - r, 2 * r, 2 * r);
const shapeD = (s: Shape) => ('d' in s ? s.d : circle(s.c));
/** Shapes that morph are written normalized (H/V as L) so frames line up. */
const norm = (d: string) => serialize(normalize(d));

const shape = (s: Shape, i: number, morph: boolean): string =>
  `<path class="s${i}" d="${morph ? norm(shapeD(s)) : shapeD(s)}"${paint(s)}/>`;

/** The loop's frames, checked against the drawing and packed for the client
 *  (client/icon-morph.ts): [{ s: [[index, d, opacity]…], r, x, y, h, snap }]. */
function morphData(name: IconName, shapes: readonly Shape[]): string {
  const frames = MORPHS[name];
  if (!frames) return '';
  const packed = frames.map((f) => {
    const s = Object.entries(f.s ?? {}).map(([k, v]) => {
      const i = +k;
      const fs = v as FrameShape;
      const d = typeof fs === 'string' ? fs : Array.isArray(fs) ? circle(fs) : fs.d ?? circle(fs.c!);
      const o = typeof fs === 'object' && !Array.isArray(fs) && fs.o != null ? fs.o : 1;
      const from = shapeD(shapes[i]);
      if (signature(from) !== signature(d)) {
        throw new Error(`Morph for "${name}" shape ${i}: commands differ (${signature(from)} → ${signature(d)})`);
      }
      return [i, norm(d), o];
    });
    return { s, r: f.r ?? 0, x: f.x ?? 0, y: f.y ?? 0, k: f.k ?? 1, h: f.hold ?? 450, snap: f.snap ?? false };
  });
  const tempo = TEMPO[name as keyof typeof TEMPO] ?? {};
  return ` data-morph='${JSON.stringify(packed)}' data-move="${tempo.move ?? 520}" data-rest="${tempo.rest ?? 1100}"`;
}

export function isIconName(name: string): name is IconName {
  return name in GLYPHS || name in BRANDS;
}

export function iconSvg(name: IconName, opts: IconOptions = {}): string {
  const { size, stroke, title, loop = 'hover', class: className } = opts;
  let body: string;
  let morph = '';
  if (name in BRANDS) {
    morph = loop ? morphData(name, []) : '';
    body = `<g transform="translate(1 1) scale(0.5833)"><path class="s0" d="${BRANDS[name as BrandName]}" fill="currentColor" stroke="none"/></g>`;
  } else if (name in GLYPHS) {
    const shapes = GLYPHS[name as GlyphName] as readonly Shape[];
    morph = loop ? morphData(name as GlyphName, shapes) : '';
    body = shapes.map((sh, i) => shape(sh, i, !!morph)).join('');
  } else {
    throw new Error(`No icon named "${name}" — draw it in src/lib/icons/glyphs.ts.`);
  }

  const loopCls = loop === 'always' ? 'icon--loop' : loop === 'hover' ? 'icon--loop-hover' : '';
  const cls = ['icon', `icon--${name}`, loopCls, className].filter(Boolean).join(' ');
  const css = [size != null && `font-size:${size}px`, stroke != null && `--icon-stroke:${stroke}`].filter(Boolean).join(';');
  const style = css ? ` style="${css}"` : '';
  const a11y = title ? ` role="img" aria-label="${esc(title)}"` : ' aria-hidden="true"';
  return `<svg class="${cls}" viewBox="0 0 16 16" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="${ICON_STROKE}" stroke-linecap="round" stroke-linejoin="round" focusable="false"${a11y}${style}${morph}>${body}</svg>`;
}
