/**
 * Margin notes on revised paragraphs (notes from lib/paraNotes.ts, in #revNotes). Each revised
 * paragraph gets a small "Revised Oct 16" in the margin (or under it on narrow screens); hovering or
 * focusing it shows what the paragraph said before. Paragraphs are found by their text.
 */
type Note = { key: string; date: string; before: string | null };

const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const fmt = (iso: string) => new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });

export function renderNotes(notes: Note[], root: ParentNode = document) {
  if (!notes.length) return 0;
  const byKey = new Map(notes.map((n) => [n.key, n]));
  let placed = 0;
  root.querySelectorAll<HTMLElement>('.essay .prose > p').forEach((p) => {
    const n = byKey.get(normalize(p.textContent ?? '').slice(0, 80));
    if (!n || p.querySelector('.revnote')) return;
    const note = document.createElement('span');
    note.className = 'revnote';
    note.tabIndex = 0;
    note.innerHTML = `<span class="revnote__tag">${n.before ? 'Revised' : 'Added'} ${fmt(n.date)}</span>`;
    if (n.before) {
      const was = document.createElement('span');
      was.className = 'revnote__was qcard sq';
      was.innerHTML = `<span>Before ${fmt(n.date)}</span>`;
      const text = document.createElement('p'); text.textContent = n.before; was.prepend(text);
      note.append(was);
    }
    p.classList.add('is-revised');
    p.append(note);
    placed++;
  });
  return placed;
}

const data = document.getElementById('revNotes');
if (data) { try { renderNotes(JSON.parse(data.textContent || '[]')); } catch { /* no notes */ } }
