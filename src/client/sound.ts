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

/** Play a cue (quietly, unless told otherwise); nothing when sound is off */
export function cue(name: SoundName, options: PlayOptions = {}) {
  if (on) play(name, { emphasis: 'subtle', ...options });
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
