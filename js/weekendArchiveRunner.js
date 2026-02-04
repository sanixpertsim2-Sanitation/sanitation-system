// Main weekend archive runner using your backup-bot service account
// This file ties everything together

// Import configuration and classes
if (typeof require !== 'undefined') {
  const { GOOGLE_SHEETS_CONFIG } = require('./googleSheetsConfig.js');
  const { GoogleSheetsArchive } = require('./googleSheetsArchive.js');
  const { WeekendArchiveScheduler } = require('./weekendArchiveScheduler.js');
}

// Main weekend archive function
async function runWeekendArchive(spreadsheetId) {
  try {
    console.log('🚀 Starting Weekend Archive with backup-bot service account...');
    
    // Initialize the archive system
    const archive = new GoogleSheetsArchive()
      .initialize(GOOGLE_SHEETS_CONFIG);
    
    // Set the spreadsheet ID
    archive.setSpreadsheetId(spreadsheetId);
    
    // Run the archive process
    const result = await archive.runWeekendArchive();
    
    if (result.success) {
      console.log('✅ Weekend Archive completed successfully!');
      console.log(`📊 Archived ${result.totalRowsArchived} rows to Google Sheets`);
      
      // Show success notification
      if (typeof window !== 'undefined' && window.SuccessHandler) {
        window.SuccessHandler.showSuccess(
          `Weekend Archive: ${result.totalRowsArchived} rows backed up to Google Sheets`
        );
      }
    } else {
      console.error('❌ Weekend Archive failed:', result.error);
      
      // Show error notification
      if (typeof window !== 'undefined' && window.ErrorHandler) {
        window.ErrorHandler.showError('Weekend Archive failed', result.error);
      }
    }
    
    return result;
    
  } catch (error) {
    console.error('Weekend Archive error:', error);
    
    if (typeof window !== 'undefined' && window.ErrorHandler) {
      window.ErrorHandler.showError('Weekend Archive error', error);
    }
    
    return { success: false, error: error.message };
  }
}

// Initialize the scheduler for automatic runs
function initializeWeekendScheduler(spreadsheetId) {
  const scheduler = new WeekendArchiveScheduler();
  scheduler.initialize(spreadsheetId);
  
  console.log('Weekend Archive Scheduler initialized');
  console.log('Will automatically run every 48 hours');
  
  return scheduler;
}

// Browser-ready initialization
if (typeof window !== 'undefined') {
  window.runWeekendArchive = runWeekendArchive;
  window.initializeWeekendScheduler = initializeWeekendScheduler;
  
  // Auto-initialize when page loads (if spreadsheet ID is available)
  window.addEventListener('load', async () => {
    // Check if we have a spreadsheet ID in localStorage
    const spreadsheetId = localStorage.getItem('googleSheetsId');
    
    if (spreadsheetId) {
      console.log('Found Google Sheets ID, initializing scheduler...');
      initializeWeekendScheduler(spreadsheetId);
    } else {
      console.log('No Google Sheets ID found. Set it using:');
      console.log('localStorage.setItem("googleSheetsId", "your-spreadsheet-id")');
    }
  });
}

// Export for Node.js usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { 
    runWeekendArchive, 
    initializeWeekendScheduler 
  };
}

// Example usage:
// 
// // For manual run:
// await runWeekendArchive('your-google-sheets-id');
//
// // For automatic scheduling:
// initializeWeekendScheduler('your-google-sheets-id');
//
// // Set spreadsheet ID in browser:
// localStorage.setItem('googleSheetsId', 'your-google-sheets-id');
