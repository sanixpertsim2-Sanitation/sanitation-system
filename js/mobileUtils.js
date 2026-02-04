// Mobile Utility Functions for Enhanced Mobile UX
class MobileUtils {
  
  // Detect if device is mobile
  static isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           (window.innerWidth <= 768 && 'ontouchstart' in window);
  }

  // Detect if device is a touch device
  static isTouchDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }

  // Get safe area insets for notched phones
  static getSafeAreaInsets() {
    const style = getComputedStyle(document.documentElement);
    return {
      top: parseInt(style.getPropertyValue('env(safe-area-inset-top)') || '0'),
      right: parseInt(style.getPropertyValue('env(safe-area-inset-right)') || '0'),
      bottom: parseInt(style.getPropertyValue('env(safe-area-inset-bottom)') || '0'),
      left: parseInt(style.getPropertyValue('env(safe-area-inset-left)') || '0')
    };
  }

  // Apply safe area insets to element
  static applySafeAreaInsets(element) {
    if (!element) return;
    
    const insets = this.getSafeAreaInsets();
    element.style.paddingLeft = `max(16px, ${insets.left}px)`;
    element.style.paddingRight = `max(16px, ${insets.right}px)`;
    element.style.paddingBottom = `max(80px, ${insets.bottom}px)`;
  }

  // Prevent zoom on input focus (iOS)
  static preventZoomOnFocus() {
    const inputs = document.querySelectorAll('input[type="text"], input[type="number"], input[type="email"], input[type="password"], input[type="tel"], textarea, select');
    
    inputs.forEach(input => {
      input.addEventListener('focus', () => {
        document.querySelector('meta[name="viewport"]').setAttribute('content', 
          'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
      });
      
      input.addEventListener('blur', () => {
        document.querySelector('meta[name="viewport"]').setAttribute('content', 
          'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes');
      });
    });
  }

  // Add touch feedback to buttons
  static addTouchFeedback(selectors = '.mobile-action-btn, .primary-btn, .submit-btn, .action-btn') {
    const buttons = document.querySelectorAll(selectors);
    
    buttons.forEach(button => {
      button.addEventListener('touchstart', () => {
        button.style.transform = 'scale(0.98)';
        button.style.transition = 'transform 0.1s ease';
      });
      
      button.addEventListener('touchend', () => {
        setTimeout(() => {
          button.style.transform = 'scale(1)';
        }, 100);
      });
    });
  }

  // Optimize scrolling for mobile
  static optimizeScrolling() {
    // Enable smooth scrolling
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // Enable momentum scrolling on iOS
    const containers = document.querySelectorAll('.container, .mobile-card');
    containers.forEach(container => {
      container.style.webkitOverflowScrolling = 'touch';
    });
  }

  // Handle orientation changes
  static handleOrientationChange(callback) {
    window.addEventListener('orientationchange', () => {
      setTimeout(callback, 100); // Wait for orientation to complete
    });
    
    // Also handle resize (for devices that don't support orientationchange)
    window.addEventListener('resize', () => {
      if (window.innerWidth !== window.innerHeight) {
        setTimeout(callback, 100);
      }
    });
  }

  // Show mobile-specific loading state
  static showLoading(container, message = 'Loading...') {
    if (!container) return;
    
    container.innerHTML = `
      <div class="mobile-loading">
        <div class="mobile-spinner"></div>
        <p>${message}</p>
      </div>
    `;
  }

  // Show mobile-specific error state
  static showError(container, title = 'Error', message = 'Something went wrong', retryCallback = null) {
    if (!container) return;
    
    container.innerHTML = `
      <div class="mobile-error">
        <h3>⚠️ ${title}</h3>
        <p>${message}</p>
        ${retryCallback ? `<button class="mobile-action-btn" onclick="${retryCallback}">🔄 Retry</button>` : ''}
      </div>
    `;
  }

  // Create mobile-friendly confirm dialog
  static confirm(title, message, onConfirm, onCancel = null) {
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
        <button class="mobile-action-btn secondary" style="flex: 1;" onclick="this.closest('.mobile-confirm').remove()">
          Cancel
        </button>
        <button class="mobile-action-btn" style="flex: 1;" onclick="this.closest('.mobile-confirm').remove(); mobileConfirmCallback();">
          Confirm
        </button>
      </div>
    `;
    
    overlay.className = 'mobile-confirm';
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
    
    // Store callback globally for the onclick handler
    window.mobileConfirmCallback = onConfirm;
    
    // Handle overlay click
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.remove();
        if (onCancel) onCancel();
      }
    });
  }

  // Create mobile-friendly toast notification
  static showToast(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      bottom: 20px;
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
    
    // Remove after duration
    setTimeout(() => {
      toast.style.animation = 'slideDown 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  // Add swipe gestures
  static addSwipeGesture(element, handlers) {
    if (!element || !this.isTouchDevice()) return;
    
    let startX = 0;
    let startY = 0;
    let endX = 0;
    let endY = 0;
    
    element.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    });
    
    element.addEventListener('touchend', (e) => {
      endX = e.changedTouches[0].clientX;
      endY = e.changedTouches[0].clientY;
      
      const deltaX = endX - startX;
      const deltaY = endY - startY;
      const absDeltaX = Math.abs(deltaX);
      const absDeltaY = Math.abs(deltaY);
      
      // Only consider horizontal swipes
      if (absDeltaX > absDeltaY && absDeltaX > 50) {
        if (deltaX > 0 && handlers.onSwipeRight) {
          handlers.onSwipeRight();
        } else if (deltaX < 0 && handlers.onSwipeLeft) {
          handlers.onSwipeLeft();
        }
      }
      
      // Only consider vertical swipes
      if (absDeltaY > absDeltaX && absDeltaY > 50) {
        if (deltaY > 0 && handlers.onSwipeDown) {
          handlers.onSwipeDown();
        } else if (deltaY < 0 && handlers.onSwipeUp) {
          handlers.onSwipeUp();
        }
      }
    });
  }

  // Optimize images for mobile
  static optimizeImages() {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      img.loading = 'lazy';
      img.style.maxWidth = '100%';
      img.style.height = 'auto';
    });
  }

  // Initialize all mobile optimizations
  static initialize() {
    if (!this.isMobile()) return;
    
    // Apply safe area insets
    const containers = document.querySelectorAll('.container');
    containers.forEach(container => this.applySafeAreaInsets(container));
    
    // Prevent zoom on focus
    this.preventZoomOnFocus();
    
    // Add touch feedback
    this.addTouchFeedback();
    
    // Optimize scrolling
    this.optimizeScrolling();
    
    // Optimize images
    this.optimizeImages();
    
    console.log('Mobile optimizations initialized');
  }
}

// Add CSS animations for toasts
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
  module.exports = { MobileUtils };
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  MobileUtils.initialize();
});
