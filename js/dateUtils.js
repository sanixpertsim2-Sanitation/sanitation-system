// Date utilities for consistent timestamp handling
class DateUtils {
  /**
   * Get current ISO timestamp with proper timezone
   * @returns {string} ISO 8601 timestamp
   */
  static getCurrentTimestamp() {
    return new Date().toISOString();
  }

  /**
   * Ensure a timestamp is properly formatted
   * @param {Date|string|null} timestamp - Input timestamp
   * @returns {string|null} Formatted ISO timestamp or null
   */
  static formatTimestamp(timestamp) {
    if (!timestamp) return null;
    
    if (timestamp instanceof Date) {
      return timestamp.toISOString();
    }
    
    if (typeof timestamp === 'string') {
      const date = new Date(timestamp);
      return isNaN(date.getTime()) ? null : date.toISOString();
    }
    
    return null;
  }

  /**
   * Add timestamp to data object if missing
   * @param {Object} data - Data object to modify
   * @param {string} timestampField - Field name for timestamp (default: 'created_at')
   * @returns {Object} Modified data object
   */
  static ensureTimestamp(data, timestampField = 'created_at') {
    if (!data[timestampField]) {
      data[timestampField] = this.getCurrentTimestamp();
    } else {
      data[timestampField] = this.formatTimestamp(data[timestampField]);
    }
    return data;
  }

  /**
   * Add submission timestamp to data object
   * @param {Object} data - Data object to modify
   * @returns {Object} Modified data object
   */
  static addSubmissionTimestamp(data) {
    return this.ensureTimestamp(data, 'submitted_at');
  }

  /**
   * Add completion timestamp when status changes to completed
   * @param {Object} data - Data object to modify
   * @param {string} statusField - Field name for status
   * @param {string} timestampField - Field name for completion timestamp
   * @param {string} completedStatus - Status that triggers timestamp
   * @param {string} userField - Field name for user who completed
   * @param {string} currentUser - Current user identifier
   * @returns {Object} Modified data object
   */
  static addCompletionTimestamp(data, statusField = 'status', timestampField = 'completed_at', completedStatus = 'Completed', userField = 'completed_by', currentUser = null) {
    if (data[statusField] === completedStatus && !data[timestampField]) {
      data[timestampField] = this.getCurrentTimestamp();
      if (userField && currentUser) {
        data[userField] = currentUser;
      }
    }
    return data;
  }

  /**
   * Add handover timestamp when status changes to handover
   * @param {Object} data - Data object to modify
   * @returns {Object} Modified data object
   */
  static addHandoverTimestamp(data) {
    if (data.status === 'Handover' && !data.handover_at) {
      data.handover_at = this.getCurrentTimestamp();
    }
    return data;
  }

  /**
   * Prepare data for database insertion with all necessary timestamps
   * @param {Object} data - Raw data object
   * @param {string} dataType - Type of data ('preclean', 'postclean', 'damage', 'handover', 'release')
   * @param {string} currentUser - Current user identifier
   * @returns {Object} Data object with proper timestamps
   */
  static prepareForDatabase(data, dataType, currentUser = null) {
    switch (dataType) {
      case 'preclean':
        this.addSubmissionTimestamp(data);
        break;
      
      case 'postclean':
        this.addSubmissionTimestamp(data);
        break;
      
      case 'damage':
        this.ensureTimestamp(data, 'created_at');
        this.addCompletionTimestamp(data, 'status', 'completed_at', 'Completed', 'completed_by', currentUser);
        this.addHandoverTimestamp(data);
        break;
      
      case 'handover':
        this.ensureTimestamp(data, 'created_at');
        this.addCompletionTimestamp(data, 'status', 'completed_at', 'Completed', 'completed_by', currentUser);
        break;
      
      case 'release':
        this.ensureTimestamp(data, 'verified_at');
        break;
      
      default:
        this.ensureTimestamp(data);
        break;
    }
    
    return data;
  }

  /**
   * Validate timestamp format
   * @param {string} timestamp - Timestamp string to validate
   * @returns {boolean} True if valid ISO timestamp
   */
  static isValidTimestamp(timestamp) {
    if (!timestamp || typeof timestamp !== 'string') return false;
    
    const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;
    if (!isoRegex.test(timestamp)) return false;
    
    const date = new Date(timestamp);
    return !isNaN(date.getTime());
  }

  /**
   * Get human-readable date string
   * @param {string|Date} timestamp - Timestamp to format
   * @returns {string} Human-readable date
   */
  static formatForDisplay(timestamp) {
    const formatted = this.formatTimestamp(timestamp);
    if (!formatted) return 'N/A';
    
    return new Date(formatted).toLocaleString();
  }

  /**
   * Check if timestamp is recent (within last 24 hours)
   * @param {string|Date} timestamp - Timestamp to check
   * @returns {boolean} True if recent
   */
  static isRecent(timestamp) {
    const formatted = this.formatTimestamp(timestamp);
    if (!formatted) return false;
    
    const date = new Date(formatted);
    const now = new Date();
    const hoursDiff = (now - date) / (1000 * 60 * 60);
    
    return hoursDiff <= 24;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DateUtils };
}
