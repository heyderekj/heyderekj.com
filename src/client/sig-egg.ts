/**
 * The watermark signature (layouts/Site.astro) is also the way home: click it to go back to the
 * home page (on the home page it signs itself again). The easter egg: triple-click it and it darkens,
 * signs itself again, and opens a small card to leave me a note: anonymous unless you add a name.
 * Notes are emailed to me by functions/api/note.ts.
 */
import { toast } from './toast';

const wm = document.querySelector<HTMLElement>('.wm');
const inner = wm?.querySelector<HTMLElement>('.wm__in');
const mine = wm?.querySelector<HTMLElement>('.sig');
if (wm && inner && mine) {
  const calm = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const resign = () => { if (calm()) { mine.classList.add('is-drawn'); return; } mine.classList.remove('is-drawn', 'is-signing'); void mine.offsetWidth; mine.classList.add('is-signing'); };

  // ---- The note card
  let card: HTMLFormElement | null = null, openedAt = 0;
  function open() {
    if (card) { card.querySelector('textarea')?.focus(); return; }
    wm!.classList.add('is-noting');
    resign();
    openedAt = Date.now();
    card = document.createElement('form');
    card.className = 'wm__note sq';
    card.innerHTML = `
      <label class="wm__label" for="wmNote">Leave me a note</label>
      <textarea id="wmNote" name="note" rows="4" maxlength="2000" required placeholder="Anything at all. I read every one."></textarea>
      <div class="wm__row">
        <input name="name" maxlength="80" autocomplete="name" placeholder="Your name (optional)" aria-label="Your name, optional">
        <input name="website" tabindex="-1" autocomplete="off" aria-hidden="true" class="wm__hp">
        <button type="button" data-act="cancel">Cancel</button>
        <button type="submit" class="is-primary">Send</button>
      </div>
      <p class="wm__hint">Anonymous unless you add a name. It comes straight to my inbox.</p>`;
    inner!.append(card);
    card.querySelector('textarea')!.focus();
    card.addEventListener('click', (e) => { if ((e.target as HTMLElement).closest('[data-act="cancel"]')) close(); });
    card.addEventListener('submit', send);
    document.addEventListener('keydown', onKey);
  }
  function onKey(e: KeyboardEvent) { if (e.key === 'Escape') close(); }
  function close() {
    document.removeEventListener('keydown', onKey);
    card?.remove(); card = null;
    wm!.classList.remove('is-noting');
  }
  async function send(e: SubmitEvent) {
    e.preventDefault();
    if (!card) return;
    const data = Object.fromEntries(new FormData(card)) as Record<string, string>;
    if (!data.note?.trim()) return;
    const button = card.querySelector<HTMLButtonElement>('button[type="submit"]')!;
    button.disabled = true; button.textContent = 'Sending…';
    try {
      const r = await fetch('/api/note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: data.note, name: data.name, website: data.website, page: location.pathname, ms: Date.now() - openedAt }),
      });
      if (!r.ok) throw new Error(String(r.status));
      close(); resign();
      toast(data.name?.trim() ? `Thanks, ${data.name.trim().split(' ')[0]}. Got it.` : 'Thank you. Got it.');
    } catch {
      button.disabled = false; button.textContent = 'Send';
      toast('That didn’t send. You can email derekj@hey.com');
    }
  }

  // ---- Click my signature to go home; triple-click it to leave a note.
  // Only the watermark's own space counts: text, links and controls sitting over it keep working.
  const overMe = (e: MouseEvent) => {
    if (card || !(e.target instanceof Element) || e.target.closest('a, button, input, textarea, h1, p, li, .wchip, .bar, .fig, .browser, .byline, .badge, .essay__meta, .work-chips')) return false;
    const r = mine.getBoundingClientRect();
    return e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
  };
  let clicks = 0, clickT = 0;
  document.addEventListener('click', (e) => {
    if (!overMe(e) || !getSelection()?.isCollapsed) { clicks = 0; return; }
    clicks++; clearTimeout(clickT);
    if (clicks >= 3) { clicks = 0; getSelection()?.removeAllRanges(); open(); return; }
    clickT = window.setTimeout(() => {
      if (clicks === 1) { if (location.pathname === '/') resign(); else location.href = '/'; }
      clicks = 0;
    }, 330);
  });
  document.addEventListener('mousemove', (e) => document.body.classList.toggle('wm-hot', overMe(e)), { passive: true });
}
