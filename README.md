# Henna Art by Arafa — website

A static, dependency-free website (HTML + CSS + ES modules). No build step: open `index.html`
through any static host (Vercel, Netlify, GitHub Pages, cPanel…).

```bash
npm start        # preview at http://localhost:8080
npm run check    # lint + automated tests
```

## Owner setup (2 minutes)

Edit **`js/config.js`**:

| Setting | What to put |
|---|---|
| `whatsapp.number` | WhatsApp number with country code, digits only — e.g. `8801712345678` |
| `social.facebook` | Official Facebook page URL |
| `social.instagram` | Optional |

Until the WhatsApp number is set, order buttons show a friendly “being set up” notice instead of opening a chat.

## Changing designs, names, prices

Edit **`js/data.js`** only:
- `DESIGNS` — order = order on the site (strongest first). Set `price: 500` to show a price (shown as ৳500); leave `null` to hide it.
- `CATEGORIES` — rename / add / remove styles. Every category needs at least one design.
- `focus` — CSS `object-position` so fingertips and centre motifs aren't cropped.

To add a photo: put the original in `assets/originals/`, add an `ffmpeg`/ImageMagick line in
`tools/build-images.sh`, run `npm run build:images`, then add an entry in `DESIGNS`.
Original photos are never modified. Photos deliberately not used (and why) are listed in `UNUSED` in `js/data.js`.

## Hero video

`npm run build:video` (needs ffmpeg) rebuilds `assets/video/hero-{portrait,landscape}.{mp4,webm}` and posters
from the photos listed at the bottom of `tools/make_hero_video.py`. Reduced-motion and data-saver visitors get
the poster only; there is a pause button for everyone else.

## Logo

`assets/originals/logo-original.jpg` is the supplied logo (it has a beige paper background, so it is shown as a
rounded badge). A background-free (transparent PNG) version would let it sit directly on any colour.
