/**
 * The work deck (components/site/WorkDeck.astro). Projects stack in one place: the one leaving fades,
 * the one arriving comes in staggered (its preview, then its pages, then the caption; see site.css).
 * Autoplay moves between projects every 7s, shown by the current tick on the spine filling; it holds
 * while you're hovering or have just used it, and stops when the deck is off screen. Any tick jumps. Each project's
 * pages are on a rail you browse yourself. Swipe sideways on touch to change project.
 * Other scripts can move it with `deck:go` (detail: 'kem' | 'apps' | an index).
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

  function goSlide(n: number) {
    n = (n + total) % total;
    if (n === cur) return;
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
    if (inView) document.dispatchEvent(new CustomEvent('bar:label', { detail: `Work · ${slides[cur].dataset.title}` }));
  }

  // Autoplay
  const DWELL = 7000;
  const playing = !calm();
  let hovering = false, held = false, holdT = 0;
  ticks.style.setProperty('--dur', `${DWELL}ms`);
  function restart() { ticks.classList.remove('is-run'); ticks.getBoundingClientRect(); if (playing) ticks.classList.add('is-run'); sync(); }
  function sync() { ticks.classList.toggle('is-paused', !playing || hovering || held || !inView); }
  function hold() { held = true; sync(); clearTimeout(holdT); holdT = window.setTimeout(() => { held = false; sync(); }, 12000); }
  ticks.addEventListener('animationend', (e) => { if (e.animationName === 'tick-fill') goSlide(cur + 1); });
  tickBtns.forEach((b, i) => b.addEventListener('click', () => { goSlide(i); hold(); }));
  fig.addEventListener('pointerenter', () => { hovering = true; sync(); });
  fig.addEventListener('pointerleave', () => { hovering = false; sync(); });
  new IntersectionObserver(([e]) => {
    inView = e.isIntersecting; sync();
    if (inView) document.dispatchEvent(new CustomEvent('bar:label', { detail: `Work · ${slides[cur].dataset.title}` }));
  }, { threshold: 0.4 }).observe(fig);
  fig.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); goSlide(cur + 1); hold(); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); goSlide(cur - 1); hold(); }
  });

  // Swipe sideways on touch to change project
  let sx = 0, sy = 0;
  track.addEventListener('pointerdown', (e) => { sx = e.clientX; sy = e.clientY; hold(); });
  track.addEventListener('pointerup', (e) => {
    if (e.pointerType === 'mouse') return;
    const dx = e.clientX - sx, dy = e.clientY - sy;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.5) goSlide(cur + (dx < 0 ? 1 : -1));
  });

  document.addEventListener('deck:go', (e) => {
    const d = (e as CustomEvent<string | number>).detail;
    const n = d === 'kem' ? slides.findIndex((s) => s.dataset.partner === 'Kem Design') : d === 'apps' ? slides.findIndex((s) => s.dataset.kind === 'app') : Number(d);
    goSlide(Math.max(0, n)); hold();
    fig.scrollIntoView({ block: 'center', behavior: calm() ? 'auto' : 'smooth' });
  });

  update();
}
