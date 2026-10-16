/**
 * Easter egg on the 404 (pages/404.astro): "Shall we play a game?" The 404's dots fall away and the
 * grid becomes a Connect Four board, you (orange) against me (ink). Win a round and the level goes up
 * and I get sharper; lose once and it's game over: three initials go on an anonymous high score table
 * like an arcade's (functions/api/scores.ts, or this browser's own table when that isn't set up).
 * I talk while we play. Start it with the button, `four:start`, or /play in the chat.
 */
type Who = 0 | 1 | 2; // empty, you, me
type Score = { i: string; s: number; l: number; d?: string };

const COLS = 7, ROWS = 6;
const game = document.querySelector<HTMLElement>('.four');
const grid404 = document.querySelector<HTMLElement>('.lost-404');
const head = document.querySelector<HTMLElement>('.lost-head');
if (game && grid404 && head) {
  const $ = <T extends HTMLElement>(s: string) => game.querySelector<T>(s)!;
  const board = $('.four__board'), say = $('.four__say span'), levelEl = $('[data-four="level"]'), scoreEl = $('[data-four="score"]'), hiEl = $('[data-four="hi"]');
  const table = $('.four__scores ol'), tableNote = $('.four__scores small'), initials = $<HTMLFormElement>('.four__initials'), soundBtn = $<HTMLButtonElement>('[data-four-sound]');
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pick = <T,>(xs: T[]) => xs[Math.floor(Math.random() * xs.length)];
  const pad = (n: number) => String(n).padStart(6, '0');

  // ---- What I say
  const LINES = {
    start: ['Shall we play a game? You’re orange. You go first.'],
    level: (l: number) => [`Level ${l}. Okay, I’m paying attention now.`, `Level ${l}. Lilo, Kiya, Leroy and Irma are watching.`, `Level ${l}. I put my headphones on.`, `Level ${l}. No more Mr. Nice Rectangle.`],
    mine: ['Placing this like a Webflow div.', 'Lilo says go here.', 'Making rectangles. Well, circles.', 'This one’s for Des Moines.', 'On the downbeat.', 'Kem would call this a strong grid.', 'Cam taught me this one.', 'Ship it.', 'Testing in production.', 'Snapping to the grid.', 'Kiya picked this one.'],
    block: ['Nice try.', 'Not today.', 'I saw that from Des Moines.', 'Blocked, like a bad merge.', 'Rude. Cam does that too.'],
    youWin: ['Okay, you’re good.', 'Fine. Back to making rectangles.', 'You win. I’m telling Cam.', 'Four in a row. I’ll allow it.'],
    iWin: ['Gotcha. Right on the downbeat.', 'Four in a row, like a good grid.', 'GG. The dogs are cheering.', 'Got you. Leroy saw it coming.'],
    draw: ['A strange game. The only winning move is not to play.'],
    over: ['Game over. Put your initials on the board.'],
    over0: ['Game over. Shall we play again?'],
  };
  const talk = (t: string) => { say.textContent = t; say.parentElement!.classList.remove('is-new'); void say.offsetWidth; say.parentElement!.classList.add('is-new'); };

  // ---- Sound: tiny synth blips (Web Audio; resumed on the first click)
  let ac: AudioContext | null = null, sound = true;
  try { sound = localStorage.getItem('hdj:four:sound') !== 'off'; } catch {}
  const paintSound = () => { soundBtn.textContent = sound ? 'Sound on' : 'Sound off'; soundBtn.setAttribute('aria-pressed', String(sound)); };
  paintSound();
  soundBtn.addEventListener('click', () => { sound = !sound; try { localStorage.setItem('hdj:four:sound', sound ? 'on' : 'off'); } catch {} paintSound(); });
  async function beep(freqs: number[], step = 0.07, type: OscillatorType = 'square', vol = 0.06) {
    if (!sound) return;
    try { ac ??= new AudioContext(); await ac.resume(); } catch { return; }
    freqs.forEach((f, i) => {
      const t = ac!.currentTime + i * step, o = ac!.createOscillator(), g = ac!.createGain();
      o.type = type; o.frequency.value = f; g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + step * 1.6);
      o.connect(g); g.connect(ac!.destination); o.start(t); o.stop(t + step * 1.7);
    });
  }

  // ---- The board
  const cells: HTMLElement[] = []; // index r * COLS + c, r = 0 at the top
  const cols: HTMLButtonElement[] = [];
  for (let c = 0; c < COLS; c++) {
    const col = document.createElement('button'); col.type = 'button'; col.className = 'four__col'; col.dataset.col = String(c);
    col.setAttribute('aria-label', `Column ${c + 1}`);
    for (let r = 0; r < ROWS; r++) { const i = document.createElement('i'); i.style.setProperty('--d', String(c + r)); cells[r * COLS + c] = i; col.append(i); }
    cols.push(col); board.append(col);
  }
  // Every run of four, for spotting wins and weighing positions
  const RUNS: number[][] = [];
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) for (const [dr, dc] of [[0, 1], [1, 0], [1, 1], [1, -1]]) {
    const run = [0, 1, 2, 3].map((k) => [r + dr * k, c + dc * k]);
    if (run.every(([rr, cc]) => rr >= 0 && rr < ROWS && cc >= 0 && cc < COLS)) RUNS.push(run.map(([rr, cc]) => rr * COLS + cc));
  }
  const open = (b: Who[], c: number) => { for (let r = ROWS - 1; r >= 0; r--) if (!b[r * COLS + c]) return r; return -1; };
  const won = (b: Who[], who: Who) => RUNS.find((run) => run.every((i) => b[i] === who)) ?? null;
  const full = (b: Who[]) => b.every(Boolean);
  const ORDER = [3, 2, 4, 1, 5, 0, 6];

  // ---- Me: minimax with alpha-beta, deeper each level, and a few slips early on
  function weigh(b: Who[]) {
    let s = 0;
    for (let r = 0; r < ROWS; r++) s += (b[r * COLS + 3] === 2 ? 3 : 0) - (b[r * COLS + 3] === 1 ? 3 : 0);
    for (const run of RUNS) {
      let me = 0, you = 0;
      for (const i of run) { if (b[i] === 2) me++; else if (b[i] === 1) you++; }
      if (me && you) continue;
      if (me === 3) s += 50; else if (me === 2) s += 5;
      if (you === 3) s -= 60; else if (you === 2) s -= 4;
    }
    return s;
  }
  function search(b: Who[], depth: number, a: number, z: number, mine: boolean): number {
    if (won(b, 2)) return 100000 + depth;
    if (won(b, 1)) return -100000 - depth;
    if (!depth || full(b)) return weigh(b);
    let best = mine ? -Infinity : Infinity;
    for (const c of ORDER) {
      const r = open(b, c); if (r < 0) continue;
      b[r * COLS + c] = mine ? 2 : 1;
      const v = search(b, depth - 1, a, z, !mine);
      b[r * COLS + c] = 0;
      if (mine) { best = Math.max(best, v); a = Math.max(a, v); } else { best = Math.min(best, v); z = Math.min(z, v); }
      if (a >= z) break;
    }
    return best;
  }
  function think(b: Who[], level: number) {
    const moves = ORDER.filter((c) => open(b, c) >= 0);
    const slip = Math.max(0, 0.4 - 0.12 * (level - 1));
    if (Math.random() < slip) return pick(moves);
    const depth = Math.min(6, level + 1);
    let best = moves[0], bestV = -Infinity;
    for (const c of moves) {
      const r = open(b, c); b[r * COLS + c] = 2;
      const v = search(b, depth - 1, -Infinity, Infinity, false);
      b[r * COLS + c] = 0;
      if (v > bestV) { bestV = v; best = c; }
    }
    return best;
  }

  // ---- A game
  let b: Who[] = Array(COLS * ROWS).fill(0), level = 1, score = 0, turn: 'you' | 'me' | 'off' = 'off', aim = 3, playing = false, started = 0;
  let best = 0;
  try { best = Number(localStorage.getItem('hdj:four:best') || 0); } catch {}
  const hud = () => { levelEl.textContent = String(level).padStart(2, '0'); scoreEl.textContent = pad(score); hiEl.textContent = pad(Math.max(best, topScore(), score)); };
  function paint(drop?: number) {
    const next = turn === 'you' ? open(b, aim) * COLS + aim : -1;
    cells.forEach((el, i) => { el.classList.toggle('you', b[i] === 1); el.classList.toggle('me', b[i] === 2); el.classList.toggle('next', i === next); });
    if (drop != null) { const el = cells[drop]; el.style.setProperty('--fall', String(Math.floor(drop / COLS) + 1)); el.classList.remove('drop'); void el.offsetWidth; el.classList.add('drop'); }
    cols.forEach((c, i) => c.classList.toggle('is-aim', turn === 'you' && i === aim));
    game!.dataset.turn = turn;
  }
  function place(c: number, who: Who) {
    const r = open(b, c); if (r < 0) return -1;
    b[r * COLS + c] = who; paint(r * COLS + c);
    beep([who === 1 ? 660 - r * 40 : 330 - r * 20], 0.05, who === 1 ? 'square' : 'triangle');
    return r;
  }
  function round(line?: string) {
    b = Array(COLS * ROWS).fill(0); turn = 'you';
    cells.forEach((el) => el.classList.remove('drop', 'win'));
    paint(); hud();
    talk(line ?? pick(LINES.start));
  }
  function start() {
    if (playing) return;
    playing = true; level = 1; score = 0; started = Date.now(); initials.hidden = true;
    document.documentElement.classList.add('four-on');
    // The 404's lit dots fall away, then the board fills in
    grid404!.querySelectorAll<HTMLElement>('i.on').forEach((d) => { d.style.setProperty('--dx', `${(Math.random() - 0.5) * 80}px`); d.style.setProperty('--rot', `${(Math.random() - 0.5) * 140}deg`); d.style.setProperty('--fd', `${Math.random() * 220}ms`); });
    grid404!.classList.add('is-falling');
    setTimeout(() => { grid404!.hidden = true; grid404!.classList.remove('is-falling'); game!.hidden = false; round(); cols[aim].focus({ preventScroll: true }); }, calm ? 0 : 650);
    head!.scrollIntoView({ block: 'start', behavior: calm ? 'auto' : 'smooth' });
    beep([392, 523, 659, 784], 0.09);
    loadScores();
  }
  function quit() {
    playing = false; turn = 'off';
    document.documentElement.classList.remove('four-on');
    game!.hidden = true; grid404!.hidden = false;
    grid404!.querySelectorAll('i.on').forEach((d) => { (d as HTMLElement).style.animation = 'none'; void (d as HTMLElement).offsetWidth; (d as HTMLElement).style.animation = ''; });
  }
  async function youMove(c: number) {
    if (turn !== 'you' || open(b, c) < 0) return;
    turn = 'off'; place(c, 1);
    if (won(b, 1)) return roundWon();
    if (full(b)) return roundDraw();
    turn = 'me'; paint();
    game!.classList.add('is-thinking');
    await new Promise((r) => setTimeout(r, calm ? 150 : 520 + Math.random() * 380));
    const threat = ORDER.find((cc) => { const r = open(b, cc); if (r < 0) return false; b[r * COLS + cc] = 1; const w = won(b, 1); b[r * COLS + cc] = 0; return Boolean(w); });
    const mine = think(b, level);
    game!.classList.remove('is-thinking');
    place(mine, 2);
    if (won(b, 2)) return gameOver();
    if (full(b)) return roundDraw();
    talk(threat === mine ? pick(LINES.block) : Math.random() < 0.55 ? pick(LINES.mine) : say.textContent ?? '');
    turn = 'you'; paint();
  }
  function flash(run: number[] | null) { run?.forEach((i) => cells[i].classList.add('win')); }
  function roundWon() {
    flash(won(b, 1)); turn = 'off'; paint();
    const empty = b.filter((x) => !x).length;
    score += 100 * level + 10 * empty; level++; hud();
    talk(pick(LINES.youWin)); beep([523, 659, 784, 1047], 0.1);
    setTimeout(() => playing && round(pick(LINES.level(level))), calm ? 600 : 1800);
  }
  function roundDraw() {
    turn = 'off'; paint(); score += 50; hud(); talk(pick(LINES.draw)); beep([440, 440, 440], 0.12, 'triangle');
    setTimeout(() => playing && round(), calm ? 600 : 2200);
  }
  function gameOver() {
    flash(won(b, 2)); turn = 'off'; paint();
    talk(pick(LINES.iWin)); beep([392, 330, 262, 196], 0.14, 'sawtooth', 0.05);
    if (score > best) { best = score; try { localStorage.setItem('hdj:four:best', String(best)); } catch {} }
    hud();
    setTimeout(() => {
      talk(pick(score > 0 ? LINES.over : LINES.over0));
      if (score > 0) { initials.hidden = false; $<HTMLElement>('.four__final').textContent = pad(score); initials.querySelector('input')!.focus(); }
      else again();
    }, calm ? 400 : 1500);
  }
  function again() { $<HTMLButtonElement>('[data-four-again]').hidden = false; }

  // ---- High scores: shared through /api/scores when it's set up, otherwise this browser's own
  let scores: Score[] = [], shared = false, mineAt = -1;
  const topScore = () => scores[0]?.s ?? 0;
  const localScores = (): Score[] => { try { return JSON.parse(localStorage.getItem('hdj:four:scores') || '[]'); } catch { return []; } };
  function paintScores() {
    table.innerHTML = Array.from({ length: 10 }, (_, n) => {
      const s = scores[n];
      return `<li class="${n === mineAt ? 'is-mine' : ''}"><span>${String(n + 1).padStart(2, '0')}</span><b>${s ? s.i.padEnd(3, ' ') : '---'}</b><em>${s ? pad(s.s) : '------'}</em><small>${s ? `L${s.l}` : ''}</small></li>`;
    }).join('');
    tableNote.textContent = shared ? 'Everyone’s best, anonymous' : 'Scores in this browser';
    hud();
  }
  async function loadScores() {
    try { const r = await fetch('/api/scores', { cache: 'no-store' }); if (!r.ok) throw 0; scores = (await r.json()).scores ?? []; shared = true; }
    catch { scores = localScores(); shared = false; }
    paintScores();
  }
  const BAD = new Set(['ASS', 'FUK', 'FUC', 'FCK', 'SEX', 'CUM', 'DIK', 'DIC', 'KKK', 'NIG', 'FAG', 'SHT', 'TIT', 'WTF', 'NAZ', 'KYS', 'PIS', 'VAG', 'COK', 'XXX', 'FU', 'GAY', 'HOE', 'JIZ', 'POO']);
  initials.addEventListener('submit', async (e) => {
    e.preventDefault();
    const input = initials.querySelector('input')!;
    let i = input.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3) || 'AAA';
    if (BAD.has(i)) i = 'DJC';
    const entry: Score = { i, s: score, l: level, d: new Date().toISOString().slice(0, 10) };
    initials.hidden = true;
    try {
      const r = await fetch('/api/scores', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...entry, ms: Date.now() - started }) });
      if (!r.ok) throw 0;
      const j = await r.json(); scores = j.scores ?? scores; mineAt = j.rank ?? -1; shared = true;
    } catch {
      const list = [...localScores(), entry].sort((a, z) => z.s - a.s).slice(0, 10);
      try { localStorage.setItem('hdj:four:scores', JSON.stringify(list)); } catch {}
      scores = list; mineAt = list.indexOf(entry); shared = false;
    }
    paintScores();
    talk(mineAt >= 0 ? `You’re number ${mineAt + 1}. Shall we play again?` : 'Not on the board this time. Shall we play again?');
    again();
  });

  // ---- Controls: click a column, or arrows and Enter (1 to 7 drop straight in); Escape quits
  board.addEventListener('click', (e) => { const col = (e.target as HTMLElement).closest<HTMLElement>('.four__col'); if (col) { aim = Number(col.dataset.col); youMove(aim); } });
  board.addEventListener('pointerover', (e) => { const col = (e.target as HTMLElement).closest<HTMLElement>('.four__col'); if (col) { aim = Number(col.dataset.col); paint(); } });
  game.addEventListener('keydown', (e) => {
    if ((e.target as HTMLElement).closest('.four__initials')) return;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); aim = (aim + (e.key === 'ArrowRight' ? 1 : -1) + COLS) % COLS; cols[aim].focus(); paint(); }
    if (/^[1-7]$/.test(e.key)) { aim = Number(e.key) - 1; cols[aim].focus(); youMove(aim); }
    if (e.key === 'Escape') { quit(); document.querySelector<HTMLElement>('[data-four-play]')?.focus(); }
  });
  $('[data-four-quit]').addEventListener('click', quit);
  $('[data-four-again]').addEventListener('click', (e) => { (e.currentTarget as HTMLElement).hidden = true; mineAt = -1; paintScores(); level = 1; score = 0; started = Date.now(); round(); });
  document.querySelectorAll('[data-four-play]').forEach((btn) => btn.addEventListener('click', start));
  document.addEventListener('four:start', start);
  // While I think, a few WOPR lights blink on the empty holes
  setInterval(() => {
    if (!game.classList.contains('is-thinking')) return;
    const empty = cells.filter((c) => !c.classList.contains('you') && !c.classList.contains('me')); const d = pick(empty); if (!d) return;
    d.classList.add('wopr'); setTimeout(() => d.classList.remove('wopr'), 220);
  }, 90);
}
