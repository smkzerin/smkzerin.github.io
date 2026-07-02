(function () {
  "use strict";

  if (window.__routerReady) return;
  window.__routerReady = true;

  var R = {
    init: function () {
      document.addEventListener("click", function (e) {
        var a = e.target.closest("a");
        if (!a) return;
        var h = a.getAttribute("href");
        if (!h) return;
        if (h.startsWith("http") || h.startsWith("#") || h.startsWith("mailto:") || h.startsWith("tel:")) return;
        if (h.endsWith(".html")) return;
        e.preventDefault();
        if (h === "/" || h === "") {
          history.pushState(null, "", "/");
          R.load("index");
          return;
        }
        var clean = h.replace(/^\//, "");
        history.pushState(null, "", "/" + clean);
        R.load(clean);
      });

      window.addEventListener("popstate", function () {
        var file = R.pathToFile(window.location.pathname);
        if (file) R.load(file);
      });

      var initial = R.pathToFile(window.location.pathname);
      if (initial) R.load(initial);
    },

    pathToFile: function (path) {
      if (path === "/" || path === "/index.html") return "index";
      var name = path.replace(/^\//, "").replace(/\/$/, "");
      if (!name || name.indexOf(".") !== -1) return "";
      return name;
    },

    load: function (name) {
      fetch(name + ".html")
        .then(function (r) {
          if (!r.ok) throw new Error();
          return r.text();
        })
        .then(function (html) { R.swap(html, name); })
        .catch(function () { window.location.href = "/"; });
    },

    swap: function (html, name) {
      var doc = new DOMParser().parseFromString(html, "text/html");
      document.title = doc.title;

      var cat = doc.body.getAttribute("data-category");
      if (cat) document.body.setAttribute("data-category", cat);
      else document.body.removeAttribute("data-category");

      document.body.innerHTML = doc.body.innerHTML;

      if (window.initShared) window.initShared();

      if (doc.querySelector('script[src*="gallery"]')) {
        var gs = document.createElement("script");
        gs.src = "gallery.js";
        gs.async = false;
        document.body.appendChild(gs);
      }
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { R.init(); });
  } else {
    R.init();
  }
})();
