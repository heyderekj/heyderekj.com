/**
 * The two playable figures in Packaging Koati (components/post/FigSidebarDesk.astro, FigSameList.astro).
 * Everything that moves keeps a `data-k` key, so a FLIP animation can slide it from where it was to
 * where it lands. Things only ever translate; nothing stretches.
 */
import { calm, EASE } from './toast';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function flip(scope: HTMLElement, mutate: () => void) {
  const keyed = () => [...scope.querySelectorAll<HTMLElement>('[data-k]')];
  const before = new Map(keyed().map((el) => [el.dataset.k, el.getBoundingClientRect()]));
  mutate();
  if (calm()) return;
  for (const el of keyed()) {
    const a = before.get(el.dataset.k), b = el.getBoundingClientRect();
    if (!a) { el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 260, delay: 80, easing: EASE, fill: 'backwards' }); continue; }
    const dx = a.left - b.left, dy = a.top - b.top;
    if (Math.abs(dx) < 1 && Math.abs(dy) < 1) continue;
    el.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }], { duration: 420, easing: EASE });
  }
}

// The boards and requests both figures share
const BOARD: Record<string, [string, string, string]> = {
  autumn: ['Autumn range launch', 'var(--k-orange)', 'A'],
  thornbury: ['Thornbury Foods', 'var(--k-green)', 'T'],
  foxglove: ['Foxglove Studio', 'var(--k-purple)', 'F'],
  stockist: ['Stockist finder', 'var(--k-blue)', 'S'],
};

/* ---------- The same list, twice ---------- */
const REQ: Record<string, { t: string; s: string; b: string }> = {
  recipe: { t: 'One more thing: the recipe cards we hand out at sampling', s: 'Autumn range launch · Jenna Q.', b: 'autumn' },
  template: { t: 'Recipe card template', s: 'Foxglove Studio · ready for you to approve', b: 'foxglove' },
  page: { t: 'Autumn range launch page', s: '<span class="late">Overdue 16 days</span> · grower copy', b: 'autumn' },
  deck: { t: 'Q4 trade deck', s: 'Thornbury Foods · waiting on Jenna Q.', b: 'thornbury' },
};
document.querySelectorAll<HTMLElement>('[data-fig="twins"]').forEach((fig) => {
  const box = fig.querySelector<HTMLElement>('[data-twins]')!, btn = fig.querySelector<HTMLButtonElement>('[data-merge]')!;
  let merged = false;
  const req = (key: string, k = key) => { const r = REQ[key]; return `<div class="req sq" data-k="${k}" data-twin="${key}" style="--c:${BOARD[r.b][1]}"><i></i><b>${esc(r.t)}</b><small>${r.s}</small></div>`; };
  function render() {
    box.innerHTML = merged
      ? `<div class="panel sq" data-k="inbox-panel"><div class="panel__name">Inbox <span>everything waiting on your next step</span></div>
          <div class="sec">To sort</div>${req('recipe', 'recipe-b')}
          <div class="sec">From your assistant</div><div class="empty">Nothing back yet.</div>
          <div class="sec">Yours, by due date</div>${req('page')}${req('template')}
          <div class="sec">Waiting on someone</div>${req('deck')}</div>`
      : `<div class="panel sq" data-k="today-panel"><div class="panel__name">Today <span>Sun, Oct 11</span></div>
          <div class="sec">To sort</div>${req('recipe', 'recipe-a')}
          <div class="sec">Yours</div>${req('template')}${req('page')}
          <div class="sec">Waiting</div>${req('deck')}</div>
         <div class="panel sq" data-k="inbox-panel"><div class="panel__name">Inbox <span>1</span></div>
          <div class="sec">Needs sorting</div>${req('recipe', 'recipe-b')}</div>`;
    box.classList.toggle('is-merged', merged);
    btn.textContent = merged ? 'Split them again' : 'Merge into one Inbox';
  }
  btn.addEventListener('click', () => flip(box, () => { merged = !merged; render(); }));
  fig.querySelector('[data-reset]')!.addEventListener('click', () => flip(box, () => { merged = false; render(); }));
  box.addEventListener('pointerover', (e) => {
    const r = (e.target as HTMLElement).closest<HTMLElement>('.req');
    box.querySelectorAll<HTMLElement>('.req').forEach((x) => x.classList.toggle('is-twin', !!r && !merged && x.dataset.twin === r.dataset.twin && r.dataset.twin === 'recipe'));
  });
  box.addEventListener('pointerleave', () => box.querySelectorAll('.req').forEach((x) => x.classList.remove('is-twin')));
  render();
});

/* ---------- Sidebar to desk ---------- */
const MODS = [
  { m: 'inbox', b: 'autumn', t: 'One more thing: the recipe cards…', s: 'Jenna Q. · needs sorting' },
  { m: 'inbox', b: 'foxglove', t: 'Recipe card template', s: 'Ready for you to approve' },
  { m: 'inbox', b: 'autumn', t: 'Autumn range launch page', s: 'Overdue 16 days' },
  { m: 'inbox', b: 'thornbury', t: 'Q4 trade deck', s: 'Waiting on Jenna Q.' },
  { m: 'chat', b: 'autumn', t: 'Jenna Q.', s: 'One more thing: the recipe cards…' },
  { m: 'chat', b: 'thornbury', t: 'Marcus B.', s: 'Delivered the trade deck draft' },
  { m: 'chat', b: 'foxglove', t: 'Foxglove Studio', s: 'No activity yet' },
  { m: 'work', b: 'autumn', t: 'Autumn range launch page', s: 'In progress' },
  { m: 'work', b: 'foxglove', t: 'Recipe card template', s: 'To review' },
  { m: 'work', b: 'thornbury', t: 'Q4 trade deck', s: 'Waiting' },
  { m: 'work', b: 'stockist', t: 'Stockist finder', s: 'Started by Jessica L.' },
  { m: 'plan', b: 'autumn', t: 'Design, next two weeks', s: 'Over capacity' },
];
const NAV: Record<string, string> = { today: 'Today', inbox: 'Inbox', chat: 'Chat', work: 'Work', plan: 'Plan' };
document.querySelectorAll<HTMLElement>('[data-fig="desk"]').forEach((fig) => {
  const app = fig.querySelector<HTMLElement>('[data-app]')!, icon = esc(fig.dataset.icon ?? '');
  const desk = { layout: 'sidebar', page: 'today', board: null as string | null };
  const modsFor = () => {
    let m = desk.page === 'today' ? MODS.filter((x) => x.m === 'inbox')
      : desk.page === 'plan' ? MODS.filter((x) => x.m === 'plan')
      : MODS.filter((x) => x.m === desk.page || (desk.layout === 'desk' && desk.page === 'work' && x.m === 'plan'));
    if (desk.board) m = m.filter((x) => x.b === desk.board);
    return m;
  };
  const mod = (x: (typeof MODS)[number]) => `<div class="mod sq" data-k="mod-${MODS.indexOf(x)}" style="--c:${BOARD[x.b][1]}"><i></i><b>${esc(x.t)}</b><small>${esc(x.s)}</small></div>`;
  const boardBtn = (k: string) => `<button class="board sq" data-board="${k}" data-k="board-${k}" aria-pressed="${desk.board === k}"><span class="av" style="--c:${BOARD[k][1]}">${BOARD[k][2]}</span><span>${BOARD[k][0]}</span></button>`;
  function render() {
    app.className = `app sq is-${desk.layout}`;
    const list = modsFor();
    if (desk.layout === 'sidebar') {
      app.innerHTML = `<div class="rail"><div class="logo" data-k="logo"><img src="${icon}" alt="">koati</div>
        ${Object.keys(NAV).map((k) => `<button class="nav sq" data-nav="${k}" data-k="nav-${k}" aria-pressed="${desk.page === k && !desk.board}">${NAV[k]}</button>`).join('')}
        <div class="rail__label">Your work</div>${['autumn', 'stockist', 'thornbury'].map(boardBtn).join('')}
        <div class="rail__label">Who you work with</div>${boardBtn('foxglove')}</div>
        <div class="page"><div class="page__title">${desk.board ? BOARD[desk.board][0] : NAV[desk.page]}</div>${(desk.board ? MODS.filter((x) => x.b === desk.board && x.m === 'work') : list).map(mod).join('') || '<div class="empty">Nothing here.</div>'}</div>`;
    } else {
      app.innerHTML = `<div class="top"><div class="logo" data-k="logo"><img src="${icon}" alt=""></div><div class="tabs">${['inbox', 'chat', 'work'].map((k) => `<button class="nav sq" data-nav="${k}" data-k="nav-${k}" aria-pressed="${desk.page === k}">${NAV[k]}</button>`).join('')}</div></div>
        <div class="pills"><button class="board sq" data-board="" data-k="board-all" aria-pressed="${!desk.board}">Every board</button>${['autumn', 'thornbury', 'foxglove', 'stockist'].map(boardBtn).join('')}</div>
        <div class="modules">${list.map(mod).join('') || '<div class="empty">Nothing on this board here.</div>'}</div>`;
    }
  }
  const set = (patch: Partial<typeof desk>) => flip(app, () => { Object.assign(desk, patch); render(); });
  const layoutBtns = [...fig.querySelectorAll<HTMLButtonElement>('[data-layout]')];
  app.addEventListener('click', (e) => {
    const n = (e.target as HTMLElement).closest<HTMLElement>('[data-nav]'), b = (e.target as HTMLElement).closest<HTMLElement>('[data-board]');
    if (n) set({ page: n.dataset.nav!, board: desk.layout === 'sidebar' ? null : desk.board });
    if (b) set({ board: b.dataset.board ? (desk.board === b.dataset.board && desk.layout === 'desk' ? null : b.dataset.board) : null });
  });
  layoutBtns.forEach((b) => b.addEventListener('click', () => {
    layoutBtns.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    const to = b.dataset.layout!;
    // Today retires and Plan moves inside Work on the desk
    const page = to === 'desk' && (desk.page === 'today' || desk.page === 'plan') ? (desk.page === 'plan' ? 'work' : 'inbox') : desk.page;
    set({ layout: to, page });
  }));
  fig.querySelector('[data-reset]')!.addEventListener('click', () => {
    layoutBtns.forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.layout === 'sidebar')));
    set({ layout: 'sidebar', page: 'today', board: null });
  });
  render();
});
