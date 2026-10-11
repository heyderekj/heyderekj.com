/**
 * The squircle — the one container shape in these icons, and the corner on
 * everything else with corners.
 *
 * Ported from Koati's icon construction (heyderekj/koati @ 20c9682,
 * resources/js/lib/squircle.ts). Only the construction comes across; every
 * glyph in this set is drawn new.
 *
 * Not a rounded rect: `rx` glues a quarter-circle to a straight edge and the
 * eye catches the seam. Each corner here is a single cubic whose handles reach
 * most of the way to the corner, so the edge eases into the bend.
 *
 * `r` is how far the bend reaches along each edge (half the side = a full
 * squircle). `smooth` is how far toward the corner the handles reach: 0.55 is
 * a circle's quarter, 1 a square corner, 0.8 the house value.
 *
 * `tail`, when given, is where a speech bubble's point leaves the bottom edge.
 */
export const SMOOTH = 0.8;

export function squircle(
  x: number,
  y: number,
  w: number,
  h: number,
  r = Math.min(w, h) / 2,
  smooth = SMOOTH,
  tail?: number,
): string {
  const k = r * (1 - smooth);
  const right = x + w;
  const bottom = y + h;
  const n = (v: number) => +v.toFixed(3);

  return [
    `M${n(x + r)} ${n(y)}`,
    `H${n(right - r)}`,
    `C${n(right - k)} ${n(y)} ${n(right)} ${n(y + k)} ${n(right)} ${n(y + r)}`,
    `V${n(bottom - r)}`,
    `C${n(right)} ${n(bottom - k)} ${n(right - k)} ${n(bottom)} ${n(right - r)} ${n(bottom)}`,
    tail === undefined
      ? `H${n(x + r)}`
      : `H${n(tail + 1.5)}L${n(tail)} ${n(bottom + 2)}L${n(tail - 1.5)} ${n(bottom)}H${n(x + r)}`,
    `C${n(x + k)} ${n(bottom)} ${n(x)} ${n(bottom - k)} ${n(x)} ${n(bottom - r)}`,
    `V${n(y + r)}`,
    `C${n(x)} ${n(y + k)} ${n(x + k)} ${n(y)} ${n(x + r)} ${n(y)}`,
    'Z',
  ].join('');
}
