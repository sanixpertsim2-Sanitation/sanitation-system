// Shared header injection for consistent branding across pages.
(function injectHeader() {
  if (document.getElementById("globalHeader")) return;

  const header = document.createElement("header");
  header.id = "globalHeader";
  header.className = "global-header";
  const giveGoLogo = "images/logo.png";
  const sanixpertLogo = "images/logo.png";
  header.innerHTML = `
    <div class="global-header__left">
      <div class="global-logo-stack">
        <img src="${giveGoLogo}" alt="Give & Go" class="global-logo" />
        <img src="${sanixpertLogo}" alt="Sanixpert" class="global-logo global-logo--secondary" />
      </div>
      <div class="global-title">
        <div class="global-title__name">Sanixpert</div>
        <div class="global-title__sub">Intelligent Digital Sanitation Checklist</div>
      </div>
    </div>
    <div class="global-header__right">
      <div class="global-org">Give & Go • Sanitation</div>
    </div>
  `;

  document.body.prepend(header);
})();

// Premium liquid background + glass panel tagging.
(function injectLiquidBackground() {
  if (document.getElementById("liquidBg")) return;
  const liquid = document.createElement("div");
  liquid.id = "liquidBg";
  liquid.className = "liquid-bg";
  liquid.innerHTML = `
    <svg viewBox="0 0 800 400" aria-hidden="true">
      <defs>
        <filter id="gooey">
          <feGaussianBlur in="SourceGraphic" stdDeviation="18" result="blur"/>
          <feColorMatrix in="blur" mode="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8" result="goo"/>
          <feComposite in="SourceGraphic" in2="goo" operator="atop"/>
        </filter>
      </defs>
      <g filter="url(#gooey)">
        <path class="wave wave-a" d="M0,220 C150,320 350,120 800,240 L800,400 L0,400 Z"></path>
        <path class="wave wave-b" d="M0,260 C200,120 500,320 800,200 L800,400 L0,400 Z"></path>
      </g>
    </svg>
  `;
  document.body.prepend(liquid);
})();

(function applyGlassPanels() {
  const selectors = [
    ".container",
    ".section",
    ".section-card",
    ".card",
    ".kpi",
    ".status",
    ".line-card",
    ".damage-card"
  ];
  document.querySelectorAll(selectors.join(",")).forEach(el => {
    el.classList.add("glass-panel");
  });
})();

// Content-aware accents based on section IDs.
(function applyContentAccents() {
  document.querySelectorAll("[id]").forEach(el => {
    const id = el.id.toLowerCase();
    if (id.includes("analytics") || id.includes("data")) {
      el.classList.add("accent-cyan");
    }
    if (id.includes("user") || id.includes("profile")) {
      el.classList.add("accent-emerald");
    }
  });
})();

// Load GSAP motion layer once.
(function loadGsapLayer() {
  if (window.__gsapLayerLoaded) return;
  window.__gsapLayerLoaded = true;
  const script = document.createElement("script");
  script.src = "js/gsapEffects.js";
  script.defer = true;
  document.body.appendChild(script);
})();
