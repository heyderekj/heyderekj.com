/**
 * The 404 game's card (client/four.ts): when a game ends, you can make a card of it instead of
 * going on a leaderboard. Pick a design, sign it, then copy, save or share it as an image, or as a
 * short clip that replays the last round chip by chip.
 * Drawn on a canvas (1080 × 1350); the clip is recorded from it with MediaRecorder and loops in
 * the preview once it's made.
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

// ---- Sharing: the system share sheet when it takes files (phones, Safari), otherwise a download
const NAME = 'shall-we-play-a-game';
const fileOf = (blob: Blob) => new File([blob], `${NAME}.${blob.type.includes('mp4') ? 'mp4' : blob.type.includes('webm') ? 'webm' : 'png'}`, { type: blob.type });
const canShareFiles = (() => { try { return !!navigator.canShare?.({ files: [new File([''], 'x.png', { type: 'image/png' })] }); } catch { return false; } })();
function save(blob: Blob) {
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = fileOf(blob).name; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}
async function shareOut(blob: Blob) {
  const file = fileOf(blob);
  if (!navigator.canShare?.({ files: [file] })) { save(blob); return 'saved'; }
  try { await navigator.share({ files: [file], title: 'Shall we play a game?', text: `I played Connect Four against ${game?.foe ?? 'the animals'} on heyderekj.com/404` }); return 'shared'; }
  catch (e) { return (e as Error).name === 'AbortError' ? 'closed' : (save(blob), 'saved'); }
}
const canClip = typeof MediaRecorder !== 'undefined' && 'captureStream' in HTMLCanvasElement.prototype;
const PER = 260, HOLD = 1800; // the clip: a beat per chip, then a hold on the end

if (root) {
  const preview = root.querySelector<HTMLCanvasElement>('.four-card__preview canvas')!;
  const pctx = preview.getContext('2d')!;
  const pad = root.querySelector<HTMLCanvasElement>('.four-card__pad canvas')!;
  const status = root.querySelector<HTMLElement>('.four-card__status')!;
  const render = () => { if (game) draw(pctx, game); };

  const video = root.querySelector<HTMLVideoElement>('.four-card__preview video')!;
  const lengthLabel = root.querySelector<HTMLElement>('[data-clip-length]')!;
  const shareBtn = root.querySelector<HTMLButtonElement>('[data-card-share]')!;
  const copyBtn = root.querySelector<HTMLButtonElement>('[data-card-copy]')!;
  const saveBtn = root.querySelector<HTMLButtonElement>('[data-card-save]')!;
  shareBtn.hidden = !canShareFiles;
  if (!canClip) root.querySelector<HTMLElement>('[data-as="clip"]')!.hidden = true;
  const canCopy = typeof ClipboardItem !== 'undefined' && !!navigator.clipboard?.write;

  // Image or clip: what Copy, Save and Share hand over. A clip is made the first time you ask for one,
  // and again whenever the card changes underneath it
  let as: 'image' | 'clip' = 'image', clip: Blob | null = null, recording: Promise<Blob | null> | null = null, stale = 0;
  const setAs = (next: typeof as) => {
    as = next;
    root.querySelectorAll('[data-as]').forEach((x) => x.setAttribute('aria-checked', String((x as HTMLElement).dataset.as === as)));
    copyBtn.hidden = as === 'clip' || !canCopy;
    if (as === 'image') { root.classList.remove('is-recording'); clearTimeout(stale); video.pause(); video.hidden = true; status.textContent = ''; render(); }
    else if (clip) showClip(); else record();
  };
  root.querySelectorAll<HTMLButtonElement>('[data-as]').forEach((b) => b.addEventListener('click', () => setAs(b.dataset.as as typeof as)));
  // Anything that changes the card throws the clip away (cutting a take in progress); in clip mode
  // it's remade once you settle
  const changed = () => {
    root.classList.remove('is-recording'); render();
    clip = null; video.hidden = true; video.pause();
    if (as === 'clip') { clearTimeout(stale); stale = window.setTimeout(() => record(), 600); }
  };
  function showClip() {
    if (!clip) return;
    if (video.src) URL.revokeObjectURL(video.src);
    video.src = URL.createObjectURL(clip); video.hidden = false; video.play().catch(() => {});
  }

  // Records the replay off the preview canvas, so you watch it being made
  function record() {
    if (recording || !game) return recording;
    const g = game, type = ['video/mp4;codecs=avc1', 'video/mp4', 'video/webm;codecs=vp9', 'video/webm'].find((m) => MediaRecorder.isTypeSupported(m)) ?? '';
    const total = g.moves.length * PER, length = total + HOLD;
    root!.classList.add('is-recording'); video.hidden = true; status.textContent = 'Recording the replay…';
    recording = (async () => {
      const stream = preview.captureStream(30), rec = new MediaRecorder(stream, type ? { mimeType: type, videoBitsPerSecond: 5_000_000 } : undefined), parts: Blob[] = [];
      rec.ondataavailable = (ev) => ev.data.size && parts.push(ev.data);
      const done = new Promise((r) => (rec.onstop = r));
      rec.start();
      const t0 = performance.now();
      let cut = false;
      await new Promise<void>((resolve) => {
        const frame = (now: number) => {
          // Changing the design or signature mid-take restarts it
          if (game !== g || !root!.classList.contains('is-recording')) { cut = true; return resolve(); }
          const t = now - t0;
          root!.style.setProperty('--rec', String(Math.min(1, t / length)));
          if (t < total) draw(pctx, g, Math.floor(t / PER) + 1, (t % PER) / PER, false);
          else if (t < length) draw(pctx, g);
          else return resolve();
          requestAnimationFrame(frame);
        };
        requestAnimationFrame(frame);
      });
      rec.stop(); stream.getTracks().forEach((tr) => tr.stop()); await done;
      root!.classList.remove('is-recording'); root!.style.removeProperty('--rec'); recording = null;
      render();
      if (cut) return null;
      clip = new Blob(parts, { type: rec.mimeType || 'video/webm' });
      status.textContent = `${(length / 1000).toFixed(1)}s clip, ready`;
      if (as === 'clip') showClip();
      return clip;
    })();
    return recording;
  }

  // The thing to hand over, as a blob
  const current = async (): Promise<Blob | null> => {
    if (!game) return null;
    if (as === 'clip') return clip ?? (await record()) ?? null;
    render(); return new Promise((r) => preview.toBlob(r, 'image/png'));
  };
  // A button says what it did for a moment, its icon turning to a check
  const did = (btn: HTMLButtonElement, word: string) => {
    const label = btn.querySelector('span')!, was = btn.dataset.label ??= label.textContent!;
    label.textContent = word; btn.classList.add('is-done');
    clearTimeout(Number(btn.dataset.t)); btn.dataset.t = String(setTimeout(() => { label.textContent = was; btn.classList.remove('is-done'); }, 1600));
  };

  copyBtn.addEventListener('click', async () => {
    if (!game) return;
    render();
    try {
      // Safari wants the promise handed straight to the clipboard, inside the click
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': new Promise<Blob>((r, x) => preview.toBlob((b) => (b ? r(b) : x()), 'image/png')) })]);
      did(copyBtn, 'Copied'); status.textContent = 'Paste it anywhere.';
    } catch { status.textContent = 'Couldn’t copy here. Save it instead.'; }
  });
  saveBtn.addEventListener('click', async () => {
    saveBtn.disabled = true; const blob = await current(); saveBtn.disabled = false;
    if (!blob) return;
    save(blob); did(saveBtn, 'Saved');
  });
  shareBtn.addEventListener('click', async () => {
    shareBtn.disabled = true; const blob = await current(); shareBtn.disabled = false;
    if (!blob) return;
    const how = await shareOut(blob);
    if (how === 'shared') did(shareBtn, 'Shared'); else if (how === 'saved') did(saveBtn, 'Saved');
  });

  // Designs
  root.querySelectorAll<HTMLButtonElement>('[data-design]').forEach((b) => b.addEventListener('click', () => {
    design = b.dataset.design as Design;
    root.querySelectorAll('[data-design]').forEach((x) => x.setAttribute('aria-checked', String(x === b)));
    changed();
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
  const end = () => { if (!drawing) return; drawing = false; changed(); };
  pad.addEventListener('pointerup', end); pad.addEventListener('pointercancel', end);
  root.querySelector('[data-sign-clear]')!.addEventListener('click', () => { strokes = []; paintPad(); changed(); });

  root.querySelector('[data-card-close]')!.addEventListener('click', () => { root.hidden = true; root.classList.remove('is-recording'); video.pause(); document.querySelector<HTMLElement>('[data-four-card]')?.focus(); });
  addEventListener('resize', () => { if (!root.hidden) sizePad(); });

  // Called by the game when you ask for a card
  openCardImpl = (g) => {
    game = g; root.hidden = false; status.textContent = ''; clip = null;
    lengthLabel.textContent = ` · ${Math.round((g.moves.length * PER + HOLD) / 1000)}s`;
    setAs('image');
    chip('orange', render); chip(g.foe.toLowerCase(), render);
    requestAnimationFrame(() => { sizePad(); render(); root.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); });
  };
}
export const openCard = (g: Game) => openCardImpl(g);
