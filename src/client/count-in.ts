/**
 * Easter egg: tap my photo in the bar four times, in time, and it counts you in (each tap shows its
 * beat on the photo) and plays a one-bar drum fill at that tempo. I'm learning the drums.
 * The photo is also the way home, so a single tap waits a moment to make sure it isn't a count-in.
 * Synthesised with the Web Audio API; nothing to load.
 */
const home = document.querySelector<HTMLAnchorElement>('.bar__home');
if (home) {
  let taps: number[] = [], goT = 0, clearT = 0, ac: AudioContext | null = null;
  const img = home.querySelector('img');
  const beat = (n: number | null) => {
    if (n == null) { delete home.dataset.beat; return; }
    home.dataset.beat = String(n);
    if (img) { img.style.animation = 'none'; void img.offsetWidth; img.style.animation = ''; } // a bump on every tap
  };

  function hit(ctx: AudioContext, t: number, kind: 'stick' | 'snare' | 'tom' | 'kick' | 'crash', pitch = 1) {
    const out = ctx.createGain(); out.connect(ctx.destination);
    if (kind === 'stick') {
      const o = ctx.createOscillator(); o.type = 'square'; o.frequency.value = 1800;
      out.gain.setValueAtTime(0.16, t); out.gain.exponentialRampToValueAtTime(0.001, t + 0.04); o.connect(out); o.start(t); o.stop(t + 0.05); return;
    }
    if (kind === 'kick' || kind === 'tom') {
      const o = ctx.createOscillator(), f0 = kind === 'kick' ? 120 : 220, f1 = kind === 'kick' ? 45 : 90;
      o.frequency.setValueAtTime(f0 * pitch, t); o.frequency.exponentialRampToValueAtTime(f1 * pitch, t + 0.25);
      out.gain.setValueAtTime(0.7, t); out.gain.exponentialRampToValueAtTime(0.001, t + 0.3); o.connect(out); o.start(t); o.stop(t + 0.32); return;
    }
    const len = kind === 'crash' ? 1.4 : 0.18, buf = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * len), ctx.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource(), f = ctx.createBiquadFilter(); src.buffer = buf; f.type = 'highpass'; f.frequency.value = kind === 'crash' ? 5000 : 1500;
    out.gain.setValueAtTime(kind === 'crash' ? 0.35 : 0.5, t); out.gain.exponentialRampToValueAtTime(0.001, t + len);
    src.connect(f); f.connect(out); src.start(t);
  }

  home.addEventListener('click', async (e) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return; // let new-tab clicks through
    e.preventDefault();
    const now = performance.now();
    taps = [...taps.filter((t) => now - t < 1400), now];
    clearTimeout(goT); clearTimeout(clearT);
    if (taps.length === 1) { goT = window.setTimeout(() => { taps = []; location.href = home.href; }, 340); return; }
    // From the second tap on, it's a count-in
    try { ac ??= new AudioContext(); await ac.resume(); } catch { ac = null; }
    if (ac) hit(ac, ac.currentTime, 'stick');
    beat(taps.length);
    if (taps.length < 4) { clearT = window.setTimeout(() => { taps = []; beat(null); }, 1400); return; }
    const gap = Math.min(0.8, Math.max(0.25, (taps[3] - taps[0]) / 3000)); taps = [];
    if (ac && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const t0 = ac.currentTime + gap, s = gap / 4;
      for (let i = 0; i < 16; i++) hit(ac, t0 + i * s, i < 6 ? 'snare' : 'tom', i < 6 ? 1 : 1.4 - (i - 6) * 0.07);
      hit(ac, t0 + 16 * s, 'kick'); hit(ac, t0 + 16 * s, 'crash');
    }
    home.classList.add('is-fill');
    clearT = window.setTimeout(() => { beat(null); home.classList.remove('is-fill'); }, gap * 5 * 1000);
  });
}
