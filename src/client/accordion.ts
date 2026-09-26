/**
 * `.pacc` accordions (project pages, post appendixes): animated open/close,
 * exclusive within a group. Idempotent — safe on astro:page-load.
 */
// Exclusive accordion with animated open/close. We keep `open` true until the
// close transition ends so the panel isn't snapped shut by the UA stylesheet.
function initAccordions() {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const DURATION = 340;
  const closers = new WeakMap<HTMLDetailsElement, (animate: boolean) => void>();

  document.querySelectorAll('.pacc').forEach((rootEl) => {
    const root = rootEl as HTMLElement;
    if (root.dataset.paccInit) return;
    root.dataset.paccInit = '1';

    const items = [...root.querySelectorAll('details.pacc-item')] as HTMLDetailsElement[];

    items.forEach((details) => {
      if (!details.querySelector(':scope > .pacc-body')) {
        const body = document.createElement('div');
        body.className = 'pacc-body';
        const inner = document.createElement('div');
        inner.className = 'pacc-body-inner';
        [...details.children]
          .filter((el) => el.tagName !== 'SUMMARY')
          .forEach((el) => inner.appendChild(el));
        body.appendChild(inner);
        details.appendChild(body);
      }

      if (details.open) details.setAttribute('data-open', '');
      else details.removeAttribute('data-open');

      let closingTimer = 0;

      const closeItem = (animate: boolean) => {
        if (closingTimer) window.clearTimeout(closingTimer);
        if (!details.hasAttribute('data-open') && !details.open) return;
        details.removeAttribute('data-open');
        if (!animate || reduceMotion) {
          details.open = false;
          closingTimer = 0;
          return;
        }
        details.open = true;
        closingTimer = window.setTimeout(() => {
          details.open = false;
          closingTimer = 0;
        }, DURATION);
      };

      const openItem = () => {
        if (closingTimer) {
          window.clearTimeout(closingTimer);
          closingTimer = 0;
        }
        items.forEach((other) => {
          if (other !== details) closers.get(other)?.(true);
        });
        details.open = true;
        requestAnimationFrame(() => details.setAttribute('data-open', ''));
      };

      closers.set(details, closeItem);

      details.querySelector('summary')?.addEventListener('click', (e) => {
        e.preventDefault();
        if (details.hasAttribute('data-open')) closeItem(true);
        else openItem();
      });
    });

    requestAnimationFrame(() => root.classList.add('is-ready'));
  });
}
initAccordions();
document.addEventListener('astro:page-load', initAccordions);
