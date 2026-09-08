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
    function setMenuOpen(open) {
      nav.classList.toggle("open", open);
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
      navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    }
    navToggle.addEventListener("click", function () {
      setMenuOpen(!nav.classList.contains("open"));
    });
    nav.addEventListener("click", function (event) {
      if (event.target.closest("a")) {
        setMenuOpen(false);
      }
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && nav.classList.contains("open")) {
        setMenuOpen(false);
        navToggle.focus();
      }
    });
  }

  document.querySelectorAll(".copy-btn").forEach(function (button) {
    var resetTimer;
    button.setAttribute("aria-live", "polite");
    button.addEventListener("click", async function () {
      var text = button.getAttribute("data-copy") || "";
      clearTimeout(resetTimer);
      button.disabled = true;
      button.classList.remove("copied");
      try {
        if (!navigator.clipboard || !navigator.clipboard.writeText) {
          throw new Error("Clipboard unavailable");
        }
        await navigator.clipboard.writeText(text);
        button.textContent = "Copied";
        button.classList.add("copied");
        resetTimer = setTimeout(function () {
          button.textContent = "Copy";
          button.classList.remove("copied");
        }, 1600);
      } catch {
        button.textContent = "Copy failed — select and copy the command manually";
      } finally {
        button.disabled = false;
      }
    });
  });
})();
