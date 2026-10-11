/**
 * Just enough path handling to morph icons: parse absolute M/L/H/V/C/Z (and
 * arcs, carried through untouched), turn H/V into L so shapes can be
 * transformed and interpolated, and move points with a function.
 *
 * Two paths morph only if their command letters match one for one — the same
 * rule Benji Taylor's morphing icons work by: the same lines, moved.
 */
export type Seg = { c: string; n: number[] };
type Pt = [number, number];

export function parse(d: string): Seg[] {
  const out: Seg[] = [];
  const re = /([MLHVCZA])([^MLHVCZA]*)/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(d))) {
    const nums = (m[2].match(/-?\d*\.?\d+(?:e-?\d+)?/gi) ?? []).map(Number);
    out.push({ c: m[1], n: nums });
  }
  return out;
}

/** H/V become L; everything stays absolute. */
export function normalize(d: string): Seg[] {
  let x = 0;
  let y = 0;
  let sx = 0;
  let sy = 0;
  return parse(d).map((s) => {
    switch (s.c) {
      case 'M':
        [x, y] = [s.n[0], s.n[1]];
        [sx, sy] = [x, y];
        return s;
      case 'L':
        [x, y] = [s.n[0], s.n[1]];
        return s;
      case 'H':
        x = s.n[0];
        return { c: 'L', n: [x, y] };
      case 'V':
        y = s.n[0];
        return { c: 'L', n: [x, y] };
      case 'C':
        [x, y] = [s.n[4], s.n[5]];
        return s;
      case 'A':
        [x, y] = [s.n[5], s.n[6]];
        return s;
      case 'Z':
        [x, y] = [sx, sy];
        return s;
      default:
        throw new Error(`Icon paths must be absolute; got "${s.c}"`);
    }
  });
}

const f = (n: number) => +n.toFixed(3);

export function serialize(segs: Seg[]): string {
  return segs.map((s) => s.c + s.n.map(f).join(' ')).join('');
}

/** Move every point (not arc radii/flags) through `fn`. */
export function mapPoints(d: string, fn: (p: Pt) => Pt): string {
  return serialize(
    normalize(d).map((s) => {
      if (s.c === 'A') {
        const [px, py] = fn([s.n[5], s.n[6]]);
        return { c: 'A', n: [...s.n.slice(0, 5), px, py] };
      }
      const n: number[] = [];
      for (let i = 0; i < s.n.length; i += 2) n.push(...fn([s.n[i], s.n[i + 1]]));
      return { c: s.c, n };
    }),
  );
}

export const translate = (d: string, dx: number, dy: number) => mapPoints(d, ([x, y]) => [x + dx, y + dy]);
export const scale = (d: string, kx: number, ky = kx, cx = 8, cy = 8) =>
  mapPoints(d, ([x, y]) => [cx + (x - cx) * kx, cy + (y - cy) * ky]);
export const rotate = (d: string, deg: number, cx = 8, cy = 8) => {
  const a = (deg * Math.PI) / 180;
  const [c, s] = [Math.cos(a), Math.sin(a)];
  return mapPoints(d, ([x, y]) => [cx + (x - cx) * c - (y - cy) * s, cy + (x - cx) * s + (y - cy) * c]);
};

export const signature = (d: string) => normalize(d).map((s) => s.c).join('');
