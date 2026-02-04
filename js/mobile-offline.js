/*
 * SANIXPERT MOBILE OFFLINE SUPPORT
 * Offline-first caching and synchronization
 * Solves: Network issues, data loss, poor connectivity
 */

class MobileOffline {
  constructor() {
    this.dbName = 'sanixpert-offline';
    this.dbVersion = 1;
    this.db = null;
    this.isOnline = navigator.onLine;
    this.syncQueue = [];
    this.cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours
    
    this.init();
  }

  // ========================================
  // INITIALIZATION
  // ========================================
  
  async init() {
    try {
      // Initialize IndexedDB
      await this.initDB();
      
      // Setup network listeners
      this.setupNetworkListeners();
      
      // Start sync process
      this.startSyncProcess();
      
      console.log('📱 Mobile Offline Support initialized');
      
    } catch (error) {
      console.error('Error initializing offline support:', error);
    }
  }

  // Initialize IndexedDB
  async initDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Create object stores
        if (!db.objectStoreNames.contains('forms')) {
          db.createObjectStore('forms', { keyPath: 'id' });
        }
        
        if (!db.objectStoreNames.contains('photos')) {
          db.createObjectStore('photos', { keyPath: 'id' });
        }
        
        if (!db.objectStoreNames.contains('syncQueue')) {
          db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
        }
        
        if (!db.objectStoreNames.contains('cache')) {
          const cacheStore = db.createObjectStore('cache', { keyPath: 'key' });
          cacheStore.createIndex('expiry', 'expiry', { unique: false });
        }
      };
    });
  }

  // Setup network listeners
  setupNetworkListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      console.log('🌐 Network connection restored');
      this.syncPendingData();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.log('📱 Network connection lost - working offline');
    });
  }

  // ========================================
  // FORM CACHING
  // ========================================
  
  // Save form data
  async saveForm(formId, formData) {
    try {
      const formRecord = {
        id: formId,
        data: formData,
        timestamp: Date.now(),
        synced: false
      };
      
      await this.saveToDB('forms', formRecord);
      console.log(`💾 Form ${formId} saved to cache`);
      
      // Try to sync if online
      if (this.isOnline) {
        await this.syncForm(formId);
      }
      
      return true;
    } catch (error) {
      console.error('Error saving form:', error);
      return false;
    }
  }

  // Load form data
  async loadForm(formId) {
    try {
      const formRecord = await this.getFromDB('forms', formId);
      
      if (formRecord) {
        console.log(`📂 Form ${formId} loaded from cache`);
        return formRecord.data;
      }
      
      return null;
    } catch (error) {
      console.error('Error loading form:', error);
      return null;
    }
  }

  // Get all cached forms
  async getAllCachedForms() {
    try {
      const forms = await this.getAllFromDB('forms');
      return forms || [];
    } catch (error) {
      console.error('Error getting cached forms:', error);
      return [];
    }
  }

  // ========================================
  // PHOTO CACHING
  // ========================================
  
  // Save photo
  async savePhoto(photoId, photoData) {
    try {
      const photoRecord = {
        id: photoId,
        data: photoData,
        timestamp: Date.now(),
        synced: false
      };
      
      await this.saveToDB('photos', photoRecord);
      console.log(`📷 Photo ${photoId} saved to cache`);
      
      return true;
    } catch (error) {
      console.error('Error saving photo:', error);
      return false;
    }
  }

  // Load photo
  async loadPhoto(photoId) {
    try {
      const photoRecord = await this.getFromDB('photos', photoId);
      
      if (photoRecord) {
        console.log(`📷 Photo ${photoId} loaded from cache`);
        return photoRecord.data;
      }
      
      return null;
    } catch (error) {
      console.error('Error loading photo:', error);
      return null;
    }
  }

  // ========================================
  // DATA CACHING
  // ========================================
  
  // Cache API response
  async cacheData(key, data, expiry = this.cacheExpiry) {
    try {
      const cacheRecord = {
        key: key,
        data: data,
        timestamp: Date.now(),
        expiry: Date.now() + expiry
      };
      
      await this.saveToDB('cache', cacheRecord);
      console.log(`🗄️ Data cached: ${key}`);
      
      return true;
    } catch (error) {
      console.error('Error caching data:', error);
      return false;
    }
  }

  // Get cached data
  async getCachedData(key) {
    try {
      const cacheRecord = await this.getFromDB('cache', key);
      
      if (cacheRecord && cacheRecord.expiry > Date.now()) {
        console.log(`📂 Data loaded from cache: ${key}`);
        return cacheRecord.data;
      }
      
      // Remove expired cache
      if (cacheRecord) {
        await this.deleteFromDB('cache', key);
      }
      
      return null;
    } catch (error) {
      console.error('Error getting cached data:', error);
      return null;
    }
  }

  // Clear expired cache
  async clearExpiredCache() {
    try {
      const transaction = this.db.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      const index = store.index('expiry');
      
      const request = index.openCursor(IDBKeyRange.upperBound(Date.now()));
      
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        }
      };
      
      console.log('🧹 Expired cache cleared');
    } catch (error) {
      console.error('Error clearing expired cache:', error);
    }
  }

  // ========================================
  // SYNC QUEUE MANAGEMENT
  // ========================================
  
  // Add to sync queue
  async addToSyncQueue(action, data) {
    try {
      const syncRecord = {
        action: action,
        data: data,
        timestamp: Date.now(),
        retries: 0,
        maxRetries: 3
      };
      
      await this.saveToDB('syncQueue', syncRecord);
      console.log(`📋 Added to sync queue: ${action}`);
      
      // Try to sync immediately if online
      if (this.isOnline) {
        this.processSyncQueue();
      }
      
      return true;
    } catch (error) {
      console.error('Error adding to sync queue:', error);
      return false;
    }
  }

  // Process sync queue
  async processSyncQueue() {
    if (!this.isOnline) return;
    
    try {
      const syncRecords = await this.getAllFromDB('syncQueue');
      
      for (const record of syncRecords) {
        if (record.retries >= record.maxRetries) {
          console.warn(`⚠️ Max retries exceeded for sync record ${record.id}`);
          await this.deleteFromDB('syncQueue', record.id);
          continue;
        }
        
        try {
          await this.executeSyncAction(record.action, record.data);
          await this.deleteFromDB('syncQueue', record.id);
          console.log(`✅ Synced: ${record.action}`);
        } catch (error) {
          console.error(`❌ Sync failed for ${record.action}:`, error);
          record.retries++;
          await this.saveToDB('syncQueue', record);
        }
      }
    } catch (error) {
      console.error('Error processing sync queue:', error);
    }
  }

  // Execute sync action
  async executeSyncAction(action, data) {
    switch (action) {
      case 'submitForm':
        return this.syncFormSubmit(data);
      case 'uploadPhoto':
        return this.syncPhotoUpload(data);
      case 'updateStatus':
        return this.syncStatusUpdate(data);
      default:
        throw new Error(`Unknown sync action: ${action}`);
    }
  }

  // ========================================
  // SPECIFIC SYNC ACTIONS
  // ========================================
  
  // Sync form submission
  async syncFormSubmit(formData) {
    // This would integrate with your Supabase client
    console.log('📤 Syncing form submission:', formData);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mark form as synced
    if (formData.formId) {
      await this.markFormAsSynced(formData.formId);
    }
    
    return true;
  }

  // Sync photo upload
  async syncPhotoUpload(photoData) {
    console.log('📤 Syncing photo upload:', photoData);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mark photo as synced
    if (photoData.photoId) {
      await this.markPhotoAsSynced(photoData.photoId);
    }
    
    return true;
  }

  // Sync status update
  async syncStatusUpdate(statusData) {
    console.log('📤 Syncing status update:', statusData);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return true;
  }

  // ========================================
  // UTILITY METHODS
  // ========================================
  
  // Save to IndexedDB
  async saveToDB(storeName, record) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(record);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Get from IndexedDB
  async getFromDB(storeName, key) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Get all from IndexedDB
  async getAllFromDB(storeName) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Delete from IndexedDB
  async deleteFromDB(storeName, key) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Mark form as synced
  async markFormAsSynced(formId) {
    try {
      const formRecord = await this.getFromDB('forms', formId);
      if (formRecord) {
        formRecord.synced = true;
        formRecord.syncedAt = Date.now();
        await this.saveToDB('forms', formRecord);
      }
    } catch (error) {
      console.error('Error marking form as synced:', error);
    }
  }

  // Mark photo as synced
  async markPhotoAsSynced(photoId) {
    try {
      const photoRecord = await this.getFromDB('photos', photoId);
      if (photoRecord) {
        photoRecord.synced = true;
        photoRecord.syncedAt = Date.now();
        await this.saveToDB('photos', photoRecord);
      }
    } catch (error) {
      console.error('Error marking photo as synced:', error);
    }
  }

  // ========================================
  // AUTO SYNC PROCESS
  // ========================================
  
  // Start sync process
  startSyncProcess() {
    // Sync every 30 seconds when online
    setInterval(() => {
      if (this.isOnline) {
        this.processSyncQueue();
        this.clearExpiredCache();
      }
    }, 30000);
    
    // Clear expired cache every hour
    setInterval(() => {
      this.clearExpiredCache();
    }, 60 * 60 * 1000);
  }

  // Sync pending data
  async syncPendingData() {
    console.log('🔄 Syncing pending data...');
    await this.processSyncQueue();
  }

  // ========================================
  // STATUS & MONITORING
  // ========================================
  
  // Get offline status
  getStatus() {
    return {
      isOnline: this.isOnline,
      cachedForms: this.getCachedFormsCount(),
      cachedPhotos: this.getCachedPhotosCount(),
      pendingSync: this.getPendingSyncCount(),
      lastSync: this.getLastSyncTime()
    };
  }

  // Get cached forms count
  async getCachedFormsCount() {
    try {
      const forms = await this.getAllFromDB('forms');
      return forms ? forms.length : 0;
    } catch (error) {
      return 0;
    }
  }

  // Get cached photos count
  async getCachedPhotosCount() {
    try {
      const photos = await this.getAllFromDB('photos');
      return photos ? photos.length : 0;
    } catch (error) {
      return 0;
    }
  }

  // Get pending sync count
  async getPendingSyncCount() {
    try {
      const syncQueue = await this.getAllFromDB('syncQueue');
      return syncQueue ? syncQueue.length : 0;
    } catch (error) {
      return 0;
    }
  }

  // Get last sync time
  getLastSyncTime() {
    return localStorage.getItem('lastSyncTime') || null;
  }

  // Update last sync time
  updateLastSyncTime() {
    localStorage.setItem('lastSyncTime', new Date().toISOString());
  }

  // Clear all cached data
  async clearAllCache() {
    try {
      const stores = ['forms', 'photos', 'cache', 'syncQueue'];
      
      for (const storeName of stores) {
        const transaction = this.db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        store.clear();
      }
      
      console.log('🧹 All cache cleared');
      return true;
    } catch (error) {
      console.error('Error clearing cache:', error);
      return false;
    }
  }
}

// ========================================
// GLOBAL INITIALIZATION
// ========================================
window.MobileOffline = MobileOffline;

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MobileOffline };
}

// Auto-initialize offline support
window.mobileOffline = new MobileOffline();
