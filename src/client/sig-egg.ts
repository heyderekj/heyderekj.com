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
  let card: HTMLFormElement | null = null, openedAt = 0, draft = { note: '', name: '' };
  function open() {
    if (card) { card.querySelector('textarea')?.focus(); return; }
    wm!.classList.add('is-noting');
    resign();
    openedAt = Date.now();
    card = document.createElement('form');
    card.className = 'wm__note sq';
    card.innerHTML = `
      <textarea name="note" rows="1" maxlength="2000" required placeholder="Leave me a note…" aria-label="Leave me a note"></textarea>
      <div class="wm__row">
        <input name="name" maxlength="80" autocomplete="name" placeholder="Anonymous, or your name" aria-label="Your name, optional">
        <input name="website" tabindex="-1" autocomplete="off" aria-hidden="true" class="wm__hp">
        <button type="submit" class="wm__send" aria-label="Send"><svg viewBox="0 0 16 16" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 13V3M3.5 7.5 8 3l4.5 4.5"/></svg></button>
      </div>`;
    inner!.append(card);
    const area = card.querySelector('textarea')!;
    area.value = draft.note;
    card.querySelector<HTMLInputElement>('input[name="name"]')!.value = draft.name;
    area.focus();
    area.addEventListener('input', () => {
      area.style.height = 'auto'; area.style.height = `${Math.min(area.scrollHeight, 220)}px`;
      card!.classList.toggle('has-text', area.value.trim().length > 0);
    });
    if (draft.note) area.dispatchEvent(new Event('input'));
    area.addEventListener('keydown', (e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) card!.requestSubmit(); });
    setTimeout(() => document.addEventListener('pointerdown', outside), 0);
    card.addEventListener('submit', send);
    document.addEventListener('keydown', onKey);
  }
  function onKey(e: KeyboardEvent) { if (e.key === 'Escape') close(); }
  // Clicking away dismisses it; an unsent note comes back next time it opens
  function outside(e: PointerEvent) { if (card && !card.contains(e.target as Node)) close(); }
  function close() {
    document.removeEventListener('keydown', onKey);
    document.removeEventListener('pointerdown', outside);
    if (card) draft = { note: card.querySelector('textarea')!.value, name: card.querySelector<HTMLInputElement>('input[name="name"]')!.value };
    card?.remove(); card = null;
    wm!.classList.remove('is-noting');
  }
  async function send(e: SubmitEvent) {
    e.preventDefault();
    if (!card) return;
    const data = Object.fromEntries(new FormData(card)) as Record<string, string>;
    if (!data.note?.trim()) return;
    const button = card.querySelector<HTMLButtonElement>('button[type="submit"]')!;
    button.disabled = true; card.classList.add('is-sending');
    try {
      const r = await fetch('/api/note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: data.note, name: data.name, website: data.website, page: location.pathname, ms: Date.now() - openedAt }),
      });
      if (!r.ok) throw new Error(String(r.status));
      card.querySelector('textarea')!.value = ''; close(); draft = { note: '', name: '' }; resign();
      toast(data.name?.trim() ? `Thanks, ${data.name.trim().split(' ')[0]}. Got it.` : 'Thank you. Got it.');
    } catch {
      button.disabled = false; card?.classList.remove('is-sending');
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
  // The browser counts the clicks (e.detail): one goes home, three open the note.
  // Stop a double or triple click on the watermark from selecting the text around it.
  let homeT = 0;
  document.addEventListener('mousedown', (e) => { if (e.detail > 1 && overMe(e)) e.preventDefault(); });
  document.addEventListener('click', (e) => {
    if (!overMe(e)) return;
    clearTimeout(homeT);
    if (e.detail >= 3) { getSelection()?.removeAllRanges(); open(); return; }
    if (e.detail === 1 && getSelection()?.isCollapsed) {
      homeT = window.setTimeout(() => { if (location.pathname === '/') resign(); else location.href = '/'; }, 330);
    }
  });
  document.addEventListener('mousemove', (e) => document.body.classList.toggle('wm-hot', overMe(e)), { passive: true });
}
