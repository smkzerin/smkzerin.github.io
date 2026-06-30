/*
  shared.js — site-wide helpers.

  DRIVE URL BUILDERS
  Once real files are uploaded, file.id will be a real Google Drive file ID
  and these functions produce the correct embeddable / downloadable URLs.
  For this demo, IDs are fake, so we fall back to placeholder image/video
  services so you can see real visuals while reviewing.
*/

const IS_DEMO = true; // flip to false once real Drive IDs are in data.js

function driveThumbUrl(id, width = 480) {
  if (IS_DEMO) return `https://picsum.photos/seed/${encodeURIComponent(id)}/${width}/${Math.round(width * 1.25)}`;
  return `https://drive.google.com/thumbnail?id=${id}&sz=w${width}`;
}

function driveFullImageUrl(id) {
  if (IS_DEMO) return `https://picsum.photos/seed/${encodeURIComponent(id)}/1400/1750`;
  return `https://drive.google.com/uc?export=view&id=${id}`;
}

function driveVideoEmbedUrl(id) {
  if (IS_DEMO) return "https://samplelib.com/lib/preview/mp4/sample-5s.mp4";
  return `https://drive.google.com/file/d/${id}/preview`;
}

function driveDownloadUrl(id) {
  if (IS_DEMO) return "#demo-download";
  return `https://drive.google.com/uc?export=download&id=${id}`;
}

/* LIGHTBOX (photos) */
const lightbox = {
  el: null,
  imgEl: null,
  captionEl: null,
  items: [],
  index: 0,

  init() {
    this.el = document.getElementById("lightbox");
    this.imgEl = document.getElementById("lightbox-img");
    this.captionEl = document.getElementById("lightbox-caption");
    if (!this.el) return;
    document.getElementById("lightbox-close").addEventListener("click", () => this.close());
    document.getElementById("lightbox-prev").addEventListener("click", () => this.step(-1));
    document.getElementById("lightbox-next").addEventListener("click", () => this.step(1));
    this.el.addEventListener("click", (e) => { if (e.target === this.el) this.close(); });
    document.addEventListener("keydown", (e) => {
      if (this.el.classList.contains("hidden")) return;
      if (e.key === "Escape") this.close();
      if (e.key === "ArrowLeft") this.step(-1);
      if (e.key === "ArrowRight") this.step(1);
    });
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
  },

  step(dir) {
    this.index = (this.index + dir + this.items.length) % this.items.length;
    this.render();
  },

  close() {
    this.el.classList.add("hidden");
    this.imgEl.src = "";
    document.body.classList.remove("overflow-hidden");
  }
};

/* VIDEO MODAL */
const videoModal = {
  el: null,
  frameWrap: null,

  init() {
    this.el = document.getElementById("video-modal");
    this.frameWrap = document.getElementById("video-frame-wrap");
    if (!this.el) return;
    document.getElementById("video-modal-close").addEventListener("click", () => this.close());
    this.el.addEventListener("click", (e) => { if (e.target === this.el) this.close(); });
    document.addEventListener("keydown", (e) => {
      if (!this.el.classList.contains("hidden") && e.key === "Escape") this.close();
    });
  },

  open(item) {
    const src = driveVideoEmbedUrl(item.id);
    const el = IS_DEMO
      ? `<video src="${src}" controls autoplay class="w-full h-full"></video>`
      : `<iframe src="${src}" class="w-full h-full" allow="autoplay" allowfullscreen></iframe>`;
    this.frameWrap.innerHTML = el;
    document.getElementById("video-modal-caption").textContent = item.name;
    this.el.classList.remove("hidden");
    document.body.classList.add("overflow-hidden");
  },

  close() {
    this.frameWrap.innerHTML = "";
    this.el.classList.add("hidden");
    document.body.classList.remove("overflow-hidden");
  }
};

/* PHOTO COLLAGE (reused on homepage and each event page) — cycles through
   sets of 4 featured ("cover") photos. If the page has data-category set
   (gallery pages), the collage is filtered to that event's covers only. */
const heroCollage = {
  el: null,
  sets: [],
  index: 0,

  init() {
    this.el = document.getElementById("hero-collage");
    if (!this.el) return;
    const category = document.body.dataset.category; // undefined on homepage = show all
    let covers = MEDIA.photos.filter(p => p.cover);
    if (category) covers = covers.filter(p => p.category === category);

    this.sets = [];
    for (let i = 0; i < covers.length; i += 4) {
      const set = covers.slice(i, i + 4);
      if (set.length === 4) this.sets.push(set);
    }
    if (this.sets.length === 0) {
      // not enough covers for a full staggered set — hide the collage gracefully
      this.el.closest("[data-collage-section]")?.classList.add("hidden");
      return;
    }
    document.getElementById("hero-prev").addEventListener("click", () => this.step(-1));
    document.getElementById("hero-next").addEventListener("click", () => this.step(1));
    this.render();
  },

  render() {
    const set = this.sets[this.index];
    const slots = this.el.querySelectorAll("[data-slot]");
    slots.forEach((slot, i) => {
      if (set[i]) slot.src = driveThumbUrl(set[i].id, 420);
    });
  },

  step(dir) {
    this.index = (this.index + dir + this.sets.length) % this.sets.length;
    this.render();
  }
};

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
});
