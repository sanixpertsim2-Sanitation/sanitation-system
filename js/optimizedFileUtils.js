// Optimized file processing utilities
class OptimizedFileUtils {
  static processingQueue = [];
  static isProcessing = false;
  static fileCache = new Map();
  static MAX_CACHE_SIZE = 50;
  static MAX_CONCURRENT = 3;
  static currentProcessing = 0;

  /**
   * Process file with queue management and caching
   */
  static async processFile(file, processor, options = {}) {
    const {
      cacheKey = null,
      priority = 'normal',
      skipCache = false
    } = options;

    // Check cache first
    if (cacheKey && !skipCache && this.fileCache.has(cacheKey)) {
      return this.fileCache.get(cacheKey);
    }

    return new Promise((resolve, reject) => {
      this.processingQueue.push({
        file,
        processor,
        cacheKey,
        priority,
        resolve,
        reject,
        timestamp: Date.now()
      });

      // Sort by priority
      this.processingQueue.sort((a, b) => {
        const priorityOrder = { high: 0, normal: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });

      if (!this.isProcessing) {
        this.processQueue();
      }
    });
  }

  /**
   * Process queue with concurrency control
   */
  static async processQueue() {
    this.isProcessing = true;

    while (this.processingQueue.length > 0 && this.currentProcessing < this.MAX_CONCURRENT) {
      const item = this.processingQueue.shift();
      this.currentProcessing++;

      // Process item asynchronously
      this.processItem(item).finally(() => {
        this.currentProcessing--;
        if (this.processingQueue.length > 0 && this.currentProcessing < this.MAX_CONCURRENT) {
          this.processQueue();
        } else if (this.processingQueue.length === 0 && this.currentProcessing === 0) {
          this.isProcessing = false;
        }
      });
    }
  }

  /**
   * Process individual file item
   */
  static async processItem(item) {
    try {
      const result = await item.processor(item.file);
      
      // Cache result if cache key provided
      if (item.cacheKey) {
        this.cacheFile(item.cacheKey, result);
      }
      
      item.resolve(result);
    } catch (error) {
      console.error('File processing failed:', error);
      item.reject(error);
    }
  }

  /**
   * Cache file with size management
   */
  static cacheFile(key, data) {
    // Remove oldest item if cache is full
    if (this.fileCache.size >= this.MAX_CACHE_SIZE) {
      const oldestKey = this.fileCache.keys().next().value;
      this.fileCache.delete(oldestKey);
    }
    
    this.fileCache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Optimized image processing with memory management
   */
  static async processImage(file, options = {}) {
    const {
      maxWidth = 1920,
      maxHeight = 1080,
      quality = 0.8,
      format = 'image/jpeg'
    } = options;

    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      img.onload = () => {
        try {
          // Calculate dimensions
          let { width, height } = this.calculateDimensions(
            img.width, img.height, maxWidth, maxHeight
          );

          canvas.width = width;
          canvas.height = height;

          // Draw and compress
          ctx.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob((blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Canvas to blob conversion failed'));
            }
          }, format, quality);
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => reject(new Error('Image load failed'));
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Calculate optimal dimensions maintaining aspect ratio
   */
  static calculateDimensions(width, height, maxWidth, maxHeight) {
    if (width <= maxWidth && height <= maxHeight) {
      return { width, height };
    }

    const aspectRatio = width / height;
    
    if (width > maxWidth) {
      width = maxWidth;
      height = width / aspectRatio;
    }
    
    if (height > maxHeight) {
      height = maxHeight;
      width = height * aspectRatio;
    }

    return { 
      width: Math.round(width), 
      height: Math.round(height) 
    };
  }

  /**
   * Batch process multiple files
   */
  static async processFiles(files, processor, options = {}) {
    const { batchSize = 3, delay = 100 } = options;
    const results = [];
    
    for (let i = 0; i < files.length; i += batchSize) {
      const batch = files.slice(i, i + batchSize);
      const batchPromises = batch.map(file => 
        this.processFile(file, processor, { ...options, priority: 'normal' })
      );
      
      try {
        const batchResults = await Promise.allSettled(batchPromises);
        results.push(...batchResults);
      } catch (error) {
        console.error('Batch processing failed:', error);
      }
      
      // Add delay between batches
      if (i + batchSize < files.length && delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    return results;
  }

  /**
   * Validate file before processing
   */
  static validateFile(file, options = {}) {
    const {
      maxSize = 10 * 1024 * 1024, // 10MB
      allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
      minSize = 0
    } = options;

    if (file.size > maxSize) {
      throw new Error(`File size ${Math.round(file.size / 1024 / 1024)}MB exceeds maximum ${Math.round(maxSize / 1024 / 1024)}MB`);
    }

    if (file.size < minSize) {
      throw new Error(`File size ${file.size} bytes is below minimum ${minSize} bytes`);
    }

    if (!allowedTypes.includes(file.type)) {
      throw new Error(`File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`);
    }

    return true;
  }

  /**
   * Read file with memory optimization
   */
  static async readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('File reading failed'));
      
      // Read in chunks for large files
      if (file.size > 5 * 1024 * 1024) { // 5MB
        reader.readAsArrayBuffer(file);
      } else {
        reader.readAsDataURL(file);
      }
    });
  }

  /**
   * Get file info efficiently
   */
  static getFileInfo(file) {
    return {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
      sizeFormatted: this.formatFileSize(file.size)
    };
  }

  /**
   * Format file size for display
   */
  static formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Clear cache
   */
  static clearCache() {
    this.fileCache.clear();
  }

  /**
   * Clear queue
   */
  static clearQueue() {
    this.processingQueue = [];
    this.currentProcessing = 0;
    this.isProcessing = false;
  }

  /**
   * Get processing statistics
   */
  static getStats() {
    return {
      queueLength: this.processingQueue.length,
      isProcessing: this.isProcessing,
      currentProcessing: this.currentProcessing,
      cacheSize: this.fileCache.size,
      maxConcurrent: this.MAX_CONCURRENT
    };
  }

  /**
   * Cleanup resources
   */
  static cleanup() {
    this.clearQueue();
    this.clearCache();
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { OptimizedFileUtils };
}

// Global cleanup
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', OptimizedFileUtils.cleanup);
}
