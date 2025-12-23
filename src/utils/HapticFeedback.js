/**
 * HapticFeedback - Provides haptic (vibration) feedback for mobile devices
 * Uses the Vibration API with graceful fallback
 */

import { logger } from './Logger.js';
import { gameData } from './GameData.js';

/**
 * @typedef {Object} HapticPattern
 * @property {string} name - Pattern name
 * @property {number[]} pattern - Vibration pattern [vibrate, pause, vibrate, ...]
 */

/**
 * HapticFeedback manager class
 * @class
 */
class HapticFeedback {
    constructor() {
        /** @type {boolean} */
        this.enabled = true;
        /** @type {boolean} */
        this.supported = this._checkSupport();

        /** @type {Object.<string, number[]>} Pre-defined haptic patterns */
        this.patterns = {
            // Light feedback - quick tap
            light: [10],
            // Medium feedback - standard tap
            medium: [25],
            // Heavy feedback - strong tap
            heavy: [50],
            // Success - double tap
            success: [30, 50, 30],
            // Error - long vibrate
            error: [100],
            // Warning - three quick taps
            warning: [20, 30, 20, 30, 20],
            // Impact - heavy hit
            impact: [40, 20, 60],
            // Collect - light pickup
            collect: [15],
            // PowerUp - exciting pattern
            powerup: [20, 30, 40, 30, 50],
            // LevelUp - celebratory
            levelup: [30, 50, 30, 50, 30, 50, 100],
            // GameOver - dramatic end
            gameover: [100, 50, 100, 50, 200],
            // Boss - ominous pattern
            boss: [50, 100, 50, 100, 50, 100, 200],
            // Damage - hit feedback
            damage: [30, 40, 50],
            // Button - UI interaction
            button: [5]
        };

        this._loadSettings();
    }

    /**
     * Check if the Vibration API is supported
     * @private
     * @returns {boolean}
     */
    _checkSupport() {
        const supported = 'vibrate' in navigator;
        if (!supported) {
            logger.debug('HapticFeedback', 'Vibration API not supported on this device');
        }
        return supported;
    }

    /**
     * Load enabled state from game settings
     * @private
     */
    _loadSettings() {
        const settings = gameData.getSettings();
        this.enabled = settings.hapticFeedback !== false;
    }

    /**
     * Enable or disable haptic feedback
     * @param {boolean} enabled - Whether to enable haptic feedback
     */
    setEnabled(enabled) {
        this.enabled = Boolean(enabled);
        gameData.setSetting('hapticFeedback', this.enabled);
    }

    /**
     * Check if haptic feedback is enabled and supported
     * @returns {boolean}
     */
    isEnabled() {
        return this.enabled && this.supported;
    }

    /**
     * Check if haptic feedback is supported on this device
     * @returns {boolean}
     */
    isSupported() {
        return this.supported;
    }

    /**
     * Trigger a haptic vibration
     * @param {number|number[]} pattern - Duration in ms or pattern array [vibrate, pause, vibrate, ...]
     * @returns {boolean} Whether the vibration was triggered
     */
    vibrate(pattern) {
        if (!this.isEnabled()) return false;

        try {
            return navigator.vibrate(pattern);
        } catch (e) {
            logger.warn('HapticFeedback', 'Error triggering vibration', { error: e.message });
            return false;
        }
    }

    /**
     * Stop any ongoing vibration
     */
    cancel() {
        if (this.supported) {
            try {
                navigator.vibrate(0);
            } catch (e) {
                // Ignore errors when canceling
            }
        }
    }

    /**
     * Trigger a named haptic pattern
     * @param {string} patternName - Name of the pattern (light, medium, heavy, success, error, etc.)
     * @returns {boolean} Whether the vibration was triggered
     */
    trigger(patternName) {
        const pattern = this.patterns[patternName];
        if (!pattern) {
            logger.warn('HapticFeedback', `Unknown haptic pattern: ${patternName}`);
            return false;
        }
        return this.vibrate(pattern);
    }

    /**
     * Light feedback - quick tap for minor interactions
     */
    light() {
        return this.trigger('light');
    }

    /**
     * Medium feedback - standard interaction
     */
    medium() {
        return this.trigger('medium');
    }

    /**
     * Heavy feedback - strong interaction
     */
    heavy() {
        return this.trigger('heavy');
    }

    /**
     * Success feedback - positive confirmation
     */
    success() {
        return this.trigger('success');
    }

    /**
     * Error feedback - negative confirmation
     */
    error() {
        return this.trigger('error');
    }

    /**
     * Warning feedback - alert
     */
    warning() {
        return this.trigger('warning');
    }

    /**
     * Impact feedback - collision or hit
     */
    impact() {
        return this.trigger('impact');
    }

    /**
     * Collect feedback - item pickup
     */
    collect() {
        return this.trigger('collect');
    }

    /**
     * PowerUp feedback - power-up collection
     */
    powerup() {
        return this.trigger('powerup');
    }

    /**
     * LevelUp feedback - level advancement
     */
    levelup() {
        return this.trigger('levelup');
    }

    /**
     * GameOver feedback - game end
     */
    gameover() {
        return this.trigger('gameover');
    }

    /**
     * Boss feedback - boss appearance
     */
    boss() {
        return this.trigger('boss');
    }

    /**
     * Damage feedback - player hit
     */
    damage() {
        return this.trigger('damage');
    }

    /**
     * Button feedback - UI button press
     */
    button() {
        return this.trigger('button');
    }

    /**
     * Add a custom haptic pattern
     * @param {string} name - Pattern name
     * @param {number[]} pattern - Vibration pattern array
     */
    addPattern(name, pattern) {
        if (!Array.isArray(pattern) || pattern.length === 0) {
            logger.warn('HapticFeedback', 'Invalid pattern provided');
            return;
        }
        this.patterns[name] = pattern;
    }

    /**
     * Get all available pattern names
     * @returns {string[]}
     */
    getPatternNames() {
        return Object.keys(this.patterns);
    }
}

// Export singleton instance
export const haptics = new HapticFeedback();
export default HapticFeedback;
