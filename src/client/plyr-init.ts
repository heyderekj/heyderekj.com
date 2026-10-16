/**
 * Plyr for site demo videos (`video[data-plyr]`).
 * Collapsed: muted loop, no chrome. Expanded (zoom): Plyr controls.
 * Owns autoplay for `data-autoplay` — page scripts must not also call play().
 *
 * Plyr (and its CSS) loads only on pages that have one of these videos, and each video is set up
 * as it nears the screen — so a page doesn't download every looping tour at once. Looping videos
 * pause when they scroll away and pick up again when they're back.
 */
import type Plyr from 'plyr';

let plyrLib: Promise<typeof Plyr> | null = null;
const loadPlyr = () => (plyrLib ??= Promise.all([import('plyr'), import('plyr/dist/plyr.css')]).then(([m]) => m.default));

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

function safePlay(player: Plyr) {
  const p = player.play();
  if (p && typeof p.catch === 'function') p.catch(() => {});
}

async function initVideo(video: HTMLVideoElement) {
  if (players.has(video)) return;
  const Plyr = await loadPlyr();
  if (players.has(video)) return;

  const prefersReduced = reduceMotion();
  const autoplay = wantsAutoplay(video) && !prefersReduced;

  if (prefersReduced && wantsAutoplay(video)) {
    // Poster + native controls instead of a muted loop.
    video.controls = true;
    video.removeAttribute('autoplay');
    video.removeAttribute('data-autoplay');
  }

  // iOS often ignores preload and won't fire canplay until play() — so never
  // gate muted autoplay on canplay (that deadlocks mobile).
  if (autoplay) {
    video.muted = true;
    video.defaultMuted = true;
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
    video.autoplay = true;
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
    autoplay,
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
      safePlay(player);
    }
  });
}

// Set up as it comes near; then play and pause the looping ones with what's on screen
const seen = new IntersectionObserver((entries) => entries.forEach(({ target, isIntersecting }) => {
  const video = target as HTMLVideoElement, player = players.get(video);
  if (isIntersecting && !player) { void initVideo(video); return; }
  if (!player || !wantsAutoplay(video) || reduceMotion() || document.fullscreenElement) return;
  if (isIntersecting) safePlay(player); else player.pause();
}), { rootMargin: '300px 0px' });

function initAll() {
  document.querySelectorAll<HTMLVideoElement>('video[data-plyr]').forEach((v) => seen.observe(v));
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
