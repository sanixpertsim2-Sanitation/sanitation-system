// Shared header injection for consistent branding across pages.
(function injectHeader() {
  if (document.getElementById("globalHeader")) return;

  const header = document.createElement("header");
  header.id = "globalHeader";
  header.className = "global-header";
  header.innerHTML = `
    <div class="global-header__left">
      <img src="images/logo.png" alt="Give & Go - Sanixpert" class="global-logo" />
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
