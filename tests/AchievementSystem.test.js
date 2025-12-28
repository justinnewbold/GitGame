/**
 * Tests for Achievement System
 * Run with: npm test
 */

import { describe, it, beforeEach, mock } from 'node:test';
import assert from 'node:assert';

// Mock localStorage
const localStorageData = {};
global.localStorage = {
    getItem: (key) => localStorageData[key] || null,
    setItem: (key, value) => { localStorageData[key] = value; },
    removeItem: (key) => { delete localStorageData[key]; },
    clear: () => { Object.keys(localStorageData).forEach(k => delete localStorageData[k]); }
};

// Mock gameData
await mock.module('../src/utils/GameData.js', {
    namedExports: {
        gameData: {
            data: {
                achievements: {
                    unlocked: {},
                    progress: {},
                    totalPoints: 0,
                    lastUnlocked: null,
                    modesPlayed: {}
                }
            },
            save: () => {}
        }
    }
});

await mock.module('../src/utils/Logger.js', {
    namedExports: {
        logger: {
            info: () => {},
            warn: () => {},
            error: () => {},
            debug: () => {}
        }
    }
});

const { default: AchievementSystem } = await import('../src/utils/AchievementSystem.js');

describe('AchievementSystem', () => {
    let achievementSystem;

    beforeEach(() => {
        // Reset achievement data
        const { gameData } = await import('../src/utils/GameData.js');
        gameData.data.achievements = {
            unlocked: {},
            progress: {},
            totalPoints: 0,
            lastUnlocked: null,
            modesPlayed: {}
        };
        achievementSystem = new AchievementSystem();
    });

    describe('Unlock Achievements', () => {
        it('should unlock an achievement', () => {
            const result = achievementSystem.unlock('first_game');
            assert.strictEqual(result, true);
            assert.strictEqual(achievementSystem.isUnlocked('first_game'), true);
        });

        it('should not unlock same achievement twice', () => {
            achievementSystem.unlock('first_game');
            const result = achievementSystem.unlock('first_game');
            assert.strictEqual(result, false);
        });

        it('should return false for unknown achievement', () => {
            const result = achievementSystem.unlock('unknown_achievement');
            assert.strictEqual(result, false);
        });

        it('should track total points', () => {
            achievementSystem.unlock('first_game'); // 10 points
            const points = achievementSystem.getTotalPoints();
            assert.strictEqual(points, 10);
        });
    });

    describe('Check Achievements Based on Game Stats', () => {
        it('should unlock score achievements', () => {
            achievementSystem.checkAchievements({
                score: 1500,
                time: 60,
                combo: 3,
                powerups: 5,
                kills: 10,
                damageTaken: 10,
                gameMode: 'GitSurvivor'
            });

            assert.strictEqual(achievementSystem.isUnlocked('score_1000'), true);
            assert.strictEqual(achievementSystem.isUnlocked('score_5000'), false);
        });

        it('should unlock survival achievements', () => {
            achievementSystem.checkAchievements({
                score: 500,
                time: 120, // 2 minutes
                combo: 2,
                powerups: 3,
                kills: 5,
                damageTaken: 5,
                gameMode: 'GitSurvivor'
            });

            assert.strictEqual(achievementSystem.isUnlocked('survive_1min'), true);
        });

        it('should unlock combo achievements', () => {
            achievementSystem.checkAchievements({
                score: 500,
                time: 60,
                combo: 7,
                powerups: 3,
                kills: 10,
                damageTaken: 5,
                gameMode: 'GitSurvivor'
            });

            assert.strictEqual(achievementSystem.isUnlocked('combo_5x'), true);
        });

        it('should unlock no damage achievement', () => {
            achievementSystem.checkAchievements({
                score: 1000,
                time: 120,
                combo: 5,
                powerups: 5,
                kills: 20,
                damageTaken: 0,
                gameMode: 'GitSurvivor'
            });

            assert.strictEqual(achievementSystem.isUnlocked('no_damage'), true);
        });
    });

    describe('Progress Tracking', () => {
        it('should track cumulative progress', () => {
            achievementSystem.updateProgress('kills_100', 25);
            achievementSystem.updateProgress('kills_100', 25);

            const achievements = achievementSystem.getAllAchievements();
            const killsAchievement = achievements.find(a => a.id === 'kills_100');
            assert.strictEqual(killsAchievement.progress, 50);
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

        it('should calculate unlock percentage', () => {
            const percentage = achievementSystem.getUnlockPercentage();
            assert.strictEqual(percentage, 0);

            achievementSystem.unlock('first_game');
            const newPercentage = achievementSystem.getUnlockPercentage();
            assert.ok(newPercentage > 0);
        });
    });
});
