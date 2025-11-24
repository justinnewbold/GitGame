/**
 * GameDataManager - Coordinator for all game data managers
 * Replaces the old God Object GameData with a clean, modular architecture
 */

import StorageManager from './StorageManager.js';
import PlayerStatsManager from '../progression/PlayerStatsManager.js';
import AchievementManager from '../progression/AchievementManager.js';
import SettingsManager from '../progression/SettingsManager.js';
import ProgressionManager from '../progression/ProgressionManager.js';
import EventBus from '../../core/EventBus.js';
import { EVENTS } from '../../constants/GameConstants.js';

export default class GameDataManager {
    constructor() {
        // Initialize all sub-managers
        this.storage = new StorageManager();
        this.stats = new PlayerStatsManager();
        this.achievements = new AchievementManager();
        this.settings = new SettingsManager();
        this.progression = new ProgressionManager();

        // Load saved data
        this.load();

        // Set up auto-save
        this.storage.startAutoSave(() => this.save());
    }

    /**
     * Load all data from storage
     */
    load() {
        try {
            const data = this.storage.load();

            if (data) {
                // Load into each manager
                this.stats.load(data.stats);
                this.achievements.load(data.achievements);
                this.settings.load(data.settings);
                this.progression.load(data.progression);

                console.log('GameDataManager: Data loaded successfully');
            } else {
                console.log('GameDataManager: No saved data found, using defaults');
            }
        } catch (error) {
            console.error('GameDataManager: Failed to load data:', error);
        }
    }

    /**
     * Save all data to storage
     * @returns {boolean} True if save successful
     */
    save() {
        try {
            const data = {
                stats: this.stats.export(),
                achievements: this.achievements.export(),
                settings: this.settings.export(),
                progression: this.progression.export()
            };

            const success = this.storage.save(data);

            if (success) {
                // Mark managers as clean after save
                this.stats.markClean();
            }

            return success;
        } catch (error) {
            console.error('GameDataManager: Failed to save data:', error);
            return false;
        }
    }

    /**
     * Reset all data
     */
    resetAll() {
        if (confirm('Are you sure you want to reset ALL game data? This cannot be undone!')) {
            this.stats.resetAll();
            this.achievements.resetAll();
            this.settings.resetAll();
            this.progression.resetAll();
            this.save();
            console.log('GameDataManager: All data reset');
        }
    }

    // ========================================
    // Stats Convenience Methods
    // ========================================

    /**
     * Update a statistic
     * @param {string} path - Stat path
     * @param {*} value - Value
     * @param {string} operation - Operation type
     */
    updateStat(path, value, operation = 'set') {
        this.stats.update(path, value, operation);
    }

    /**
     * Get a statistic
     * @param {string} path - Stat path
     * @returns {*} Stat value
     */
    getStat(path) {
        return this.stats.get(path);
    }

    /**
     * Get all stats
     * @returns {Object} All statistics
     */
    getAllStats() {
        return this.stats.getAll();
    }

    // ========================================
    // Achievement Convenience Methods
    // ========================================

    /**
     * Unlock an achievement
     * @param {string} id - Achievement ID
     * @returns {Object|null} Achievement if newly unlocked
     */
    unlockAchievement(id) {
        return this.achievements.unlock(id);
    }

    /**
     * Check if achievement is unlocked
     * @param {string} id - Achievement ID
     * @returns {boolean} True if unlocked
     */
    hasAchievement(id) {
        return this.achievements.has(id);
    }

    /**
     * Check achievements against current stats
     * @returns {Array} Newly unlocked achievements
     */
    checkAchievements() {
        return this.achievements.checkAchievements(this.stats.getAll());
    }

    /**
     * Get achievement progress percentage
     * @returns {number} Progress (0-100)
     */
    getAchievementProgress() {
        return this.achievements.getProgress();
    }

    // ========================================
    // Settings Convenience Methods
    // ========================================

    /**
     * Get a setting
     * @param {string} path - Setting path
     * @returns {*} Setting value
     */
    getSetting(path) {
        return this.settings.get(path);
    }

    /**
     * Set a setting
     * @param {string} path - Setting path
     * @param {*} value - Value
     */
    setSetting(path, value) {
        this.settings.set(path, value);
    }

    /**
     * Get difficulty setting
     * @returns {string} Current difficulty
     */
    getDifficulty() {
        return this.settings.getDifficulty();
    }

    /**
     * Set difficulty
     * @param {string} difficulty - Difficulty level
     */
    setDifficulty(difficulty) {
        this.settings.setDifficulty(difficulty);
    }

    /**
     * Check if sound is enabled
     * @returns {boolean} True if enabled
     */
    isSoundEnabled() {
        return this.settings.isSoundEnabled();
    }

    /**
     * Check if music is enabled
     * @returns {boolean} True if enabled
     */
    isMusicEnabled() {
        return this.settings.isMusicEnabled();
    }

    // ========================================
    // Progression Convenience Methods
    // ========================================

    /**
     * Check if content is unlocked
     * @param {string} category - Content category
     * @param {string} item - Item ID
     * @returns {boolean} True if unlocked
     */
    isUnlocked(category, item) {
        return this.progression.isUnlocked(category, item);
    }

    /**
     * Unlock content
     * @param {string} category - Content category
     * @param {string} item - Item ID
     * @returns {boolean} True if newly unlocked
     */
    unlockContent(category, item) {
        return this.progression.unlock(category, item);
    }

    /**
     * Get battle pass tier
     * @returns {number} Current tier
     */
    getBattlePassTier() {
        return this.progression.getBattlePassTier();
    }

    /**
     * Get current rank
     * @returns {number} Rank tier
     */
    getRank() {
        return this.progression.getRank();
    }

    // ========================================
    // Utility Methods
    // ========================================

    /**
     * Export all data as JSON
     * @returns {string} JSON string
     */
    exportData() {
        return this.storage.export();
    }

    /**
     * Import data from JSON
     * @param {string} jsonString - JSON data
     * @returns {boolean} True if successful
     */
    importData(jsonString) {
        const success = this.storage.import(jsonString);
        if (success) {
            this.load(); // Reload all managers
        }
        return success;
    }

    /**
     * Create a backup
     * @returns {boolean} True if successful
     */
    createBackup() {
        return this.storage.createBackup();
    }

    /**
     * Get storage size in bytes
     * @returns {number} Size in bytes
     */
    getStorageSize() {
        return this.storage.getSize();
    }

    /**
     * Get player summary
     * @returns {Object} Player summary
     */
    getPlayerSummary() {
        return {
            stats: this.stats.getSummary(),
            achievements: {
                unlocked: this.achievements.getUnlocked().length,
                total: this.achievements.achievements.length,
                progress: this.achievements.getProgress()
            },
            progression: {
                battlePassTier: this.progression.getBattlePassTier(),
                rank: this.progression.getRank(),
                campaign: this.progression.getCampaignProgress()
            }
        };
    }

    /**
     * Cleanup - stop auto-save and save one last time
     */
    cleanup() {
        this.storage.stopAutoSave();
        this.save();
        console.log('GameDataManager: Cleaned up');
    }
}

// Export singleton instance (for backward compatibility)
export const gameData = new GameDataManager();
