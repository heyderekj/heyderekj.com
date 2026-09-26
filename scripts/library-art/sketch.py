"""
Turn library covers into blueprint sketches that match the /library grid.

Sources (real book covers / podcast artwork) live in scripts/library-art/sources/
and are NOT published. This writes transparent PNG line sketches, in the site
accent over a faint grid, to public/images/library/<name>.png. They read on
both light and dark backgrounds.

    python3 scripts/library-art/sketch.py            # all sources
    python3 scripts/library-art/sketch.py book-rework # one

Needs Pillow + numpy (dev machine only; not part of the site build).
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageOps

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / 'scripts/library-art/sources'
OUT = ROOT / 'public/images/library'
ACCENT = (234, 88, 12)
SIZES = {'book': (480, 720), 'podcast': (600, 600)}


def blur(a, r):
    return np.asarray(Image.fromarray((a * 255).astype('uint8')).filter(ImageFilter.GaussianBlur(r)), float) / 255


def ink(im):
    """Line strength 0..1: difference-of-Gaussians edges plus light hatched shading."""
    g = np.asarray(ImageOps.grayscale(im), float) / 255
    dog = blur(g, 1.0) - blur(g, 4.0)
    lines = np.clip((np.abs(dog) - 0.012) * 7.0, 0, 1)
    dark = 1 - blur(g, 2.0)
    if g.mean() < 0.45:  # dark covers: shade the light parts instead of flooding the page
        dark = 1 - dark
    shade = np.clip((dark - 0.25) / 0.75, 0, 1)
    h, w = g.shape
    yy, xx = np.mgrid[0:h, 0:w]
    hatch = ((xx + yy) % 7 < 1.6) * shade * 0.55
    return np.clip(np.maximum(lines, np.maximum(shade * 0.14, hatch)), 0, 1)


def grid(size):
    w, h = size
    layer = Image.new('RGBA', size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    step = w // 30
    for i, x in enumerate(range(0, w, step)):
        d.line([(x, 0), (x, h)], fill=(128, 128, 128, 60 if i % 5 == 0 else 32))
    for i, y in enumerate(range(0, h, step)):
        d.line([(0, y), (w, y)], fill=(128, 128, 128, 60 if i % 5 == 0 else 32))
    return layer


def sketch(path: Path):
    kind = path.stem.split('-')[0]
    size = SIZES.get(kind, (600, 600))
    im = ImageOps.fit(Image.open(path).convert('RGB'), size, Image.LANCZOS)
    s = ink(im)
    rgba = np.zeros((size[1], size[0], 4), 'uint8')
    rgba[..., :3] = ACCENT
    rgba[..., 3] = (s * 255).astype('uint8')
    out = grid(size)
    out.alpha_composite(Image.fromarray(rgba))
    dest = OUT / f'{path.stem}.png'
    out.save(dest, optimize=True)
    print(f'wrote {dest.relative_to(ROOT)} ({dest.stat().st_size // 1024} KB)')


if __name__ == '__main__':
    OUT.mkdir(parents=True, exist_ok=True)
    wanted = set(sys.argv[1:])
    for p in sorted(SRC.glob('*.jpg')):
        if not wanted or p.stem in wanted:
            sketch(p)
