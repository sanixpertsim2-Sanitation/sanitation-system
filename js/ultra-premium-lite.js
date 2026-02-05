// ======================================================
   SANIXPERT ULTRA PREMIUM - LIGHTWEIGHT VERSION
   Simplified premium effects without conflicts
   ======================================================

class UltraPremiumLite {
  constructor() {
    this.isInitialized = false;
    this.init();
  }

  init() {
    if (this.isInitialized) return;
    
    console.log('🚀 Initializing Ultra Premium Lite...');
    
    // Apply premium styles safely
    this.applyPremiumStyles();
    
    // Setup basic animations
    this.setupBasicAnimations();
    
    // Setup hover effects
    this.setupHoverEffects();
    
    this.isInitialized = true;
    console.log('✨ Ultra Premium Lite initialized');
  }

  applyPremiumStyles() {
    try {
      // Add premium background if not exists
      if (!document.querySelector('.premium-bg')) {
        const bg = document.createElement('div');
        bg.className = 'premium-bg';
        bg.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
                     radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
                     radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.2) 0%, transparent 50%),
                     linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
          z-index: -1;
        `;
        document.body.insertBefore(bg, document.body.firstChild);
      }

      // Enhance existing elements
      this.enhanceElements();
      
    } catch (error) {
      console.warn('⚠️ Error applying premium styles:', error);
    }
  }

  enhanceElements() {
    try {
      // Enhance cards
      document.querySelectorAll('.card, .question, .form-group').forEach(element => {
        if (!element.style.background) {
          element.style.background = 'rgba(255, 255, 255, 0.05)';
          element.style.backdropFilter = 'blur(20px)';
          element.style.webkitBackdropFilter = 'blur(20px)';
          element.style.border = '1px solid rgba(255, 255, 255, 0.1)';
          element.style.borderRadius = '24px';
          element.style.boxShadow = '0 8px 32px 0 rgba(31, 38, 135, 0.37)';
          element.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        }
      });

      // Enhance buttons
      document.querySelectorAll('button, .btn').forEach(element => {
        if (!element.classList.contains('btn')) {
          element.classList.add('btn');
        }
        if (!element.style.background) {
          element.style.background = 'linear-gradient(135deg, #667eea, #764ba2)';
          element.style.color = '#ffffff';
          element.style.border = 'none';
          element.style.fontWeight = '600';
          element.style.padding = '12px 24px';
          element.style.borderRadius = '16px';
          element.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
          element.style.textTransform = 'uppercase';
          element.style.letterSpacing = '0.05em';
        }
      });

      // Enhance inputs
      document.querySelectorAll('input, textarea, select').forEach(element => {
        if (!element.style.background) {
          element.style.background = 'rgba(255, 255, 255, 0.05)';
          element.style.backdropFilter = 'blur(20px)';
          element.style.webkitBackdropFilter = 'blur(20px)';
          element.style.border = '1px solid rgba(255, 255, 255, 0.1)';
          element.style.borderRadius = '12px';
          element.style.color = '#ffffff';
          element.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        }
      });

    } catch (error) {
      console.warn('⚠️ Error enhancing elements:', error);
    }
  }

  setupBasicAnimations() {
    try {
      // Animate elements on load
      const elements = document.querySelectorAll('.card, .btn, .text-title, .text-subtitle');
      elements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
          element.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
          element.style.opacity = '1';
          element.style.transform = 'translateY(0)';
        }, index * 100);
      });

    } catch (error) {
      console.warn('⚠️ Error setting up animations:', error);
    }
  }

  setupHoverEffects() {
    try {
      // Card hover effects
      document.querySelectorAll('.card').forEach(card => {
        card.addEventListener('mouseenter', () => {
          card.style.transform = 'translateY(-8px) scale(1.02)';
          card.style.boxShadow = '0 20px 40px rgba(102, 126, 234, 0.3)';
        });
        
        card.addEventListener('mouseleave', () => {
          card.style.transform = 'translateY(0) scale(1)';
          card.style.boxShadow = '0 8px 32px rgba(31, 38, 135, 0.37)';
        });
      });

      // Button hover effects
      document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('mouseenter', () => {
          btn.style.transform = 'translateY(-2px)';
          btn.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.3)';
        });
        
        btn.addEventListener('mouseleave', () => {
          btn.style.transform = 'translateY(0)';
          btn.style.boxShadow = 'none';
        });
      });

    } catch (error) {
      console.warn('⚠️ Error setting up hover effects:', error);
    }
  }

  // Safe method to apply styles without conflicts
  safeApplyStyle(element, styles) {
    try {
      Object.keys(styles).forEach(property => {
        if (!element.style[property]) {
          element.style[property] = styles[property];
        }
      });
    } catch (error) {
      console.warn('⚠️ Error applying styles:', error);
    }
  }

  // Monitor for new elements
  setupMonitoring() {
    try {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList') {
            mutation.addedNodes.forEach((node) => {
              if (node.nodeType === 1) { // Element node
                this.enhanceNewElement(node);
              }
            });
          }
        });
      });
      
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
      
    } catch (error) {
      console.warn('⚠️ Error setting up monitoring:', error);
    }
  }

  enhanceNewElement(element) {
    try {
      // Auto-enhance new elements
      if (element.classList && !element.classList.contains('card')) {
        if (element.tagName === 'DIV' && (element.classList.contains('question') || element.classList.contains('form-group'))) {
          element.classList.add('card');
        }
      }
      
      // Enhance child elements
      const buttons = element.querySelectorAll && element.querySelectorAll('button:not(.btn)');
      buttons.forEach(btn => btn.classList.add('btn'));
      
      const inputs = element.querySelectorAll && element.querySelectorAll('input:not(.input), textarea:not(.textarea), select:not(.select)');
      inputs.forEach(input => {
        if (input.tagName === 'INPUT') input.classList.add('input');
        else if (input.tagName === 'TEXTAREA') input.classList.add('textarea');
        else if (input.tagName === 'SELECT') input.classList.add('select');
      });
      
    } catch (error) {
      console.warn('⚠️ Error enhancing new element:', error);
    }
  }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  try {
    // Wait a bit for other scripts to load
    setTimeout(() => {
      window.ultraPremiumLite = new UltraPremiumLite();
      
      // Setup monitoring for new elements
      if (window.ultraPremiumLite) {
        window.ultraPremiumLite.setupMonitoring();
      }
    }, 100);
  } catch (error) {
    console.warn('⚠️ Error initializing Ultra Premium Lite:', error);
  }
});

// Fallback initialization
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      if (!window.ultraPremiumLite) {
        window.ultraPremiumLite = new UltraPremiumLite();
      }
    }, 200);
  });
} else {
  setTimeout(() => {
    if (!window.ultraPremiumLite) {
      window.ultraPremiumLite = new UltraPremiumLite();
    }
  }, 100);
}

// Export for global access
if (typeof module !== 'undefined' && module.exports) {
  module.exports = UltraPremiumLite;
}
