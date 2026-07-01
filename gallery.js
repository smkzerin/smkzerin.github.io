/*
  gallery.js — renders the photo grid + video row for a single category page.
  Reads the category from <body data-category="holud|wedding">.
  Built for scale: only renders a batch at a time ("load more"), and uses
  loading="lazy" thumbnails so a 600+ photo folder doesn't choke the page.
*/

const BATCH_SIZE = 12;

document.addEventListener("DOMContentLoaded", () => {
  const category = document.body.dataset.category;
  const photos = MEDIA.photos.filter(p => p.category === category);
  const videos = MEDIA.videos.filter(v => v.category === category);

  renderVideos(videos);
  renderPersonFilter(photos);
});

function renderPersonFilter(photos) {
  const wrap = document.getElementById("person-filter");
  const persons = [...new Set(photos.filter(p => p.person).map(p => p.person))];

  // Only show tabs if this category actually has person-tagged photos (e.g. Holud)
  if (!wrap || persons.length < 2) {
    renderPhotoBatches(photos);
    return;
  }

  const label = (p) => p.charAt(0).toUpperCase() + p.slice(1);
  const tabs = ["all", ...persons];

  wrap.classList.remove("hidden");
  wrap.innerHTML = tabs.map((t, i) => `
    <button data-tab="${t}" class="px-4 py-2 rounded-full text-xs uppercase tracking-wide border ${i === 0 ? "active-tab" : ""}"
      style="border-color:rgba(43,38,32,0.2)">${t === "all" ? "All" : label(t)}</button>
  `).join("");

  function applyTabStyles(activeTab) {
    wrap.querySelectorAll("[data-tab]").forEach(btn => {
      const isActive = btn.dataset.tab === activeTab;
      btn.style.background = isActive ? "var(--marigold-deep)" : "transparent";
      btn.style.color = isActive ? "var(--cream)" : "var(--charcoal)";
      btn.style.borderColor = isActive ? "var(--marigold-deep)" : "rgba(43,38,32,0.2)";
    });
  }

  wrap.querySelectorAll("[data-tab]").forEach(btn => {
    btn.addEventListener("click", () => {
      const tab = btn.dataset.tab;
      applyTabStyles(tab);
      const filtered = tab === "all" ? photos : photos.filter(p => p.person === tab);
      renderPhotoBatches(filtered);
    });
  });

  applyTabStyles("all");
  renderPhotoBatches(photos);
}

function renderVideos(videos) {
  const wrap = document.getElementById("video-row");
  if (!wrap) return;
  if (videos.length === 0) {
    wrap.parentElement.classList.add("hidden");
    return;
  }
  wrap.innerHTML = videos.map((v, i) => `
    <button class="group relative flex-shrink-0 w-56 rounded-lg overflow-hidden border" style="border-color:rgba(43,38,32,0.12)" data-video-index="${i}">
      <img src="${driveThumbUrl(v.id, 320)}" alt="${v.name}" loading="lazy" class="w-full h-36 object-cover transition duration-300 group-hover:scale-105">
      <span class="absolute inset-0 flex items-center justify-center">
        <span class="w-11 h-11 rounded-full flex items-center justify-center text-lg" style="background:rgba(43,38,32,0.55);color:#FBF6EC">&#9658;</span>
      </span>
      <span class="absolute bottom-0 left-0 right-0 px-3 py-2 text-xs text-left" style="background:linear-gradient(to top, rgba(43,38,32,0.85), transparent);color:#FBF6EC">${v.name}</span>
    </button>
  `).join("");

  wrap.querySelectorAll("[data-video-index]").forEach(btn => {
    btn.addEventListener("click", () => {
      const i = Number(btn.dataset.videoIndex);
      videoModal.open(videos[i]);
    });
  });
}

function renderPhotoBatches(photos) {
  const grid = document.getElementById("photo-grid");
  let loadMoreBtn = document.getElementById("load-more");
  const countEl = document.getElementById("photo-count");
  if (!grid) return;

  // Reset grid + button state (this function may be called again on filter change)
  grid.innerHTML = "";
  const freshBtn = loadMoreBtn.cloneNode(true);
  loadMoreBtn.parentNode.replaceChild(freshBtn, loadMoreBtn);
  loadMoreBtn = freshBtn;

  if (countEl) countEl.textContent = `${photos.length} photo${photos.length === 1 ? "" : "s"}`;

  let shown = 0;

  function renderNextBatch() {
    const next = photos.slice(shown, shown + BATCH_SIZE);
    next.forEach((p) => {
      const realIndex = photos.indexOf(p);
      const fig = document.createElement("button");
      fig.className = "fade-in block w-full rounded-lg overflow-hidden border";
      fig.style.borderColor = "rgba(43,38,32,0.12)";
      fig.setAttribute("aria-label", `Open photo: ${p.name}`);
      fig.innerHTML = `<img src="${driveThumbUrl(p.id, 420)}" alt="${p.name}" loading="lazy" class="card-photo w-full">`;
      fig.addEventListener("click", () => lightbox.open(photos, realIndex));
      grid.appendChild(fig);
    });
    shown += next.length;

    if (shown >= photos.length) {
      loadMoreBtn.classList.add("hidden");
    } else {
      loadMoreBtn.classList.remove("hidden");
    }
  }

  loadMoreBtn.addEventListener("click", renderNextBatch);
  renderNextBatch();
}
