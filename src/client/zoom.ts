/**
 * Inline figure zoom. Click a `.zoomable` figure's `.zoom-trigger` and it
 * expands in place from the reading column toward the frame rails (leaving a
 * small side inset — see `--z-inset` / `--z-bleed` in global.css), pushing the
 * content below it down; click again (or Escape) to collapse. One open at a
 * time. Replaces the old overlay lightbox.
 *
 * Event-delegated on the document so figures injected at runtime (markdown body
 * images) need no per-element wiring.
 *
 * FLIP animates the figure's bleed margins and the mat height together so the
 * 1:1 ↔ 4:3 aspect change doesn't snap while the outer box is still moving.
 */
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const DURATION = 320;
const EASING = 'cubic-bezier(0.22, 1, 0.36, 1)';

let current: HTMLElement | null = null;
let lastTrigger: HTMLElement | null = null;

function hasVideo(el: HTMLElement): boolean {
  return Boolean(el.querySelector('video'));
}

function label(trigger: HTMLElement, open: boolean) {
  const video = hasVideo(trigger);
  trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
  trigger.setAttribute(
    'aria-label',
    open
      ? video
        ? 'Collapse video'
        : 'Collapse image'
      : video
        ? 'Zoom video'
        : 'Zoom image',
  );
}

/** MediaSteppers have one trigger per slide — keep them all in sync. */
function labelFig(fig: HTMLElement, open: boolean) {
  fig.querySelectorAll<HTMLElement>('.zoom-trigger').forEach((t) => label(t, open));
}

/** Mat that owns aspect-ratio: trigger button, or MediaStepper frame. */
function matOf(fig: HTMLElement): HTMLElement | null {
  return (
    fig.querySelector<HTMLElement>(':scope > .zoom-trigger') ??
    fig.querySelector<HTMLElement>(':scope > .ms-frame') ??
    fig.querySelector<HTMLElement>('.zoom-trigger')
  );
}

function imgOf(mat: HTMLElement | null): HTMLElement | null {
  // Prefer img; for videos prefer the Plyr shell (padding/height FLIP target).
  return (
    mat?.querySelector<HTMLElement>('img') ??
    mat?.querySelector<HTMLElement>('.plyr') ??
    mat?.querySelector<HTMLElement>('video') ??
    null
  );
}

/** Expanded: Plyr (or native) controls; collapsed: chrome off. Time preserved. */
function syncVideoChrome(fig: HTMLElement, open: boolean) {
  fig.querySelectorAll('video').forEach((video) => {
    const wasPaused = video.paused;
    const t = video.currentTime;
    // Plyr chrome is toggled via zoomchange in plyr-init; keep native off.
    if (!video.hasAttribute('data-plyr')) {
      video.controls = open;
    } else {
      video.controls = false;
    }
    if (Math.abs(video.currentTime - t) > 0.05) video.currentTime = t;
    if (!wasPaused) {
      const p = video.play();
      if (p && p.catch) p.catch(() => {});
    }
  });
}

type Padding = { top: string; right: string; bottom: string; left: string };

function readPadding(el: HTMLElement): Padding {
  const cs = getComputedStyle(el);
  return {
    top: cs.paddingTop,
    right: cs.paddingRight,
    bottom: cs.paddingBottom,
    left: cs.paddingLeft,
  };
}

function runAnimation(
  fig: HTMLElement,
  mat: HTMLElement | null,
  img: HTMLElement | null,
  first: DOMRect,
  last: DOMRect,
  firstMat: DOMRect | null,
  lastMat: DOMRect | null,
  firstPad: Padding | null,
  lastPad: Padding | null,
  fromBleed: number,
  toBleed: number,
  onDone?: () => void,
) {
  if (reduceMotion || typeof fig.animate !== 'function') {
    onDone?.();
    return;
  }

  fig.style.overflow = 'hidden';
  if (mat) {
    // Let height keyframes win over resting/expanded aspect-ratio rules.
    mat.style.aspectRatio = 'auto';
  }

  const animations: Animation[] = [
    fig.animate(
      [
        {
          height: `${first.height}px`,
          marginLeft: `${-fromBleed}px`,
          marginRight: `${-fromBleed}px`,
        },
        {
          height: `${last.height}px`,
          marginLeft: `${-toBleed}px`,
          marginRight: `${-toBleed}px`,
        },
      ],
      { duration: DURATION, easing: EASING },
    ),
  ];

  if (mat && firstMat && lastMat) {
    animations.push(
      mat.animate(
        [{ height: `${firstMat.height}px` }, { height: `${lastMat.height}px` }],
        { duration: DURATION, easing: EASING },
      ),
    );
  }

  if (img && firstPad && lastPad) {
    animations.push(
      img.animate(
        [
          {
            paddingTop: firstPad.top,
            paddingRight: firstPad.right,
            paddingBottom: firstPad.bottom,
            paddingLeft: firstPad.left,
          },
          {
            paddingTop: lastPad.top,
            paddingRight: lastPad.right,
            paddingBottom: lastPad.bottom,
            paddingLeft: lastPad.left,
          },
        ],
        { duration: DURATION, easing: EASING },
      ),
    );
  }

  const cleanup = () => {
    fig.style.overflow = '';
    if (mat) mat.style.aspectRatio = '';
    onDone?.();
  };

  Promise.all(animations.map((a) => a.finished.catch(() => undefined))).then(cleanup);
}

/** Rail breakout from computed margin (0 resting; `--z-bleed` when expanded).
 *  Prefer this over width-delta so grid cells that also span columns don't
 *  animate a bogus half-width margin (CIO proof shots, project pairs). */
function readInlineBleed(fig: HTMLElement): number {
  const ml = parseFloat(getComputedStyle(fig).marginLeft);
  return Number.isFinite(ml) && ml < 0 ? -ml : 0;
}

function collapse(fig: HTMLElement, animate = true) {
  const mat = matOf(fig);
  const img = imgOf(mat);
  const first = fig.getBoundingClientRect();
  const firstMat = mat?.getBoundingClientRect() ?? null;
  const firstPad = img ? readPadding(img) : null;
  const fromBleed = readInlineBleed(fig);

  fig.classList.remove('is-zoomed');
  labelFig(fig, false);
  syncVideoChrome(fig, false);

  const last = fig.getBoundingClientRect();
  const lastMat = mat?.getBoundingClientRect() ?? null;
  const lastPad = img ? readPadding(img) : null;
  const toBleed = readInlineBleed(fig);

  if (animate) {
    runAnimation(fig, mat, img, first, last, firstMat, lastMat, firstPad, lastPad, fromBleed, toBleed);
  }
  if (current === fig) current = null;
  fig.dispatchEvent(new CustomEvent('zoomchange', { detail: { open: false }, bubbles: true }));
}

function expand(fig: HTMLElement) {
  // Collapse anything already open first (no animation, keeps timing clean).
  if (current && current !== fig) collapse(current, false);

  const mat = matOf(fig);
  const img = imgOf(mat);
  const first = fig.getBoundingClientRect();
  const firstMat = mat?.getBoundingClientRect() ?? null;
  const firstPad = img ? readPadding(img) : null;
  const fromBleed = readInlineBleed(fig);

  fig.classList.add('is-zoomed');
  labelFig(fig, true);
  syncVideoChrome(fig, true);

  const last = fig.getBoundingClientRect();
  const lastMat = mat?.getBoundingClientRect() ?? null;
  const lastPad = img ? readPadding(img) : null;
  const toBleed = readInlineBleed(fig);
  current = fig;

  // Scroll after the size change settles so it doesn't fight the FLIP.
  runAnimation(fig, mat, img, first, last, firstMat, lastMat, firstPad, lastPad, fromBleed, toBleed, () => {
    fig.scrollIntoView({ block: 'nearest', behavior: reduceMotion ? 'auto' : 'smooth' });
  });

  fig.dispatchEvent(new CustomEvent('zoomchange', { detail: { open: true }, bubbles: true }));
}

document.addEventListener('click', (e) => {
  const target = e.target as HTMLElement;
  // Stepper controls sit over the frame — never treat their clicks as zoom.
  if (target.closest('.ms-controls')) return;
  const trigger = target.closest<HTMLElement>('.zoom-trigger');
  if (!trigger) return;
  const fig = trigger.closest<HTMLElement>('.zoomable');
  if (!fig) return;

  // Expanded video: let Plyr / native controls work; collapse via mat padding
  // click (outside the player) or Escape — not by clicking the video/chrome.
  if (
    fig.classList.contains('is-zoomed') &&
    (target.closest('video') || target.closest('.plyr'))
  ) {
    return;
  }

  e.preventDefault();
  if (fig.classList.contains('is-zoomed')) {
    collapse(fig);
  } else {
    lastTrigger = trigger;
    expand(fig);
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && current) {
    e.preventDefault();
    const fig = current;
    collapse(fig);
    if (lastTrigger && lastTrigger.focus) lastTrigger.focus();
    return;
  }

  if (e.key !== 'Enter' && e.key !== ' ') return;
  const trigger = (e.target as HTMLElement | null)?.closest?.('.zoom-trigger');
  if (!trigger || trigger instanceof HTMLButtonElement) return;
  // Div-based video triggers (role=button)
  if (trigger.getAttribute('role') !== 'button') return;
  e.preventDefault();
  trigger.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
});
