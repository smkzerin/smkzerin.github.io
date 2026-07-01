# Tamaz & Shoumik — wedding showcase (demo)

This is a working demo built with plain HTML, vanilla JS, and Tailwind (via CDN, no build step).
All photos/videos right now are **placeholders** (Picsum images + a sample clip) — no real
Google Drive files are wired in yet.

Three events are covered: Holud (night one), Wedding (night two), and Reception / Bou-Bhaat
(night three, the day after the wedding).

## Drive folder structure to follow when uploading

Holud and Wedding/Reception live on separate Drive accounts. Follow this structure exactly —
the fetch script uses subfolder names to set `category`, `type`, and `person` automatically,
so no manual renaming of individual files is needed.

```
[Holud Drive account]
└── Holud Night/
    ├── Photos/
    │   ├── Zerin/       ← bride's photos (person: "zerin")
    │   └── Shoumik/     ← groom's photos (person: "shoumik")
    ├── Videos/
    └── Covers/          ← 4–12 favourite shots for the page's staggered collage

[Wedding + Reception Drive account]
└── Wedding Night/
    ├── Photos/
    ├── Videos/
    └── Covers/

└── Reception/
    ├── Photos/
    ├── Videos/
    └── Covers/
```

**Key rules:**
- Filenames can stay exactly as-is from your camera (IMG_xxxx.jpg, etc.)
- Everything inside `Photos/Zerin/` gets `person: "zerin"` automatically
- Everything inside `Photos/Shoumik/` gets `person: "shoumik"` automatically
- Photos in a `Covers/` subfolder get `cover: true` (used by the per-page staggered collage)
- Set sharing on every top-level folder to **"Anyone with the link — Viewer"**

## On the website
- **Holud page** — shows a "All / Zerin / Shoumik" tab filter above the photo grid
- **Wedding & Reception pages** — no filter tabs (photos are not person-split there)
- Every page shows a staggered collage at the top sourced from that event's own Covers folder

## Structure
- `index.html` — homepage with staggered photo collage hero and event cards
- `holud.html` — Holud gallery with Zerin/Shoumik person filter tabs
- `wedding.html`, `reception.html` — galleries (collage + video row + lazy photo grid)
- `downloads.html` — per-file download list + whole-folder shortcuts for all three events
- `js/data.js` — media manifest (placeholder data; replaced by generated JSON from fetch script)
- `js/shared.js` — Drive URL builders, lightbox, video modal, collage cycling
- `js/gallery.js` — gallery rendering, person-filter tabs, lazy batching
- `css/style.css` — fonts, color tokens, garland divider, collage layout

## Swapping in real files later
Once you've uploaded everything and shared the folders:
1. Share the two Drive folder links/IDs with me
2. I'll run the fetch script against both accounts — it walks Photos/Zerin, Photos/Shoumik,
   Videos, and Covers subfolders and generates a real `data.js` with correct category, type,
   person, and cover flags
3. Replace `js/data.js` with the generated file
4. In `js/shared.js`, flip `const IS_DEMO = true;` → `false`
5. Push to GitHub — site now shows real content, no other changes needed

