/*
 * SANIXPERT MOBILE ANALYTICS
 * Comprehensive tracking, reporting, and insights system
 * Performance monitoring, user behavior analysis, and business intelligence
 */

class MobileAnalytics {
  constructor() {
    this.isInitialized = false;
    this.events = [];
    this.performance = {};
    this.userBehavior = {};
    this.sessionData = {};
    this.config = {
      enableTracking: true,
      enablePerformance: true,
      enableUserBehavior: true,
      batchSize: 50,
      flushInterval: 30000, // 30 seconds
      apiEndpoint: '/api/analytics',
      maxRetries: 3
    };
    
    this.init();
  }

  // ========================================
  // INITIALIZATION
  // ========================================
  init() {
    if (this.isInitialized || !this.config.enableTracking) return;
    
    // Wait for DOM
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      this.setup();
    }
  }

  setup() {
    console.log('📊 Mobile Analytics Initializing...');
    
    // Initialize session
    this.initializeSession();
    
    // Setup tracking
    this.setupPageTracking();
    this.setupPerformanceTracking();
    this.setupUserBehaviorTracking();
    this.setupErrorTracking();
    this.setupFeatureTracking();
    
    // Start data collection
    this.startDataCollection();
    
    this.isInitialized = true;
    console.log('✅ Mobile Analytics Ready');
  }

  // ========================================
  // SESSION MANAGEMENT
  // ========================================
  initializeSession() {
    const sessionId = this.generateSessionId();
    const userId = this.getUserId();
    
    this.sessionData = {
      sessionId: sessionId,
      userId: userId,
      startTime: Date.now(),
      startUrl: window.location.href,
      userAgent: navigator.userAgent,
      referrer: document.referrer,
      screen: {
        width: screen.width,
        height: screen.height,
        colorDepth: screen.colorDepth
      },
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      device: this.getDeviceInfo(),
      network: this.getNetworkInfo(),
      location: this.getLocationInfo()
    };
    
    // Track session start
    this.trackEvent('session_start', this.sessionData);
  }

  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  getUserId() {
    // Get user ID from localStorage or generate new one
    let userId = localStorage.getItem('analytics_user_id');
    if (!userId) {
      userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('analytics_user_id', userId);
    }
    return userId;
  }

  getDeviceInfo() {
    const ua = navigator.userAgent;
    
    return {
      type: this.getDeviceType(),
      os: this.getOperatingSystem(),
      browser: this.getBrowser(),
      isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua),
      isTablet: /iPad|Android/i.test(ua) && window.innerWidth >= 768
    };
  }

  getDeviceType() {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  getOperatingSystem() {
    const ua = navigator.userAgent;
    if (/Windows/i.test(ua)) return 'Windows';
    if (/Mac/i.test(ua)) return 'macOS';
    if (/Linux/i.test(ua)) return 'Linux';
    if (/Android/i.test(ua)) return 'Android';
    if (/iOS|iPhone|iPad|iPod/i.test(ua)) return 'iOS';
    return 'Unknown';
  }

  getBrowser() {
    const ua = navigator.userAgent;
    if (/Chrome/i.test(ua)) return 'Chrome';
    if (/Firefox/i.test(ua)) return 'Firefox';
    if (/Safari/i.test(ua)) return 'Safari';
    if (/Edge/i.test(ua)) return 'Edge';
    return 'Unknown';
  }

  getNetworkInfo() {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    
    if (connection) {
      return {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
        saveData: connection.saveData
      };
    }
    
    return { effectiveType: 'unknown' };
  }

  getLocationInfo() {
    return {
      url: window.location.href,
      path: window.location.pathname,
      search: window.location.search,
      hash: window.location.hash,
      origin: window.location.origin
    };
  }

  // ========================================
  // PAGE TRACKING
  // ========================================
  setupPageTracking() {
    // Track page view
    this.trackPageView();
    
    // Track page changes (SPA)
    this.trackPageChanges();
    
    // Track scroll depth
    this.trackScrollDepth();
    
    // Track time on page
    this.trackTimeOnPage();
  }

  trackPageView() {
    const pageData = {
      url: window.location.href,
      title: document.title,
      timestamp: Date.now(),
      referrer: document.referrer
    };
    
    this.trackEvent('page_view', pageData);
  }

  trackPageChanges() {
    // Track hash changes
    window.addEventListener('hashchange', () => {
      this.trackPageView();
    });
    
    // Track pushState/popstate
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    
    history.pushState = function(...args) {
      originalPushState.apply(this, args);
      window.dispatchEvent(new Event('pushstate'));
    };
    
    history.replaceState = function(...args) {
      originalReplaceState.apply(this, args);
      window.dispatchEvent(new Event('replacestate'));
    };
    
    window.addEventListener('pushstate', () => this.trackPageView());
    window.addEventListener('replacestate', () => this.trackPageView());
    window.addEventListener('popstate', () => this.trackPageView());
  }

  trackScrollDepth() {
    let maxScroll = 0;
    const scrollThresholds = [25, 50, 75, 90, 100];
    const trackedThresholds = new Set();
    
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = Math.round((window.scrollY / scrollHeight) * 100);
      
      maxScroll = Math.max(maxScroll, scrollPercent);
      
      // Track milestones
      scrollThresholds.forEach(threshold => {
        if (scrollPercent >= threshold && !trackedThresholds.has(threshold)) {
          trackedThresholds.add(threshold);
          this.trackEvent('scroll_depth', {
            threshold: threshold,
            percent: scrollPercent,
            maxScroll: maxScroll
          });
        }
      });
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
  }

  trackTimeOnPage() {
    let startTime = Date.now();
    let lastActiveTime = startTime;
    
    // Track page visibility
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        const timeOnPage = Date.now() - lastActiveTime;
        this.trackEvent('time_on_page', {
          duration: timeOnPage,
          visible: false
        });
      } else {
        lastActiveTime = Date.now();
      }
    });
    
    // Track page unload
    window.addEventListener('beforeunload', () => {
      const totalTime = Date.now() - startTime;
      this.trackEvent('time_on_page', {
        duration: totalTime,
        visible: !document.hidden
      });
    });
  }

  // ========================================
  // PERFORMANCE TRACKING
  // ========================================
  setupPerformanceTracking() {
    if (!this.config.enablePerformance) return;
    
    // Track Core Web Vitals
    this.trackCoreWebVitals();
    
    // Track resource loading
    this.trackResourceLoading();
    
    // Track memory usage
    this.trackMemoryUsage();
    
    // Track network performance
    this.trackNetworkPerformance();
  }

  trackCoreWebVitals() {
    // Largest Contentful Paint (LCP)
    this.trackLCP();
    
    // First Input Delay (FID)
    this.trackFID();
    
    // Cumulative Layout Shift (CLS)
    this.trackCLS();
    
    // Time to Interactive (TTI)
    this.trackTTI();
  }

  trackLCP() {
    if (!('PerformanceObserver' in window)) return;
    
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      
      this.trackEvent('performance_lcp', {
        value: lastEntry.startTime,
        url: lastEntry.url,
        timestamp: Date.now()
      });
    });
    
    observer.observe({ entryTypes: ['largest-contentful-paint'] });
  }

  trackFID() {
    if (!('PerformanceObserver' in window)) return;
    
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        if (entry.name === 'first-input') {
          this.trackEvent('performance_fid', {
            value: entry.processingStart - entry.startTime,
            timestamp: Date.now()
          });
        }
      });
    });
    
    observer.observe({ entryTypes: ['first-input'] });
  }

  trackCLS() {
    if (!('PerformanceObserver' in window)) return;
    
    let clsValue = 0;
    
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach(entry => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
      
      this.trackEvent('performance_cls', {
        value: clsValue,
        timestamp: Date.now()
      });
    });
    
    observer.observe({ entryTypes: ['layout-shift'] });
  }

  trackTTI() {
    // Simple TTI approximation
    window.addEventListener('load', () => {
      setTimeout(() => {
        const tti = performance.now();
        this.trackEvent('performance_tti', {
          value: tti,
          timestamp: Date.now()
        });
      }, 5000);
    });
  }

  trackResourceLoading() {
    if (!('PerformanceObserver' in window)) return;
    
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach(entry => {
        if (entry.entryType === 'resource') {
          this.trackEvent('resource_loading', {
            name: entry.name,
            type: entry.initiatorType,
            duration: entry.duration,
            size: entry.transferSize,
            timestamp: Date.now()
          });
        }
      });
    });
    
    observer.observe({ entryTypes: ['resource'] });
  }

  trackMemoryUsage() {
    if (!performance.memory) return;
    
    const trackMemory = () => {
      this.trackEvent('memory_usage', {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit,
        timestamp: Date.now()
      });
    };
    
    // Track memory every 30 seconds
    setInterval(trackMemory, 30000);
    trackMemory(); // Initial track
  }

  trackNetworkPerformance() {
    // Track navigation timing
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0];
      
      if (navigation) {
        this.trackEvent('navigation_timing', {
          dns: navigation.domainLookupEnd - navigation.domainLookupStart,
          tcp: navigation.connectEnd - navigation.connectStart,
          ssl: navigation.secureConnectionStart > 0 ? navigation.connectEnd - navigation.secureConnectionStart : 0,
          ttfb: navigation.responseStart - navigation.requestStart,
          download: navigation.responseEnd - navigation.responseStart,
          domParse: navigation.domContentLoadedEventStart - navigation.responseEnd,
          total: navigation.loadEventEnd - navigation.navigationStart,
          timestamp: Date.now()
        });
      }
    });
  }

  // ========================================
  // USER BEHAVIOR TRACKING
  // ========================================
  setupUserBehaviorTracking() {
    if (!this.config.enableUserBehavior) return;
    
    // Track clicks
    this.trackClicks();
    
    // Track form interactions
    this.trackFormInteractions();
    
    // Track search behavior
    this.trackSearchBehavior();
    
    // Track feature usage
    this.trackFeatureUsage();
  }

  trackClicks() {
    document.addEventListener('click', (e) => {
      const target = e.target;
      const elementData = this.getElementData(target);
      
      this.trackEvent('click', {
        ...elementData,
        x: e.clientX,
        y: e.clientY,
        timestamp: Date.now()
      });
    });
  }

  trackFormInteractions() {
    // Track form starts
    document.addEventListener('focus', (e) => {
      if (e.target.matches('input, textarea, select')) {
        const form = e.target.form;
        if (form && !form.dataset.analyticsTracked) {
          form.dataset.analyticsTracked = 'true';
          
          this.trackEvent('form_start', {
            formId: form.id || 'unknown',
            formName: form.name || 'unknown',
            inputType: e.target.type,
            timestamp: Date.now()
          });
        }
      }
    }, true);
    
    // Track form submissions
    document.addEventListener('submit', (e) => {
      const form = e.target;
      
      this.trackEvent('form_submit', {
        formId: form.id || 'unknown',
        formName: form.name || 'unknown',
        timestamp: Date.now()
      });
    });
  }

  trackSearchBehavior() {
    // Track search queries
    const searchInputs = document.querySelectorAll('input[type="search"], input[placeholder*="search"]');
    
    searchInputs.forEach(input => {
      let searchTimeout;
      
      input.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
          const query = input.value.trim();
          if (query.length > 2) {
            this.trackEvent('search', {
              query: query,
              timestamp: Date.now()
            });
          }
        }, 1000);
      });
    });
  }

  trackFeatureUsage() {
    // Track specific feature usage
    const featureSelectors = {
      'photo_capture': 'input[type="file"][accept*="image"]',
      'camera_access': 'input[capture="camera"]',
      'geolocation': '[data-geolocation]',
      'offline_mode': '[data-offline]',
      'dark_mode': '[data-theme="dark"]',
      'language_change': '[data-language]',
      'export_data': '[data-export]',
      'print': '[data-print]',
      'share': '[data-share]'
    };
    
    Object.entries(featureSelectors).forEach(([feature, selector]) => {
      const elements = document.querySelectorAll(selector);
      
      elements.forEach(element => {
        element.addEventListener('click', () => {
          this.trackEvent('feature_usage', {
            feature: feature,
            timestamp: Date.now()
          });
        });
      });
    });
  }

  // ========================================
  // ERROR TRACKING
  // ========================================
  setupErrorTracking() {
    // Track JavaScript errors
    window.addEventListener('error', (e) => {
      this.trackEvent('javascript_error', {
        message: e.message,
        filename: e.filename,
        lineno: e.lineno,
        colno: e.colno,
        stack: e.error?.stack,
        timestamp: Date.now()
      });
    });
    
    // Track unhandled promise rejections
    window.addEventListener('unhandledrejection', (e) => {
      this.trackEvent('promise_rejection', {
        reason: e.reason?.toString(),
        timestamp: Date.now()
      });
    });
    
    // Track resource errors
    window.addEventListener('error', (e) => {
      if (e.target !== window) {
        this.trackEvent('resource_error', {
          element: e.target.tagName,
          source: e.target.src || e.target.href,
          type: e.target.tagName.toLowerCase(),
          timestamp: Date.now()
        });
      }
    }, true);
  }

  // ========================================
  // FEATURE TRACKING
  // ========================================
  setupFeatureTracking() {
    // Track A/B tests
    this.trackABTests();
    
    // Track feature flags
    this.trackFeatureFlags();
    
    // Track experiments
    this.trackExperiments();
  }

  trackABTests() {
    // Check for A/B test variants
    const variants = document.querySelectorAll('[data-ab-test]');
    
    variants.forEach(element => {
      const testName = element.dataset.abTest;
      const variant = element.dataset.variant || 'control';
      
      this.trackEvent('ab_test', {
        test: testName,
        variant: variant,
        timestamp: Date.now()
      });
    });
  }

  trackFeatureFlags() {
    // Check for feature flags
    const flags = document.querySelectorAll('[data-feature-flag]');
    
    flags.forEach(element => {
      const flag = element.dataset.featureFlag;
      const enabled = element.dataset.enabled !== 'false';
      
      this.trackEvent('feature_flag', {
        flag: flag,
        enabled: enabled,
        timestamp: Date.now()
      });
    });
  }

  trackExperiments() {
    // Check for experiments
    const experiments = document.querySelectorAll('[data-experiment]');
    
    experiments.forEach(element => {
      const experiment = element.dataset.experiment;
      const variant = element.dataset.variant || 'control';
      
      this.trackEvent('experiment', {
        experiment: experiment,
        variant: variant,
        timestamp: Date.now()
      });
    });
  }

  // ========================================
  // DATA COLLECTION & FLUSHING
  // ========================================
  startDataCollection() {
    // Flush events periodically
    setInterval(() => {
      this.flushEvents();
    }, this.config.flushInterval);
    
    // Flush events on page unload
    window.addEventListener('beforeunload', () => {
      this.flushEvents(true);
    });
    
    // Flush events when visibility changes (user leaves page)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.flushEvents(true);
      }
    });
  }

  // ========================================
  // PUBLIC API
  // ========================================
  
  // Track custom event
  trackEvent(eventName, data = {}) {
    if (!this.config.enableTracking) return;
    
    const event = {
      eventName: eventName,
      data: data,
      timestamp: Date.now(),
      sessionId: this.sessionData.sessionId,
      userId: this.sessionData.userId,
      url: window.location.href
    };
    
    this.events.push(event);
    
    // Flush if batch size reached
    if (this.events.length >= this.config.batchSize) {
      this.flushEvents();
    }
  }

  // Track user action
  trackUserAction(action, details = {}) {
    this.trackEvent('user_action', {
      action: action,
      ...details
    });
  }

  // Track conversion
  trackConversion(conversionType, value = 0, details = {}) {
    this.trackEvent('conversion', {
      type: conversionType,
      value: value,
      ...details
    });
  }

  // Track custom metric
  trackMetric(metricName, value, details = {}) {
    this.trackEvent('custom_metric', {
      metric: metricName,
      value: value,
      ...details
    });
  }

  // ========================================
  // UTILITY METHODS
  // ========================================
  
  getElementData(element) {
    return {
      tagName: element.tagName,
      id: element.id,
      className: element.className,
      textContent: element.textContent?.substring(0, 100),
      href: element.href,
      type: element.type,
      name: element.name,
      value: element.value,
      dataset: { ...element.dataset }
    };
  }

  // Flush events to server
  async flushEvents(isSync = false) {
    if (this.events.length === 0) return;
    
    const eventsToSend = [...this.events];
    this.events = [];
    
    try {
      await this.sendEvents(eventsToSend, isSync);
    } catch (error) {
      console.error('Analytics flush error:', error);
      // Re-add events if failed
      this.events.unshift(...eventsToSend);
    }
  }

  async sendEvents(events, isSync) {
    const payload = {
      events: events,
      session: this.sessionData,
      timestamp: Date.now()
    };
    
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    };
    
    if (isSync) {
      // Use sendBeacon for synchronous requests
      if (navigator.sendBeacon) {
        navigator.sendBeacon(this.config.apiEndpoint, JSON.stringify(payload));
      } else {
        // Fallback to sync XHR
        const xhr = new XMLHttpRequest();
        xhr.open('POST', this.config.apiEndpoint, false);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify(payload));
      }
    } else {
      // Async request
      const response = await fetch(this.config.apiEndpoint, options);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    }
  }

  // Get analytics data
  getAnalyticsData() {
    return {
      events: [...this.events],
      session: this.sessionData,
      performance: this.performance,
      userBehavior: this.userBehavior
    };
  }

  // Clear analytics data
  clearAnalyticsData() {
    this.events = [];
    this.performance = {};
    this.userBehavior = {};
  }

  // Enable/disable tracking
  setTracking(enabled) {
    this.config.enableTracking = enabled;
    
    if (!enabled) {
      this.clearAnalyticsData();
    }
  }
}

// ========================================
// GLOBAL INITIALIZATION
// ========================================
window.MobileAnalytics = MobileAnalytics;

// Auto-initialize
window.mobileAnalytics = new MobileAnalytics();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MobileAnalytics };
}
