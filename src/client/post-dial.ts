/**
 * The posts list's dial (components/site/PostTypePage.astro), set like the work page's: topics link off,
 * and the view sorts (newest, oldest, A–Z), narrows by length (a minute's read, or longer) and
 * groups by year or not. Remembered in this browser.
 */
const list = document.querySelector<HTMLElement>('#writing .list');
const dial = document.querySelector<HTMLElement>('.post-dial');
const btn = document.querySelector<HTMLButtonElement>('[data-pdial-toggle]');
if (list && dial && btn) {
  type Set = { sort: 'new' | 'old' | 'az'; len: 'any' | 'quick' | 'long'; group: boolean };
  const DEFAULTS: Set = { sort: 'new', len: 'any', group: true };
  let set: Set = { ...DEFAULTS };
  try { set = { ...DEFAULTS, ...JSON.parse(localStorage.getItem('hdj:posts') || '{}') }; } catch {}
  const save = () => { try { localStorage.setItem('hdj:posts', JSON.stringify(set)); } catch {} };

  const sections = [...list.querySelectorAll<HTMLElement>('.list__year')];
  const rows = [...list.querySelectorAll<HTMLElement>('.row[data-at]')];
  const count = btn.querySelector('span')!, label = btn.querySelector('b')!, all = label.textContent;

  function apply() {
    list!.classList.add('post-list');
    list!.classList.toggle('is-flat', !set.group);
    rows.forEach((r) => { const m = Number(r.dataset.mins) || 0; r.hidden = set.len === 'quick' ? m > 1 : set.len === 'long' ? m <= 1 : false; });
    sections.forEach((s) => { s.hidden = !s.querySelector('.row:not([hidden])'); });
    const by = (a: HTMLElement, b: HTMLElement) => set.sort === 'az' ? (a.dataset.title ?? '').localeCompare(b.dataset.title ?? '') : (Number(b.dataset.at) - Number(a.dataset.at)) * (set.sort === 'old' ? -1 : 1);
    [...rows].sort(by).forEach((r, i) => { r.style.order = String(i + 1); });
    sections.forEach((s, i) => { s.style.order = String(set.sort === 'old' ? sections.length - i : i); });
    // The button says what's showing
    label.textContent = set.len === 'quick' ? 'One-minute reads' : set.len === 'long' ? 'Longer reads' : all;
    count.textContent = String(rows.filter((r) => !r.hidden).length);
    paint();
  }
  function paint() {
    dial!.querySelectorAll<HTMLButtonElement>('[data-set]').forEach((b) => {
      const [k, v] = b.dataset.set!.split(':'); const on = (set as Record<string, unknown>)[k] === v;
      b.classList.toggle('is-on', on); b.setAttribute('aria-checked', String(on));
    });
    dial!.querySelectorAll<HTMLInputElement>('[data-switch]').forEach((i) => { i.checked = Boolean((set as Record<string, unknown>)[i.dataset.switch!]); });
  }
  dial.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-set]'); if (!b) return;
    const [k, v] = b.dataset.set!.split(':'); (set as Record<string, unknown>)[k] = v; save(); apply();
  });
  dial.querySelectorAll<HTMLInputElement>('[data-switch]').forEach((i) => i.addEventListener('change', () => { (set as Record<string, unknown>)[i.dataset.switch!] = i.checked; save(); apply(); }));
  dial.querySelector('[data-pdial-reset]')!.addEventListener('click', () => { set = { ...DEFAULTS }; save(); apply(); });

  const outside = (e: PointerEvent) => { const t = e.target as Element; if (!dial.contains(t) && !btn.contains(t)) close(); };
  function open() { dial!.hidden = false; btn!.setAttribute('aria-expanded', 'true'); paint(); dial!.classList.remove('is-in'); void dial!.offsetWidth; dial!.classList.add('is-in'); setTimeout(() => document.addEventListener('pointerdown', outside), 0); }
  function close() { dial!.hidden = true; btn!.setAttribute('aria-expanded', 'false'); document.removeEventListener('pointerdown', outside); }
  btn.addEventListener('click', () => (dial.hidden ? open() : close()));
  dial.addEventListener('keydown', (e) => { if (e.key === 'Escape') { close(); btn.focus(); } });

  apply();
}
