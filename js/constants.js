// Shared constants for image validation
// Used across multiple utilities to avoid duplication
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Application constants
const APP_CONSTANTS = {
  AREAS: {
    MACY_DECORATION: "MACY_DECORATION"
  },
  TIMING: {
    DATE_TIME_UPDATE_INTERVAL: 1000,
    VALIDATION_DEBOUNCE_DELAY: 500,
    MODAL_AUTO_REMOVE_TIMEOUT: 10000
  },
  LIMITS: {
    MAX_TIMING_ENTRIES_PER_KEY: 100,
    MAX_HANDOVER_TASKS: 5
  },
  VALIDATION: {
    REQUIRED_SELECT_VALUES: ['Acceptable', 'Not Acceptable', 'N/A'],
    PHOTO_REQUIRED_VALUES: ['Not Acceptable', 'N/A'],
    COMMENT_REQUIRED_VALUES: ['Not Acceptable', 'N/A']
  },
  MESSAGES: {
    FACE_VERIFICATION_REQUIRED: "Face verification required.",
    EQUIPMENT_RETRIEVED_REQUIRED: "Enter equipment retrieved",
    HANDOVER_OPTION_REQUIRED: "Select handover option",
    HANDOVER_TASKS_REQUIRED: "Handover tasks required before submission.",
    DAMAGES_ACKNOWLEDGEMENT_REQUIRED: "All damages must be acknowledged",
    POST_CLEAN_SUBMISSION_SUCCESS: "✅ Post-cleaning submitted successfully",
    SUPABASE_CLIENT_NOT_LOADED: "Supabase client not loaded."
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE };
}
