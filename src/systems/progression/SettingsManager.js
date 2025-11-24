/**
 * SettingsManager - Handles game settings
 * Separated from GameData for single responsibility
 */

import EventBus from '../../core/EventBus.js';
import { EVENTS, DIFFICULTY } from '../../constants/GameConstants.js';

export default class SettingsManager {
    constructor() {
        this.settings = this.getDefaultSettings();
    }

    /**
     * Get default settings
     * @returns {Object} Default settings
     */
    getDefaultSettings() {
        return {
            soundEnabled: true,
            musicEnabled: true,
            difficulty: DIFFICULTY.NORMAL,
            volume: {
                master: 1.0,
                music: 0.7,
                sfx: 0.8
            },
            graphics: {
                particles: true,
                screenShake: true,
                animations: true
            },
            accessibility: {
                colorBlindMode: false,
                reducedMotion: false,
                highContrast: false
            },
            tutorial: {
                seen: {}
            }
        };
    }

    /**
     * Load settings from data
     * @param {Object} data - Saved settings
     */
    load(data) {
        if (data && typeof data === 'object') {
            this.settings = { ...this.getDefaultSettings(), ...data };
        } else {
            this.settings = this.getDefaultSettings();
        }
    }

    /**
     * Get a setting value
     * @param {string} path - Dot-notation path (e.g., 'volume.music')
     * @returns {*} Setting value
     */
    get(path) {
        try {
            const keys = path.split('.');
            let current = this.settings;

            for (const key of keys) {
                if (current[key] === undefined) {
                    console.warn(`SettingsManager: Setting '${path}' not found`);
                    return undefined;
                }
                current = current[key];
            }

            return current;
        } catch (error) {
            console.error(`SettingsManager: Error getting setting '${path}':`, error);
            return undefined;
        }
    }

    /**
     * Set a setting value
     * @param {string} path - Dot-notation path
     * @param {*} value - Value to set
     */
    set(path, value) {
        try {
            const keys = path.split('.');
            let current = this.settings;

            // Navigate to parent
            for (let i = 0; i < keys.length - 1; i++) {
                const key = keys[i];
                if (!current[key]) {
                    current[key] = {};
                }
                current = current[key];
            }

            const finalKey = keys[keys.length - 1];
            const oldValue = current[finalKey];
            current[finalKey] = value;

            // Emit setting changed event
            EventBus.emit(EVENTS.SETTING_CHANGED, { path, oldValue, newValue: value });

            // Emit specific events for important settings
            if (path === 'difficulty') {
                EventBus.emit(EVENTS.DIFFICULTY_CHANGED, value);
            }

        } catch (error) {
            console.error(`SettingsManager: Error setting '${path}':`, error);
        }
    }

    /**
     * Get difficulty setting
     * @returns {string} Current difficulty
     */
    getDifficulty() {
        return this.settings.difficulty || DIFFICULTY.NORMAL;
    }

    /**
     * Set difficulty
     * @param {string} difficulty - Difficulty level
     */
    setDifficulty(difficulty) {
        if (DIFFICULTY.MULTIPLIERS[difficulty]) {
            this.set('difficulty', difficulty);
        } else {
            console.warn('SettingsManager: Invalid difficulty:', difficulty);
        }
    }

    /**
     * Check if sound is enabled
     * @returns {boolean} True if sound enabled
     */
    isSoundEnabled() {
        return this.settings.soundEnabled;
    }

    /**
     * Toggle sound on/off
     * @param {boolean} enabled - Enable sound
     */
    setSoundEnabled(enabled) {
        this.set('soundEnabled', enabled);
    }

    /**
     * Check if music is enabled
     * @returns {boolean} True if music enabled
     */
    isMusicEnabled() {
        return this.settings.musicEnabled;
    }

    /**
     * Toggle music on/off
     * @param {boolean} enabled - Enable music
     */
    setMusicEnabled(enabled) {
        this.set('musicEnabled', enabled);
    }

    /**
     * Get volume level
     * @param {string} type - Volume type ('master', 'music', or 'sfx')
     * @returns {number} Volume level (0-1)
     */
    getVolume(type = 'master') {
        return this.settings.volume[type] || 1.0;
    }

    /**
     * Set volume level
     * @param {string} type - Volume type
     * @param {number} level - Volume level (0-1)
     */
    setVolume(type, level) {
        if (level >= 0 && level <= 1) {
            this.set(`volume.${type}`, level);
        }
    }

    /**
     * Check if tutorial has been seen
     * @param {string} tutorialName - Tutorial identifier
     * @returns {boolean} True if tutorial seen
     */
    hasTutorialBeenSeen(tutorialName) {
        return this.settings.tutorial.seen[tutorialName] === true;
    }

    /**
     * Mark tutorial as seen
     * @param {string} tutorialName - Tutorial identifier
     */
    markTutorialSeen(tutorialName) {
        this.set(`tutorial.seen.${tutorialName}`, true);
    }

    /**
     * Reset tutorial flags
     */
    resetTutorials() {
        this.set('tutorial.seen', {});
    }

    /**
     * Reset all settings to defaults
     */
    resetAll() {
        this.settings = this.getDefaultSettings();
        EventBus.emit(EVENTS.SETTING_CHANGED, { path: 'all', reset: true });
        console.log('SettingsManager: All settings reset');
    }

    /**
     * Export settings for saving
     * @returns {Object} Settings data
     */
    export() {
        return { ...this.settings };
    }
}
