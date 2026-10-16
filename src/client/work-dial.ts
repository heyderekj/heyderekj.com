/**
 * The Work list's dial panel (components/site/WorkIndex.astro): a settings button beside the studio
 * filters opens a few live controls, set like the deck's: stack (the default), list or grid, sort, design or dev work,
 * grouping by year, and thumbnails. Remembered in this browser.
 */
const list = document.querySelector<HTMLElement>('.work-list');
const dial = document.querySelector<HTMLElement>('.work-dial');
const btn = document.querySelector<HTMLButtonElement>('[data-wdial-toggle]');
if (list && dial && btn) {
  type Set = { layout: 'stack' | 'list' | 'grid'; sort: 'new' | 'old' | 'az'; type: 'all' | 'design' | 'dev'; group: boolean; thumbs: boolean };
  const DEFAULTS: Set = { layout: 'stack', sort: 'new', type: 'all', group: true, thumbs: true };
  let set: Set = { ...DEFAULTS };
  try { set = { ...DEFAULTS, ...JSON.parse(localStorage.getItem('hdj:work') || '{}') }; } catch {}
  if ((set.layout as string) === 'shots') set.layout = 'stack'; // its earlier name
  const save = () => { try { localStorage.setItem('hdj:work', JSON.stringify(set)); } catch {} };

  const sections = [...list.querySelectorAll<HTMLElement>('.list__year')];
  const rows = [...list.querySelectorAll<HTMLElement>('.row[data-at]')];

  function apply() {
    list.classList.toggle('is-grid', set.layout === 'grid');
    list.classList.toggle('is-stack', set.layout === 'stack');
    list.classList.toggle('is-flat', !set.group);
    list.classList.toggle('no-thumbs', !set.thumbs && set.layout === 'list');
    // Type: design covers Design and Design & Development; dev covers Development and both
    rows.forEach((r) => {
      const t = r.dataset.type ?? '';
      r.hidden = set.type === 'design' ? !/design/i.test(t) : set.type === 'dev' ? !/develop/i.test(t) : false;
    });
    sections.forEach((s) => { s.hidden = !s.querySelector('.row:not([hidden])'); });
    // Sort: rows by date or title; year sections follow the date order
    const by = (a: HTMLElement, b: HTMLElement) => set.sort === 'az' ? (a.dataset.title ?? '').localeCompare(b.dataset.title ?? '') : (Number(b.dataset.at) - Number(a.dataset.at)) * (set.sort === 'old' ? -1 : 1);
    [...rows].sort(by).forEach((r, i) => { r.style.order = String(i + 1); });
    sections.forEach((s, i) => { s.style.order = String(set.sort === 'old' ? sections.length - i : i); });
    paint();
  }
  function paint() {
    dial!.querySelectorAll<HTMLButtonElement>('[data-set]').forEach((b) => {
      const [k, v] = b.dataset.set!.split(':'); const on = (set as Record<string, unknown>)[k] === v;
      b.classList.toggle('is-on', on); b.setAttribute('aria-checked', String(on));
    });
    dial!.querySelectorAll<HTMLInputElement>('[data-switch]').forEach((i) => { i.checked = Boolean((set as Record<string, unknown>)[i.dataset.switch!]); });
    dial!.querySelector<HTMLElement>('[data-only="list"]')!.classList.toggle('is-off', set.layout !== 'list');
  }
  dial.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-set]'); if (!b) return;
    const [k, v] = b.dataset.set!.split(':'); (set as Record<string, unknown>)[k] = v; save(); apply();
  });
  dial.querySelectorAll<HTMLInputElement>('[data-switch]').forEach((i) => i.addEventListener('change', () => { (set as Record<string, unknown>)[i.dataset.switch!] = i.checked; save(); apply(); }));
  dial.querySelector('[data-wdial-reset]')!.addEventListener('click', () => { set = { ...DEFAULTS }; save(); apply(); });

  // Open and close, like the deck's dial
  const outside = (e: PointerEvent) => { const t = e.target as Element; if (!dial.contains(t) && !btn.contains(t)) close(); };
  function open() { dial!.hidden = false; btn!.setAttribute('aria-expanded', 'true'); paint(); dial!.classList.remove('is-in'); void dial!.offsetWidth; dial!.classList.add('is-in'); setTimeout(() => document.addEventListener('pointerdown', outside), 0); }
  function close() { dial!.hidden = true; btn!.setAttribute('aria-expanded', 'false'); document.removeEventListener('pointerdown', outside); }
  btn.addEventListener('click', () => (dial.hidden ? open() : close()));
  dial.addEventListener('keydown', (e) => { if (e.key === 'Escape') { close(); btn.focus(); } });

  apply();
}
