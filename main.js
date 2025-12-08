// ============================================================
// Utility: Initialize Bootstrap dropdowns after navbar loads
// ============================================================
function initBootstrapDropdowns() {
  if (!window.bootstrap || !bootstrap.Dropdown) return;

  const dropdownTriggers = document.querySelectorAll('[data-bs-toggle="dropdown"]');

  dropdownTriggers.forEach((trigger) => {
    if (!trigger._bsDropdownInstance) {
      trigger._bsDropdownInstance = new bootstrap.Dropdown(trigger);
    }
  });
}

// ============================================================
// Ensure Bootstrap is loaded exactly once
// ============================================================
function ensureBootstrapLoaded(callback) {
  // Already available? run callback immediately
  if (window.bootstrap && bootstrap.Dropdown) {
    callback();
    return;
  }

  // If script already being appended, wait for it
  if (document.getElementById("bootstrap-bundle-loader")) {
    const existing = document.getElementById("bootstrap-bundle-loader");
    existing.addEventListener("load", callback);
    return;
  }

  // Otherwise load from CDN
  const script = document.createElement("script");
  script.id = "bootstrap-bundle-loader";
  script.src = "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js";
  script.defer = true;

  script.onload = callback;
  script.onerror = () => console.error("Failed to load Bootstrap bundle.");

  document.body.appendChild(script);
}

// ============================================================
// Load fragment into a container
// ============================================================
function loadFragment(containerId, filePath, afterLoadCallback) {
  const container = document.getElementById(containerId);
  if (!container) return;

  fetch(filePath)
    .then((res) => res.text())
    .then((html) => {
      container.innerHTML = html;
      if (typeof afterLoadCallback === "function") {
        afterLoadCallback();
      }
    })
    .catch((err) => console.error(`Error loading ${filePath}:`, err));
}

// ============================================================
// DOM Ready
// ============================================================
document.addEventListener("DOMContentLoaded", () => {

  // Load navbar.html
  loadFragment("navbar-container", "navbar.html", () => {
    ensureBootstrapLoaded(() => {
      initBootstrapDropdowns();
    });
  });

  // Load footer.html
  loadFragment("footer-container", "footer.html", () => {
    // Auto-update year in footer
    const yearSpan = document.getElementById("yearSpan");
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();
  });

});
