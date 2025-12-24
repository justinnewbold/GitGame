/**
 * Leaderboard - Local high score management system
 * Stores top 10 scores per game mode with player initials and timestamps
 */

import { logger } from './Logger.js';

const STORAGE_KEY = 'gitgame_leaderboards';
const MAX_ENTRIES = 10;

/**
 * @typedef {Object} LeaderboardEntry
 * @property {string} name - Player name or initials (3 chars)
 * @property {number} score - The score achieved
 * @property {number} timestamp - Unix timestamp of when the score was set
 * @property {string} [difficulty] - Difficulty level (optional)
 * @property {Object} [stats] - Additional stats like level, kills, etc.
 */

/**
 * @typedef {Object} GameModeLeaderboard
 * @property {LeaderboardEntry[]} entries - Sorted list of top scores
 */

class Leaderboard {
    constructor() {
        /** @type {Object.<string, GameModeLeaderboard>} */
        this.data = {};
        this.load();
    }

    /**
     * Load leaderboards from localStorage
     */
    load() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                this.data = JSON.parse(stored);
            }
            logger.debug('Leaderboard', 'Loaded leaderboards', {
                modes: Object.keys(this.data)
            });
        } catch (e) {
            logger.warn('Leaderboard', 'Failed to load leaderboards', { error: e.message });
            this.data = {};
        }
    }

    /**
     * Save leaderboards to localStorage
     */
    save() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
            return true;
        } catch (e) {
            logger.error('Leaderboard', 'Failed to save leaderboards', { error: e.message });
            return false;
        }
    }

    /**
     * Initialize a game mode's leaderboard if it doesn't exist
     * @param {string} gameMode - The game mode identifier
     */
    initGameMode(gameMode) {
        if (!this.data[gameMode]) {
            this.data[gameMode] = { entries: [] };
        }
    }

    /**
     * Add a score to the leaderboard
     * @param {string} gameMode - The game mode (e.g., 'gitSurvivor', 'codeDefense')
     * @param {string} name - Player name or initials (will be truncated to 3 chars)
     * @param {number} score - The score achieved
     * @param {string} [difficulty] - Difficulty level
     * @param {Object} [stats] - Additional stats
     * @returns {{added: boolean, rank: number}} Whether the score was added and its rank
     */
    addScore(gameMode, name, score, difficulty = 'normal', stats = {}) {
        this.initGameMode(gameMode);

        // Sanitize name (3 chars, alphanumeric only)
        const sanitizedName = (name || 'AAA')
            .toUpperCase()
            .replace(/[^A-Z0-9]/g, '')
            .substring(0, 3)
            .padEnd(3, 'A');

        const entry = {
            name: sanitizedName,
            score: Math.max(0, Math.floor(score)),
            timestamp: Date.now(),
            difficulty,
            stats
        };

        const entries = this.data[gameMode].entries;

        // Find insertion position (sorted descending)
        let insertIndex = entries.findIndex(e => e.score < entry.score);
        if (insertIndex === -1) {
            insertIndex = entries.length;
        }

        // Check if score qualifies for leaderboard
        if (insertIndex >= MAX_ENTRIES) {
            logger.debug('Leaderboard', 'Score did not qualify', { gameMode, score });
            return { added: false, rank: -1 };
        }

        // Insert and trim to max entries
        entries.splice(insertIndex, 0, entry);
        if (entries.length > MAX_ENTRIES) {
            entries.pop();
        }

        this.save();
        const rank = insertIndex + 1;
        logger.info('Leaderboard', 'New high score added', { gameMode, rank, score });

        return { added: true, rank };
    }

    /**
     * Check if a score would qualify for the leaderboard
     * @param {string} gameMode - The game mode
     * @param {number} score - The score to check
     * @returns {{qualifies: boolean, rank: number}} Whether the score qualifies and what rank it would be
     */
    wouldQualify(gameMode, score) {
        this.initGameMode(gameMode);
        const entries = this.data[gameMode].entries;

        if (entries.length < MAX_ENTRIES) {
            const rank = entries.filter(e => e.score >= score).length + 1;
            return { qualifies: true, rank };
        }

        const lowestScore = entries[entries.length - 1]?.score || 0;
        if (score > lowestScore) {
            const rank = entries.filter(e => e.score >= score).length + 1;
            return { qualifies: true, rank };
        }

        return { qualifies: false, rank: -1 };
    }

    /**
     * Get leaderboard entries for a game mode
     * @param {string} gameMode - The game mode
     * @returns {LeaderboardEntry[]} Sorted list of entries
     */
    getEntries(gameMode) {
        this.initGameMode(gameMode);
        return [...this.data[gameMode].entries];
    }

    /**
     * Get the top score for a game mode
     * @param {string} gameMode - The game mode
     * @returns {LeaderboardEntry|null} The top entry or null if no entries
     */
    getTopScore(gameMode) {
        this.initGameMode(gameMode);
        return this.data[gameMode].entries[0] || null;
    }

    /**
     * Get all available game modes with leaderboards
     * @returns {string[]} List of game mode identifiers
     */
    getGameModes() {
        return Object.keys(this.data);
    }

    /**
     * Clear leaderboard for a specific game mode
     * @param {string} gameMode - The game mode to clear
     */
    clearGameMode(gameMode) {
        if (this.data[gameMode]) {
            this.data[gameMode].entries = [];
            this.save();
            logger.info('Leaderboard', 'Cleared leaderboard', { gameMode });
        }
    }

    /**
     * Clear all leaderboards
     */
    clearAll() {
        this.data = {};
        this.save();
        logger.info('Leaderboard', 'Cleared all leaderboards');
    }

    /**
     * Format a timestamp as a date string
     * @param {number} timestamp - Unix timestamp
     * @returns {string} Formatted date
     */
    static formatDate(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: '2-digit'
        });
    }

    /**
     * Get display name for a game mode
     * @param {string} gameMode - The game mode identifier
     * @returns {string} Human-readable name
     */
    static getModeName(gameMode) {
        const names = {
            gitSurvivor: 'Git Survivor',
            codeDefense: 'Code Defense',
            prRush: 'PR Rush',
            devCommander: 'Dev Commander',
            bugBounty: 'Bug Bounty',
            sprintSurvivor: 'Sprint Survivor',
            bossRush: 'Boss Rush',
            debugDungeon: 'Debug Dungeon',
            refactorRace: 'Refactor Race',
            legacyExcavator: 'Legacy Excavator'
        };
        return names[gameMode] || gameMode;
    }

    /**
     * Get icon for a game mode
     * @param {string} gameMode - The game mode identifier
     * @returns {string} Emoji icon
     */
    static getModeIcon(gameMode) {
        const icons = {
            gitSurvivor: '🗡️',
            codeDefense: '🏰',
            prRush: '⏰',
            devCommander: '⚔️',
            bugBounty: '🐛',
            sprintSurvivor: '🏃',
            bossRush: '👹',
            debugDungeon: '🐞',
            refactorRace: '♻️',
            legacyExcavator: '🏚️'
        };
        return icons[gameMode] || '🎮';
    }
}

// Export singleton instance
export const leaderboard = new Leaderboard();
export default Leaderboard;
