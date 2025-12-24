/**
 * MotionPreferences - Handles reduced motion accessibility settings
 * Respects system preferences and provides manual override
 */

import { logger } from './Logger.js';
import { gameData } from './GameData.js';

/**
 * @typedef {Object} MotionSettings
 * @property {boolean} reduceMotion - Whether to reduce motion
 * @property {boolean} disableShake - Whether to disable screen shake
 * @property {boolean} disableFlash - Whether to disable screen flash
 * @property {boolean} reduceParticles - Whether to reduce particle effects
 * @property {number} animationSpeed - Animation speed multiplier (1 = normal, 0.5 = slower)
 */

class MotionPreferences {
    constructor() {
        /** @type {boolean} */
        this.systemPrefersReducedMotion = false;
        /** @type {boolean} */
        this.userOverride = null; // null = use system, true/false = user preference

        this._detectSystemPreference();
        this._loadUserPreference();
        this._setupMediaQueryListener();

        logger.debug('MotionPreferences', 'Initialized', {
            systemPrefers: this.systemPrefersReducedMotion,
            userOverride: this.userOverride
        });
    }

    /**
     * Detect system preference for reduced motion
     * @private
     */
    _detectSystemPreference() {
        if (typeof window !== 'undefined' && window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
            this.systemPrefersReducedMotion = mediaQuery.matches;
        }
    }

    /**
     * Load user preference from storage
     * @private
     */
    _loadUserPreference() {
        const savedPref = gameData.getSetting('reducedMotion');
        if (savedPref !== null && savedPref !== undefined) {
            this.userOverride = savedPref;
        }
    }

    /**
     * Setup listener for system preference changes
     * @private
     */
    _setupMediaQueryListener() {
        if (typeof window !== 'undefined' && window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
            try {
                // Modern browsers
                mediaQuery.addEventListener('change', (e) => {
                    this.systemPrefersReducedMotion = e.matches;
                    logger.info('MotionPreferences', 'System preference changed', {
                        reducedMotion: e.matches
                    });
                });
            } catch {
                // Fallback for older browsers
                mediaQuery.addListener((e) => {
                    this.systemPrefersReducedMotion = e.matches;
                });
            }
        }
    }

    /**
     * Check if reduced motion should be applied
     * @returns {boolean}
     */
    shouldReduceMotion() {
        // User override takes precedence
        if (this.userOverride !== null) {
            return this.userOverride;
        }
        // Otherwise use system preference
        return this.systemPrefersReducedMotion;
    }

    /**
     * Get detailed motion settings
     * @returns {MotionSettings}
     */
    getSettings() {
        const reduceMotion = this.shouldReduceMotion();
        return {
            reduceMotion,
            disableShake: reduceMotion,
            disableFlash: reduceMotion,
            reduceParticles: reduceMotion,
            animationSpeed: reduceMotion ? 0.5 : 1
        };
    }

    /**
     * Set user preference for reduced motion
     * @param {boolean|null} enabled - true to enable, false to disable, null to use system
     */
    setReducedMotion(enabled) {
        this.userOverride = enabled;
        if (enabled !== null) {
            gameData.setSetting('reducedMotion', enabled);
        } else {
            // Remove the setting to use system preference
            gameData.setSetting('reducedMotion', null);
        }
        logger.info('MotionPreferences', 'User preference updated', {
            enabled,
            effective: this.shouldReduceMotion()
        });
    }

    /**
     * Get current setting mode
     * @returns {'system'|'enabled'|'disabled'}
     */
    getMode() {
        if (this.userOverride === null) return 'system';
        return this.userOverride ? 'enabled' : 'disabled';
    }

    /**
     * Get display label for current mode
     * @returns {string}
     */
    getModeLabel() {
        const mode = this.getMode();
        const labels = {
            system: 'System Default',
            enabled: 'Reduced Motion',
            disabled: 'Full Motion'
        };
        return labels[mode];
    }

    /**
     * Cycle through modes: system -> enabled -> disabled -> system
     * @returns {string} New mode
     */
    cycleMode() {
        const currentMode = this.getMode();
        if (currentMode === 'system') {
            this.setReducedMotion(true);
            return 'enabled';
        } else if (currentMode === 'enabled') {
            this.setReducedMotion(false);
            return 'disabled';
        } else {
            this.setReducedMotion(null);
            return 'system';
        }
    }

    /**
     * Apply reduced motion settings to a Phaser scene
     * @param {Phaser.Scene} scene - The scene to apply settings to
     */
    applyToScene(scene) {
        const settings = this.getSettings();

        // Store settings on scene for easy access
        scene._motionSettings = settings;

        // If particles system exists, configure it
        if (scene.particles && typeof scene.particles.setReducedMotion === 'function') {
            scene.particles.setReducedMotion(settings.reduceParticles);
        }

        logger.debug('MotionPreferences', 'Applied to scene', {
            scene: scene.scene?.key,
            settings
        });
    }

    /**
     * Get safe tween duration (may be reduced in reduced motion mode)
     * @param {number} duration - Original duration in ms
     * @returns {number} Adjusted duration
     */
    getTweenDuration(duration) {
        const settings = this.getSettings();
        return settings.reduceMotion ? Math.min(duration, 200) : duration;
    }

    /**
     * Check if screen shake should be applied
     * @returns {boolean}
     */
    canShake() {
        return !this.getSettings().disableShake;
    }

    /**
     * Check if screen flash should be applied
     * @returns {boolean}
     */
    canFlash() {
        return !this.getSettings().disableFlash;
    }

    /**
     * Get particle count (reduced in reduced motion mode)
     * @param {number} count - Original particle count
     * @returns {number} Adjusted count
     */
    getParticleCount(count) {
        const settings = this.getSettings();
        return settings.reduceParticles ? Math.max(1, Math.floor(count * 0.3)) : count;
    }
}

// Export singleton instance
export const motionPrefs = new MotionPreferences();
export default MotionPreferences;
