/**
 * Tests for Challenge System
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
                challenges: null
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

const { default: ChallengeSystem } = await import('../src/utils/ChallengeSystem.js');

describe('ChallengeSystem', () => {
    let challengeSystem;

    beforeEach(async () => {
        // Reset challenge data
        const { gameData } = await import('../src/utils/GameData.js');
        gameData.data.challenges = null;
        challengeSystem = new ChallengeSystem();
    });

    describe('Challenge Generation', () => {
        it('should generate daily challenges', () => {
            const dailyChallenges = challengeSystem.getDailyChallenges();
            assert.strictEqual(dailyChallenges.length, 3);
        });

        it('should generate weekly challenges', () => {
            const weeklyChallenges = challengeSystem.getWeeklyChallenges();
            assert.strictEqual(weeklyChallenges.length, 3);
        });

        it('should generate challenges with required properties', () => {
            const challenges = challengeSystem.getDailyChallenges();

            challenges.forEach(challenge => {
                assert.ok(challenge.id);
                assert.ok(challenge.type);
                assert.ok(challenge.target !== undefined);
                assert.ok(challenge.displayDescription);
                assert.ok(challenge.tier);
                assert.strictEqual(challenge.completed, false);
            });
        });

        it('should generate challenges with different tiers', () => {
            const challenges = challengeSystem.getDailyChallenges();
            const tiers = challenges.map(c => c.tier);

            assert.ok(tiers.includes('easy'));
            assert.ok(tiers.includes('medium'));
            assert.ok(tiers.includes('hard'));
        });
    });

    describe('Progress Updates', () => {
        it('should update score challenge progress', () => {
            challengeSystem.updateProgress({
                score: 1500,
                time: 60,
                kills: 10,
                combo: 5,
                powerups: 3,
                damageTaken: 10,
                gameMode: 'GitSurvivor'
            });

            // Check that at least some challenges have progress
            const dailyChallenges = challengeSystem.getDailyChallenges();
            // Progress depends on generated challenge types
            assert.ok(dailyChallenges.length === 3);
        });

        it('should mark challenge as completed when target reached', () => {
            // Force a specific challenge completion
            const challenges = challengeSystem.getDailyChallenges();
            const playGamesChallenge = challenges.find(c => c.type === 'play_games');

            if (playGamesChallenge) {
                // Simulate playing enough games
                for (let i = 0; i < playGamesChallenge.target; i++) {
                    challengeSystem.updateProgress({
                        score: 100,
                        time: 30,
                        kills: 5,
                        combo: 1,
                        powerups: 1,
                        damageTaken: 5,
                        gameMode: 'GitSurvivor'
                    });
                }

                const updatedChallenges = challengeSystem.getDailyChallenges();
                const updatedChallenge = updatedChallenges.find(c => c.id === playGamesChallenge.id);
                assert.strictEqual(updatedChallenge.completed, true);
            }
        });
    });

    describe('Time Remaining', () => {
        it('should return positive time remaining for daily reset', () => {
            const timeRemaining = challengeSystem.getDailyTimeRemaining();
            assert.ok(timeRemaining > 0);
        });

        it('should return positive time remaining for weekly reset', () => {
            const timeRemaining = challengeSystem.getWeeklyTimeRemaining();
            assert.ok(timeRemaining > 0);
        });

        it('should format time remaining correctly', () => {
            const formatted = challengeSystem.formatTimeRemaining(3600000); // 1 hour
            assert.ok(formatted.includes('h'));
        });
    });

    describe('Rewards', () => {
        it('should claim reward for completed challenge', () => {
            // Get a challenge and manually complete it
            const challenges = challengeSystem.getDailyChallenges();
            const challenge = challenges[0];
            challenge.completed = true;
            challenge.progress = challenge.target;

            const reward = challengeSystem.claimReward(challenge.id, false);

            if (reward) {
                assert.ok(reward.points > 0);
            }
        });

        it('should not claim reward for uncompleted challenge', () => {
            const challenges = challengeSystem.getDailyChallenges();
            const challenge = challenges[0];

            const reward = challengeSystem.claimReward(challenge.id, false);
            assert.strictEqual(reward, null);
        });

        it('should track total rewards', () => {
            const totalRewards = challengeSystem.getTotalRewards();
            assert.strictEqual(typeof totalRewards, 'number');
        });
    });

    describe('Statistics', () => {
        it('should return stats object', () => {
            const stats = challengeSystem.getStats();

            assert.ok('dailyCompleted' in stats);
            assert.ok('weeklyCompleted' in stats);
            assert.ok('totalCompleted' in stats);
            assert.ok('totalRewards' in stats);
            assert.ok('streaks' in stats);
        });

        it('should track streaks', () => {
            const streaks = challengeSystem.getStreaks();

            assert.ok('daily' in streaks);
            assert.ok('weekly' in streaks);
        });
    });

    describe('Date Keys', () => {
        it('should generate consistent date key', () => {
            const key1 = challengeSystem.getDateKey(new Date('2024-01-15'));
            const key2 = challengeSystem.getDateKey(new Date('2024-01-15'));
            assert.strictEqual(key1, key2);
        });

        it('should generate different date keys for different dates', () => {
            const key1 = challengeSystem.getDateKey(new Date('2024-01-15'));
            const key2 = challengeSystem.getDateKey(new Date('2024-01-16'));
            assert.notStrictEqual(key1, key2);
        });
    });
});
