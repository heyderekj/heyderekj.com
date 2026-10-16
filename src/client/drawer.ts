/**
 * The page drawer (components/site/Browser.astro with `drawer`): the sidebar button in a preview's
 * toolbar slides its rail of pages out or back. In the deck one switch covers every project.
 * The choice is remembered in this browser.
 */
const KEY = 'hdj:drawer';
const read = () => { try { return localStorage.getItem(KEY) === 'open'; } catch { return false; } };
const write = (open: boolean) => { try { localStorage.setItem(KEY, open ? 'open' : 'closed'); } catch { /* private window: lasts this visit */ } };

function set(root: HTMLElement, open: boolean, animate: boolean) {
  root.dataset.drawer = open ? 'open' : 'closed';
  root.querySelectorAll<HTMLElement>('[data-drawer-toggle]').forEach((b) => {
    b.setAttribute('aria-expanded', String(open));
    b.setAttribute('aria-label', open ? 'Hide pages' : `Show all ${b.dataset.count} pages`);
  });
  if (open && animate && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    root.classList.remove('is-opening'); void root.offsetWidth; root.classList.add('is-opening');
    window.setTimeout(() => root.classList.remove('is-opening'), 900);
  }
}

const roots = [...document.querySelectorAll<HTMLElement>('[data-drawer]')];
if (roots.length && !document.documentElement.dataset.drawerReady) {
  document.documentElement.dataset.drawerReady = '1';
  const open = read();
  roots.forEach((r) => set(r, open, false));
  document.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest('[data-drawer-toggle]'); if (!b) return;
    const root = b.closest<HTMLElement>('[data-drawer]'); if (!root) return;
    const next = root.dataset.drawer !== 'open';
    set(root, next, true);
    write(next);
  });
}
