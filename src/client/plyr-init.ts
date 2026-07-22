/**
 * Plyr for site demo videos (`video[data-plyr]`).
 * Collapsed: muted loop, no chrome. Expanded (zoom): Plyr controls.
 * Owns autoplay for `data-autoplay` — page scripts must not also call play().
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

function reduceMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function wantsAutoplay(video: HTMLVideoElement): boolean {
  return video.hasAttribute('data-autoplay') || video.hasAttribute('autoplay');
}

function whenCanPlay(video: HTMLVideoElement): Promise<void> {
  // HAVE_FUTURE_DATA — enough to start without stalling on the first frames.
  if (video.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    const done = () => {
      video.removeEventListener('canplay', done);
      resolve();
    };
    video.addEventListener('canplay', done, { once: true });
  });
}

function safePlay(player: Plyr) {
  const p = player.play();
  if (p && typeof p.catch === 'function') p.catch(() => {});
}

function initVideo(video: HTMLVideoElement) {
  if (players.has(video)) return;

  const prefersReduced = reduceMotion();
  const autoplay = wantsAutoplay(video) && !prefersReduced;

  if (prefersReduced && wantsAutoplay(video)) {
    // Poster + native controls instead of a muted loop.
    video.controls = true;
    video.removeAttribute('autoplay');
    video.removeAttribute('data-autoplay');
  }

  const player = new Plyr(video, {
    controls: [...CONTROLS],
    hideControls: true,
    clickToPlay: false,
    resetOnEnd: false,
    keyboard: { focused: true, global: false },
    tooltips: { controls: false, seek: true },
    fullscreen: { enabled: true, fallback: true, iosNative: false },
    muted: true,
    autoplay: false, // we gate on canplay below
    loop: { active: video.hasAttribute('loop') },
    // Local sprite — CDN misses leave orange control chrome with blank icons.
    iconUrl: '/vendor/plyr.svg',
    loadSprite: true,
  });

  players.set(video, player);

  player.on('ready', () => {
    player.muted = true;
    if (prefersReduced) {
      // Keep native controls; hide Plyr chrome.
      player.toggleControls(false);
      video.controls = true;
      return;
    }
    player.toggleControls(false);
    // Keep native controls attribute off — Plyr owns chrome.
    video.controls = false;
    if (autoplay) {
      whenCanPlay(video).then(() => safePlay(player));
    }
  });
}

function initAll() {
  document.querySelectorAll<HTMLVideoElement>('video[data-plyr]').forEach(initVideo);
}

initAll();
document.addEventListener('astro:page-load', initAll);

// Zoom open/close — show or hide the control bar without touching playback time.
document.addEventListener('zoomchange', (e) => {
  const fig = e.target as HTMLElement | null;
  if (!fig?.querySelector) return;
  const open = Boolean((e as CustomEvent<{ open: boolean }>).detail?.open);
  fig.querySelectorAll<HTMLVideoElement>('video[data-plyr]').forEach((video) => {
    setPlyrChrome(video, open);
  });
});
