/**
 * The bottom bar (components/Bar.astro). Three states, one pill:
 *   rest   — home mark, where you are, search
 *   menu   — tap the label: places, and how to reach me
 *   search — press / or tap search: results grow upward as you type
 * Changing state animates the pill's size from what it was to what it becomes; nothing on the page moves.
 */
import { calm, copyText, EASE, toast } from './toast';
import type { SearchItem } from '../lib/bar';

const bar = document.getElementById('bar');
if (bar) {
  const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
  const panel = $('barPanel'), results = $('barResults'), menu = $('barMenu');
  const label = $<HTMLButtonElement>('barLabel'), text = $('barText');
  const find = $<HTMLButtonElement>('barFind'), input = $<HTMLInputElement>('barInput');
  type State = 'rest' | 'menu' | 'search';
  let state: State = 'rest';

  function setState(next: State) {
    if (next === state) return;
    const before = bar!.getBoundingClientRect();
    state = next;
    bar!.classList.toggle('is-search', next === 'search');
    bar!.classList.toggle('is-menu', next === 'menu');
    panel.hidden = next === 'rest';
    results.hidden = next !== 'search';
    menu.hidden = next !== 'menu';
    label.setAttribute('aria-expanded', String(next === 'menu'));
    bar!.classList.remove('is-tucked');
    const after = bar!.getBoundingClientRect();
    if (!calm()) bar!.animate(
      [{ width: `${before.width}px`, height: `${before.height}px` }, { width: `${after.width}px`, height: `${after.height}px` }],
      { duration: 360, easing: EASE },
    );
    if (next === 'search') { input.focus(); load().then(render); }
    if (next === 'rest') { input.value = ''; }
  }
  const close = (focus?: HTMLElement) => { setState('rest'); focus?.focus(); };

  label.addEventListener('click', () => setState(state === 'menu' ? 'rest' : 'menu'));
  find.addEventListener('click', () => setState('search'));
  $('barClose').addEventListener('click', () => close(find));
  document.addEventListener('pointerdown', (e) => { if (state !== 'rest' && !bar.contains(e.target as Node)) setState('rest'); });
  document.addEventListener('keydown', (e) => {
    const typing = /INPUT|TEXTAREA|SELECT/.test((e.target as HTMLElement).tagName) || (e.target as HTMLElement).isContentEditable;
    if (e.key === '/' && !typing) { e.preventDefault(); setState('search'); }
    if (e.key === 'Escape' && state !== 'rest') { e.preventDefault(); close(state === 'search' ? find : label); }
  });

  // ---- Search: fetched once, the first time it opens
  let index: Promise<SearchItem[]> | null = null;
  const load = () => (index ??= fetch('/search.json').then((r) => r.json()).catch(() => []));
  let sel = 0, hits: SearchItem[] = [];
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  async function render() {
    const all = await load();
    const q = input.value.trim().toLowerCase(), words = q.split(/\s+/).filter(Boolean);
    hits = q
      ? all.filter((x) => words.every((w) => x.s.includes(w)))
        .sort((a, b) => Number(b.t.toLowerCase().includes(q)) - Number(a.t.toLowerCase().includes(q)))
        .slice(0, 8)
      : all.filter((x) => x.k === 'Post').slice(0, 5);
    sel = 0;
    const mark = (t: string) => {
      let out = esc(t);
      for (const w of words) out = out.replace(new RegExp(w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'ig'), (m) => `<mark>${m}</mark>`);
      return out;
    };
    results.innerHTML = (q ? '' : '<div class="bar__lbl bar__lbl--pad">Latest posts</div>')
      + (hits.length
        ? hits.map((x, i) => `<a class="bar__hit" role="option" id="hit-${i}" aria-selected="${i === sel}" href="${esc(x.h)}" ${x.x ? 'target="_blank" rel="noopener"' : ''}><span class="bar__kind">${x.k}</span><span class="bar__t">${mark(x.t)}</span><span class="bar__y">${x.y}</span></a>`).join('')
        : `<div class="bar__none">Nothing matches “${esc(input.value.trim())}”.</div>`);
    input.setAttribute('aria-activedescendant', hits.length ? 'hit-0' : '');
  }
  function move(by: number) {
    if (!hits.length) return;
    sel = (sel + by + hits.length) % hits.length;
    results.querySelectorAll('.bar__hit').forEach((a, i) => a.setAttribute('aria-selected', String(i === sel)));
    results.querySelector(`#hit-${sel}`)?.scrollIntoView({ block: 'nearest' });
    input.setAttribute('aria-activedescendant', `hit-${sel}`);
  }
  input.addEventListener('input', () => { render(); });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
    if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
    if (e.key === 'Enter') { const a = results.querySelector<HTMLAnchorElement>(`#hit-${sel}`); if (a) { e.preventDefault(); a.click(); } }
  });

  // ---- Menu
  menu.addEventListener('click', async (e) => {
    if ((e.target as HTMLElement).closest('[data-copy-email]')) toast(await copyText('derekj@hey.com') ? 'Email copied' : 'Select the address to copy it');
    if ((e.target as HTMLElement).closest('.bar__fig, .bar__nav a')) setState('rest');
  });

  // ---- Long pages with an "On this page" list (components/ApplicationToc.astro): the menu lists the
  // sections and the label follows the one you're reading
  // Sections come from an "On this page" list, or from headings marked [data-bar-section]
  const fromToc = [...document.querySelectorAll<HTMLAnchorElement>('.app-toc--desktop [data-app-toc-link]')]
    .map((l) => ({ id: l.dataset.appTocLink!, label: l.textContent!.trim() }));
  const fromHeads = [...document.querySelectorAll<HTMLElement>('[data-bar-section]')]
    .map((h) => ({ id: h.id, label: h.dataset.barSection || h.textContent!.trim() }));
  const tocLinks = (fromToc.length ? fromToc : fromHeads).filter((s) => s.id);
  if (tocLinks.length) {
    const group = document.createElement('div');
    group.className = 'bar__group';
    group.innerHTML = '<span class="bar__lbl">On this page</span><div class="bar__figs"></div>';
    const list = group.querySelector('.bar__figs')!;
    const sections = tocLinks.map((s) => {
      const a = document.createElement('a');
      a.className = 'bar__fig'; a.href = `#${s.id}`; a.textContent = s.label;
      list.append(a);
      return { el: document.getElementById(s.id), label: s.label };
    }).filter((s): s is { el: HTMLElement; label: string } => Boolean(s.el));
    menu.prepend(group);
    // The label is the last section whose heading you've scrolled past
    const initial = text.textContent;
    const follow = () => {
      const line = innerHeight * 0.35;
      const at = sections.filter((s) => s.el.getBoundingClientRect().top < line).pop();
      text.textContent = at ? at.label : initial;
    };
    addEventListener('scroll', follow, { passive: true }); follow();
  }

  // ---- What the label says: the section you're in on the home page, set by the page
  document.addEventListener('bar:label', (e) => { text.textContent = (e as CustomEvent<string>).detail; });
  document.addEventListener('bar:highlights', (e) => {
    const n = (e as CustomEvent<number>).detail, el = document.getElementById('barHls');
    if (el) { el.hidden = !n; el.textContent = `${n} highlight${n === 1 ? '' : 's'} kept on this post`; }
  });

  // ---- Reading progress on an essay
  const prog = document.getElementById('barProg');
  const article = document.querySelector<HTMLElement>('[data-bar-progress]');
  if (prog && article) {
    const update = () => {
      const r = article.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (innerHeight * 0.5 - r.top) / Math.max(1, r.height - innerHeight * 0.3)));
      prog.style.transform = `scaleX(${p})`;
    };
    addEventListener('scroll', update, { passive: true }); update();
  }

  // ---- Tuck away while scrolling down quickly; come back on the way up, or when you stop
  let lastY = scrollY, restT = 0;
  addEventListener('scroll', () => {
    const y = scrollY, dy = y - lastY; lastY = y;
    if (state !== 'rest') return;
    if (dy > 8 && y > 240) bar.classList.add('is-tucked');
    if (dy < -4) bar.classList.remove('is-tucked');
    clearTimeout(restT); restT = window.setTimeout(() => bar.classList.remove('is-tucked'), 900);
  }, { passive: true });
}
