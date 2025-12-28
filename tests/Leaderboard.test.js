/**
 * Tests for Leaderboard System
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
                stats: {
                    gamesPlayed: 0,
                    totalScore: 0,
                    highScores: {}
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

const { default: Leaderboard } = await import('../src/utils/Leaderboard.js');

describe('Leaderboard', () => {
    let leaderboard;

    beforeEach(() => {
        localStorage.clear();
        leaderboard = new Leaderboard();
    });

    describe('Score Submission', () => {
        it('should add score to leaderboard', () => {
            const entry = leaderboard.submitScore('GitSurvivor', 1000, 'TestPlayer');
            assert.ok(entry);
            assert.strictEqual(entry.score, 1000);
            assert.strictEqual(entry.playerName, 'TestPlayer');
        });

        it('should track game mode correctly', () => {
            leaderboard.submitScore('GitSurvivor', 1000, 'Player1');
            leaderboard.submitScore('CodeDefense', 500, 'Player2');

            const gsScores = leaderboard.getScores('GitSurvivor');
            const cdScores = leaderboard.getScores('CodeDefense');

            assert.strictEqual(gsScores.length, 1);
            assert.strictEqual(cdScores.length, 1);
        });

        it('should include timestamp', () => {
            const before = Date.now();
            const entry = leaderboard.submitScore('GitSurvivor', 1000, 'TestPlayer');
            const after = Date.now();

            assert.ok(entry.timestamp >= before);
            assert.ok(entry.timestamp <= after);
        });
    });

    describe('Score Retrieval', () => {
        beforeEach(() => {
            leaderboard.submitScore('GitSurvivor', 500, 'Player1');
            leaderboard.submitScore('GitSurvivor', 1000, 'Player2');
            leaderboard.submitScore('GitSurvivor', 750, 'Player3');
        });

        it('should return scores sorted by highest first', () => {
            const scores = leaderboard.getScores('GitSurvivor');
            assert.strictEqual(scores[0].score, 1000);
            assert.strictEqual(scores[1].score, 750);
            assert.strictEqual(scores[2].score, 500);
        });

        it('should limit number of returned scores', () => {
            for (let i = 0; i < 20; i++) {
                leaderboard.submitScore('GitSurvivor', i * 100, `Player${i}`);
            }

            const scores = leaderboard.getScores('GitSurvivor', 10);
            assert.ok(scores.length <= 10);
        });

        it('should return empty array for unknown game mode', () => {
            const scores = leaderboard.getScores('UnknownGame');
            assert.deepStrictEqual(scores, []);
        });
    });

    describe('High Score Detection', () => {
        it('should detect new high score', () => {
            leaderboard.submitScore('GitSurvivor', 500, 'Player1');
            const isHighScore = leaderboard.isHighScore('GitSurvivor', 1000);
            assert.strictEqual(isHighScore, true);
        });

        it('should not flag lower scores as high score', () => {
            leaderboard.submitScore('GitSurvivor', 1000, 'Player1');
            const isHighScore = leaderboard.isHighScore('GitSurvivor', 500);
            assert.strictEqual(isHighScore, false);
        });

        it('should consider first score as high score', () => {
            const isHighScore = leaderboard.isHighScore('GitSurvivor', 100);
            assert.strictEqual(isHighScore, true);
        });
    });

    describe('Personal Best', () => {
        it('should return personal best for game mode', () => {
            leaderboard.submitScore('GitSurvivor', 500, 'Player1');
            leaderboard.submitScore('GitSurvivor', 1000, 'Player1');

            const best = leaderboard.getPersonalBest('GitSurvivor');
            assert.strictEqual(best, 1000);
        });

        it('should return 0 when no scores exist', () => {
            const best = leaderboard.getPersonalBest('GitSurvivor');
            assert.strictEqual(best, 0);
        });
    });

    describe('Statistics', () => {
        it('should calculate total games played', () => {
            leaderboard.submitScore('GitSurvivor', 100, 'Player1');
            leaderboard.submitScore('GitSurvivor', 200, 'Player1');
            leaderboard.submitScore('CodeDefense', 150, 'Player1');

            const stats = leaderboard.getStats();
            assert.strictEqual(stats.totalGames, 3);
        });

        it('should calculate average score', () => {
            leaderboard.submitScore('GitSurvivor', 100, 'Player1');
            leaderboard.submitScore('GitSurvivor', 200, 'Player1');

            const stats = leaderboard.getStats();
            assert.strictEqual(stats.averageScore, 150);
        });
    });

    describe('Clear Leaderboard', () => {
        it('should clear all scores', () => {
            leaderboard.submitScore('GitSurvivor', 1000, 'Player1');
            leaderboard.submitScore('CodeDefense', 500, 'Player2');

            leaderboard.clearAll();

            assert.deepStrictEqual(leaderboard.getScores('GitSurvivor'), []);
            assert.deepStrictEqual(leaderboard.getScores('CodeDefense'), []);
        });

        it('should clear scores for specific game mode', () => {
            leaderboard.submitScore('GitSurvivor', 1000, 'Player1');
            leaderboard.submitScore('CodeDefense', 500, 'Player2');

            leaderboard.clearGameMode('GitSurvivor');

            assert.deepStrictEqual(leaderboard.getScores('GitSurvivor'), []);
            assert.strictEqual(leaderboard.getScores('CodeDefense').length, 1);
        });
    });
});
