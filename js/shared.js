/* shared.js — site-wide helpers */

const isDemo = (id) => id.startsWith("DEMO-");

function driveThumbUrl(id, width = 480) {
  if (isDemo(id)) return `https://picsum.photos/seed/${encodeURIComponent(id)}/${width}/${Math.round(width * 1.25)}`;
  return `https://lh3.googleusercontent.com/d/${id}`;
}

function driveVideoThumbUrl(id, width = 320) {
  if (isDemo(id)) return `https://picsum.photos/seed/${encodeURIComponent(id)}/${width}/${Math.round(width * 1.25)}`;
  return `https://drive.google.com/thumbnail?id=${id}&sz=w${width}`;
}

function driveFullImageUrl(id) {
  if (isDemo(id)) return `https://picsum.photos/seed/${encodeURIComponent(id)}/1400/1750`;
  // lh3.googleusercontent.com/d/ID serves the original full-resolution file
  return `https://lh3.googleusercontent.com/d/${id}`;
}

function driveVideoEmbedUrl(id) {
  if (isDemo(id)) return "https://samplelib.com/lib/preview/mp4/sample-5s.mp4";
  return `https://drive.google.com/file/d/${id}/preview`;
}

function driveVideoDirectUrl(id) {
  if (isDemo(id)) return "https://samplelib.com/lib/preview/mp4/sample-5s.mp4";
  return `https://drive.usercontent.google.com/download?id=${id}`;
}

function driveDownloadUrl(id) {
  if (isDemo(id)) return "#demo-download";
  return `https://drive.google.com/uc?export=download&id=${id}`;
}

/* LIGHTBOX (photos) */
const lightbox = {
  el: null,
  imgEl: null,
  captionEl: null,
  downloadEl: null,
  items: [],
  index: 0,

  init() {
    this.el = document.getElementById("lightbox");
    this.imgEl = document.getElementById("lightbox-img");
    this.captionEl = document.getElementById("lightbox-caption");
    this.downloadEl = document.getElementById("lightbox-download");
    if (!this.el) return;
    document.getElementById("lightbox-close").addEventListener("click", () => this.close());
    document.getElementById("lightbox-prev").addEventListener("click", () => this.step(-1));
    document.getElementById("lightbox-next").addEventListener("click", () => this.step(1));
    if (this.downloadEl) this.downloadEl.addEventListener("click", (e) => e.stopPropagation());
    this.el.addEventListener("click", (e) => { if (e.target === this.el) this.close(); });
    document.addEventListener("keydown", (e) => {
      if (this.el.classList.contains("hidden")) return;
      if (e.key === "Escape") this.close();
      if (e.key === "ArrowLeft") this.step(-1);
      if (e.key === "ArrowRight") this.step(1);
    });

    let touchStartX = 0;
    this.el.addEventListener("touchstart", (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    this.el.addEventListener("touchend", (e) => {
      const diff = touchStartX - e.changedTouches[0].screenX;
      if (Math.abs(diff) > 50) this.step(diff > 0 ? 1 : -1);
    }, { passive: true });
  },

  open(items, index) {
    this.items = items;
    this.index = index;
    this.render();
    this.el.classList.remove("hidden");
    document.body.classList.add("overflow-hidden");
  },

  render() {
    const item = this.items[this.index];
    this.imgEl.src = driveFullImageUrl(item.id);
    this.imgEl.alt = item.name;
    this.captionEl.textContent = item.name;
    if (this.downloadEl) {
      this.downloadEl.href = driveDownloadUrl(item.id);
      this.downloadEl.download = item.name;
    }
  },

  step(dir) {
    this.index = (this.index + dir + this.items.length) % this.items.length;
    this.render();
  },

  close() {
    this.el.classList.add("hidden");
    this.imgEl.src = "";
    if (this.downloadEl) this.downloadEl.href = "#";
    document.body.classList.remove("overflow-hidden");
  }
};

/* VIDEO MODAL */
const videoModal = {
  el: null,
  frameWrap: null,
  downloadEl: null,

  init() {
    this.el = document.getElementById("video-modal");
    this.frameWrap = document.getElementById("video-frame-wrap");
    this.downloadEl = document.getElementById("video-modal-download");
    if (!this.el) return;
    document.getElementById("video-modal-close").addEventListener("click", () => this.close());
    this.el.addEventListener("click", (e) => { if (e.target === this.el) this.close(); });
    document.addEventListener("keydown", (e) => {
      if (!this.el.classList.contains("hidden") && e.key === "Escape") this.close();
    });
  },

  open(item) {
    const isDemo = item.id.startsWith("DEMO-");
    if (isDemo) {
      const src = driveVideoDirectUrl(item.id);
      this.frameWrap.innerHTML = `<video src="${src}" controls autoplay class="w-full h-full"></video>`;
    } else {
      this.frameWrap.innerHTML = `<iframe src="${driveVideoEmbedUrl(item.id)}" class="w-full h-full" allow="autoplay" allowfullscreen></iframe>`;
    }
    document.getElementById("video-modal-caption").textContent = item.name;
    if (this.downloadEl) {
      this.downloadEl.href = driveDownloadUrl(item.id);
      this.downloadEl.download = item.name;
    }
    this.el.classList.remove("hidden");
    document.body.classList.add("overflow-hidden");
  },

  close() {
    this.frameWrap.innerHTML = "";
    if (this.downloadEl) this.downloadEl.href = "#";
    this.el.classList.add("hidden");
    document.body.classList.remove("overflow-hidden");
  }
};

/* CAROUSEL — full-width main image with scrollable thumbnail strip underneath */
const heroCollage = {
  covers: [],
  index: 0,

  init() {
    if (!document.getElementById("hero-carousel")) return;
    const category = document.body.dataset.category;
    this.covers = MEDIA.photos.filter(p => p.cover);
    if (category) this.covers = this.covers.filter(p => p.category === category);
    // Shuffle for variety
    for (let i = this.covers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.covers[i], this.covers[j]] = [this.covers[j], this.covers[i]];
    }

    if (this.covers.length === 0) {
      document.querySelector("[data-collage-section]")?.classList.add("hidden");
      return;
    }

    this.render();
    this.bindEvents();
  },

  render() {
    const cover = this.covers[this.index];
    const main = document.getElementById("carousel-main");
    main.src = driveFullImageUrl(cover.id);
    main.alt = cover.name;

    const thumbs = document.getElementById("carousel-thumbs");
    thumbs.innerHTML = this.covers.map((c, i) => `
      <button data-index="${i}" class="flex-shrink-0 rounded-md overflow-hidden border-2 transition-all" style="width:72px;height:54px;opacity:${i === this.index ? 1 : 0.5};border-color:${i === this.index ? 'var(--marigold-deep)' : 'transparent'}">
        <img src="${driveThumbUrl(c.id, 144)}" alt="${c.name}" class="w-full h-full object-cover" loading="lazy">
      </button>
    `).join("");

    thumbs.querySelectorAll("[data-index]").forEach((btn) => {
      btn.addEventListener("click", () => {
        this.index = Number(btn.dataset.index);
        this.render();
      });
    });

    const active = thumbs.querySelector(`[data-index="${this.index}"]`);
    if (active) active.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  },

  bindEvents() {
    document.getElementById("carousel-prev")?.addEventListener("click", () => {
      this.index = (this.index - 1 + this.covers.length) % this.covers.length;
      this.render();
    });
    document.getElementById("carousel-next")?.addEventListener("click", () => {
      this.index = (this.index + 1) % this.covers.length;
      this.render();
    });

    const main = document.getElementById("carousel-main");
    const thumbs = document.getElementById("carousel-thumbs");

    if (main) {
      let touchStartX = 0;
      main.addEventListener("touchstart", (e) => {
        touchStartX = e.changedTouches[0].screenX;
      }, { passive: true });
      main.addEventListener("touchend", (e) => {
        const diff = touchStartX - e.changedTouches[0].screenX;
        if (Math.abs(diff) > 50) {
          if (diff > 0) {
            this.index = (this.index + 1) % this.covers.length;
          } else {
            this.index = (this.index - 1 + this.covers.length) % this.covers.length;
          }
          this.render();
        }
      }, { passive: true });
    }

    if (!thumbs) return;

    thumbs.addEventListener("wheel", (e) => {
      e.preventDefault();
      thumbs.scrollLeft += e.deltaY;
    }, { passive: false });

    let isDown = false, startX, scrollLeft;
    thumbs.addEventListener("mousedown", (e) => {
      isDown = true;
      thumbs.style.cursor = "grabbing";
      startX = e.pageX - thumbs.offsetLeft;
      scrollLeft = thumbs.scrollLeft;
    });
    thumbs.addEventListener("mouseleave", () => { isDown = false; thumbs.style.cursor = ""; });
    thumbs.addEventListener("mouseup", () => { isDown = false; thumbs.style.cursor = ""; });
    thumbs.addEventListener("mousemove", (e) => {
      if (!isDown) return;
      e.preventDefault();
      thumbs.scrollLeft = scrollLeft - (e.pageX - thumbs.offsetLeft - startX) * 1.5;
    });
  }
};

/* PWA - service worker registration + install button */
let pwaInstallPrompt = null;

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  pwaInstallPrompt = e;
});

function showPwaToast() {
  const toast = document.getElementById("pwa-toast");
  if (!toast) return;
  toast.classList.remove("hidden");
  setTimeout(() => toast.classList.add("hidden"), 4000);
}

document.addEventListener("click", (e) => {
  const btn = e.target.closest("#pwa-install-btn");
  if (!btn) return;
  if (pwaInstallPrompt) {
    pwaInstallPrompt.prompt();
    pwaInstallPrompt.userChoice.then(() => {
      pwaInstallPrompt = null;
      btn.classList.add("hidden");
    });
  } else {
    showPwaToast();
  }
});

window.addEventListener("appinstalled", () => {
  pwaInstallPrompt = null;
  const btn = document.getElementById("pwa-install-btn");
  if (btn) btn.classList.add("hidden");
});

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/js/sw.js");
}

document.addEventListener("DOMContentLoaded", () => {
  lightbox.init();
  videoModal.init();
  heroCollage.init();

  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const menuBtn = document.getElementById("menu-btn");
  const mobileNav = document.getElementById("mobile-nav");
  if (menuBtn && mobileNav) {
    menuBtn.addEventListener("click", () => mobileNav.classList.toggle("hidden"));
  }

  document.querySelectorAll(".collapsible-trigger").forEach((btn) => {
    btn.addEventListener("click", () => {
      const section = btn.closest(".collapsible");
      section.classList.toggle("collapsed");
    });
  });
});
