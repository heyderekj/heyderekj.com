/**
 * The 404 game's card (client/four.ts): when a game ends, you can make a card of it instead of
 * going on a leaderboard. Pick a design, sign it, and share it as an image, or as a short clip
 * that replays the last round chip by chip.
 * Drawn on a canvas (1080 × 1350); the clip is recorded from it with MediaRecorder.
 */
export type Move = { c: number; r: number; who: 1 | 2 };
type Game = { board: number[]; moves: Move[]; run: number[]; by: 'you' | 'them'; score: number; level: number; wins: number; foe: string; foeTone: string };
type Design = 'paper' | 'blueprint' | 'arcade' | 'orange';

const W = 1080, H = 1350, COLS = 7, ROWS = 6;
const THEMES: Record<Design, { bg: string; ink: string; muted: string; board: string; hole: string; edge: string; accent: string }> = {
  paper: { bg: '#faf9f7', ink: '#161513', muted: '#6c6760', board: '#fdfcfa', hole: 'rgba(22,21,19,0.07)', edge: 'rgba(22,21,19,0.12)', accent: '#ea580c' },
  blueprint: { bg: '#1d4b8c', ink: '#eef3fb', muted: '#a8bfdf', board: 'rgba(238,243,251,0.06)', hole: 'rgba(238,243,251,0.12)', edge: 'rgba(238,243,251,0.4)', accent: '#ffb27a' },
  arcade: { bg: '#0d0c0b', ink: '#f6f4f0', muted: '#8a847b', board: '#1b1a18', hole: '#2a2824', edge: 'rgba(246,244,240,0.12)', accent: '#ea580c' },
  orange: { bg: '#ea580c', ink: '#fff7ef', muted: 'rgba(255,247,239,0.78)', board: 'rgba(255,255,255,0.14)', hole: 'rgba(0,0,0,0.14)', edge: 'rgba(255,255,255,0.35)', accent: '#fff7ef' },
};

const root = document.querySelector<HTMLElement>('.four-card');
// Your chip, and each animal's in their colour (loaded once, as needed)
const chipImages = new Map<string, HTMLImageElement>();
const chip = (name: string, onload?: () => void) => { let img = chipImages.get(name); if (!img) { img = new Image(); img.src = `/images/four/chip-${name}.webp`; chipImages.set(name, img); } if (onload && !img.complete) img.addEventListener('load', onload, { once: true }); return img; };

let game: Game | null = null, design: Design = 'paper';
let openCardImpl: (g: Game) => void = () => {};
let strokes: [number, number][][] = []; // the player's signature, in 0–1 coordinates of the pad
let padAspect = 2.5; // the pad's width ÷ height, so the signature keeps its shape on the card

// ---- Drawing the card. `upto` and `fall` animate the clip: how many moves are in, and how far the last has dropped
function draw(ctx: CanvasRenderingContext2D, g: Game, upto = g.moves.length, fall = 1, flash = true) {
  const t = THEMES[design];
  ctx.save(); ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = t.bg; ctx.fillRect(0, 0, W, H);
  // The ground: dot grid, graph paper, or scanlines
  if (design === 'paper' || design === 'orange') { ctx.fillStyle = design === 'paper' ? 'rgba(22,21,19,0.1)' : 'rgba(255,255,255,0.16)'; for (let y = 27; y < H; y += 36) for (let x = 27; x < W; x += 36) { ctx.beginPath(); ctx.arc(x, y, 2, 0, 7); ctx.fill(); } }
  if (design === 'blueprint') { ctx.strokeStyle = 'rgba(238,243,251,0.08)'; ctx.lineWidth = 1; for (let x = 0; x <= W; x += 36) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); } for (let y = 0; y <= H; y += 36) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); } ctx.strokeStyle = 'rgba(238,243,251,0.16)'; for (let x = 0; x <= W; x += 180) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); } }
  if (design === 'arcade') { ctx.fillStyle = 'rgba(255,255,255,0.025)'; for (let y = 0; y < H; y += 6) ctx.fillRect(0, y, W, 2); }

  const sans = 'Figtree, ui-sans-serif, system-ui, sans-serif', mono = 'ui-monospace, SFMono-Regular, Menlo, monospace';
  // Heading
  ctx.fillStyle = t.accent; ctx.font = `600 26px ${mono}`; ctx.letterSpacing = '6px'; ctx.fillText('SHALL WE PLAY A GAME?', 90, 132); ctx.letterSpacing = '0px';
  ctx.fillStyle = t.ink; ctx.font = `700 92px ${sans}`;
  ctx.fillText(g.wins === 1 ? `1 win against ${g.foe}` : `${g.wins} wins against ${g.foe}`, 86, 236);
  ctx.fillStyle = t.muted; ctx.font = `500 38px ${sans}`;
  ctx.fillText(`Level ${g.level}  ·  ${g.score.toLocaleString()} points`, 90, 296);

  // The board, as it stood
  const bw = 780, bx = (W - bw) / 2, by = 352, gap = 14, pad = 26, hole = (bw - pad * 2 - gap * (COLS - 1)) / COLS, bh = pad * 2 + hole * ROWS + gap * (ROWS - 1);
  ctx.fillStyle = t.board; ctx.strokeStyle = t.edge; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, 42); ctx.fill(); ctx.stroke();
  const at = (c: number, r: number) => [bx + pad + c * (hole + gap), by + pad + r * (hole + gap)] as const;
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) { const [x, y] = at(c, r); ctx.fillStyle = t.hole; ctx.beginPath(); ctx.arc(x + hole / 2, y + hole / 2, hole / 2, 0, 7); ctx.fill(); }
  const shown = g.moves.slice(0, upto);
  shown.forEach((m, n) => {
    const [x, y] = at(m.c, m.r), last = n === shown.length - 1 && fall < 1;
    const yy = last ? by + pad - hole + (y - (by + pad - hole)) * easeOutBounce(fall) : y;
    if (design === 'orange' && m.who === 1) { ctx.fillStyle = 'rgba(255,247,239,0.9)'; ctx.beginPath(); ctx.arc(x + hole / 2, yy + hole / 2, hole / 2 + 3, 0, 7); ctx.fill(); }
    ctx.drawImage(chip(m.who === 1 ? 'orange' : g.foe.toLowerCase()), x, yy, hole, hole);
  });
  // The winning four, ringed: yours in orange when you stopped on a win, theirs in their colour
  if (flash && upto >= g.moves.length && g.run.length) {
    ctx.strokeStyle = g.by === 'you' ? (design === 'orange' ? t.ink : '#ea580c') : g.foeTone; ctx.lineWidth = 7;
    g.run.forEach((i) => { const [x, y] = at(i % COLS, Math.floor(i / COLS)); ctx.beginPath(); ctx.arc(x + hole / 2, y + hole / 2, hole / 2 + 7, 0, 7); ctx.stroke(); });
  }

  // Your signature, on a line under the board
  const sw = 560, sh = 120, sx = (W - sw) / 2, sy = by + bh + 34; // leaves room for the footer
  ctx.strokeStyle = t.edge; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(sx, sy + sh); ctx.lineTo(sx + sw, sy + sh); ctx.stroke();
  ctx.fillStyle = t.muted; ctx.font = `500 24px ${sans}`; ctx.textAlign = 'center';
  ctx.fillText('Signed', W / 2, sy + sh + 40); ctx.textAlign = 'left';
  ctx.strokeStyle = t.ink; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = 6;
  const fw = Math.min(sw, sh * padAspect), fh = fw / padAspect, fx = sx + (sw - fw) / 2, fy = sy + sh - fh;
  for (const s of strokes) { ctx.beginPath(); s.forEach(([x, y], i) => { const px = fx + x * fw, py = fy + y * fh; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }); ctx.stroke(); }

  // Footer
  ctx.fillStyle = t.muted; ctx.font = `500 26px ${mono}`;
  ctx.fillText('heyderekj.com/404', 90, H - 70);
  ctx.textAlign = 'right'; ctx.fillText(new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), W - 90, H - 70); ctx.textAlign = 'left';
  ctx.restore();
}
function easeOutBounce(x: number) { const n = 7.5625, d = 2.75; if (x < 1 / d) return n * x * x; if (x < 2 / d) return n * (x -= 1.5 / d) * x + 0.75; if (x < 2.5 / d) return n * (x -= 2.25 / d) * x + 0.9375; return n * (x -= 2.625 / d) * x + 0.984375; }

// ---- Sharing: the system share sheet when it takes files, otherwise a download
async function share(blob: Blob, name: string) {
  const file = new File([blob], name, { type: blob.type });
  if (navigator.canShare?.({ files: [file] })) {
    try { await navigator.share({ files: [file], title: 'Shall we play a game?', text: `I played Connect Four against ${game?.foe ?? 'the animals'} on heyderekj.com` }); return; } catch { /* closed the sheet, or not allowed: fall through */ }
  }
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}

if (root) {
  const preview = root.querySelector<HTMLCanvasElement>('.four-card__preview canvas')!;
  const pctx = preview.getContext('2d')!;
  const pad = root.querySelector<HTMLCanvasElement>('.four-card__pad canvas')!;
  const status = root.querySelector<HTMLElement>('.four-card__status')!;
  const render = () => { if (game) draw(pctx, game); };

  // Designs
  root.querySelectorAll<HTMLButtonElement>('[data-design]').forEach((b) => b.addEventListener('click', () => {
    design = b.dataset.design as Design;
    root.querySelectorAll('[data-design]').forEach((x) => x.setAttribute('aria-checked', String(x === b)));
    render();
  }));

  // The signature pad: your strokes, kept as points so they draw crisply on the card at any size
  const sizePad = () => { const r = pad.getBoundingClientRect(), dpr = devicePixelRatio || 1; pad.width = r.width * dpr; pad.height = r.height * dpr; padAspect = r.width / r.height || padAspect; paintPad(); };
  function paintPad() {
    const c = pad.getContext('2d')!; c.clearRect(0, 0, pad.width, pad.height);
    c.strokeStyle = getComputedStyle(root!).color; c.lineWidth = 2.6 * (devicePixelRatio || 1); c.lineCap = c.lineJoin = 'round';
    for (const s of strokes) { c.beginPath(); s.forEach(([x, y], i) => (i ? c.lineTo(x * pad.width, y * pad.height) : c.moveTo(x * pad.width, y * pad.height))); c.stroke(); }
    root!.classList.toggle('is-signed', strokes.length > 0);
  }
  let drawing = false;
  const point = (e: PointerEvent): [number, number] => { const r = pad.getBoundingClientRect(); return [(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height]; };
  pad.addEventListener('pointerdown', (e) => { drawing = true; pad.setPointerCapture(e.pointerId); strokes.push([point(e)]); paintPad(); });
  pad.addEventListener('pointermove', (e) => { if (!drawing) return; strokes[strokes.length - 1].push(point(e)); paintPad(); });
  const end = () => { if (!drawing) return; drawing = false; render(); };
  pad.addEventListener('pointerup', end); pad.addEventListener('pointercancel', end);
  root.querySelector('[data-sign-clear]')!.addEventListener('click', () => { strokes = []; paintPad(); render(); });

  // Share it
  root.querySelector('[data-share-image]')!.addEventListener('click', () => {
    if (!game) return;
    render(); preview.toBlob((blob) => blob && share(blob, 'shall-we-play-a-game.png'), 'image/png');
  });
  root.querySelector('[data-share-clip]')!.addEventListener('click', async (e) => {
    const btn = e.currentTarget as HTMLButtonElement;
    if (!game || typeof MediaRecorder === 'undefined' || !preview.captureStream) { status.textContent = 'Clips aren’t supported in this browser. Share the image instead.'; return; }
    const type = ['video/mp4;codecs=avc1', 'video/mp4', 'video/webm;codecs=vp9', 'video/webm'].find((m) => MediaRecorder.isTypeSupported(m)) ?? '';
    btn.disabled = true; status.textContent = 'Recording the replay…';
    const stream = preview.captureStream(30), rec = new MediaRecorder(stream, type ? { mimeType: type, videoBitsPerSecond: 5_000_000 } : undefined), parts: Blob[] = [];
    rec.ondataavailable = (ev) => ev.data.size && parts.push(ev.data);
    const done = new Promise((r) => (rec.onstop = r));
    rec.start();
    // The round replays chip by chip, then holds on the end
    const per = 320, total = game.moves.length * per, hold = 1800, t0 = performance.now();
    await new Promise<void>((resolve) => {
      const frame = (now: number) => {
        const t = now - t0;
        if (t < total) { const n = Math.floor(t / per) + 1; draw(pctx, game!, n, (t % per) / per, false); requestAnimationFrame(frame); }
        else if (t < total + hold) { draw(pctx, game!); requestAnimationFrame(frame); }
        else resolve();
      };
      requestAnimationFrame(frame);
    });
    rec.stop(); await done;
    const blob = new Blob(parts, { type: rec.mimeType || 'video/webm' });
    status.textContent = ''; btn.disabled = false;
    share(blob, `shall-we-play-a-game.${blob.type.includes('mp4') ? 'mp4' : 'webm'}`);
  });
  root.querySelector('[data-card-close]')!.addEventListener('click', () => { root.hidden = true; document.querySelector<HTMLElement>('[data-four-card]')?.focus(); });
  addEventListener('resize', () => { if (!root.hidden) sizePad(); });

  // Called by the game when you ask for a card
  openCardImpl = (g) => {
    game = g; root.hidden = false; status.textContent = '';
    chip('orange', render); chip(g.foe.toLowerCase(), render);
    requestAnimationFrame(() => { sizePad(); render(); root.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); });
  };
}
export const openCard = (g: Game) => openCardImpl(g);
