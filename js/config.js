/**
 * Sanixpert Configuration
 * Environment-specific settings for the Sanixpert system
 */

window.SANIXPERT_CONFIG = {
    // Security settings
    ADMIN_PIN: process?.env?.SANIXPERT_ADMIN_PIN || '2451', // Override in production
    
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
    DEVELOPMENT: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
};
