// ======================================================
   SANIXPERT UNIVERSAL FIXES - JavaScript
   Fixes for date auto-fill, question layout, and camera/comment boxes
   ======================================================

class SanixpertUniversalFixes {
  constructor() {
    this.dateTimeInterval = null;
    this.checklistHandlers = new Map();
  }

  // Initialize fixes for current page
  initialize() {
    console.log('🔧 Applying Sanixpert universal fixes...');
    
    // Apply date/time fixes
    this.fixDateTimeAutoFill();
    
    // Apply question layout fixes
    this.fixQuestionLayout();
    
    // Apply checklist handlers
    this.fixChecklistHandlers();
    
    // Apply mobile optimizations
    this.fixMobileOptimizations();
    
    console.log('✅ Universal fixes applied successfully');
  }

  // Fix date/time auto-fill
  fixDateTimeAutoFill() {
    const dateTimeInputs = document.querySelectorAll('input[type="text"][readonly], input#dateTime');
    
    dateTimeInputs.forEach(input => {
      if (input.id && (input.id.includes('dateTime') || input.id.includes('date'))) {
        // Update immediately
        this.updateDateTime(input);
        
        // Set up continuous updates
        if (!this.dateTimeInterval) {
          this.dateTimeInterval = setInterval(() => {
            document.querySelectorAll('input[type="text"][readonly], input#dateTime').forEach(dtInput => {
              this.updateDateTime(dtInput);
            });
          }, 1000);
        }
      }
    });
  }

  // Update date/time with proper formatting
  updateDateTime(input) {
    if (!input) return;
    
    try {
      let formattedDateTime;
      
      if (window.DateUtils) {
        const now = DateUtils.getCurrentTimestamp();
        formattedDateTime = DateUtils.formatTimestamp(now);
      } else {
        const now = new Date();
        formattedDateTime = now.toLocaleDateString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        }) + ' ' + now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        });
      }
      
      input.value = formattedDateTime;
    } catch (error) {
      console.error('Date update error:', error);
      // Ultimate fallback
      input.value = new Date().toLocaleString();
    }
  }

  // Fix question layout
  fixQuestionLayout() {
    const questions = document.querySelectorAll('.question');
    
    questions.forEach(question => {
      // Remove any existing gaps
      question.style.marginBottom = '20px';
      question.style.padding = '16px';
      
      // Ensure proper styling
      if (!question.classList.contains('styled')) {
        question.classList.add('styled');
        
        // Add question text styling if needed
        const questionText = question.querySelector('.question-text');
        if (questionText) {
          questionText.style.marginBottom = '12px';
          questionText.style.fontWeight = '600';
          questionText.style.color = '#1f2937';
        }
      }
    });
  }

  // Fix checklist handlers
  fixChecklistHandlers() {
    const selects = document.querySelectorAll('.select, select');
    
    selects.forEach(select => {
      // Remove existing handlers to prevent duplicates
      if (this.checklistHandlers.has(select)) {
        select.removeEventListener('change', this.checklistHandlers.get(select));
      }
      
      // Create new handler
      const handler = (e) => this.handleChecklistChange(e);
      this.checklistHandlers.set(select, handler);
      
      // Add event listener
      select.addEventListener('change', handler);
      
      // Initialize state
      this.handleChecklistChange({ target: select });
    });
  }

  // Handle checklist change
  handleChecklistChange(event) {
    const select = event.target;
    const questionId = select.id;
    const extraDiv = document.getElementById(questionId + '-extra');
    
    if (!extraDiv) return;
    
    console.log('Checklist changed:', questionId, select.value);
    
    if (select.value === 'Not Acceptable' || select.value === 'N/A') {
      // Show extra fields with animation
      extraDiv.classList.remove('hidden');
      extraDiv.style.display = 'block';
      
      // Make fields required
      const fileInput = extraDiv.querySelector('input[type="file"]');
      const textarea = extraDiv.querySelector('textarea');
      
      if (fileInput) {
        fileInput.required = true;
        fileInput.classList.add('camera-required');
        console.log('File input made required for:', questionId);
      }
      
      if (textarea) {
        textarea.required = true;
        textarea.classList.add('comment-required');
        console.log('Textarea made required for:', questionId);
      }
      
      // Add visual feedback
      select.closest('.question').classList.add('has-error');
      
    } else {
      // Hide extra fields
      extraDiv.classList.add('hidden');
      extraDiv.style.display = 'none';
      
      // Remove required attribute and clear values
      const fileInput = extraDiv.querySelector('input[type="file"]');
      const textarea = extraDiv.querySelector('textarea');
      
      if (fileInput) {
        fileInput.required = false;
        fileInput.classList.remove('camera-required');
        fileInput.value = ''; // Clear file
      }
      
      if (textarea) {
        textarea.required = false;
        textarea.classList.remove('comment-required');
        textarea.value = ''; // Clear comment
      }
      
      // Remove visual feedback
      select.closest('.question').classList.remove('has-error');
    }
  }

  // Fix mobile optimizations
  fixMobileOptimizations() {
    // Add mobile-specific classes
    if (window.innerWidth <= 768) {
      document.body.classList.add('mobile-view');
    }
    
    // Handle resize
    window.addEventListener('resize', () => {
      if (window.innerWidth <= 768) {
        document.body.classList.add('mobile-view');
      } else {
        document.body.classList.remove('mobile-view');
      }
    });
    
    // Fix file inputs for mobile
    const fileInputs = document.querySelectorAll('input[type="file"]');
    fileInputs.forEach(input => {
      input.setAttribute('capture', 'environment');
      input.setAttribute('accept', 'image/*');
    });
  }

  // Enhanced form validation
  validateForm(formElement) {
    if (!formElement) return false;
    
    const errors = [];
    
    // Check required selects
    const requiredSelects = formElement.querySelectorAll('select[required], .select[required]');
    requiredSelects.forEach(select => {
      if (!select.value) {
        errors.push('All checklist questions are required');
        select.focus();
        return false;
      }
      
      // Check if extra fields are required and filled
      if (select.value === 'Not Acceptable' || select.value === 'N/A') {
        const extraDiv = document.getElementById(select.id + '-extra');
        if (extraDiv && !extraDiv.classList.contains('hidden')) {
          const fileInput = extraDiv.querySelector('input[type="file"]');
          const textarea = extraDiv.querySelector('textarea');
          
          if (fileInput && fileInput.required && !fileInput.files.length) {
            errors.push('Photo is required for this question');
            fileInput.focus();
            return false;
          }
          
          if (textarea && textarea.required && !textarea.value.trim()) {
            errors.push('Comment is required for this question');
            textarea.focus();
            return false;
          }
        }
      }
    });
    
    if (errors.length > 0) {
      if (window.mobileNext) {
        window.mobileNext.showToast(errors[0], 'error');
      } else {
        alert(errors[0]);
      }
      return false;
    }
    
    return true;
  }

  // Show success animation
  showSuccessAnimation(element) {
    if (element) {
      element.classList.add('success-animation');
      setTimeout(() => {
        element.classList.remove('success-animation');
      }, 500);
    }
  }

  // Cleanup
  destroy() {
    if (this.dateTimeInterval) {
      clearInterval(this.dateTimeInterval);
      this.dateTimeInterval = null;
    }
    
    // Remove event listeners
    this.checklistHandlers.forEach((handler, select) => {
      select.removeEventListener('change', handler);
    });
    this.checklistHandlers.clear();
  }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  // Wait a bit for other scripts to load
  setTimeout(() => {
    if (!window.sanixpertFixes) {
      window.sanixpertFixes = new SanixpertUniversalFixes();
      window.sanixpertFixes.initialize();
    }
  }, 100);
});

// Handle page visibility changes
document.addEventListener('visibilitychange', function() {
  if (!document.hidden && window.sanixpertFixes) {
    // Update date/time when page becomes visible
    const dateTimeInputs = document.querySelectorAll('input[type="text"][readonly], input#dateTime');
    dateTimeInputs.forEach(input => {
      window.sanixpertFixes.updateDateTime(input);
    });
  }
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SanixpertUniversalFixes;
} else {
  window.SanixpertUniversalFixes = SanixpertUniversalFixes;
}
