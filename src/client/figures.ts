/**
 * Make body images zoomable (project pages, posts). zoom.ts (delegated)
 * handles the interaction.
 * - Pair figures: each <img> becomes its own `.pfig-cell.zoomable` grid item,
 *   so zooming one spans the row and the rest reflow below it.
 * - Solo figures: the figure itself is the `.zoomable`, image wrapped in a trigger.
 * - Bare markdown images: wrapped in a full `figure.zoomable.pfig`.
 * Images already inside a trigger / stepper / component (or `[data-no-zoom]`)
 * are left alone. Idempotent — safe on astro:page-load.
 *
 * Also: Figma (etc.) `.pembed` embeds scroll with the page until clicked.
 */

const SKIP = '.zoom-trigger, .ms, .zoomable, [data-no-zoom], [data-fig-init]';

function triggerFor(img: HTMLImageElement) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'zoom-trigger';
  btn.setAttribute('aria-label', 'Zoom image');
  btn.setAttribute('aria-expanded', 'false');
  img.parentNode!.insertBefore(btn, img);
  btn.appendChild(img);
  return btn;
}

function initFigures() {
  document.querySelectorAll<HTMLElement>('.post-content .pfig').forEach((fig) => {
    if (fig.dataset.figInit || fig.parentElement?.closest(SKIP)) return;
    fig.dataset.figInit = '1';
    const imgs = [...fig.querySelectorAll<HTMLImageElement>(':scope > img')];
    if (fig.classList.contains('pfig--pair')) {
      imgs.forEach((img) => {
        const cell = document.createElement('div');
        cell.className = 'pfig-cell zoomable';
        img.parentNode!.insertBefore(cell, img);
        cell.appendChild(img);
        triggerFor(img);
      });
    } else if (imgs.length > 0) {
      fig.classList.add('zoomable');
      imgs.forEach(triggerFor);
    }
  });

  document.querySelectorAll<HTMLImageElement>('.post-content img').forEach((img) => {
    if (img.closest('.pfig') || img.closest(SKIP)) return;
    const fig = document.createElement('figure');
    fig.className = 'pfig zoomable';
    fig.dataset.figInit = '1';
    // Markdown wraps lone images in <p>; lift the figure out so it isn't nested in a paragraph.
    const p = img.parentElement;
    const lone = p?.tagName === 'P' && p.childNodes.length === 1;
    (lone ? p! : img).replaceWith(fig);
    fig.appendChild(img);
    triggerFor(img);
  });
}

function initPembeds() {
  document.querySelectorAll<HTMLElement>('.pembed').forEach((fig) => {
    if (fig.dataset.pembedBound === '1') return;
    const iframe = fig.querySelector('iframe');
    if (!iframe) return;
    fig.dataset.pembedBound = '1';

    const shield = document.createElement('button');
    shield.type = 'button';
    shield.className = 'pembed__shield';
    shield.setAttribute('aria-label', 'Click to interact with embed');
    const label = document.createElement('span');
    label.className = 'pembed__shield-label';
    label.textContent = 'Click to interact';
    shield.appendChild(label);
    iframe.insertAdjacentElement('afterend', shield);

    const activate = () => {
      fig.classList.add('is-interactive');
      shield.setAttribute('aria-hidden', 'true');
    };
    const deactivate = () => {
      fig.classList.remove('is-interactive');
      shield.removeAttribute('aria-hidden');
    };

    shield.addEventListener('click', activate);
    document.addEventListener('pointerdown', (e) => {
      if (!fig.classList.contains('is-interactive')) return;
      if (e.target instanceof Node && fig.contains(e.target)) return;
      deactivate();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && fig.classList.contains('is-interactive')) deactivate();
    });
  });
}

function init() {
  initFigures();
  initPembeds();
}

init();
document.addEventListener('astro:page-load', init);
