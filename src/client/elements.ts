/**
 * The projects page's periodic table (pages/projects/index.astro): open an element to read what it
 * was (one at a time, the note opens under its year), and pick a family to light it up.
 */
const table = document.querySelector<HTMLElement>('.pt');
if (table) {
  let open: HTMLButtonElement | null = null;
  const show = (el: HTMLButtonElement | null) => {
    if (open) { open.setAttribute('aria-expanded', 'false'); document.getElementById(open.getAttribute('aria-controls')!)!.hidden = true; }
    open = el && el !== open ? el : null;
    if (open) { open.setAttribute('aria-expanded', 'true'); document.getElementById(open.getAttribute('aria-controls')!)!.hidden = false; }
  };
  table.addEventListener('click', (e) => {
    const el = e.target instanceof Element ? e.target.closest<HTMLButtonElement>('.pt__el') : null;
    if (el) show(el);
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && open) { const el = open; show(null); el.focus(); } });

  const fams = document.querySelector<HTMLElement>('.pt-fams');
  fams?.addEventListener('click', (e) => {
    const b = e.target instanceof Element ? e.target.closest<HTMLButtonElement>('[data-fam]') : null;
    if (!b) return;
    const fam = b.classList.contains('is-current') ? '' : b.dataset.fam!;
    table.dataset.fam = fam;
    fams.querySelectorAll<HTMLButtonElement>('[data-fam]').forEach((x) => { const on = x.dataset.fam === fam; x.classList.toggle('is-current', on); x.setAttribute('aria-pressed', String(on)); });
  });
}

// The Testament Made mark: hovering an app lights its block
const mark = document.querySelector<HTMLElement>('.tmnow__mark');
document.querySelectorAll<HTMLElement>('.tmnow__apps [data-app]').forEach((a) => {
  const block = mark?.querySelector<HTMLElement>(`[data-for="${a.dataset.app}"]`);
  const on = (v: boolean) => { mark?.classList.toggle('is-pointing', v); block?.classList.toggle('is-on', v); };
  a.addEventListener('pointerenter', () => on(true));
  a.addEventListener('pointerleave', () => on(false));
  a.addEventListener('focus', () => on(true));
  a.addEventListener('blur', () => on(false));
});
