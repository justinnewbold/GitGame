/**
 * AchievementManager - Handles achievements and unlocks
 * Separated from GameData for single responsibility
 */

import EventBus from '../../core/EventBus.js';
import { EVENTS } from '../../constants/GameConstants.js';

export default class AchievementManager {
    constructor() {
        this.unlockedAchievements = [];
        this.achievements = this.getAchievementDefinitions();
    }

    /**
     * Get all achievement definitions
     * @returns {Array} Achievement definitions
     */
    getAchievementDefinitions() {
        return [
            { id: 'first_blood', name: 'First Blood', desc: 'Kill your first bug', icon: '🐛', condition: 'stats.gitSurvivor.enemiesKilled >= 1' },
            { id: 'survivor', name: 'Survivor', desc: 'Kill 100 enemies in Git Survivor', icon: '💪', condition: 'stats.gitSurvivor.enemiesKilled >= 100' },
            { id: 'tower_master', name: 'Tower Master', desc: 'Place 50 towers', icon: '🏰', condition: 'stats.codeDefense.towersPlaced >= 50' },
            { id: 'pr_pro', name: 'PR Pro', desc: 'Review 100 PRs', icon: '👀', condition: 'stats.prRush.prsReviewed >= 100' },
            { id: 'perfect_review', name: 'Perfect Review', desc: 'Get 100% accuracy in PR Rush', icon: '💯', condition: 'stats.prRush.bestAccuracy >= 100' },
            { id: 'team_player', name: 'Team Player', desc: 'Hire 10 developers', icon: '👥', condition: 'stats.devCommander.devsHired >= 10' },
            { id: 'sprint_master', name: 'Sprint Master', desc: 'Complete 10 sprints', icon: '🏃', condition: 'stats.devCommander.maxSprints >= 10' },
            { id: 'workaholic', name: 'Workaholic', desc: 'Play 50 games total', icon: '😅', condition: 'stats.gamesPlayed >= 50' },
            { id: 'coffee_addict', name: 'Coffee Addict', desc: 'Buy coffee 20 times', icon: '☕', condition: 'stats.devCommander.coffeesBought >= 20' },
            { id: 'boss_slayer', name: 'Boss Slayer', desc: 'Defeat a boss enemy', icon: '⚔️', condition: 'stats.gitSurvivor.bossesDefeated >= 1' },
            { id: 'no_bugs', name: 'Bug Free', desc: 'Win Code Defense without losing HP', icon: '✨', condition: 'manual' },
            { id: 'speedrun', name: 'Speedrunner', desc: 'Complete a game in under 2 minutes', icon: '⚡', condition: 'manual' },
            { id: 'hoarder', name: 'Hoarder', desc: 'Collect 50 power-ups', icon: '🎁', condition: 'stats.powerUpsCollected >= 50' },
            { id: 'merge_king', name: 'Merge King', desc: 'Defeat 10 merge conflicts', icon: '👑', condition: 'stats.mergeConflictsDefeated >= 10' },
            { id: 'senior_dev', name: 'Senior Dev', desc: 'Hire a senior developer', icon: '🧔', condition: 'manual' },
            { id: 'perfectionist', name: 'Perfectionist', desc: 'Get 3 stars on 10 Bug Bounty levels', icon: '⭐', condition: 'stats.bugBounty.perfectSolves >= 10' },
            { id: 'archaeologist', name: 'Archaeologist', desc: 'Find 25 artifacts in Legacy Excavator', icon: '🏺', condition: 'stats.legacyExcavator.artifactsFound >= 25' },
            { id: 'marathon', name: 'Marathon Runner', desc: 'Run 10,000 units in Sprint Survivor', icon: '🏃‍♂️', condition: 'stats.sprintSurvivor.maxDistance >= 10000' },
            { id: 'boss_rush_master', name: 'Boss Rush Master', desc: 'Defeat all bosses in Boss Rush', icon: '👹', condition: 'stats.bossRush.bossesDefeated >= 10' },
            { id: 'dedicated', name: 'Dedicated', desc: 'Play for 10 hours total', icon: '🕐', condition: 'stats.totalTimePlayed >= 36000000' }
        ];
    }

    /**
     * Load achievements from data
     * @param {Array} data - Unlocked achievement IDs
     */
    load(data) {
        if (Array.isArray(data)) {
            this.unlockedAchievements = [...data];
        } else {
            this.unlockedAchievements = [];
        }
    }

    /**
     * Check if achievement is unlocked
     * @param {string} id - Achievement ID
     * @returns {boolean} True if unlocked
     */
    has(id) {
        return this.unlockedAchievements.includes(id);
    }

    /**
     * Unlock an achievement
     * @param {string} id - Achievement ID
     * @returns {Object|null} Achievement object if newly unlocked, null if already unlocked
     */
    unlock(id) {
        if (this.has(id)) {
            return null;
        }

        this.unlockedAchievements.push(id);
        const achievement = this.achievements.find(a => a.id === id);

        if (achievement) {
            EventBus.emit(EVENTS.ACHIEVEMENT_UNLOCKED, achievement);
            console.log('Achievement unlocked:', achievement.name);
            return achievement;
        }

        console.warn('AchievementManager: Achievement not found:', id);
        return null;
    }

    /**
     * Get all unlocked achievements
     * @returns {Array} Array of achievement objects
     */
    getUnlocked() {
        return this.unlockedAchievements.map(id =>
            this.achievements.find(a => a.id === id)
        ).filter(a => a !== undefined);
    }

    /**
     * Get all locked achievements
     * @returns {Array} Array of locked achievements
     */
    getLocked() {
        return this.achievements.filter(a => !this.has(a.id));
    }

    /**
     * Get achievement by ID
     * @param {string} id - Achievement ID
     * @returns {Object|null} Achievement object or null
     */
    get(id) {
        return this.achievements.find(a => a.id === id) || null;
    }

    /**
     * Get unlock progress (percentage)
     * @returns {number} Percentage of achievements unlocked (0-100)
     */
    getProgress() {
        if (this.achievements.length === 0) return 0;
        return Math.round((this.unlockedAchievements.length / this.achievements.length) * 100);
    }

    /**
     * Check achievements against stats (auto-unlock)
     * @param {Object} stats - Player stats object
     * @returns {Array} Newly unlocked achievements
     */
    checkAchievements(stats) {
        const newlyUnlocked = [];

        this.achievements.forEach(achievement => {
            // Skip if already unlocked or manual unlock
            if (this.has(achievement.id) || achievement.condition === 'manual') {
                return;
            }

            // Evaluate condition (simple eval - could be improved with safer parser)
            try {
                const condition = achievement.condition.replace('stats.', '');
                if (this.evaluateCondition(condition, stats)) {
                    const unlocked = this.unlock(achievement.id);
                    if (unlocked) {
                        newlyUnlocked.push(unlocked);
                    }
                }
            } catch (error) {
                console.error(`AchievementManager: Error checking achievement '${achievement.id}':`, error);
            }
        });

        return newlyUnlocked;
    }

    /**
     * Evaluate achievement condition
     * @param {string} condition - Condition string
     * @param {Object} stats - Stats object
     * @returns {boolean} True if condition met
     */
    evaluateCondition(condition, stats) {
        try {
            // Parse condition (e.g., "gitSurvivor.enemiesKilled >= 1")
            const match = condition.match(/^(.+?)\s*(>=|<=|==|>|<)\s*(.+)$/);
            if (!match) return false;

            const [, path, operator, valueStr] = match;
            const value = parseFloat(valueStr);

            // Navigate stats object
            const keys = path.split('.');
            let current = stats;
            for (const key of keys) {
                current = current[key];
                if (current === undefined) return false;
            }

            // Compare
            switch (operator) {
                case '>=': return current >= value;
                case '<=': return current <= value;
                case '>': return current > value;
                case '<': return current < value;
                case '==': return current == value;
                default: return false;
            }
        } catch (error) {
            console.error('AchievementManager: Condition evaluation error:', error);
            return false;
        }
    }

    /**
     * Reset all achievements
     */
    resetAll() {
        this.unlockedAchievements = [];
        console.log('AchievementManager: All achievements reset');
    }

    /**
     * Export achievements for saving
     * @returns {Array} Unlocked achievement IDs
     */
    export() {
        return [...this.unlockedAchievements];
    }
}
