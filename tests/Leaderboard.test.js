/**
 * Tests for Leaderboard System
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

// Import Leaderboard (uses mocked localStorage)
const { default: Leaderboard, leaderboard } = await import('../src/utils/Leaderboard.js');

describe('Leaderboard', () => {
    let lb;

    beforeEach(() => {
        localStorage.clear();
        lb = new Leaderboard();
    });

    describe('Score Submission', () => {
        it('should add score to leaderboard', () => {
            const result = lb.addScore('gitSurvivor', 'TST', 1000);
            assert.ok(result.added);
            assert.strictEqual(result.rank, 1);
        });

        it('should sort scores in descending order', () => {
            lb.addScore('gitSurvivor', 'AAA', 500);
            lb.addScore('gitSurvivor', 'BBB', 1000);
            lb.addScore('gitSurvivor', 'CCC', 750);

            const entries = lb.getEntries('gitSurvivor');
            assert.strictEqual(entries[0].score, 1000);
            assert.strictEqual(entries[1].score, 750);
            assert.strictEqual(entries[2].score, 500);
        });

        it('should limit entries to max 10', () => {
            for (let i = 0; i < 15; i++) {
                lb.addScore('gitSurvivor', 'TST', i * 100);
            }

            const entries = lb.getEntries('gitSurvivor');
            assert.strictEqual(entries.length, 10);
        });
    });

    describe('Score Queries', () => {
        it('should return empty array for game mode with no scores', () => {
            const entries = lb.getEntries('nonexistent');
            assert.ok(Array.isArray(entries));
            assert.strictEqual(entries.length, 0);
        });

        it('should get top score', () => {
            lb.addScore('gitSurvivor', 'AAA', 500);
            lb.addScore('gitSurvivor', 'BBB', 1000);

            const top = lb.getTopScore('gitSurvivor');
            assert.strictEqual(top.score, 1000);
            assert.strictEqual(top.name, 'BBB');
        });

        it('should return null for top score when no entries', () => {
            const top = lb.getTopScore('gitSurvivor');
            assert.strictEqual(top, null);
        });
    });

    describe('Score Ranking', () => {
        it('should return correct rank for new score', () => {
            lb.addScore('gitSurvivor', 'AAA', 500);
            const result = lb.addScore('gitSurvivor', 'BBB', 1000);
            assert.strictEqual(result.rank, 1); // Highest score = rank 1
        });

        it('should track leaderboard position', () => {
            lb.addScore('gitSurvivor', 'AAA', 100);
            lb.addScore('gitSurvivor', 'BBB', 200);
            lb.addScore('gitSurvivor', 'CCC', 150);

            const entries = lb.getEntries('gitSurvivor');
            assert.strictEqual(entries.length, 3);
        });
    });

    describe('Static Methods', () => {
        it('should get mode name', () => {
            const name = Leaderboard.getModeName('gitSurvivor');
            assert.strictEqual(name, 'Git Survivor');
        });

        it('should get mode icon', () => {
            const icon = Leaderboard.getModeIcon('gitSurvivor');
            assert.strictEqual(icon, '🗡️');
        });

        it('should format date', () => {
            const formatted = Leaderboard.formatDate(Date.now());
            assert.ok(typeof formatted === 'string');
            assert.ok(formatted.length > 0);
        });
    });

    describe('Clear Leaderboard', () => {
        it('should clear game mode leaderboard', () => {
            lb.addScore('gitSurvivor', 'TST', 1000);
            lb.clearGameMode('gitSurvivor');

            const entries = lb.getEntries('gitSurvivor');
            assert.strictEqual(entries.length, 0);
        });

        it('should clear all leaderboards', () => {
            lb.addScore('gitSurvivor', 'TST', 1000);
            lb.addScore('codeDefense', 'TST', 500);
            lb.clearAll();

            assert.strictEqual(lb.getEntries('gitSurvivor').length, 0);
            assert.strictEqual(lb.getEntries('codeDefense').length, 0);
        });
    });
});
