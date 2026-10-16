/**
 * When I'm free, kept current from my projects in Notion (functions/api/availability.ts): the status on
 * /hire/, in the home page's Derek J Design chip and in the bar menu. Each starts with the date written in
 * src/data/hire.ts; if the function answers, they're rewritten. Asked once per visit. The date is also put
 * on <html data-avail-from> with an `hdj:avail` event, so the estimate on /hire/ can plan from it.
 */
const spots = [...document.querySelectorAll<HTMLElement>('[data-avail]')];
if (spots.length) {
  const paint = (from: string) => {
    document.documentElement.dataset.availFrom = from;
    window.dispatchEvent(new CustomEvent('hdj:avail', { detail: from }));
    const now = from === 'now';
    const when = now ? '' : new Date(`${from}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    for (const el of spots) {
      const kind = el.dataset.avail;
      el.textContent = kind === 'big' ? (now ? 'Right now' : `From ${when}`) : kind === 'small' ? (now ? 'open now' : `from ${when}`) : kind === 'line' ? (now ? 'Open now' : `Open from ${when}`) : el.textContent;
    }
  };
  let cached: { from: string; at: number } | null = null;
  try { cached = JSON.parse(sessionStorage.getItem('hdj:avail') || 'null'); } catch {}
  if (cached && Date.now() - cached.at < 3600_000) paint(cached.from);
  else {
    fetch('/api/availability').then((r) => (r.ok ? r.json() : null)).then((d: { from?: string } | null) => {
      if (!d?.from) return;
      paint(d.from);
      try { sessionStorage.setItem('hdj:avail', JSON.stringify({ from: d.from, at: Date.now() })); } catch {}
    }).catch(() => {});
  }
}
