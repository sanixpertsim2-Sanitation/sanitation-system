// Weekend Archive Scheduler
// Integrates Google Sheets archive with the existing backup system

class WeekendArchiveScheduler {
  constructor() {
    this.archive = new GoogleSheetsArchive();
    this.isRunning = false;
    this.lastRunTime = localStorage.getItem('lastWeekendArchive');
  }

  // Initialize with your Google Sheet ID
  async initialize(spreadsheetId) {
    this.archive.setSpreadsheetId(spreadsheetId);
    
    // Check if we need to run archive (every 48 hours)
    this.scheduleWeekendArchive();
    
    console.log('Weekend Archive Scheduler initialized');
  }

  // Schedule archive to run every 48 hours
  scheduleWeekendArchive() {
    // Check every hour if archive is needed
    setInterval(async () => {
      await this.checkAndRunArchive();
    }, 60 * 60 * 1000); // Check every hour
    
    // Also check immediately on initialization
    this.checkAndRunArchive();
  }

  // Check if 48 hours have passed and run archive if needed
  async checkAndRunArchive() {
    if (this.isRunning) {
      console.log('Archive already running, skipping...');
      return;
    }

    const now = Date.now();
    const lastRun = this.lastRunTime ? parseInt(this.lastRunTime) : 0;
    const hoursSinceLastRun = (now - lastRun) / (1000 * 60 * 60);

    if (hoursSinceLastRun >= 48) {
      console.log('48 hours passed, running weekend archive...');
      await this.runArchive();
    }
  }

  // Run the archive process
  async runArchive() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    
    try {
      console.log('🚀 Starting Weekend Archive Process...');
      
      const result = await this.archive.runWeekendArchive();
      
      if (result.success) {
        console.log('✅ Weekend Archive completed successfully!');
        console.log(`📊 Archived ${result.totalRowsArchived} rows to Google Sheets`);
        
        // Update last run time
        localStorage.setItem('lastWeekendArchive', Date.now().toString());
        
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
      
    } finally {
      this.isRunning = false;
    }
  }

  // Manual trigger for testing
  async manualRun() {
    console.log('🔧 Manual weekend archive trigger...');
    return await this.runArchive();
  }

  // Get archive status
  getStatus() {
    const lastRun = this.lastRunTime ? new Date(parseInt(this.lastRunTime)) : null;
    const now = Date.now();
    const hoursSinceLastRun = lastRun ? (now - parseInt(this.lastRunTime)) / (1000 * 60 * 60) : 999;
    
    return {
      lastRun: lastRun ? lastRun.toLocaleString() : 'Never',
      hoursSinceLastRun: Math.floor(hoursSinceLastRun),
      nextRunIn: Math.max(0, 48 - Math.floor(hoursSinceLastRun)),
      isRunning: this.isRunning
    };
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { WeekendArchiveScheduler };
}

// Browser usage
if (typeof window !== 'undefined') {
  window.WeekendArchiveScheduler = WeekendArchiveScheduler;
}
