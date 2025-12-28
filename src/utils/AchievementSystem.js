/**
 * AchievementSystem - Tracks and awards player achievements
 * Provides badges, notifications, and progress tracking
 */

import { logger } from './Logger.js';
import { gameData } from './GameData.js';

// Achievement definitions
const ACHIEVEMENTS = {
    // Milestone achievements
    first_game: {
        id: 'first_game',
        name: 'First Commit',
        description: 'Complete your first game',
        icon: '🎮',
        category: 'milestone',
        hidden: false,
        points: 10
    },
    score_1000: {
        id: 'score_1000',
        name: 'Rising Star',
        description: 'Score 1,000 points in a single game',
        icon: '⭐',
        category: 'milestone',
        hidden: false,
        points: 25
    },
    score_5000: {
        id: 'score_5000',
        name: 'Code Master',
        description: 'Score 5,000 points in a single game',
        icon: '🏆',
        category: 'milestone',
        hidden: false,
        points: 50
    },
    score_10000: {
        id: 'score_10000',
        name: 'Git Legend',
        description: 'Score 10,000 points in a single game',
        icon: '👑',
        category: 'milestone',
        hidden: false,
        points: 100
    },

    // Survival achievements
    survive_1min: {
        id: 'survive_1min',
        name: 'Survivor',
        description: 'Survive for 1 minute',
        icon: '⏱️',
        category: 'survival',
        hidden: false,
        points: 15
    },
    survive_5min: {
        id: 'survive_5min',
        name: 'Endurance',
        description: 'Survive for 5 minutes',
        icon: '💪',
        category: 'survival',
        hidden: false,
        points: 50
    },
    survive_10min: {
        id: 'survive_10min',
        name: 'Immortal',
        description: 'Survive for 10 minutes',
        icon: '🔥',
        category: 'survival',
        hidden: false,
        points: 100
    },
    no_damage: {
        id: 'no_damage',
        name: 'Untouchable',
        description: 'Complete a game without taking damage',
        icon: '🛡️',
        category: 'survival',
        hidden: false,
        points: 75
    },

    // Combo achievements
    combo_5x: {
        id: 'combo_5x',
        name: 'Combo Starter',
        description: 'Reach a 5x combo',
        icon: '🔗',
        category: 'combo',
        hidden: false,
        points: 20
    },
    combo_10x: {
        id: 'combo_10x',
        name: 'Combo Master',
        description: 'Reach a 10x combo',
        icon: '⚡',
        category: 'combo',
        hidden: false,
        points: 40
    },
    combo_25x: {
        id: 'combo_25x',
        name: 'Combo God',
        description: 'Reach a 25x combo',
        icon: '💥',
        category: 'combo',
        hidden: true,
        points: 100
    },

    // Collection achievements
    powerups_10: {
        id: 'powerups_10',
        name: 'Collector',
        description: 'Collect 10 power-ups in a single game',
        icon: '💎',
        category: 'collection',
        hidden: false,
        points: 20
    },
    powerups_50: {
        id: 'powerups_50',
        name: 'Hoarder',
        description: 'Collect 50 power-ups in a single game',
        icon: '🎁',
        category: 'collection',
        hidden: false,
        points: 50
    },

    // Elimination achievements
    kills_100: {
        id: 'kills_100',
        name: 'Bug Hunter',
        description: 'Eliminate 100 enemies total',
        icon: '🐛',
        category: 'elimination',
        hidden: false,
        points: 25,
        cumulative: true
    },
    kills_1000: {
        id: 'kills_1000',
        name: 'Exterminator',
        description: 'Eliminate 1,000 enemies total',
        icon: '☠️',
        category: 'elimination',
        hidden: false,
        points: 75,
        cumulative: true
    },

    // Special achievements
    games_10: {
        id: 'games_10',
        name: 'Dedicated',
        description: 'Play 10 games',
        icon: '🎯',
        category: 'special',
        hidden: false,
        points: 30,
        cumulative: true
    },
    games_100: {
        id: 'games_100',
        name: 'Addicted',
        description: 'Play 100 games',
        icon: '🏅',
        category: 'special',
        hidden: false,
        points: 100,
        cumulative: true
    },
    all_modes: {
        id: 'all_modes',
        name: 'Jack of All Trades',
        description: 'Play every game mode at least once',
        icon: '🌟',
        category: 'special',
        hidden: false,
        points: 50
    },

    // Hidden achievements
    secret_konami: {
        id: 'secret_konami',
        name: '???',
        description: 'Enter the Konami code',
        icon: '🎮',
        category: 'secret',
        hidden: true,
        points: 50,
        revealedName: 'Old School',
        revealedDescription: 'Enter the classic Konami code'
    },
    night_owl: {
        id: 'night_owl',
        name: '???',
        description: 'Play between midnight and 4 AM',
        icon: '🦉',
        category: 'secret',
        hidden: true,
        points: 25,
        revealedName: 'Night Owl',
        revealedDescription: 'Play between midnight and 4 AM'
    }
};

export default class AchievementSystem {
    constructor(scene = null) {
        this.scene = scene;
        this.notificationQueue = [];
        this.isShowingNotification = false;
        this.container = null;

        this.initializeAchievements();
    }

    /**
     * Initialize achievement data in gameData
     */
    initializeAchievements() {
        if (!gameData.data.achievements) {
            gameData.data.achievements = {
                unlocked: {},
                progress: {},
                totalPoints: 0,
                lastUnlocked: null
            };
            gameData.save();
        }
    }

    /**
     * Check if an achievement is unlocked
     */
    isUnlocked(achievementId) {
        return !!gameData.data.achievements.unlocked[achievementId];
    }

    /**
     * Unlock an achievement
     */
    unlock(achievementId) {
        if (this.isUnlocked(achievementId)) return false;

        const achievement = ACHIEVEMENTS[achievementId];
        if (!achievement) {
            logger.warn('AchievementSystem', `Unknown achievement: ${achievementId}`);
            return false;
        }

        // Record unlock
        gameData.data.achievements.unlocked[achievementId] = {
            unlockedAt: Date.now(),
            points: achievement.points
        };
        gameData.data.achievements.totalPoints += achievement.points;
        gameData.data.achievements.lastUnlocked = achievementId;
        gameData.save();

        // Queue notification
        this.queueNotification(achievement);

        logger.info('AchievementSystem', `Achievement unlocked: ${achievement.name}`);
        return true;
    }

    /**
     * Update progress for cumulative achievements
     */
    updateProgress(achievementId, value) {
        const achievement = ACHIEVEMENTS[achievementId];
        if (!achievement || !achievement.cumulative) return;
        if (this.isUnlocked(achievementId)) return;

        if (!gameData.data.achievements.progress[achievementId]) {
            gameData.data.achievements.progress[achievementId] = 0;
        }

        gameData.data.achievements.progress[achievementId] += value;
        gameData.save();
    }

    /**
     * Check and unlock achievements based on game stats
     */
    checkAchievements(gameStats) {
        const { score, time, combo, powerups, kills, damageTaken, gameMode } = gameStats;

        // Score achievements
        if (score >= 1000) this.unlock('score_1000');
        if (score >= 5000) this.unlock('score_5000');
        if (score >= 10000) this.unlock('score_10000');

        // Survival achievements (time in seconds)
        if (time >= 60) this.unlock('survive_1min');
        if (time >= 300) this.unlock('survive_5min');
        if (time >= 600) this.unlock('survive_10min');

        // No damage achievement
        if (damageTaken === 0 && time >= 60) this.unlock('no_damage');

        // Combo achievements
        if (combo >= 5) this.unlock('combo_5x');
        if (combo >= 10) this.unlock('combo_10x');
        if (combo >= 25) this.unlock('combo_25x');

        // Power-up achievements
        if (powerups >= 10) this.unlock('powerups_10');
        if (powerups >= 50) this.unlock('powerups_50');

        // First game achievement
        this.unlock('first_game');

        // Cumulative achievements
        this.updateProgress('kills_100', kills);
        this.updateProgress('kills_1000', kills);
        this.updateProgress('games_10', 1);
        this.updateProgress('games_100', 1);

        // Check cumulative thresholds
        const progress = gameData.data.achievements.progress;
        if (progress.kills_100 >= 100) this.unlock('kills_100');
        if (progress.kills_1000 >= 1000) this.unlock('kills_1000');
        if (progress.games_10 >= 10) this.unlock('games_10');
        if (progress.games_100 >= 100) this.unlock('games_100');

        // Track game modes played
        if (!gameData.data.achievements.modesPlayed) {
            gameData.data.achievements.modesPlayed = {};
        }
        gameData.data.achievements.modesPlayed[gameMode] = true;
        gameData.save();

        // Check all modes achievement
        const allModes = ['GitSurvivor', 'CodeDefense', 'BranchRacer'];
        const playedAll = allModes.every(mode => gameData.data.achievements.modesPlayed[mode]);
        if (playedAll) this.unlock('all_modes');

        // Time-based achievements
        const hour = new Date().getHours();
        if (hour >= 0 && hour < 4) this.unlock('night_owl');
    }

    /**
     * Manually trigger a special achievement
     */
    triggerSpecial(triggerId) {
        switch (triggerId) {
            case 'konami':
                this.unlock('secret_konami');
                break;
        }
    }

    /**
     * Queue a notification to be shown
     */
    queueNotification(achievement) {
        this.notificationQueue.push(achievement);
        if (!this.isShowingNotification) {
            this.showNextNotification();
        }
    }

    /**
     * Show the next queued notification
     */
    showNextNotification() {
        if (this.notificationQueue.length === 0) {
            this.isShowingNotification = false;
            return;
        }

        this.isShowingNotification = true;
        const achievement = this.notificationQueue.shift();

        if (this.scene) {
            this.showInGameNotification(achievement);
        } else {
            // Fallback for non-scene context
            logger.info('AchievementSystem', `Achievement: ${achievement.icon} ${achievement.name}`);
            setTimeout(() => this.showNextNotification(), 500);
        }
    }

    /**
     * Show in-game achievement notification
     */
    showInGameNotification(achievement) {
        const { width } = this.scene.cameras.main;

        // Create notification container
        const container = this.scene.add.container(width / 2, -100);
        container.setDepth(100001);
        container.setScrollFactor(0);

        // Background
        const bg = this.scene.add.rectangle(0, 0, 350, 80, 0x1a1a2e, 0.95);
        bg.setStrokeStyle(2, 0xffd700);
        container.add(bg);

        // Icon
        const icon = this.scene.add.text(-140, 0, achievement.icon, {
            fontSize: '40px'
        });
        icon.setOrigin(0.5);
        container.add(icon);

        // Title
        const title = this.scene.add.text(-80, -15, 'ACHIEVEMENT UNLOCKED', {
            fontSize: '10px',
            fontFamily: 'monospace',
            color: '#ffd700'
        });
        container.add(title);

        // Name
        const displayName = achievement.hidden ? achievement.revealedName : achievement.name;
        const name = this.scene.add.text(-80, 5, displayName, {
            fontSize: '18px',
            fontFamily: 'monospace',
            color: '#ffffff',
            fontStyle: 'bold'
        });
        container.add(name);

        // Points
        const points = this.scene.add.text(140, 0, `+${achievement.points}`, {
            fontSize: '20px',
            fontFamily: 'monospace',
            color: '#ffd700',
            fontStyle: 'bold'
        });
        points.setOrigin(0.5);
        container.add(points);

        // Animate in
        this.scene.tweens.add({
            targets: container,
            y: 60,
            duration: 500,
            ease: 'Back.easeOut'
        });

        // Hold
        this.scene.time.delayedCall(3000, () => {
            // Animate out
            this.scene.tweens.add({
                targets: container,
                y: -100,
                duration: 400,
                ease: 'Back.easeIn',
                onComplete: () => {
                    container.destroy();
                    this.showNextNotification();
                }
            });
        });
    }

    /**
     * Get all achievements with unlock status
     */
    getAllAchievements() {
        return Object.values(ACHIEVEMENTS).map(achievement => ({
            ...achievement,
            unlocked: this.isUnlocked(achievement.id),
            unlockedAt: gameData.data.achievements.unlocked[achievement.id]?.unlockedAt,
            progress: gameData.data.achievements.progress[achievement.id] || 0
        }));
    }

    /**
     * Get achievements by category
     */
    getByCategory(category) {
        return this.getAllAchievements().filter(a => a.category === category);
    }

    /**
     * Get total achievement points
     */
    getTotalPoints() {
        return gameData.data.achievements.totalPoints || 0;
    }

    /**
     * Get unlock percentage
     */
    getUnlockPercentage() {
        const total = Object.keys(ACHIEVEMENTS).length;
        const unlocked = Object.keys(gameData.data.achievements.unlocked).length;
        return Math.round((unlocked / total) * 100);
    }

    /**
     * Get recently unlocked achievements
     */
    getRecentUnlocks(limit = 5) {
        return this.getAllAchievements()
            .filter(a => a.unlocked)
            .sort((a, b) => b.unlockedAt - a.unlockedAt)
            .slice(0, limit);
    }

    /**
     * Reset all achievements (for testing)
     */
    static resetAll() {
        gameData.data.achievements = {
            unlocked: {},
            progress: {},
            totalPoints: 0,
            lastUnlocked: null,
            modesPlayed: {}
        };
        gameData.save();
        logger.info('AchievementSystem', 'All achievements reset');
    }

    /**
     * Export achievement data
     */
    exportData() {
        return {
            achievements: gameData.data.achievements,
            definitions: ACHIEVEMENTS
        };
    }
}

// Singleton for non-scene contexts
export const achievementSystem = new AchievementSystem();
