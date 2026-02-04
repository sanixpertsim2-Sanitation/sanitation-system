/*
 * SANIXPERT MOBILE PHOTO UTILITIES
 * Optimized photo handling for mobile devices
 * Solves: Large file sizes, slow uploads, memory issues
 */

class MobilePhotoUtils {
  constructor() {
    this.maxFileSize = 5 * 1024 * 1024; // 5MB
    this.maxWidth = 1200;
    this.maxHeight = 1200;
    this.quality = 0.8;
    this.supportedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  }

  // ========================================
  // PHOTO CAPTURE & SELECTION
  // ========================================
  
  // Capture photo from camera
  async capturePhoto(inputElement) {
    return new Promise((resolve, reject) => {
      if (!inputElement || !inputElement.files) {
        reject(new Error('Invalid input element'));
        return;
      }

      const file = inputElement.files[0];
      if (!file) {
        reject(new Error('No file selected'));
        return;
      }

      this.processPhoto(file)
        .then(processedPhoto => resolve(processedPhoto))
        .catch(error => reject(error));
    });
  }

  // Multiple photos from input
  async captureMultiplePhotos(inputElement) {
    return new Promise((resolve, reject) => {
      if (!inputElement || !inputElement.files) {
        reject(new Error('Invalid input element'));
        return;
      }

      const files = Array.from(inputElement.files);
      if (files.length === 0) {
        reject(new Error('No files selected'));
        return;
      }

      const processPromises = files.map(file => this.processPhoto(file));
      
      Promise.all(processPromises)
        .then(processedPhotos => resolve(processedPhotos))
        .catch(error => reject(error));
    });
  }

  // ========================================
  // PHOTO PROCESSING & OPTIMIZATION
  // ========================================
  
  // Process and optimize photo
  async processPhoto(file) {
    try {
      // Validate file
      this.validateFile(file);
      
      // Create image element
      const img = await this.loadImage(file);
      
      // Calculate dimensions
      const dimensions = this.calculateDimensions(img.width, img.height);
      
      // Create canvas
      const canvas = document.createElement('canvas');
      canvas.width = dimensions.width;
      canvas.height = dimensions.height;
      
      // Draw and compress
      const compressedDataUrl = await this.compressImage(img, canvas, dimensions);
      
      // Create processed photo object
      const processedPhoto = {
        original: {
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified
        },
        processed: {
          dataUrl: compressedDataUrl,
          size: this.getDataUrlSize(compressedDataUrl),
          width: dimensions.width,
          height: dimensions.height,
          format: 'image/jpeg',
          quality: this.quality,
          processedAt: new Date().toISOString()
        },
        compression: {
          originalSize: file.size,
          compressedSize: this.getDataUrlSize(compressedDataUrl),
          compressionRatio: ((file.size - this.getDataUrlSize(compressedDataUrl)) / file.size * 100).toFixed(1)
        }
      };
      
      console.log(`Photo processed: ${processedPhoto.compression.compressionRatio}% compression`);
      return processedPhoto;
      
    } catch (error) {
      console.error('Error processing photo:', error);
      throw error;
    }
  }

  // Validate file
  validateFile(file) {
    // Check file type
    if (!this.supportedFormats.includes(file.type)) {
      throw new Error(`Unsupported file type: ${file.type}`);
    }
    
    // Check file size
    if (file.size > this.maxFileSize) {
      throw new Error(`File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB (max: ${this.maxFileSize / 1024 / 1024}MB)`);
    }
    
    return true;
  }

  // Load image from file
  loadImage(file) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Failed to load image'));
      
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target.result;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }

  // Calculate optimal dimensions
  calculateDimensions(originalWidth, originalHeight) {
    let { width, height } = { width: originalWidth, height: originalHeight };
    
    // Calculate ratio
    const ratio = Math.min(this.maxWidth / width, this.maxHeight / height);
    
    // Only resize if needed
    if (ratio < 1) {
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);
    }
    
    return { width, height };
  }

  // Compress image
  async compressImage(img, canvas, dimensions) {
    return new Promise((resolve) => {
      const ctx = canvas.getContext('2d');
      
      // Set background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, dimensions.width, dimensions.height);
      
      // Draw image
      ctx.drawImage(img, 0, 0, dimensions.width, dimensions.height);
      
      // Convert to data URL
      const dataUrl = canvas.toDataURL('image/jpeg', this.quality);
      resolve(dataUrl);
    });
  }

  // Get data URL size
  getDataUrlSize(dataUrl) {
    const base64 = dataUrl.split(',')[1];
    return base64.length * 0.75; // Approximate size
  }

  // ========================================
  // PHOTO PREVIEW & MANAGEMENT
  // ========================================
  
  // Create photo preview element
  createPreviewElement(processedPhoto, index, onRemove) {
    const preview = document.createElement('div');
    preview.className = 'mobile-photo-preview';
    preview.style.cssText = `
      position: relative;
      display: inline-block;
      margin: 8px;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      background: rgba(255,255,255,0.05);
    `;
    
    preview.innerHTML = `
      <img src="${processedPhoto.processed.dataUrl}" style="width: 80px; height: 80px; object-fit: cover;">
      <div class="photo-info" style="
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        background: rgba(0,0,0,0.7);
        color: white;
        padding: 4px;
        font-size: 10px;
        text-align: center;
      ">
        ${processedPhoto.processed.width}×${processedPhoto.processed.height}
      </div>
      <button type="button" class="remove-photo" style="
        position: absolute;
        top: 4px;
        right: 4px;
        background: rgba(239, 68, 68, 0.9);
        color: white;
        border: none;
        border-radius: 50%;
        width: 20px;
        height: 20px;
        font-size: 12px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
      ">×</button>
    `;
    
    // Add remove handler
    const removeBtn = preview.querySelector('.remove-photo');
    removeBtn.addEventListener('click', () => {
      if (onRemove) onRemove(index);
      preview.remove();
    });
    
    return preview;
  }

  // Create photo preview container
  createPreviewContainer() {
    const container = document.createElement('div');
    container.className = 'mobile-photo-preview-container';
    container.style.cssText = `
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin: 12px 0;
      padding: 12px;
      background: rgba(255,255,255,0.02);
      border-radius: 8px;
      border: 1px solid rgba(255,255,255,0.1);
    `;
    
    return container;
  }

  // ========================================
  // BATCH PROCESSING
  // ========================================
  
  // Process multiple photos with progress
  async processBatchPhotos(files, onProgress) {
    const results = [];
    const total = files.length;
    
    for (let i = 0; i < total; i++) {
      try {
        const processedPhoto = await this.processPhoto(files[i]);
        results.push(processedPhoto);
        
        if (onProgress) {
          onProgress({
            current: i + 1,
            total: total,
            progress: ((i + 1) / total) * 100,
            currentFile: files[i].name
          });
        }
        
        // Small delay to prevent blocking
        await new Promise(resolve => setTimeout(resolve, 50));
        
      } catch (error) {
        console.error(`Error processing photo ${files[i].name}:`, error);
        results.push({ error: error.message, file: files[i].name });
      }
    }
    
    return results;
  }

  // ========================================
  // STORAGE & UPLOAD
  // ========================================
  
  // Convert to upload format
  prepareForUpload(processedPhotos) {
    return processedPhotos.map(photo => {
      if (photo.error) {
        return { error: photo.error, name: photo.file };
      }
      
      return {
        name: photo.original.name,
        data: photo.processed.dataUrl,
        size: photo.processed.size,
        width: photo.processed.width,
        height: photo.processed.height,
        compression: photo.compression.compressionRatio
      };
    });
  }

  // Estimate upload size
  estimateUploadSize(processedPhotos) {
    return processedPhotos.reduce((total, photo) => {
      return total + (photo.processed?.size || 0);
    }, 0);
  }

  // ========================================
  // UTILITY METHODS
  // ========================================
  
  // Format file size
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  // Get photo metadata
  getPhotoMetadata(processedPhoto) {
    return {
      original: {
        name: processedPhoto.original.name,
        size: this.formatFileSize(processedPhoto.original.size),
        type: processedPhoto.original.type
      },
      processed: {
        size: this.formatFileSize(processedPhoto.processed.size),
        dimensions: `${processedPhoto.processed.width}×${processedPhoto.processed.height}`,
        format: processedPhoto.processed.format,
        quality: `${Math.round(processedPhoto.processed.quality * 100)}%`
      },
      compression: {
        ratio: `${processedPhoto.compression.compressionRatio}%`,
        saved: this.formatFileSize(processedPhoto.compression.originalSize - processedPhoto.compression.compressedSize)
      }
    };
  }

  // Validate photo quality
  validatePhotoQuality(processedPhoto) {
    const issues = [];
    
    // Check compression ratio
    if (processedPhoto.compression.compressionRatio < 10) {
      issues.push('Low compression - file could be smaller');
    }
    
    // Check dimensions
    if (processedPhoto.processed.width < 400 || processedPhoto.processed.height < 400) {
      issues.push('Low resolution - may affect quality');
    }
    
    // Check file size
    if (processedPhoto.processed.size > 2 * 1024 * 1024) {
      issues.push('Large file size - may affect upload speed');
    }
    
    return {
      isValid: issues.length === 0,
      issues: issues
    };
  }
}

// ========================================
// GLOBAL INITIALIZATION
// ========================================
window.MobilePhotoUtils = MobilePhotoUtils;

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MobilePhotoUtils };
}

// Auto-initialize photo utilities
window.mobilePhotoUtils = new MobilePhotoUtils();
