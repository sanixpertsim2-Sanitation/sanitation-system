// Performance optimization utilities for sanitation system
class PerformanceOptimizer {
  // Cache for DOM elements to avoid repeated queries
  static domCache = new Map();
  
  // Cache for database queries with TTL
  static dbCache = new Map();
  static CACHE_TTL = 30000; // 30 seconds
  
  // Debounced function cache
  static debounceCache = new Map();
  
  // Performance monitoring
  static metrics = {
    domQueries: 0,
    dbCalls: 0,
    cacheHits: 0,
    cacheMisses: 0
  };

  /**
   * Get DOM element with caching
   */
  static getElement(selector, useCache = true) {
    this.metrics.domQueries++;
    
    if (useCache && this.domCache.has(selector)) {
      this.metrics.cacheHits++;
      const cached = this.domCache.get(selector);
      // Verify element is still in DOM
      if (cached && document.contains(cached)) {
        return cached;
      }
      this.domCache.delete(selector);
    }
    
    this.metrics.cacheMisses++;
    const element = document.querySelector(selector);
    if (useCache && element) {
      this.domCache.set(selector, element);
    }
    return element;
  }

  /**
   * Get multiple DOM elements efficiently
   */
  static getElements(selector, useCache = true) {
    this.metrics.domQueries++;
    return document.querySelectorAll(selector);
  }

  /**
   * Clear DOM cache for specific selector or all
   */
  static clearDomCache(selector = null) {
    if (selector) {
      this.domCache.delete(selector);
    } else {
      this.domCache.clear();
    }
  }

  /**
   * Cached database query with TTL
   */
  static async cachedDbQuery(key, queryFn, ttl = this.CACHE_TTL) {
    this.metrics.dbCalls++;
    
    const cached = this.dbCache.get(key);
    const now = Date.now();
    
    if (cached && (now - cached.timestamp) < ttl) {
      this.metrics.cacheHits++;
      return cached.data;
    }
    
    this.metrics.cacheMisses++;
    try {
      const data = await queryFn();
      this.dbCache.set(key, {
        data,
        timestamp: now
      });
      return data;
    } catch (error) {
      console.error(`Database query failed for key: ${key}`, error);
      throw error;
    }
  }

  /**
   * Clear database cache
   */
  static clearDbCache(key = null) {
    if (key) {
      this.dbCache.delete(key);
    } else {
      this.dbCache.clear();
    }
  }

  /**
   * Optimized debounce with caching
   */
  static debounce(func, delay = 300, key = null) {
    const debounceKey = key || func.toString();
    
    if (this.debounceCache.has(debounceKey)) {
      return this.debounceCache.get(debounceKey);
    }
    
    let timeoutId;
    const debouncedFunc = (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
    
    this.debounceCache.set(debounceKey, debouncedFunc);
    return debouncedFunc;
  }

  /**
   * Batch DOM updates for better performance
   */
  static batchDomUpdates(updates) {
    // Use requestAnimationFrame for smooth updates
    requestAnimationFrame(() => {
      updates.forEach(update => {
        try {
          update();
        } catch (error) {
          console.error('DOM update failed:', error);
        }
      });
    });
  }

  /**
   * Optimized event delegation
   */
  static delegateEvent(parentSelector, eventType, childSelector, handler) {
    const parent = this.getElement(parentSelector);
    if (!parent) return;

    parent.addEventListener(eventType, (event) => {
      const target = event.target.closest(childSelector);
      if (target && parent.contains(target)) {
        handler.call(target, event);
      }
    });
  }

  /**
   * Memory cleanup
   */
  static cleanup() {
    this.domCache.clear();
    this.dbCache.clear();
    this.debounceCache.clear();
  }

  /**
   * Get performance metrics
   */
  static getMetrics() {
    return { ...this.metrics };
  }

  /**
   * Reset performance metrics
   */
  static resetMetrics() {
    this.metrics = {
      domQueries: 0,
      dbCalls: 0,
      cacheHits: 0,
      cacheMisses: 0
    };
  }
}

// Database query optimizer
class DbOptimizer {
  static queryQueue = new Map();
  static pendingQueries = new Set();

  /**
   * Batch similar database queries
   */
  static async batchQuery(queryKey, queryFn, batchDelay = 100) {
    if (this.queryQueue.has(queryKey)) {
      return new Promise((resolve, reject) => {
        this.queryQueue.get(queryKey).push({ resolve, reject, queryFn });
      });
    }

    this.queryQueue.set(queryKey, []);
    
    // Wait for more queries to batch
    await new Promise(resolve => setTimeout(resolve, batchDelay));
    
    const queries = this.queryQueue.get(queryKey);
    this.queryQueue.delete(queryKey);
    
    if (queries.length === 1) {
      // Single query, execute directly
      try {
        const result = await queries[0].queryFn();
        queries[0].resolve(result);
      } catch (error) {
        queries[0].reject(error);
      }
    } else {
      // Multiple queries, execute in parallel
      const promises = queries.map(async ({ queryFn, resolve, reject }) => {
        try {
          const result = await queryFn();
          resolve(result);
          return result;
        } catch (error) {
          reject(error);
          throw error;
        }
      });
      
      await Promise.allSettled(promises);
    }
  }

  /**
   * Clear query queue
   */
  static clearQueue() {
    this.queryQueue.clear();
    this.pendingQueries.clear();
  }
}

// File processing optimizer
class FileOptimizer {
  static fileCache = new Map();
  static processingQueue = [];
  static isProcessing = false;

  /**
   * Optimize file processing with queue
   */
  static async processFile(file, processor, cacheKey = null) {
    if (cacheKey && this.fileCache.has(cacheKey)) {
      return this.fileCache.get(cacheKey);
    }

    return new Promise((resolve, reject) => {
      this.processingQueue.push({
        file,
        processor,
        cacheKey,
        resolve,
        reject
      });

      if (!this.isProcessing) {
        this.processQueue();
      }
    });
  }

  /**
   * Process file queue sequentially to avoid memory spikes
   */
  static async processQueue() {
    this.isProcessing = true;
    
    while (this.processingQueue.length > 0) {
      const item = this.processingQueue.shift();
      
      try {
        const result = await item.processor(item.file);
        
        if (item.cacheKey) {
          // Limit cache size
          if (this.fileCache.size > 50) {
            const firstKey = this.fileCache.keys().next().value;
            this.fileCache.delete(firstKey);
          }
          this.fileCache.set(item.cacheKey, result);
        }
        
        item.resolve(result);
      } catch (error) {
        item.reject(error);
      }
    }
    
    this.isProcessing = false;
  }

  /**
   * Clear file cache
   */
  static clearCache() {
    this.fileCache.clear();
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { 
    PerformanceOptimizer, 
    DbOptimizer, 
    FileOptimizer 
  };
}

// Global cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    PerformanceOptimizer.cleanup();
    DbOptimizer.clearQueue();
    FileOptimizer.clearCache();
  });
}
