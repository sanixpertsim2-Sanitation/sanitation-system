// ======================================================
// SANIXPERT DATABASE HEARTBEAT SYSTEM
// Prevents Supabase from deactivating due to inactivity
// ======================================================

class DatabaseHeartbeat {
  constructor() {
    this.isActive = false;
    this.intervalId = null;
    this.heartbeatInterval = 4 * 60 * 1000; // 4 minutes (Supabase sleeps after 5 minutes)
    this.lastHeartbeat = null;
    this.failureCount = 0;
    this.maxFailures = 3;
    this.supabase = null;
  }

  // Initialize heartbeat system
  async initialize() {
    try {
      this.supabase = window.supabaseClient;
      
      if (!this.supabase) {
        console.warn('❌ DatabaseHeartbeat: Supabase client not found');
        return false;
      }

      // Test initial connection
      const isConnected = await this.testConnection();
      if (!isConnected) {
        console.error('❌ DatabaseHeartbeat: Initial connection failed');
        return false;
      }

      console.log('✅ DatabaseHeartbeat: Initialized successfully');
      return true;
      
    } catch (error) {
      console.error('❌ DatabaseHeartbeat: Initialization failed:', error);
      return false;
    }
  }

  // Start heartbeat
  start() {
    if (this.isActive) {
      console.log('📡 DatabaseHeartbeat: Already running');
      return;
    }

    if (!this.supabase) {
      console.error('❌ DatabaseHeartbeat: Cannot start - Supabase client not initialized');
      return;
    }

    this.isActive = true;
    this.failureCount = 0;
    
    // Perform immediate heartbeat
    this.performHeartbeat();
    
    // Set up recurring heartbeat
    this.intervalId = setInterval(() => {
      this.performHeartbeat();
    }, this.heartbeatInterval);

    console.log('📡 DatabaseHeartbeat: Started - Interval:', this.heartbeatInterval / 1000, 'seconds');
  }

  // Stop heartbeat
  stop() {
    if (!this.isActive) {
      console.log('📡 DatabaseHeartbeat: Already stopped');
      return;
    }

    this.isActive = false;
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    console.log('📡 DatabaseHeartbeat: Stopped');
  }

  // Perform heartbeat
  async performHeartbeat() {
    if (!this.isActive || !this.supabase) {
      return;
    }

    try {
      const startTime = performance.now();
      
      // Use optimized heartbeat function
      const { data, error } = await this.supabase.rpc('heartbeat_check');

      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);

      if (error) {
        throw error;
      }

      // Update heartbeat status
      this.lastHeartbeat = new Date().toISOString();
      this.failureCount = 0;

      // Log successful heartbeat (every 10th heartbeat to avoid spam)
      if (Math.random() < 0.1) { // 10% chance to log
        await this.supabase.rpc('log_heartbeat', {
          p_response_time: responseTime,
          p_success: true
        });
      }

      // Update UI if available
      this.updateHeartbeatStatus(true, responseTime);

      console.log('💓 DatabaseHeartbeat: Success -', responseTime, 'ms');

    } catch (error) {
      this.failureCount++;
      console.error('💔 DatabaseHeartbeat: Failed', this.failureCount, '/', this.maxFailures, '-', error.message);

      // Update UI with error
      this.updateHeartbeatStatus(false, 0, error.message);

      // Log failed heartbeat
      await this.supabase.rpc('log_heartbeat', {
        p_response_time: 0,
        p_success: false,
        p_error_message: error.message
      });

      // If too many failures, try to reconnect
      if (this.failureCount >= this.maxFailures) {
        console.warn('🔄 DatabaseHeartbeat: Too many failures, attempting reconnection...');
        await this.attemptReconnection();
      }
    }
  }

  // Test database connection
  async testConnection() {
    try {
      const startTime = performance.now();
      
      // Use optimized connection test function
      const { data, error } = await this.supabase.rpc('connection_test');

      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);

      if (error) {
        throw error;
      }

      console.log('✅ DatabaseHeartbeat: Connection test successful -', responseTime, 'ms');
      return true;

    } catch (error) {
      console.error('❌ DatabaseHeartbeat: Connection test failed:', error.message);
      return false;
    }
  }

  // Attempt reconnection
  async attemptReconnection() {
    try {
      console.log('🔄 DatabaseHeartbeat: Attempting reconnection...');
      
      // Reset failure count
      this.failureCount = 0;
      
      // Test connection again
      const isConnected = await this.testConnection();
      
      if (isConnected) {
        console.log('✅ DatabaseHeartbeat: Reconnection successful');
        await this.logHeartbeat(0, true, 'Reconnection successful');
      } else {
        console.error('❌ DatabaseHeartbeat: Reconnection failed');
        await this.logHeartbeat(0, false, 'Reconnection failed');
      }

    } catch (error) {
      console.error('❌ DatabaseHeartbeat: Reconnection error:', error.message);
    }
  }

  // Log heartbeat to database
  async logHeartbeat(responseTime, success, error = null) {
    try {
      const logData = {
        event_type: 'HEARTBEAT',
        description: success ? 'Database heartbeat successful' : 'Database heartbeat failed',
        event_data: {
          responseTime: responseTime,
          success: success,
          error: error,
          interval: this.heartbeatInterval,
          failureCount: this.failureCount
        },
        created_at: new Date().toISOString()
      };

      await this.supabase
        .from('system_logs')
        .insert(logData);

    } catch (logError) {
      console.error('❌ DatabaseHeartbeat: Failed to log heartbeat:', logError.message);
    }
  }

  // Update heartbeat status in UI
  updateHeartbeatStatus(success, responseTime, error = null) {
    // Update status indicator if available
    const statusElement = document.getElementById('heartbeatStatus');
    if (statusElement) {
      if (success) {
        statusElement.innerHTML = `
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="width: 8px; height: 8px; background: #22c55e; border-radius: 50%; animation: pulse 2s infinite;"></div>
            <span style="color: #22c55e; font-size: 12px;">Connected (${responseTime}ms)</span>
          </div>
        `;
      } else {
        statusElement.innerHTML = `
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="width: 8px; height: 8px; background: #ef4444; border-radius: 50%;"></div>
            <span style="color: #ef4444; font-size: 12px;">Failed (${this.failureCount}/${this.maxFailures})</span>
          </div>
        `;
      }
    }

    // Update last heartbeat time
    const lastBeatElement = document.getElementById('lastHeartbeat');
    if (lastBeatElement && this.lastHeartbeat) {
      lastBeatElement.textContent = new Date(this.lastHeartbeat).toLocaleTimeString();
    }
  }

  // Get heartbeat statistics
  getStats() {
    return {
      isActive: this.isActive,
      lastHeartbeat: this.lastHeartbeat,
      failureCount: this.failureCount,
      maxFailures: this.maxFailures,
      interval: this.heartbeatInterval,
      uptime: this.isActive ? Date.now() - this.startTime : 0
    };
  }

  // Set custom interval
  setInterval(minutes) {
    this.heartbeatInterval = minutes * 60 * 1000;
    
    if (this.isActive) {
      // Restart with new interval
      this.stop();
      this.start();
    }
    
    console.log('📡 DatabaseHeartbeat: Interval updated to', minutes, 'minutes');
  }

  // Force heartbeat now
  async forceHeartbeat() {
    console.log('💓 DatabaseHeartbeat: Force heartbeat requested');
    await this.performHeartbeat();
  }
}

// Initialize global heartbeat instance
window.databaseHeartbeat = new DatabaseHeartbeat();

// Auto-start when page loads
document.addEventListener('DOMContentLoaded', async function() {
  // Initialize heartbeat system
  const initialized = await window.databaseHeartbeat.initialize();
  
  if (initialized) {
    // Start heartbeat after 2 seconds delay
    setTimeout(() => {
      window.databaseHeartbeat.start();
    }, 2000);
  }
});

// Handle page visibility changes
document.addEventListener('visibilitychange', function() {
  if (document.hidden) {
    // Page hidden - reduce heartbeat frequency
    if (window.databaseHeartbeat.isActive) {
      window.databaseHeartbeat.setInterval(10); // 10 minutes when hidden
    }
  } else {
    // Page visible - restore normal frequency
    if (window.databaseHeartbeat.isActive) {
      window.databaseHeartbeat.setInterval(4); // 4 minutes when visible
    }
  }
});

// Handle page unload
window.addEventListener('beforeunload', function() {
  if (window.databaseHeartbeat.isActive) {
    window.databaseHeartbeat.stop();
  }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DatabaseHeartbeat;
}
