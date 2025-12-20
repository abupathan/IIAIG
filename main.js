// ============================================================
// Site Loader (GitHub Pages project-safe)
// - Loads shared navbar/footer from the *site root* (/IIAIG/)
// ============================================================

function getSiteRoot() {
  const host = (window.location.hostname || "").toLowerCase();
  const parts = (window.location.pathname || "/").split("/").filter(Boolean);

  // GitHub Pages project site: /<repo>/
  if (host.endsWith("github.io") && parts.length >= 1) return `/${parts[0]}/`;

  return "/";
}

function initBootstrapDropdowns() {
  if (!window.bootstrap || !bootstrap.Dropdown) return;

  document.querySelectorAll('[data-bs-toggle="dropdown"]').forEach((trigger) => {
    if (!trigger._bsDropdownInstance) {
      trigger._bsDropdownInstance = new bootstrap.Dropdown(trigger);
    }
  });
}

function ensureBootstrapLoaded(callback) {
  if (window.bootstrap && bootstrap.Dropdown) return callback();

  const existing = document.getElementById("bootstrap-bundle-loader");
  if (existing) return existing.addEventListener("load", callback);

  const script = document.createElement("script");
  script.id = "bootstrap-bundle-loader";
  script.src =
    "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js";
  script.defer = true;
  script.onload = callback;
  script.onerror = () => console.error("Failed to load Bootstrap bundle.");
  document.body.appendChild(script);
}

function loadFragment(containerId, filePath, afterLoadCallback) {
  const container = document.getElementById(containerId);
  if (!container) return;

  fetch(filePath, { cache: "no-store" })
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status} for ${filePath}`);
      return res.text();
    })
    .then((html) => {
      container.innerHTML = html;
      if (typeof afterLoadCallback === "function") afterLoadCallback();
    })
    .catch((err) => console.error(`Error loading ${filePath}:`, err));
}

document.addEventListener("DOMContentLoaded", () => {
  const root = getSiteRoot();

  loadFragment("navbar-container", `${root}navbar.html`, () => {
    ensureBootstrapLoaded(() => initBootstrapDropdowns());
  });

  loadFragment("footer-container", `${root}footer.html`, () => {
    const yearSpan = document.getElementById("yearSpan");
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();
  });
});
