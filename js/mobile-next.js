/*
 * SANIXPERT MOBILE-NEXT JAVASCRIPT FRAMEWORK
 * Ultra-fast, mobile-optimized performance engine
 * Solves: Slow loading, poor rendering, scroll issues
 */

class MobileNext {
  constructor() {
    this.isInitialized = false;
    this.components = new Map();
    this.cache = new Map();
    this.loadingStates = new Map();
    this.init();
  }

  // ========================================
  // CORE INITIALIZATION
  // ========================================
  init() {
    if (this.isInitialized) return;
    
    // Wait for DOM
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      this.setup();
    }
  }

  setup() {
    console.log('🚀 MobileNext Framework Initializing...');
    
    // Setup core features
    this.setupViewport();
    this.setupScrollOptimization();
    this.setupTouchOptimization();
    this.setupFormOptimization();
    this.setupLoadingStates();
    this.setupStickyElements();
    this.setupPerformanceMonitoring();
    
    this.isInitialized = true;
    console.log('✅ MobileNext Framework Ready');
  }

  // ========================================
  // VIEWPORT & MOBILE OPTIMIZATION
  // ========================================
  setupViewport() {
    // Set proper viewport
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
    }

    // Prevent zoom on input focus
    document.addEventListener('focus', (e) => {
      if (e.target.matches('input, textarea, select')) {
        document.querySelector('meta[name="viewport"]').setAttribute('content', 
          'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
      }
    }, true);

    document.addEventListener('blur', (e) => {
      if (e.target.matches('input, textarea, select')) {
        document.querySelector('meta[name="viewport"]').setAttribute('content', 
          'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes');
      }
    }, true);
  }

  // ========================================
  // SCROLL OPTIMIZATION
  // ========================================
  setupScrollOptimization() {
    // Enable smooth scrolling
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // Enable momentum scrolling on iOS
    const scrollContainers = document.querySelectorAll('.app-content, .card');
    scrollContainers.forEach(container => {
      container.style.webkitOverflowScrolling = 'touch';
    });

    // Optimize scroll performance
    let scrollTimer;
    window.addEventListener('scroll', () => {
      if (!scrollTimer) {
        window.requestAnimationFrame(() => {
          this.updateStickyElements();
          scrollTimer = null;
        });
        scrollTimer = setTimeout(() => {
          scrollTimer = null;
        }, 100);
      }
    }, { passive: true });
  }

  // ========================================
  // TOUCH OPTIMIZATION
  // ========================================
  setupTouchOptimization() {
    // Add touch feedback to buttons
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
      button.addEventListener('touchstart', () => {
        button.style.transform = 'scale(0.98)';
        button.style.transition = 'transform 0.1s ease';
      }, { passive: true });

      button.addEventListener('touchend', () => {
        setTimeout(() => {
          button.style.transform = 'scale(1)';
        }, 100);
      }, { passive: true });

      button.addEventListener('touchcancel', () => {
        button.style.transform = 'scale(1)';
      }, { passive: true });
    });
  }

  // ========================================
  // FORM OPTIMIZATION
  // ========================================
  setupFormOptimization() {
    // Auto-save draft functionality
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
      this.setupFormAutoSave(form);
    });

    // Optimize input interactions
    const inputs = document.querySelectorAll('.input, .textarea, .select');
    inputs.forEach(input => {
      // Add focus animations
      input.addEventListener('focus', () => {
        input.parentElement.classList.add('focused');
      });

      input.addEventListener('blur', () => {
        input.parentElement.classList.remove('focused');
      });
    });
  }

  setupFormAutoSave(form) {
    const formId = form.id || 'form-' + Math.random().toString(36).substr(2, 9);
    const inputs = form.querySelectorAll('input, textarea, select');
    
    // Load saved data
    this.loadFormDraft(formId, inputs);
    
    // Auto-save on input
    let saveTimer;
    inputs.forEach(input => {
      input.addEventListener('input', () => {
        clearTimeout(saveTimer);
        saveTimer = setTimeout(() => {
          this.saveFormDraft(formId, inputs);
        }, 1000);
      });
    });
  }

  saveFormDraft(formId, inputs) {
    const data = {};
    inputs.forEach(input => {
      data[input.name || input.id] = input.value;
    });
    localStorage.setItem(`draft_${formId}`, JSON.stringify(data));
  }

  loadFormDraft(formId, inputs) {
    const draft = localStorage.getItem(`draft_${formId}`);
    if (draft) {
      try {
        const data = JSON.parse(draft);
        inputs.forEach(input => {
          const key = input.name || input.id;
          if (data[key]) {
            input.value = data[key];
          }
        });
      } catch (e) {
        console.warn('Failed to load draft:', e);
      }
    }
  }

  // ========================================
  // LOADING STATES
  // ========================================
  setupLoadingStates() {
    // Create loading overlay
    const loadingOverlay = document.createElement('div');
    loadingOverlay.id = 'mobile-next-loading';
    loadingOverlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(15, 23, 42, 0.9);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s ease;
    `;
    
    loadingOverlay.innerHTML = `
      <div style="text-align: center;">
        <div style="width: 40px; height: 40px; border: 3px solid rgba(255,255,255,0.1); border-top: 3px solid #00aaff; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 16px;"></div>
        <div style="color: #e2e8f0; font-size: 14px;">Loading...</div>
      </div>
    `;
    
    document.body.appendChild(loadingOverlay);
  }

  showLoading(message = 'Loading...') {
    const overlay = document.getElementById('mobile-next-loading');
    if (overlay) {
      overlay.querySelector('div > div:last-child').textContent = message;
      overlay.style.opacity = '1';
      overlay.style.pointerEvents = 'auto';
    }
  }

  hideLoading() {
    const overlay = document.getElementById('mobile-next-loading');
    if (overlay) {
      overlay.style.opacity = '0';
      overlay.style.pointerEvents = 'none';
    }
  }

  // ========================================
  // STICKY ELEMENTS
  // ========================================
  setupStickyElements() {
    // Setup sticky header
    const header = document.querySelector('.app-header');
    if (header) {
      this.updateStickyHeader();
    }

    // Setup sticky footer
    const footer = document.querySelector('.app-footer');
    if (footer) {
      this.updateStickyFooter();
    }

    // Setup sticky actions
    const stickyActions = document.querySelector('.sticky-actions');
    if (stickyActions) {
      this.updateStickyActions();
    }
  }

  updateStickyElements() {
    this.updateStickyHeader();
    this.updateStickyFooter();
    this.updateStickyActions();
  }

  updateStickyHeader() {
    const header = document.querySelector('.app-header');
    if (header) {
      const scrollY = window.scrollY;
      if (scrollY > 10) {
        header.style.boxShadow = '0 2px 20px rgba(0,0,0,0.3)';
      } else {
        header.style.boxShadow = 'none';
      }
    }
  }

  updateStickyFooter() {
    const footer = document.querySelector('.app-footer');
    if (footer) {
      // Footer is always fixed at bottom
      footer.style.position = 'fixed';
      footer.style.bottom = '0';
      footer.style.left = '0';
      footer.style.right = '0';
    }
  }

  updateStickyActions() {
    const stickyActions = document.querySelector('.sticky-actions');
    if (stickyActions) {
      // Actions are always fixed at bottom
      stickyActions.style.position = 'fixed';
      stickyActions.style.bottom = '0';
      stickyActions.style.left = '0';
      stickyActions.style.right = '0';
      
      // Calculate z-index to be above content but below header
      stickyActions.style.zIndex = '998';
    }
  }

  // ========================================
  // PERFORMANCE MONITORING
  // ========================================
  setupPerformanceMonitoring() {
    // Monitor page load performance
    window.addEventListener('load', () => {
      const loadTime = performance.now();
      console.log(`📊 Page loaded in ${loadTime.toFixed(2)}ms`);
      
      if (loadTime > 3000) {
        console.warn('⚠️ Slow page load detected');
      }
    });

    // Monitor scroll performance
    let scrollCount = 0;
    window.addEventListener('scroll', () => {
      scrollCount++;
      if (scrollCount % 100 === 0) {
        console.log(`📊 Scroll events: ${scrollCount}`);
      }
    }, { passive: true });
  }

  // ========================================
  // UTILITY METHODS
  // ========================================
  // Debounce function for performance
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Throttle function for scroll events
  throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  // Show toast notification
  showToast(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      bottom: 100px;
      left: 50%;
      transform: translateX(-50%);
      background: ${type === 'success' ? 'rgba(34, 197, 94, 0.9)' : 
                   type === 'error' ? 'rgba(239, 68, 68, 0.9)' : 
                   'rgba(59, 130, 246, 0.9)'};
      color: white;
      padding: 16px 20px;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 500;
      z-index: 10001;
      max-width: 90%;
      text-align: center;
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      animation: slideUp 0.3s ease;
    `;
    
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.animation = 'slideDown 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  // Confirm dialog
  confirm(title, message, onConfirm, onCancel = null) {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      padding: 20px;
    `;
    
    const dialog = document.createElement('div');
    dialog.style.cssText = `
      background: rgba(30, 41, 59, 0.95);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 16px;
      padding: 24px;
      max-width: 400px;
      width: 100%;
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
    `;
    
    dialog.innerHTML = `
      <h3 style="margin: 0 0 16px 0; color: #fca5a5; font-size: 18px;">${title}</h3>
      <p style="margin: 0 0 24px 0; color: rgba(255,255,255,0.8); line-height: 1.5;">${message}</p>
      <div style="display: flex; gap: 12px;">
        <button class="btn btn-secondary" style="flex: 1;" onclick="this.closest('.mobile-next-confirm').remove()">
          Cancel
        </button>
        <button class="btn btn-primary" style="flex: 1;" onclick="this.closest('.mobile-next-confirm').remove(); mobileNextConfirmCallback();">
          Confirm
        </button>
      </div>
    `;
    
    overlay.className = 'mobile-next-confirm';
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
    
    // Store callback globally
    window.mobileNextConfirmCallback = onConfirm;
    
    // Handle overlay click
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.remove();
        if (onCancel) onCancel();
      }
    });
  }
}

// ========================================
// GLOBAL INITIALIZATION
// ========================================
window.MobileNext = MobileNext;

// Auto-initialize
const mobileNext = new MobileNext();

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideUp {
    from { transform: translate(-50%, 100%); opacity: 0; }
    to { transform: translate(-50%, 0); opacity: 1; }
  }
  
  @keyframes slideDown {
    from { transform: translate(-50%, 0); opacity: 1; }
    to { transform: translate(-50%, 100%); opacity: 0; }
  }
`;
document.head.appendChild(style);

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MobileNext };
}
