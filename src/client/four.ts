/**
 * Easter egg on the 404 (pages/404.astro): "Shall we play a game?" The 404's dots fall away and the
 * grid becomes a Connect Four board, with chips rendered in Blender (scripts/four-chips). You're
 * orange; the other colour is one of the animals, picked at random each game, each playing (and talking) their own
 * way. Win a round and the level goes up and they get sharper; lose once and it's game over, and you
 * can make a card of it to share (client/four-card.ts).
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
  const board = $('.four__board'), say = $('.four__line');
  const levelEl = $('[data-four="level"]'), scoreEl = $('[data-four="score"]'), bestEl = $('[data-four="best"]');
  const againBtn = $<HTMLButtonElement>('[data-four-again]'), cardBtn = $<HTMLButtonElement>('[data-four-card]');
  const nextBtn = $<HTMLButtonElement>('[data-four-next]'), stopBtn = $<HTMLButtonElement>('[data-four-stop]');
  // Settings, from the dial under their face: sound and less motion (kept in this browser)
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const prefs = { sound: true, calm: false };
  try { Object.assign(prefs, JSON.parse(localStorage.getItem('hdj:four:set') || '{}')); if (localStorage.getItem('hdj:four:sound') === 'off') prefs.sound = false; } catch {}
  let calm = reduce || prefs.calm;
  const pick = <T,>(xs: T[]) => xs[Math.floor(Math.random() * xs.length)];

  // ---- Who you're playing: one of the animals, each with their own way of playing and talking
  type Lines = { stop: string[]; start: string[]; level: (l: number) => string[]; mine: string[]; block: string[]; youWin: string[]; iWin: string[]; draw: string[]; spare?: string[]; slip?: string[] };
  type Foe = { name: string; kind: 'cat' | 'dog'; tone: string; toneInk?: string; delay: [number, number]; depth: (l: number) => number; slip: (l: number) => number; spares?: number; lines: Lines };
  const WARGAMES = 'The only winning move is not to play.';
  // Oldest first: Lilo, Leroy, Kiya, Irma
  const FOES: Foe[] = [
    { // Attentive and smart, but kind: always blocks you, and sometimes won't take the win
      name: 'Lilo', kind: 'dog', tone: 'oklch(0.55 0.17 300)', delay: [600, 1000], depth: (l) => Math.min(6, l + 1), slip: (l) => Math.max(0, 0.15 - 0.05 * (l - 1)), spares: 0.4,
      lines: {
        stop: ['Good game! Come back anytime.', 'That was so fun. Thank you!'],
        start: ['Hi, I’m Lilo! Want to play? You go first.'],
        level: (l) => [`Level ${l}. We can keep going, if you want.`, `Level ${l}! You’re doing so well.`],
        mine: ['Is this okay? I’ll go here.', 'I’ll just put this here, gently.', 'Hope that’s alright.', 'Your turn! No rush.', 'This one feels nice.'],
        block: ['Sorry! I had to block that one.', 'Oh, I saw that. Sorry!', 'Sorry, sorry. My spot.'],
        spare: ['I could have… never mind. Your turn!', 'Oops. I’ll go over here instead.'],
        youWin: ['Yay, you won! I’m so happy for you.', 'You did it! That was lovely.'],
        iWin: ['Oh no, I won. Are you okay?', 'Sorry! I didn’t mean to win.'],
        draw: ['A cat’s game? Leroy will be smug.', 'A tie! Leroy and Irma would love this.', WARGAMES],
      },
    },
    { // Slow, but persistent and smart: thinks for ages, looks furthest ahead, never slips
      name: 'Leroy', kind: 'cat', tone: 'oklch(0.56 0.19 18)', delay: [1300, 2300], depth: (l) => Math.min(7, l + 2), slip: () => 0,
      lines: {
        stop: ['Leaving? I’ll be right here.', 'Smart. Quit while you’re ahead.'],
        start: ['Shall we play? Take your time. I will.'],
        level: (l) => [`Level ${l}. I have all day.`, `Level ${l}. Slow and steady.`, `Level ${l}. I’m not going anywhere.`],
        mine: ['Hmm. Hmm. Okay, here.', 'Slow and steady.', 'Still thinking. Don’t rush me.', 'I’ll get there.', 'Measure twice. Drop once.', 'Patience.', 'There. Worth the wait.'],
        block: ['Not so fast.', 'I saw that a while ago.', 'Mm. No.', 'I’ll just sit right here.'],
        youWin: ['Again. I’m not going anywhere.', 'Fine. Best of a hundred?', 'Noted. Again.'],
        iWin: ['Told you. Slow and steady.', 'Four in a row. Took a while. Worth it.', 'Patience wins.'],
        draw: ['A cat’s game. Naturally.', 'Cat’s game. I’ll take it.', 'Nobody wins. Except cats.'],
      },
    },
    { // Competitive and smart, but a bully and easily distracted: quick, mouthy, and wanders off
      name: 'Kiya', kind: 'dog', tone: 'oklch(0.62 0.11 195)', delay: [250, 520], depth: (l) => Math.min(6, l + 1), slip: () => 0.18,
      lines: {
        stop: ['Scared? Thought so.', 'Running away? Classic.'],
        start: ['You’re going down. Go first.'],
        level: (l) => [`Level ${l}. Now I’m annoyed.`, `Level ${l}. Lucky. Won’t happen again.`],
        mine: ['Too easy.', 'Watch and learn.', 'Is that all you’ve got?', 'Keep up.', 'Mine. Obviously.', 'Yawn.'],
        block: ['Nope. Mine.', 'Blocked. Cry about it.', 'Cute try.', 'Not on my board.'],
        slip: ['Wait, what was I doing? Here.', 'Ooh, something shiny. Anyway.', 'Was that a bird? Whatever, here.'],
        youWin: ['Rematch. Now.', 'I wasn’t even trying.', 'I got distracted. Doesn’t count.'],
        iWin: ['Winner! As usual.', 'Too easy. Next.', 'Told you you’d go down.'],
        draw: ['A CAT’s game?! Absolutely not. Rematch.', 'Ugh. Cats get a game named after them?'],
      },
    },
    { // Dumb, but plays hard: barely looks ahead, moves fast and loud, grabs any win
      name: 'Irma', kind: 'cat', tone: 'oklch(0.84 0.09 55)', toneInk: '#3d3a35', delay: [200, 420], depth: () => 1, slip: (l) => Math.max(0.15, 0.4 - 0.05 * (l - 1)),
      lines: {
        stop: ['NOOO! Okay. Bye!', 'Already? Again soon?!'],
        start: ['IRMA! LET’S PLAY! You go first!'],
        level: (l) => [`Level ${l}! More! More!`, `Level ${l}! I’m trying SO hard!`],
        mine: ['HERE!', 'I’m going HERE!', 'Big move! I think!', 'Is this the good one?', 'As hard as I can!', 'This one! No, this one!'],
        block: ['Did I just do something?', 'Whoa! I blocked it? I blocked it!'],
        youWin: ['Again! Again!', 'You win! That was SO fun!'],
        iWin: ['I WON?! I WON!', 'Four in a row! How?!'],
        draw: ['CAT’S GAME! THAT’S ME!', 'A cat’s game?! I won! Did I win?'],
      },
    },
  ];
  let foe = FOES[0];
  const whoEl = $('.four__who');
  // Who you play: picked at random each game (never the last one twice), unless you pick someone from the faces
  const foesEl = $('.four__foes');
  foesEl.insertAdjacentHTML('beforeend', FOES.map((f) => `<button type="button" data-foe="${f.name}" aria-pressed="false" style="--tone:${f.tone}"><i class="sq" style="background:url(/images/four/pet-${f.name.toLowerCase()}-sm.webp) center / cover no-repeat"></i>${f.name}</button>`).join(''));
  const randomBtn = $<HTMLButtonElement>('[data-foe-random]');
  // Picked: that animal; random: Random, with whoever came up ringed
  function markFoes() {
    foesEl.querySelectorAll<HTMLElement>('[data-foe]').forEach((x) => { x.setAttribute('aria-pressed', String(x.dataset.foe === chosen)); x.classList.toggle('is-up', x.dataset.foe === foe.name); });
    randomBtn.setAttribute('aria-pressed', String(!chosen));
  }
  let chosen = '';
  function meet(name = chosen) {
    let last = ''; try { last = localStorage.getItem('hdj:four:foe') ?? ''; } catch {}
    const pool = FOES.filter((f) => f.name !== last);
    foe = FOES.find((f) => f.name === name) ?? pick(pool.length ? pool : FOES);
    try { localStorage.setItem('hdj:four:foe', foe.name); } catch {}
    game!.style.setProperty('--foe', foe.tone); game!.style.setProperty('--foe-ink', foe.toneInk ?? '#fff');
    game!.style.setProperty('--foe-chip', `url(/images/four/chip-${foe.name.toLowerCase()}.webp)`); // their chip, in their colour
    whoEl.style.background = `url(/images/four/pet-${foe.name.toLowerCase()}-sm.webp) center / cover no-repeat`; whoEl.setAttribute('aria-label', foe.name); // their face, ringed in their colour
    $('.four__name').textContent = foe.name;
    markFoes();
  }
  const LINES = { get start() { return foe.lines.start; }, level: (l: number) => foe.lines.level(l), get mine() { return foe.lines.mine; }, get block() { return foe.lines.block; }, get youWin() { return foe.lines.youWin; }, get iWin() { return foe.lines.iWin; }, get draw() { return foe.lines.draw; } };
  const sayEl = say.closest<HTMLElement>('.four__say')!;
  const talk = (t: string) => { say.textContent = t; sayEl.classList.remove('is-new'); void say.offsetWidth; sayEl.classList.add('is-new'); };

  // ---- Sound: tiny synth blips (Web Audio, resumed on the first click)
  let ac: AudioContext | null = null;
  async function beep(freqs: number[], step = 0.07, type: OscillatorType = 'square', vol = 0.06) {
    if (!prefs.sound) return;
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
  // The animal's move: a slip now and then, sparing you a win (Lilo), or a proper look ahead
  let mood: 'slip' | 'spare' | '' = '';
  function think(b: Who[], level: number) {
    const moves = ORDER.filter((c) => open(b, c) >= 0);
    const wins = moves.filter((c) => { const r = open(b, c); b[r * COLS + c] = 2; const w = won(b, 2); b[r * COLS + c] = 0; return Boolean(w); });
    mood = '';
    if (wins.length && foe.spares && Math.random() < foe.spares && moves.length > wins.length) { mood = 'spare'; return pick(moves.filter((c) => !wins.includes(c))); }
    if (wins.length) return wins[0];
    if (Math.random() < foe.slip(level)) { mood = 'slip'; return pick(moves); }
    const depth = foe.depth(level);
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
  let moves: Move[] = [], best = 0, runId = 0; // runId: a new run cancels the last one's pending lines
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
    playing = true; level = 1; score = 0; againBtn.hidden = cardBtn.hidden = nextBtn.hidden = stopBtn.hidden = true; meet();
    document.documentElement.classList.add('four-on');
    head!.scrollIntoView({ block: 'start', behavior: 'auto' });
    beep([392, 523, 659, 784], 0.09);
    if (calm) { grid404!.hidden = true; game!.hidden = false; round(); cols[aim].focus({ preventScroll: true }); return; }
    morph();
  }
  // The 404's dots gather into the board: each hole takes the dot nearest its spot on the 404 grid,
  // and every other dot flows into its nearest hole and melts away. Clones fly between the two layouts.
  // The 404 becomes the board in one move: its letters drain to grey and the dots outside a 7 × 6 block
  // fade where they are; that block then grows into the board's holes (grid onto grid, so nothing
  // crosses), while the board's card grows out from under it. Clones fly in a fixed layer; the real
  // holes take over at the end.
  function morph() {
    const dots = [...grid404!.querySelectorAll<HTMLElement>('i')], from = dots.map((d) => d.getBoundingClientRect());
    const dcols = Number(getComputedStyle(grid404!).getPropertyValue('--cols')) || 17, drows = Math.round(dots.length / dcols);
    const c0 = Math.floor((dcols - COLS) / 2), r0 = drows - ROWS; // the middle seven columns, the bottom six rows
    const holeOf = (d: number) => { const c = (d % dcols) - c0, r = Math.floor(d / dcols) - r0; return c >= 0 && c < COLS && r >= 0 ? r * COLS + c : -1; };
    const ink = getComputedStyle(dots.find((d) => d.classList.contains('on')) ?? dots[0]).backgroundColor, faint = getComputedStyle(dots.find((d) => !d.classList.contains('on')) ?? dots[0]).backgroundColor;
    const lit = dots.map((d) => d.classList.contains('on'));
    grid404!.hidden = true; game!.hidden = false; game!.classList.add('is-morph'); round();
    const to = cells.map((c) => c.getBoundingClientRect()), holeColor = getComputedStyle(cells[0]).backgroundColor;

    // The board starts as the block it grows from: its holes laid over the kept dots
    const first = from[dots.findIndex((_, d) => holeOf(d) === 0)], last = from[dots.findIndex((_, d) => holeOf(d) === COLS * ROWS - 1)];
    const bRect = board.getBoundingClientRect(), h0 = to[0], h1 = to[COLS * ROWS - 1];
    const sx = (last.right - first.left) / (h1.right - h0.left), sy = (last.bottom - first.top) / (h1.bottom - h0.top);
    const tx = first.left - (bRect.left + (h0.left - bRect.left) * sx), ty = first.top - (bRect.top + (h0.top - bRect.top) * sy);
    board.style.transition = 'none'; board.style.transformOrigin = '0 0';
    board.style.transform = `translate(${tx}px, ${ty}px) scale(${sx}, ${sy})`; board.style.opacity = '0';

    const layer = document.createElement('div'); layer.className = 'four-morph'; document.body.append(layer);
    const flights = dots.map((_, d) => {
      const f = from[d], hole = holeOf(d), el = document.createElement('i');
      el.style.cssText = `left:${f.left}px;top:${f.top}px;width:${f.width}px;height:${f.height}px;background:${lit[d] ? ink : faint}`;
      if (hole < 0) el.className = 'is-out';
      layer.append(el);
      if (hole < 0) return { el, transform: 'scale(0.4)' };
      const t = to[hole];
      return { el, transform: `translate(${t.left + t.width / 2 - (f.left + f.width / 2)}px, ${t.top + t.height / 2 - (f.top + f.height / 2)}px) scale(${t.width / f.width})` };
    });
    requestAnimationFrame(() => requestAnimationFrame(() => {
      flights.forEach(({ el, transform }) => { el.style.transform = transform; el.style.background = holeColor; if (el.className) el.style.opacity = '0'; });
      board.style.transition = ''; board.style.transform = ''; board.style.opacity = '';
    }));
    setTimeout(() => {
      game!.classList.remove('is-morph'); board.style.transformOrigin = '';
      layer.classList.add('is-done'); setTimeout(() => layer.remove(), 200);
      cols[aim].focus({ preventScroll: true });
    }, 820);
  }
  function quit() {
    if (paused) resume();
    playing = false; turn = 'off';
    document.documentElement.classList.remove('four-on');
    game!.hidden = true; grid404!.hidden = false;
    grid404!.querySelectorAll<HTMLElement>('i.on').forEach((d) => { d.style.animation = 'none'; void d.offsetWidth; d.style.animation = ''; });
  }
  async function youMove(c: number) {
    if (paused) return;
    if (turn !== 'you' || open(b, c) < 0) return;
    turn = 'off'; place(c, 1);
    if (won(b, 1)) return roundWon();
    if (full(b)) return roundDraw();
    turn = 'me'; paint();
    game!.classList.add('is-thinking');
    await new Promise((r) => setTimeout(r, calm ? 150 : (foe.delay[0] + Math.random() * (foe.delay[1] - foe.delay[0]))));
    const threat = ORDER.find((cc) => { const r = open(b, cc); if (r < 0) return false; b[r * COLS + cc] = 1; const w = won(b, 1); b[r * COLS + cc] = 0; return Boolean(w); });
    const mine = think(b, level);
    game!.classList.remove('is-thinking');
    if (!playing) return;
    place(mine, 2);
    if (won(b, 2)) return gameOver();
    if (full(b)) return roundDraw();
    if (mood === 'spare' && foe.lines.spare) talk(pick(foe.lines.spare));
    else if (mood === 'slip' && foe.lines.slip) talk(pick(foe.lines.slip));
    else if (threat === mine) talk(pick(LINES.block)); else if (Math.random() < 0.6) talk(pick(LINES.mine));
    turn = 'you'; paint();
  }
  const flash = (run: number[] | null) => run?.forEach((i) => cells[i].classList.add('win'));
  // After a win you choose: on to the next level, or stop here and keep what you've got
  let wonRun: number[] = [];
  function roundWon() {
    wonRun = won(b, 1) ?? []; flash(wonRun); turn = 'off'; paint();
    score += 100 * level + 10 * b.filter((x) => !x).length; level++; tally();
    talk(pick(LINES.youWin)); beep([523, 659, 784, 1047], 0.1);
    nextBtn.textContent = `On to level ${level}`; nextBtn.hidden = stopBtn.hidden = false; nextBtn.focus({ preventScroll: true });
  }
  function next() { nextBtn.hidden = stopBtn.hidden = true; round(pick(LINES.level(level))); cols[aim].focus({ preventScroll: true }); }
  function stop() {
    nextBtn.hidden = stopBtn.hidden = true;
    talk(pick(foe.lines.stop));
    finish('you', wonRun);
  }
  // The game's over, lost or stopped: keep the best, and offer a card of it
  function finish(by: 'you' | 'them', run: number[]) {
    const record = score > best;
    if (record) { best = score; try { localStorage.setItem('hdj:four:best', String(best)); } catch {} }
    tally();
    lastGame = { board: [...b], moves: [...moves], run, by, score, level: by === 'you' ? level - 1 : level, wins: level - 1, foe: foe.name, foeTone: foe.tone };
    const id = runId;
    setTimeout(() => { if (id !== runId) return; if (by === 'them') talk(record ? 'New best! Make a card of it?' : 'Game over. Make a card, or go again?'); againBtn.hidden = cardBtn.hidden = false; }, calm ? 300 : by === 'you' ? 600 : 1400); // stopping keeps their parting line
  }
  // A draw is a cat's game: a stamp, and paw prints across the board in their colour.
  // The cats (Leroy, Irma) are thrilled; the dogs (Lilo, Kiya) are not.
  function roundDraw() {
    turn = 'off'; paint(); score += 50; tally(); talk(pick(LINES.draw));
    beep(foe.kind === 'cat' ? [784, 988, 1175, 988, 1319] : [392, 370, 349], foe.kind === 'cat' ? 0.09 : 0.14, 'triangle');
    catsGame();
    const id = runId;
    setTimeout(() => { board.querySelector('.four__cats')?.remove(); if (playing && id === runId) round(); }, calm ? 1200 : 3000);
  }
  function catsGame() {
    const paw = document.getElementById('fourPaw')?.innerHTML ?? '';
    const d = document.createElement('div'); d.className = `four__cats is-${foe.kind}`; d.setAttribute('aria-hidden', 'true');
    // Steps from the bottom left to the top right, left and right feet in turn
    const steps = 9;
    d.innerHTML = `<b>Cat’s game</b>` + Array.from({ length: steps }, (_, i) => {
      const t = i / (steps - 1), x = 6 + t * 82, y = 84 - t * 74, side = i % 2 ? 1 : -1;
      return `<span style="left:${x + side * 2.5}%;top:${y + side * 3}%;--i:${i}">${paw}</span>`;
    }).join('');
    board.append(d);
  }
  function gameOver() {
    const run = won(b, 2); flash(run); turn = 'off'; paint();
    talk(pick(LINES.iWin)); beep([392, 330, 262, 196], 0.14, 'sawtooth', 0.05);
    finish('them', run ?? []);
  }
  let lastGame: Parameters<typeof openCard>[0] | null = null;

  // ---- Controls: click a column, or arrows and Enter (1 to 7 drop straight in); Escape quits
  board.addEventListener('click', (e) => { const col = (e.target as HTMLElement).closest<HTMLElement>('.four__col'); if (col) { aim = Number(col.dataset.col); youMove(aim); } });
  board.addEventListener('pointerover', (e) => { const col = (e.target as HTMLElement).closest<HTMLElement>('.four__col'); if (col) { aim = Number(col.dataset.col); paint(); } });
  game.addEventListener('keydown', (e) => {
    if ((e.target as HTMLElement).closest('.four-card')) return;
    if ((e.target as HTMLElement).closest('.four__dial') && e.key !== 'Escape') return;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); aim = (aim + (e.key === 'ArrowRight' ? 1 : -1) + COLS) % COLS; cols[aim].focus(); paint(); }
    if (/^[1-7]$/.test(e.key)) { aim = Number(e.key) - 1; cols[aim].focus(); youMove(aim); }
    if (e.key === 'Enter' && !nextBtn.hidden && e.target !== stopBtn) { e.preventDefault(); next(); }
    if (e.key === 'Escape' && !dial.hidden) { closeDial(); whoEl.focus(); return; }
    if (e.key === 'Escape') { quit(); document.querySelector<HTMLElement>('[data-four-play]')?.focus(); }
  });
  $('[data-four-quit]').addEventListener('click', quit);
  // A fresh run, at level 1: Play again, or picking someone else from the faces
  function rematch() {
    runId++; againBtn.hidden = cardBtn.hidden = nextBtn.hidden = stopBtn.hidden = true; level = 1; score = 0;
    board.querySelector('.four__cats')?.remove(); cells.forEach((el) => el.classList.remove('win'));
    meet(); round();
  }
  againBtn.addEventListener('click', rematch);
  foesEl.addEventListener('click', (e) => {
    const name = (e.target as HTMLElement).closest<HTMLElement>('[data-foe]')?.dataset.foe;
    if (!name || turn === 'me') return; // not mid-move
    const same = name === foe.name; chosen = name; markFoes();
    closeDial(); if (same) return;
    beep([523, 659], 0.06); rematch(); cols[aim].focus({ preventScroll: true });
  });
  randomBtn.addEventListener('click', () => { if (turn === 'me') return; chosen = ''; closeDial(); beep([523, 659, 784], 0.05); rematch(); cols[aim].focus({ preventScroll: true }); });

  // ---- The dial: their face opens it
  const dial = $('.four__dial');
  const openDial = () => { dial.hidden = false; dial.classList.remove('is-in'); void dial.offsetWidth; dial.classList.add('is-in'); whoEl.setAttribute('aria-expanded', 'true'); };
  function closeDial() { if (dial.hidden) return; dial.hidden = true; whoEl.setAttribute('aria-expanded', 'false'); }
  whoEl.addEventListener('click', () => (dial.hidden ? openDial() : closeDial()));
  document.addEventListener('pointerdown', (e) => { if (!dial.hidden && !(e.target as HTMLElement).closest('.four__dial, .four__who')) closeDial(); });
  const applyPrefs = () => {
    calm = reduce || prefs.calm;
    game.classList.toggle('is-calm', calm);
    dial.querySelectorAll<HTMLInputElement>('[data-four-set]').forEach((x) => (x.checked = prefs[x.dataset.fourSet as keyof typeof prefs]));
  };
  dial.querySelectorAll<HTMLInputElement>('[data-four-set]').forEach((x) => x.addEventListener('change', () => {
    prefs[x.dataset.fourSet as keyof typeof prefs] = x.checked;
    try { localStorage.setItem('hdj:four:set', JSON.stringify(prefs)); localStorage.removeItem('hdj:four:sound'); } catch {}
    applyPrefs(); if (x.dataset.fourSet === 'sound' && x.checked) beep([659, 784], 0.06);
  }));
  applyPrefs();
  nextBtn.addEventListener('click', next);
  stopBtn.addEventListener('click', stop);
  cardBtn.addEventListener('click', () => { if (lastGame) openCard(lastGame); });
  document.querySelectorAll('[data-four-play]').forEach((btn) => btn.addEventListener('click', start));
  document.addEventListener('four:start', start);

  // ---- Clicking away pauses, in case it was an accident: keep playing, or quit. (A click, not a touch,
  // so scrolling on a phone doesn't pause it; the bar and its menu are left alone)
  let paused = false;
  const pauseEl = document.createElement('div');
  pauseEl.className = 'four__pause'; pauseEl.hidden = true; pauseEl.setAttribute('role', 'dialog'); pauseEl.setAttribute('aria-label', 'Paused');
  pauseEl.innerHTML = '<b>Paused</b><span>Clicked away? Your game’s right here.</span><span class="four__pause-acts"><button type="button" class="is-primary" data-four-resume>Keep playing</button><button type="button" data-four-over>Start over</button><button type="button" data-four-leave>Quit</button></span>';
  board.append(pauseEl);
  function pause() {
    if (!playing || paused || game!.classList.contains('is-morph')) return;
    paused = true; game!.classList.add('is-paused'); pauseEl.hidden = false; closeDial();
    beep([523, 392], 0.08, 'triangle');
    pauseEl.querySelector<HTMLElement>('[data-four-resume]')!.focus({ preventScroll: true });
  }
  function resume() {
    if (!paused) return;
    paused = false; game!.classList.remove('is-paused'); pauseEl.hidden = true;
    cols[aim].focus({ preventScroll: true });
  }
  document.addEventListener('click', (e) => { if (playing && !paused && !(e.target as Element).closest?.('.four, #bar, .toast')) pause(); }, true);
  pauseEl.querySelector('[data-four-resume]')!.addEventListener('click', resume);
  // Start over: a fresh run against the same animal (or a new one, on Random), from the pause card or beside Quit
  const restart = () => { if (turn === 'me') return; resume(); closeDial(); beep([392, 523], 0.06); rematch(); cols[aim].focus({ preventScroll: true }); };
  pauseEl.querySelector('[data-four-over]')!.addEventListener('click', restart);
  $('[data-four-restart]').addEventListener('click', restart);
  pauseEl.querySelector('[data-four-leave]')!.addEventListener('click', () => { quit(); document.querySelector<HTMLElement>('[data-four-play]')?.focus(); });
  // Sent here to play (the "joshua" egg, or the search result): start once the page has settled
  if (location.hash === '#play') { history.replaceState(null, '', location.pathname + location.search); setTimeout(start, calm ? 100 : 700); }
  // While I think, a few WOPR lights blink in the empty holes
  setInterval(() => {
    if (!game.classList.contains('is-thinking')) return;
    const d = pick(cells.filter((c) => !c.classList.contains('you') && !c.classList.contains('me'))); if (!d) return;
    d.classList.add('wopr'); setTimeout(() => d.classList.remove('wopr'), 220);
  }, 90);
}
