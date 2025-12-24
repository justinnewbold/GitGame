/**
 * ScreenReader - Accessibility announcements for screen reader users
 * Uses ARIA live regions to announce game events
 */

import { logger } from './Logger.js';
import { gameData } from './GameData.js';

/**
 * Announcement priority levels
 * @readonly
 * @enum {string}
 */
export const AnnouncePriority = {
    /** Polite - waits for user to stop interacting */
    POLITE: 'polite',
    /** Assertive - interrupts current speech */
    ASSERTIVE: 'assertive'
};

/**
 * ScreenReader utility for game accessibility
 * @class
 */
class ScreenReader {
    constructor() {
        /** @type {boolean} */
        this.enabled = true;
        /** @type {HTMLElement|null} */
        this.liveRegion = null;
        /** @type {HTMLElement|null} */
        this.assertiveRegion = null;
        /** @type {number} */
        this.lastAnnounceTime = 0;
        /** @type {number} */
        this.minInterval = 500; // Minimum ms between announcements

        this._createLiveRegions();
        this._loadSettings();

        logger.debug('ScreenReader', 'Initialized');
    }

    /**
     * Create ARIA live regions in the DOM
     * @private
     */
    _createLiveRegions() {
        if (typeof document === 'undefined') return;

        // Polite announcements (general updates)
        this.liveRegion = document.createElement('div');
        this.liveRegion.setAttribute('role', 'status');
        this.liveRegion.setAttribute('aria-live', 'polite');
        this.liveRegion.setAttribute('aria-atomic', 'true');
        this.liveRegion.className = 'sr-only';
        this.liveRegion.style.cssText = `
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
            border: 0;
        `;
        document.body.appendChild(this.liveRegion);

        // Assertive announcements (urgent updates)
        this.assertiveRegion = document.createElement('div');
        this.assertiveRegion.setAttribute('role', 'alert');
        this.assertiveRegion.setAttribute('aria-live', 'assertive');
        this.assertiveRegion.setAttribute('aria-atomic', 'true');
        this.assertiveRegion.className = 'sr-only';
        this.assertiveRegion.style.cssText = this.liveRegion.style.cssText;
        document.body.appendChild(this.assertiveRegion);
    }

    /**
     * Load settings from game data
     * @private
     */
    _loadSettings() {
        const settings = gameData.getSettings();
        this.enabled = settings.screenReaderAnnouncements !== false;
    }

    /**
     * Enable or disable announcements
     * @param {boolean} enabled
     */
    setEnabled(enabled) {
        this.enabled = Boolean(enabled);
        gameData.setSetting('screenReaderAnnouncements', this.enabled);
    }

    /**
     * Check if announcements are enabled
     * @returns {boolean}
     */
    isEnabled() {
        return this.enabled;
    }

    /**
     * Announce a message to screen readers
     * @param {string} message - The message to announce
     * @param {string} [priority='polite'] - Priority level (polite or assertive)
     * @returns {boolean} Whether the announcement was made
     */
    announce(message, priority = AnnouncePriority.POLITE) {
        if (!this.enabled) return false;
        if (!message || typeof message !== 'string') return false;

        // Rate limiting to avoid overwhelming the user
        const now = Date.now();
        if (now - this.lastAnnounceTime < this.minInterval) {
            logger.debug('ScreenReader', 'Announcement throttled', { message });
            return false;
        }
        this.lastAnnounceTime = now;

        const region = priority === AnnouncePriority.ASSERTIVE
            ? this.assertiveRegion
            : this.liveRegion;

        if (!region) return false;

        // Clear and set new content (triggers announcement)
        region.textContent = '';
        // Small delay to ensure screen reader picks up the change
        setTimeout(() => {
            region.textContent = message;
        }, 50);

        logger.debug('ScreenReader', 'Announced', { message, priority });
        return true;
    }

    /**
     * Announce with polite priority (general updates)
     * @param {string} message
     * @returns {boolean}
     */
    polite(message) {
        return this.announce(message, AnnouncePriority.POLITE);
    }

    /**
     * Announce with assertive priority (urgent updates)
     * @param {string} message
     * @returns {boolean}
     */
    assertive(message) {
        return this.announce(message, AnnouncePriority.ASSERTIVE);
    }

    // ============================================
    // Game-Specific Announcement Methods
    // ============================================

    /**
     * Announce game start
     * @param {string} gameMode - Name of the game mode
     */
    gameStart(gameMode) {
        this.assertive(`${gameMode} started. Good luck!`);
    }

    /**
     * Announce game over
     * @param {number} score - Final score
     * @param {Object} [stats] - Additional stats
     */
    gameOver(score, stats = {}) {
        let message = `Game over. Final score: ${score}.`;
        if (stats.level) message += ` Reached level ${stats.level}.`;
        if (stats.kills) message += ` ${stats.kills} enemies defeated.`;
        this.assertive(message);
    }

    /**
     * Announce level up
     * @param {number} level - New level
     */
    levelUp(level) {
        this.assertive(`Level up! Now level ${level}.`);
    }

    /**
     * Announce power-up collection
     * @param {string} powerUpName - Name of the power-up
     * @param {string} [effect] - Description of the effect
     */
    powerUpCollected(powerUpName, effect = '') {
        let message = `Power-up: ${powerUpName}`;
        if (effect) message += `. ${effect}`;
        this.polite(message);
    }

    /**
     * Announce health change
     * @param {number} health - Current health
     * @param {number} [maxHealth=100] - Maximum health
     */
    healthChanged(health, maxHealth = 100) {
        const percent = Math.round((health / maxHealth) * 100);
        if (percent <= 25) {
            this.assertive(`Warning: Health critical at ${percent} percent!`);
        } else if (percent <= 50) {
            this.polite(`Health at ${percent} percent.`);
        }
    }

    /**
     * Announce enemy spawn
     * @param {string} enemyType - Type of enemy
     */
    enemySpawn(enemyType) {
        this.polite(`${enemyType} appeared!`);
    }

    /**
     * Announce boss spawn
     * @param {string} bossName - Name of the boss
     */
    bossSpawn(bossName) {
        this.assertive(`Boss incoming: ${bossName}! Prepare for battle!`);
    }

    /**
     * Announce boss defeated
     * @param {string} bossName - Name of the boss
     */
    bossDefeated(bossName) {
        this.assertive(`${bossName} defeated! Great job!`);
    }

    /**
     * Announce wave start
     * @param {number} wave - Wave number
     */
    waveStart(wave) {
        this.assertive(`Wave ${wave} starting!`);
    }

    /**
     * Announce wave complete
     * @param {number} wave - Wave number
     */
    waveComplete(wave) {
        this.polite(`Wave ${wave} complete!`);
    }

    /**
     * Announce achievement unlocked
     * @param {string} name - Achievement name
     */
    achievementUnlocked(name) {
        this.assertive(`Achievement unlocked: ${name}!`);
    }

    /**
     * Announce high score
     * @param {number} score - The high score
     * @param {number} [rank] - Leaderboard rank
     */
    highScore(score, rank = null) {
        let message = `New high score: ${score}!`;
        if (rank) message += ` You ranked number ${rank}!`;
        this.assertive(message);
    }

    /**
     * Announce combo milestone
     * @param {number} combo - Combo count
     * @param {string} [message] - Custom combo message
     */
    comboMilestone(combo, message = '') {
        const announcement = message || `${combo} hit combo!`;
        this.polite(announcement);
    }

    /**
     * Announce pause/resume
     * @param {boolean} paused - Whether the game is now paused
     */
    pauseState(paused) {
        this.assertive(paused ? 'Game paused.' : 'Game resumed.');
    }

    /**
     * Announce menu navigation
     * @param {string} menuItem - Current menu item
     */
    menuFocus(menuItem) {
        this.polite(menuItem);
    }

    /**
     * Announce countdown
     * @param {number} seconds - Seconds remaining
     */
    countdown(seconds) {
        if (seconds <= 3) {
            this.assertive(`${seconds}`);
        }
    }

    /**
     * Clear all pending announcements
     */
    clear() {
        if (this.liveRegion) this.liveRegion.textContent = '';
        if (this.assertiveRegion) this.assertiveRegion.textContent = '';
    }

    /**
     * Cleanup DOM elements
     */
    destroy() {
        if (this.liveRegion && this.liveRegion.parentNode) {
            this.liveRegion.parentNode.removeChild(this.liveRegion);
        }
        if (this.assertiveRegion && this.assertiveRegion.parentNode) {
            this.assertiveRegion.parentNode.removeChild(this.assertiveRegion);
        }
    }
}

// Export singleton instance
export const screenReader = new ScreenReader();
export default ScreenReader;
