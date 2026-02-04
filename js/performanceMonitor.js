// Performance monitoring and metrics collection
class PerformanceMonitor {
  static metrics = {
    domQueries: 0,
    dbCalls: 0,
    fileProcessing: 0,
    cacheHits: 0,
    cacheMisses: 0,
    errors: 0,
    warnings: 0
  };

  static timings = new Map();
  static observers = [];
  static isMonitoring = false;
  static reportInterval = null;
  static MEMORY_THRESHOLD = 50 * 1024 * 1024; // 50MB

  /**
   * Start performance monitoring
   */
  static startMonitoring(options = {}) {
    const {
      enableMemoryMonitoring = true,
      enableNetworkMonitoring = true,
      enableUserTiming = true,
      reportInterval = 30000 // 30 seconds
    } = options;

    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.resetMetrics();

    // Start memory monitoring
    if (enableMemoryMonitoring && performance.memory) {
      this.startMemoryMonitoring();
    }

    // Start network monitoring
    if (enableNetworkMonitoring) {
      this.startNetworkMonitoring();
    }

    // Start user timing monitoring
    if (enableUserTiming) {
      this.startUserTimingMonitoring();
    }

    // Start periodic reporting
    if (reportInterval > 0) {
      this.startPeriodicReporting(reportInterval);
    }

    console.log('Performance monitoring started');
  }

  /**
   * Stop performance monitoring
   */
  static stopMonitoring() {
    this.isMonitoring = false;
    
    if (this.reportInterval) {
      clearInterval(this.reportInterval);
      this.reportInterval = null;
    }

    this.observers.forEach(observer => {
      if (observer && observer.disconnect) {
        observer.disconnect();
      }
    });
    this.observers = [];

    console.log('Performance monitoring stopped');
  }

  /**
   * Track DOM query performance
   */
  static trackDomQuery(selector, duration) {
    this.metrics.domQueries++;
    
    if (duration > 10) { // Queries taking more than 10ms
      this.addWarning(`Slow DOM query: ${selector} took ${duration}ms`);
    }

    this.recordTiming('dom-query', selector, duration);
  }

  /**
   * Track database call performance
   */
  static trackDbCall(operation, duration, success = true) {
    this.metrics.dbCalls++;
    
    if (!success) {
      this.metrics.errors++;
    }

    if (duration > 1000) { // DB calls taking more than 1 second
      this.addWarning(`Slow database call: ${operation} took ${duration}ms`);
    }

    this.recordTiming('db-call', operation, duration);
  }

  /**
   * Track file processing performance
   */
  static trackFileProcessing(operation, fileSize, duration) {
    this.metrics.fileProcessing++;
    
    const throughput = fileSize / (duration / 1000); // bytes per second
    if (throughput < 1024 * 1024) { // Less than 1MB/s
      this.addWarning(`Slow file processing: ${operation} - ${Math.round(throughput / 1024)}KB/s`);
    }

    this.recordTiming('file-processing', operation, duration, {
      fileSize,
      throughput
    });
  }

  /**
   * Track cache performance
   */
  static trackCacheHit(key) {
    this.metrics.cacheHits++;
    this.recordTiming('cache', `hit-${key}`, 0);
  }

  static trackCacheMiss(key) {
    this.metrics.cacheMisses++;
    this.recordTiming('cache', `miss-${key}`, 0);
  }

  /**
   * Record timing with metadata
   */
  static recordTiming(category, name, duration, metadata = {}) {
    const key = `${category}-${name}`;
    const timing = {
      category,
      name,
      duration,
      timestamp: Date.now(),
      metadata
    };

    if (!this.timings.has(key)) {
      this.timings.set(key, []);
    }
    
    this.timings.get(key).push(timing);

    // Keep only last 100 entries per timing
    const entries = this.timings.get(key);
    if (entries.length > 100) {
      entries.shift();
    }
  }

  /**
   * Start memory monitoring
   */
  static startMemoryMonitoring() {
    const checkMemory = () => {
      if (!performance.memory) return;

      const memory = performance.memory;
      const used = memory.usedJSHeapSize;
      
      if (used > this.MEMORY_THRESHOLD) {
        this.addWarning(`High memory usage: ${Math.round(used / 1024 / 1024)}MB`);
      }

      this.recordTiming('memory', 'heap-size', used, {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit
      });
    };

    // Check memory every 5 seconds
    setInterval(checkMemory, 5000);
  }

  /**
   * Start network monitoring
   */
  static startNetworkMonitoring() {
    if (!window.PerformanceObserver) return;

    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach(entry => {
        if (entry.entryType === 'resource') {
          const duration = entry.responseEnd - entry.requestStart;
          
          if (duration > 3000) { // Resources taking more than 3 seconds
            this.addWarning(`Slow resource: ${entry.name} took ${duration}ms`);
          }

          this.recordTiming('network', entry.name, duration, {
            type: entry.initiatorType,
            size: entry.transferSize
          });
        }
      });
    });

    observer.observe({ entryTypes: ['resource'] });
    this.observers.push(observer);
  }

  /**
   * Start user timing monitoring
   */
  static startUserTimingMonitoring() {
    if (!window.PerformanceObserver) return;

    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach(entry => {
        if (entry.entryType === 'measure') {
          this.recordTiming('user-timing', entry.name, entry.duration);
        }
      });
    });

    observer.observe({ entryTypes: ['measure', 'navigation'] });
    this.observers.push(observer);
  }

  /**
   * Start periodic reporting
   */
  static startPeriodicReporting(interval) {
    this.reportInterval = setInterval(() => {
      const report = this.generateReport();
      console.log('Performance Report:', report);
      
      // Check for performance issues
      this.checkPerformanceIssues(report);
    }, interval);
  }

  /**
   * Generate performance report
   */
  static generateReport() {
    const report = {
      timestamp: Date.now(),
      metrics: { ...this.metrics },
      memory: this.getMemoryInfo(),
      timings: this.getTimingSummary(),
      cache: this.getCacheStats()
    };

    return report;
  }

  /**
   * Get memory information
   */
  static getMemoryInfo() {
    if (!performance.memory) return null;

    return {
      used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
      total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
      limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
    };
  }

  /**
   * Get timing summary
   */
  static getTimingSummary() {
    const summary = {};
    
    for (const [key, entries] of this.timings.entries()) {
      const durations = entries.map(e => e.duration);
      summary[key] = {
        count: entries.length,
        average: durations.reduce((a, b) => a + b, 0) / durations.length,
        min: Math.min(...durations),
        max: Math.max(...durations),
        latest: entries[entries.length - 1]
      };
    }

    return summary;
  }

  /**
   * Get cache statistics
   */
  static getCacheStats() {
    const total = this.metrics.cacheHits + this.metrics.cacheMisses;
    return {
      hits: this.metrics.cacheHits,
      misses: this.metrics.cacheMisses,
      total,
      hitRate: total > 0 ? (this.metrics.cacheHits / total * 100).toFixed(2) + '%' : '0%'
    };
  }

  /**
   * Check for performance issues
   */
  static checkPerformanceIssues(report) {
    const issues = [];

    // Check memory usage
    if (report.memory && report.memory.used > 80) {
      issues.push('High memory usage detected');
    }

    // Check cache hit rate
    const cacheHitRate = parseFloat(report.cache.hitRate);
    if (cacheHitRate < 50) {
      issues.push('Low cache hit rate');
    }

    // Check for slow operations
    Object.entries(report.timings).forEach(([key, timing]) => {
      if (timing.average > 100) {
        issues.push(`Slow operation: ${key} (avg: ${timing.average.toFixed(2)}ms)`);
      }
    });

    if (issues.length > 0) {
      console.warn('Performance issues detected:', issues);
    }
  }

  /**
   * Add warning
   */
  static addWarning(message) {
    this.metrics.warnings++;
    console.warn(`Performance Warning: ${message}`);
  }

  /**
   * Measure function performance
   */
  static async measureFunction(name, fn, metadata = {}) {
    const start = performance.now();
    
    try {
      const result = await fn();
      const duration = performance.now() - start;
      
      this.recordTiming('function', name, duration, metadata);
      
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      
      this.metrics.errors++;
      this.recordTiming('function-error', name, duration, { 
        error: error.message,
        ...metadata 
      });
      
      throw error;
    }
  }

  /**
   * Get current metrics
   */
  static getMetrics() {
    return {
      ...this.metrics,
      memory: this.getMemoryInfo(),
      cache: this.getCacheStats()
    };
  }

  /**
   * Reset all metrics
   */
  static resetMetrics() {
    this.metrics = {
      domQueries: 0,
      dbCalls: 0,
      fileProcessing: 0,
      cacheHits: 0,
      cacheMisses: 0,
      errors: 0,
      warnings: 0
    };
    this.timings.clear();
  }

  /**
   * Export metrics for analysis
   */
  static exportMetrics() {
    return {
      report: this.generateReport(),
      rawTimings: Array.from(this.timings.entries()).map(([key, entries]) => ({
        key,
        entries
      }))
    };
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PerformanceMonitor };
}

// Auto-start monitoring in development
if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
  PerformanceMonitor.startMonitoring();
}
