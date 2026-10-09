#!/usr/bin/env bash
# Rebuilds web-optimised images from assets/originals (originals are never modified).
# Requires ImageMagick (convert) with WebP support.
set -euo pipefail
cd "$(dirname "$0")/.."
O=assets/originals
D=assets/derived
OUT=assets/img
mkdir -p "$D" "$OUT"

# --- Derived crops (remove burned-in price label / review badge / clutter) ---
convert $O/d14.jpg -crop 488x610+270+430 +repage -quality 92 $D/d14-nails.jpg
convert $O/d11.jpg -crop 1625x1790+0+230 +repage -quality 92 $D/d11-clean.jpg

# --- Web variants: id:source ---
make() { # id src
  for w in 480 800 1200; do
    convert "$2" -auto-orient -resize "${w}x>" -strip -quality 78 -define webp:method=5 "$OUT/$1-$w.webp"
  done
}
for id in d01 d03 d04 d06 d07 d10 d15 d16 d17 d19 d20; do make $id $O/$id.jpg; done
make d11 $D/d11-clean.jpg
make d14 $D/d14-nails.jpg

# --- Wide editorial strips (landscape) ---
convert $O/d09.jpg -auto-orient -gravity center -crop 2048x820+0+60 +repage -resize 2000x -strip -quality 78 $OUT/strip-d09-2000.webp
convert $O/d09.jpg -auto-orient -gravity center -crop 2048x820+0+60 +repage -resize 1000x -strip -quality 78 $OUT/strip-d09-1000.webp
convert $O/d04.jpg -auto-orient -crop 1500x640+0+600 +repage -resize 2000x -strip -quality 78 $OUT/band-d04-2000.webp
convert $O/d04.jpg -auto-orient -crop 1500x640+0+600 +repage -resize 1000x -strip -quality 78 $OUT/band-d04-1000.webp
# --- Logo variants / favicon / social image (run tools/make_hero_video.py first for the posters) ---
L=$O/logo-original.jpg
mkdir -p assets/logo
convert $L -resize 480x -strip -quality 85 assets/logo/logo-480.webp
convert $L -resize 240x -strip -quality 85 assets/logo/logo-240.webp
convert $L -gravity center -crop 760x760+0+0 +repage -resize 180x180 assets/logo/apple-touch-icon.png
convert $L -gravity center -crop 760x760+0+0 +repage -resize 48x48 assets/logo/favicon-48.png
if [ -f assets/video/hero-landscape-poster.jpg ]; then
  convert assets/video/hero-landscape-poster.jpg -gravity center -crop 1600x840+0+0 +repage -resize 1200x630 -quality 82 assets/logo/og-image.jpg
  convert assets/video/hero-landscape-poster.jpg -resize 1600x -strip -quality 78 assets/video/hero-landscape-poster.webp
  convert assets/video/hero-portrait-poster.jpg -resize 720x -strip -quality 78 assets/video/hero-portrait-poster.webp
fi
echo done
