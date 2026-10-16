import { toast } from './toast';

const KONAMI: string[] = [
  'ArrowUp', 'ArrowUp',
  'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight',
  'ArrowLeft', 'ArrowRight',
];

let konamiIndex = 0;
let orangeModeTimer = 0;

/** Retro arcade / “quest unlocked” sting — original, RPO-adjacent vibe (no borrowed melody). */
async function playFanfare(): Promise<void> {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const ac = new AudioContext();
  await ac.resume();
  const now = ac.currentTime;
  const master = ac.createGain();
  master.gain.value = 0.32;
  master.connect(ac.destination);

  const beep = (freq: number, t: number, dur: number, vol: number): void => {
    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.type = 'square';
    osc.connect(g);
    g.connect(master);
    osc.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.006);
    g.gain.setValueAtTime(vol, t + dur * 0.55);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  };

  // Fast upward arpeggio — attract-mode / high-score table energy
  const arp = [523.25, 659.25, 783.99, 987.77, 1174.66, 1318.51]; // C5 … E6 (bright, gamey)
  const step = 0.042;
  arp.forEach((f, i) => beep(f, now + i * step, 0.055, 0.16));

  // Power chord stab + octave shimmer (classic coin-op “you did it”)
  const chordT = now + arp.length * step + 0.018;
  const roots = [196, 293.66, 392]; // G3, D4, G4 (open, heroic)
  roots.forEach((f, i) => {
    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.type = 'square';
    osc.connect(g);
    g.connect(master);
    const t = chordT + i * 0.004;
    osc.frequency.setValueAtTime(f, t);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.12 - i * 0.02, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
    osc.start(t);
    osc.stop(t + 0.32);
  });

  // Tiny triangle “bass thump” so it isn’t all buzz
  const sub = ac.createOscillator();
  const subG = ac.createGain();
  sub.type = 'triangle';
  sub.frequency.setValueAtTime(98, chordT);
  sub.connect(subG);
  subG.connect(master);
  subG.gain.setValueAtTime(0, chordT);
  subG.gain.linearRampToValueAtTime(0.14, chordT + 0.02);
  subG.gain.exponentialRampToValueAtTime(0.001, chordT + 0.22);
  sub.start(chordT);
  sub.stop(chordT + 0.26);
}

function showToast(): void {
  document.getElementById('orange-mode-toast')?.remove();
  const toast = document.createElement('div');
  toast.id = 'orange-mode-toast';
  toast.textContent = '🍊 My favorite color is orange';
  document.body.appendChild(toast);
  void toast.offsetWidth; // force reflow
  toast.classList.add('orange-mode-toast--visible');
  window.setTimeout(() => {
    toast.classList.remove('orange-mode-toast--visible');
    toast.addEventListener('transitionend', () => toast.remove(), { once: true });
  }, 4500);
}

function activateOrangeMode(): void {
  window.clearTimeout(orangeModeTimer);
  document.documentElement.classList.add('orange-mode');
  void playFanfare();
  showToast();
  orangeModeTimer = window.setTimeout(() => {
    document.documentElement.classList.remove('orange-mode');
  }, 5000);
}

document.addEventListener('keydown', (e: KeyboardEvent) => {
  if (e.key === KONAMI[konamiIndex]) {
    konamiIndex++;
    if (konamiIndex === KONAMI.length) {
      konamiIndex = 0;
      activateOrangeMode();
    }
  } else {
    konamiIndex = e.key === KONAMI[0] ? 1 : 0;
  }
});

// Type "joshua" on any page (the WOPR's password, in WarGames) and you're greeted, then taken to the 404's game
const JOSHUA = 'joshua';
let typed = '';
document.addEventListener('keydown', (e: KeyboardEvent) => {
  const t = e.target;
  if (e.metaKey || e.ctrlKey || e.altKey || (t instanceof Element && t.closest('input, textarea, select, [contenteditable]'))) return;
  if (e.key.length !== 1) return;
  typed = (typed + e.key.toLowerCase()).slice(-JOSHUA.length);
  if (typed !== JOSHUA) return;
  typed = '';
  toast('Greetings, Professor Falken. Shall we play a game?');
  if (document.querySelector('.four')) { setTimeout(() => document.dispatchEvent(new Event('four:start')), 900); return; }
  setTimeout(() => location.assign('/404#play'), 1400);
});
