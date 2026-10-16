/**
 * Easter egg: press B and the page turns into a cyanotype, white lines on Prussian blue with graph
 * paper under it, like the Des Moines card's drawing. Press B again to go back to paper.
 */
import { toast } from './toast';

const root = document.documentElement;
export function blueprint(on = !root.classList.contains('blueprint')) {
  root.classList.add('bp-fade');
  root.classList.toggle('blueprint', on);
  window.setTimeout(() => root.classList.remove('bp-fade'), 700);
  toast(on ? 'Blueprint mode. Press B to go back to paper.' : 'Back to paper.');
}
document.addEventListener('keydown', (e) => {
  if (e.key.toLowerCase() !== 'b' || e.metaKey || e.ctrlKey || e.altKey || e.repeat) return;
  const t = e.target;
  if (t instanceof Element && t.closest('input, textarea, select, [contenteditable]')) return;
  blueprint();
});
