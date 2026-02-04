// Shared constants for image validation
// Used across multiple utilities to avoid duplication
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE };
}
