// GSAP-driven premium motion layer.
(function initGsapEffects() {
  if (!window.gsap) return;
  if (window.ScrollTrigger) {
    window.gsap.registerPlugin(window.ScrollTrigger);
  }

  const toArray = (selector) => Array.from(document.querySelectorAll(selector));
  const navItems = toArray(".global-header, .global-header *");
  const hero = toArray("h1, h2, h3, .page-title");
  const panels = toArray(".glass-panel, .section, .section-card, .card, .kpi, .status");

  const timeline = window.gsap.timeline({ defaults: { ease: "power4.out" } });
  if (navItems.length) {
    timeline.from(navItems, { y: -12, opacity: 0, stagger: 0.02, duration: 0.4 });
  }
  if (hero.length) {
    timeline.from(hero, { y: 16, opacity: 0, stagger: 0.06, duration: 0.5 }, "-=0.2");
  }
  if (panels.length) {
    timeline.from(panels, { y: 20, opacity: 0, stagger: 0.08, duration: 0.6 }, "-=0.2");
  }

  if (window.ScrollTrigger) {
    window.gsap.utils.toArray("section, .section, .section-card, .card, tr").forEach((el) => {
      window.gsap.from(el, {
        y: 20,
        opacity: 0,
        duration: 0.6,
        ease: "power2.out",
        scrollTrigger: {
          trigger: el,
          start: "top 90%"
        }
      });
    });
  }

  // Status pill glow pulse.
  window.gsap.utils.toArray(".status-badge, .status-pill").forEach((pill) => {
    window.gsap.to(pill, {
      boxShadow: "0 0 16px rgba(59,130,246,0.35)",
      repeat: -1,
      yoyo: true,
      duration: 1.8,
      ease: "sine.inOut"
    });
  });

  // 3D tilt for key metric cards.
  window.gsap.utils.toArray(".kpi, .metric-tilt").forEach((card) => {
    const strength = 8;
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      window.gsap.to(card, {
        rotateX: -y * strength,
        rotateY: x * strength,
        transformPerspective: 600,
        duration: 0.2,
        ease: "power2.out"
      });
    });
    card.addEventListener("mouseleave", () => {
      window.gsap.to(card, {
        rotateX: 0,
        rotateY: 0,
        duration: 0.3,
        ease: "power2.out"
      });
    });
  });

  // Button tactile feedback (spring-like).
  window.gsap.utils.toArray("button, .action-btn, .submit-btn, .primary-btn").forEach((btn) => {
    btn.addEventListener("pointerdown", () => {
      window.gsap.to(btn, { scale: 0.96, duration: 0.12, ease: "power2.out" });
    });
    btn.addEventListener("pointerup", () => {
      window.gsap.to(btn, { scale: 1, duration: 0.28, ease: "elastic.out(1, 0.35)" });
    });
    btn.addEventListener("pointerleave", () => {
      window.gsap.to(btn, { scale: 1, duration: 0.2, ease: "power2.out" });
    });
  });
})();
