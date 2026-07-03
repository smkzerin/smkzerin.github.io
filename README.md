# Zerin & Shoumik — Wedding Showcase

A wedding photo/video gallery for Zerin and Shoumik's three ceremonies: Holud, Wedding, and Reception / Bou-Bhaat.

💒 Built with plain HTML, vanilla JS, and Tailwind CSS (compiled via CLI). Hosted on GitHub Pages.

## ✨ Features

- **Photo galleries** per event with lazy-loaded grid and infinite scroll
- **Carousel** at the top of each page sourced from Covers subfolders across all events
- **Lightbox** for full-resolution photo viewing with keyboard/touch navigation
- **Video modal** with Google Drive iframe embed (cross-browser compatible)
- **Person filter tabs** on the Holud page to split photos by Zerin / Shoumik
- **Download page** with per-file and per-folder links
- **Responsive** layout with mobile hamburger menu
- **Clean URLs** — `/holud`, `/wedding`, `/reception`, `/downloads` (no `.html` extension)

## 🛠️ Tech stack

- HTML5, Vanilla JavaScript (ES6+), CSS3
- Tailwind CSS v3 — compiled via CLI (`npm run build:css`)
- Google Fonts (Cormorant Garamond + Jost)
- Google Drive as media storage
- GitHub Pages for hosting
- GitHub Actions for scheduled data generation

## 📁 File structure

```
├── index.html              # Homepage with hero carousel and event cards
├── pages/
│   ├── holud.html          # Holud gallery with person filter tabs
│   ├── wedding.html        # Wedding gallery
│   ├── reception.html      # Reception gallery
│   └── downloads.html      # Per-file and folder download page
├── css/
│   ├── tailwind.css        # Compiled Tailwind CSS (generated)
│   ├── input.css           # Tailwind directives (source)
│   └── style.css           # Custom styles
├── js/
│   ├── data.js             # Media manifest (auto-generated)
│   ├── shared.js           # Lightbox, video modal, carousel, Drive URL helpers
│   ├── gallery.js          # Gallery rendering, person filters, infinite scroll
│   └── sw.js               # Service worker
├── scripts/
│   └── generate-data.mjs   # Build-time script to generate data.js from Drive (ESM)
├── tailwind.config.js      # Tailwind configuration
├── package.json
└── .github/workflows/
    └── generate-data.yml   # GitHub Actions workflow
```

## 🎨 Tailwind CSS

Tailwind is **not** loaded via CDN in production. Instead it's compiled ahead of time:

```bash
npm run build:css
```

This scans all HTML and JS files for class names and produces a minified `css/tailwind.css` containing only the utilities actually used (~11 KB gzipped).

When adding new Tailwind classes to HTML or JS template strings, run `npm run build:css` to include them.

## ☁️ Google Drive setup

Holud and Wedding/Reception live on separate Drive accounts. Follow this folder structure exactly — the fetch script uses subfolder names to set `category`, `type`, and `person` automatically.

```
[Holud Drive account]
└── Holud Night/
    ├── Photos/
    │   ├── Zerin/       ← person: "zerin"
    │   └── Shoumik/     ← person: "shoumik"
    ├── Videos/
    └── Covers/          ← 4–12 favourite shots for the carousel

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
- 📸 Filenames can stay as-is from your camera (`IMG_xxxx.jpg`, etc.)
- 👰 Everything inside `Photos/Zerin/` gets tagged `person: "zerin"`
- 🤵 Everything inside `Photos/Shoumik/` gets tagged `person: "shoumik"`
- ⭐ Photos in a `Covers/` subfolder get tagged `cover: true`
- 🔗 Set sharing on every top-level folder to **"Anyone with the link — Viewer"**

## ⚙️ Data generation

`data.js` is generated from Google Drive by running:

```bash
node scripts/generate-data.mjs
```

You need a Google API key with the Drive API enabled, stored as an environment variable:

```bash
set GOOGLE_API_KEY=your_key_here
node scripts/generate-data.mjs
```

The script reads the Drive folder IDs configured inside `generate-data.mjs`, walks the folder tree, and writes `js/data.js` with the complete media manifest.

## 🎥 Video playback

Videos are served via Google Drive's iframe embed player (`/preview`), not direct `<video>` tags. This ensures cross-browser compatibility — the direct download URL from `drive.usercontent.google.com` doesn't set proper video MIME types and fails on Firefox/Chrome.

## 🖼️ Thumbnails

Thumbnails are served from Google Drive's CDN (`lh3.googleusercontent.com`). Note that Google's CDN blocks requests from **HTTP** origins — the site must be served over **HTTPS** for thumbnails to load. This works automatically on GitHub Pages; for local testing use:

```bash
npx serve --ssl localhost 3000
```

## 🤖 CI/CD

A GitHub Actions workflow (`.github/workflows/generate-data.yml`) can be triggered manually via `workflow_dispatch`. It checks out the repo, runs `node scripts/generate-data.mjs` with the `GOOGLE_API_KEY` secret, and commits/pushes the updated `js/data.js` back to the repository.

## ©️ Credits

Site built for Zerin and Shoumik by [Pranto](https://pranto-smss.github.io/).
