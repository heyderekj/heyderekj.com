/**
 * Subtle fade/rise reveals when content enters the viewport.
 * Auto-targets main sections and staggers list/grid items — no per-page markup.
 * Respects prefers-reduced-motion. Re-runs on astro:page-load.
 */

const STAGGER_MAX = 12;
const STAGGER_SEL = [
  '.project-grid',
  '.project-cards',
  '.entries',
  '.brag-feed',
  '.work-gallery',
  '.work-devices',
  '.work-testimonial-list',
  '.work-links',
  '.brag-now__list',
].join(', ');

const SKIP_SEL = 'script, style, noscript, nav, .app-toc, .about-toc, .application-toc';

let observer: IntersectionObserver | null = null;

function reduceMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function blockRoots(main: HTMLElement): HTMLElement[] {
  const kids = [...main.children].filter(
    (el): el is HTMLElement => el instanceof HTMLElement && !el.matches(SKIP_SEL),
  );
  if (kids.length === 1 && kids[0].matches('article, .prose')) {
    return [...kids[0].children].filter(
      (el): el is HTMLElement => el instanceof HTMLElement && !el.matches(SKIP_SEL),
    );
  }
  return kids;
}

function collectTargets(main: HTMLElement): HTMLElement[] {
  const targets: HTMLElement[] = [];
  const seen = new Set<HTMLElement>();

  const add = (el: HTMLElement, index: number) => {
    if (seen.has(el) || el.closest('[data-no-reveal]')) return;
    if (el.matches(SKIP_SEL)) return;
    seen.add(el);
    el.style.setProperty('--reveal-i', String(Math.min(index, STAGGER_MAX)));
    targets.push(el);
  };

  main.querySelectorAll(STAGGER_SEL).forEach((list) => {
    if (!(list instanceof HTMLElement) || list.closest('[data-no-reveal]')) return;
    [...list.children].forEach((kid, i) => {
      if (kid instanceof HTMLElement) add(kid, i);
    });
  });

  for (const block of blockRoots(main)) {
    if (block.closest('[data-no-reveal]')) continue;
    if (block.matches(STAGGER_SEL)) continue;

    const staggerChild = [...block.children].find(
      (c): c is HTMLElement => c instanceof HTMLElement && c.matches(STAGGER_SEL),
    );

    if (staggerChild) {
      [...block.children].forEach((kid, i) => {
        if (!(kid instanceof HTMLElement) || kid.matches(STAGGER_SEL)) return;
        add(kid, i);
      });
      continue;
    }

    add(block, 0);
  }

  return targets;
}

function reset(main: HTMLElement) {
  observer?.disconnect();
  observer = null;
  document.documentElement.classList.remove('reveal-ready');
  main.querySelectorAll<HTMLElement>('.reveal').forEach((el) => {
    el.classList.remove('reveal', 'is-in');
    el.style.removeProperty('--reveal-i');
  });
}

/** True when the element is already on screen (first paint / refresh). */
function inInitialView(el: HTMLElement): boolean {
  const rect = el.getBoundingClientRect();
  const vh = window.innerHeight || document.documentElement.clientHeight;
  return rect.top < vh * 0.94 && rect.bottom > 0;
}

/** Wait two frames so the hidden state paints before we add `.is-in`. */
function afterPaint(fn: () => void) {
  requestAnimationFrame(() => {
    requestAnimationFrame(fn);
  });
}

function initReveal() {
  const main = document.querySelector<HTMLElement>('main.main');
  if (!main) return;

  reset(main);
  if (reduceMotion() || typeof IntersectionObserver === 'undefined') return;

  const targets = collectTargets(main);
  if (targets.length === 0) return;

  targets.forEach((el) => el.classList.add('reveal'));

  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target;
        if (!(el instanceof HTMLElement)) continue;
        el.classList.add('is-in');
        observer?.unobserve(el);
      }
    },
    { rootMargin: '0px 0px -6% 0px', threshold: 0.06 },
  );

  // Hide instantly, then on the next paint kick the enter animation for
  // above-the-fold items (IO alone often skips a visible refresh play-in).
  document.documentElement.classList.add('reveal-ready');
  void main.offsetWidth;

  afterPaint(() => {
    const initial = targets.filter(inInitialView);
    initial.forEach((el, i) => {
      el.style.setProperty('--reveal-i', String(Math.min(i, STAGGER_MAX)));
      el.classList.add('is-in');
    });
    for (const el of targets) {
      if (!el.classList.contains('is-in')) observer?.observe(el);
    }
  });
}

initReveal();
document.addEventListener('astro:page-load', initReveal);
