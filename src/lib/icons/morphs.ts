/**
 * Every icon's loop, as morphs — after Benji Taylor's morphing icons: the
 * icon's own strokes move to a new shape and back, rather than the icon
 * wiggling as a picture. Icons that are the same shape turned (plus ⇄
 * close, refresh) rotate instead, because morphing a turn bends the lines.
 * Chevrons only nudge the way they point: turned, they'd point somewhere else.
 *
 * A loop is a list of frames played from the drawing and back to it:
 * - `s`: new shapes by index. A path (same commands as the drawing's), a
 *   circle `[cx, cy, r]` (drawn as a squircle), or `{ d|c, o }` with opacity.
 *   Strokes that aren't needed collapse to a point and fade (`o: 0`).
 * - `r`, `x`, `y`, `k`: turn (deg) / shift (drawing units) / scale the whole icon.
 * - `hold`: ms to rest on the frame (default 450).
 * - `snap`: the frame looks like the drawing again — jump back silently.
 *
 * `TEMPO` sets how fast an icon moves: things that are quick in life (a flag
 * in the wind, drum hits, a heartbeat, typing) morph faster and rest less.
 */
import { GLYPHS, type Shape } from './glyphs';
import { squircle } from './squircle';
import { mapPoints, rotate as ro, scale as sc, translate as tr } from './path';

type Circle = [number, number, number];
export type FrameShape = string | Circle | { d?: string; c?: Circle; o?: number };
export interface Frame {
  s?: Record<number, FrameShape>;
  r?: number;
  /** Scale the whole icon. */
  k?: number;
  x?: number;
  y?: number;
  hold?: number;
  snap?: boolean;
}

type Name = keyof typeof GLYPHS;
const base = (name: Name, i: number): string => {
  const s = (GLYPHS[name] as readonly Shape[])[i];
  return 'd' in s ? s.d : squircle(s.c[0] - s.c[2], s.c[1] - s.c[2], 2 * s.c[2], 2 * s.c[2]);
};
const sq = squircle;
/** The same commands with every point at (x, y): a stroke collapsed. */
const pt = (d: string, x: number, y: number) => mapPoints(d, () => [x, y]);

const FLAG: Frame[] = [
    {
      s: {
        1: 'M3 2.75L12.75 3.75L12.75 10.25L3 9.25',
        2: tr(base('flag', 2), 0, 0.3),
        3: tr(base('flag', 3), 0, 0.85),
        4: tr(base('flag', 4), 0, 0),
        5: tr(base('flag', 5), 0, 0.6),
      },
      hold: 0,
    },
    {
      s: {
        1: 'M3 2.75L12.75 1.75L12.75 8.25L3 9.25',
        2: tr(base('flag', 2), 0, -0.3),
        3: tr(base('flag', 3), 0, -0.85),
        4: tr(base('flag', 4), 0, 0),
        5: tr(base('flag', 5), 0, -0.6),
      },
      hold: 0,
    },
];

export const MORPHS: Partial<Record<Name | 'x' | 'github', Frame[]>> = {
  /* ---- Arrows & controls ---- */
  // Arrow → check → arrow, Benji's favourite: the head becomes the tick.
  'arrow-right': [{ s: { 0: 'M3.5 8.5L6.5 11.5L12.5 4.5', 1: { d: pt('M12.5 8H3', 6.5, 11.5), o: 0 } }, hold: 700 }],
  // Back arrows pull their shaft in and become a chevron.
  'arrow-left': [{ s: { 0: 'M9.75 4L5.75 8L9.75 12', 1: { d: pt('M3.5 8H13', 5.75, 8), o: 0 } } }],
  'arrow-up': [{ s: { 0: 'M4 9.75L8 5.75L12 9.75', 1: { d: pt('M8 3.5V13', 8, 5.75), o: 0 } } }],
  'arrow-down': [{ s: { 0: 'M4 6.25L8 10.25L12 6.25', 1: { d: pt('M8 12.5V3', 8, 10.25), o: 0 } } }],
  'arrow-up-right': [{ x: 1, y: -1, hold: 250 }],
  'chevron-right': [{ x: 1.5, hold: 250 }],
  'chevron-left': [{ x: -1.5, hold: 250 }],
  'chevron-down': [{ y: 1.5, hold: 250 }],
  'chevron-up': [{ y: -1.5, hold: 250 }],
  close: [{ r: 45, hold: 600 }],
  plus: [{ r: 45, hold: 600 }],
  // The tick lies flat, then flicks up.
  check: [{ s: { 0: 'M3.5 8.5L8 8.5L12.5 8.5' }, hold: 250 }],
  refresh: [{ r: 360, snap: true }],
  history: [{ s: { 2: 'M8 5.25V8L5.25 8' } }, { s: { 2: 'M8 5.25V8L8 10.75' } }],
  play: [{ s: { 0: sc(base('play', 0), 1.15, 1.15, 8.5, 8) }, hold: 250 }],
  copy: [{ s: { 1: sq(3.75, 3.75, 8.5, 8.5, 2.5) } }],
  eye: [
    {
      s: {
        0: 'M1.75 8C3.2 9.5 5.4 10.25 8 10.25C10.6 10.25 12.8 9.5 14.25 8C12.8 9.5 10.6 10.25 8 10.25C5.4 10.25 3.2 9.5 1.75 8Z',
        1: { c: [8, 10.25, 0.05], o: 0 },
      },
      hold: 120,
    },
  ],
  search: [
    { s: { 0: [8.25, 5.75, 4.75], 1: tr(base('search', 1), 1.5, -1) } },
    { s: { 0: [5.75, 7.25, 4.75], 1: tr(base('search', 1), -1, 0.5) } },
  ],
  spark: [{ s: { 0: sc(base('spark', 0), 1.15, 1.15, 6.75, 9.25), 1: ro(base('spark', 1), 45, 12, 3.5), 2: ro(base('spark', 2), 45, 12, 3.5) } }],
  star: [{ r: 72, snap: true }],
  'star-solid': [{ r: 72, snap: true }],
  link: [{ s: { 0: tr(base('link', 0), 1.25, -1.25), 1: tr(base('link', 1), -1.25, 1.25), 2: { d: pt(base('link', 2), 8, 8), o: 0 } } }],

  /* ---- Sections ---- */
  // The nib writes a short word.
  writing: [{ r: -14, x: -1, y: 0.5, hold: 150 }, { r: 8, x: 1, hold: 150 }],
  work: [{ s: { 1: tr(base('work', 1), 0, -1.25), 4: sq(6.5, 8.25, 3, 2.25, 0.75) } }],
  // Four tiles gather into one app icon, then split back out.
  projects: [{ s: Object.fromEntries([0, 1, 2, 3].map((i) => [i, sq(2.5, 2.5, 11, 11, 3.5)])), hold: 600 }],
  // A wink and a bigger smile.
  about: [{ s: { 2: sq(9.1, 6.6, 1.8, 0.3, 0.15), 3: 'M5.25 9.25C6 11 7 11.75 8 11.75C9 11.75 10 11 10.75 9.25' }, hold: 500 }],
  topics: [{ s: { 0: 'M5.75 2.5L5.75 13.5', 1: 'M10.25 2.5L10.25 13.5' } }],
  // The rays turn an eighth; the frame after looks like the start.
  now: [
    { s: Object.fromEntries([1, 2, 3, 4, 5, 6, 7, 8].map((i) => [i, ro(base('now', i), 45)])), hold: 0 },
    { s: Object.fromEntries([1, 2, 3, 4, 5, 6, 7, 8].map((i) => [i, ro(base('now', i), 90)])), snap: true },
  ],
  palette: [1, 2, 3, 4].map((i) => ({ s: { [i]: sc(base('palette', i), 1.5, 1.5, ...([[5, 8], [6.5, 5], [10, 4.75], [11.75, 7.75]][i - 1] as [number, number])) }, hold: 80 })),
  archive: [{ s: { 0: ro(tr(base('archive', 0), 0, -1.5), -6, 3, 4.5) } }],
  building: [
    { s: { 3: sc(base('building', 3), 1.5, 1.5, 5.5, 5), 6: sc(base('building', 6), 1.5, 1.5, 8.5, 8) }, hold: 200 },
    { s: { 4: sc(base('building', 4), 1.5, 1.5, 8.5, 5), 5: sc(base('building', 5), 1.5, 1.5, 5.5, 8) }, hold: 200 },
  ],
  clipboard: [{ s: { 2: { d: pt(base('clipboard', 2), 5.25, 8), o: 0 }, 3: pt(base('clipboard', 3), 9.5, 8) }, hold: 100 }],
  // Someone's typing.
  message: [1, 2, 3].map((i) => ({ s: { [i]: tr(base('message', i), 0, -1.25) }, hold: 0 })),
  note: [
    { s: { 1: pt(base('note', 1), 5.75, 5.5), 2: pt(base('note', 2), 5.75, 8), 3: pt(base('note', 3), 5.75, 10.5) }, hold: 100 },
  ],
  // The total adds itself up again.
  estimate: [{ s: { 5: { d: pt(base('estimate', 5), 5.75, 10.75), o: 0 }, 2: [10, 5.25, 0.35], 4: [10, 7.75, 0.35] }, hold: 120 }],
  users: [{ s: { 2: tr(base('users', 2), 1.25, 0), 3: tr(base('users', 3), 1.25, 0), 0: [6, 5, 2.25] } }],

  /* ---- Contact ---- */
  // The flap opens.
  mail: [{ s: { 1: 'M3 5.75L6.9 3C7.55 2.55 8.45 2.55 9.1 3L13 5.75' }, hold: 600 }],
  rss: [{ s: { 2: sc(base('rss', 2), 1.15, 1.15, 5.5, 10.5) }, hold: 80 }, { s: { 3: sc(base('rss', 3), 1.1, 1.1, 5.5, 10.5) }, hold: 80 }],

  /* ---- Places & things ---- */
  'map-pin': [{ y: -2.25, hold: 0 }, { s: { 0: sc(base('map-pin', 0), 1.1, 0.88, 8, 14.25), 1: [8, 7.25, 1.6] }, hold: 120 }],
  iowa: [{ s: { 1: [7.75, 7.75, 1.75] }, hold: 300 }],
  newspaper: [
    { s: { 1: sq(8, 5, 3.75, 3, 0.75), 2: 'M4.25 5.5L6.25 5.5', 3: 'M4.25 7.75L6.25 7.75' }, hold: 700 },
  ],
  book: [{ r: -10 }, { r: 6 }],
  // A page turning.
  'book-open': [
    { s: { 0: 'M8 4.25C6.6 3.2 4.6 2.75 2 2.75V12.25C4.6 12.25 6.6 12.7 8 13.75C8.6 12.7 9.4 12.25 10.5 12.25V2.75C9.4 2.75 8.6 3.2 8 4.25Z' }, hold: 0 },
    { s: { 0: 'M8 4.25C7.4 3.2 6.6 2.75 5.5 2.75V12.25C6.6 12.25 7.4 12.7 8 13.75C9.4 12.7 11.4 12.25 14 12.25V2.75C11.4 2.75 9.4 3.2 8 4.25Z' }, hold: 0 },
  ],
  bookmark: [{ s: { 0: 'M4 3.75C4 2.6 4.6 2 5.75 2H10.25C11.4 2 12 2.6 12 3.75V14L8 12.5L4 14Z' }, y: 0.75 }],
  microphone: [{ s: { 0: sc(base('microphone', 0), 1.1, 1.1, 8, 5.75), 1: sc(base('microphone', 1), 1.08, 1.08, 8, 8) }, hold: 150 }],
  wrench: [{ r: -25 }, { r: 10 }],
  // The lid closes.
  laptop: [{ s: { 0: sq(3, 9.75, 10, 1.5, 0.75) }, hold: 300 }],
  tv: [{ s: { 1: 'M4.5 2.75L8 4.25L11 1.25' } }, { s: { 1: 'M5 1.25L8 4.25L11.5 2.75' } }],
  // A notch around, the inside turning back the other way, like gears meshing.
  gear: [{ r: 72, s: { 1: ro(base('gear', 1), -144, 8.1, 8) }, hold: 160 }, { r: 144, s: { 1: ro(base('gear', 1), -288, 8.1, 8) }, hold: 160 }],
  // The sun comes up.
  figure: [{ s: { 3: [10.75, 5, 0.875] }, hold: 300 }],
  controller: [{ s: { 3: [10.75, 6.5, 0.4] }, hold: 100 }, { s: { 4: [12, 8, 0.4] }, hold: 100 }],
  lego: [{ s: { 1: tr(base('lego', 1), 0, -1.25) }, hold: 60 }, { s: { 2: tr(base('lego', 2), 0, -1.25) }, hold: 60 }],
  bolt: [{ s: { 0: sc(base('bolt', 0), 1.15) }, hold: 100 }],
  // The waves ring out.
  sound: [{ s: { 1: tr(base('sound', 1), 0.5, 0), 2: tr(base('sound', 2), 0.75, 0) }, hold: 120 }],
  // The flag waves; its checks ride along.
  flag: [...FLAG, ...FLAG],

  // Left, right, left, right; the head gives on each hit.
  drum: [0, 1, 2, 3].map((k) =>
    k % 2 === 0
      ? { s: { 4: ro(base('drum', 4), -14, 3.5, 1.75), 0: sc(base('drum', 0), 1, 0.92, 8, 6.5) }, hold: 0 }
      : { s: { 5: ro(base('drum', 5), 14, 12.5, 1.75), 0: sc(base('drum', 0), 1, 0.92, 8, 6.5) }, hold: 0 },
  ),
  // The whole paw pads in and out.
  paw: [{ k: 1.18, hold: 0 }],
  church: [{ s: { 3: 'M6.75 14V11.75C6.75 11 7.25 10.5 8 10.5C8.1 10.5 8.25 11 8.25 11.75V14' }, hold: 500 }],
  pencil: [{ r: -10, x: -0.75, hold: 120 }, { r: 6, x: 0.75, hold: 120 }],
  tray: [{ s: { 1: tr(base('tray', 1), 0, 1) }, hold: 300 }],
  heartbeat: [
    { s: { 0: sc(base('heartbeat', 0), 1.08, 1.08, 8, 8), 1: 'M4.25 7.75H6L7 4.5L8.5 11L9.5 7.75H11.75' }, hold: 80 },
  ],
  'shield-check': [{ s: { 1: { d: pt(base('shield-check', 1), 5.75, 8), o: 0 } }, hold: 100 }],
  'file-down': [{ s: { 1: tr(base('file-down', 1), 0, 1.5), 2: tr(base('file-down', 2), 0, 1.5) }, hold: 150 }],
  // Folds up and opens out.
  map: [{ s: Object.fromEntries([0, 1, 2].map((i) => [i, sc(base('map', i), 0.7, 1, 8, 8)])), hold: 250 }],
  'selection-plus': [{ s: { 0: sq(2.5, 2.5, 7.5, 7.5, 2), 1: ro(base('selection-plus', 1), 45, 12.25, 12.25), 2: ro(base('selection-plus', 2), 45, 12.25, 12.25) } }],
  // The clapper snaps shut.
  clapper: [{ s: { 1: 'M2.25 5.25L13.75 5.25' }, hold: 200 }],
  signature: [{ s: { 0: { d: pt(base('signature', 0), 2, 11.75), o: 0 } }, hold: 80 }],
  folder: [{ s: { 1: 'M2.75 8.5L14.25 8.5' }, hold: 400 }],
  // The branch merges back in.
  branch: [{ s: { 2: [4.5, 8, 1.5], 4: 'M4.5 9.5C4.5 9.75 4.5 10.5 4.5 11' }, hold: 300 }],
};

/** ms per morph and rest between loops. Default: 520 / 1100. */
export const TEMPO: Partial<Record<Name | 'x' | 'github', { move?: number; rest?: number }>> = {
  drum: { move: 210, rest: 600 },
  flag: { move: 340, rest: 300 },
  heartbeat: { move: 260, rest: 700 },
  message: { move: 280, rest: 500 },
  paw: { move: 380, rest: 700 },
  controller: { move: 260, rest: 600 },
  lego: { move: 260 },
  palette: { move: 300 },
  play: { move: 360 },
  bolt: { move: 220, rest: 900 },
  tv: { move: 320 },
  eye: { move: 260 },
  'map-pin': { move: 380 },
  pencil: { move: 300 },
  writing: { move: 300 },
  refresh: { move: 700 },
};
