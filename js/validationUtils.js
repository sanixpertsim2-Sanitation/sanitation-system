// Equipment/Bag matching validation for post-clean workflow
class ValidationUtils {
  static debounceTimer = null;
  static modalTimer = null;
  static DEBOUNCE_DELAY = APP_CONSTANTS.TIMING.VALIDATION_DEBOUNCE_DELAY;
  static MODAL_TIMEOUT = APP_CONSTANTS.TIMING.MODAL_AUTO_REMOVE_TIMEOUT;
  static cachedSubmitButton = null;
  
  static async validateEquipmentMatching(area) {
    const supabase = window.supabaseClient;
    if (!supabase) return { valid: false, error: "Database not available" };
    
    try {
      // Get latest pre-clean data for the area
      const { data: preCleanData, error: preCleanError } = await supabase
        .from("pre_cleaning_logs")
        .select("*")
        .eq("area", area)
        .order("submitted_at", { ascending: false })
        .limit(1);
      
      if (preCleanError) throw preCleanError;
      if (!preCleanData || preCleanData.length === 0) {
        return { valid: false, error: "No pre-clean record found for this area" };
      }
      
      const preCleanRecord = preCleanData[0];
      const equipmentCovered = preCleanRecord.bags_used; // Using bags_used as equipment count
      
      // Get current post-clean input values
      const equipmentInput = document.getElementById("equipment-retrieved");
      const equipmentRetrieved = parseInt(equipmentInput?.value || "0") || 0;
      
      console.log(`Validation: Covered=${equipmentCovered}, Retrieved=${equipmentRetrieved}`);
      
      if (equipmentRetrieved !== equipmentCovered) {
        const missing = equipmentCovered - equipmentRetrieved;
        return {
          valid: false,
          error: "Mismatch! Count missing coverings.",
          missing: missing,
          expected: equipmentCovered,
          actual: equipmentRetrieved
        };
      }
      
      return { valid: true, expected: equipmentCovered, actual: equipmentRetrieved };
      
    } catch (error) {
      console.error("Equipment validation error:", error);
      return { valid: false, error: "Validation failed: " + error.message };
    }
  }
  
  static showValidationError(error) {
    // Create modal for validation error using safe DOM methods
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
    `;
    
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
      background: #1f2937; 
      padding: 30px; 
      border-radius: 15px; 
      max-width: 500px; 
      margin: 20px;
    `;
    
    const title = document.createElement('h3');
    title.style.cssText = 'color: #ef4444; margin-bottom: 15px;';
    title.textContent = '⚠️ Validation Error';
    
    const message = document.createElement('p');
    message.style.cssText = 'color: white; margin-bottom: 20px;';
    // Use textContent to prevent XSS
    message.textContent = error;
    
    const button = document.createElement('button');
    button.style.cssText = `
      background: #ef4444; 
      color: white; 
      border: none; 
      padding: 12px 24px; 
      border-radius: 8px; 
      cursor: pointer; 
      font-size: 16px;
    `;
    button.textContent = 'I Understand';
    
    // Store timer reference in a static property for proper cleanup
    const cleanup = () => {
      if (ValidationUtils.modalTimer) {
        clearTimeout(ValidationUtils.modalTimer);
        ValidationUtils.modalTimer = null;
      }
      if (document.body.contains(modal)) {
        modal.remove();
      }
    };
    
    button.onclick = cleanup;
    
    modalContent.appendChild(title);
    modalContent.appendChild(message);
    modalContent.appendChild(button);
    modal.appendChild(modalContent);
    
    document.body.appendChild(modal);
    
    // Set auto-remove timer with proper cleanup reference
    ValidationUtils.modalTimer = setTimeout(cleanup, ValidationUtils.MODAL_TIMEOUT);
    
    // Add click event to modal backdrop for manual close
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        cleanup();
      }
    });
  }
  
  static updateSubmitButtonState(isValid) {
    // Cache the button reference if not already cached
    if (!ValidationUtils.cachedSubmitButton) {
      ValidationUtils.cachedSubmitButton = document.querySelector("button[onclick='submitPostClean()']");
    }
    
    const submitBtn = ValidationUtils.cachedSubmitButton;
    if (submitBtn) {
      submitBtn.disabled = !isValid;
      submitBtn.style.background = isValid ? 
        "linear-gradient(135deg,#22c55e,#16a34a)" : 
        "linear-gradient(135deg,#6b7280,#4b5563)";
      
      if (!isValid) {
        submitBtn.title = "Equipment count must match pre-clean record";
      } else {
        submitBtn.title = "";
      }
    }
  }
  
  static cleanup() {
    // Clear debounce timer
    if (ValidationUtils.debounceTimer) {
      clearTimeout(ValidationUtils.debounceTimer);
      ValidationUtils.debounceTimer = null;
    }
    
    // Clear modal timer
    if (ValidationUtils.modalTimer) {
      clearTimeout(ValidationUtils.modalTimer);
      ValidationUtils.modalTimer = null;
    }
    
    // Clear cached references
    ValidationUtils.cachedSubmitButton = null;
  }
  
  static async setupEquipmentValidation(area) {
    // Add event listener to equipment input field
    const equipmentInput = document.getElementById("equipment-retrieved");
    if (!equipmentInput) {
      console.warn("Equipment input field not found");
      return;
    }
    
    // Validate on input change with debouncing
    equipmentInput.addEventListener('input', () => {
      // Clear existing timer
      if (ValidationUtils.debounceTimer) {
        clearTimeout(ValidationUtils.debounceTimer);
      }
      
      // Set new timer for 500ms debounce
      ValidationUtils.debounceTimer = setTimeout(async () => {
        const validation = await ValidationUtils.validateEquipmentMatching(area);
        ValidationUtils.updateSubmitButtonState(validation.valid);
        
        if (!validation.valid) {
          equipmentInput.style.borderColor = "#ef4444";
        } else {
          equipmentInput.style.borderColor = "#22c55e";
        }
      }, ValidationUtils.DEBOUNCE_DELAY);
    });
    
    // Initial validation
    const initialValidation = await ValidationUtils.validateEquipmentMatching(area);
    ValidationUtils.updateSubmitButtonState(initialValidation.valid);
  }
  
  static async validateBeforeSubmit(area) {
    const validation = await ValidationUtils.validateEquipmentMatching(area);
    
    if (!validation.valid) {
      ValidationUtils.showValidationError(validation.error);
      return false;
    }
    
    return true;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ValidationUtils };
}

// Add page cleanup
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', ValidationUtils.cleanup);
}
