/**
 * Easter egg on the 404 (pages/404.astro): "Shall we play a game?" The 404's dots fall away and the
 * grid becomes a Connect Four board, you (orange) against me (ink), with chips rendered in Blender
 * (scripts/four-chips). Win a round and the level goes up and I get sharper; lose once and it's game
 * over, and you can make a card of it to share (client/four-card.ts). I talk while we play.
 * Start it with the button, `four:start`, or /play in the chat.
 */
import { openCard, type Move } from './four-card';

type Who = 0 | 1 | 2; // empty, you, me

const COLS = 7, ROWS = 6;
const game = document.querySelector<HTMLElement>('.four');
const grid404 = document.querySelector<HTMLElement>('.lost-404');
const head = document.querySelector<HTMLElement>('.lost-head');
if (game && grid404 && head) {
  const $ = <T extends HTMLElement>(s: string) => game.querySelector<T>(s)!;
  const board = $('.four__board'), say = $('.four__say span'), soundBtn = $<HTMLButtonElement>('[data-four-sound]');
  const levelEl = $('[data-four="level"]'), scoreEl = $('[data-four="score"]'), bestEl = $('[data-four="best"]');
  const againBtn = $<HTMLButtonElement>('[data-four-again]'), cardBtn = $<HTMLButtonElement>('[data-four-card]');
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pick = <T,>(xs: T[]) => xs[Math.floor(Math.random() * xs.length)];

  // ---- What I say
  const LINES = {
    start: ['Shall we play a game? You’re orange. You go first.'],
    level: (l: number) => [`Level ${l}. Okay, I’m paying attention now.`, `Level ${l}. Lilo, Kiya, Leroy and Irma are watching.`, `Level ${l}. I put my headphones on.`, `Level ${l}. No more Mr. Nice Rectangle.`],
    mine: ['Placing this like a Webflow div.', 'Lilo says go here.', 'Making rectangles. Well, circles.', 'On the downbeat.', 'Kem would call this a strong grid.', 'Cam taught me this one.', 'Ship it.', 'Testing in production.', 'Snapping to the grid.', 'Kiya picked this one.'],
    block: ['Nice try.', 'Not today.', 'Saw that coming.', 'Blocked, like a bad merge.', 'Rude. Cam does that too.'],
    youWin: ['Okay, you’re good.', 'Fine. Back to making rectangles.', 'You win. I’m telling Cam.', 'Four in a row. I’ll allow it.'],
    iWin: ['Gotcha. Right on the downbeat.', 'Four in a row, like a good grid.', 'GG. The dogs are cheering.', 'Got you. Leroy saw it coming.'],
    draw: ['A strange game. The only winning move is not to play.'],
  };
  const talk = (t: string) => { say.textContent = t; say.parentElement!.classList.remove('is-new'); void say.offsetWidth; say.parentElement!.classList.add('is-new'); };

  // ---- Sound: tiny synth blips (Web Audio, resumed on the first click)
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
    if (Math.random() < Math.max(0, 0.4 - 0.12 * (level - 1))) return pick(moves);
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

  // ---- A game: rounds until I win one. Score: 100 × level + 10 for each hole left, per win
  let b: Who[] = Array(COLS * ROWS).fill(0), level = 1, score = 0, turn: 'you' | 'me' | 'off' = 'off', aim = 3, playing = false;
  let moves: Move[] = [], best = 0;
  try { best = Number(localStorage.getItem('hdj:four:best') || 0); } catch {}
  const tally = () => { levelEl.textContent = String(level); scoreEl.textContent = score.toLocaleString(); bestEl.textContent = Math.max(best, score).toLocaleString(); };
  function paint(drop?: number) {
    const next = turn === 'you' ? open(b, aim) * COLS + aim : -1;
    cells.forEach((el, i) => { el.classList.toggle('you', b[i] === 1); el.classList.toggle('me', b[i] === 2); el.classList.toggle('next', i === next); });
    if (drop != null) { const el = cells[drop]; el.style.setProperty('--fall', String(Math.floor(drop / COLS) + 1)); el.classList.remove('drop'); void el.offsetWidth; el.classList.add('drop'); }
    cols.forEach((c, i) => c.classList.toggle('is-aim', turn === 'you' && i === aim));
    game!.dataset.turn = turn;
  }
  function place(c: number, who: Who) {
    const r = open(b, c); if (r < 0) return -1;
    b[r * COLS + c] = who; moves.push({ c, r, who: who as 1 | 2 }); paint(r * COLS + c);
    beep([who === 1 ? 660 - r * 40 : 330 - r * 20], 0.05, who === 1 ? 'square' : 'triangle');
    return r;
  }
  function round(line?: string) {
    b = Array(COLS * ROWS).fill(0); moves = []; turn = 'you';
    cells.forEach((el) => el.classList.remove('drop', 'win'));
    paint(); tally(); talk(line ?? pick(LINES.start));
  }
  function start() {
    if (playing) return;
    playing = true; level = 1; score = 0; againBtn.hidden = cardBtn.hidden = true;
    document.documentElement.classList.add('four-on');
    // The 404's lit dots fall away, then the board fills in
    grid404!.querySelectorAll<HTMLElement>('i.on').forEach((d) => { d.style.setProperty('--dx', `${(Math.random() - 0.5) * 80}px`); d.style.setProperty('--rot', `${(Math.random() - 0.5) * 140}deg`); d.style.setProperty('--fd', `${Math.random() * 220}ms`); });
    grid404!.classList.add('is-falling');
    setTimeout(() => { grid404!.hidden = true; grid404!.classList.remove('is-falling'); game!.hidden = false; round(); cols[aim].focus({ preventScroll: true }); }, calm ? 0 : 650);
    head!.scrollIntoView({ block: 'start', behavior: calm ? 'auto' : 'smooth' });
    beep([392, 523, 659, 784], 0.09);
  }
  function quit() {
    playing = false; turn = 'off';
    document.documentElement.classList.remove('four-on');
    game!.hidden = true; grid404!.hidden = false;
    grid404!.querySelectorAll<HTMLElement>('i.on').forEach((d) => { d.style.animation = 'none'; void d.offsetWidth; d.style.animation = ''; });
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
    if (!playing) return;
    place(mine, 2);
    if (won(b, 2)) return gameOver();
    if (full(b)) return roundDraw();
    if (threat === mine) talk(pick(LINES.block)); else if (Math.random() < 0.55) talk(pick(LINES.mine));
    turn = 'you'; paint();
  }
  const flash = (run: number[] | null) => run?.forEach((i) => cells[i].classList.add('win'));
  function roundWon() {
    flash(won(b, 1)); turn = 'off'; paint();
    score += 100 * level + 10 * b.filter((x) => !x).length; level++; tally();
    talk(pick(LINES.youWin)); beep([523, 659, 784, 1047], 0.1);
    setTimeout(() => playing && round(pick(LINES.level(level))), calm ? 600 : 1800);
  }
  function roundDraw() {
    turn = 'off'; paint(); score += 50; tally(); talk(pick(LINES.draw)); beep([440, 440, 440], 0.12, 'triangle');
    setTimeout(() => playing && round(), calm ? 600 : 2200);
  }
  function gameOver() {
    const run = won(b, 2); flash(run); turn = 'off'; paint();
    talk(pick(LINES.iWin)); beep([392, 330, 262, 196], 0.14, 'sawtooth', 0.05);
    const record = score > best;
    if (record) { best = score; try { localStorage.setItem('hdj:four:best', String(best)); } catch {} }
    tally();
    lastGame = { board: [...b], moves: [...moves], run: run ?? [], score, level, wins: level - 1 };
    setTimeout(() => { talk(record ? 'New best! Make a card of it?' : 'Game over. Make a card of it, or go again?'); againBtn.hidden = cardBtn.hidden = false; }, calm ? 300 : 1400);
  }
  let lastGame: Parameters<typeof openCard>[0] | null = null;

  // ---- Controls: click a column, or arrows and Enter (1 to 7 drop straight in); Escape quits
  board.addEventListener('click', (e) => { const col = (e.target as HTMLElement).closest<HTMLElement>('.four__col'); if (col) { aim = Number(col.dataset.col); youMove(aim); } });
  board.addEventListener('pointerover', (e) => { const col = (e.target as HTMLElement).closest<HTMLElement>('.four__col'); if (col) { aim = Number(col.dataset.col); paint(); } });
  game.addEventListener('keydown', (e) => {
    if ((e.target as HTMLElement).closest('.four-card')) return;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); aim = (aim + (e.key === 'ArrowRight' ? 1 : -1) + COLS) % COLS; cols[aim].focus(); paint(); }
    if (/^[1-7]$/.test(e.key)) { aim = Number(e.key) - 1; cols[aim].focus(); youMove(aim); }
    if (e.key === 'Escape') { quit(); document.querySelector<HTMLElement>('[data-four-play]')?.focus(); }
  });
  $('[data-four-quit]').addEventListener('click', quit);
  againBtn.addEventListener('click', () => { againBtn.hidden = cardBtn.hidden = true; level = 1; score = 0; round(); });
  cardBtn.addEventListener('click', () => { if (lastGame) openCard(lastGame); });
  document.querySelectorAll('[data-four-play]').forEach((btn) => btn.addEventListener('click', start));
  document.addEventListener('four:start', start);
  // While I think, a few WOPR lights blink in the empty holes
  setInterval(() => {
    if (!game.classList.contains('is-thinking')) return;
    const d = pick(cells.filter((c) => !c.classList.contains('you') && !c.classList.contains('me'))); if (!d) return;
    d.classList.add('wopr'); setTimeout(() => d.classList.remove('wopr'), 220);
  }, 90);
}
