// Simplified Progression System - One unified Developer Level
// Replaces: Battle Pass, Ranked, Mastery, and Prestige systems

import { gameData } from './GameData.js';

export default class SimplifiedProgression {
    constructor() {
        this.initializeProgression();
    }

    // Initialize progression data
    initializeProgression() {
        if (!gameData.data.developerLevel) {
            gameData.data.developerLevel = {
                level: 1,
                xp: 0,
                totalXP: 0,
                rewards: []
            };
            gameData.save();
        }
    }

    // Calculate XP needed for next level (scales moderately)
    getXPForLevel(level) {
        // Simple scaling: 100 * level * 1.2
        return Math.floor(100 * level * 1.2);
    }

    // Get current level data
    getCurrentLevel() {
        return gameData.data.developerLevel.level;
    }

    // Get current XP
    getCurrentXP() {
        return gameData.data.developerLevel.xp;
    }

    // Get total career XP
    getTotalXP() {
        return gameData.data.developerLevel.totalXP;
    }

    // Get XP needed for next level
    getXPNeeded() {
        return this.getXPForLevel(this.getCurrentLevel());
    }

    // Get progress percentage to next level
    getProgress() {
        const current = this.getCurrentXP();
        const needed = this.getXPNeeded();
        return Math.min(100, (current / needed) * 100);
    }

    // Add XP and check for level up
    addXP(amount) {
        const data = gameData.data.developerLevel;

        data.xp += amount;
        data.totalXP += amount;

        // Check for level ups
        const levelsGained = [];
        while (data.xp >= this.getXPForLevel(data.level) && data.level < 50) {
            data.xp -= this.getXPForLevel(data.level);
            data.level++;
            levelsGained.push(data.level);

            // Check for milestone rewards
            if (this.isMilestone(data.level)) {
                const reward = this.getMilestoneReward(data.level);
                data.rewards.push(reward);
            }
        }

        gameData.save();

        return {
            levelsGained,
            newLevel: data.level,
            newXP: data.xp,
            progress: this.getProgress()
        };
    }

    // Check if level is a milestone (every 5 levels)
    isMilestone(level) {
        return level % 5 === 0;
    }

    // Get milestone reward
    getMilestoneReward(level) {
        const rewards = {
            5: { type: 'coins', amount: 500, name: '500 Coins' },
            10: { type: 'skin', id: 'midnight', name: 'Midnight Coder Skin' },
            15: { type: 'coins', amount: 1000, name: '1000 Coins' },
            20: { type: 'color', id: 'sunset', name: 'Sunset Orange Color' },
            25: { type: 'coins', amount: 2000, name: '2000 Coins' },
            30: { type: 'skin', id: 'pro', name: 'Pro Developer Skin' },
            35: { type: 'coins', amount: 3000, name: '3000 Coins' },
            40: { type: 'color', id: 'elite', name: 'Elite Purple Color' },
            45: { type: 'coins', amount: 5000, name: '5000 Coins' },
            50: { type: 'skin', id: 'legendary', name: 'Legendary Dev Skin' }
        };

        return rewards[level] || { type: 'coins', amount: 500, name: '500 Coins' };
    }

    // Get developer title based on level
    getDeveloperTitle() {
        const level = this.getCurrentLevel();

        if (level < 5) return '👶 Junior Dev';
        if (level < 10) return '💼 Developer';
        if (level < 15) return '🎯 Mid-Level Dev';
        if (level < 20) return '⭐ Senior Dev';
        if (level < 25) return '🔥 Lead Developer';
        if (level < 30) return '🏆 Principal Engineer';
        if (level < 35) return '👑 Staff Engineer';
        if (level < 40) return '🚀 Distinguished Engineer';
        if (level < 45) return '💎 Fellow Engineer';
        if (level < 50) return '🌟 Architect';
        return '🏅 Legendary Developer';
    }

    // Get all unlocked rewards
    getUnlockedRewards() {
        return gameData.data.developerLevel.rewards || [];
    }

    // Calculate XP reward for score
    calculateXPFromScore(score, gameMode = 'generic') {
        // Base XP is 10% of score, minimum 10 XP
        const baseXP = Math.max(10, Math.floor(score * 0.1));

        // Add bonus for daily challenge completion (if applicable)
        // This can be extended later

        return baseXP;
    }

    // Get formatted level info for display
    getLevelInfo() {
        return {
            level: this.getCurrentLevel(),
            title: this.getDeveloperTitle(),
            xp: this.getCurrentXP(),
            xpNeeded: this.getXPNeeded(),
            progress: this.getProgress(),
            totalXP: this.getTotalXP()
        };
    }

    // Reset progression (for testing or new game)
    reset() {
        gameData.data.developerLevel = {
            level: 1,
            xp: 0,
            totalXP: 0,
            rewards: []
        };
        gameData.save();
    }
}

// Singleton instance
export const simplifiedProgression = new SimplifiedProgression();
