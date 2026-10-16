/**
 * Hover a row of writing (or a work row with data-peek-img) and a small preview appears in the
 * empty margin beside the column: the picture of what it's about in a browser window, or one
 * sentence from inside it. Mouse only.
 */
const peek = document.getElementById('peek');
if (peek && matchMedia('(hover: hover)').matches) {
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const html = (r: HTMLElement) => {
    const { peekImg, peekUrl, peekQuote, mins } = r.dataset;
    if (peekImg) return `<div class="browser sq" data-n="1"><div class="browser__bar"><span class="browser__dots"><i></i><i></i><i></i></span><span class="browser__url">${esc(peekUrl ?? '')}</span><span style="width:37px"></span></div><div class="browser__view"><img class="is-on" src="${esc(peekImg)}" alt=""></div></div>`;
    if (peekQuote) return `<div class="qcard sq"><p>${esc(peekQuote)}</p><span>${mins} min read</span></div>`;
    return '';
  };
  let current: HTMLElement | null = null;
  const column = peek.closest('main') ?? document.body;
  document.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    const r = (e.target as HTMLElement).closest?.<HTMLElement>('[data-peek-img], [data-peek-quote]');
    if (!r) { peek.classList.remove('is-on'); current = null; return; }
    if (current !== r) { current = r; peek.innerHTML = html(r); peek.classList.toggle('is-sheet', !r.dataset.peekImg); }
    // Sit in the margin beside the reading column when there's room, so nothing is covered
    const col = column.getBoundingClientRect(), w = peek.offsetWidth || 280;
    const x = col.right + 40 + w < innerWidth - 16 ? col.right + 40 : Math.min(innerWidth - w - 16, e.clientX + 28);
    const y = Math.max(16, Math.min(innerHeight - (peek.offsetHeight || 220) - 96, e.clientY - 60));
    peek.style.left = `${x}px`; peek.style.top = `${y}px`; peek.classList.add('is-on');
  }, { passive: true });
  addEventListener('scroll', () => { peek.classList.remove('is-on'); current = null; }, { passive: true });
}
