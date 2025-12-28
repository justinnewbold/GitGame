/**
 * Tests for Achievement System
 * Run with: npm test
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';

// Mock localStorage
const localStorageData = {};
global.localStorage = {
    getItem: (key) => localStorageData[key] || null,
    setItem: (key, value) => { localStorageData[key] = value; },
    removeItem: (key) => { delete localStorageData[key]; },
    clear: () => { Object.keys(localStorageData).forEach(k => delete localStorageData[k]); }
};

// Import the module (will use mocked localStorage)
const { default: AchievementSystem } = await import('../src/utils/AchievementSystem.js');

describe('AchievementSystem', () => {
    let achievementSystem;

    beforeEach(() => {
        // Clear localStorage before each test
        localStorage.clear();
        achievementSystem = new AchievementSystem();
    });

    describe('Initialization', () => {
        it('should initialize with empty achievements', () => {
            const all = achievementSystem.getAllAchievements();
            assert.ok(Array.isArray(all));
            assert.ok(all.length > 0, 'Should have predefined achievements');
        });

        it('should have achievement definitions', () => {
            const all = achievementSystem.getAllAchievements();
            const first = all[0];
            assert.ok(first.id, 'Achievement should have id');
            assert.ok(first.name, 'Achievement should have name');
            assert.ok(first.description, 'Achievement should have description');
        });
    });

    describe('Unlock Achievements', () => {
        it('should unlock an achievement', () => {
            const achievements = achievementSystem.getAllAchievements();
            if (achievements.length > 0) {
                const result = achievementSystem.unlock(achievements[0].id);
                assert.strictEqual(result, true);
                assert.strictEqual(achievementSystem.isUnlocked(achievements[0].id), true);
            }
        });

        it('should not unlock same achievement twice', () => {
            const achievements = achievementSystem.getAllAchievements();
            if (achievements.length > 0) {
                achievementSystem.unlock(achievements[0].id);
                const result = achievementSystem.unlock(achievements[0].id);
                assert.strictEqual(result, false);
            }
        });

        it('should return false for unknown achievement', () => {
            const result = achievementSystem.unlock('unknown_achievement_xyz_123');
            assert.strictEqual(result, false);
        });
    });

    describe('Progress Tracking', () => {
        it('should track progress for cumulative achievements', () => {
            achievementSystem.updateProgress('kills_100', 50);
            const progress = achievementSystem.getProgress('kills_100');
            assert.strictEqual(progress, 50);
        });

        it('should accumulate progress for cumulative achievements', () => {
            achievementSystem.updateProgress('games_10', 3);
            achievementSystem.updateProgress('games_10', 2);
            const progress = achievementSystem.getProgress('games_10');
            assert.strictEqual(progress, 5);
        });
    });

    describe('Statistics', () => {
        it('should calculate unlock percentage', () => {
            const percent = achievementSystem.getUnlockPercentage();
            assert.ok(typeof percent === 'number');
            assert.ok(percent >= 0 && percent <= 100);
        });

        it('should track total points', () => {
            const points = achievementSystem.getTotalPoints();
            assert.ok(typeof points === 'number');
            assert.ok(points >= 0);
        });
    });

    describe('Achievement Queries', () => {
        it('should get all achievements', () => {
            const achievements = achievementSystem.getAllAchievements();
            assert.ok(achievements.length > 0);
        });

        it('should get achievements by category', () => {
            const milestones = achievementSystem.getByCategory('milestone');
            assert.ok(milestones.length > 0);
            assert.ok(milestones.every(a => a.category === 'milestone'));
        });
    });
});
