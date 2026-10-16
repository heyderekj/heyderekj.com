/**
 * The home paragraph's chips (components/site/Hello.astro). Each opens its preview on whichever
 * side has room; pressing one does the thing it names. On touch, the first tap peeks.
 * Topics filter the writing below, and the bar's menu can ask for a topic too (`topic` event, or ?topic=).
 */
import { calm } from './toast';

const $$ = <T extends HTMLElement>(s: string, r: ParentNode = document) => [...r.querySelectorAll<T>(s)];

// Open each chip's preview where there's room, so it's never cut off by the window
function placePop(chip: HTMLElement) {
  const pop = chip.querySelector<HTMLElement>(':scope > .pop'); if (!pop) return;
  pop.classList.remove('pop--below');
  const room = chip.getBoundingClientRect().top - (pop.offsetHeight + 24);
  pop.classList.toggle('pop--below', room < 0);
  pop.style.marginLeft = '0px';
  const r = pop.getBoundingClientRect(), pad = 12;
  const shift = r.left < pad ? pad - r.left : r.right > innerWidth - pad ? innerWidth - pad - r.right : 0;
  pop.style.marginLeft = `${shift}px`;
}
document.addEventListener('pointerover', (e) => { const c = (e.target as HTMLElement).closest?.<HTMLElement>('.wchip'); if (c && !c.contains(e.relatedTarget as Node)) placePop(c); });
document.addEventListener('focusin', (e) => { const c = (e.target as HTMLElement).closest?.<HTMLElement>('.wchip'); if (c) placePop(c); });

document.addEventListener('click', (e) => {
  const c = (e.target as HTMLElement).closest<HTMLElement>('.wchip[data-act]'); if (!c) return;
  if (matchMedia('(hover: none)').matches && !c.classList.contains('is-on')) {
    $$('.wchip.is-on').forEach((x) => x.classList.remove('is-on')); placePop(c); c.classList.add('is-on'); return;
  }
  c.classList.remove('is-on');
  if (c.dataset.act === 'kem') document.dispatchEvent(new CustomEvent('deck:go', { detail: 'kem' }));
  if (c.dataset.act === 'apps') document.dispatchEvent(new CustomEvent('deck:go', { detail: 'apps' }));
});

// Topics
const note = document.getElementById('topicNote');
let topic: string | null = null;
function applyTopic() {
  if (!note) return;
  const chips = $$<HTMLButtonElement>('.wchip.topic');
  chips.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.tag === topic)));
  const rows = $$<HTMLElement>('#list .row'), years = $$<HTMLElement>('#list .list__year'), more = $$<HTMLElement>('#list .more-rows');
  if (!topic) {
    rows.forEach((r) => (r.hidden = false)); years.forEach((y) => (y.hidden = y.hasAttribute('data-older'))); more.forEach((m) => (m.hidden = false)); note.hidden = true; return;
  }
  const chip = chips.find((b) => b.dataset.tag === topic);
  const tags = (chip?.dataset.tags ?? topic).split(' ');
  let n = 0;
  rows.forEach((r) => { const on = (r.dataset.tags ?? '').split(' ').some((t) => tags.includes(t)); r.hidden = !on; if (on) n++; });
  years.forEach((y) => (y.hidden = !$$('.row', y).some((r) => !r.hidden)));
  more.forEach((m) => (m.hidden = true));
  note.innerHTML = '';
  note.append(`${n} ${n === 1 ? 'post' : 'posts'} about ${chip?.textContent ?? topic} `);
  const clear = document.createElement('button'); clear.dataset.clearTopic = ''; clear.textContent = 'Show all'; note.append(clear);
  note.hidden = false;
}
function setTopic(next: string | null, scroll = true) {
  topic = next; applyTopic();
  if (topic && scroll) note?.scrollIntoView({ block: 'start', behavior: calm() ? 'auto' : 'smooth' });
}
document.addEventListener('click', (e) => {
  const el = e.target as HTMLElement;
  const t = el.closest<HTMLElement>('.wchip.topic');
  if (t) { setTopic(topic === t.dataset.tag ? null : t.dataset.tag!); return; }
  if (el.closest('[data-clear-topic]')) setTopic(null, false);
  if (el.closest('[data-show-older]')) { $$('[data-older]').forEach((s) => (s.hidden = false)); el.closest('.more-rows')?.remove(); }
  if (!el.closest('.wchip')) $$('.wchip.is-on').forEach((x) => x.classList.remove('is-on'));
});
document.addEventListener('topic', (e) => setTopic((e as CustomEvent<string>).detail));
const asked = new URLSearchParams(location.search).get('topic');
if (asked) setTopic(asked);

// The bar says which part of the page you're on
const sections = $$<HTMLElement>('[data-bar-label]');
if (sections.length && document.getElementById('bar')?.dataset.kind === 'home') {
  const visible = new Map<Element, boolean>();
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => visible.set(en.target, en.isIntersecting));
    const first = sections.find((s) => visible.get(s));
    if (first && first.id !== 'fig-deck') document.dispatchEvent(new CustomEvent('bar:label', { detail: first.dataset.barLabel }));
  }, { rootMargin: '-35% 0px -45% 0px' });
  sections.forEach((s) => io.observe(s));
}
