/**
 * Sanixpert Configuration
 * Environment-specific settings for the Sanixpert system
 */

window.SANIXPERT_CONFIG = {
    // Security settings - MUST be configured in production
    ADMIN_PIN: process?.env?.SANIXPERT_ADMIN_PIN || null, // Required for production
    
    // Face detection settings
    FACE_DETECTION_THRESHOLD: 0.6,
    FACE_DETECTION_TIMEOUT: 30000, // 30 seconds
    
    // Camera settings
    CAMERA_TIMEOUT: 10000, // 10 seconds
    PHOTO_QUALITY: 0.9,
    
    // Storage settings
    STORAGE_BUCKET: 'sanitation-photos',
    CACHE_DURATION: 3600, // 1 hour
    
    // UI settings
    ANIMATION_DURATION: 300,
    NOTIFICATION_DURATION: 3000,
    
    // Development mode
    DEVELOPMENT: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',
    
    // Security validation
    validateConfig: function() {
        if (!this.DEVELOPMENT && !this.ADMIN_PIN) {
            throw new Error('SANIXPERT_ADMIN_PIN environment variable must be set in production');
        }
        return true;
    }
};

// Validate configuration on load
try {
    window.SANIXPERT_CONFIG.validateConfig();
} catch (error) {
    console.error('Configuration error:', error.message);
    // In development, show a warning but continue
    if (window.SANIXPERT_CONFIG.DEVELOPMENT) {
        console.warn('Running in development mode without PIN - configure SANIXPERT_ADMIN_PIN for production');
        // Set a development PIN for testing
        window.SANIXPERT_CONFIG.ADMIN_PIN = '2451';
    } else {
        // In production, we cannot continue without proper configuration
        document.body.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; height: 100vh; font-family: Arial, sans-serif;">
                <div style="text-align: center; padding: 40px; background: #f8f9fa; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    <h2 style="color: #dc3545; margin-bottom: 16px;">⚠️ Configuration Error</h2>
                    <p style="color: #6c757d; margin-bottom: 20px;">System not properly configured for production deployment.</p>
                    <p style="color: #495057; font-size: 14px;">Please contact administrator to set up required environment variables.</p>
                </div>
            </div>
        `;
    }
}
