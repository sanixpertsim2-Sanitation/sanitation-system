// Optimized database utilities with caching and batching
class OptimizedDbUtils {
  static cache = new Map();
  static CACHE_TTL = 30000; // 30 seconds
  static pendingQueries = new Map();
  static batchQueue = [];
  static batchTimer = null;
  static BATCH_DELAY = 100;

  /**
   * Cached database query with automatic batching
   */
  static async cachedQuery(cacheKey, queryFn, options = {}) {
    const {
      ttl = this.CACHE_TTL,
      enableBatching = true,
      priority = 'normal'
    } = options;

    // Check cache first
    const cached = this.cache.get(cacheKey);
    const now = Date.now();
    
    if (cached && (now - cached.timestamp) < ttl) {
      return cached.data;
    }

    // If batching is enabled, add to batch queue
    if (enableBatching) {
      return this.addToBatch(cacheKey, queryFn, priority);
    }

    // Execute immediately
    return this.executeQuery(cacheKey, queryFn);
  }

  /**
   * Add query to batch queue
   */
  static addToBatch(cacheKey, queryFn, priority) {
    return new Promise((resolve, reject) => {
      this.batchQueue.push({
        cacheKey,
        queryFn,
        resolve,
        reject,
        priority,
        timestamp: Date.now()
      });

      // Sort by priority (high first)
      this.batchQueue.sort((a, b) => {
        const priorityOrder = { high: 0, normal: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });

      // Start batch timer if not already running
      if (!this.batchTimer) {
        this.batchTimer = setTimeout(() => this.processBatch(), this.BATCH_DELAY);
      }
    });
  }

  /**
   * Process batched queries
   */
  static async processBatch() {
    if (this.batchQueue.length === 0) {
      this.batchTimer = null;
      return;
    }

    const batch = this.batchQueue.splice(0, 10); // Process max 10 queries at once
    this.batchTimer = null;

    // Group similar queries for optimization
    const queryGroups = this.groupSimilarQueries(batch);

    // Process each group
    await Promise.allSettled(
      queryGroups.map(group => this.processQueryGroup(group))
    );

    // Continue processing if more queries are queued
    if (this.batchQueue.length > 0) {
      this.batchTimer = setTimeout(() => this.processBatch(), this.BATCH_DELAY);
    }
  }

  /**
   * Group similar queries for optimization
   */
  static groupSimilarQueries(queries) {
    const groups = new Map();
    
    queries.forEach(query => {
      const queryType = this.getQueryType(query.queryFn);
      if (!groups.has(queryType)) {
        groups.set(queryType, []);
      }
      groups.get(queryType).push(query);
    });
    
    return Array.from(groups.values());
  }

  /**
   * Get query type for grouping
   */
  static getQueryType(queryFn) {
    const queryStr = queryFn.toString();
    
    if (queryStr.includes('pre_cleaning_logs')) return 'pre_clean';
    if (queryStr.includes('post_cleaning_logs')) return 'post_clean';
    if (queryStr.includes('damage_reports')) return 'damage';
    if (queryStr.includes('handover_tasks')) return 'handover';
    if (queryStr.includes('area_inspection_logs')) return 'inspection';
    if (queryStr.includes('line_release_logs')) return 'release';
    
    return 'other';
  }

  /**
   * Process a group of similar queries
   */
  static async processQueryGroup(group) {
    // Execute queries in parallel with concurrency limit
    const concurrencyLimit = 3;
    const chunks = [];
    
    for (let i = 0; i < group.length; i += concurrencyLimit) {
      chunks.push(group.slice(i, i + concurrencyLimit));
    }

    for (const chunk of chunks) {
      await Promise.allSettled(
        chunk.map(query => this.executeQuery(query.cacheKey, query.queryFn, query.resolve, query.reject))
      );
    }
  }

  /**
   * Execute single query
   */
  static async executeQuery(cacheKey, queryFn, resolve, reject) {
    try {
      const result = await queryFn();
      
      // Cache the result
      this.cache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });
      
      // Limit cache size
      if (this.cache.size > 100) {
        const oldestKey = this.cache.keys().next().value;
        this.cache.delete(oldestKey);
      }
      
      if (resolve) resolve(result);
      return result;
    } catch (error) {
      console.error(`Database query failed for key: ${cacheKey}`, error);
      if (reject) reject(error);
      throw error;
    }
  }

  /**
   * Optimized fetch latest preclean
   */
  static async fetchLatestPreclean(area) {
    const supabase = window.supabaseClient;
    if (!supabase) return null;

    return this.cachedQuery(
      `preclean-${area}`,
      async () => {
        const { data, error } = await supabase
          .from("pre_cleaning_logs")
          .select("*")
          .eq("area", area)
          .order("submitted_at", { ascending: false })
          .limit(1);
        
        if (error) throw error;
        return data && data.length ? data[0] : null;
      },
      { priority: 'high' }
    );
  }

  /**
   * Optimized fetch open damages
   */
  static async fetchOpenDamages(area) {
    const supabase = window.supabaseClient;
    if (!supabase) return [];

    return this.cachedQuery(
      `damages-${area}`,
      async () => {
        const { data, error } = await supabase
          .from("damage_reports")
          .select("*")
          .eq("area", area)
          .eq("status", "Open")
          .order("created_at", { ascending: false });
        
        if (error) throw error;
        return data || [];
      },
      { priority: 'normal' }
    );
  }

  /**
   * Optimized fetch handover tasks
   */
  static async fetchHandoverTasks(area) {
    const supabase = window.supabaseClient;
    if (!supabase) return [];

    return this.cachedQuery(
      `handover-${area}`,
      async () => {
        const { data, error } = await supabase
          .from("handover_tasks")
          .select("*")
          .eq("area", area)
          .eq("status", "Pending")
          .order("created_at", { ascending: false });
        
        if (error) throw error;
        return data || [];
      },
      { priority: 'normal' }
    );
  }

  /**
   * Batch insert operations
   */
  static async batchInsert(table, records, options = {}) {
    const { batchSize = 50, delay = 100 } = options;
    const supabase = window.supabaseClient;
    
    if (!supabase || records.length === 0) return;

    const batches = [];
    for (let i = 0; i < records.length; i += batchSize) {
      batches.push(records.slice(i, i + batchSize));
    }

    const results = [];
    for (let i = 0; i < batches.length; i++) {
      try {
        const { data, error } = await supabase
          .from(table)
          .insert(batches[i]);
        
        if (error) throw error;
        results.push(data);
        
        // Add delay between batches to prevent overwhelming
        if (i < batches.length - 1 && delay > 0) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      } catch (error) {
        console.error(`Batch insert failed for batch ${i}:`, error);
        throw error;
      }
    }

    return results;
  }

  /**
   * Optimized multiple data fetch
   */
  static async fetchMultipleData(area) {
    // Fetch all required data in parallel with caching
    const [preclean, damages, handovers] = await Promise.allSettled([
      this.fetchLatestPreclean(area),
      this.fetchOpenDamages(area),
      this.fetchHandoverTasks(area)
    ]);

    return {
      preclean: preclean.status === 'fulfilled' ? preclean.value : null,
      damages: damages.status === 'fulfilled' ? damages.value : [],
      handovers: handovers.status === 'fulfilled' ? handovers.value : [],
      errors: {
        preclean: preclean.status === 'rejected' ? preclean.reason : null,
        damages: damages.status === 'rejected' ? damages.reason : null,
        handovers: handovers.status === 'rejected' ? handovers.reason : null
      }
    };
  }

  /**
   * Invalidate cache for specific area or all
   */
  static invalidateCache(area = null) {
    if (area) {
      // Invalidate all cache entries for specific area
      for (const key of this.cache.keys()) {
        if (key.includes(area)) {
          this.cache.delete(key);
        }
      }
    } else {
      // Clear all cache
      this.cache.clear();
    }
  }

  /**
   * Get cache statistics
   */
  static getCacheStats() {
    const now = Date.now();
    let expiredCount = 0;
    let validCount = 0;

    for (const [key, value] of this.cache.entries()) {
      if ((now - value.timestamp) > this.CACHE_TTL) {
        expiredCount++;
      } else {
        validCount++;
      }
    }

    return {
      total: this.cache.size,
      valid: validCount,
      expired: expiredCount,
      queueLength: this.batchQueue.length
    };
  }

  /**
   * Cleanup expired cache entries
   */
  static cleanupExpiredCache() {
    const now = Date.now();
    const expiredKeys = [];

    for (const [key, value] of this.cache.entries()) {
      if ((now - value.timestamp) > this.CACHE_TTL) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach(key => this.cache.delete(key));
    return expiredKeys.length;
  }

  /**
   * Clear all resources
   */
  static cleanup() {
    this.cache.clear();
    this.pendingQueries.clear();
    this.batchQueue = [];
    
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { OptimizedDbUtils };
}

// Auto cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', OptimizedDbUtils.cleanup);
  
  // Periodic cache cleanup
  setInterval(() => {
    OptimizedDbUtils.cleanupExpiredCache();
  }, 60000); // Every minute
}
