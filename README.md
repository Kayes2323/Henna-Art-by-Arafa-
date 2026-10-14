# Henna Art by Arafa — website

A static, dependency-free, bilingual (English / বাংলা) website. No build step: host the folder on any
static host (Vercel, Netlify, GitHub Pages, cPanel…).

```bash
npm start        # preview at http://localhost:8080
npm run check    # lint + automated tests (21 tests)
```

## What the site does

| Visitor action | What happens |
|---|---|
| Taps **Order Now** on a henna card (Organic / Pakistani / Nail) | Order form: type, quantity (cones), name, delivery address → summary → WhatsApp |
| Taps **Reserve** on a design, or **Make a Reservation** anywhere | Reservation form: design, name, date (required), time, occasion, notes → summary → WhatsApp |
| Taps **EN / বাংলা** | Whole site (and the WhatsApp message) switches language; choice is remembered |

Sending a WhatsApp message never claims to confirm anything — the page says it is confirmed once Arafa replies.

## Owner settings — `js/config.js`

| Setting | Meaning |
|---|---|
| `whatsapp.number` | Country code + number, digits only (`8801604507268`) |
| `social.facebook` / `social.instagram` | Official page URLs |
| `defaultLang` | `"en"` or `"bn"`. Bangla-language browsers always start in Bangla; a visitor's own choice is remembered |

## Content — `js/data.js` (products, designs) and `js/i18n.js` (all wording)

- `PRODUCTS`: the three henna types. `price: null` hides the price; `price: 100` shows ৳100.
- `DESIGNS`: gallery order = site order (strongest first). `focus` keeps fingertips/motifs from being cropped.
- `js/i18n.js`: every sentence in English and Bangla (tests fail if a key or placeholder is missing in one language).
- Originals live untouched in `assets/originals/`; photos deliberately not shown (and why) are listed in `UNUSED`.

## Rebuilding media

- `npm run build:images` — optimised WebP files, crops, logo/favicon (ImageMagick).
- `npm run build:video` — hero videos (needs Python Pillow + numpy + ffmpeg). Frames are sampled at sub-pixel positions with eased motion, so slow camera moves do not tremble on phones; the last shot returns to the first frame so the loop is seamless.
