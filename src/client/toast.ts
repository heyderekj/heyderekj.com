/** A short message at the bottom of the page, and copying text with a fallback for older browsers. */
import { cue } from './sound';
let timer = 0;
export function toast(text: string) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = text;
  el.classList.add('is-on');
  clearTimeout(timer);
  timer = window.setTimeout(() => el.classList.remove('is-on'), 1600);
}

export async function copyText(text: string): Promise<boolean> {
  try { await navigator.clipboard.writeText(text); cue('success'); return true; } catch {
    const ta = document.createElement('textarea');
    ta.value = text; ta.style.cssText = 'position:fixed;opacity:0';
    document.body.append(ta); ta.select();
    let ok = false; try { ok = document.execCommand('copy'); } catch { /* nothing else to try */ }
    ta.remove(); if (ok) cue('success'); return ok;
  }
}

export const calm = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
export const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
