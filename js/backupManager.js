// Data backup and cleanup utilities for free Supabase tier optimization
class BackupManager {
  static async createBackup() {
    try {
      console.log("Starting 48-hour clean slate backup...");
      
      // Get all data that needs to be backed up before clean slate
      const data = await this.collectDataForBackup();
      
      // Create zip file
      const zipBlob = await this.createZipFile(data);
      
      // Save to local storage
      const filename = await this.saveToLocal(zipBlob);
      
      // Perform clean slate (48-hour refresh)
      await this.performCleanSlate();
      
      console.log("Clean slate backup completed successfully");
      return { success: true, message: "Clean slate backup completed", filename };
    } catch (error) {
      console.error("Clean slate backup failed:", error);
      return { success: false, error: error.message };
    }
  }
  
  static async collectDataForBackup() {
    const supabase = window.supabaseClient;
    if (!supabase) throw new Error("Supabase client not available");
    
    const cutoffTime = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
    
    // Collect data older than 48 hours
    const [
      preCleanData,
      postCleanData,
      completedHandovers,
      completedInspections,
      completedFindings
    ] = await Promise.all([
      supabase.from("pre_cleaning_logs").select("*").lt("submitted_at", cutoffTime),
      supabase.from("post_cleaning_logs").select("*").lt("submitted_at", cutoffTime),
      supabase.from("handover_tasks").select("*").eq("status", "Completed").lt("created_at", cutoffTime),
      supabase.from("area_inspection_logs").select("*").lt("submitted_at", cutoffTime),
      supabase.from("post_release_findings").select("*").eq("status", "Closed").lt("created_at", cutoffTime)
    ]);
    
    return {
      timestamp: new Date().toISOString(),
      pre_cleaning: preCleanData.data || [],
      post_cleaning: postCleanData.data || [],
      handovers: completedHandovers.data || [],
      inspections: completedInspections.data || [],
      findings: completedFindings.data || []
    };
  }
  
  static async createZipFile(data) {
    // Create JSON string
    const jsonString = JSON.stringify(data, null, 2);
    
    // Create a simple text-based "zip" using compression
    const compressed = this.simpleCompress(jsonString);
    
    // Create blob
    return new Blob([compressed], { type: 'application/json' });
  }
  
  static simpleCompress(data) {
    // Simple compression - remove unnecessary whitespace
    return data.replace(/\s+/g, ' ').trim();
  }
  
  static async saveToLocal(blob) {
    const filename = `sanitation-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    
    // Try to save to Downloads folder
    if (window.showSaveFilePicker) {
      try {
        const fileHandle = await window.showSaveFilePicker({
          suggestedName: filename,
          types: [{
            description: 'JSON files',
            accept: { 'application/json': ['.json'] }
          }]
        });
        const writable = await fileHandle.createWritable();
        await writable.write(blob);
        await writable.close();
        return filename;
      } catch (err) {
        console.log("File picker cancelled, falling back to download");
      }
    }
    
    // Fallback: trigger download
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    return filename;
  }
  
  static async performCleanSlate() {
    const supabase = window.supabaseClient;
    if (!supabase) throw new Error("Supabase client not available");
    
    try {
      // Call the clean slate function
      const { data, error } = await supabase.rpc('clean_slate_48hr');
      
      if (error) throw error;
      
      console.log("Clean slate completed:", data);
      return data;
      
    } catch (error) {
      console.error("Clean slate failed:", error);
      throw error;
    }
  }
  
  static async cleanupOldData() {
    const supabase = window.supabaseClient;
    if (!supabase) throw new Error("Supabase client not available");
    
    const cutoffTime = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
    
    // Delete old data (keep face registry and open damage reports)
    const deletePromises = [
      supabase.from("pre_cleaning_logs").delete().lt("submitted_at", cutoffTime),
      supabase.from("post_cleaning_logs").delete().lt("submitted_at", cutoffTime),
      supabase.from("handover_tasks").delete().eq("status", "Completed").lt("created_at", cutoffTime),
      supabase.from("area_inspection_logs").delete().lt("submitted_at", cutoffTime),
      supabase.from("post_release_findings").delete().eq("status", "Closed").lt("created_at", cutoffTime)
    ];
    
    const results = await Promise.allSettled(deletePromises);
    
    // Log any errors
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error(`Delete operation ${index} failed:`, result.reason);
      }
    });
    
    console.log("Data cleanup completed");
  }
  
  // Schedule automatic clean slate every 48 hours
  static scheduleAutoBackup() {
    // Check if clean slate is needed every hour
    setInterval(async () => {
      const lastBackup = localStorage.getItem('lastBackupTime');
      const now = Date.now();
      
      if (!lastBackup || (now - parseInt(lastBackup)) > 48 * 60 * 60 * 1000) {
        console.log("Starting scheduled clean slate backup...");
        const result = await this.createBackup();
        if (result.success) {
          localStorage.setItem('lastBackupTime', now.toString());
          console.log("Clean slate completed - system refreshed");
        }
      }
    }, 60 * 60 * 1000); // Check every hour
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { BackupManager };
}
