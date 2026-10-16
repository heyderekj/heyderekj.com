/**
 * Small sounds for opening, closing and pressing things, from cuelume (synthesized with Web Audio, no
 * files). Elements opt in with data-cuelume-* attributes (bind() wires them up, here once for the site);
 * code plays a cue with cue(). Everything is "subtle": it's decoration, not information.
 *
 * Sound can be turned off from the Sound button in the bar menu; the choice is kept in this browser.
 */
import { bind, play, setEnabled, setVolume, unlock, type PlayOptions, type SoundName } from 'cuelume';

const KEY = 'hdj:sound';
let on = true;
try { on = localStorage.getItem(KEY) !== 'off'; } catch {}
setEnabled(on);
setVolume(0.6);
bind();

/** Play a cue (quietly, unless told otherwise); nothing when sound is off. The crisp ones, picking and
 *  switching, are tiles instead: see tile() */
export function cue(name: SoundName, options: PlayOptions = {}) {
  if (!on) return;
  if (name === 'select' || name === 'toggle') return void tile(name, options.direction === 'back');
  play(name, { emphasis: 'subtle', ...options });
}

/**
 * A ceramic tile set down on another: a bright click from the edges meeting, the hard ring of the glaze,
 * and a smaller second tap as it settles. Made here with Web Audio (no files): band-passed noise for the
 * click, two quick sine partials for the ring. `select` is a lighter, higher tile; `toggle` a fuller one;
 * going back sits a little lower. Every one is slightly different, like real tiles.
 */
let ac: AudioContext | null = null, noise: AudioBuffer | null = null, last = 0;
async function tile(kind: 'select' | 'toggle', back: boolean) {
  // Dragging a slider fast plays at most one tile every 35 ms
  const now = performance.now();
  if (now - last < 35) return;
  last = now;
  try { ac ??= new AudioContext(); if (ac.state !== 'running') await ac.resume(); } catch { return; }
  const ctx = ac;
  if (!noise) {
    noise = ctx.createBuffer(1, Math.round(ctx.sampleRate * 0.05), ctx.sampleRate);
    const d = noise.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const out = ctx.createGain();
  out.gain.value = 0.5;
  out.connect(ctx.destination);
  const pitch = (kind === 'select' ? 1.18 : 1) * (back ? 0.9 : 1) * (0.96 + Math.random() * 0.08);
  const strike = (t: number, level: number) => {
    // The click: a short burst of noise, filtered to a bright, narrow band
    const n = ctx.createBufferSource(), bp = ctx.createBiquadFilter(), g = ctx.createGain();
    n.buffer = noise; bp.type = 'bandpass'; bp.frequency.value = 3400 * pitch; bp.Q.value = 6;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.9 * level, t + 0.001); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.022);
    n.connect(bp).connect(g).connect(out); n.start(t); n.stop(t + 0.03);
    // The ring: two inharmonic partials, gone almost at once, like glaze on stone
    for (const [f, a, len] of [[1850, 0.32, 0.05], [4260, 0.12, 0.03]] as const) {
      const o = ctx.createOscillator(), og = ctx.createGain();
      o.type = 'sine'; o.frequency.value = f * pitch;
      og.gain.setValueAtTime(0.0001, t); og.gain.exponentialRampToValueAtTime(a * level, t + 0.0015); og.gain.exponentialRampToValueAtTime(0.0001, t + len);
      o.connect(og).connect(out); o.start(t); o.stop(t + len + 0.01);
    }
  };
  const t = ctx.currentTime + 0.005;
  strike(t, kind === 'toggle' ? 1 : 0.8);
  strike(t + 0.016 + Math.random() * 0.008, kind === 'toggle' ? 0.35 : 0.25); // settling
}

/** The Sound buttons ([data-sound]): on/off, remembered, and they start audio in the click that turns it on */
function paint() {
  document.querySelectorAll<HTMLButtonElement>('[data-sound]').forEach((b) => {
    b.setAttribute('aria-pressed', String(on));
    b.title = on ? 'Sound on' : 'Sound off';
  });
}
document.addEventListener('click', (e) => {
  const b = (e.target as Element).closest('[data-sound]');
  if (!b) return;
  on = !on;
  setEnabled(on);
  try { localStorage.setItem(KEY, on ? 'on' : 'off'); } catch {}
  paint();
  if (on) unlock().then(() => cue('toggle', { direction: 'forward' }));
});
paint();
