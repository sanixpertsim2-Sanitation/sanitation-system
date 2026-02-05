// ======================================================
   SANIXPERT ULTRA PREMIUM AUTOMATION SYSTEM
   Advanced animations, interactions, and automation
   ======================================================

class UltraPremiumAutomation {
  constructor() {
    this.isInitialized = false;
    this.animations = new Map();
    this.observers = new Map();
    this.particles = [];
    this.mousePosition = { x: 0, y: 0 };
    this.scrollY = 0;
    this.isReducedMotion = false;
    
    // Performance optimization
    this.rafId = null;
    this ticking = false;
    
    // Initialize system
    this.init();
  }

  // Initialize ultra premium system
  init() {
    if (this.isInitialized) return;
    
    console.log('🚀 Initializing Ultra Premium Automation...');
    
    // Check for reduced motion preference
    this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // Setup all systems
    this.setupGlobalStyles();
    this.setupAdvancedAnimations();
    this.setupParticleEffects();
    this.setupMouseTracking();
    this.setupScrollEffects();
    this.setupIntersectionObserver();
    this.setupMorphingElements();
    this.setupGlassEffects();
    this.setupMicroInteractions();
    this.setupAdvancedTransitions();
    this.setupPerformanceOptimizations();
    
    // Start animation loop
    this.startAnimationLoop();
    
    this.isInitialized = true;
    console.log('✨ Ultra Premium Automation initialized');
  }

  // Setup global styles
  setupGlobalStyles() {
    const style = document.createElement('style');
    style.textContent = `
      /* Ultra Premium Global Styles */
      * {
        box-sizing: border-box;
      }
      
      body {
        overflow-x: hidden;
        background: #0a0a0a;
      }
      
      /* Smooth scroll */
      html {
        scroll-behavior: smooth;
      }
      
      /* Selection styling */
      ::selection {
        background: rgba(102, 126, 234, 0.3);
        color: white;
      }
      
      /* Scrollbar styling */
      ::-webkit-scrollbar {
        width: 8px;
      }
      
      ::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.05);
      }
      
      ::-webkit-scrollbar-thumb {
        background: linear-gradient(135deg, #667eea, #764ba2);
        border-radius: 4px;
      }
      
      /* Focus styles */
      :focus {
        outline: none;
      }
      
      :focus-visible {
        outline: 2px solid #667eea;
        outline-offset: 2px;
      }
    `;
    document.head.appendChild(style);
  }

  // Setup advanced animations
  setupAdvancedAnimations() {
    // Animate elements on page load
    this.animateOnLoad();
    
    // Setup hover effects
    this.setupHoverEffects();
    
    // Setup click effects
    this.setupClickEffects();
    
    // Setup loading animations
    this.setupLoadingAnimations();
  }

  // Animate elements on load
  animateOnLoad() {
    const elements = document.querySelectorAll('.card, .btn, .text-title, .text-subtitle');
    
    elements.forEach((element, index) => {
      // Set initial state
      element.style.opacity = '0';
      element.style.transform = 'translateY(30px)';
      
      // Animate in with stagger
      setTimeout(() => {
        element.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
      }, index * 100);
    });
  }

  // Setup hover effects
  setupHoverEffects() {
    // Card hover effects
    document.querySelectorAll('.card').forEach(card => {
      card.addEventListener('mouseenter', (e) => {
        this.handleCardHover(e, true);
      });
      
      card.addEventListener('mouseleave', (e) => {
        this.handleCardHover(e, false);
      });
    });
    
    // Button hover effects
    document.querySelectorAll('.btn').forEach(btn => {
      btn.addEventListener('mouseenter', (e) => {
        this.handleButtonHover(e, true);
      });
      
      btn.addEventListener('mouseleave', (e) => {
        this.handleButtonHover(e, false);
      });
    });
  }

  // Handle card hover
  handleCardHover(event, isEntering) {
    const card = event.currentTarget;
    
    if (isEntering) {
      card.style.transform = 'translateY(-8px) scale(1.02)';
      card.style.boxShadow = '0 20px 40px rgba(102, 126, 234, 0.3)';
      
      // Add glow effect
      this.addGlowEffect(card);
    } else {
      card.style.transform = 'translateY(0) scale(1)';
      card.style.boxShadow = '0 8px 32px rgba(31, 38, 135, 0.37)';
      
      // Remove glow effect
      this.removeGlowEffect(card);
    }
  }

  // Handle button hover
  handleButtonHover(event, isEntering) {
    const btn = event.currentTarget;
    
    if (isEntering) {
      btn.style.transform = 'translateY(-2px)';
      btn.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.3)';
      
      // Add ripple effect
      this.createRippleEffect(btn, event);
    } else {
      btn.style.transform = 'translateY(0)';
      btn.style.boxShadow = 'none';
    }
  }

  // Setup click effects
  setupClickEffects() {
    document.querySelectorAll('.btn, .card').forEach(element => {
      element.addEventListener('click', (e) => {
        this.createClickEffect(e);
      });
    });
  }

  // Create click effect
  createClickEffect(event) {
    const element = event.currentTarget;
    const rect = element.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const ripple = document.createElement('div');
    ripple.style.cssText = `
      position: absolute;
      width: 20px;
      height: 20px;
      background: rgba(255, 255, 255, 0.5);
      border-radius: 50%;
      left: ${x}px;
      top: ${y}px;
      transform: translate(-50%, -50%);
      pointer-events: none;
      animation: ripple 0.6s ease-out;
    `;
    
    element.style.position = 'relative';
    element.style.overflow = 'hidden';
    element.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 600);
  }

  // Setup particle effects
  setupParticleEffects() {
    // Create particle container
    this.particleContainer = document.createElement('div');
    this.particleContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 1;
    `;
    document.body.appendChild(this.particleContainer);
    
    // Generate particles
    this.generateParticles();
  }

  // Generate particles
  generateParticles() {
    for (let i = 0; i < 50; i++) {
      const particle = document.createElement('div');
      particle.style.cssText = `
        position: absolute;
        width: ${Math.random() * 4 + 1}px;
        height: ${Math.random() * 4 + 1}px;
        background: rgba(255, 255, 255, ${Math.random() * 0.5 + 0.1});
        border-radius: 50%;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        animation: float ${Math.random() * 10 + 10}s linear infinite;
      `;
      
      this.particleContainer.appendChild(particle);
      this.particles.push(particle);
    }
  }

  // Setup mouse tracking
  setupMouseTracking() {
    document.addEventListener('mousemove', (e) => {
      this.mousePosition.x = e.clientX;
      this.mousePosition.y = e.clientY;
      
      // Update parallax effects
      this.updateParallax(e);
    });
  }

  // Update parallax effects
  updateParallax(event) {
    const mouseX = event.clientX / window.innerWidth - 0.5;
    const mouseY = event.clientY / window.innerHeight - 0.5;
    
    document.querySelectorAll('.card').forEach((card, index) => {
      const depth = (index + 1) * 0.5;
      const moveX = mouseX * depth;
      const moveY = mouseY * depth;
      
      card.style.transform = `translateY(-8px) translateX(${moveX}px) translateY(${moveY}px) scale(1.02)`;
    });
  }

  // Setup scroll effects
  setupScrollEffects() {
    let ticking = false;
    
    window.addEventListener('scroll', () => {
      this.scrollY = window.pageYOffset;
      
      if (!ticking) {
        requestAnimationFrame(() => {
          this.updateScrollEffects();
          ticking = false;
        });
        ticking = true;
      }
    });
  }

  // Update scroll effects
  updateScrollEffects() {
    const scrollPercent = this.scrollY / (document.body.scrollHeight - window.innerHeight);
    
    // Update header opacity
    const header = document.querySelector('.app-header');
    if (header) {
      header.style.opacity = Math.max(0.8, 1 - scrollPercent * 0.5);
    }
    
    // Update parallax background
    const bg = document.querySelector('.premium-bg');
    if (bg) {
      bg.style.transform = `translateY(${this.scrollY * 0.5}px)`;
    }
    
    // Update particle positions
    this.particles.forEach((particle, index) => {
      const speed = (index + 1) * 0.1;
      particle.style.transform = `translateY(${this.scrollY * speed}px)`;
    });
  }

  // Setup intersection observer
  setupIntersectionObserver() {
    const options = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };
    
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.animateElement(entry.target);
        }
      });
    }, options);
    
    // Observe all cards
    document.querySelectorAll('.card').forEach(card => {
      this.observer.observe(card);
    });
  }

  // Animate element when it comes into view
  animateElement(element) {
    element.style.opacity = '0';
    element.style.transform = 'translateY(50px)';
    
    setTimeout(() => {
      element.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
      element.style.opacity = '1';
      element.style.transform = 'translateY(0)';
    }, 100);
  }

  // Setup morphing elements
  setupMorphingElements() {
    // Morph buttons on hover
    document.querySelectorAll('.btn').forEach(btn => {
      btn.addEventListener('mouseenter', () => {
        btn.style.borderRadius = '20px';
      });
      
      btn.addEventListener('mouseleave', () => {
        btn.style.borderRadius = '16px';
      });
    });
    
    // Morph cards on scroll
    this.setupScrollMorphing();
  }

  // Setup scroll morphing
  setupScrollMorphing() {
    window.addEventListener('scroll', () => {
      const scrollY = window.pageYOffset;
      const morphAmount = Math.min(scrollY / 500, 1);
      
      document.querySelectorAll('.card').forEach((card, index) => {
        const borderRadius = 24 - (morphAmount * 8);
        card.style.borderRadius = `${borderRadius}px`;
      });
    });
  }

  // Setup glass effects
  setupGlassEffects() {
    // Add glassmorphism to elements
    document.querySelectorAll('.card, .modal-content').forEach(element => {
      this.enhanceGlassEffect(element);
    });
  }

  // Enhance glass effect
  enhanceGlassEffect(element) {
    element.style.background = 'rgba(255, 255, 255, 0.05)';
    element.style.backdropFilter = 'blur(20px)';
    element.style.webkitBackdropFilter = 'blur(20px)';
    element.style.border = '1px solid rgba(255, 255, 255, 0.1)';
    element.style.boxShadow = '0 8px 32px 0 rgba(31, 38, 135, 0.37)';
  }

  // Setup micro interactions
  setupMicroInteractions() {
    // Input focus effects
    document.querySelectorAll('.input, .textarea, .select').forEach(input => {
      input.addEventListener('focus', () => {
        this.enhanceInputFocus(input);
      });
      
      input.addEventListener('blur', () => {
        this.removeInputFocus(input);
      });
    });
    
    // Button press effects
    document.querySelectorAll('.btn').forEach(btn => {
      btn.addEventListener('mousedown', () => {
        btn.style.transform = 'scale(0.95)';
      });
      
      btn.addEventListener('mouseup', () => {
        btn.style.transform = 'scale(1)';
      });
    });
  }

  // Enhance input focus
  enhanceInputFocus(input) {
    input.style.background = 'rgba(255, 255, 255, 0.08)';
    input.style.borderColor = '#667eea';
    input.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.2)';
  }

  // Remove input focus
  removeInputFocus(input) {
    input.style.background = 'rgba(255, 255, 255, 0.05)';
    input.style.borderColor = 'rgba(255, 255, 255, 0.1)';
    input.style.boxShadow = 'none';
  }

  // Setup advanced transitions
  setupAdvancedTransitions() {
    // Page transitions
    this.setupPageTransitions();
    
    // Modal transitions
    this.setupModalTransitions();
    
    // Form transitions
    this.setupFormTransitions();
  }

  // Setup page transitions
  setupPageTransitions() {
    // Intercept navigation
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href]');
      if (link && link.hostname === window.location.hostname) {
        e.preventDefault();
        this.navigateWithTransition(link.href);
      }
    });
  }

  // Navigate with transition
  navigateWithTransition(url) {
    document.body.style.opacity = '0';
    document.body.style.transform = 'scale(0.98)';
    
    setTimeout(() => {
      window.location.href = url;
    }, 300);
  }

  // Setup modal transitions
  setupModalTransitions() {
    document.querySelectorAll('.modal').forEach(modal => {
      modal.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    });
  }

  // Setup form transitions
  setupFormTransitions() {
    document.querySelectorAll('form').forEach(form => {
      form.addEventListener('submit', (e) => {
        this.handleFormSubmit(e);
      });
    });
  }

  // Handle form submit
  handleFormSubmit(event) {
    const form = event.currentTarget;
    const submitBtn = form.querySelector('button[type="submit"]');
    
    if (submitBtn) {
      submitBtn.classList.add('loading');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Processing...';
    }
  }

  // Setup performance optimizations
  setupPerformanceOptimizations() {
    // Debounce scroll events
    this.debounceScroll = this.debounce(() => {
      this.updateScrollEffects();
    }, 16);
    
    // Throttle mouse events
    this.throttleMouse = this.throttle(() => {
      this.updateParallax({ clientX: this.mousePosition.x, clientY: this.mousePosition.y });
    }, 16);
    
    // Lazy load images
    this.setupLazyLoading();
    
    // Optimize animations
    this.optimizeAnimations();
  }

  // Debounce function
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

  // Throttle function
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

  // Setup lazy loading
  setupLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.classList.add('fade-in');
          imageObserver.unobserve(img);
        }
      });
    });
    
    images.forEach(img => imageObserver.observe(img));
  }

  // Optimize animations
  optimizeAnimations() {
    // Reduce animations on low-end devices
    if (this.isLowEndDevice()) {
      document.body.classList.add('reduced-motion');
    }
    
    // Use CSS transforms instead of properties that trigger layout
    this.optimizeAnimationProperties();
  }

  // Check if low-end device
  isLowEndDevice() {
    return navigator.hardwareConcurrency <= 2 || navigator.deviceMemory <= 2;
  }

  // Optimize animation properties
  optimizeAnimationProperties() {
    const style = document.createElement('style');
    style.textContent = `
      .card, .btn {
        will-change: transform;
      }
      
      .card:hover, .btn:hover {
        transform: translate3d(0, -8px, 0) scale3d(1.02, 1.02, 1);
      }
    `;
    document.head.appendChild(style);
  }

  // Add glow effect
  addGlowEffect(element) {
    element.style.boxShadow = '0 0 30px rgba(102, 126, 234, 0.5), 0 20px 40px rgba(102, 126, 234, 0.3)';
  }

  // Remove glow effect
  removeGlowEffect(element) {
    element.style.boxShadow = '0 8px 32px rgba(31, 38, 135, 0.37)';
  }

  // Create ripple effect
  createRippleEffect(element, event) {
    const ripple = document.createElement('span');
    const rect = element.getBoundingClientRect();
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
    
    element.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 600);
  }

  // Setup loading animations
  setupLoadingAnimations() {
    // Add loading styles
    const style = document.createElement('style');
    style.textContent = `
      @keyframes ripple {
        to {
          transform: scale(4);
          opacity: 0;
        }
      }
      
      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-20px); }
      }
      
      .loading {
        position: relative;
        pointer-events: none;
        opacity: 0.7;
      }
      
      .loading::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 20px;
        height: 20px;
        margin: -10px 0 0 -10px;
        border: 2px solid transparent;
        border-top: 2px solid #667eea;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }
      
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  }

  // Start animation loop
  startAnimationLoop() {
    const animate = () => {
      if (!this.ticking) {
        this.rafId = requestAnimationFrame(animate);
        this.ticking = true;
        
        // Update animations
        this.updateAnimations();
        
        this.ticking = false;
      }
    };
    
    animate();
  }

  // Update animations
  updateAnimations() {
    // Update particle positions
    this.particles.forEach((particle, index) => {
      const time = Date.now() * 0.001;
      const speed = (index + 1) * 0.1;
      const x = Math.sin(time * speed) * 50;
      const y = Math.cos(time * speed) * 50;
      
      particle.style.transform = `translate(${x}px, ${y}px)`;
    });
  }

  // Public API methods
  addAnimation(element, animation) {
    this.animations.set(element, animation);
  }

  removeAnimation(element) {
    this.animations.delete(element);
  }

  destroy() {
    // Clean up
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
    
    // Remove observers
    if (this.observer) {
      this.observer.disconnect();
    }
    
    // Remove particles
    this.particles.forEach(particle => particle.remove());
    this.particles = [];
    
    // Remove particle container
    if (this.particleContainer) {
      this.particleContainer.remove();
    }
    
    this.isInitialized = false;
  }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.ultraPremium = new UltraPremiumAutomation();
});

// Export for global access
if (typeof module !== 'undefined' && module.exports) {
  module.exports = UltraPremiumAutomation;
}
