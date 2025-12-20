// ============================================================
// IIAIG Site Loader (GitHub Pages project-safe)
// - Loads navbar/footer from project root (e.g., /IIAIG/)
// - Rewrites navbar/footer internal links to absolute project paths
//   so links work from any folder (prevents /about/about/...)
// ============================================================

function getSiteRoot() {
  const host = (window.location.hostname || "").toLowerCase();
  const parts = (window.location.pathname || "/").split("/").filter(Boolean);

  // GitHub Pages project site: https://<user>.github.io/<repo>/
  if (host.endsWith("github.io") && parts.length >= 1) return `/${parts[0]}/`;

  // Local or custom domains (assume root)
  return "/";
}

function isExternalHref(href) {
  if (!href) return true;
  const h = href.trim().toLowerCase();
  return (
    h.startsWith("http://") ||
    h.startsWith("https://") ||
    h.startsWith("mailto:") ||
    h.startsWith("tel:") ||
    h.startsWith("javascript:") ||
    h.startsWith("#")
  );
}

/**
 * Rewrite <a href="..."> in loaded fragments:
 * - If href is internal and NOT starting with "/" -> prefix siteRoot
 * - If href starts with "./" -> remove "./" then prefix siteRoot
 * - If href starts with "/" -> treat as domain-root; convert to project-root
 *   by stripping the leading "/" and prefixing siteRoot.
 *
 * This ensures internal links always become like: /IIAIG/about/index.html
 */
function rewriteInternalLinks(container, siteRoot) {
  if (!container) return;

  const anchors = container.querySelectorAll("a[href]");
  anchors.forEach((a) => {
    const raw = a.getAttribute("href");
    if (!raw || isExternalHref(raw)) return;

    let href = raw.trim();

    // Normalize
    if (href.startsWith("./")) href = href.slice(2);

    // Convert domain-root paths "/xyz" into project-root paths "/IIAIG/xyz"
    if (href.startsWith("/")) {
      href = href.replace(/^\/+/, ""); // strip all leading slashes
      a.setAttribute("href", `${siteRoot}${href}`);
      return;
    }

    // Already project-root absolute?
    if (href.startsWith(siteRoot)) return;

    // Otherwise: relative -> project root
    a.setAttribute("href", `${siteRoot}${href}`);
  });
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
      if (typeof afterLoadCallback === "function") afterLoadCallback(container);
    })
    .catch((err) => console.error(`Error loading ${filePath}:`, err));
}

document.addEventListener("DOMContentLoaded", () => {
  const root = getSiteRoot();

  loadFragment("navbar-container", `${root}navbar.html`, (navContainer) => {
    rewriteInternalLinks(navContainer, root);
    ensureBootstrapLoaded(() => initBootstrapDropdowns());
  });

  loadFragment("footer-container", `${root}footer.html`, (footerContainer) => {
    rewriteInternalLinks(footerContainer, root);

    const yearSpan = document.getElementById("yearSpan");
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();
  });
});
