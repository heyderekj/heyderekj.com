/**
 * Plays icons' morph loops (lib/icons/morphs.ts). An icon with `data-morph`
 * moves its own strokes from the drawing through each frame and back, on a
 * soft spring — the icon reshapes rather than wiggles. Moves chained with no
 * rest between them (a flag waving, sticks on a drum) ease in and out like a
 * pendulum so they flow into each other instead of stopping and starting.
 *
 * `.icon--loop` plays while it's on screen; `.icon--loop-hover` while its
 * host (nearest link or button, else its parent) is hovered or focused, and
 * always finishes back at the drawing. Nothing moves under reduced motion.
 */
type Packed = { s: [number, string, number][]; r: number; x: number; y: number; k: number; h: number; snap: boolean };
type Shape = { cmds: { c: string; k: number }[]; n: number[]; o: number };
type State = { shapes: Shape[]; r: number; x: number; y: number; k: number };


/** A soft spring (ζ 0.82): settles by t = 1 with the barest overshoot. */
function spring(t: number): number {
  if (t >= 1) return 1;
  const z = 0.82;
  const w = 9;
  const wd = w * Math.sqrt(1 - z * z);
  return 1 - Math.exp(-z * w * t) * (Math.cos(wd * t) + ((z * w) / wd) * Math.sin(wd * t));
}

/** In and out, for moves that chain straight into the next one. */
const sine = (t: number) => (t >= 1 ? 1 : 0.5 - Math.cos(Math.PI * t) / 2);

function parse(d: string): Shape {
  const cmds: Shape['cmds'] = [];
  const n: number[] = [];
  for (const m of d.matchAll(/([MLCZA])([^MLCZA]*)/g)) {
    const nums = (m[2].match(/-?\d*\.?\d+(?:e-?\d+)?/gi) ?? []).map(Number);
    cmds.push({ c: m[1], k: nums.length });
    n.push(...nums);
  }
  return { cmds, n, o: 1 };
}

function build(s: Shape): string {
  let i = 0;
  return s.cmds.map(({ c, k }) => c + s.n.slice(i, (i += k)).map((v) => +v.toFixed(3)).join(' ')).join('');
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

class Morph {
  private paths: SVGPathElement[];
  private base: State;
  private frames: State[];
  private snaps: boolean[];
  private holds: number[];
  private now: State;
  private running = false;
  private move: number;
  private rest: number;
  private stopRequested = false;

  constructor(private svg: SVGSVGElement) {
    this.paths = [...svg.querySelectorAll<SVGPathElement>(':scope > path')];
    const shapes = this.paths.map((p) => parse(p.getAttribute('d') ?? ''));
    this.base = { shapes, r: 0, x: 0, y: 0, k: 1 };
    const packed = JSON.parse(svg.dataset.morph ?? '[]') as Packed[];
    this.frames = packed.map((f) => {
      const next = shapes.map((s) => ({ ...s, n: [...s.n] }));
      for (const [i, d, o] of f.s) next[i] = { ...parse(d), o };
      return { shapes: next, r: f.r, x: f.x, y: f.y, k: f.k ?? 1 };
    });
    this.snaps = packed.map((f) => f.snap);
    this.holds = packed.map((f) => f.h);
    this.now = this.clone(this.base);
    // ms per morph and between loops (lib/icons/morphs.ts TEMPO)
    this.move = Number(svg.dataset.move) || 520;
    this.rest = Number(svg.dataset.rest) || 1100;
  }

  private clone(s: State): State {
    return { ...s, shapes: s.shapes.map((sh) => ({ ...sh, n: [...sh.n] })) };
  }

  private paint(s: State) {
    s.shapes.forEach((sh, i) => {
      const p = this.paths[i];
      if (!p) return;
      p.setAttribute('d', build(sh));
      p.style.opacity = sh.o === 1 ? '' : String(Math.max(0, Math.min(1, sh.o)));
    });
    this.svg.style.transform =
      s.r || s.x || s.y || s.k !== 1 ? `translate(${s.x / 16}em, ${s.y / 16}em) rotate(${s.r}deg) scale(${s.k})` : '';
  }

  private tween(to: State, ease: (t: number) => number = spring): Promise<void> {
    const from = this.clone(this.now);
    return new Promise((done) => {
      const t0 = performance.now();
      const step = (t: number) => {
        const p = Math.min(1, (t - t0) / this.move);
        const e = ease(p);
        const s: State = {
          r: lerp(from.r, to.r, e),
          x: lerp(from.x, to.x, e),
          y: lerp(from.y, to.y, e),
          k: lerp(from.k, to.k, e),
          shapes: from.shapes.map((a, i) => {
            const b = to.shapes[i];
            return { cmds: a.cmds, n: a.n.map((v, k) => lerp(v, b.n[k], e)), o: lerp(a.o, b.o, sine(p)) };
          }),
        };
        this.now = s;
        this.paint(s);
        if (p < 1) requestAnimationFrame(step);
        else {
          this.now = this.clone(to);
          this.paint(this.now);
          done();
        }
      };
      requestAnimationFrame(step);
    });
  }

  private wait(ms: number) {
    return new Promise((r) => setTimeout(r, ms));
  }

  async play(loop: boolean) {
    if (this.running) {
      this.stopRequested = !loop;
      return;
    }
    this.running = true;
    this.stopRequested = !loop;
    do {
      for (let i = 0; i < this.frames.length; i++) {
        // Chained moves (no rest on either side) flow; others settle on a spring.
        const chained = i > 0 && this.holds[i - 1] === 0;
        await this.tween(this.frames[i], chained || this.holds[i] === 0 ? sine : spring);
        if (this.snaps[i]) {
          this.now = this.clone(this.base);
          this.paint(this.now);
          break;
        }
        if (this.holds[i]) await this.wait(this.holds[i]);
        if (i === this.frames.length - 1) {
          // Turns that went all the way round come home without unwinding.
          const home = this.clone(this.base);
          home.r = Math.round(this.now.r / 360) * 360;
          await this.tween(home, this.holds[i] === 0 ? sine : spring);
          this.now = this.clone(this.base);
          this.paint(this.now);
        }
      }
      if (this.stopRequested) break;
      await this.wait(this.rest);
    } while (!this.stopRequested);
    this.running = false;
  }

  stop() {
    this.stopRequested = true;
  }
}

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
const morphs = new WeakMap<SVGSVGElement, Morph>();
const get = (svg: SVGSVGElement) => {
  let m = morphs.get(svg);
  if (!m) morphs.set(svg, (m = new Morph(svg)));
  return m;
};

function init() {
  if (reduce.matches) return;

  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      const m = get(e.target as SVGSVGElement);
      if (e.isIntersecting) m.play(true);
      else m.stop();
    }
  });
  document.querySelectorAll<SVGSVGElement>('svg.icon--loop[data-morph]').forEach((svg) => io.observe(svg));

  document.querySelectorAll<SVGSVGElement>('svg.icon--loop-hover[data-morph]').forEach((svg) => {
    const host = svg.closest<HTMLElement>('a, button, [data-icon-host]') ?? svg.parentElement;
    if (!host) return;
    const start = () => get(svg).play(true);
    const end = () => get(svg).stop();
    host.addEventListener('pointerenter', start);
    host.addEventListener('pointerleave', end);
    host.addEventListener('focusin', start);
    host.addEventListener('focusout', end);
  });
}

init();
