/**
 * SaveStateManager - Robust game state saving and loading
 * Provides autosave, multiple save slots, and compression
 */

import { logger } from './Logger.js';
import { gameData } from './GameData.js';

export default class SaveStateManager {
    constructor() {
        this.storagePrefix = 'gitgame_save_';
        this.autoSaveKey = this.storagePrefix + 'auto';
        this.autoSaveInterval = 30000; // 30 seconds
        this.autoSaveTimer = null;
        this.maxSaveSlots = 5;
        this.compressionEnabled = true;
    }

    /**
     * Start autosave
     */
    startAutoSave(scene, interval = this.autoSaveInterval) {
        this.stopAutoSave();

        this.autoSaveTimer = setInterval(() => {
            this.autoSave(scene);
        }, interval);

        logger.info('SaveState', 'Autosave started', { interval });
    }

    /**
     * Stop autosave
     */
    stopAutoSave() {
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
            this.autoSaveTimer = null;
            logger.info('SaveState', 'Autosave stopped');
        }
    }

    /**
     * Perform autosave
     */
    autoSave(scene) {
        const state = this.captureState(scene);
        return this.save(this.autoSaveKey, state, true);
    }

    /**
     * Capture current game state
     */
    captureState(scene) {
        const state = {
            version: '1.0.0',
            timestamp: Date.now(),
            sceneName: scene.scene.key,
            data: {}
        };

        // Capture scene-specific state
        if (typeof scene.captureState === 'function') {
            state.data = scene.captureState();
        } else {
            // Generic state capture
            state.data = this.genericStateCapture(scene);
        }

        // Add game data
        state.gameData = gameData.exportData();

        return state;
    }

    /**
     * Generic state capture for scenes without custom implementation
     */
    genericStateCapture(scene) {
        const state = {};

        // Capture common game variables
        const commonVars = [
            'score', 'level', 'health', 'playerHealth', 'playerSanity',
            'money', 'time', 'wave', 'enemies', 'powerUps'
        ];

        commonVars.forEach(varName => {
            if (scene[varName] !== undefined) {
                state[varName] = scene[varName];
            }
        });

        // Capture player position if exists
        if (scene.player) {
            state.player = {
                x: scene.player.x,
                y: scene.player.y,
                // Don't save complex objects, just data
            };
        }

        return state;
    }

    /**
     * Save state to storage
     */
    save(slotName, state, isAuto = false) {
        try {
            const key = slotName.startsWith(this.storagePrefix) ? slotName : this.storagePrefix + slotName;

            let data = JSON.stringify(state);

            // Optional compression (simple base64 for now)
            if (this.compressionEnabled && data.length > 1000) {
                data = this.compress(data);
                state._compressed = true;
            }

            localStorage.setItem(key, data);

            // Save metadata
            this.updateMetadata(key, state, isAuto);

            logger.debug('SaveState', `Saved ${isAuto ? 'autosave' : 'game'}`, {
                slot: slotName,
                size: data.length
            });

            return true;
        } catch (error) {
            logger.error('SaveState', 'Failed to save', error);

            // If quota exceeded, try to free space
            if (error.name === 'QuotaExceededError') {
                this.cleanOldSaves();
                // Try again
                try {
                    localStorage.setItem(key, JSON.stringify(state));
                    return true;
                } catch (retryError) {
                    logger.error('SaveState', 'Failed to save after cleanup', retryError);
                }
            }

            return false;
        }
    }

    /**
     * Load state from storage
     */
    load(slotName) {
        try {
            const key = slotName.startsWith(this.storagePrefix) ? slotName : this.storagePrefix + slotName;
            let data = localStorage.getItem(key);

            if (!data) {
                logger.warn('SaveState', 'No save found', { slot: slotName });
                return null;
            }

            // Decompress if needed
            if (data.startsWith('{') === false) {
                data = this.decompress(data);
            }

            const state = JSON.parse(data);

            // Validate state
            if (!this.validateState(state)) {
                logger.error('SaveState', 'Invalid save state', { slot: slotName });
                return null;
            }

            logger.info('SaveState', 'Loaded save', {
                slot: slotName,
                scene: state.sceneName,
                timestamp: new Date(state.timestamp)
            });

            return state;
        } catch (error) {
            logger.error('SaveState', 'Failed to load', error);
            return null;
        }
    }

    /**
     * Restore state to scene
     */
    restore(scene, state) {
        if (!state) return false;

        try {
            // Restore game data
            if (state.gameData) {
                gameData.importData(state.gameData);
            }

            // Restore scene state
            if (typeof scene.restoreState === 'function') {
                scene.restoreState(state.data);
            } else {
                this.genericStateRestore(scene, state.data);
            }

            logger.info('SaveState', 'State restored', { scene: state.sceneName });
            return true;
        } catch (error) {
            logger.error('SaveState', 'Failed to restore state', error);
            return false;
        }
    }

    /**
     * Generic state restore
     */
    genericStateRestore(scene, data) {
        Object.keys(data).forEach(key => {
            if (key !== 'player') {
                scene[key] = data[key];
            }
        });

        // Restore player position
        if (data.player && scene.player) {
            scene.player.setPosition(data.player.x, data.player.y);
        }
    }

    /**
     * Validate save state
     */
    validateState(state) {
        if (!state || typeof state !== 'object') return false;
        if (!state.version) return false;
        if (!state.timestamp) return false;
        if (!state.sceneName) return false;
        return true;
    }

    /**
     * Get all save slots
     */
    getSaveSlots() {
        const slots = [];

        // Collect all keys first to avoid issues with localStorage changing during iteration
        const keys = [];
        for (let i = 0; i < localStorage.length; i++) {
            keys.push(localStorage.key(i));
        }

        // Now iterate over the collected keys
        for (const key of keys) {
            if (key && key.startsWith(this.storagePrefix)) {
                const metadata = this.getMetadata(key);
                if (metadata) {
                    slots.push({
                        key,
                        slotName: key.replace(this.storagePrefix, ''),
                        ...metadata
                    });
                }
            }
        }

        // Sort by timestamp descending
        slots.sort((a, b) => b.timestamp - a.timestamp);

        return slots;
    }

    /**
     * Update save metadata
     */
    updateMetadata(key, state, isAuto) {
        const metadata = {
            timestamp: state.timestamp,
            sceneName: state.sceneName,
            isAuto,
            size: JSON.stringify(state).length
        };

        try {
            const metaKey = 'gitgame_savemeta';
            const allMeta = JSON.parse(localStorage.getItem(metaKey) || '{}');
            allMeta[key] = metadata;
            localStorage.setItem(metaKey, JSON.stringify(allMeta));
        } catch (error) {
            logger.warn('SaveState', 'Failed to update metadata', error);
        }
    }

    /**
     * Get save metadata
     */
    getMetadata(key) {
        try {
            const metaKey = 'gitgame_savemeta';
            const allMeta = JSON.parse(localStorage.getItem(metaKey) || '{}');
            return allMeta[key] || null;
        } catch (error) {
            return null;
        }
    }

    /**
     * Delete save
     */
    deleteSave(slotName) {
        try {
            const key = slotName.startsWith(this.storagePrefix) ? slotName : this.storagePrefix + slotName;
            localStorage.removeItem(key);

            // Remove metadata
            const metaKey = 'gitgame_savemeta';
            const allMeta = JSON.parse(localStorage.getItem(metaKey) || '{}');
            delete allMeta[key];
            localStorage.setItem(metaKey, JSON.stringify(allMeta));

            logger.info('SaveState', 'Save deleted', { slot: slotName });
            return true;
        } catch (error) {
            logger.error('SaveState', 'Failed to delete save', error);
            return false;
        }
    }

    /**
     * Clean old saves to free space
     */
    cleanOldSaves() {
        const slots = this.getSaveSlots();

        // Keep autosave and most recent manual saves
        const toDelete = slots
            .filter(slot => !slot.isAuto)
            .slice(this.maxSaveSlots)
            .map(slot => slot.key);

        toDelete.forEach(key => {
            localStorage.removeItem(key);
        });

        logger.info('SaveState', 'Cleaned old saves', { count: toDelete.length });
    }

    /**
     * Simple compression (base64 for now)
     */
    compress(data) {
        try {
            return btoa(unescape(encodeURIComponent(data)));
        } catch (error) {
            logger.warn('SaveState', 'Compression failed, using uncompressed', error);
            return data;
        }
    }

    /**
     * Simple decompression
     */
    decompress(data) {
        try {
            return decodeURIComponent(escape(atob(data)));
        } catch (error) {
            logger.warn('SaveState', 'Decompression failed', error);
            return data;
        }
    }

    /**
     * Export save for backup
     */
    exportSave(slotName) {
        const state = this.load(slotName);
        if (!state) return null;

        return JSON.stringify(state, null, 2);
    }

    /**
     * Import save from backup
     */
    importSave(slotName, jsonString) {
        try {
            const state = JSON.parse(jsonString);
            if (!this.validateState(state)) {
                throw new Error('Invalid save state');
            }
            return this.save(slotName, state);
        } catch (error) {
            logger.error('SaveState', 'Failed to import save', error);
            return false;
        }
    }
}

// Singleton instance
export const saveStateManager = new SaveStateManager();

// Expose globally for debugging
if (typeof window !== 'undefined') {
    window.saveStateManager = saveStateManager;
}
