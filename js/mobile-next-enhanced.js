/*
 * SANIXPERT MOBILE-NEXT ENHANCED
 * Advanced animations, micro-interactions, and visual effects
 * Builds on mobile-next.js with premium features
 */

class MobileNextEnhanced {
  constructor() {
    this.isInitialized = false;
    this.animations = new Map();
    this.observers = new Map();
    this.interactions = new Map();
    this.init();
  }

  // ========================================
  // ENHANCED INITIALIZATION
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
    console.log('🎨 MobileNext Enhanced Initializing...');
    
    // Setup enhanced features
    this.setupPageTransitions();
    this.setupScrollAnimations();
    this.setupMicroInteractions();
    this.setupLoadingAnimations();
    this.setupNotificationSystem();
    this.setupProgressIndicators();
    this.setupParticleEffects();
    this.setupGestureAnimations();
    this.setupPerformanceOptimization();
    
    this.isInitialized = true;
    console.log('✨ MobileNext Enhanced Ready');
  }

  // ========================================
  // ENHANCED PAGE TRANSITIONS
  // ========================================
  setupPageTransitions() {
    // Add page transition classes
    document.body.classList.add('page-transition-enter');
    
    // Smooth scroll behavior
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // Enhanced navigation transitions
    const links = document.querySelectorAll('a[href]');
    links.forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href && !href.startsWith('#') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
          e.preventDefault();
          this.navigateWithTransition(href);
        }
      });
    });
  }

  navigateWithTransition(href) {
    document.body.classList.add('page-transition-exit');
    
    setTimeout(() => {
      window.location.href = href;
    }, 300);
  }

  // ========================================
  // ENHANCED SCROLL ANIMATIONS
  // ========================================
  setupScrollAnimations() {
    // Intersection Observer for scroll animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const scrollObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.animateElement(entry.target);
        }
      });
    }, observerOptions);

    // Observe elements for animation
    const animatedElements = document.querySelectorAll('.card-enhanced, .fade-in, .slide-up');
    animatedElements.forEach(el => {
      scrollObserver.observe(el);
      this.observers.set(el, scrollObserver);
    });
  }

  animateElement(element) {
    const animationType = this.getAnimationType(element);
    
    switch (animationType) {
      case 'fade-in':
        element.style.animation = 'fadeInUp 0.6s ease-out';
        break;
      case 'slide-up':
        element.style.animation = 'slideUp 0.6s ease-out';
        break;
      case 'scale-in':
        element.style.animation = 'scaleIn 0.5s ease-out';
        break;
      default:
        element.style.animation = 'fadeInUp 0.6s ease-out';
    }
    
    // Remove observer after animation
    setTimeout(() => {
      const observer = this.observers.get(element);
      if (observer) {
        observer.unobserve(element);
        this.observers.delete(element);
      }
    }, 600);
  }

  getAnimationType(element) {
    if (element.classList.contains('fade-in')) return 'fade-in';
    if (element.classList.contains('slide-up')) return 'slide-up';
    if (element.classList.contains('scale-in')) return 'scale-in';
    return 'fade-in';
  }

  // ========================================
  // ENHANCED MICRO-INTERACTIONS
  // ========================================
  setupMicroInteractions() {
    // Enhanced button interactions
    const buttons = document.querySelectorAll('.btn-enhanced');
    buttons.forEach(button => {
      this.setupButtonEnhancements(button);
    });

    // Enhanced card interactions
    const cards = document.querySelectorAll('.card-enhanced');
    cards.forEach(card => {
      this.setupCardEnhancements(card);
    });

    // Enhanced form interactions
    const inputs = document.querySelectorAll('.input-enhanced, .textarea-enhanced, .select-enhanced');
    inputs.forEach(input => {
      this.setupInputEnhancements(input);
    });
  }

  setupButtonEnhancements(button) {
    // Ripple effect
    button.addEventListener('click', (e) => {
      this.createRippleEffect(e, button);
    });

    // Magnetic effect on hover
    button.addEventListener('mousemove', (e) => {
      this.applyMagneticEffect(e, button);
    });

    button.addEventListener('mouseleave', () => {
      this.removeMagneticEffect(button);
    });
  }

  createRippleEffect(event, button) {
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      transform: scale(0);
      animation: ripple 0.6s ease-out;
      pointer-events: none;
    `;
    
    button.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 600);
  }

  applyMagneticEffect(event, button) {
    const rect = button.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = (event.clientX - centerX) * 0.1;
    const deltaY = (event.clientY - centerY) * 0.1;
    
    button.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(1.05)`;
  }

  removeMagneticEffect(button) {
    button.style.transform = '';
  }

  setupCardEnhancements(card) {
    // Tilt effect on hover
    card.addEventListener('mousemove', (e) => {
      this.applyTiltEffect(e, card);
    });

    card.addEventListener('mouseleave', () => {
      this.removeTiltEffect(card);
    });
  }

  applyTiltEffect(event, card) {
    const rect = card.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = (event.clientX - centerX) / (rect.width / 2);
    const deltaY = (event.clientY - centerY) / (rect.height / 2);
    
    const rotateX = deltaY * 5;
    const rotateY = deltaX * 5;
    
    card.style.transform = `perspective(1000px) rotateX(${-rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
  }

  removeTiltEffect(card) {
    card.style.transform = '';
  }

  setupInputEnhancements(input) {
    // Floating label effect
    const label = input.previousElementSibling;
    if (label && label.tagName === 'LABEL') {
      input.addEventListener('focus', () => {
        label.classList.add('floating');
      });
      
      input.addEventListener('blur', () => {
        if (!input.value) {
          label.classList.remove('floating');
        }
      });
    }

    // Typing indicator
    input.addEventListener('input', () => {
      this.showTypingIndicator(input);
    });
  }

  showTypingIndicator(input) {
    // Add subtle animation while typing
    input.style.animation = 'pulse 0.3s ease';
    setTimeout(() => {
      input.style.animation = '';
    }, 300);
  }

  // ========================================
  // ENHANCED LOADING ANIMATIONS
  // ========================================
  setupLoadingAnimations() {
    // Skeleton loaders
    this.createSkeletonLoaders();
    
    // Progress indicators
    this.createProgressIndicators();
    
    // Loading overlays
    this.createLoadingOverlays();
  }

  createSkeletonLoaders() {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes ripple {
        to {
          transform: scale(4);
          opacity: 0;
        }
      }
      
      .floating {
        transform: translateY(-20px) scale(0.9);
        color: #00aaff;
        font-size: 12px;
        transition: all 0.3s ease;
      }
    `;
    document.head.appendChild(style);
  }

  // ========================================
  // ENHANCED NOTIFICATION SYSTEM
  // ========================================
  setupNotificationSystem() {
    // Override default toast with enhanced version
    this.showToast = (message, type = 'info', duration = 4000) => {
      const notification = document.createElement('div');
      notification.className = 'notification-enhanced';
      
      const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
      };
      
      notification.innerHTML = `
        <span style="margin-right: 8px;">${icons[type] || icons.info}</span>
        <span>${message}</span>
      `;
      
      document.body.appendChild(notification);
      
      // Animate in
      setTimeout(() => {
        notification.style.animation = 'slideInRight 0.3s ease';
      }, 10);
      
      // Remove after duration
      setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
      }, duration);
    };
  }

  // ========================================
  // ENHANCED PROGRESS INDICATORS
  // ========================================
  setupProgressIndicators() {
    // Create progress bars with animations
    const progressBars = document.querySelectorAll('.progress-enhanced');
    progressBars.forEach(bar => {
      this.animateProgressBar(bar);
    });
  }

  animateProgressBar(progressBar) {
    const targetWidth = progressBar.dataset.progress || 0;
    progressBar.style.setProperty('--progress', '0%');
    
    setTimeout(() => {
      progressBar.style.setProperty('--progress', targetWidth);
    }, 100);
  }

  // ========================================
  // ENHANCED PARTICLE EFFECTS
  // ========================================
  setupParticleEffects() {
    // Add particle effects to special elements
    const particleElements = document.querySelectorAll('.particle-enhanced');
    particleElements.forEach(element => {
      this.createParticleEffect(element);
    });
  }

  createParticleEffect(element) {
    const canvas = document.createElement('canvas');
    canvas.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      opacity: 0.3;
    `;
    
    element.appendChild(canvas);
    element.style.position = 'relative';
    
    this.animateParticles(canvas);
  }

  animateParticles(canvas) {
    const ctx = canvas.getContext('2d');
    const particles = [];
    
    // Create particles
    for (let i = 0; i < 20; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1
      });
    }
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;
        
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.fill();
      });
      
      requestAnimationFrame(animate);
    };
    
    // Start animation
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    animate();
  }

  // ========================================
  // ENHANCED GESTURE ANIMATIONS
  // ========================================
  setupGestureAnimations() {
    // Swipe gestures
    this.setupSwipeGestures();
    
    // Pinch to zoom
    this.setupPinchToZoom();
    
    // Pull to refresh
    this.setupPullToRefresh();
  }

  setupSwipeGestures() {
    let startX = 0;
    let startY = 0;
    
    document.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    }, { passive: true });
    
    document.addEventListener('touchend', (e) => {
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      
      const deltaX = endX - startX;
      const deltaY = endY - startY;
      
      // Detect swipe direction
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > 50) {
          this.handleSwipeRight();
        } else if (deltaX < -50) {
          this.handleSwipeLeft();
        }
      } else {
        if (deltaY > 50) {
          this.handleSwipeDown();
        } else if (deltaY < -50) {
          this.handleSwipeUp();
        }
      }
    }, { passive: true });
  }

  handleSwipeRight() {
    console.log('Swipe right detected');
    // Navigate back or previous page
  }

  handleSwipeLeft() {
    console.log('Swipe left detected');
    // Navigate forward or next page
  }

  handleSwipeUp() {
    console.log('Swipe up detected');
    // Refresh or show details
  }

  handleSwipeDown() {
    console.log('Swipe down detected');
    // Close or go back
  }

  setupPinchToZoom() {
    let initialDistance = 0;
    
    document.addEventListener('touchstart', (e) => {
      if (e.touches.length === 2) {
        initialDistance = this.getDistance(e.touches[0], e.touches[1]);
      }
    }, { passive: true });
    
    document.addEventListener('touchmove', (e) => {
      if (e.touches.length === 2) {
        const currentDistance = this.getDistance(e.touches[0], e.touches[1]);
        const scale = currentDistance / initialDistance;
        
        // Apply zoom effect
        document.body.style.transform = `scale(${Math.min(Math.max(scale, 0.8), 1.5)})`;
      }
    }, { passive: true });
    
    document.addEventListener('touchend', () => {
      document.body.style.transform = '';
    }, { passive: true });
  }

  getDistance(touch1, touch2) {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  setupPullToRefresh() {
    let startY = 0;
    let isPulling = false;
    
    document.addEventListener('touchstart', (e) => {
      if (window.scrollY === 0) {
        startY = e.touches[0].clientY;
        isPulling = true;
      }
    }, { passive: true });
    
    document.addEventListener('touchmove', (e) => {
      if (isPulling) {
        const currentY = e.touches[0].clientY;
        const pullDistance = currentY - startY;
        
        if (pullDistance > 0) {
          this.showPullIndicator(pullDistance);
        }
      }
    }, { passive: true });
    
    document.addEventListener('touchend', () => {
      if (isPulling) {
        this.hidePullIndicator();
        isPulling = false;
      }
    }, { passive: true });
  }

  showPullIndicator(distance) {
    // Show pull to refresh indicator
    const indicator = document.getElementById('pullIndicator');
    if (indicator) {
      indicator.style.transform = `translateY(${Math.min(distance, 100)}px)`;
      indicator.style.opacity = Math.min(distance / 100, 1);
    }
  }

  hidePullIndicator() {
    const indicator = document.getElementById('pullIndicator');
    if (indicator) {
      indicator.style.transform = '';
      indicator.style.opacity = '';
    }
  }

  // ========================================
  // PERFORMANCE OPTIMIZATION
  // ========================================
  setupPerformanceOptimization() {
    // Optimize animations
    this.optimizeAnimations();
    
    // Reduce motion on low-end devices
    this.adaptToPerformance();
    
    // Monitor performance
    this.monitorPerformance();
  }

  optimizeAnimations() {
    // Use CSS transforms instead of position changes
    const animatedElements = document.querySelectorAll('[data-animate]');
    animatedElements.forEach(el => {
      el.style.willChange = 'transform';
    });
  }

  adaptToPerformance() {
    // Detect device performance
    const isLowEnd = this.isLowEndDevice();
    
    if (isLowEnd) {
      // Reduce animations
      document.body.classList.add('reduce-motion');
      
      // Disable particle effects
      document.querySelectorAll('.particle-enhanced').forEach(el => {
        el.classList.remove('particle-enhanced');
      });
    }
  }

  isLowEndDevice() {
    // Simple performance detection
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const isSlowConnection = connection && (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g');
    const isLowMemory = navigator.deviceMemory && navigator.deviceMemory < 4;
    
    return isSlowConnection || isLowMemory;
  }

  monitorPerformance() {
    // Monitor frame rate
    let lastTime = performance.now();
    let frameCount = 0;
    
    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) {
        const fps = frameCount;
        frameCount = 0;
        lastTime = currentTime;
        
        // Adjust quality based on FPS
        if (fps < 30) {
          this.reduceQuality();
        } else if (fps > 50) {
          this.increaseQuality();
        }
      }
      
      requestAnimationFrame(measureFPS);
    };
    
    requestAnimationFrame(measureFPS);
  }

  reduceQuality() {
    document.body.classList.add('low-quality');
  }

  increaseQuality() {
    document.body.classList.remove('low-quality');
  }

  // ========================================
  // UTILITY METHODS
  // ========================================
  
  // Enhanced confirm dialog
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
      animation: fadeIn 0.3s ease;
    `;
    
    const dialog = document.createElement('div');
    dialog.style.cssText = `
      background: rgba(30, 41, 59, 0.95);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 20px;
      padding: 32px;
      max-width: 400px;
      width: 100%;
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      animation: scaleIn 0.3s ease;
    `;
    
    dialog.innerHTML = `
      <h3 style="margin: 0 0 16px 0; color: #fca5a5; font-size: 20px;">${title}</h3>
      <p style="margin: 0 0 24px 0; color: rgba(255,255,255,0.9); line-height: 1.6;">${message}</p>
      <div style="display: flex; gap: 12px;">
        <button class="btn-enhanced btn-secondary" style="flex: 1;" onclick="this.closest('.mobile-next-enhanced-confirm').remove()">
          Cancel
        </button>
        <button class="btn-enhanced btn-primary-enhanced" style="flex: 1;" onclick="this.closest('.mobile-next-enhanced-confirm').remove(); mobileNextEnhancedCallback();">
          Confirm
        </button>
      </div>
    `;
    
    overlay.className = 'mobile-next-enhanced-confirm';
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
    
    // Store callback globally
    window.mobileNextEnhancedCallback = onConfirm;
    
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
window.MobileNextEnhanced = MobileNextEnhanced;

// Auto-initialize
const mobileNextEnhanced = new MobileNextEnhanced();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MobileNextEnhanced };
}

// Add CSS for enhanced animations
const enhancedStyles = document.createElement('style');
enhancedStyles.textContent = `
  @keyframes slideOutRight {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
  
  .low-quality {
    --animation-duration: 0.1s;
  }
  
  .low-quality * {
    animation-duration: 0.1s !important;
  }
  
  .reduce-motion * {
    animation: none !important;
    transition: none !important;
  }
`;
document.head.appendChild(enhancedStyles);
