/**
 * The work deck (components/site/WorkDeck.astro). Projects stack in one place: the one leaving fades,
 * the one arriving comes in staggered (its preview, then its pages, then the caption; see site.css).
 * Autoplay moves between projects every 7s, shown by the current tick on the spine filling; it holds
 * while you're hovering or have just used it, and stops when the deck is off screen. Any tick jumps. Each project's
 * pages are on a rail you browse yourself. Swipe sideways on touch to change project.
 * Other scripts can move it with `deck:go` (detail: 'kem' | 'apps' | an index).
 * The settings button in each window's toolbar opens a small dial panel: autoplay, pace, the
 * thumbnail rail (client/drawer.ts) and which projects to show. It's remembered in this browser.
 */
import { calm } from './toast';

const fig = document.getElementById('fig-deck');
const track = document.getElementById('deckTrack');
if (fig && track) {
  const slides = [...track.querySelectorAll<HTMLElement>('.wslide')];
  const total = slides.length;
  const ticks = fig.querySelector<HTMLElement>('.deck__ticks')!;
  const tickBtns = [...ticks.querySelectorAll<HTMLButtonElement>('.tick')];
  let cur = 0, inView = false;

  // Settings, from the dial panel
  type Show = 'all' | 'client' | 'app';
  const DEFAULTS = { autoplay: true, pace: 7, show: 'all' as Show };
  let set = { ...DEFAULTS };
  try { set = { ...DEFAULTS, ...JSON.parse(localStorage.getItem('hdj:deck') || '{}') }; } catch {}
  const save = () => { try { localStorage.setItem('hdj:deck', JSON.stringify(set)); } catch {} };
  const order = () => slides.map((s, i) => (set.show === 'all' || s.dataset.kind === set.show ? i : -1)).filter((i) => i >= 0);
  const step = (d: number) => { const o = order(), at = o.indexOf(cur); goSlide(o[((at < 0 ? 0 : at + d) % o.length + o.length) % o.length]); };

  function goSlide(n: number) {
    n = (n + total) % total;
    if (n === cur) return restart();
    const from = slides[cur], to = slides[n];
    from.classList.remove('is-on', 'is-in');
    from.classList.add('is-leaving');
    window.setTimeout(() => from.classList.remove('is-leaving'), 260);
    to.classList.remove('is-leaving', 'is-in');
    void to.offsetWidth; // restart the entrance
    to.classList.add('is-on');
    if (!calm()) to.classList.add('is-in');
    cur = n;
    update();
  }

  // Picking a page on the rail swaps the big preview
  track.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest<HTMLElement>('[data-page-to]'); if (!b) return;
    const slide = b.closest('.wslide')!, n = Number(b.dataset.pageTo);
    slide.querySelectorAll<HTMLElement>('[data-page]').forEach((el, i) => { el.classList.toggle('is-on', i === n); if (el.classList.contains('mesh')) el.style.opacity = i === n ? '1' : '0'; });
    slide.querySelectorAll('[data-page-to]').forEach((x, i) => x.setAttribute('aria-current', String(i === n)));
    hold();
  });

  function update() {
    tickBtns.forEach((b, i) => { b.classList.toggle('is-on', i === cur); b.setAttribute('aria-selected', String(i === cur)); });
    slides.forEach((s, i) => s.setAttribute('aria-hidden', String(i !== cur)));
    restart();
  }

  // Autoplay
  let hovering = false, held = false, holdT = 0, dialing = false;
  const playing = () => !calm() && set.autoplay;
  function restart() { ticks.style.setProperty('--dur', `${set.pace * 1000}ms`); ticks.classList.remove('is-run'); ticks.getBoundingClientRect(); if (playing()) ticks.classList.add('is-run'); sync(); }
  function sync() { ticks.classList.toggle('is-paused', !playing() || hovering || held || dialing || !inView); }
  function hold() { held = true; sync(); clearTimeout(holdT); holdT = window.setTimeout(() => { held = false; sync(); }, 12000); }
  ticks.addEventListener('animationend', (e) => { if (e.animationName === 'tick-fill') step(1); });
  tickBtns.forEach((b, i) => b.addEventListener('click', () => { goSlide(i); hold(); }));
  // Only a mouse or pen hovers: a finger on a phone sets off the same events but may never leave, which held the deck paused
  fig.addEventListener('pointerenter', (e) => { if (e.pointerType === 'touch') return; hovering = true; sync(); });
  fig.addEventListener('pointerleave', (e) => { if (e.pointerType === 'touch') return; hovering = false; sync(); });
  new IntersectionObserver(([e]) => {
    inView = e.isIntersecting; sync();
  }, { threshold: 0.4 }).observe(fig);
  fig.addEventListener('keydown', (e) => {
    if ((e.target as HTMLElement).closest('.dial')) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); step(1); hold(); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); hold(); }
  });

  // Swipe sideways on touch to change project. A tap or swipe holds autoplay; scrolling the page past doesn't
  // (that ends in pointercancel, not pointerup)
  let sx = 0, sy = 0;
  track.addEventListener('pointerdown', (e) => { sx = e.clientX; sy = e.clientY; });
  track.addEventListener('pointerup', (e) => {
    hold();
    if (e.pointerType === 'mouse') return;
    const dx = e.clientX - sx, dy = e.clientY - sy;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.5) step(dx < 0 ? 1 : -1);
  });

  document.addEventListener('deck:go', (e) => {
    const d = (e as CustomEvent<string | number>).detail;
    const n = d === 'kem' ? slides.findIndex((s) => s.dataset.partner === 'Kem Design') : d === 'apps' ? slides.findIndex((s) => s.dataset.kind === 'app') : Number(d);
    if (n >= 0 && !order().includes(n)) { set.show = 'all'; applyShow(); }
    goSlide(Math.max(0, n)); hold();
    fig.scrollIntoView({ block: 'center', behavior: calm() ? 'auto' : 'smooth' });
  });

  // ---- The dial panel
  const dial = fig.querySelector<HTMLElement>('.dial')!;
  let opener: HTMLButtonElement | null = null;
  const $d = <T extends HTMLElement>(s: string) => dial.querySelector<T>(s)!;
  const auto = $d<HTMLInputElement>('[data-dial="autoplay"]'), pace = $d<HTMLInputElement>('[data-dial="pace"]');
  const paceOut = $d<HTMLOutputElement>('[data-dial-out="pace"]'), thumbs = $d<HTMLInputElement>('[data-dial="thumbs"]');
  const segs = [...dial.querySelectorAll<HTMLButtonElement>('[data-show]')];
  function paint() {
    thumbs.checked = track.dataset.drawer === 'open'; auto.checked = set.autoplay; pace.value = String(set.pace); paceOut.textContent = `${set.pace}s`;
    dial.style.setProperty('--fill', `${((set.pace - 4) / 10) * 100}%`);
    pace.closest('.dial__slider')!.classList.toggle('is-off', !set.autoplay);
    segs.forEach((b) => { const on = b.dataset.show === set.show; b.classList.toggle('is-on', on); b.setAttribute('aria-checked', String(on)); });
  }
  function applyShow() {
    const o = order();
    tickBtns.forEach((b, i) => { b.hidden = !o.includes(i); });
    if (!o.includes(cur)) goSlide(o[0]); else restart();
    paint();
  }
  auto.addEventListener('change', () => { set.autoplay = auto.checked; save(); restart(); paint(); });
  pace.addEventListener('input', () => { set.pace = Number(pace.value); save(); paint(); });
  pace.addEventListener('change', () => restart());
  thumbs.addEventListener('change', () => document.dispatchEvent(new CustomEvent('drawer:set', { detail: thumbs.checked })));
  document.addEventListener('drawer:change', () => paint());
  segs.forEach((b) => b.addEventListener('click', () => { set.show = b.dataset.show as Show; save(); applyShow(); }));
  $d('[data-dial-reset]').addEventListener('click', () => { set = { ...DEFAULTS }; save(); document.dispatchEvent(new CustomEvent('drawer:set', { detail: false })); restart(); applyShow(); });

  function openDial(btn: HTMLButtonElement) {
    opener = btn; dialing = true; sync();
    const f = fig.getBoundingClientRect(), r = btn.getBoundingClientRect();
    dial.style.top = `${r.bottom - f.top + 8}px`; dial.style.right = `${Math.max(8, f.right - r.right - 6)}px`;
    dial.hidden = false; btn.setAttribute('aria-expanded', 'true'); paint();
    dial.classList.remove('is-in'); void dial.offsetWidth; dial.classList.add('is-in');
    setTimeout(() => document.addEventListener('pointerdown', outside), 0);
  }
  function closeDial() {
    dial.hidden = true; dialing = false; sync();
    opener?.setAttribute('aria-expanded', 'false');
    document.removeEventListener('pointerdown', outside);
  }
  const outside = (e: PointerEvent) => { const t = e.target as Element; if (!dial.contains(t) && !t.closest?.('[data-dial-toggle]')) closeDial(); };
  track.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-dial-toggle]'); if (!btn) return;
    e.stopPropagation();
    dial.hidden ? openDial(btn) : closeDial();
  });
  dial.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeDial(); opener?.focus(); } });

  applyShow();
  update();
}
