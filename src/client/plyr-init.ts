/**
 * Plyr for site demo videos (`video[data-plyr]`).
 * Collapsed: muted loop, no chrome. Expanded (zoom): Plyr controls.
 */
import Plyr from 'plyr';
import 'plyr/dist/plyr.css';

const players = new WeakMap<HTMLVideoElement, Plyr>();

const CONTROLS = [
  'play-large',
  'play',
  'progress',
  'current-time',
  'mute',
  'fullscreen',
] as const;

export function getPlyr(video: HTMLVideoElement): Plyr | undefined {
  return players.get(video);
}

export function setPlyrChrome(video: HTMLVideoElement, open: boolean) {
  const player = players.get(video);
  if (!player) return;
  player.toggleControls(open);
}

function wantsAutoplay(video: HTMLVideoElement): boolean {
  return video.hasAttribute('data-autoplay') || video.hasAttribute('autoplay');
}

function initVideo(video: HTMLVideoElement) {
  if (players.has(video)) return;

  const player = new Plyr(video, {
    controls: [...CONTROLS],
    hideControls: true,
    clickToPlay: false,
    resetOnEnd: false,
    keyboard: { focused: true, global: false },
    tooltips: { controls: false, seek: true },
    fullscreen: { enabled: true, fallback: true, iosNative: false },
    muted: true,
    autoplay: wantsAutoplay(video),
    loop: { active: video.hasAttribute('loop') },
  });

  players.set(video, player);

  player.on('ready', () => {
    player.muted = true;
    player.toggleControls(false);
    // Keep native controls attribute off — Plyr owns chrome.
    video.controls = false;
    if (wantsAutoplay(video)) {
      const p = player.play();
      if (p && typeof p.catch === 'function') p.catch(() => {});
    }
  });
}

function initAll() {
  document.querySelectorAll<HTMLVideoElement>('video[data-plyr]').forEach(initVideo);
}

initAll();

// Zoom open/close — show or hide the control bar without touching playback time.
document.addEventListener('zoomchange', (e) => {
  const fig = e.target as HTMLElement | null;
  if (!fig?.querySelector) return;
  const open = Boolean((e as CustomEvent<{ open: boolean }>).detail?.open);
  fig.querySelectorAll<HTMLVideoElement>('video[data-plyr]').forEach((video) => {
    setPlyrChrome(video, open);
  });
});
