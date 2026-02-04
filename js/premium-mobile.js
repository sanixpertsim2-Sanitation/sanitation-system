// ======================================================
   SANIXPERT PREMIUM MOBILE EXPERIENCE
   Professional mobile browsing with premium features
   ======================================================

class PremiumMobileExperience {
  constructor() {
    this.isInitialized = false;
    this.touchStartY = 0;
    this.touchStartX = 0;
    this.isScrolling = false;
    this.scrollTimeout = null;
    this.activeElement = null;
    this.viewportHeight = window.innerHeight;
    this.visualViewport = null;
    
    // Mobile detection
    this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    this.isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    this.isAndroid = /Android/.test(navigator.userAgent);
  }

  // Initialize premium mobile experience
  initialize() {
    if (this.isInitialized) return;
    
    console.log('📱 Initializing Premium Mobile Experience...');
    
    // Prevent zoom and scale issues
    this.preventZoomIssues();
    
    // Handle viewport changes
    this.setupViewportHandling();
    
    // Handle touch interactions
    this.setupTouchInteractions();
    
    // Handle keyboard interactions
    this.setupKeyboardHandling();
    
    // Handle scroll behavior
    this.setupScrollBehavior();
    
    // Handle orientation changes
    this.setupOrientationHandling();
    
    // Setup premium animations
    this.setupPremiumAnimations();
    
    // Handle safe areas
    this.setupSafeAreas();
    
    // Setup performance optimizations
    this.setupPerformanceOptimizations();
    
    this.isInitialized = true;
    console.log('✅ Premium Mobile Experience initialized');
  }

  // Prevent zoom and scale issues
  preventZoomIssues() {
    // Prevent double-tap zoom
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (e) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    }, false);

    // Prevent pinch zoom
    let lastTouchStart = 0;
    document.addEventListener('touchstart', (e) => {
      if (e.touches.length > 1) {
        lastTouchStart = Date.now();
      }
    }, false);

    document.addEventListener('touchmove', (e) => {
      if (e.touches.length > 1 && Date.now() - lastTouchStart < 300) {
        e.preventDefault();
      }
    }, false);

    // Prevent input zoom on iOS
    if (this.isIOS) {
      const inputs = document.querySelectorAll('input, textarea, select');
      inputs.forEach(input => {
        input.addEventListener('touchstart', (e) => {
          input.style.fontSize = '16px';
        });
      });
    }

    // Prevent text selection except in inputs
    document.addEventListener('selectstart', (e) => {
      if (!e.target.matches('input, textarea, [contenteditable]')) {
        e.preventDefault();
      }
    });
  }

  // Setup viewport handling
  setupViewportHandling() {
    // Handle visual viewport API for better keyboard handling
    if (window.visualViewport) {
      this.visualViewport = window.visualViewport;
      
      this.visualViewport.addEventListener('resize', () => {
        this.handleViewportResize();
      });
    }

    // Handle window resize
    window.addEventListener('resize', () => {
      this.handleWindowResize();
    });

    // Handle orientation change
    window.addEventListener('orientationchange', () => {
      this.handleOrientationChange();
    });
  }

  // Setup touch interactions
  setupTouchInteractions() {
    const appContent = document.querySelector('.app-content');
    if (!appContent) return;

    // Touch start
    appContent.addEventListener('touchstart', (e) => {
      this.touchStartY = e.touches[0].clientY;
      this.touchStartX = e.touches[0].clientX;
      this.isScrolling = false;
    }, { passive: true });

    // Touch move
    appContent.addEventListener('touchmove', (e) => {
      this.isScrolling = true;
      
      // Clear scroll timeout
      if (this.scrollTimeout) {
        clearTimeout(this.scrollTimeout);
      }
      
      // Set scroll timeout
      this.scrollTimeout = setTimeout(() => {
        this.isScrolling = false;
      }, 100);
    }, { passive: true });

    // Touch end
    appContent.addEventListener('touchend', (e) => {
      setTimeout(() => {
        this.isScrolling = false;
      }, 50);
    }, { passive: true });

    // Prevent elastic scroll
    appContent.addEventListener('touchmove', (e) => {
      const scrollTop = appContent.scrollTop;
      const scrollHeight = appContent.scrollHeight;
      const clientHeight = appContent.clientHeight;
      
      // Prevent over-scroll
      if ((scrollTop <= 0 && e.touches[0].clientY > this.touchStartY) ||
          (scrollTop + clientHeight >= scrollHeight && e.touches[0].clientY < this.touchStartY)) {
        e.preventDefault();
      }
    }, { passive: false });
  }

  // Setup keyboard handling
  setupKeyboardHandling() {
    // Handle focus on inputs
    document.addEventListener('focusin', (e) => {
      this.activeElement = e.target;
      
      if (this.activeElement.matches('input, textarea, select')) {
        this.handleInputFocus();
      }
    });

    // Handle blur on inputs
    document.addEventListener('focusout', (e) => {
      if (this.activeElement === e.target) {
        this.handleInputBlur();
        this.activeElement = null;
      }
    });

    // Handle keyboard show/hide on iOS
    if (this.isIOS) {
      this.setupIOSKeyboardHandling();
    }
  }

  // Setup iOS keyboard handling
  setupIOSKeyboardHandling() {
    const originalViewportHeight = window.innerHeight;
    
    window.addEventListener('resize', () => {
      const currentViewportHeight = window.innerHeight;
      const heightDifference = originalViewportHeight - currentViewportHeight;
      
      if (heightDifference > 150) {
        // Keyboard is shown
        document.body.classList.add('keyboard-visible');
        this.adjustLayoutForKeyboard(true);
      } else {
        // Keyboard is hidden
        document.body.classList.remove('keyboard-visible');
        this.adjustLayoutForKeyboard(false);
      }
    });
  }

  // Handle input focus
  handleInputFocus() {
    const input = this.activeElement;
    
    // Scroll input into view
    setTimeout(() => {
      input.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }, 300);

    // Add focus styling
    input.classList.add('input-focused');
    
    // Prevent zoom
    if (this.isIOS) {
      input.style.fontSize = '16px';
    }
  }

  // Handle input blur
  handleInputBlur() {
    const input = this.activeElement;
    
    // Remove focus styling
    input.classList.remove('input-focused');
    
    // Restore font size
    if (this.isIOS) {
      input.style.fontSize = '';
    }
  }

  // Adjust layout for keyboard
  adjustLayoutForKeyboard(keyboardVisible) {
    const appContent = document.querySelector('.app-content');
    const stickyActions = document.querySelector('.sticky-actions');
    
    if (keyboardVisible) {
      // Adjust content padding when keyboard is visible
      if (appContent) {
        const keyboardHeight = this.visualViewport ? 
          this.visualViewport.height - window.innerHeight : 
          300; // Fallback estimate
        
        appContent.style.paddingBottom = `${keyboardHeight + 100}px`;
      }
      
      // Hide sticky actions when keyboard is visible
      if (stickyActions) {
        stickyActions.style.transform = 'translateY(100%)';
      }
    } else {
      // Restore normal layout
      if (appContent) {
        appContent.style.paddingBottom = '';
      }
      
      if (stickyActions) {
        stickyActions.style.transform = '';
      }
    }
  }

  // Setup scroll behavior
  setupScrollBehavior() {
    const appContent = document.querySelector('.app-content');
    if (!appContent) return;

    // Smooth scroll behavior
    appContent.style.scrollBehavior = 'smooth';

    // Handle scroll events
    appContent.addEventListener('scroll', () => {
      this.handleScroll();
    }, { passive: true });

    // Momentum scroll for iOS
    if (this.isIOS) {
      this.setupMomentumScroll(appContent);
    }
  }

  // Setup momentum scroll for iOS
  setupMomentumScroll(element) {
    let startY = 0;
    let startTime = 0;
    let scrollY = 0;
    let scrollVelocity = 0;

    element.addEventListener('touchstart', (e) => {
      startY = e.touches[0].clientY;
      startTime = Date.now();
      scrollY = element.scrollTop;
      scrollVelocity = 0;
    }, { passive: true });

    element.addEventListener('touchmove', (e) => {
      const currentY = e.touches[0].clientY;
      const currentTime = Date.now();
      const deltaY = currentY - startY;
      const deltaTime = currentTime - startTime;

      if (deltaTime > 0) {
        scrollVelocity = deltaY / deltaTime;
      }
    }, { passive: true });

    element.addEventListener('touchend', () => {
      // Apply momentum
      if (Math.abs(scrollVelocity) > 0.1) {
        const momentum = scrollVelocity * 200;
        const targetScroll = scrollY - momentum;
        
        element.scrollTo({
          top: targetScroll,
          behavior: 'smooth'
        });
      }
    }, { passive: true });
  }

  // Handle scroll events
  handleScroll() {
    const appContent = document.querySelector('.app-content');
    if (!appContent) return;

    const scrollTop = appContent.scrollTop;
    
    // Add scroll-based styling
    if (scrollTop > 50) {
      document.body.classList.add('scrolled');
    } else {
      document.body.classList.remove('scrolled');
    }

    // Parallax effect for header
    const header = document.querySelector('.app-header');
    if (header) {
      header.style.transform = `translateY(${Math.min(scrollTop * 0.5, 20)}px)`;
    }
  }

  // Setup orientation handling
  setupOrientationHandling() {
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        this.handleOrientationChange();
      }, 100);
    });
  }

  // Handle orientation change
  handleOrientationChange() {
    // Update viewport height
    this.viewportHeight = window.innerHeight;
    
    // Adjust layout for new orientation
    this.adjustLayoutForOrientation();
    
    // Scroll to top
    const appContent = document.querySelector('.app-content');
    if (appContent) {
      appContent.scrollTop = 0;
    }
  }

  // Adjust layout for orientation
  adjustLayoutForOrientation() {
    const isLandscape = window.innerWidth > window.innerHeight;
    
    if (isLandscape) {
      document.body.classList.add('landscape');
    } else {
      document.body.classList.remove('landscape');
    }
  }

  // Handle viewport resize
  handleViewportResize() {
    if (this.visualViewport) {
      const scale = this.visualViewport.scale;
      
      // Prevent zoom
      if (scale !== 1) {
        this.visualViewport.scale = 1;
      }
      
      // Adjust for keyboard
      const keyboardHeight = window.innerHeight - this.visualViewport.height;
      if (keyboardHeight > 100) {
        this.adjustLayoutForKeyboard(true);
      } else {
        this.adjustLayoutForKeyboard(false);
      }
    }
  }

  // Handle window resize
  handleWindowResize() {
    this.viewportHeight = window.innerHeight;
    
    // Re-adjust layout
    this.adjustLayoutForOrientation();
  }

  // Setup premium animations
  setupPremiumAnimations() {
    // Add entrance animations
    this.addEntranceAnimations();
    
    // Setup micro-interactions
    this.setupMicroInteractions();
    
    // Setup loading states
    this.setupLoadingStates();
  }

  // Add entrance animations
  addEntranceAnimations() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '50px'
    });

    // Observe cards and questions
    document.querySelectorAll('.card, .question').forEach(element => {
      observer.observe(element);
    });
  }

  // Setup micro-interactions
  setupMicroInteractions() {
    // Button ripple effects
    document.querySelectorAll('.btn').forEach(button => {
      button.addEventListener('click', (e) => {
        this.createRippleEffect(e, button);
      });
    });

    // Card press effects
    document.querySelectorAll('.card').forEach(card => {
      card.addEventListener('touchstart', () => {
        card.style.transform = 'scale(0.98)';
      });
      
      card.addEventListener('touchend', () => {
        setTimeout(() => {
          card.style.transform = '';
        }, 150);
      });
    });
  }

  // Create ripple effect
  createRippleEffect(e, button) {
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.classList.add('ripple');
    
    button.appendChild(ripple);
    
    setTimeout(() => {
      ripple.remove();
    }, 600);
  }

  // Setup loading states
  setupLoadingStates() {
    // Add loading styles dynamically
    const style = document.createElement('style');
    style.textContent = `
      .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        transform: scale(0);
        animation: ripple-animation 0.6s ease-out;
        pointer-events: none;
      }
      
      @keyframes ripple-animation {
        to {
          transform: scale(4);
          opacity: 0;
        }
      }
      
      .input-focused {
        border-color: #3b82f6 !important;
        box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1) !important;
      }
      
      .keyboard-visible .sticky-actions {
        transform: translateY(100%);
      }
      
      .scrolled .app-header {
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
      }
    `;
    document.head.appendChild(style);
  }

  // Setup safe areas
  setupSafeAreas() {
    // Add safe area support
    const style = document.createElement('style');
    style.textContent = `
      @supports (padding: max(0px)) {
        .app-header {
          padding-top: max(16px, env(safe-area-inset-top));
        }
        
        .sticky-actions {
          padding-bottom: max(16px, env(safe-area-inset-bottom));
        }
        
        .app-content {
          padding-left: max(20px, env(safe-area-inset-left));
          padding-right: max(20px, env(safe-area-inset-right));
        }
      }
    `;
    document.head.appendChild(style);
  }

  // Setup performance optimizations
  setupPerformanceOptimizations() {
    // Reduce motion for users who prefer it
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.body.classList.add('reduced-motion');
    }

    // Optimize scroll performance
    const appContent = document.querySelector('.app-content');
    if (appContent) {
      appContent.style.willChange = 'scroll-position';
      appContent.style.transform = 'translateZ(0)';
    }

    // Lazy load images
    this.setupLazyLoading();
  }

  // Setup lazy loading
  setupLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          imageObserver.unobserve(img);
        }
      });
    });

    images.forEach(img => imageObserver.observe(img));
  }

  // Get device info
  getDeviceInfo() {
    return {
      isMobile: this.isMobile,
      isIOS: this.isIOS,
      isAndroid: this.isAndroid,
      viewportHeight: this.viewportHeight,
      pixelRatio: window.devicePixelRatio || 1,
      touchSupport: 'ontouchstart' in window
    };
  }

  // Destroy premium mobile experience
  destroy() {
    // Remove event listeners
    // Clean up observers
    // Reset styles
    this.isInitialized = false;
  }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  if (!window.premiumMobile) {
    window.premiumMobile = new PremiumMobileExperience();
    
    // Initialize after a short delay to ensure DOM is ready
    setTimeout(() => {
      window.premiumMobile.initialize();
    }, 100);
  }
});

// Handle page visibility changes
document.addEventListener('visibilitychange', function() {
  if (window.premiumMobile && !document.hidden) {
    // Re-initialize when page becomes visible
    setTimeout(() => {
      window.premiumMobile.handleViewportResize();
    }, 100);
  }
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PremiumMobileExperience;
} else {
  window.PremiumMobileExperience = PremiumMobileExperience;
}
