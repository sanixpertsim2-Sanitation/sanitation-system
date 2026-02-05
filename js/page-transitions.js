// ======================================================
// SANIXPERT PAGE TRANSITION FIXES
// Prevents blank areas, blinking, and ensures smooth scrolling
// ======================================================

class SanixpertPageTransitions {
  constructor() {
    this.isInitialized = false;
    this.scrollPosition = 0;
    this.transitionTimeout = null;
    this.dateTimeUpdateInterval = null;
  }

  // Initialize page transition fixes
  initialize() {
    if (this.isInitialized) return;
    
    console.log('🔄 Initializing page transition fixes...');
    
    // Fix scrolling issues
    this.fixScrollingIssues();
    
    // Fix date/time display
    this.fixDateTimeDisplay();
    
    // Prevent blank areas
    this.preventBlankAreas();
    
    // Smooth page transitions
    this.setupSmoothTransitions();
    
    this.isInitialized = true;
    console.log('✅ Page transition fixes applied');
  }

  // Fix scrolling issues
  fixScrollingIssues() {
    // Prevent overscroll
    document.body.style.overscrollBehavior = 'none';
    
    // Smooth scrolling
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // Fix iOS scroll bounce
    if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
      this.preventIOSScrollBounce();
    }
    
    // Handle scroll events
    let scrollTimeout;
    window.addEventListener('scroll', () => {
      document.body.classList.add('scrolling');
      
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        document.body.classList.remove('scrolling');
      }, 150);
    });
  }

  // Prevent iOS scroll bounce
  preventIOSScrollBounce() {
    const content = document.querySelector('.app-content');
    if (!content) return;
    
    let startY = 0;
    
    content.addEventListener('touchstart', (e) => {
      startY = e.touches[0].pageY;
    }, { passive: true });
    
    content.addEventListener('touchmove', (e) => {
      const scrollTop = content.scrollTop;
      const scrollHeight = content.scrollHeight;
      const height = content.clientHeight;
      const isTop = scrollTop === 0;
      const isBottom = scrollTop + height >= scrollHeight;
      const up = e.touches[0].pageY > startY;
      
      if ((isTop && up) || (isBottom && !up)) {
        e.preventDefault();
      }
    }, { passive: false });
  }

  // Fix date/time display
  fixDateTimeDisplay() {
    // Update all date/time inputs immediately
    this.updateAllDateTimes();
    
    // Clear existing interval if any
    if (this.dateTimeUpdateInterval) {
      clearInterval(this.dateTimeUpdateInterval);
    }
    
    // Set up continuous updates
    this.dateTimeUpdateInterval = setInterval(() => {
      this.updateAllDateTimes();
    }, 1000);
    
    // Handle page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.updateAllDateTimes();
      }
    });
  }

  // Cleanup method to prevent memory leaks
  cleanup() {
    if (this.transitionTimeout) {
      clearTimeout(this.transitionTimeout);
      this.transitionTimeout = null;
    }
    
    if (this.dateTimeUpdateInterval) {
      clearInterval(this.dateTimeUpdateInterval);
      this.dateTimeUpdateInterval = null;
    }
    
    this.isInitialized = false;
  }

  // Update all date/time inputs
  updateAllDateTimes() {
    const dateTimeInputs = document.querySelectorAll('input[type="text"][readonly], input#dateTime, input[id*="date"], input[id*="time"]');
    
    dateTimeInputs.forEach(input => {
      if (input.id && (input.id.includes('dateTime') || input.id.includes('date') || input.id.includes('time'))) {
        this.updateDateTime(input);
      }
    });
    
    // Update any elements with date/time text
    const dateElements = document.querySelectorAll('[data-datetime], .datetime, .last-updated');
    dateElements.forEach(element => {
      this.updateDateTimeElement(element);
    });
  }

  // Update single date/time input
  updateDateTime(input) {
    if (!input) return;
    
    try {
      const now = new Date();
      const formattedDateTime = now.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }) + ' ' + now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
      
      input.value = formattedDateTime;
    } catch (error) {
      console.error('Date update error:', error);
      input.value = new Date().toLocaleString();
    }
  }

  // Update date/time element
  updateDateTimeElement(element) {
    if (!element) return;
    
    try {
      const now = new Date();
      const timeAgo = this.getTimeAgo(now);
      
      if (element.textContent.includes('Last updated:')) {
        element.innerHTML = 'Last updated: <span>' + timeAgo + '</span>';
      } else {
        element.textContent = timeAgo;
      }
    } catch (error) {
      element.textContent = 'Just now';
    }
  }

  // Get time ago string
  getTimeAgo(date) {
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) {
      return 'Just now';
    } else if (diff < 3600000) {
      return Math.floor(diff / 60000) + ' min ago';
    } else if (diff < 86400000) {
      return Math.floor(diff / 3600000) + ' hour' + (Math.floor(diff / 3600000) > 1 ? 's' : '') + ' ago';
    } else {
      return date.toLocaleDateString();
    }
  }

  // Prevent blank areas
  preventBlankAreas() {
    // Ensure minimum height for content
    const appContent = document.querySelector('.app-content');
    if (appContent) {
      appContent.style.minHeight = 'calc(100vh - 80px)';
    }
    
    // Add loading states for dynamic content
    const loadingElements = document.querySelectorAll('[data-loading]');
    loadingElements.forEach(element => {
      this.addLoadingState(element);
    });
    
    // Prevent content flash without forcing a double-blink
    if (!document.body.dataset.pageTransitionFadeApplied) {
      document.body.dataset.pageTransitionFadeApplied = '1';
      const currentOpacity = parseFloat(getComputedStyle(document.body).opacity || '1');
      if (currentOpacity < 1) {
        document.body.style.transition = 'opacity 0.3s ease';
        requestAnimationFrame(() => {
          document.body.style.opacity = '1';
        });
      }
    }
  }

  // Add loading state to element
  addLoadingState(element) {
    const originalContent = element.innerHTML;
    
    element.innerHTML = `
      <div style="text-align: center; padding: 20px; color: #94a3b8;">
        <div style="width: 24px; height: 24px; border: 2px solid #3b82f6; border-top: 2px solid transparent; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 10px;"></div>
        <div>Loading...</div>
      </div>
    `;
    
    // Restore content after delay
    setTimeout(() => {
      element.innerHTML = originalContent;
    }, 1000);
  }

  // Setup smooth transitions
  setupSmoothTransitions() {
    // Add transition styles
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      .app-content {
        transition: all 0.3s ease;
      }
      
      .scrolling {
        pointer-events: none;
      }
      
      .fade-in {
        animation: fadeIn 0.3s ease;
      }
      
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `;
    document.head.appendChild(style);
    
    // Handle navigation
    this.setupNavigationHandlers();
  }

  // Setup navigation handlers
  setupNavigationHandlers() {
    // Intercept navigation clicks
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href], button[onclick*="navigate"]');
      if (link) {
        this.handleNavigation(link);
      }
    });
  }

  // Handle navigation
  handleNavigation(element) {
    // Save scroll position
    this.scrollPosition = window.pageYOffset;
    
    // Add transition effect
    document.body.style.opacity = '0.8';
    
    // Clear any pending transitions
    if (this.transitionTimeout) {
      clearTimeout(this.transitionTimeout);
    }
    
    // Reset after navigation
    this.transitionTimeout = setTimeout(() => {
      document.body.style.opacity = '1';
      
      // Restore scroll position if needed
      if (this.scrollPosition > 0) {
        window.scrollTo(0, 0);
      }
    }, 300);
  }
}

// Initialize on DOM content loaded
document.addEventListener('DOMContentLoaded', () => {
  window.sanixpertPageTransitions = new SanixpertPageTransitions();
  window.sanixpertPageTransitions.initialize();
});

// Also initialize on page load (for SPA navigation)
window.addEventListener('load', () => {
  if (window.sanixpertPageTransitions) {
    window.sanixpertPageTransitions.initialize();
  }
});
