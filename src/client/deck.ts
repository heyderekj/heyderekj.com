/**
 * The work deck (components/site/WorkDeck.astro). Autoplay moves between projects every 7s,
 * shown by a ring filling around the pause button; it holds while you're hovering or have just
 * used it, and stops when the deck is off screen. Each project's pages are on a rail you browse yourself.
 * Other scripts can move it with `deck:go` (detail: 'kem' | 'apps' | an index).
 */
import { calm } from './toast';

const fig = document.getElementById('fig-deck');
const track = document.getElementById('deckTrack');
if (fig && track) {
  const slides = [...track.querySelectorAll<HTMLElement>('.wslide')];
  const total = slides.length;
  const $ = (id: string) => document.getElementById(id)!;
  const bar = $('deckBar') as unknown as SVGCircleElement, play = $('deckPlay');
  const step = () => track.clientWidth + 16;
  const deckIndex = () => Math.round(track.scrollLeft / Math.max(1, step()));
  const goSlide = (n: number) => { n = (n + total) % total; track.scrollTo({ left: n * step(), behavior: calm() ? 'auto' : 'smooth' }); };

  // Picking a page on the rail swaps the big preview
  track.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest<HTMLElement>('[data-page-to]'); if (!b) return;
    const slide = b.closest('.wslide')!, n = Number(b.dataset.pageTo);
    slide.querySelectorAll<HTMLElement>('[data-page]').forEach((el, i) => { el.classList.toggle('is-on', i === n); if (el.classList.contains('mesh')) el.style.opacity = i === n ? '1' : '0'; });
    slide.querySelectorAll('[data-page-to]').forEach((x, i) => x.setAttribute('aria-current', String(i === n)));
    hold();
  });

  let lastIndex = -1;
  function update() {
    const n = Math.min(deckIndex(), total - 1);
    $('deckCount').textContent = `${n + 1} / ${total}`;
    const kind = slides[n].dataset.kind;
    fig!.querySelectorAll('[data-jump]').forEach((b) => b.setAttribute('aria-pressed', String((b as HTMLElement).dataset.jump === kind)));
    if (n !== lastIndex) {
      lastIndex = n; restart();
      if (inView) document.dispatchEvent(new CustomEvent('bar:label', { detail: `Work · ${slides[n].dataset.title}` }));
    }
  }

  // Autoplay
  const DWELL = 7000;
  let playing = !calm(), hovering = false, held = false, inView = false, holdT = 0;
  bar.style.setProperty('--dur', `${DWELL}ms`);
  function restart() { bar.classList.remove('is-run'); bar.getBoundingClientRect(); if (playing) bar.classList.add('is-run'); sync(); }
  function sync() { bar.classList.toggle('is-paused', !playing || hovering || held || !inView); }
  function hold() { held = true; sync(); clearTimeout(holdT); holdT = window.setTimeout(() => { held = false; sync(); }, 12000); }
  bar.addEventListener('animationend', () => goSlide(deckIndex() + 1));
  fig.addEventListener('pointerenter', () => { hovering = true; sync(); });
  fig.addEventListener('pointerleave', () => { hovering = false; sync(); });
  new IntersectionObserver(([e]) => {
    inView = e.isIntersecting; sync();
    if (inView) document.dispatchEvent(new CustomEvent('bar:label', { detail: `Work · ${slides[Math.min(deckIndex(), total - 1)].dataset.title}` }));
  }, { threshold: 0.4 }).observe(fig);
  play.addEventListener('click', () => { playing = !playing; play.setAttribute('aria-pressed', String(playing)); play.setAttribute('aria-label', playing ? 'Pause' : 'Play'); restart(); });
  $('deckPrev').addEventListener('click', () => { goSlide(deckIndex() - 1); hold(); });
  $('deckNext').addEventListener('click', () => { goSlide(deckIndex() + 1); hold(); });
  fig.querySelectorAll<HTMLElement>('[data-jump]').forEach((b) => b.addEventListener('click', () => { goSlide(slides.findIndex((s) => s.dataset.kind === b.dataset.jump)); hold(); }));
  track.addEventListener('scroll', update, { passive: true });
  track.addEventListener('pointerdown', hold);
  fig.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); goSlide(deckIndex() + 1); hold(); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); goSlide(deckIndex() - 1); hold(); }
  });

  // Always come to rest on exactly one project, after a scroll settles and whenever the width changes
  let settleT = 0, lastIdx = 0;
  const settle = () => { const n = deckIndex(); lastIdx = n; if (Math.abs(track.scrollLeft - n * step()) > 1) track.scrollTo({ left: n * step(), behavior: 'auto' }); update(); };
  track.addEventListener('scroll', () => { clearTimeout(settleT); settleT = window.setTimeout(settle, 140); }, { passive: true });
  new ResizeObserver(() => track.scrollTo({ left: lastIdx * step(), behavior: 'auto' })).observe(track);

  document.addEventListener('deck:go', (e) => {
    const d = (e as CustomEvent<string | number>).detail;
    const n = d === 'kem' ? slides.findIndex((s) => s.dataset.partner === 'Kem Design') : d === 'apps' ? slides.findIndex((s) => s.dataset.kind === 'app') : Number(d);
    goSlide(Math.max(0, n)); hold();
    fig.scrollIntoView({ block: 'center', behavior: calm() ? 'auto' : 'smooth' });
  });

  if (calm()) play.setAttribute('aria-pressed', 'false');
  update();
}
