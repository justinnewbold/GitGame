/**
 * PlayerStatsManager - Handles all player statistics tracking
 * Separated from GameData for single responsibility
 */

import EventBus from '../../core/EventBus.js';
import { EVENTS } from '../../constants/GameConstants.js';

export default class PlayerStatsManager {
    constructor() {
        this.stats = this.getDefaultStats();
        this.dirty = false; // Flag for batched saves
    }

    /**
     * Get default stats structure
     * @returns {Object} Default stats
     */
    getDefaultStats() {
        return {
            // Global stats
            gamesPlayed: 0,
            totalScore: 0,
            totalTimePlayed: 0,

            // Per-mode stats
            gitSurvivor: {
                highScore: 0,
                gamesPlayed: 0,
                enemiesKilled: 0,
                bossesDefeated: 0
            },
            codeDefense: {
                highWave: 0,
                gamesPlayed: 0,
                towersPlaced: 0,
                enemiesDefeated: 0
            },
            prRush: {
                bestAccuracy: 0,
                gamesPlayed: 0,
                prsReviewed: 0,
                correctDecisions: 0
            },
            devCommander: {
                maxSprints: 0,
                gamesPlayed: 0,
                tasksCompleted: 0,
                devsHired: 0
            },
            debugDungeon: {
                highScore: 0,
                gamesPlayed: 0,
                bugsFixed: 0,
                roomsCleared: 0
            },
            refactorRace: {
                highScore: 0,
                gamesPlayed: 0,
                totalRefactors: 0,
                bestStreak: 0
            },
            sprintSurvivor: {
                highScore: 0,
                gamesPlayed: 0,
                maxDistance: 0,
                obstaclesAvoided: 0
            },
            bugBounty: {
                levelsCompleted: 0,
                totalStars: 0,
                perfectSolves: 0
            },
            legacyExcavator: {
                highScore: 0,
                gamesPlayed: 0,
                maxDepth: 0,
                artifactsFound: 0
            },
            bossRush: {
                highScore: 0,
                gamesPlayed: 0,
                bossesDefeated: 0,
                fastestClear: 0
            }
        };
    }

    /**
     * Load stats from data object
     * @param {Object} data - Saved stats data
     */
    load(data) {
        if (data && typeof data === 'object') {
            this.stats = { ...this.getDefaultStats(), ...data };
        } else {
            this.stats = this.getDefaultStats();
        }
        this.dirty = false;
    }

    /**
     * Get all stats
     * @returns {Object} All statistics
     */
    getAll() {
        return { ...this.stats };
    }

    /**
     * Get a specific stat by path
     * @param {string} path - Dot-notation path (e.g., 'gitSurvivor.highScore')
     * @returns {*} Stat value or undefined
     */
    get(path) {
        try {
            const keys = path.split('.');
            let current = this.stats;

            for (const key of keys) {
                if (current[key] === undefined) {
                    console.warn(`PlayerStatsManager: Stat '${path}' not found`);
                    return undefined;
                }
                current = current[key];
            }

            return current;
        } catch (error) {
            console.error(`PlayerStatsManager: Error getting stat '${path}':`, error);
            return undefined;
        }
    }

    /**
     * Update a stat by path
     * @param {string} path - Dot-notation path
     * @param {*} value - Value to set/add
     * @param {string} operation - 'set', 'increment', or 'max'
     */
    update(path, value, operation = 'set') {
        try {
            const keys = path.split('.');
            let current = this.stats;

            // Navigate to parent object
            for (let i = 0; i < keys.length - 1; i++) {
                const key = keys[i];
                if (!current[key]) {
                    current[key] = {};
                }
                current = current[key];
            }

            const finalKey = keys[keys.length - 1];
            const oldValue = current[finalKey];

            // Perform operation
            switch (operation) {
                case 'set':
                    current[finalKey] = value;
                    break;

                case 'increment':
                    current[finalKey] = (current[finalKey] || 0) + value;
                    break;

                case 'max':
                    current[finalKey] = Math.max(current[finalKey] || 0, value);
                    break;

                default:
                    console.warn(`PlayerStatsManager: Unknown operation '${operation}'`);
                    current[finalKey] = value;
            }

            this.dirty = true;

            // Emit stat update event
            EventBus.emit(EVENTS.STAT_UPDATED, {
                path,
                oldValue,
                newValue: current[finalKey],
                operation
            });

        } catch (error) {
            console.error(`PlayerStatsManager: Error updating stat '${path}':`, error);
        }
    }

    /**
     * Increment a stat
     * @param {string} path - Stat path
     * @param {number} amount - Amount to increment (default: 1)
     */
    increment(path, amount = 1) {
        this.update(path, amount, 'increment');
    }

    /**
     * Set a stat to the maximum of current or new value
     * @param {string} path - Stat path
     * @param {number} value - New value to compare
     */
    setMax(path, value) {
        this.update(path, value, 'max');
    }

    /**
     * Reset a specific stat
     * @param {string} path - Stat path to reset
     */
    reset(path) {
        this.update(path, 0, 'set');
    }

    /**
     * Reset all stats to defaults
     */
    resetAll() {
        this.stats = this.getDefaultStats();
        this.dirty = true;
        console.log('PlayerStatsManager: All stats reset');
    }

    /**
     * Get total games played across all modes
     * @returns {number} Total games played
     */
    getTotalGames() {
        return this.stats.gamesPlayed || 0;
    }

    /**
     * Get total score across all modes
     * @returns {number} Total score
     */
    getTotalScore() {
        return this.stats.totalScore || 0;
    }

    /**
     * Get stats for a specific game mode
     * @param {string} mode - Game mode name
     * @returns {Object} Mode stats
     */
    getModeStats(mode) {
        return this.stats[mode] || {};
    }

    /**
     * Check if any stat has changed (for dirty checking)
     * @returns {boolean} True if stats have been modified
     */
    isDirty() {
        return this.dirty;
    }

    /**
     * Mark stats as clean (after saving)
     */
    markClean() {
        this.dirty = false;
    }

    /**
     * Get summary of player's performance
     * @returns {Object} Stats summary
     */
    getSummary() {
        return {
            gamesPlayed: this.getTotalGames(),
            totalScore: this.getTotalScore(),
            favoriteMode: this.getFavoriteMode(),
            totalPlayTime: this.stats.totalTimePlayed || 0
        };
    }

    /**
     * Get player's favorite game mode (most played)
     * @returns {string} Favorite mode name
     */
    getFavoriteMode() {
        let maxGames = 0;
        let favorite = 'none';

        const modes = [
            'gitSurvivor',
            'codeDefense',
            'prRush',
            'devCommander',
            'debugDungeon',
            'refactorRace',
            'sprintSurvivor',
            'bugBounty',
            'legacyExcavator',
            'bossRush'
        ];

        modes.forEach(mode => {
            const gamesPlayed = this.stats[mode]?.gamesPlayed || 0;
            if (gamesPlayed > maxGames) {
                maxGames = gamesPlayed;
                favorite = mode;
            }
        });

        return favorite;
    }

    /**
     * Export stats for saving
     * @returns {Object} Stats data
     */
    export() {
        return { ...this.stats };
    }
}
