// Supabase Storage integration for optimized photo handling
class PhotoStorage {
  static async uploadPhoto(file, folder = 'sanitation-photos') {
    const supabase = window.supabaseClient;
    if (!supabase) throw new Error("Supabase client not available");
    
    try {
      // Compress image first
      const compressedFile = await this.compressImage(file);
      
      // Generate unique filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const randomId = Math.random().toString(36).substring(2, 8);
      const filename = `${folder}/${timestamp}-${randomId}.jpg`;
      
      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('photos')
        .upload(filename, compressedFile, {
          contentType: 'image/jpeg',
          cacheControl: '3600' // 1 hour cache
        });
      
      if (error) throw error;
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('photos')
        .getPublicUrl(filename);
      
      return {
        success: true,
        path: filename,
        url: publicUrl,
        size: compressedFile.size
      };
      
    } catch (error) {
      console.error("Photo upload failed:", error);
      throw new Error("Failed to upload photo: " + error.message);
    }
  }
  
  static async compressImage(file, quality = 0.7, maxWidth = 1200) {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to blob
        canvas.toBlob(resolve, 'image/jpeg', quality);
      };
      
      img.onerror = () => {
        // Fallback to original file if compression fails
        resolve(file);
      };
      
      img.src = URL.createObjectURL(file);
    });
  }
  
  static async deletePhoto(path) {
    const supabase = window.supabaseClient;
    if (!supabase) return;
    
    try {
      const { error } = await supabase.storage
        .from('photos')
        .remove([path]);
      
      if (error) {
        console.warn("Failed to delete photo:", error);
      }
    } catch (error) {
      console.warn("Photo deletion error:", error);
    }
  }
  
  static async uploadMultiplePhotos(files, folder = 'sanitation-photos') {
    const results = [];
    
    for (let i = 0; i < Math.min(files.length, 3); i++) { // Limit to 3 photos
      try {
        const result = await this.uploadPhoto(files[i], folder);
        results.push(result);
      } catch (error) {
        console.error(`Failed to upload photo ${i + 1}:`, error);
        results.push({ success: false, error: error.message });
      }
    }
    
    return results;
  }
  
  // Migrate existing base64 photos to storage
  static async migrateBase64Photos() {
    const supabase = window.supabaseClient;
    if (!supabase) return;
    
    console.log("Starting photo migration...");
    
    try {
      // Get all records with base64 photos
      const tables = ['damage_reports', 'handover_tasks', 'post_release_findings'];
      
      for (const table of tables) {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .or('photos.not.is.null,completed_photo.not.is.null,photo.not.is.null');
        
        if (error) {
          console.error(`Error fetching ${table}:`, error);
          continue;
        }
        
        for (const record of data || []) {
          await this.migrateRecordPhotos(table, record);
        }
      }
      
      console.log("Photo migration completed");
    } catch (error) {
      console.error("Migration failed:", error);
    }
  }
  
  static async migrateRecordPhotos(table, record) {
    const supabase = window.supabaseClient;
    
    try {
      const updates = {};
      
      // Handle different photo field names
      if (record.photo && record.photo.startsWith('data:image')) {
        const photoResult = await this.uploadBase64Photo(record.photo, `${table}/${record.id}`);
        if (photoResult.success) {
          updates.photo = photoResult.url;
        }
      }
      
      if (record.completed_photo && record.completed_photo.startsWith('data:image')) {
        const photoResult = await this.uploadBase64Photo(record.completed_photo, `${table}/${record.id}/completed`);
        if (photoResult.success) {
          updates.completed_photo = photoResult.url;
        }
      }
      
      if (record.photos && Array.isArray(record.photos)) {
        const migratedPhotos = [];
        for (let i = 0; i < record.photos.length; i++) {
          const photo = record.photos[i];
          if (photo && photo.startsWith('data:image')) {
            const photoResult = await this.uploadBase64Photo(photo, `${table}/${record.id}/photo-${i}`);
            if (photoResult.success) {
              migratedPhotos.push(photoResult.url);
            }
          } else {
            migratedPhotos.push(photo);
          }
        }
        updates.photos = migratedPhotos;
      }
      
      // Update record if we made changes
      if (Object.keys(updates).length > 0) {
        await supabase.from(table).update(updates).eq('id', record.id);
        console.log(`Migrated photos for ${table} record ${record.id}`);
      }
      
    } catch (error) {
      console.error(`Failed to migrate ${table} record ${record.id}:`, error);
    }
  }
  
  static async uploadBase64Photo(base64String, folder) {
    try {
      // Convert base64 to blob
      const response = await fetch(base64String);
      const blob = await response.blob();
      
      // Create file object
      const file = new File([blob], 'photo.jpg', { type: 'image/jpeg' });
      
      return await this.uploadPhoto(file, folder);
    } catch (error) {
      console.error("Base64 photo upload failed:", error);
      return { success: false, error: error.message };
    }
  }
  
  // Initialize storage bucket (run once)
  static async initializeStorage() {
    const supabase = window.supabaseClient;
    if (!supabase) return;
    
    try {
      // Check if bucket exists, create if not
      const { data, error } = await supabase.storage.getBucket('photos');
      
      if (error && error.message.includes('not found')) {
        const { error: createError } = await supabase.storage.createBucket('photos', {
          public: true,
          allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
          fileSizeLimit: 5242880 // 5MB limit
        });
        
        if (createError) {
          console.error("Failed to create storage bucket:", createError);
        } else {
          console.log("Storage bucket created successfully");
        }
      }
    } catch (error) {
      console.error("Storage initialization error:", error);
    }
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PhotoStorage };
}
