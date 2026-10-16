/**
 * Writes each `.sig[data-sign]` once it scrolls into view, and again when you hover it.
 * With reduced motion the signature is simply there.
 */
const calm = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

function sign(sig: HTMLElement) {
  if (calm()) { sig.classList.add('is-drawn'); return; }
  sig.classList.remove('is-signing', 'is-drawn');
  void sig.getBoundingClientRect();
  sig.classList.add('is-signing');
  const total = Number(sig.dataset.total || 1600);
  window.clearTimeout(Number(sig.dataset.timer));
  sig.dataset.timer = String(window.setTimeout(() => { sig.classList.add('is-drawn'); sig.classList.remove('is-signing'); }, total + 50));
}

const sigs = [...document.querySelectorAll<HTMLElement>('.sig[data-sign]')];
const seen = new IntersectionObserver((entries) => {
  for (const e of entries) if (e.isIntersecting) { seen.unobserve(e.target); document.fonts.ready.then(() => setTimeout(() => sign(e.target as HTMLElement), 120)); }
}, { threshold: 0.6 });
sigs.forEach((s) => { seen.observe(s); s.addEventListener('pointerenter', () => { if (!s.classList.contains('is-signing')) sign(s); }); });
