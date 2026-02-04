/*
 * SANIXPERT PWA REGISTRATION
 * Progressive Web App registration and management
 */

class PWARegistration {
  constructor() {
    this.swRegistration = null;
    this.isInstalled = false;
    this.deferredPrompt = null;
    this.init();
  }

  // ========================================
  // INITIALIZATION
  // ========================================
  init() {
    // Wait for DOM
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      this.setup();
    }
  }

  setup() {
    console.log('🚀 PWA Registration Initializing...');
    
    // Register service worker
    this.registerServiceWorker();
    
    // Setup install prompt
    this.setupInstallPrompt();
    
    // Setup app shortcuts
    this.setupAppShortcuts();
    
    // Setup share handling
    this.setupShareHandling();
    
    // Setup background sync
    this.setupBackgroundSync();
    
    console.log('✅ PWA Registration Ready');
  }

  // ========================================
  // SERVICE WORKER REGISTRATION
  // ========================================
  async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/service-worker.js', {
          scope: '/'
        });
        
        console.log('✅ Service Worker registered:', registration.scope);
        this.swRegistration = registration;
        
        // Listen for updates
        registration.addEventListener('updatefound', () => {
          this.handleServiceWorkerUpdate(registration);
        });
        
        // Listen for controller change
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          console.log('🔄 Service Worker controller changed');
          window.location.reload();
        });
        
        // Check for existing updates
        this.checkForUpdates();
        
      } catch (error) {
        console.error('❌ Service Worker registration failed:', error);
      }
    } else {
      console.warn('⚠️ Service Workers not supported');
    }
  }

  handleServiceWorkerUpdate(registration) {
    const newWorker = registration.installing;
    
    newWorker.addEventListener('statechange', () => {
      if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
        // New version available
        this.showUpdateNotification();
      }
    });
  }

  showUpdateNotification() {
    if (window.mobileNext) {
      mobileNext.confirm(
        'App Update Available',
        'A new version of Sanixpert is available. Would you like to update now?',
        () => {
          if (this.swRegistration) {
            this.swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
          }
        }
      );
    }
  }

  async checkForUpdates() {
    if (this.swRegistration) {
      try {
        await this.swRegistration.update();
        console.log('🔄 Checked for service worker updates');
      } catch (error) {
        console.error('❌ Failed to check for updates:', error);
      }
    }
  }

  // ========================================
  // INSTALL PROMPT
  // ========================================
  setupInstallPrompt() {
    // Listen for beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      console.log('📱 Install prompt available');
      e.preventDefault();
      this.deferredPrompt = e;
      this.showInstallButton();
    });

    // Listen for app installed event
    window.addEventListener('appinstalled', () => {
      console.log('✅ App installed successfully');
      this.isInstalled = true;
      this.hideInstallButton();
      this.trackInstallation();
    });
  }

  showInstallButton() {
    // Create install button if it doesn't exist
    let installBtn = document.getElementById('install-app-btn');
    
    if (!installBtn) {
      installBtn = document.createElement('button');
      installBtn.id = 'install-app-btn';
      installBtn.className = 'fab-enhanced';
      installBtn.innerHTML = '📱';
      installBtn.title = 'Install App';
      installBtn.style.cssText = `
        position: fixed;
        bottom: 180px;
        right: 20px;
        z-index: 996;
      `;
      
      installBtn.addEventListener('click', () => this.promptInstall());
      document.body.appendChild(installBtn);
    }
    
    // Show button with animation
    setTimeout(() => {
      installBtn.style.animation = 'scaleIn 0.3s ease';
    }, 1000);
  }

  hideInstallButton() {
    const installBtn = document.getElementById('install-app-btn');
    if (installBtn) {
      installBtn.style.animation = 'fadeOut 0.3s ease';
      setTimeout(() => installBtn.remove(), 300);
    }
  }

  async promptInstall() {
    if (!this.deferredPrompt) {
      console.log('⚠️ Install prompt not available');
      return;
    }

    try {
      // Show the install prompt
      const result = await this.deferredPrompt.prompt();
      
      console.log('📱 Install prompt result:', result);
      
      // Clear the deferred prompt
      this.deferredPrompt = null;
      
      // Hide install button
      this.hideInstallButton();
      
      // Track installation attempt
      this.trackInstallAttempt(result);
      
    } catch (error) {
      console.error('❌ Install prompt failed:', error);
    }
  }

  trackInstallAttempt(result) {
    if (window.mobileAnalytics) {
      mobileAnalytics.trackEvent('pwa_install_attempt', {
        outcome: result.outcome,
        platform: navigator.platform,
        userAgent: navigator.userAgent
      });
    }
  }

  trackInstallation() {
    if (window.mobileAnalytics) {
      mobileAnalytics.trackEvent('pwa_installed', {
        platform: navigator.platform,
        userAgent: navigator.userAgent,
        installSource: 'prompt'
      });
    }
  }

  // ========================================
  // APP SHORTCUTS
  // ========================================
  setupAppShortcuts() {
    // Check if shortcuts are supported
    if ('navigator' in window && 'mediaSession' in navigator) {
      this.setupMediaSession();
    }
    
    // Add custom shortcuts
    this.addCustomShortcuts();
  }

  setupMediaSession() {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: 'Sanixpert',
        artist: 'Sanitation Management',
        album: 'Mobile App',
        artwork: [
          { src: '/icons/icon-96x96.png', sizes: '96x96', type: 'image/png' },
          { src: '/icons/icon-128x128.png', sizes: '128x128', type: 'image/png' },
          { src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' }
        ]
      });
    }
  }

  addCustomShortcuts() {
    // Add quick action shortcuts
    if (window.mobileNext) {
      // Add shortcut handlers
      window.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + K for quick search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
          e.preventDefault();
          this.openQuickSearch();
        }
        
        // Ctrl/Cmd + D for dashboard
        if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
          e.preventDefault();
          window.location.href = '/dashboard-next.html';
        }
      });
    }
  }

  openQuickSearch() {
    // Implement quick search functionality
    console.log('🔍 Quick search opened');
  }

  // ========================================
  // SHARE HANDLING
  // ========================================
  setupShareHandling() {
    // Check if Web Share API is supported
    if (navigator.share) {
      this.setupWebShare();
    }
    
    // Handle share targets
    this.handleShareTarget();
  }

  setupWebShare() {
    // Add share buttons to relevant pages
    const shareButtons = document.querySelectorAll('[data-share]');
    
    shareButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        this.shareContent(button.dataset);
      });
    });
  }

  async shareContent(data) {
    try {
      const shareData = {
        title: data.title || 'Sanixpert',
        text: data.text || 'Check out this sanitation report',
        url: data.url || window.location.href
      };

      if (data.files && data.files.length > 0) {
        shareData.files = data.files;
      }

      await navigator.share(shareData);
      
      console.log('✅ Content shared successfully');
      
      if (window.mobileAnalytics) {
        mobileAnalytics.trackEvent('content_shared', shareData);
      }
      
    } catch (error) {
      console.error('❌ Share failed:', error);
      
      // Fallback to copying to clipboard
      this.copyToClipboard(window.location.href);
    }
  }

  async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      
      if (window.mobileNext) {
        mobileNext.showToast('Link copied to clipboard', 'success');
      }
      
    } catch (error) {
      console.error('❌ Clipboard copy failed:', error);
    }
  }

  handleShareTarget() {
    // Handle incoming share data
    const urlParams = new URLSearchParams(window.location.search);
    
    if (urlParams.has('shared-title') || urlParams.has('shared-text')) {
      const sharedData = {
        title: urlParams.get('shared-title'),
        text: urlParams.get('shared-text'),
        url: urlParams.get('shared-url')
      };
      
      this.processSharedContent(sharedData);
    }
  }

  processSharedContent(data) {
    console.log('📤 Processing shared content:', data);
    
    // Handle shared content (e.g., pre-fill form with shared data)
    if (window.mobileNext) {
      mobileNext.showToast('Shared content processed', 'success');
    }
  }

  // ========================================
  // BACKGROUND SYNC
  // ========================================
  setupBackgroundSync() {
    // Register for background sync if supported
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      this.registerBackgroundSync();
    }
    
    // Register for periodic background sync if supported
    if ('serviceWorker' in navigator && 'PeriodicSyncManager' in window) {
      this.registerPeriodicSync();
    }
  }

  async registerBackgroundSync() {
    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Register for background sync
      await registration.sync.register('background-sync');
      
      console.log('✅ Background sync registered');
      
    } catch (error) {
      console.error('❌ Background sync registration failed:', error);
    }
  }

  async registerPeriodicSync() {
    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Register for periodic sync (every hour)
      await registration.periodicSync.register('sync-data', {
        minInterval: 60 * 60 * 1000 // 1 hour
      });
      
      console.log('✅ Periodic sync registered');
      
    } catch (error) {
      console.error('❌ Periodic sync registration failed:', error);
    }
  }

  // ========================================
  // NOTIFICATION PERMISSION
  // ========================================
  async requestNotificationPermission() {
    if ('Notification' in window) {
      try {
        const permission = await Notification.requestPermission();
        
        if (permission === 'granted') {
          console.log('✅ Notification permission granted');
          return true;
        } else {
          console.log('⚠️ Notification permission denied');
          return false;
        }
        
      } catch (error) {
        console.error('❌ Notification permission request failed:', error);
        return false;
      }
    } else {
      console.warn('⚠️ Notifications not supported');
      return false;
    }
  }

  // ========================================
  // OFFLINE STATUS
  // ========================================
  setupOfflineStatus() {
    // Monitor online/offline status
    window.addEventListener('online', () => {
      console.log('🌐 Connection restored');
      this.showOnlineStatus();
      
      // Trigger background sync
      if (this.swRegistration) {
        this.swRegistration.sync.register('background-sync');
      }
    });
    
    window.addEventListener('offline', () => {
      console.log('📱 Connection lost');
      this.showOfflineStatus();
    });
  }

  showOnlineStatus() {
    if (window.mobileNext) {
      mobileNext.showToast('Connection restored', 'success');
    }
    
    // Update UI
    const statusElement = document.getElementById('connection-status');
    if (statusElement) {
      statusElement.textContent = 'Online';
      statusElement.className = 'status-enhanced status-completed-enhanced';
    }
  }

  showOfflineStatus() {
    if (window.mobileNext) {
      mobileNext.showToast('Working offline', 'info');
    }
    
    // Update UI
    const statusElement = document.getElementById('connection-status');
    if (statusElement) {
      statusElement.textContent = 'Offline';
      statusElement.className = 'status-enhanced status-pending-enhanced';
    }
  }

  // ========================================
  // UTILITY METHODS
  // ========================================
  
  // Check if app is installed
  isAppInstalled() {
    return this.isInstalled || window.matchMedia('(display-mode: standalone)').matches;
  }

  // Get app version
  getAppVersion() {
    return navigator.serviceWorker?.controller?.scriptURL?.includes('v1.0.0') ? '1.0.0' : 'unknown';
  }

  // Get device info
  getDeviceInfo() {
    return {
      isPWA: this.isAppInstalled(),
      isOnline: navigator.onLine,
      platform: navigator.platform,
      userAgent: navigator.userAgent,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      doNotTrack: navigator.doNotTrack
    };
  }

  // Enable/disable features based on capabilities
  enableFeatures() {
    const features = {
      serviceWorker: 'serviceWorker' in navigator,
      notifications: 'Notification' in window,
      share: 'share' in navigator,
      clipboard: 'clipboard' in navigator,
      camera: 'mediaDevices' in navigator,
      geolocation: 'geolocation' in navigator,
      backgroundSync: 'SyncManager' in window,
      periodicSync: 'PeriodicSyncManager' in window
    };
    
    console.log('🔧 Available features:', features);
    return features;
  }
}

// ========================================
// GLOBAL INITIALIZATION
// ========================================
window.PWARegistration = PWARegistration;

// Auto-initialize
window.pwaRegistration = new PWARegistration();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PWARegistration };
}
