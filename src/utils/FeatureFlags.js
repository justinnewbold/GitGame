/**
 * Feature Flags System
 *
 * Enables/disables features dynamically for A/B testing and gradual rollouts
 *
 * Usage:
 *   import { featureFlags } from './utils/FeatureFlags.js';
 *
 *   if (featureFlags.isEnabled('new_power_up')) {
 *       // Enable new feature
 *   }
 *
 *   // Force enable for testing
 *   featureFlags.enable('new_feature');
 */

import { logger } from './Logger.js';

class FeatureFlags {
    constructor() {
        this.flags = this.getDefaultFlags();
        this.overrides = {};

        // Load from localStorage
        this.loadOverrides();

        // Load from URL parameters (for testing)
        this.loadFromURL();

        logger.info('FeatureFlags', 'Feature flags initialized', {
            flags: this.flags,
            overrides: this.overrides
        });
    }

    /**
     * Get default flag configuration
     */
    getDefaultFlags() {
        return {
            // Core Features
            analytics: true,
            errorReporting: true,
            performanceMonitoring: true,

            // Game Features
            virtualJoystick: true,
            saveStates: true,
            achievements: true,
            leaderboards: false, // Not implemented yet

            // New/Experimental Features
            newPowerUps: false,
            advancedTutorial: false,
            musicSystem: false,
            replaySystem: false,
            modding: false,

            // UI Features
            darkMode: false,
            animations: true,
            particles: true,

            // Development/Testing
            debugMode: false,
            godMode: false,
            unlockAll: false
        };
    }

    /**
     * Check if a feature is enabled
     */
    isEnabled(flagName) {
        // Check overrides first
        if (flagName in this.overrides) {
            return this.overrides[flagName];
        }

        // Check default flags
        if (flagName in this.flags) {
            return this.flags[flagName];
        }

        // Unknown flag - default to false
        logger.warn('FeatureFlags', 'Unknown feature flag', { flagName });
        return false;
    }

    /**
     * Enable a feature
     */
    enable(flagName) {
        this.overrides[flagName] = true;
        this.saveOverrides();
        logger.info('FeatureFlags', 'Feature enabled', { flagName });
    }

    /**
     * Disable a feature
     */
    disable(flagName) {
        this.overrides[flagName] = false;
        this.saveOverrides();
        logger.info('FeatureFlags', 'Feature disabled', { flagName });
    }

    /**
     * Toggle a feature
     */
    toggle(flagName) {
        const current = this.isEnabled(flagName);
        if (current) {
            this.disable(flagName);
        } else {
            this.enable(flagName);
        }
    }

    /**
     * Reset a feature to default
     */
    reset(flagName) {
        delete this.overrides[flagName];
        this.saveOverrides();
        logger.info('FeatureFlags', 'Feature reset to default', { flagName });
    }

    /**
     * Reset all overrides
     */
    resetAll() {
        this.overrides = {};
        this.saveOverrides();
        logger.info('FeatureFlags', 'All overrides reset');
    }

    /**
     * Get all flags and their status
     */
    getAll() {
        const all = {};
        for (const flagName in this.flags) {
            all[flagName] = this.isEnabled(flagName);
        }
        return all;
    }

    /**
     * Load overrides from localStorage
     */
    loadOverrides() {
        try {
            const saved = localStorage.getItem('featureFlags');
            if (saved) {
                this.overrides = JSON.parse(saved);
                logger.debug('FeatureFlags', 'Overrides loaded', this.overrides);
            }
        } catch (error) {
            logger.warn('FeatureFlags', 'Could not load overrides', { error });
        }
    }

    /**
     * Save overrides to localStorage
     */
    saveOverrides() {
        try {
            localStorage.setItem('featureFlags', JSON.stringify(this.overrides));
        } catch (error) {
            logger.warn('FeatureFlags', 'Could not save overrides', { error });
        }
    }

    /**
     * Load feature flags from URL parameters
     * Example: ?features=newPowerUps,musicSystem&disable=analytics
     */
    loadFromURL() {
        try {
            const params = new URLSearchParams(window.location.search);

            // Enable features from URL
            const enabledFeatures = params.get('features');
            if (enabledFeatures) {
                enabledFeatures.split(',').forEach(feature => {
                    this.enable(feature.trim());
                });
            }

            // Disable features from URL
            const disabledFeatures = params.get('disable');
            if (disabledFeatures) {
                disabledFeatures.split(',').forEach(feature => {
                    this.disable(feature.trim());
                });
            }

            // Debug mode
            if (params.get('debug') === 'true') {
                this.enable('debugMode');
            }

            // God mode (for testing)
            if (params.get('god') === 'true') {
                this.enable('godMode');
            }
        } catch (error) {
            logger.warn('FeatureFlags', 'Could not load from URL', { error });
        }
    }

    /**
     * Get feature flag status as URL parameters
     */
    toURLParams() {
        const enabled = [];
        const disabled = [];

        for (const [key, value] of Object.entries(this.overrides)) {
            if (value) {
                enabled.push(key);
            } else {
                disabled.push(key);
            }
        }

        const params = new URLSearchParams();
        if (enabled.length > 0) {
            params.set('features', enabled.join(','));
        }
        if (disabled.length > 0) {
            params.set('disable', disabled.join(','));
        }

        return params.toString();
    }

    /**
     * Bulk update flags
     */
    setFlags(flags) {
        Object.assign(this.overrides, flags);
        this.saveOverrides();
        logger.info('FeatureFlags', 'Flags updated', flags);
    }

    /**
     * Check if feature is in experiment
     * Returns percentage of users who should see this feature
     */
    getExperimentPercentage(flagName) {
        const experiments = {
            newPowerUps: 50,  // 50% of users
            musicSystem: 25,   // 25% of users
            advancedTutorial: 10  // 10% of users
        };

        return experiments[flagName] || 0;
    }

    /**
     * Check if user is in experiment (based on user ID or random)
     */
    isInExperiment(flagName, userId = null) {
        const percentage = this.getExperimentPercentage(flagName);
        if (percentage === 0) return false;

        // Use userId for consistent experiments
        if (userId) {
            const hash = this.hashCode(userId);
            return (hash % 100) < percentage;
        }

        // Use random for anonymous users
        return Math.random() * 100 < percentage;
    }

    /**
     * Simple hash function for user IDs
     */
    hashCode(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash);
    }

    /**
     * Export current configuration
     */
    export() {
        return {
            flags: this.flags,
            overrides: this.overrides,
            all: this.getAll()
        };
    }
}

// Export singleton instance
export const featureFlags = new FeatureFlags();

// Expose globally for debugging
if (typeof window !== 'undefined') {
    window.featureFlags = featureFlags;
}

export default FeatureFlags;
