/**
 * The 404 game's card (client/four.ts): when a game ends, you can make a card of it instead of
 * going on a leaderboard. Pick a design, add your own pet (a photo and a name, kept on your
 * device), then copy, save or share it as an image, or as a short clip that replays the last round chip by chip.
 * Drawn on a canvas (1080 × 1350); the clip is recorded from it with MediaRecorder and loops in
 * the preview once it's made.
 */
export type Move = { c: number; r: number; who: 1 | 2 };
type Game = { board: number[]; moves: Move[]; run: number[]; by: 'you' | 'them'; score: number; level: number; wins: number; foe: string; foeTone: string };
type Design = 'paper' | 'arcade' | 'orange';
type Layout = 'classic' | 'poster' | 'faceoff';

const W = 1080, H = 1350, COLS = 7, ROWS = 6;
const THEMES: Record<Design, { bg: string; ink: string; muted: string; board: string; hole: string; edge: string; accent: string }> = {
  paper: { bg: '#faf9f7', ink: '#161513', muted: '#6c6760', board: '#fdfcfa', hole: 'rgba(22,21,19,0.07)', edge: 'rgba(22,21,19,0.12)', accent: '#ea580c' },
  arcade: { bg: '#0d0c0b', ink: '#f6f4f0', muted: '#8a847b', board: '#1b1a18', hole: '#2a2824', edge: 'rgba(246,244,240,0.12)', accent: '#ea580c' },
  orange: { bg: '#ea580c', ink: '#fff7ef', muted: 'rgba(255,247,239,0.78)', board: 'rgba(255,255,255,0.14)', hole: 'rgba(0,0,0,0.14)', edge: 'rgba(255,255,255,0.35)', accent: '#fff7ef' },
};

const root = document.querySelector<HTMLElement>('.four-card');
// Your chip, and each animal's in their colour (loaded once, as needed)
const chipImages = new Map<string, HTMLImageElement>();
const chip = (name: string, onload?: () => void) => { let img = chipImages.get(name); if (!img) { img = new Image(); img.src = `/images/four/chip-${name}.webp`; chipImages.set(name, img); } if (onload && !img.complete) img.addEventListener('load', onload, { once: true }); return img; };

// The animals' portraits, for their side of the card
const pets = new Map<string, HTMLImageElement>();
const portrait = (name: string, onload?: () => void) => { let img = pets.get(name); if (!img) { img = new Image(); img.src = `/images/four/pet-${name.toLowerCase()}.webp`; pets.set(name, img); } if (onload && !img.complete) img.addEventListener('load', onload, { once: true }); return img; };

let game: Game | null = null, design: Design = 'paper', layout: Layout = 'classic';
let openCardImpl: (g: Game) => void = () => {};
// Your side of the card: your pet, if you add one (a square crop, drawn once), and their name
let petPhoto: HTMLCanvasElement | null = null, petName = '';
// Under each animal's name on the card
const TAGS: Record<string, string> = { Leroy: 'Slow and steady', Lilo: 'Too kind', Kiya: 'The bully', Irma: 'Plays hard' };

// ---- Drawing the card. `upto` and `fall` animate the clip: how many moves are in, and how far the last has dropped.
// `flash` rings the winning four; as a number (0–1) it's the clip's reveal, ringing them one by one as the rest dim.
// `intro` (0–1) drops the title's four chips in, one after another, then brings up its words.
// Three layouts arrange the same parts: the title, the result, the board, the two players and the footer.
function draw(ctx: CanvasRenderingContext2D, g: Game, upto = g.moves.length, fall = 1, flash: boolean | number = true, intro = 1) {
  const t = THEMES[design];
  ctx.save(); ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = t.bg; ctx.fillRect(0, 0, W, H);
  // The ground: a dot grid, or scanlines
  if (design === 'paper' || design === 'orange') { ctx.fillStyle = design === 'paper' ? 'rgba(22,21,19,0.1)' : 'rgba(255,255,255,0.16)'; for (let y = 27; y < H; y += 36) for (let x = 27; x < W; x += 36) { ctx.beginPath(); ctx.arc(x, y, 2, 0, 7); ctx.fill(); } }
  if (design === 'arcade') { ctx.fillStyle = 'rgba(255,255,255,0.025)'; for (let y = 0; y < H; y += 6) ctx.fillRect(0, y, W, 2); }

  const sans = 'Figtree, ui-sans-serif, system-ui, sans-serif', mono = 'ui-monospace, SFMono-Regular, Menlo, monospace';
  const mine = design === 'orange' ? t.ink : '#ea580c', foeChip = chip(g.foe.toLowerCase()), myChip = chip('orange');

  // The title: four chips, yours and theirs, dropped in a row like a winning line, then the WOPR's question
  const title = (x: number, y: number, center: boolean) => {
    const d = 34, gap = 8, words = 'Shall we play a game?';
    ctx.font = `600 34px ${sans}`;
    const tw = 4 * d + 3 * gap + 18 + ctx.measureText(words).width, x0 = center ? (W - tw) / 2 : x;
    [myChip, foeChip, myChip, foeChip].forEach((img, k) => {
      const p = Math.max(0, Math.min(1, (intro - k * 0.12) / 0.4)); if (!p) return;
      const cx = x0 + k * (d + gap), cy = y - d + 6 - (1 - easeOutBounce(p)) * 70;
      ctx.globalAlpha = Math.min(1, p * 3); ctx.drawImage(img, cx, cy, d, d);
    });
    ctx.globalAlpha = Math.max(0, Math.min(1, (intro - 0.55) / 0.35));
    ctx.fillStyle = t.accent; ctx.fillText(words, x0 + 4 * d + 3 * gap + 18, y);
    ctx.globalAlpha = 1;
  };
  // This game: who took it, and in how many moves
  const heading = (x: number, y: number, size: number, center: boolean) => {
    ctx.textAlign = center ? 'center' : 'left';
    ctx.fillStyle = t.ink; ctx.font = `700 ${size}px ${sans}`;
    let s = size; while (ctx.measureText(result(g)).width > W - 160 && (s -= 4) > 48) ctx.font = `700 ${s}px ${sans}`;
    ctx.fillText(result(g), x, y);
    ctx.fillStyle = t.muted; ctx.font = `500 ${Math.round(size * 0.41)}px ${sans}`;
    ctx.fillText(`In ${myMoves(g)} moves  ·  Level ${g.level}  ·  ${g.score.toLocaleString()} points`, x + (center ? 0 : 4), y + Math.round(size * 0.66));
    ctx.textAlign = 'left';
  };
  // The board, as it stood, `bw` wide from (bx, by); returns its height
  const board = (bx: number, by: number, bw: number) => {
    const gap = Math.round(bw * 0.018), pad = Math.round(bw * 0.033), hole = (bw - pad * 2 - gap * (COLS - 1)) / COLS, bh = pad * 2 + hole * ROWS + gap * (ROWS - 1);
    ctx.fillStyle = t.board; ctx.strokeStyle = t.edge; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, bw * 0.054); ctx.fill(); ctx.stroke();
    const at = (c: number, r: number) => [bx + pad + c * (hole + gap), by + pad + r * (hole + gap)] as const;
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) { const [x, y] = at(c, r); ctx.fillStyle = t.hole; ctx.beginPath(); ctx.arc(x + hole / 2, y + hole / 2, hole / 2, 0, 7); ctx.fill(); }
    const shown = g.moves.slice(0, upto), reveal = typeof flash === 'number' && g.run.length ? flash : -1;
    shown.forEach((m, n) => {
      ctx.globalAlpha = reveal >= 0 && !g.run.includes(m.r * COLS + m.c) ? 1 - 0.6 * Math.min(1, reveal * 2) : 1;
      const [x, y] = at(m.c, m.r), last = n === shown.length - 1 && fall < 1;
      const yy = last ? by + pad - hole + (y - (by + pad - hole)) * easeOutBounce(fall) : y;
      if (design === 'orange' && m.who === 1) { ctx.fillStyle = 'rgba(255,247,239,0.9)'; ctx.beginPath(); ctx.arc(x + hole / 2, yy + hole / 2, hole / 2 + 3, 0, 7); ctx.fill(); }
      ctx.drawImage(m.who === 1 ? myChip : foeChip, x, yy, hole, hole);
    });
    ctx.globalAlpha = 1;
    // The winning four, ringed: yours in orange when you stopped on a win, theirs in their colour
    if (flash && upto >= g.moves.length && g.run.length) {
      ctx.strokeStyle = g.by === 'you' ? mine : g.foeTone; ctx.lineWidth = Math.max(5, bw * 0.009);
      g.run.forEach((i, k) => {
        const [x, y] = at(i % COLS, Math.floor(i / COLS));
        const p = reveal < 0 ? 1 : Math.max(0, Math.min(1, (reveal - k * 0.15) / 0.4)); // one after another
        if (!p) return;
        ctx.globalAlpha = Math.min(1, p * 2);
        ctx.beginPath(); ctx.arc(x + hole / 2, y + hole / 2, (hole / 2 + 7) * (0.7 + 0.3 * easeOutBack(p)), 0, 7); ctx.stroke();
      });
      ctx.globalAlpha = 1;
    }
    return bh;
  };
  // A player: their face in a ring, with name and tag beside it, or under it when `under`
  const player = (img: CanvasImageSource | null, ring: string, cx: number, cy: number, r: number, name: string, tag: string, align: 'left' | 'right' | 'center') => {
    ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.clip();
    if (img) ctx.drawImage(img, cx - r, cy - r, r * 2, r * 2); else { ctx.fillStyle = t.hole; ctx.fillRect(cx - r, cy - r, r * 2, r * 2); }
    ctx.restore();
    ctx.strokeStyle = ring; ctx.lineWidth = Math.max(6, r * 0.07); ctx.beginPath(); ctx.arc(cx, cy, r + r * 0.12, 0, 7); ctx.stroke();
    const under = align === 'center', tx = under ? cx : align === 'left' ? cx + r + 30 : cx - r - 30, ty = under ? cy + r + 74 : cy + 4;
    const room = under ? 380 : W / 2 - 50 - (align === 'left' ? tx : W - tx);
    ctx.textAlign = align; ctx.fillStyle = t.ink;
    let size = under ? 54 : 46; do { ctx.font = `700 ${size}px ${sans}`; } while (ctx.measureText(name).width > room && (size -= 2) > 26);
    let n = name; while (ctx.measureText(n).width > room && n.length > 1) n = n.slice(0, -2) + '…';
    ctx.fillText(n, tx, ty);
    ctx.fillStyle = t.muted; ctx.font = `500 ${under ? 28 : 24}px ${sans}`; ctx.fillText(tag, tx, ty + (under ? 42 : 38));
    ctx.textAlign = 'left';
  };
  const me = { img: petPhoto ?? myChip, name: petName || (petPhoto ? 'Your pet' : 'You'), tag: petPhoto && !petName ? 'Unnamed' : 'Challenger' };
  const them = { img: pets.get(g.foe) ?? foeChip, name: g.foe, tag: TAGS[g.foe] ?? '' };
  const vs = (x: number, y: number, size = 26) => { ctx.fillStyle = t.muted; ctx.font = `600 ${size}px ${mono}`; ctx.textAlign = 'center'; ctx.fillText('VS', x, y); ctx.textAlign = 'left'; };

  if (layout === 'poster') {
    // The board, big, then the result under it
    title(0, 116, true);
    const bw = 940, bh = board((W - bw) / 2, 170, bw);
    heading(W / 2, 170 + bh + 118, 84, true);
  } else if (layout === 'faceoff') {
    // The two of you, big, then the result, then the board
    title(0, 116, true);
    const cy = 300, r = 118;
    player(me.img, mine, 260, cy, r, me.name, me.tag, 'center');
    player(them.img, g.foeTone, W - 260, cy, r, them.name, them.tag, 'center');
    vs(W / 2, cy + 14, 40);
    heading(W / 2, 640, 76, true);
    const bw = 520; board((W - bw) / 2, 730, bw);
  } else {
    // Classic: the result up top, the board, and the matchup under it
    title(90, 136, false);
    heading(86, 246, 92, false);
    const bw = 780, by = 352, bh = board((W - bw) / 2, by, bw), cy = by + bh + 118, r = 64, gutter = 90;
    player(me.img, mine, gutter + r, cy, r, me.name, me.tag, 'left');
    player(them.img, g.foeTone, W - gutter - r, cy, r, them.name, them.tag, 'right');
    vs(W / 2, cy + 10);
  }

  // Footer
  ctx.fillStyle = t.muted; ctx.font = `500 26px ${mono}`;
  ctx.fillText('heyderekj.com/404', 90, H - 70);
  ctx.textAlign = 'right'; ctx.fillText(new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), W - 90, H - 70); ctx.textAlign = 'left';
  ctx.restore();
}
function easeOutBack(x: number) { const c = 1.70158; return 1 + (c + 1) * (x - 1) ** 3 + c * (x - 1) ** 2; }
function easeOutBounce(x: number) { const n = 7.5625, d = 2.75; if (x < 1 / d) return n * x * x; if (x < 2 / d) return n * (x -= 1.5 / d) * x + 0.75; if (x < 2.5 / d) return n * (x -= 2.25 / d) * x + 0.9375; return n * (x -= 2.625 / d) * x + 0.984375; }

// ---- Sharing: the system share sheet when it takes files (phones, Safari), otherwise a download
const NAME = 'shall-we-play-a-game';
const fileOf = (blob: Blob) => new File([blob], `${NAME}.${blob.type.includes('mp4') ? 'mp4' : blob.type.includes('webm') ? 'webm' : 'png'}`, { type: blob.type });
const canShareFiles = (() => { try { return !!navigator.canShare?.({ files: [new File([''], 'x.png', { type: 'image/png' })] }); } catch { return false; } })();
function save(blob: Blob) {
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = fileOf(blob).name; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}
// What a post says: who won, against whom, and an invitation back to the game
const PLAY_URL = 'https://heyderekj.com/404';
// This game's result, for the card's heading and the post
const myMoves = (g: Game) => g.moves.filter((m) => m.who === 1).length;
const result = (g: Game) => !g.run.length ? `A draw with ${g.foe}` : g.by === 'you' ? `${petName || 'You'} beat ${g.foe}` : `${g.foe} won this one`;
function postText() {
  if (!game) return '';
  const me = petName || 'I', foe = game.foe;
  if (!game.run.length) return `${me} drew with ${foe} at Connect Four. Your turn:`;
  if (game.by === 'you') return `${me} beat ${foe} at Connect Four in ${myMoves(game)} moves. Your turn:`;
  return `${foe} beat ${petName || 'me'} at Connect Four. Your turn:`;
}
async function shareOut(blob: Blob) {
  const file = fileOf(blob);
  if (!navigator.canShare?.({ files: [file] })) { save(blob); return 'saved'; }
  try { await navigator.share({ files: [file], title: 'Shall we play a game?', text: `${postText()} ${PLAY_URL}` }); return 'shared'; }
  catch (e) { return (e as Error).name === 'AbortError' ? 'closed' : (save(blob), 'saved'); }
}
const canClip = typeof MediaRecorder !== 'undefined' && 'captureStream' in HTMLCanvasElement.prototype;
// The clip: the last five seconds of the game (up to a dozen chips, the earlier ones already in), then the
// winning four ringed one by one while everything else dims, and a hold on that
const REPLAY = 5000, REVEAL = 1200, HOLD = 1500;
/**
 * The clip's soundtrack: the same blips the game makes (client/four.ts beep), played into a stream the
 * recorder takes alongside the picture. A chip sounds as it lands (higher rows lower), and the round ends
 * on the jingle for whoever won.
 */
function sounds() {
  let ac: AudioContext;
  try { ac = new AudioContext(); } catch { return null; }
  const out = ac.createMediaStreamDestination();
  const blip = (at: number, freqs: number[], step: number, type: OscillatorType, vol: number) => freqs.forEach((f, i) => {
    const t = at + i * step, o = ac.createOscillator(), gn = ac.createGain();
    o.type = type; o.frequency.value = f; gn.gain.setValueAtTime(vol, t); gn.gain.exponentialRampToValueAtTime(0.001, t + step * 1.6);
    o.connect(gn).connect(out); o.start(t); o.stop(t + step * 1.7);
  });
  return {
    track: out.stream.getAudioTracks()[0],
    async score(g: Game, from: number, per: number, replay: number) {
      try { await ac.resume(); } catch { return; }
      const t0 = ac.currentTime;
      g.moves.slice(from).forEach((m, k) => blip(t0 + ((k + 1) * per) / 1000 - 0.02, [m.who === 1 ? 660 - m.r * 40 : 330 - m.r * 20], 0.05, m.who === 1 ? 'square' : 'triangle', 0.1));
      if (!g.run.length) return;
      const end = t0 + replay / 1000 + 0.15;
      if (g.by === 'you') blip(end, [523, 659, 784, 1047], 0.1, 'square', 0.08);
      else blip(end, [392, 330, 262, 196], 0.14, 'sawtooth', 0.06);
    },
    close() { ac.close().catch(() => {}); },
  };
}

const clipPlan = (g: Game) => {
  const n = Math.min(g.moves.length, 12), per = Math.min(700, REPLAY / Math.max(1, n)), from = g.moves.length - n;
  const replay = n * per, reveal = g.run.length ? REVEAL : 0;
  return { from, per, replay, reveal, length: replay + reveal + HOLD };
};

if (root) {
  const preview = root.querySelector<HTMLCanvasElement>('.four-card__preview canvas')!;
  const pctx = preview.getContext('2d')!;
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
    if (as === 'image') { root.classList.remove('is-recording'); clearTimeout(stale); video.pause(); video.hidden = true; say(''); render(); }
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
    const g = game, type = ['video/mp4;codecs=avc1,mp4a.40.2', 'video/mp4', 'video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'].find((m) => MediaRecorder.isTypeSupported(m)) ?? '';
    const { from, per, replay, reveal, length } = clipPlan(g);
    root!.classList.add('is-recording'); video.hidden = true; // the Rec badge and bar say what's happening
    recording = (async () => {
      // The picture from the canvas, and the game's own sounds alongside it, in time with each chip
      const audio = sounds(), stream = new MediaStream([...preview.captureStream(30).getVideoTracks(), ...(audio?.track ? [audio.track] : [])]);
      const rec = new MediaRecorder(stream, type ? { mimeType: type, videoBitsPerSecond: 5_000_000 } : undefined), parts: Blob[] = [];
      rec.ondataavailable = (ev) => ev.data.size && parts.push(ev.data);
      const done = new Promise((r) => (rec.onstop = r));
      rec.start();
      const t0 = performance.now();
      audio?.score(g, from, per, replay);
      let cut = false;
      await new Promise<void>((resolve) => {
        const frame = (now: number) => {
          // Changing the design or your pet mid-take restarts it
          if (game !== g || !root!.classList.contains('is-recording')) { cut = true; return resolve(); }
          const t = now - t0;
          root!.style.setProperty('--rec', String(Math.min(1, t / length)));
          const intro = Math.min(1, t / 1100);
          if (t < replay) draw(pctx, g, from + Math.floor(t / per) + 1, (t % per) / per, false, intro);
          else if (t < length) draw(pctx, g, g.moves.length, 1, reveal ? Math.min(1, (t - replay) / reveal) : true, intro);
          else return resolve();
          requestAnimationFrame(frame);
        };
        requestAnimationFrame(frame);
      });
      rec.stop(); stream.getTracks().forEach((tr) => tr.stop()); await done; audio?.close();
      root!.classList.remove('is-recording'); root!.style.removeProperty('--rec'); recording = null;
      render();
      if (cut) return null;
      clip = new Blob(parts, { type: rec.mimeType || 'video/webm' });
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

  // A line under the buttons only when there's something to do about it, gone after a while
  let hush = 0;
  function say(text: string) { status.textContent = text; clearTimeout(hush); if (text) hush = window.setTimeout(() => (status.textContent = ''), 5000); }
  // Safari wants the promise handed straight to the clipboard, inside the click
  const copyImage = () => { render(); return navigator.clipboard.write([new ClipboardItem({ 'image/png': new Promise<Blob>((r, x) => preview.toBlob((b) => (b ? r(b) : x()), 'image/png')) })]); };
  copyBtn.addEventListener('click', async () => {
    if (!game) return;
    try { await copyImage(); did(copyBtn, 'Copied'); } catch { say('Couldn’t copy here. Save it instead.'); }
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

  // Post it: X and Facebook take a link, so the picture goes on the clipboard (or the clip into
  // Downloads) to add to the post. Instagram and Messages take the picture itself, through the
  // share sheet on phones; on a computer, Instagram gets a saved file and Text opens Messages
  const enc = encodeURIComponent;
  root.querySelectorAll<HTMLButtonElement>('[data-post]').forEach((b) => b.addEventListener('click', async () => {
    if (!game) return;
    const where = b.dataset.post!, text = postText();
    if (where === 'instagram' || (where === 'text' && canShareFiles)) {
      b.disabled = true; const blob = await current(); b.disabled = false;
      if (!blob) return;
      if ((await shareOut(blob)) === 'saved') say(where === 'instagram' ? 'Saved. Instagram only takes posts from its app, so add it from your phone.' : 'Saved to your downloads.');
      return;
    }
    if (where === 'text') { location.href = `sms:?&body=${enc(`${text} ${PLAY_URL}`)}`; return; }
    let note = '';
    if (as === 'clip') {
      if (!clip) { record(); say('Making the clip first. Tap again when it’s done.'); return; }
      save(clip); note = 'Clip saved. Add it to your post.';
    } else if (canCopy) {
      try { await copyImage(); note = 'Card copied. Paste it into your post.'; } catch { /* the link alone, then */ }
    }
    const href = where === 'x' ? `https://x.com/intent/post?text=${enc(text)}&url=${enc(PLAY_URL)}` : `https://www.facebook.com/sharer/sharer.php?u=${enc(PLAY_URL)}`;
    window.open(href, '_blank', 'noopener,width=620,height=680');
    say(note);
  }));

  // Layouts and colours
  root.querySelectorAll<HTMLButtonElement>('[data-design]').forEach((b) => b.addEventListener('click', () => {
    design = b.dataset.design as Design;
    root.querySelectorAll<HTMLElement>('[data-design]').forEach((x) => x.setAttribute('aria-checked', String(x.dataset.design === design)));
    changed();
  }));
  root.querySelectorAll<HTMLButtonElement>('[data-layout]').forEach((b) => b.addEventListener('click', () => {
    layout = b.dataset.layout as Layout;
    root.querySelectorAll('[data-layout]').forEach((x) => x.setAttribute('aria-checked', String(x === b)));
    changed();
  }));

  // Your pet: a photo (picked, dropped or pasted) and a name. The photo never leaves the browser
  const petBox = root.querySelector<HTMLElement>('.four-card__pet')!;
  const petFile = root.querySelector<HTMLInputElement>('[data-pet-file]')!;
  const petThumb = root.querySelector<HTMLElement>('.four-card__photo')!;
  const nameInput = root.querySelector<HTMLInputElement>('[data-pet-name]')!;
  const clearBtn = root.querySelector<HTMLButtonElement>('[data-pet-clear]')!;
  async function usePhoto(file: File | undefined) {
    if (!file || !file.type.startsWith('image/')) return;
    const url = URL.createObjectURL(file), img = new Image();
    try { img.src = url; await img.decode(); } catch { say('That photo didn’t load. Try another.'); return; } finally { setTimeout(() => URL.revokeObjectURL(url), 0); }
    // A centred square, small enough to keep around
    const c = document.createElement('canvas'), side = Math.min(img.naturalWidth, img.naturalHeight);
    c.width = c.height = 480;
    c.getContext('2d')!.drawImage(img, (img.naturalWidth - side) / 2, (img.naturalHeight - side) / 2, side, side, 0, 0, 480, 480);
    petPhoto = c; petThumb.style.backgroundImage = `url(${c.toDataURL('image/jpeg', 0.8)})`;
    root!.classList.add('has-pet'); clearBtn.hidden = false;
    if (!nameInput.value) nameInput.focus();
    changed();
  }
  petFile.addEventListener('change', () => { usePhoto(petFile.files?.[0]); petFile.value = ''; });
  petBox.addEventListener('dragover', (e) => { e.preventDefault(); petBox.classList.add('is-over'); });
  petBox.addEventListener('dragleave', () => petBox.classList.remove('is-over'));
  petBox.addEventListener('drop', (e) => { e.preventDefault(); petBox.classList.remove('is-over'); usePhoto(e.dataTransfer?.files[0]); });
  root.addEventListener('paste', (e) => { const f = [...(e.clipboardData?.files ?? [])].find((x) => x.type.startsWith('image/')); if (f) { e.preventDefault(); usePhoto(f); } });
  let typing = 0;
  nameInput.addEventListener('input', () => { petName = nameInput.value.trim(); render(); clearTimeout(typing); typing = window.setTimeout(changed, 500); });
  clearBtn.addEventListener('click', () => { petPhoto = null; petThumb.style.backgroundImage = ''; root.classList.remove('has-pet'); clearBtn.hidden = true; changed(); });

  root.querySelector('[data-card-close]')!.addEventListener('click', () => { root.hidden = true; root.classList.remove('is-recording'); video.pause(); document.querySelector<HTMLElement>('[data-four-card]')?.focus(); });

  // Called by the game when you ask for a card
  openCardImpl = (g) => {
    game = g; root.hidden = false; say(''); clip = null;
    lengthLabel.textContent = ` · ${Math.round(clipPlan(g).length / 1000)}s`;
    setAs('image');
    chip('orange', render); chip(g.foe.toLowerCase(), render); portrait(g.foe, render);
    requestAnimationFrame(() => { render(); root.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); });
  };
}
export const openCard = (g: Game) => openCardImpl(g);
