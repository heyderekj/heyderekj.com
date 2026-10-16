/**
 * Select text in an essay or write-up ([data-select]) and a small menu offers to copy it as a quote
 * (with a link back to that paragraph) or keep it as a highlight. Highlights live in this browser only,
 * per page; tap one to remove it.
 */
import { copyText, toast } from './toast';

const scope = document.querySelector<HTMLElement>('[data-select] .prose');
const selbar = document.getElementById('selbar');
if (scope && selbar) {
  const KEY = `hdj:hl:${location.pathname}`;
  type HL = { id: string; el: string; start: number; end: number };
  const load = (): HL[] => { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; } };
  const save = (v: HL[]) => { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch { /* private window: highlights last for this visit */ } };
  let hls = load();
  let state: { kind: 'sel'; text: string; el: HTMLElement | null; range: Range } | { kind: 'mark'; id: string } | null = null;
  const announce = () => document.dispatchEvent(new CustomEvent('bar:highlights', { detail: hls.length }));

  // Every paragraph gets a stable id, so highlights and quote links can point at it
  const paras = [...scope.querySelectorAll<HTMLElement>(':scope > p')];
  paras.forEach((p, n) => { if (!p.id) p.id = `p${n + 1}`; });

  const textNodes = (el: Node) => { const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT); const o: Text[] = []; while (w.nextNode()) o.push(w.currentNode as Text); return o; };
  const offsetIn = (el: HTMLElement, node: Node, off: number) => { let n = 0; for (const t of textNodes(el)) { if (t === node) return n + off; n += t.length; } return n; };
  function paint(h: HL) {
    const el = document.getElementById(h.el); if (!el) return; let n = 0;
    for (const t of textNodes(el)) {
      const a = n, b = n + t.length; n = b;
      if (b <= h.start || a >= h.end || t.parentElement?.closest('mark.hl')) continue;
      let node = t; const s0 = Math.max(0, h.start - a), e0 = Math.min(t.length, h.end - a);
      if (e0 < node.length) node.splitText(e0);
      if (s0 > 0) node = node.splitText(s0);
      const m = document.createElement('mark'); m.className = 'hl'; m.dataset.hl = h.id; node.replaceWith(m); m.append(node);
    }
  }
  const unpaint = (id: string) => document.querySelectorAll(`mark.hl[data-hl="${id}"]`).forEach((m) => { const p = m.parentNode!; m.replaceWith(...m.childNodes); p.normalize(); });
  hls.forEach(paint); announce();

  function show(rect: DOMRect, btns: [string, string][]) {
    selbar!.innerHTML = btns.map(([k, l]) => `<button data-act="${k}">${l}</button>`).join('');
    Object.assign(selbar!.style, { left: `${Math.min(innerWidth - 120, Math.max(120, rect.left + rect.width / 2))}px`, top: `${Math.max(56, rect.top)}px` });
    selbar!.hidden = false;
  }
  const hide = () => { selbar!.hidden = true; state = null; };
  function check() {
    const s = getSelection();
    if (!s || !s.rangeCount || s.isCollapsed) { if (state?.kind === 'sel') hide(); return; }
    const range = s.getRangeAt(0), text = s.toString().trim();
    const c = range.commonAncestorContainer, host = (c.nodeType === 1 ? c : c.parentElement) as HTMLElement;
    if (!text || text.length > 600 || !scope!.contains(host)) { hide(); return; }
    const el = host.closest<HTMLElement>('.prose > p');
    state = { kind: 'sel', text, el, range: range.cloneRange() };
    show(range.getBoundingClientRect(), [['quote', 'Copy as quote'], ...(el ? [['keep', '<span class="swatch"></span> Highlight'] as [string, string]] : [])]);
  }
  document.addEventListener('mouseup', () => setTimeout(check, 0));
  document.addEventListener('keyup', (e) => { if (e.shiftKey) check(); });
  selbar.addEventListener('pointerdown', (e) => e.preventDefault());
  selbar.addEventListener('click', async (e) => {
    const act = (e.target as HTMLElement).closest<HTMLElement>('[data-act]')?.dataset.act; if (!act || !state) return;
    if (act === 'quote' && state.kind === 'sel') {
      const url = `${location.origin}${location.pathname}${state.el ? `#${state.el.id}` : ''}`;
      toast(await copyText(`“${state.text}”\n— Derek Castelli, ${url}`) ? 'Quote copied' : 'Couldn’t copy');
    }
    if (act === 'keep' && state.kind === 'sel' && state.el) {
      const { el, range } = state;
      const a = offsetIn(el, range.startContainer, range.startOffset);
      const b = range.endContainer.nodeType === 3 ? offsetIn(el, range.endContainer, range.endOffset) : el.textContent!.length;
      const h = { id: Math.random().toString(36).slice(2, 9), el: el.id, start: Math.min(a, b), end: Math.max(a, b) };
      if (h.end > h.start) { hls.push(h); save(hls); paint(h); announce(); toast(`${hls.length} highlight${hls.length === 1 ? '' : 's'} kept`); }
    }
    if (act === 'remove' && state.kind === 'mark') { unpaint(state.id); hls = hls.filter((h) => h.id !== (state as { id: string }).id); save(hls); announce(); toast('Highlight removed'); }
    getSelection()?.removeAllRanges(); hide();
  });
  document.addEventListener('click', (e) => {
    const m = (e.target as HTMLElement).closest<HTMLElement>('mark.hl');
    if (m) { state = { kind: 'mark', id: m.dataset.hl! }; show(m.getBoundingClientRect(), [['remove', 'Remove highlight']]); }
    else if (!selbar.contains(e.target as Node) && state?.kind === 'mark') hide();
  }, true);
  addEventListener('scroll', () => { if (!selbar.hidden) hide(); }, { passive: true });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !selbar.hidden) hide(); });
}
