/**
 * Subtle fade/rise reveals when content enters the viewport.
 * Auto-targets main sections and staggers list/grid items — no per-page markup.
 * Respects prefers-reduced-motion. Re-runs on astro:page-load.
 */

const STAGGER_MAX = 14;
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

/** Sections whose direct children should reveal individually (not as one slab). */
const EXPAND_SEL = '#proof, .cio-proof';

const SKIP_SEL = 'script, style, noscript, nav, .app-toc, .about-toc, .application-toc';

/** Above-fold media — paint immediately; don’t fade while video buffers. */
const MEDIA_SKIP_SEL = '.pvideo, .work-stage';

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

/**
 * Media-first proof blocks: reveal shots, then copy — matches visual order and
 * keeps each beat light enough that video + text don’t lurch in as one unit.
 */
function addMediaFirstBlock(
  block: HTMLElement,
  add: (el: HTMLElement, index: number) => void,
  startIndex: number,
): number {
  const shots = block.querySelector<HTMLElement>(':scope > .cio-shots');
  let i = startIndex;
  if (shots) {
    add(shots, i++);
  }
  for (const kid of block.children) {
    if (!(kid instanceof HTMLElement) || kid === shots) continue;
    add(kid, i++);
  }
  return i;
}

function collectTargets(main: HTMLElement): HTMLElement[] {
  const targets: HTMLElement[] = [];
  const seen = new Set<HTMLElement>();
  let seq = 0;

  const add = (el: HTMLElement, index: number) => {
    if (seen.has(el) || el.closest('[data-no-reveal]')) return;
    if (el.matches(SKIP_SEL) || el.matches(MEDIA_SKIP_SEL)) return;
    // Don’t reveal a parent if a descendant is already a target (or vice versa).
    for (const t of seen) {
      if (t.contains(el) || el.contains(t)) return;
    }
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
    if (block.matches(STAGGER_SEL) || block.matches(MEDIA_SKIP_SEL)) continue;

    if (block.matches(EXPAND_SEL)) {
      for (const kid of block.children) {
        if (!(kid instanceof HTMLElement) || kid.matches(STAGGER_SEL)) continue;
        if (kid.matches('.cio-proof-block--media-first')) {
          seq = addMediaFirstBlock(kid, add, seq);
        } else {
          add(kid, seq++);
        }
      }
      continue;
    }

    const staggerChild = [...block.children].find(
      (c): c is HTMLElement => c instanceof HTMLElement && c.matches(STAGGER_SEL),
    );

    if (staggerChild) {
      [...block.children].forEach((kid) => {
        if (!(kid instanceof HTMLElement) || kid.matches(STAGGER_SEL)) return;
        add(kid, seq++);
      });
      continue;
    }

    add(block, seq++);
  }

  return targets;
}

function clearRevealWait() {
  document.documentElement.classList.remove('reveal-wait');
}

function reset(main: HTMLElement) {
  observer?.disconnect();
  observer = null;
  document.documentElement.classList.remove('reveal-ready');
  main.querySelectorAll<HTMLElement>('.reveal').forEach((el) => {
    el.classList.remove('reveal', 'is-in');
    el.style.removeProperty('--reveal-i');
    el.style.removeProperty('will-change');
  });
}

/** True when the element is already on screen (first paint / refresh). */
function inInitialView(el: HTMLElement): boolean {
  const rect = el.getBoundingClientRect();
  const vh = window.innerHeight || document.documentElement.clientHeight;
  return rect.top < vh * 0.92 && rect.bottom > vh * 0.02;
}

/** Wait two frames so the hidden state paints before we add `.is-in`. */
function afterPaint(fn: () => void) {
  requestAnimationFrame(() => {
    requestAnimationFrame(fn);
  });
}

function revealEl(el: HTMLElement) {
  el.style.willChange = 'opacity, transform';
  el.classList.add('is-in');
  const clear = () => {
    el.style.removeProperty('will-change');
    el.removeEventListener('transitionend', clear);
  };
  el.addEventListener('transitionend', clear);
  // Fallback if transitionend doesn’t fire (already visible / reduced steps).
  window.setTimeout(clear, 900);
}

function initReveal() {
  const main = document.querySelector<HTMLElement>('main.main');
  if (!main) {
    clearRevealWait();
    return;
  }

  // Soft navigations: hide again before restaging so media doesn’t flash.
  if (!reduceMotion()) {
    document.documentElement.classList.add('reveal-wait');
  }

  reset(main);
  if (reduceMotion() || typeof IntersectionObserver === 'undefined') {
    clearRevealWait();
    return;
  }

  const targets = collectTargets(main);
  if (targets.length === 0) {
    clearRevealWait();
    return;
  }

  // Disable transitions while applying the hidden state so we don’t
  // animate 1→0 (or skip the 0 paint entirely) before the load-in.
  targets.forEach((el) => {
    el.classList.add('reveal');
    el.style.setProperty('transition', 'none');
  });

  observer = new IntersectionObserver(
    (entries) => {
      // Stable visual order when several enter in one tick.
      const hit = entries
        .filter((e) => e.isIntersecting && e.target instanceof HTMLElement)
        .map((e) => e.target as HTMLElement)
        .sort((a, b) => {
          const ai = Number(a.style.getPropertyValue('--reveal-i') || 0);
          const bi = Number(b.style.getPropertyValue('--reveal-i') || 0);
          return ai - bi;
        });

      hit.forEach((el) => {
        revealEl(el);
        observer?.unobserve(el);
      });
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
  );

  // Stage opacity-0 while main is still `visibility: hidden` (reveal-wait).
  document.documentElement.classList.add('reveal-ready');
  void main.offsetWidth;
  targets.forEach((el) => {
    void getComputedStyle(el).opacity;
    el.style.removeProperty('transition');
  });

  // First paint: main visible, targets at opacity 0 — then rise in.
  clearRevealWait();
  void main.offsetWidth;

  afterPaint(() => {
    const initial = targets.filter(inInitialView);
    initial.forEach((el, i) => {
      el.style.setProperty('--reveal-i', String(Math.min(i, STAGGER_MAX)));
      revealEl(el);
    });
    for (const el of targets) {
      if (!el.classList.contains('is-in')) observer?.observe(el);
    }
  });
}

initReveal();
document.addEventListener('astro:page-load', initReveal);
