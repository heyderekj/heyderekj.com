/**
 * Intro chips (components/IntroChip.astro): place each popover card just
 * under its chip, kept inside the viewport, and mirror open state onto the
 * chip's aria-expanded. Native popover handles light dismiss and Esc.
 */

const GAP = 8;
const EDGE = 12;

function place(chip: HTMLElement, pop: HTMLElement) {
  const r = chip.getBoundingClientRect();
  const w = pop.offsetWidth;
  const h = pop.offsetHeight;
  let left = r.left + r.width / 2 - w / 2;
  left = Math.max(EDGE, Math.min(left, window.innerWidth - w - EDGE));
  let top = r.bottom + GAP;
  // Flip above when there's no room below.
  if (top + h > window.innerHeight - EDGE && r.top - GAP - h > EDGE) top = r.top - GAP - h;
  pop.style.left = `${Math.round(left)}px`;
  pop.style.top = `${Math.round(top)}px`;
  // Point the little notch at the chip's center.
  pop.style.setProperty('--notch-x', `${Math.round(r.left + r.width / 2 - left)}px`);
  pop.dataset.side = top < r.top ? 'above' : 'below';
}

function init() {
  document.querySelectorAll<HTMLButtonElement>('[data-intro-chip]').forEach((chip) => {
    if (chip.dataset.bound) return;
    chip.dataset.bound = '1';
    const pop = document.getElementById(chip.getAttribute('popovertarget') ?? '');
    if (!pop || !('showPopover' in pop)) return;

    let open = false;
    const reposition = () => open && place(chip, pop);

    pop.addEventListener('toggle', (e) => {
      open = (e as ToggleEvent).newState === 'open';
      chip.setAttribute('aria-expanded', String(open));
      if (open) {
        place(chip, pop);
        window.addEventListener('scroll', reposition, { passive: true });
        window.addEventListener('resize', reposition);
      } else {
        window.removeEventListener('scroll', reposition);
        window.removeEventListener('resize', reposition);
      }
    });
  });
}

init();
document.addEventListener('astro:page-load', init);
