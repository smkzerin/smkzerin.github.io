/* gallery.js — renders the photo grid + video row for a single category page */

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
    <div class="relative flex-shrink-0 w-56">
      <button class="group relative w-full rounded-lg overflow-hidden border" style="border-color:rgba(43,38,32,0.12)" data-video-index="${i}">
        <img src="${driveThumbUrl(v.id, 320)}" alt="${v.name}" loading="lazy" class="w-full h-36 object-cover transition duration-300 group-hover:scale-105">
        <span class="absolute inset-0 flex items-center justify-center">
          <span class="w-11 h-11 rounded-full flex items-center justify-center text-lg" style="background:rgba(43,38,32,0.55);color:#FBF6EC">&#9658;</span>
        </span>
        <span class="absolute bottom-0 left-0 right-0 px-3 py-2 text-xs text-left" style="background:linear-gradient(to top, rgba(43,38,32,0.85), transparent);color:#FBF6EC">${v.name}</span>
      </button>
      <a href="${driveDownloadUrl(v.id)}" download="${v.name}" class="block mt-1.5 text-xs text-center underline" style="color:var(--charcoal)" title="Download ${v.name}">Download &#x2193;</a>
    </div>
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
  const sentinel = document.getElementById("scroll-sentinel");
  const countEl = document.getElementById("photo-count");
  if (!grid) return;

  grid.innerHTML = "";

  if (countEl) countEl.textContent = `${photos.length} photo${photos.length === 1 ? "" : "s"}`;

  let shown = 0;
  let observer = null;

  function renderNextBatch() {
    const next = photos.slice(shown, shown + BATCH_SIZE);
    next.forEach((p) => {
      const realIndex = photos.indexOf(p);
      const wrap = document.createElement("div");
      wrap.className = "fade-in group relative";
      const btn = document.createElement("button");
      btn.className = "block w-full rounded-lg overflow-hidden border";
      btn.style.borderColor = "rgba(43,38,32,0.12)";
      btn.setAttribute("aria-label", `Open photo: ${p.name}`);
      btn.innerHTML = `<img src="${driveThumbUrl(p.id, 420)}" alt="${p.name}" loading="lazy" class="card-photo w-full">`;
      btn.addEventListener("click", () => lightbox.open(photos, realIndex));
      const dl = document.createElement("a");
      dl.href = driveDownloadUrl(p.id);
      dl.download = p.name;
      dl.className = "absolute bottom-2 right-2 w-8 h-8 rounded-full flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity";
      dl.style.cssText = "background:rgba(43,38,32,0.65);color:#FBF6EC";
      dl.title = `Download ${p.name}`;
      dl.innerHTML = "&#x2193;";
      wrap.appendChild(btn);
      wrap.appendChild(dl);
      grid.appendChild(wrap);
    });
    shown += next.length;

    if (shown >= photos.length && observer) {
      observer.disconnect();
    }
  }

  if (sentinel) {
    observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) renderNextBatch();
    }, { rootMargin: "200px" });
    observer.observe(sentinel);
  }

  renderNextBatch();
}
