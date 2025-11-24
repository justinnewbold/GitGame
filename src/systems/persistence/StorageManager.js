/**
 * StorageManager - Handles all localStorage operations
 * Provides safe read/write with error handling and versioning
 */

import { STORAGE, ERRORS } from '../../constants/GameConstants.js';
import EventBus from '../../core/EventBus.js';
import { EVENTS } from '../../constants/GameConstants.js';

export default class StorageManager {
    constructor() {
        this.storageKey = STORAGE.KEY;
        this.version = STORAGE.VERSION;
        this.autoSaveTimer = null;
    }

    /**
     * Load data from localStorage
     * @returns {Object|null} Loaded data or null if failed
     */
    load() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (!saved) {
                return null;
            }

            const data = JSON.parse(saved);

            // Version check
            if (data.version !== this.version) {
                console.warn(`StorageManager: Data version mismatch. Expected ${this.version}, got ${data.version}`);
                // Could implement migration logic here
                return this.migrateData(data);
            }

            EventBus.emit(EVENTS.DATA_LOADED, data);
            return data;

        } catch (error) {
            console.error('StorageManager: Failed to load data:', error);
            EventBus.emit(EVENTS.SAVE_ERROR, { type: 'load', error });
            return null;
        }
    }

    /**
     * Save data to localStorage
     * @param {Object} data - Data to save
     * @returns {boolean} True if save successful
     */
    save(data) {
        try {
            if (!data) {
                throw new Error('Cannot save null or undefined data');
            }

            // Add version and timestamp
            const saveData = {
                ...data,
                version: this.version,
                lastSaved: Date.now()
            };

            const serialized = JSON.stringify(saveData);
            localStorage.setItem(this.storageKey, serialized);

            EventBus.emit(EVENTS.DATA_SAVED, saveData);
            return true;

        } catch (error) {
            console.error('StorageManager: Failed to save data:', error);
            EventBus.emit(EVENTS.SAVE_ERROR, { type: 'save', error });
            return false;
        }
    }

    /**
     * Clear all saved data
     * @returns {boolean} True if clear successful
     */
    clear() {
        try {
            localStorage.removeItem(this.storageKey);
            console.log('StorageManager: Data cleared successfully');
            return true;
        } catch (error) {
            console.error('StorageManager: Failed to clear data:', error);
            return false;
        }
    }

    /**
     * Check if localStorage is available
     * @returns {boolean} True if localStorage available
     */
    isAvailable() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (error) {
            console.warn('StorageManager: localStorage not available:', error);
            return false;
        }
    }

    /**
     * Get storage size in bytes
     * @returns {number} Size in bytes
     */
    getSize() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? new Blob([data]).size : 0;
        } catch (error) {
            console.error('StorageManager: Failed to get size:', error);
            return 0;
        }
    }

    /**
     * Export data as JSON string
     * @returns {string|null} JSON string or null if failed
     */
    export() {
        try {
            const data = this.load();
            return data ? JSON.stringify(data, null, 2) : null;
        } catch (error) {
            console.error('StorageManager: Failed to export data:', error);
            return null;
        }
    }

    /**
     * Import data from JSON string
     * @param {string} jsonString - JSON data to import
     * @returns {boolean} True if import successful
     */
    import(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            return this.save(data);
        } catch (error) {
            console.error('StorageManager: Failed to import data:', error);
            return false;
        }
    }

    /**
     * Migrate old data format to new format
     * @param {Object} oldData - Old format data
     * @returns {Object} Migrated data
     */
    migrateData(oldData) {
        console.log('StorageManager: Migrating data to version', this.version);

        // Example migration logic
        const migrated = {
            ...oldData,
            version: this.version
        };

        // Save migrated data
        this.save(migrated);

        return migrated;
    }

    /**
     * Start auto-save timer
     * @param {Function} saveCallback - Function to call on auto-save
     */
    startAutoSave(saveCallback) {
        if (this.autoSaveTimer) {
            this.stopAutoSave();
        }

        this.autoSaveTimer = setInterval(() => {
            try {
                saveCallback();
            } catch (error) {
                console.error('StorageManager: Auto-save failed:', error);
            }
        }, STORAGE.AUTO_SAVE_INTERVAL);

        console.log('StorageManager: Auto-save enabled');
    }

    /**
     * Stop auto-save timer
     */
    stopAutoSave() {
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
            this.autoSaveTimer = null;
            console.log('StorageManager: Auto-save disabled');
        }
    }

    /**
     * Create a backup of current data
     * @returns {boolean} True if backup successful
     */
    createBackup() {
        try {
            const data = localStorage.getItem(this.storageKey);
            if (data) {
                const backupKey = `${this.storageKey}_backup_${Date.now()}`;
                localStorage.setItem(backupKey, data);
                console.log('StorageManager: Backup created:', backupKey);
                return true;
            }
            return false;
        } catch (error) {
            console.error('StorageManager: Failed to create backup:', error);
            return false;
        }
    }

    /**
     * List all backups
     * @returns {Array} Array of backup keys
     */
    listBackups() {
        try {
            const backups = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(`${this.storageKey}_backup_`)) {
                    backups.push(key);
                }
            }
            return backups.sort().reverse(); // Most recent first
        } catch (error) {
            console.error('StorageManager: Failed to list backups:', error);
            return [];
        }
    }

    /**
     * Restore from a backup
     * @param {string} backupKey - Backup key to restore
     * @returns {boolean} True if restore successful
     */
    restoreBackup(backupKey) {
        try {
            const backup = localStorage.getItem(backupKey);
            if (backup) {
                localStorage.setItem(this.storageKey, backup);
                console.log('StorageManager: Restored from backup:', backupKey);
                return true;
            }
            return false;
        } catch (error) {
            console.error('StorageManager: Failed to restore backup:', error);
            return false;
        }
    }

    /**
     * Clean up old backups (keep only last N)
     * @param {number} keepCount - Number of backups to keep
     */
    cleanupBackups(keepCount = 5) {
        try {
            const backups = this.listBackups();
            if (backups.length > keepCount) {
                backups.slice(keepCount).forEach(key => {
                    localStorage.removeItem(key);
                    console.log('StorageManager: Removed old backup:', key);
                });
            }
        } catch (error) {
            console.error('StorageManager: Failed to cleanup backups:', error);
        }
    }
}
