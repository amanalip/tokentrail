(function () {
  "use strict";

  var root = document.documentElement;
  var storageKey = "tokentrail-site-theme";

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
  }

  // Resolve initial theme: saved choice, else system preference.
  var stored = null;
  try {
    stored = localStorage.getItem(storageKey);
  } catch {
    // Storage unavailable; fall back to system preference silently.
  }
  var systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(stored === "light" || stored === "dark" ? stored : systemDark ? "dark" : "light");

  var toggle = document.getElementById("theme-toggle");
  if (toggle) {
    toggle.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(next);
      try {
        localStorage.setItem(storageKey, next);
      } catch {
        // Non-fatal; the choice just will not persist.
      }
    });
  }

  var navToggle = document.getElementById("nav-toggle");
  var nav = document.getElementById("site-nav");
  if (navToggle && nav) {
    navToggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
      navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    nav.addEventListener("click", function (event) {
      if (event.target.closest("a")) {
        nav.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && nav.classList.contains("open")) {
        nav.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.focus();
      }
    });
  }

  document.querySelectorAll(".copy-btn").forEach(function (button) {
    button.addEventListener("click", function () {
      var text = button.getAttribute("data-copy") || "";
      function done() {
        button.textContent = "Copied";
        button.classList.add("copied");
        setTimeout(function () {
          button.textContent = "Copy";
          button.classList.remove("copied");
        }, 1600);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, done);
      } else {
        done();
      }
    });
  });
})();
