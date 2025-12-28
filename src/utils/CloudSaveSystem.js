// Cloud Save System - Sync game progress across devices
// Supports Firebase, IndexedDB fallback, and offline-first architecture

import { gameData } from './GameData.js';
import { logger } from './Logger.js';

// Cloud provider configuration
const CLOUD_CONFIG = {
    // Firebase REST API configuration (replace with your project)
    firebase: {
        apiKey: null, // Set via setCloudConfig()
        projectId: null,
        databaseURL: null
    },
    // Custom backend configuration
    custom: {
        apiUrl: null,
        apiKey: null
    }
};

export default class CloudSaveSystem {
    constructor() {
        this.isOnline = navigator?.onLine ?? false;
        this.isSyncing = false;
        this.userId = null;
        this.lastSyncTime = null;
        this.autoSyncEnabled = true;
        this.autoSyncInterval = 5 * 60 * 1000; // 5 minutes
        this.cloudProvider = 'local'; // 'firebase', 'custom', 'local'
        this.db = null; // IndexedDB reference
        this.syncQueue = []; // Queue for offline changes
        this.initializeCloudSave();
        this.initializeIndexedDB();
        this.setupNetworkListeners();
    }

    /**
     * Configure cloud provider
     * @param {string} provider - 'firebase', 'custom', or 'local'
     * @param {Object} config - Provider-specific configuration
     */
    static setCloudConfig(provider, config) {
        if (provider === 'firebase') {
            CLOUD_CONFIG.firebase = { ...CLOUD_CONFIG.firebase, ...config };
        } else if (provider === 'custom') {
            CLOUD_CONFIG.custom = { ...CLOUD_CONFIG.custom, ...config };
        }
    }

    /**
     * Initialize IndexedDB for offline storage
     */
    async initializeIndexedDB() {
        return new Promise((resolve, reject) => {
            if (typeof indexedDB === 'undefined') {
                logger.warn('CloudSaveSystem', 'IndexedDB not available');
                resolve(null);
                return;
            }

            const request = indexedDB.open('GitGameCloudSync', 1);

            request.onerror = () => {
                logger.error('CloudSaveSystem', 'Failed to open IndexedDB');
                resolve(null);
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                logger.info('CloudSaveSystem', 'IndexedDB initialized');
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Store for pending sync operations
                if (!db.objectStoreNames.contains('syncQueue')) {
                    db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
                }

                // Store for cached cloud saves
                if (!db.objectStoreNames.contains('cloudCache')) {
                    db.createObjectStore('cloudCache', { keyPath: 'userId' });
                }
            };
        });
    }

    /**
     * Setup network status listeners for online/offline detection
     */
    setupNetworkListeners() {
        if (typeof window === 'undefined') return;

        window.addEventListener('online', () => {
            this.isOnline = true;
            logger.info('CloudSaveSystem', 'Network online - processing sync queue');
            this.processSyncQueue();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            logger.info('CloudSaveSystem', 'Network offline - queuing changes');
        });
    }

    /**
     * Add operation to sync queue for later processing
     */
    async addToSyncQueue(operation) {
        if (!this.db) return;

        const tx = this.db.transaction('syncQueue', 'readwrite');
        const store = tx.objectStore('syncQueue');

        await new Promise((resolve, reject) => {
            const request = store.add({
                operation,
                timestamp: Date.now(),
                retries: 0
            });
            request.onsuccess = resolve;
            request.onerror = reject;
        });
    }

    /**
     * Process queued sync operations when back online
     */
    async processSyncQueue() {
        if (!this.db || !this.isOnline) return;

        const tx = this.db.transaction('syncQueue', 'readwrite');
        const store = tx.objectStore('syncQueue');

        const items = await new Promise((resolve) => {
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => resolve([]);
        });

        for (const item of items) {
            try {
                if (item.operation === 'upload') {
                    await this.uploadSaveToCloud();
                }
                // Remove successful item from queue
                store.delete(item.id);
            } catch (error) {
                // Increment retry count
                item.retries++;
                if (item.retries >= 3) {
                    store.delete(item.id); // Give up after 3 retries
                    logger.error('CloudSaveSystem', 'Sync operation failed after 3 retries');
                } else {
                    store.put(item);
                }
            }
        }
    }

    initializeCloudSave() {
        if (!gameData.data.cloudSave) {
            gameData.data.cloudSave = {
                enabled: false,
                userId: null,
                lastSync: null,
                lastCloudVersion: 0,
                localVersion: 0,
                conflictResolution: 'newer', // 'newer', 'cloud', 'local'
                autoSync: true,
                backups: []
            };
            gameData.save();
        }

        // Start auto-sync if enabled
        if (gameData.data.cloudSave.autoSync) {
            this.startAutoSync();
        }
    }

    // Link account
    linkAccount(userId, authToken) {
        if (!userId || !authToken) {
            return { success: false, message: 'Invalid credentials!' };
        }

        const cloudSave = gameData.data.cloudSave;

        cloudSave.enabled = true;
        cloudSave.userId = userId;
        this.userId = userId;
        this.authToken = authToken;
        this.isOnline = true;

        gameData.save();

        return {
            success: true,
            message: 'Account linked successfully!',
            userId: userId
        };
    }

    // Unlink account
    unlinkAccount() {
        const cloudSave = gameData.data.cloudSave;

        cloudSave.enabled = false;
        cloudSave.userId = null;
        this.userId = null;
        this.authToken = null;
        this.isOnline = false;

        gameData.save();

        return { success: true, message: 'Account unlinked!' };
    }

    // Upload save to cloud
    async uploadSaveToCloud() {
        if (!this.isOnline || !this.userId) {
            return { success: false, message: 'Not logged in!' };
        }

        if (this.isSyncing) {
            return { success: false, message: 'Sync already in progress!' };
        }

        this.isSyncing = true;

        try {
            const saveData = this.prepareSaveData();

            // In a real implementation, this would call an API
            const result = await this.mockCloudUpload(saveData);

            if (result.success) {
                const cloudSave = gameData.data.cloudSave;
                cloudSave.lastSync = new Date().toISOString();
                cloudSave.localVersion++;
                cloudSave.lastCloudVersion = cloudSave.localVersion;
                this.lastSyncTime = Date.now();

                gameData.save();
            }

            this.isSyncing = false;

            return result;
        } catch (error) {
            this.isSyncing = false;
            return { success: false, message: 'Upload failed: ' + error.message };
        }
    }

    // Download save from cloud
    async downloadSaveFromCloud() {
        if (!this.isOnline || !this.userId) {
            return { success: false, message: 'Not logged in!' };
        }

        if (this.isSyncing) {
            return { success: false, message: 'Sync already in progress!' };
        }

        this.isSyncing = true;

        try {
            // In a real implementation, this would call an API
            const result = await this.mockCloudDownload();

            if (result.success && result.saveData) {
                // Create backup before overwriting
                this.createBackup('pre_cloud_download');

                // Apply cloud save
                this.applySaveData(result.saveData);

                const cloudSave = gameData.data.cloudSave;
                cloudSave.lastSync = new Date().toISOString();
                cloudSave.lastCloudVersion = result.version;
                cloudSave.localVersion = result.version;
                this.lastSyncTime = Date.now();

                gameData.save();
            }

            this.isSyncing = false;

            return result;
        } catch (error) {
            this.isSyncing = false;
            return { success: false, message: 'Download failed: ' + error.message };
        }
    }

    // Sync (smart upload/download)
    async sync() {
        if (!this.isOnline || !this.userId) {
            return { success: false, message: 'Not logged in!' };
        }

        try {
            // Check cloud version
            const cloudVersion = await this.getCloudVersion();
            const cloudSave = gameData.data.cloudSave;

            if (cloudVersion.version > cloudSave.lastCloudVersion) {
                // Cloud is newer - check conflict resolution
                if (cloudSave.localVersion > cloudSave.lastCloudVersion) {
                    // Both local and cloud have changes - resolve conflict
                    return await this.resolveConflict(cloudVersion);
                } else {
                    // Only cloud has changes - download
                    return await this.downloadSaveFromCloud();
                }
            } else if (cloudSave.localVersion > cloudSave.lastCloudVersion) {
                // Only local has changes - upload
                return await this.uploadSaveToCloud();
            } else {
                // Already synced
                return {
                    success: true,
                    message: 'Already synced!',
                    action: 'none'
                };
            }
        } catch (error) {
            return { success: false, message: 'Sync failed: ' + error.message };
        }
    }

    // Resolve save conflicts
    async resolveConflict(cloudVersion) {
        const cloudSave = gameData.data.cloudSave;

        switch (cloudSave.conflictResolution) {
            case 'newer':
                // Use the most recently modified save
                const localModified = gameData.data.lastModified || 0;
                const cloudModified = cloudVersion.lastModified || 0;

                if (cloudModified > localModified) {
                    return await this.downloadSaveFromCloud();
                } else {
                    return await this.uploadSaveToCloud();
                }

            case 'cloud':
                // Always use cloud version
                return await this.downloadSaveFromCloud();

            case 'local':
                // Always use local version
                return await this.uploadSaveToCloud();

            default:
                // Prompt user (would show UI in real game)
                return {
                    success: false,
                    conflict: true,
                    message: 'Conflict detected! Choose resolution strategy.',
                    localVersion: cloudSave.localVersion,
                    cloudVersion: cloudVersion.version
                };
        }
    }

    // Prepare save data for upload
    prepareSaveData() {
        const data = {
            version: gameData.data.cloudSave.localVersion + 1,
            timestamp: new Date().toISOString(),
            lastModified: Date.now(),
            gameData: this.compressSaveData(gameData.data),
            checksum: this.calculateChecksum(gameData.data)
        };

        return data;
    }

    // Apply downloaded save data
    applySaveData(saveData) {
        if (!this.validateChecksum(saveData.gameData, saveData.checksum)) {
            throw new Error('Save data corrupted!');
        }

        const decompressed = this.decompressSaveData(saveData.gameData);

        // Merge save data
        gameData.data = {
            ...gameData.data,
            ...decompressed,
            cloudSave: gameData.data.cloudSave // Preserve cloud save settings
        };

        gameData.save();
    }

    // Compress save data
    compressSaveData(data) {
        // In a real implementation, use actual compression (e.g., pako, lz-string)
        const jsonString = JSON.stringify(data);
        return btoa(jsonString); // Base64 encode as simple "compression"
    }

    // Decompress save data
    decompressSaveData(compressed) {
        try {
            const jsonString = atob(compressed);
            return JSON.parse(jsonString);
        } catch (error) {
            throw new Error('Failed to decompress save data!');
        }
    }

    // Calculate checksum
    calculateChecksum(data) {
        const jsonString = JSON.stringify(data);
        let hash = 0;

        for (let i = 0; i < jsonString.length; i++) {
            const char = jsonString.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & 0xffffffff; // Convert to 32-bit integer
        }

        return hash.toString(36);
    }

    // Validate checksum
    validateChecksum(data, checksum) {
        return this.calculateChecksum(data) === checksum;
    }

    // Create local backup
    createBackup(name = null) {
        const cloudSave = gameData.data.cloudSave;

        const backup = {
            id: 'backup_' + Date.now(),
            name: name || `Backup ${cloudSave.backups.length + 1}`,
            date: new Date().toISOString(),
            data: this.compressSaveData(gameData.data)
        };

        cloudSave.backups.push(backup);

        // Keep only last 10 backups
        if (cloudSave.backups.length > 10) {
            cloudSave.backups.shift();
        }

        gameData.save();

        return {
            success: true,
            backup: backup,
            message: 'Backup created!'
        };
    }

    // Restore from backup
    restoreBackup(backupId) {
        const cloudSave = gameData.data.cloudSave;
        const backup = cloudSave.backups.find(b => b.id === backupId);

        if (!backup) {
            return { success: false, message: 'Backup not found!' };
        }

        try {
            const restored = this.decompressSaveData(backup.data);

            gameData.data = {
                ...restored,
                cloudSave: gameData.data.cloudSave // Preserve cloud save settings
            };

            gameData.save();

            return {
                success: true,
                message: 'Backup restored!',
                backupName: backup.name
            };
        } catch (error) {
            return { success: false, message: 'Failed to restore backup!' };
        }
    }

    // Delete backup
    deleteBackup(backupId) {
        const cloudSave = gameData.data.cloudSave;
        const index = cloudSave.backups.findIndex(b => b.id === backupId);

        if (index === -1) {
            return { success: false, message: 'Backup not found!' };
        }

        cloudSave.backups.splice(index, 1);
        gameData.save();

        return { success: true, message: 'Backup deleted!' };
    }

    // Get cloud version info
    async getCloudVersion() {
        // Mock API call
        return await this.mockGetCloudVersion();
    }

    // Auto-sync functionality
    startAutoSync() {
        if (this.autoSyncTimer) {
            clearInterval(this.autoSyncTimer);
        }

        this.autoSyncTimer = setInterval(() => {
            if (this.isOnline && this.autoSyncEnabled) {
                this.sync().catch(err => {
                    logger.error('CloudSaveSystem', 'Auto-sync failed', { error: err.message });
                });
            }
        }, this.autoSyncInterval);
    }

    stopAutoSync() {
        if (this.autoSyncTimer) {
            clearInterval(this.autoSyncTimer);
            this.autoSyncTimer = null;
        }
    }

    // Enable/disable auto-sync
    setAutoSync(enabled) {
        this.autoSyncEnabled = enabled;
        gameData.data.cloudSave.autoSync = enabled;
        gameData.save();

        if (enabled) {
            this.startAutoSync();
        } else {
            this.stopAutoSync();
        }

        return { success: true, autoSync: enabled };
    }

    // Set conflict resolution strategy
    setConflictResolution(strategy) {
        const validStrategies = ['newer', 'cloud', 'local'];

        if (!validStrategies.includes(strategy)) {
            return { success: false, message: 'Invalid strategy!' };
        }

        gameData.data.cloudSave.conflictResolution = strategy;
        gameData.save();

        return { success: true, strategy: strategy };
    }

    // Get sync status
    getSyncStatus() {
        const cloudSave = gameData.data.cloudSave;

        return {
            enabled: cloudSave.enabled,
            online: this.isOnline,
            syncing: this.isSyncing,
            userId: cloudSave.userId,
            lastSync: cloudSave.lastSync,
            localVersion: cloudSave.localVersion,
            cloudVersion: cloudSave.lastCloudVersion,
            needsSync: cloudSave.localVersion !== cloudSave.lastCloudVersion,
            autoSync: cloudSave.autoSync,
            conflictResolution: cloudSave.conflictResolution
        };
    }

    // Get all backups
    getBackups() {
        return gameData.data.cloudSave.backups;
    }

    /**
     * Upload save to cloud - supports Firebase, custom API, or local mock
     */
    async cloudUpload(saveData) {
        // Queue for offline sync if not online
        if (!this.isOnline) {
            await this.addToSyncQueue('upload');
            return { success: true, message: 'Queued for sync when online', queued: true };
        }

        switch (this.cloudProvider) {
            case 'firebase':
                return await this.firebaseUpload(saveData);
            case 'custom':
                return await this.customApiUpload(saveData);
            default:
                return await this.localStorageUpload(saveData);
        }
    }

    /**
     * Firebase REST API upload
     */
    async firebaseUpload(saveData) {
        const { projectId, databaseURL } = CLOUD_CONFIG.firebase;
        if (!projectId || !databaseURL) {
            return { success: false, message: 'Firebase not configured' };
        }

        try {
            const url = `${databaseURL}/saves/${this.userId}.json`;
            const response = await fetch(url, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(saveData)
            });

            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            return {
                success: true,
                message: 'Save uploaded to Firebase!',
                version: saveData.version,
                size: JSON.stringify(saveData).length
            };
        } catch (error) {
            logger.error('CloudSaveSystem', 'Firebase upload failed', { error: error.message });
            return { success: false, message: 'Upload failed: ' + error.message };
        }
    }

    /**
     * Custom API upload
     */
    async customApiUpload(saveData) {
        const { apiUrl, apiKey } = CLOUD_CONFIG.custom;
        if (!apiUrl) {
            return { success: false, message: 'Custom API not configured' };
        }

        try {
            const response = await fetch(`${apiUrl}/saves/${this.userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey || this.authToken}`
                },
                body: JSON.stringify(saveData)
            });

            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const result = await response.json();
            return {
                success: true,
                message: 'Save uploaded!',
                version: saveData.version,
                ...result
            };
        } catch (error) {
            logger.error('CloudSaveSystem', 'Custom API upload failed', { error: error.message });
            return { success: false, message: 'Upload failed: ' + error.message };
        }
    }

    /**
     * Local storage fallback (for development/offline mode)
     */
    async localStorageUpload(saveData) {
        try {
            localStorage.setItem(`gitgame_cloud_${this.userId}`, JSON.stringify(saveData));
            return {
                success: true,
                message: 'Save stored locally!',
                version: saveData.version,
                size: JSON.stringify(saveData).length
            };
        } catch (error) {
            return { success: false, message: 'Local storage full or unavailable' };
        }
    }

    /**
     * Download save from cloud
     */
    async cloudDownload() {
        if (!this.isOnline && this.cloudProvider !== 'local') {
            // Try to get from IndexedDB cache
            return await this.getFromCache();
        }

        switch (this.cloudProvider) {
            case 'firebase':
                return await this.firebaseDownload();
            case 'custom':
                return await this.customApiDownload();
            default:
                return await this.localStorageDownload();
        }
    }

    /**
     * Firebase REST API download
     */
    async firebaseDownload() {
        const { databaseURL } = CLOUD_CONFIG.firebase;
        if (!databaseURL) {
            return { success: false, message: 'Firebase not configured' };
        }

        try {
            const url = `${databaseURL}/saves/${this.userId}.json`;
            const response = await fetch(url);

            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const saveData = await response.json();
            if (!saveData) {
                return { success: false, message: 'No cloud save found' };
            }

            // Cache for offline access
            await this.cacheCloudSave(saveData);

            return {
                success: true,
                message: 'Save downloaded from Firebase!',
                saveData,
                version: saveData.version
            };
        } catch (error) {
            logger.error('CloudSaveSystem', 'Firebase download failed', { error: error.message });
            return { success: false, message: 'Download failed: ' + error.message };
        }
    }

    /**
     * Custom API download
     */
    async customApiDownload() {
        const { apiUrl, apiKey } = CLOUD_CONFIG.custom;
        if (!apiUrl) {
            return { success: false, message: 'Custom API not configured' };
        }

        try {
            const response = await fetch(`${apiUrl}/saves/${this.userId}`, {
                headers: {
                    'Authorization': `Bearer ${apiKey || this.authToken}`
                }
            });

            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const saveData = await response.json();

            // Cache for offline access
            await this.cacheCloudSave(saveData);

            return {
                success: true,
                message: 'Save downloaded!',
                saveData,
                version: saveData.version
            };
        } catch (error) {
            logger.error('CloudSaveSystem', 'Custom API download failed', { error: error.message });
            return { success: false, message: 'Download failed: ' + error.message };
        }
    }

    /**
     * Local storage download
     */
    async localStorageDownload() {
        try {
            const data = localStorage.getItem(`gitgame_cloud_${this.userId}`);
            if (!data) {
                return { success: false, message: 'No local save found' };
            }

            const saveData = JSON.parse(data);
            return {
                success: true,
                message: 'Save loaded from local storage!',
                saveData,
                version: saveData.version
            };
        } catch (error) {
            return { success: false, message: 'Failed to load local save' };
        }
    }

    /**
     * Cache cloud save to IndexedDB for offline access
     */
    async cacheCloudSave(saveData) {
        if (!this.db) return;

        const tx = this.db.transaction('cloudCache', 'readwrite');
        const store = tx.objectStore('cloudCache');

        await new Promise((resolve) => {
            const request = store.put({ userId: this.userId, saveData, cachedAt: Date.now() });
            request.onsuccess = resolve;
            request.onerror = resolve;
        });
    }

    /**
     * Get cached cloud save from IndexedDB
     */
    async getFromCache() {
        if (!this.db) {
            return { success: false, message: 'No cache available' };
        }

        const tx = this.db.transaction('cloudCache', 'readonly');
        const store = tx.objectStore('cloudCache');

        const cached = await new Promise((resolve) => {
            const request = store.get(this.userId);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => resolve(null);
        });

        if (!cached) {
            return { success: false, message: 'No cached save found' };
        }

        return {
            success: true,
            message: 'Loaded from cache (offline)',
            saveData: cached.saveData,
            version: cached.saveData.version,
            cached: true,
            cachedAt: cached.cachedAt
        };
    }

    /**
     * Get cloud version info
     */
    async getCloudVersion() {
        if (!this.isOnline && this.cloudProvider !== 'local') {
            const cached = await this.getFromCache();
            if (cached.success) {
                return {
                    version: cached.version,
                    lastModified: cached.cachedAt,
                    cached: true
                };
            }
            return { version: 0, lastModified: 0 };
        }

        switch (this.cloudProvider) {
            case 'firebase':
                return await this.firebaseGetVersion();
            case 'custom':
                return await this.customApiGetVersion();
            default:
                return this.localStorageGetVersion();
        }
    }

    async firebaseGetVersion() {
        const { databaseURL } = CLOUD_CONFIG.firebase;
        try {
            const response = await fetch(`${databaseURL}/saves/${this.userId}/version.json`);
            const version = await response.json();
            return { version: version || 0, lastModified: Date.now() };
        } catch {
            return { version: 0, lastModified: 0 };
        }
    }

    async customApiGetVersion() {
        const { apiUrl, apiKey } = CLOUD_CONFIG.custom;
        try {
            const response = await fetch(`${apiUrl}/saves/${this.userId}/version`, {
                headers: { 'Authorization': `Bearer ${apiKey || this.authToken}` }
            });
            return await response.json();
        } catch {
            return { version: 0, lastModified: 0 };
        }
    }

    localStorageGetVersion() {
        try {
            const data = localStorage.getItem(`gitgame_cloud_${this.userId}`);
            if (!data) return { version: 0, lastModified: 0 };
            const saveData = JSON.parse(data);
            return { version: saveData.version || 0, lastModified: saveData.lastModified || 0 };
        } catch {
            return { version: 0, lastModified: 0 };
        }
    }

    /**
     * Set cloud provider
     * @param {'firebase' | 'custom' | 'local'} provider
     */
    setCloudProvider(provider) {
        this.cloudProvider = provider;
        gameData.data.cloudSave.provider = provider;
        gameData.save();
        logger.info('CloudSaveSystem', `Cloud provider set to ${provider}`);
    }

    // Export save as file
    exportSaveToFile() {
        const saveData = this.prepareSaveData();
        const jsonString = JSON.stringify(saveData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        // In browser, this would trigger download
        return {
            success: true,
            url: url,
            filename: `githubgame_save_${Date.now()}.json`,
            size: blob.size
        };
    }

    // Import save from file
    importSaveFromFile(fileData) {
        try {
            const saveData = JSON.parse(fileData);

            if (!this.validateChecksum(saveData.gameData, saveData.checksum)) {
                return { success: false, message: 'Invalid or corrupted save file!' };
            }

            // Create backup before importing
            this.createBackup('pre_import');

            // Apply imported data
            this.applySaveData(saveData);

            return {
                success: true,
                message: 'Save imported successfully!',
                version: saveData.version
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed to import save: ' + error.message
            };
        }
    }

    // Get storage usage
    getStorageUsage() {
        const saveSize = JSON.stringify(gameData.data).length;
        const backupSize = gameData.data.cloudSave.backups.reduce((total, backup) => {
            return total + backup.data.length;
        }, 0);

        return {
            totalSize: saveSize + backupSize,
            saveSize: saveSize,
            backupSize: backupSize,
            backupCount: gameData.data.cloudSave.backups.length,
            formatted: {
                total: this.formatBytes(saveSize + backupSize),
                save: this.formatBytes(saveSize),
                backups: this.formatBytes(backupSize)
            }
        };
    }

    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }

    // Clear all cloud save data
    clearCloudData() {
        const cloudSave = gameData.data.cloudSave;

        cloudSave.backups = [];
        cloudSave.lastSync = null;
        cloudSave.localVersion = 0;
        cloudSave.lastCloudVersion = 0;

        gameData.save();

        return { success: true, message: 'Cloud data cleared!' };
    }
}

// Singleton
export const cloudSaveSystem = new CloudSaveSystem();
