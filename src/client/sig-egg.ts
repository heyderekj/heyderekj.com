/**
 * The watermark signature (layouts/Site.astro) is also the way home: click it to go back to the
 * home page (on the home page it signs itself again). The easter egg: triple-click it and it darkens,
 * signs itself again, and steps aside so you can countersign beside it. Your signature is kept in
 * this browser and sits next to mine at the top of every page. Triple-click again to re-sign.
 */
import { toast } from './toast';

const wm = document.querySelector<HTMLElement>('.wm');
const inner = wm?.querySelector<HTMLElement>('.wm__in');
const mine = wm?.querySelector<HTMLElement>('.sig');
if (wm && inner && mine) {
  type Stroke = [number, number][];
  const KEY = 'hdj:countersign';
  const load = (): Stroke[] => { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; } };
  const save = (s: Stroke[]) => { try { s.length ? localStorage.setItem(KEY, JSON.stringify(s)) : localStorage.removeItem(KEY); } catch { /* private window */ } };
  const calm = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

  // The box their signature lives in, beside mine
  const guest = document.createElement('div');
  guest.className = 'wm__guest';
  inner.append(guest);

  /** A smooth path through the points of each stroke, in a 1000 × 260 box. */
  const pathFor = (strokes: Stroke[]) => strokes.map((s) => {
    if (s.length < 2) { const [x, y] = s[0] ?? [0, 0]; return `M${x * 1000} ${y * 260}h0.1`; }
    let d = `M${s[0][0] * 1000} ${s[0][1] * 260}`;
    for (let i = 1; i < s.length - 1; i++) {
      const mx = (s[i][0] + s[i + 1][0]) / 2, my = (s[i][1] + s[i + 1][1]) / 2;
      d += ` Q${s[i][0] * 1000} ${s[i][1] * 260} ${mx * 1000} ${my * 260}`;
    }
    const l = s[s.length - 1];
    return `${d} L${l[0] * 1000} ${l[1] * 260}`;
  }).join(' ');
  function showGuest(strokes: Stroke[]) {
    wm!.classList.toggle('is-cosigned', strokes.length > 0);
    guest.innerHTML = strokes.length ? `<svg viewBox="0 0 1000 260" preserveAspectRatio="none"><path d="${pathFor(strokes)}" /></svg>` : '';
  }
  showGuest(load());

  // ---- Signing
  let strokes: Stroke[] = [], drawing: Stroke | null = null, canvas: HTMLCanvasElement | null = null, tools: HTMLElement | null = null;
  function redraw() {
    if (!canvas) return;
    const c = canvas.getContext('2d')!, w = canvas.width, h = canvas.height;
    c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, w, h);
    c.setTransform(w / 1000, 0, 0, h / 260, 0, 0);
    c.strokeStyle = getComputedStyle(mine!).color; c.lineCap = 'round'; c.lineJoin = 'round';
    c.lineWidth = (2.4 * (w / canvas.clientWidth)) * (1000 / w); // 2.4 CSS px, in the 1000-wide path space
    c.stroke(new Path2D(pathFor(strokes)));
  }
  function open() {
    if (canvas) return;
    wm!.classList.add('is-signing', 'is-cosigned');
    mine!.classList.remove('is-drawn', 'is-signing');
    if (!calm()) { void mine!.offsetWidth; mine!.classList.add('is-signing'); }
    else mine!.classList.add('is-drawn');
    strokes = load();
    guest.innerHTML = '';
    canvas = document.createElement('canvas');
    canvas.className = 'wm__pad';
    guest.append(canvas);
    const r = guest.getBoundingClientRect(), dpr = Math.min(2, devicePixelRatio || 1);
    canvas.width = Math.round(r.width * dpr); canvas.height = Math.round(r.height * dpr);
    redraw();
    tools = document.createElement('div');
    tools.className = 'wm__tools';
    tools.innerHTML = '<span>Your turn: sign beside mine</span><button data-act="clear">Clear</button><button data-act="cancel">Cancel</button><button data-act="done" class="is-primary">Done</button>';
    inner!.append(tools);
    tools.addEventListener('click', (e) => {
      const act = (e.target as HTMLElement).closest<HTMLElement>('[data-act]')?.dataset.act;
      if (act === 'clear') { strokes = []; redraw(); }
      if (act === 'cancel') close(false);
      if (act === 'done') close(true);
    });
    const at = (e: PointerEvent): [number, number] => { const b = canvas!.getBoundingClientRect(); return [Math.min(1, Math.max(0, (e.clientX - b.left) / b.width)), Math.min(1, Math.max(0, (e.clientY - b.top) / b.height))]; };
    canvas.addEventListener('pointerdown', (e) => { e.preventDefault(); canvas!.setPointerCapture(e.pointerId); drawing = [at(e)]; strokes.push(drawing); redraw(); });
    canvas.addEventListener('pointermove', (e) => { if (!drawing) return; const p = at(e), q = drawing[drawing.length - 1]; if (Math.hypot(p[0] - q[0], (p[1] - q[1]) / 3.8) > 0.003) { drawing.push(p); redraw(); } });
    const end = () => { drawing = null; };
    canvas.addEventListener('pointerup', end); canvas.addEventListener('pointercancel', end);
    document.addEventListener('keydown', onKey);
  }
  function onKey(e: KeyboardEvent) { if (e.key === 'Escape') close(false); }
  function close(keep: boolean) {
    document.removeEventListener('keydown', onKey);
    canvas?.remove(); tools?.remove(); canvas = null; tools = null;
    wm!.classList.remove('is-signing');
    if (keep) { strokes = strokes.map((s) => s.map(([x, y]) => [Math.round(x * 1000) / 1000, Math.round(y * 1000) / 1000] as [number, number])); save(strokes); }
    showGuest(keep ? strokes : load());
    if (keep) toast(strokes.length ? 'Signed. Thanks for stopping by.' : 'Signature cleared');
  }

  // ---- Click my signature to go home; triple-click it to countersign.
  // Only the watermark's own space counts: text, links and controls sitting over it keep working.
  const overMe = (e: MouseEvent) => {
    if (canvas || !(e.target instanceof Element) || e.target.closest('a, button, input, textarea, h1, p, li, .wchip, .bar, .fig, .browser, .byline, .badge, .essay__meta, .work-chips')) return false;
    const r = mine!.getBoundingClientRect();
    return e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
  };
  const resign = () => { if (calm()) return; mine!.classList.remove('is-drawn', 'is-signing'); void mine!.offsetWidth; mine!.classList.add('is-signing'); };
  let clicks = 0, clickT = 0;
  document.addEventListener('click', (e) => {
    if (!overMe(e) || !getSelection()?.isCollapsed) { clicks = 0; return; }
    clicks++; clearTimeout(clickT);
    if (clicks >= 3) { clicks = 0; open(); return; }
    clickT = window.setTimeout(() => {
      if (clicks === 1) { if (location.pathname === '/') resign(); else location.href = '/'; }
      clicks = 0;
    }, 330);
  });
  document.addEventListener('mousemove', (e) => document.body.classList.toggle('wm-hot', overMe(e)), { passive: true });
}
