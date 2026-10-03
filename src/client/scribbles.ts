/**
 * Scribbles (components/Scribble.astro): land each targeted note's arrowhead
 * on its target and keep it there. The note moves by the CSS `translate`
 * property, which composes with (and so never fights) its tilt. It's clamped
 * inside its bounds — the nearest [data-scribble-bounds], else the frame —
 * and if that clamp keeps the arrow off target, the note hides instead.
 */

const PAD = 8;
/** How far off target (px) a clamped note may land before it hides itself. */
const MISS = 10;

const boundsOf = (note: HTMLElement) =>
  note.closest<HTMLElement>('[data-scribble-bounds]') ?? note.closest<HTMLElement>('.frame') ?? document.body;

function place(note: HTMLElement) {
  // Hidden by a breakpoint or an inactive gallery slide: nothing to measure.
  if (!note.getClientRects().length) return;
  const tip = note.querySelector<SVGElement>('[data-scribble-tip]');
  const bounds = boundsOf(note);
  const target = bounds.querySelector<HTMLElement>(note.dataset.scribbleTarget ?? '');
  if (!tip || !target) return;

  const r = target.getBoundingClientRect();
  if (!r.width) return;
  const [fx, fy] = (note.dataset.scribbleAt ?? '0.5,0.5').split(',').map(Number);

  note.style.translate = '0px 0px';
  const t = tip.getBoundingClientRect();
  const dx = r.left + fx * r.width - (t.left + t.width / 2);
  const dy = r.top + fy * r.height - (t.top + t.height / 2);

  const box = note.getBoundingClientRect();
  const b = bounds.getBoundingClientRect();
  const x = Math.min(Math.max(dx, b.left + PAD - box.left), b.right - PAD - box.right);
  const y = Math.min(Math.max(dy, b.top + PAD - box.top), b.bottom - PAD - box.bottom);
  note.style.translate = `${Math.round(x)}px ${Math.round(y)}px`;
  note.toggleAttribute('data-scribble-missed', Math.hypot(dx - x, dy - y) > MISS);
  note.setAttribute('data-scribble-placed', '');
}

const placeNow = () =>
  document.querySelectorAll<HTMLElement>('.scribble[data-scribble-target]').forEach(place);

let queued = false;
function placeAll() {
  // A background tab runs no frames, but it still lays out: place right away.
  if (document.hidden) return placeNow();
  if (queued) return;
  queued = true;
  requestAnimationFrame(() => {
    queued = false;
    placeNow();
  });
}

let ro: ResizeObserver | undefined;
function init() {
  const notes = document.querySelectorAll<HTMLElement>('.scribble[data-scribble-target]');
  if (!notes.length) return;
  ro?.disconnect();
  ro = new ResizeObserver(placeAll);
  notes.forEach((note) => ro!.observe(boundsOf(note)));
  placeAll();
  document.fonts?.ready.then(placeAll);
}

init();
document.addEventListener('astro:page-load', init);
window.addEventListener('load', placeAll);
window.addEventListener('resize', placeAll);
// A frame queued while hidden never ran; settle again once shown.
document.addEventListener('visibilitychange', () => {
  queued = false;
  placeAll();
});
// For anything that moves a target without resizing the page.
document.addEventListener('scribbles:place', placeAll);
