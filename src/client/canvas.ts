/**
 * The dot grid is one canvas the site sits on: the dots move with the page as it scrolls, instead
 * of staying fixed while the content slides over them. (Page-to-page panning lives in site.css and
 * the inline script in layouts/Site.astro.)
 */
const root = document.documentElement;
let ticking = false;
const sync = () => { root.style.setProperty('--sy', String(scrollY % 24)); ticking = false; };
addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(sync); } }, { passive: true });
sync();
