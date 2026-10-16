/** A preview with its pages on a rail beside it ([data-rail], outside the home deck): pick a page to show it. */
document.addEventListener('click', (e) => {
  const b = (e.target as HTMLElement).closest<HTMLElement>('[data-rail] [data-page-to]'); if (!b) return;
  const root = b.closest('[data-rail]')!, n = Number(b.dataset.pageTo);
  root.querySelectorAll<HTMLElement>('[data-page]').forEach((el, i) => el.classList.toggle('is-on', i === n));
  root.querySelectorAll('[data-page-to]').forEach((x, i) => x.setAttribute('aria-current', String(i === n)));
});
