/** Host shown in the url-chip tooltip: no `www.` prefix (scheme is never shown). */
function hostForChipTooltip(host: string): string {
  return host.toLowerCase().startsWith('www.') ? host.slice(4) : host;
}

function shouldSkipAnchor(a: HTMLAnchorElement): boolean {
  const raw = a.getAttribute('href');
  if (raw == null) return true;
  const t = raw.trim();
  if (t === '' || t === '#') return true;
  if (t.toLowerCase().startsWith('javascript:')) return true;
  return false;
}

/** Optional fixed chip text (e.g. masthead name); overrides URL display. */
function chipTextForAnchor(anchor: HTMLAnchorElement): string | null {
  const override = anchor.getAttribute('data-url-chip');
  if (override != null && override.trim() !== '') {
    return override.trim();
  }
  return displayUrl(anchor);
}

function displayUrl(anchor: HTMLAnchorElement): string | null {
  if (shouldSkipAnchor(anchor)) return null;
  try {
    const u = new URL(anchor.href);
    if (u.protocol === 'http:' || u.protocol === 'https:') {
      return hostForChipTooltip(u.host) + u.pathname + u.search;
    }
    if (u.protocol === 'mailto:') {
      const addr = decodeURIComponent(u.pathname);
      return addr || null;
    }
    if (u.protocol === 'tel:') {
      const n = decodeURIComponent(u.pathname + u.search);
      return n || null;
    }
  } catch {
    return null;
  }
  return null;
}

function initUrlChip(): void {
  const main = document.querySelector('main.main');
  if (!main) return;

  const chip = document.createElement('div');
  chip.className = 'url-chip';
  chip.setAttribute('role', 'tooltip');
  const chipText = document.createElement('span');
  chipText.id = 'url-chip-text';
  chip.appendChild(chipText);
  chip.setAttribute('aria-hidden', 'true');
  document.body.appendChild(chip);

  let activeLink: HTMLAnchorElement | null = null;
  let hideTimer = 0;

  function positionChip(link: HTMLElement): void {
    const r = link.getBoundingClientRect();
    const margin = 6;
    let left = r.left + r.width / 2 - chip.offsetWidth / 2;
    left = Math.max(8, Math.min(left, window.innerWidth - chip.offsetWidth - 8));
    let top = r.top - chip.offsetHeight - margin;
    if (top < 8) {
      top = r.bottom + margin;
    }
    top = Math.max(8, Math.min(top, window.innerHeight - chip.offsetHeight - 8));
    chip.style.left = `${left}px`;
    chip.style.top = `${top}px`;
  }

  function syncAria(link: HTMLAnchorElement | null): void {
    if (link && document.activeElement === link) {
      link.setAttribute('aria-describedby', chipText.id);
    } else if (link) {
      link.removeAttribute('aria-describedby');
    }
  }

  function hide(): void {
    chip.classList.remove('url-chip--visible');
    chip.setAttribute('aria-hidden', 'true');
    if (activeLink) {
      activeLink.removeAttribute('aria-describedby');
    }
    activeLink = null;
  }

  function scheduleHide(): void {
    window.clearTimeout(hideTimer);
    hideTimer = window.setTimeout(hide, 80);
  }

  function showFor(link: HTMLAnchorElement): void {
    window.clearTimeout(hideTimer);
    const text = chipTextForAnchor(link);
    if (!text) return;

    if (activeLink && activeLink !== link) {
      activeLink.removeAttribute('aria-describedby');
    }
    activeLink = link;
    chipText.textContent = text;
    chip.classList.add('url-chip--visible');
    chip.removeAttribute('aria-hidden');
    syncAria(link);

    requestAnimationFrame(() => {
      positionChip(link);
      requestAnimationFrame(() => positionChip(link));
    });
  }

  const anchors = main.querySelectorAll<HTMLAnchorElement>('a[href]');
  anchors.forEach((link) => {
    if (link.closest('.site-brand') && !link.hasAttribute('data-url-chip')) return;
    if (link.matches('.entries a, .project-card-link')) return;
    if (!chipTextForAnchor(link)) return;

    link.addEventListener('pointerenter', (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      showFor(link);
    });
    link.addEventListener('pointerleave', (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      if (document.activeElement !== link) scheduleHide();
    });
    link.addEventListener('focusin', () => {
      showFor(link);
    });
    link.addEventListener('focusout', () => {
      window.setTimeout(() => {
        if (activeLink !== link) return;
        if (document.activeElement === link) return;
        if (link.matches(':hover')) return;
        scheduleHide();
      }, 0);
    });
  });

  window.addEventListener(
    'scroll',
    () => {
      if (activeLink && chip.classList.contains('url-chip--visible')) {
        positionChip(activeLink);
      }
    },
    true,
  );

  window.addEventListener('resize', () => {
    if (activeLink && chip.classList.contains('url-chip--visible')) {
      positionChip(activeLink);
    }
  });
}

initUrlChip();
