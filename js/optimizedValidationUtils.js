// Optimized validation utilities with performance improvements
class OptimizedValidationUtils {
  static debounceTimer = null;
  static DEBOUNCE_DELAY = 500;
  static MODAL_TIMEOUT = 10000;
  static cachedSubmitButton = null;
  static cachedEquipmentInput = null;
  static lastValidationResult = null;
  static validationInProgress = false;
  
  // Performance metrics
  static validationCount = 0;
  static cacheHits = 0;

  /**
   * Initialize with DOM element caching
   */
  static initialize() {
    this.cachedSubmitButton = PerformanceOptimizer.getElement("button[onclick='submitPostClean()']");
    this.cachedEquipmentInput = PerformanceOptimizer.getElement("equipment-retrieved");
    
    if (this.cachedEquipmentInput) {
      // Use optimized debounce with caching
      const debouncedValidation = PerformanceOptimizer.debounce(
        () => this.performValidation(),
        this.DEBOUNCE_DELAY,
        'equipment-validation'
      );
      
      this.cachedEquipmentInput.addEventListener('input', debouncedValidation);
    }
  }

  /**
   * Optimized equipment validation with caching
   */
  static async validateEquipmentMatching(area) {
    // Prevent concurrent validations
    if (this.validationInProgress) {
      return this.lastValidationResult || { valid: false, error: "Validation in progress" };
    }

    this.validationInProgress = true;
    this.validationCount++;

    try {
      const cacheKey = `equipment-validation-${area}`;
      
      return await PerformanceOptimizer.cachedDbQuery(
        cacheKey,
        () => this.performEquipmentValidation(area),
        10000 // 10 second cache for validation
      );
    } finally {
      this.validationInProgress = false;
    }
  }

  /**
   * Core validation logic
   */
  static async performEquipmentValidation(area) {
    const supabase = window.supabaseClient;
    if (!supabase) return { valid: false, error: "Database not available" };
    
    try {
      // Batch database queries for efficiency
      const [preCleanResult] = await Promise.all([
        supabase
          .from("pre_cleaning_logs")
          .select("*")
          .eq("area", area)
          .order("submitted_at", { ascending: false })
          .limit(1)
      ]);
      
      const { data: preCleanData, error: preCleanError } = preCleanResult;
      
      if (preCleanError) throw preCleanError;
      if (!preCleanData || preCleanData.length === 0) {
        return { valid: false, error: "No pre-clean record found for this area" };
      }
      
      const preCleanRecord = preCleanData[0];
      const equipmentCovered = preCleanRecord.bags_used;
      
      // Use cached DOM element
      const equipmentRetrieved = parseInt(this.cachedEquipmentInput?.value || "0") || 0;
      
      console.log(`Validation: Covered=${equipmentCovered}, Retrieved=${equipmentRetrieved}`);
      
      const result = {
        valid: equipmentRetrieved === equipmentCovered,
        expected: equipmentCovered,
        actual: equipmentRetrieved
      };
      
      if (!result.valid) {
        const missing = equipmentCovered - equipmentRetrieved;
        result.error = `Covering is missing to retrieve! Need to recover ${missing} equipment(s). Please verify thoroughly before proceeding.`;
        result.missing = missing;
      }
      
      this.lastValidationResult = result;
      return result;
      
    } catch (error) {
      console.error("Equipment validation error:", error);
      const result = { valid: false, error: "Validation failed: " + error.message };
      this.lastValidationResult = result;
      return result;
    }
  }

  /**
   * Perform validation with UI updates
   */
  static async performValidation() {
    const area = "MACY_DECORATION"; // Get from context or pass as parameter
    const validation = await this.validateEquipmentMatching(area);
    
    this.updateSubmitButtonState(validation.valid);
    this.updateInputStyling(validation.valid);
    
    return validation;
  }

  /**
   * Optimized submit button state update
   */
  static updateSubmitButtonState(isValid) {
    if (!this.cachedSubmitButton) return;
    
    PerformanceOptimizer.batchDomUpdates([
      () => {
        this.cachedSubmitButton.disabled = !isValid;
        this.cachedSubmitButton.style.background = isValid ? 
          "linear-gradient(135deg,#22c55e,#16a34a)" : 
          "linear-gradient(135deg,#6b7280,#4b5563)";
        this.cachedSubmitButton.title = isValid ? "" : "Equipment count must match pre-clean record";
      }
    ]);
  }

  /**
   * Optimized input styling update
   */
  static updateInputStyling(isValid) {
    if (!this.cachedEquipmentInput) return;
    
    PerformanceOptimizer.batchDomUpdates([
      () => {
        this.cachedEquipmentInput.style.borderColor = isValid ? "#22c55e" : "#ef4444";
      }
    ]);
  }

  /**
   * Optimized validation error display
   */
  static showValidationError(error) {
    // Use cached modal or create new one
    let modal = PerformanceOptimizer.getElement('.validation-error-modal', false);
    
    if (!modal) {
      modal = this.createErrorModal();
      document.body.appendChild(modal);
    }
    
    // Update modal content safely
    const errorElement = modal.querySelector('.error-message');
    if (errorElement) {
      errorElement.textContent = error; // Use textContent to prevent XSS
    }
    
    modal.style.display = 'flex';
    
    // Auto-hide with cleanup
    if (modal.cleanupTimer) {
      clearTimeout(modal.cleanupTimer);
    }
    
    modal.cleanupTimer = setTimeout(() => {
      this.hideValidationError();
    }, this.MODAL_TIMEOUT);
  }

  /**
   * Create error modal efficiently
   */
  static createErrorModal() {
    const modal = document.createElement('div');
    modal.className = 'validation-error-modal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.8);
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 10000;
    `;
    
    modal.innerHTML = `
      <div style="background: #1f2937; padding: 30px; border-radius: 15px; max-width: 500px; margin: 20px;">
        <h3 style="color: #ef4444; margin-bottom: 15px;">⚠️ Validation Error</h3>
        <p class="error-message" style="color: white; margin-bottom: 20px;"></p>
        <button class="error-modal-close" style="background: #ef4444; color: white; border: none; padding: 12px 24px; 
                       border-radius: 8px; cursor: pointer; font-size: 16px;">
          I Understand
        </button>
      </div>
    `;
    
    // Use event delegation for close button
    PerformanceOptimizer.delegateEvent(
      modal,
      'click',
      '.error-modal-close',
      () => this.hideValidationError()
    );
    
    return modal;
  }

  /**
   * Hide validation error modal
   */
  static hideValidationError() {
    const modal = PerformanceOptimizer.getElement('.validation-error-modal', false);
    if (modal) {
      modal.style.display = 'none';
      if (modal.cleanupTimer) {
        clearTimeout(modal.cleanupTimer);
      }
    }
  }

  /**
   * Optimized before-submit validation
   */
  static async validateBeforeSubmit(area) {
    // Clear any pending validation
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
    
    const validation = await this.validateEquipmentMatching(area);
    
    if (!validation.valid) {
      this.showValidationError(validation.error);
      return false;
    }
    
    return true;
  }

  /**
   * Setup equipment validation with performance optimizations
   */
  static async setupEquipmentValidation(area) {
    this.initialize();
    
    // Initial validation
    const initialValidation = await this.performValidation();
    return initialValidation;
  }

  /**
   * Cleanup resources
   */
  static cleanup() {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
    
    this.hideValidationError();
    this.cachedSubmitButton = null;
    this.cachedEquipmentInput = null;
    this.lastValidationResult = null;
    this.validationInProgress = false;
    
    // Clear performance caches
    PerformanceOptimizer.clearDomCache();
    PerformanceOptimizer.clearDbCache();
  }

  /**
   * Get performance metrics
   */
  static getMetrics() {
    return {
      validationCount: this.validationCount,
      cacheHits: this.cacheHits,
      lastValidationResult: this.lastValidationResult
    };
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { OptimizedValidationUtils };
}

// Add page cleanup
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', OptimizedValidationUtils.cleanup);
}
