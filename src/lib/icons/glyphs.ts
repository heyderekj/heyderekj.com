/**
 * Derek's icons — drawn for heyderekj.com.
 *
 * The construction is borrowed from Koati's set; the drawings and subjects are
 * Derek's own: his dogs' paws, his church, the drums, Iowa, his apps.
 *
 * Grammar
 * - 16 grid, viewBox 0 0 16 16. Points snap to 0.25 (computed curves excepted).
 * - Live area 1–15; most shapes sit inside 2–14.
 * - Strokes are drawn in screen pixels (non-scaling): 1.4px at 16px, growing
 *   slower than the icon so small ones stay crisp and big ones don't go
 *   clunky (global.css `.icon`). Shapes leave ~1.5 units between strokes.
 * - Containers are squircles (`sq`), never `rx` rectangles — and there are
 *   no circles at all: `c` shapes render as full squircles (index.ts).
 * - Where two outlines would sit about a unit apart, the inner one goes solid.
 * - Lines break where they cross. One colour; no duotone, no shadows.
 *
 * A shape is a path (`d`) or a circle (`c`). `solid` fills with no stroke;
 * `fill` fills *and* strokes (rounded corners on a solid shape); `dash` sets a
 * dash pattern; `w` overrides the stroke width.
 */
import { squircle as sq } from './squircle';

export type Shape =
  | { d: string; solid?: boolean; fill?: boolean; dash?: string; w?: number }
  | { c: [number, number, number]; solid?: boolean; fill?: boolean; w?: number };

const dot = (x: number, y: number, r = 0.875): Shape => ({ c: [x, y, r], solid: true });

export const GLYPHS = {
  /* ---- Arrows & controls ---- */
  'arrow-right': [{ d: 'M9 4L13 8L9 12' }, { d: 'M12.5 8H3' }],
  'arrow-left': [{ d: 'M7 4L3 8L7 12' }, { d: 'M3.5 8H13' }],
  'arrow-up': [{ d: 'M4 7L8 3L12 7' }, { d: 'M8 3.5V13' }],
  'arrow-down': [{ d: 'M4 9L8 13L12 9' }, { d: 'M8 12.5V3' }],
  'arrow-up-right': [{ d: 'M5.5 4H12V10.5' }, { d: 'M11.5 4.5L4 12' }],
  'chevron-right': [{ d: 'M6.25 4L10.25 8L6.25 12' }],
  'chevron-left': [{ d: 'M9.75 4L5.75 8L9.75 12' }],
  'chevron-down': [{ d: 'M4 6.25L8 10.25L12 6.25' }],
  'chevron-up': [{ d: 'M4 9.75L8 5.75L12 9.75' }],
  close: [{ d: 'M4 4L12 12' }, { d: 'M12 4L4 12' }],
  check: [{ d: 'M3.5 8.5L6.5 11.5L12.5 4.5' }],
  plus: [{ d: 'M8 3V13' }, { d: 'M3 8H13' }],
  // Squircle arcs, not circles: the whole set shares one curve.
  refresh: [
    { d: 'M13.5 8C13.5 12.4 12.4 13.5 8 13.5C3.6 13.5 2.5 12.4 2.5 8C2.5 3.6 3.6 2.5 8 2.5C10.35 2.5 11.85 2.85 12.75 3.75' },
    { d: 'M12.75 1.25V3.75H10.25' },
  ],
  history: [
    { d: 'M2.5 8C2.5 12.4 3.6 13.5 8 13.5C12.4 13.5 13.5 12.4 13.5 8C13.5 3.6 12.4 2.5 8 2.5C5.65 2.5 4.15 2.85 3.25 3.75' },
    { d: 'M3.25 1.25V3.75H5.75' },
    { d: 'M8 5.25V8L10 9.25' },
  ],
  play: [
    {
      d: 'M5.25 3.6C5.25 2.95 5.95 2.55 6.5 2.9L12.6 7.2C13.1 7.55 13.1 8.45 12.6 8.8L6.5 13.1C5.95 13.45 5.25 13.05 5.25 12.4Z',
      fill: true,
    },
  ],
  copy: [
    { d: 'M4 10.5C2.4 10.5 2 10.1 2 8.5V4C2 2.4 2.4 2 4 2H8.5C10.1 2 10.5 2.4 10.5 4' },
    { d: sq(5.5, 5.5, 8.5, 8.5, 2.5) },
  ],
  eye: [
    { d: 'M1.75 8C3.2 5 5.4 3.5 8 3.5C10.6 3.5 12.8 5 14.25 8C12.8 11 10.6 12.5 8 12.5C5.4 12.5 3.2 11 1.75 8Z' },
    { c: [8, 8, 2.25] },
  ],
  // The handle leaves from the lens's corner — a squircle's diagonal sits
  // further out than a circle's.
  search: [{ c: [6.75, 6.75, 4.75] }, { d: 'M10.6 10.6L13.75 13.75' }],
  // A main spark and a small one, like a second thought.
  // A figure: a framed picture, hills and a sun.
  figure: [{ d: sq(1.75, 2.75, 12.5, 10.5, 2.5) }, { d: 'M4.25 10.75L6.75 8.25L8.75 10.25' }, { d: 'M8 9.5L9.5 8L11.75 10.25' }, dot(10.75, 5.75, 0.875)],
  spark: [
    { d: 'M6.75 4.25C7.15 7.25 8.75 8.85 11.75 9.25C8.75 9.65 7.15 11.25 6.75 14.25C6.35 11.25 4.75 9.65 1.75 9.25C4.75 8.85 6.35 7.25 6.75 4.25Z' },
    { d: 'M12 1.75V5.25' },
    { d: 'M10.25 3.5H13.75' },
  ],
  'star-solid': [
    {
      d: 'M8 1.9L9.7 5.55L13.7 6.05L10.75 8.8L11.55 12.75L8 10.8L4.45 12.75L5.25 8.8L2.3 6.05L6.3 5.55Z',
      fill: true,
    },
  ],
  star: [{ d: 'M8 1.9L9.7 5.55L13.7 6.05L10.75 8.8L11.55 12.75L8 10.8L4.45 12.75L5.25 8.8L2.3 6.05L6.3 5.55Z' }],
  link: [
    { d: 'M7.25 4.5L8.6 3.15C9.85 1.9 11.85 1.9 13.1 3.15C14.35 4.4 14.35 6.4 13.1 7.65L11.75 9' },
    { d: 'M8.75 11.5L7.4 12.85C6.15 14.1 4.15 14.1 2.9 12.85C1.65 11.6 1.65 9.6 2.9 8.35L4.25 7' },
    { d: 'M6 10L10 6' },
  ],

  /* ---- Site sections ---- */
  // Writing: a fountain-pen nib, the pen the signature came from.
  writing: [
    { d: 'M8 14L4.25 8.5C4 8.1 4 7.6 4.2 7.2L6 3.25H10L11.8 7.2C12 7.6 12 8.1 11.75 8.5Z' },
    { d: 'M5.5 1.75H10.5' },
    { d: 'M8 13.25V10' },
    dot(8, 8.5),
  ],
  work: [
    { d: sq(2, 4.75, 12, 9, 2.75) },
    { d: 'M5.75 4.75V3.75C5.75 2.9 6.15 2.5 7 2.5H9C9.85 2.5 10.25 2.9 10.25 3.75V4.75' },
    { d: 'M2 8.75H6.5' },
    { d: 'M9.5 8.75H14' },
    { d: sq(6.5, 7.75, 3, 2.25, 0.75), solid: true },
  ],
  // Projects: four app tiles, one of them shipped.
  projects: [
    { d: sq(2, 2, 5, 5) },
    { d: sq(9, 2, 5, 5) },
    { d: sq(2, 9, 5, 5) },
    { d: sq(9, 9, 5, 5), fill: true },
  ],
  // About: a face, smiling.
  about: [
    { c: [8, 8, 6] },
    dot(6, 6.75),
    dot(10, 6.75),
    { d: 'M5.5 9.5C6.1 10.6 7 11.15 8 11.15C9 11.15 9.9 10.6 10.5 9.5' },
  ],
  topics: [
    { d: 'M6.25 2.5L5 13.5' },
    { d: 'M11 2.5L9.75 13.5' },
    { d: 'M2.75 6H13.5' },
    { d: 'M2.5 10H13.25' },
  ],
  now: [
    { c: [8, 8, 2.75] },
    { d: 'M8 1.75V2.75' },
    { d: 'M8 13.25V14.25' },
    { d: 'M1.75 8H2.75' },
    { d: 'M13.25 8H14.25' },
    { d: 'M3.6 3.6L4.3 4.3' },
    { d: 'M11.7 11.7L12.4 12.4' },
    { d: 'M3.6 12.4L4.3 11.7' },
    { d: 'M11.7 4.3L12.4 3.6' },
  ],
  palette: [
    {
      d: 'M8 1.75C4.55 1.75 1.75 4.55 1.75 8C1.75 11.45 4.55 14.25 8 14.25C8.85 14.25 9.4 13.6 9.25 12.85C9.1 12.1 9.6 11.4 10.4 11.4H11.5C13.05 11.4 14.25 10.2 14.25 8.65C14.25 4.85 11.45 1.75 8 1.75Z',
    },
    dot(5, 8, 0.9),
    dot(6.5, 5, 0.9),
    dot(10, 4.75, 0.9),
    dot(11.75, 7.75, 0.9),
  ],
  archive: [
    { d: sq(1.75, 2.75, 12.5, 3.5, 1.5) },
    { d: 'M3 6.25V11.75C3 12.85 3.65 13.5 4.75 13.5H11.25C12.35 13.5 13 12.85 13 11.75V6.25' },
    { d: 'M6.5 8.75H9.5' },
  ],
  building: [
    { d: 'M3 14.25V3.75C3 2.65 3.65 2 4.75 2H9.25C10.35 2 11 2.65 11 3.75V14.25' },
    { d: 'M11 7H12C13.1 7 13.75 7.65 13.75 8.75V14.25' },
    { d: 'M1.75 14.25H14.25' },
    dot(5.5, 5, 0.75),
    dot(8.5, 5, 0.75),
    dot(5.5, 8, 0.75),
    dot(8.5, 8, 0.75),
    { d: 'M6.25 14.25V11.75H7.75V14.25' },
  ],
  clipboard: [
    { d: 'M5.5 2.75H4.75C3.65 2.75 2.75 3.4 2.75 4.75V12.25C2.75 13.6 3.65 14.25 4.75 14.25H11.25C12.35 14.25 13.25 13.6 13.25 12.25V4.75C13.25 3.4 12.35 2.75 11.25 2.75H10.5' },
    { d: sq(5.5, 1.5, 5, 2.75, 1) },
    { d: 'M5.25 8L6.25 9L8 7' },
    { d: 'M9.5 8H10.75' },
    { d: 'M5.25 11.5H10.75' },
  ],
  // The tail leaves the bottom edge clear of the corner's curve.
  message: [{ d: sq(2, 2.25, 12, 9, 3, 0.8, 6.75) }, dot(5.5, 6.75), dot(8, 6.75), dot(10.5, 6.75)],
  note: [
    { d: sq(3, 1.75, 10, 12.5, 2.5) },
    { d: 'M5.75 5.5H10.25' },
    { d: 'M5.75 8H10.25' },
    { d: 'M5.75 10.5H8.25' },
  ],
  users: [
    { c: [6, 5.5, 2.25] },
    { d: 'M2 13.25C2.4 10.9 4 9.75 6 9.75C8 9.75 9.6 10.9 10 13.25' },
    { d: 'M10.5 3.5C11.65 3.5 12.5 4.35 12.5 5.5C12.5 6.65 11.65 7.5 10.5 7.5' },
    { d: 'M11.75 9.9C13 10.3 13.8 11.35 14 12.75' },
  ],

  /* ---- Contact ---- */
  mail: [
    { d: sq(2, 3, 12, 10, 3) },
    { d: 'M3 5.75L6.9 8.5C7.55 8.95 8.45 8.95 9.1 8.5L13 5.75' },
  ],
  rss: [
    { d: sq(2, 2, 12, 12, 3.5) },
    dot(5.5, 10.5, 1),
    { d: 'M5.25 7.25C7.1 7.25 8.75 8.9 8.75 10.75' },
    { d: 'M5.25 4.5C8.6 4.5 11.5 7.4 11.5 10.75' },
  ],

  /* ---- Places & things ---- */
  'map-pin': [
    { d: 'M8 14.25C8 14.25 12.75 9.9 12.75 6.5C12.75 3.85 10.6 1.75 8 1.75C5.4 1.75 3.25 3.85 3.25 6.5C3.25 9.9 8 14.25 8 14.25Z' },
    { c: [8, 6.5, 1.75] },
  ],
  // Home. The Mississippi on the right, the Missouri on the left, Des Moines
  // marked in the middle.
  iowa: [
    {
      d: 'M2.25 4H12.25C12.9 5 13.75 5.6 13.6 6.8C13.45 7.9 12.9 8.4 13.5 9.3C13.95 10 13.4 10.8 12.75 11.4L12.4 12.4L11.6 11.5H4C3.6 10.5 3.15 9.6 3.05 8.6C2.9 7.2 2.3 6.1 2.25 4Z',
    },
    dot(7.75, 7.75, 1),
  ],
  newspaper: [
    { d: sq(2, 2.5, 12, 11, 2.5) },
    { d: sq(4.25, 5, 3.75, 3, 0.75), solid: true },
    { d: 'M9.75 5.5H11.75' },
    { d: 'M9.75 7.75H11.75' },
    { d: 'M4.25 10.75H11.75' },
  ],
  book: [{ d: sq(3, 1.75, 10, 12.5, 2) }, { d: 'M5.75 1.75V14.25' }, { d: 'M8.25 5H10.5' }],
  // Harvous: an open Bible, ribbon down the middle.
  'book-open': [
    { d: 'M8 4.25C6.6 3.2 4.6 2.75 2 2.75V12.25C4.6 12.25 6.6 12.7 8 13.75C9.4 12.7 11.4 12.25 14 12.25V2.75C11.4 2.75 9.4 3.2 8 4.25Z' },
    { d: 'M8 4.25V13.75' },
  ],
  bookmark: [{ d: 'M4 3.75C4 2.6 4.6 2 5.75 2H10.25C11.4 2 12 2.6 12 3.75V14L8 11L4 14Z' }],
  microphone: [
    { d: sq(5.5, 1.75, 5, 8, 2.5) },
    { d: 'M3.25 7.75C3.25 10.4 5.4 12.5 8 12.5C10.6 12.5 12.75 10.4 12.75 7.75' },
    { d: 'M8 12.5V14.25' },
  ],
  // An open-end wrench, handle down to the left. Computed along its axis.
  wrench: [
    {
      d: 'M5.02 12.75A1.25 1.25 0 0 1 3.25 10.98L7.5 6.74A3.25 3.25 0 0 1 11.89 2.56L10.32 4.12A1.1 1.1 0 0 0 11.88 5.68L13.44 4.12A3.25 3.25 0 0 1 9.26 8.5Z',
    },
  ],
  laptop: [{ d: sq(3, 3, 10, 7.5, 2) }, { d: 'M1.75 12.75H14.25' }],
  // Sitcoms: an old set with rabbit ears.
  tv: [{ d: sq(2, 4.5, 12, 9, 2.5) }, { d: 'M5.5 1.75L8 4.25L10.5 1.75' }],
  // A gamepad: soft shoulders, round grips, a d-pad and two buttons.
  controller: [
    {
      d: 'M5 4H11C13.1 4 14.3 5.4 14.6 7.6L14.9 10.1C15.1 11.9 13.4 12.9 12.1 11.9L10.9 10.9C10.6 10.65 10.25 10.5 9.85 10.5H6.15C5.75 10.5 5.4 10.65 5.1 10.9L3.9 11.9C2.6 12.9 0.9 11.9 1.1 10.1L1.4 7.6C1.7 5.4 2.9 4 5 4Z',
    },
    { d: 'M4.75 6V8.5' },
    { d: 'M3.5 7.25H6' },
    dot(10.75, 6.5, 0.8),
    dot(12, 8, 0.8),
  ],
  // Lego: one brick, two studs.
  lego: [
    { d: sq(2, 6, 12, 7.5, 2) },
    { d: 'M4 6V4.25C4 3.7 4.2 3.5 4.75 3.5H6.25C6.8 3.5 7 3.7 7 4.25V6' },
    { d: 'M9 6V4.25C9 3.7 9.2 3.5 9.75 3.5H11.25C11.8 3.5 12 3.7 12 4.25V6' },
  ],
  bolt: [{ d: 'M9 1.75L3.75 9H8L7 14.25L12.25 7H8Z' }],
  // F1: a chequered flag on its pole.
  flag: [
    { d: 'M3 14.25V2.25' },
    { d: 'M3 2.75H12.75V9.25H3' },
    { d: 'M5.5 2.75H8V6H5.5Z', solid: true },
    { d: 'M10.25 2.75H12.75V6H10.25Z', solid: true },
    { d: 'M3 6H5.5V9.25H3Z', solid: true },
    { d: 'M8 6H10.25V9.25H8Z', solid: true },
  ],
  // The drums: a snare, sticks resting on the head.
  drum: [
    { d: 'M2.25 6.5C2.25 5.25 4.8 4.25 8 4.25C11.2 4.25 13.75 5.25 13.75 6.5C13.75 7.75 11.2 8.75 8 8.75C4.8 8.75 2.25 7.75 2.25 6.5Z' },
    { d: 'M2.25 6.5V11C2.25 12.25 4.8 13.25 8 13.25C11.2 13.25 13.75 12.25 13.75 11V6.5' },
    { d: 'M5 8.5V12.75' },
    { d: 'M11 8.5V12.75' },
    { d: 'M6.5 5.75L3.5 1.75' },
    { d: 'M9.5 5.75L12.5 1.75' },
  ],
  // The zoo: Lilo's paw.
  paw: [
    { d: 'M8 8.25C6 8.25 4 10.25 4 12C4 13.3 5 13.75 6 13.5C6.8 13.3 7.3 13 8 13C8.7 13 9.2 13.3 10 13.5C11 13.75 12 13.3 12 12C12 10.25 10 8.25 8 8.25Z' },
    { c: [3, 7, 1.3], solid: true },
    { c: [5.75, 4, 1.4], solid: true },
    { c: [10.25, 4, 1.4], solid: true },
    { c: [13, 7, 1.3], solid: true },
  ],
  church: [
    { d: 'M3.5 14V8.5L8 5L12.5 8.5V14' },
    { d: 'M8 5V1.75' },
    { d: 'M6.75 3H9.25' },
    { d: 'M6.75 14V11.75C6.75 11 7.25 10.5 8 10.5C8.75 10.5 9.25 11 9.25 11.75V14' },
    { d: 'M2.25 14H13.75' },
  ],
  pencil: [
    { d: 'M10.25 2.75L13.25 5.75L5.5 13.5L2.25 13.75L2.5 10.5Z' },
    { d: 'M8.75 4.25L11.75 7.25' },
  ],
  // Koati: a tray, the shape the app keeps its work in.
  tray: [
    { d: 'M2 9.5L3.75 4.25C3.95 3.65 4.4 3.25 5 3.25H11C11.6 3.25 12.05 3.65 12.25 4.25L14 9.5V11.5C14 12.6 13.35 13.25 12.25 13.25H3.75C2.65 13.25 2 12.6 2 11.5Z' },
    { d: 'M2 9.5H5.5L6.5 11H9.5L10.5 9.5H14' },
  ],
  heartbeat: [
    { d: 'M8 13.5C8 13.5 2 10 2 5.9C2 4 3.4 2.6 5.2 2.6C6.4 2.6 7.4 3.2 8 4.1C8.6 3.2 9.6 2.6 10.8 2.6C12.6 2.6 14 4 14 5.9C14 10 8 13.5 8 13.5Z' },
    { d: 'M4.25 7.75H6L7 6L8.5 9.5L9.5 7.75H11.75' },
  ],
  'shield-check': [
    { d: 'M8 1.75L13 3.75V7.5C13 10.6 10.9 13.1 8 14.25C5.1 13.1 3 10.6 3 7.5V3.75Z' },
    { d: 'M5.75 8L7.25 9.5L10.25 6.25' },
  ],
  'file-down': [
    { d: sq(3, 1.75, 10, 12.5, 2.5) },
    { d: 'M8 4.75V10.5' },
    { d: 'M5.5 8L8 10.5L10.5 8' },
  ],
  map: [
    { d: 'M2 4L6 2.5L10 4L14 2.5V12L10 13.5L6 12L2 13.5Z' },
    { d: 'M6 2.5V12' },
    { d: 'M10 4V13.5' },
  ],
  'selection-plus': [
    { d: sq(1.75, 1.75, 9, 9, 2.5), dash: '1.5 2' },
    { d: 'M12.25 10V14.5' },
    { d: 'M10 12.25H14.5' },
  ],
  clapper: [
    { d: 'M2 6H14V11.75C14 12.85 13.35 13.5 12.25 13.5H3.75C2.65 13.5 2 12.85 2 11.75Z' },
    { d: 'M2.25 4.75L12.75 2' },
    { d: 'M2 8.75H14' },
    { d: 'M5.5 6L4.5 8.75' },
    { d: 'M9 6L8 8.75' },
    { d: 'M12.5 6L11.5 8.75' },
  ],
  signature: [
    { d: 'M2 11.75C3.5 11.75 4.75 9.25 5.5 6.75C6 5 5.6 3.75 4.75 3.75C3.6 3.75 3.6 6.5 5.25 9.25C6.4 11.15 7.5 12 8.5 10.5C9.1 9.6 9.6 8.6 10.2 9.8C10.6 10.6 11.2 10.9 12 10.4' },
    { d: 'M2 13.75H14' },
  ],
  folder: [
    { d: 'M2 4.75C2 3.65 2.65 3 3.75 3H6.25L7.75 4.5H12.25C13.35 4.5 14 5.15 14 6.25V11.5C14 12.6 13.35 13.25 12.25 13.25H3.75C2.65 13.25 2 12.6 2 11.5Z' },
    { d: 'M2 7H14' },
  ],
  branch: [
    { c: [4.5, 3.5, 1.5] },
    { c: [4.5, 12.5, 1.5] },
    { c: [11.5, 4.5, 1.5] },
    { d: 'M4.5 5V11' },
    { d: 'M11.5 6C11.5 9.25 4.5 8 4.5 11' },
  ],
} satisfies Record<string, Shape[]>;
