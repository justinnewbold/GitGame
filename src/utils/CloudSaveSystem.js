// Cloud Save System - Sync game progress across devices

import { gameData } from './GameData.js';
import { logger } from './Logger.js';

export default class CloudSaveSystem {
    constructor() {
        this.isOnline = false;
        this.isSyncing = false;
        this.userId = null;
        this.lastSyncTime = null;
        this.autoSyncEnabled = true;
        this.autoSyncInterval = 5 * 60 * 1000; // 5 minutes
        this.initializeCloudSave();
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
            hash = hash & hash;
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

    // Mock API calls (in real game, these would call actual backend)
    async mockCloudUpload(saveData) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        return {
            success: true,
            message: 'Save uploaded to cloud!',
            version: saveData.version,
            size: JSON.stringify(saveData).length
        };
    }

    async mockCloudDownload() {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // In real implementation, return actual cloud data
        // For now, return current data (no-op)
        return {
            success: true,
            message: 'Save downloaded from cloud!',
            saveData: this.prepareSaveData(),
            version: gameData.data.cloudSave.lastCloudVersion
        };
    }

    async mockGetCloudVersion() {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));

        return {
            version: gameData.data.cloudSave.lastCloudVersion,
            lastModified: Date.now(),
            size: 1024 * 50 // 50KB
        };
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
