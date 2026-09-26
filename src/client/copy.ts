/**
 * Copy buttons on `<Prompt>` blocks: copies the first prompt's text.
 * Delegated, so it works for any number of blocks and after page swaps.
 */
document.addEventListener('click', async (e) => {
  const btn = (e.target as Element | null)?.closest<HTMLButtonElement>('[data-prompt-copy]');
  if (!btn) return;
  const source = btn.closest('[data-prompt]')?.querySelector<HTMLElement>('[data-prompt-source]');
  if (!source) return;
  const label = btn.querySelector<HTMLElement>('[data-prompt-copy-label]');
  try {
    await navigator.clipboard.writeText(source.innerText.trim());
    if (label) label.textContent = 'Copied';
  } catch {
    if (label) label.textContent = 'Couldn’t copy';
  }
  window.setTimeout(() => {
    if (label) label.textContent = 'Copy';
  }, 1600);
});
