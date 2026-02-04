// Standardized error handling utilities
class ErrorHandler {
  static showError(message, error = null) {
    const errorMessage = error ? `${message}: ${error.message || error}` : message;
    console.error(errorMessage, error);
    alert(errorMessage);
  }

  static async withErrorHandling(asyncFn, errorMessage = "Operation failed") {
    try {
      return await asyncFn();
    } catch (error) {
      this.showError(errorMessage, error);
      throw error;
    }
  }

  static handleDatabaseError(error, operation) {
    const message = `Failed to ${operation}`;
    if (error.code) {
      console.error(`${message} (Code: ${error.code}):`, error);
    } else {
      console.error(`${message}:`, error);
    }
    console.error("Full error details:", error);
    alert(`${message}: ${error.message || "Unknown error"}`);
  }
}

// Standardized success messages
class SuccessHandler {
  static showSuccess(message) {
    console.log("Success:", message);
    alert(message);
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ErrorHandler, SuccessHandler };
}
