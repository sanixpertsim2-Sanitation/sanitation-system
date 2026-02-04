// Initialize all optimization systems
class SystemInitializer {
  static async initialize() {
    console.log("Initializing Sanixpert optimization systems...");
    
    try {
      // Initialize photo storage
      await PhotoStorage.initializeStorage();
      console.log("✅ Photo storage initialized");
      
      // Start automatic backup scheduling
      BackupManager.scheduleAutoBackup();
      console.log("✅ Backup scheduler started");
      
      // Start automatic cleanup scheduling
      DataCleanupManager.scheduleAutoCleanup();
      console.log("✅ Cleanup scheduler started");
      
      // Check database size
      const sizeInfo = await DataCleanupManager.getDatabaseSize();
      console.log("📊 Database size:", sizeInfo.formattedSize);
      
      // Warning if approaching limits
      if (sizeInfo.estimatedSize > 400 * 1024 * 1024) {
        console.warn("⚠️ Database approaching size limit");
        ErrorHandler.showError("Database approaching storage limit. Consider running cleanup.", null);
      }
      
      // Run initial optimization if needed
      const lastOptimization = localStorage.getItem('lastOptimizationTime');
      const now = Date.now();
      
      if (!lastOptimization || (now - parseInt(lastOptimization)) > 24 * 60 * 60 * 1000) {
        console.log("Running daily optimization...");
        await DataCleanupManager.optimizeDatabase();
        localStorage.setItem('lastOptimizationTime', now.toString());
      }
      
      console.log("🚀 All systems initialized successfully");
      return { success: true };
      
    } catch (error) {
      console.error("System initialization failed:", error);
      ErrorHandler.showError("Failed to initialize optimization systems", error);
      return { success: false, error: error.message };
    }
  }
  
  static async getSystemStatus() {
    try {
      const sizeInfo = await DataCleanupManager.getDatabaseSize();
      const lastBackup = localStorage.getItem('lastBackupTime');
      const lastCleanup = localStorage.getItem('lastCleanupTime');
      const lastOptimization = localStorage.getItem('lastOptimizationTime');
      
      return {
        databaseSize: sizeInfo,
        lastBackup: lastBackup ? new Date(parseInt(lastBackup)).toLocaleString() : 'Never',
        lastCleanup: lastCleanup ? new Date(parseInt(lastCleanup)).toLocaleString() : 'Never',
        lastOptimization: lastOptimization ? new Date(parseInt(lastOptimization)).toLocaleString() : 'Never',
        status: 'healthy'
      };
    } catch (error) {
      return { status: 'error', error: error.message };
    }
  }
  
  static async runManualBackup() {
    try {
      const result = await BackupManager.createBackup();
      if (result.success) {
        SuccessHandler.showSuccess("Backup completed successfully");
      } else {
        ErrorHandler.showError("Backup failed", result.error);
      }
      return result;
    } catch (error) {
      ErrorHandler.showError("Manual backup failed", error);
      return { success: false, error: error.message };
    }
  }
  
  static async runManualCleanup() {
    try {
      const result = await DataCleanupManager.optimizeDatabase();
      SuccessHandler.showSuccess(`Cleanup completed. Freed up space from ${result.cleanupResults} records`);
      return result;
    } catch (error) {
      ErrorHandler.showError("Manual cleanup failed", error);
      return { success: false, error: error.message };
    }
  }
  
  static async migrateExistingPhotos() {
    try {
      console.log("Starting photo migration...");
      await PhotoStorage.migrateBase64Photos();
      SuccessHandler.showSuccess("Photo migration completed");
      return { success: true };
    } catch (error) {
      ErrorHandler.showError("Photo migration failed", error);
      return { success: false, error: error.message };
    }
  }
}

// Auto-initialize when script loads
if (typeof window !== 'undefined') {
  window.addEventListener('load', async () => {
    // Wait a bit for other systems to load
    setTimeout(async () => {
      await SystemInitializer.initialize();
    }, 2000);
  });
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SystemInitializer };
}
