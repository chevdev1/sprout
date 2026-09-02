"""Rasterize the Sprout leaf mark (same path used inline in nav-brand)
into favicon.ico + apple-touch-icon.png. No SVG renderer is available
in this environment, so the two cubic-bezier subpaths are evaluated by
hand and filled as polygons with Pillow.
"""
import os
from PIL import Image, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(ROOT, 'site', 'assets', 'favicon')
os.makedirs(OUT_DIR, exist_ok=True)

INK = (13, 17, 12, 255)
SPROUT = (216, 255, 77, 255)

SUPERSAMPLE = 8
SIZE = 256 * SUPERSAMPLE


def cubic_bezier(p0, p1, p2, p3, steps=60):
    pts = []
    for i in range(steps + 1):
        t = i / steps
        mt = 1 - t
        x = (mt**3 * p0[0] + 3 * mt**2 * t * p1[0] + 3 * mt * t**2 * p2[0] + t**3 * p3[0])
        y = (mt**3 * p0[1] + 3 * mt**2 * t * p1[1] + 3 * mt * t**2 * p2[1] + t**3 * p3[1])
        pts.append((x, y))
    return pts


# left leaf: M50 88 C22 84 8 46 30 14 C40 36 46 62 50 88 Z
left_leaf = (
    cubic_bezier((50, 88), (22, 84), (8, 46), (30, 14))
    + cubic_bezier((30, 14), (40, 36), (46, 62), (50, 88))
)
# right leaf: M50 88 C78 84 92 46 70 14 C60 36 54 62 50 88 Z
right_leaf = (
    cubic_bezier((50, 88), (78, 84), (92, 46), (70, 14))
    + cubic_bezier((70, 14), (60, 36), (54, 62), (50, 88))
)


def map_point(p, pad=18, canvas=100):
    # source viewBox is 0..100; pad it in, then scale to the raster canvas
    x, y = p
    scale = (canvas - pad * 2) / canvas
    x = x * scale + pad
    y = y * scale + pad
    return (x / canvas * SIZE, y / canvas * SIZE)


def rounded_square(draw, size, radius, fill):
    draw.rounded_rectangle([0, 0, size, size], radius=radius, fill=fill)


def build_icon():
    img = Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    rounded_square(draw, SIZE, int(SIZE * 0.22), INK)
    draw.polygon([map_point(p) for p in left_leaf], fill=SPROUT)
    draw.polygon([map_point(p) for p in right_leaf], fill=SPROUT)
    return img.resize((256, 256), Image.LANCZOS)


def main():
    icon = build_icon()

    ico_path = os.path.join(OUT_DIR, 'favicon.ico')
    icon.save(ico_path, format='ICO', sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])
    print('wrote', ico_path)

    png32 = icon.resize((32, 32), Image.LANCZOS)
    png32_path = os.path.join(OUT_DIR, 'favicon-32.png')
    png32.save(png32_path)
    print('wrote', png32_path)

    apple = icon.resize((180, 180), Image.LANCZOS)
    # apple-touch-icon should be fully opaque (iOS ignores alpha and can
    # render a black square behind transparent pixels otherwise)
    apple_bg = Image.new('RGB', apple.size, INK[:3])
    apple_bg.paste(apple, mask=apple.split()[3])
    apple_path = os.path.join(OUT_DIR, 'apple-touch-icon.png')
    apple_bg.save(apple_path)
    print('wrote', apple_path)


if __name__ == '__main__':
    main()
