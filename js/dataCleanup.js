// Data cleanup automation for database optimization
class DataCleanupManager {
  static async performScheduledCleanup() {
    try {
      console.log("Starting scheduled data cleanup...");
      
      const cleanupResults = {
        preClean: await this.cleanupPreCleanData(),
        postClean: await this.cleanupPostCleanData(),
        handovers: await this.cleanupCompletedHandovers(),
        inspections: await this.cleanupInspections(),
        findings: await this.cleanupFindings(),
        photos: await this.cleanupOrphanedPhotos()
      };
      
      // Log results
      console.log("Cleanup results:", cleanupResults);
      
      // Update last cleanup time
      localStorage.setItem('lastCleanupTime', Date.now().toString());
      
      return cleanupResults;
      
    } catch (error) {
      console.error("Cleanup failed:", error);
      throw error;
    }
  }
  
  static async cleanupPreCleanData() {
    const supabase = window.supabaseClient;
    if (!supabase) return { deleted: 0, error: "No database connection" };
    
    // Keep only last 7 days of pre-clean data
    const cutoffTime = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    
    const { data, error, count } = await supabase
      .from("pre_cleaning_logs")
      .delete({ count: 'exact' })
      .lt("submitted_at", cutoffTime);
    
    if (error) {
      return { deleted: 0, error: error.message };
    }
    
    return { deleted: count || 0 };
  }
  
  static async cleanupPostCleanData() {
    const supabase = window.supabaseClient;
    if (!supabase) return { deleted: 0, error: "No database connection" };
    
    // Keep only last 7 days of post-clean data
    const cutoffTime = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    
    const { data, error, count } = await supabase
      .from("post_cleaning_logs")
      .delete({ count: 'exact' })
      .lt("submitted_at", cutoffTime);
    
    if (error) {
      return { deleted: 0, error: error.message };
    }
    
    return { deleted: count || 0 };
  }
  
  static async cleanupCompletedHandovers() {
    const supabase = window.supabaseClient;
    if (!supabase) return { deleted: 0, error: "No database connection" };
    
    // Clean up completed handovers older than 3 days
    const cutoffTime = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
    
    const { data, error, count } = await supabase
      .from("handover_tasks")
      .delete({ count: 'exact' })
      .eq("status", "Completed")
      .lt("created_at", cutoffTime);
    
    if (error) {
      return { deleted: 0, error: error.message };
    }
    
    return { deleted: count || 0 };
  }
  
  static async cleanupInspections() {
    const supabase = window.supabaseClient;
    if (!supabase) return { deleted: 0, error: "No database connection" };
    
    // Keep only last 30 days of inspections
    const cutoffTime = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    
    const { data, error, count } = await supabase
      .from("area_inspection_logs")
      .delete({ count: 'exact' })
      .lt("submitted_at", cutoffTime);
    
    if (error) {
      return { deleted: 0, error: error.message };
    }
    
    return { deleted: count || 0 };
  }
  
  static async cleanupFindings() {
    const supabase = window.supabaseClient;
    if (!supabase) return { deleted: 0, error: "No database connection" };
    
    // Only clean up closed findings older than 14 days
    const cutoffTime = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
    
    const { data, error, count } = await supabase
      .from("post_release_findings")
      .delete({ count: 'exact' })
      .eq("status", "Closed")
      .lt("created_at", cutoffTime);
    
    if (error) {
      return { deleted: 0, error: error.message };
    }
    
    return { deleted: count || 0 };
  }
  
  static async cleanupOrphanedPhotos() {
    const supabase = window.supabaseClient;
    if (!supabase) return { deleted: 0, error: "No database connection" };
    
    try {
      // Get all files in storage
      const { data: files, error } = await supabase.storage
        .from('photos')
        .list('', { limit: 1000 });
      
      if (error) {
        return { deleted: 0, error: error.message };
      }
      
      let deletedCount = 0;
      
      for (const file of files || []) {
        const isOlderThan48Hours = new Date(file.created_at) < new Date(Date.now() - 48 * 60 * 60 * 1000);
        
        if (isOlderThan48Hours) {
          // Check if photo is still referenced in database
          const isReferenced = await this.isPhotoReferenced(file.name);
          
          if (!isReferenced) {
            await supabase.storage.from('photos').remove([file.name]);
            deletedCount++;
          }
        }
      }
      
      return { deleted: deletedCount };
      
    } catch (error) {
      return { deleted: 0, error: error.message };
    }
  }
  
  static async isPhotoReferenced(photoPath) {
    const supabase = window.supabaseClient;
    if (!supabase) return false;
    
    // Check if photo URL exists in any relevant tables
    const tables = ['damage_reports', 'handover_tasks', 'post_release_findings'];
    
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('id')
        .or(`photo.ilike.%${photoPath}%,completed_photo.ilike.%${photoPath}%,photos.cs.{${photoPath}}`)
        .limit(1);
      
      if (data && data.length > 0) {
        return true;
      }
    }
    
    return false;
  }
  
  static async getDatabaseSize() {
    const supabase = window.supabaseClient;
    if (!supabase) return { size: 0, error: "No database connection" };
    
    try {
      // Get approximate size by counting records in main tables
      const tables = [
        'pre_cleaning_logs',
        'post_cleaning_logs', 
        'damage_reports',
        'handover_tasks',
        'area_inspection_logs',
        'post_release_findings',
        'face_registry'
      ];
      
      let totalRecords = 0;
      const tableSizes = {};
      
      for (const table of tables) {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        
        if (!error) {
          tableSizes[table] = count || 0;
          totalRecords += count || 0;
        }
      }
      
      // Estimate size (rough calculation: ~1KB per record + photos)
      const estimatedSize = totalRecords * 1024; // Base records
      
      return {
        totalRecords,
        estimatedSize,
        tableSizes,
        formattedSize: this.formatBytes(estimatedSize)
      };
      
    } catch (error) {
      return { size: 0, error: error.message };
    }
  }
  
  static formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
  
  static scheduleAutoCleanup() {
    // Run cleanup every 6 hours
    setInterval(async () => {
      try {
        const lastCleanup = localStorage.getItem('lastCleanupTime');
        const now = Date.now();
        
        if (!lastCleanup || (now - parseInt(lastCleanup)) > 6 * 60 * 60 * 1000) {
          console.log("Starting scheduled cleanup...");
          await this.performScheduledCleanup();
        }
      } catch (error) {
        console.error("Scheduled cleanup failed:", error);
      }
    }, 60 * 60 * 1000); // Check every hour
  }
  
  static async optimizeDatabase() {
    console.log("Starting database optimization...");
    
    // Perform cleanup
    const cleanupResults = await this.performScheduledCleanup();
    
    // Get current size
    const sizeInfo = await this.getDatabaseSize();
    
    // Log optimization results
    console.log("Database optimization completed:", {
      cleanupResults,
      currentSize: sizeInfo
    });
    
    // Show warning if approaching limits
    if (sizeInfo.estimatedSize > 400 * 1024 * 1024) { // 400MB warning
      console.warn("Database approaching size limit. Consider additional cleanup.");
    }
    
    return {
      cleanupResults,
      sizeInfo,
      optimized: true
    };
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DataCleanupManager };
}
