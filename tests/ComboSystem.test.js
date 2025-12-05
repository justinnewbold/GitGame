/**
 * Tests for ComboSystem
 * Run with: npm test
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';

// Mock Phaser scene
const mockScene = {
    cameras: {
        main: { width: 800, height: 600 }
    },
    add: {
        text: () => ({
            setOrigin: () => ({}),
            setDepth: () => ({}),
            destroy: () => {}
        })
    },
    time: {
        delayedCall: () => ({ remove: () => {} })
    },
    tweens: {
        add: () => {}
    },
    particles: null,
    sounds: null
};

const { default: ComboSystem } = await import('../src/utils/ComboSystem.js');

describe('ComboSystem', () => {
    let comboSystem;

    beforeEach(() => {
        comboSystem = new ComboSystem(mockScene);
    });

    describe('Initialization', () => {
        it('should initialize with zero combo', () => {
            assert.strictEqual(comboSystem.getCombo(), 0);
            assert.strictEqual(comboSystem.getMultiplier(), 1);
            assert.strictEqual(comboSystem.getMaxCombo(), 0);
        });
    });

    describe('Combo Building', () => {
        it('should increment combo on hit', () => {
            comboSystem.addHit();
            assert.strictEqual(comboSystem.getCombo(), 1);
        });

        it('should track max combo', () => {
            comboSystem.addHit();
            comboSystem.addHit();
            comboSystem.addHit();
            assert.strictEqual(comboSystem.getMaxCombo(), 3);

            comboSystem.resetCombo();
            comboSystem.addHit();
            assert.strictEqual(comboSystem.getMaxCombo(), 3); // Should remain at previous max
        });

        it('should update multiplier based on combo count', () => {
            // No multiplier at start
            assert.strictEqual(comboSystem.getMultiplier(), 1);

            // Build combo to 5 for 1.5x multiplier
            for (let i = 0; i < 5; i++) {
                comboSystem.addHit();
            }
            assert.strictEqual(comboSystem.getMultiplier(), 1.5);

            // Build to 10 for 2x multiplier
            for (let i = 0; i < 5; i++) {
                comboSystem.addHit();
            }
            assert.strictEqual(comboSystem.getMultiplier(), 2);

            // Build to 20 for 3x multiplier
            for (let i = 0; i < 10; i++) {
                comboSystem.addHit();
            }
            assert.strictEqual(comboSystem.getMultiplier(), 3);
        });
    });

    describe('Score Calculation', () => {
        it('should calculate score with multiplier', () => {
            const baseScore = 100;

            // No multiplier
            assert.strictEqual(comboSystem.calculateScore(baseScore), 100);

            // Build combo for 1.5x multiplier
            for (let i = 0; i < 5; i++) {
                comboSystem.addHit();
            }
            assert.strictEqual(comboSystem.calculateScore(baseScore), 150);

            // Build combo for 2x multiplier
            for (let i = 0; i < 5; i++) {
                comboSystem.addHit();
            }
            assert.strictEqual(comboSystem.calculateScore(baseScore), 200);
        });

        it('should floor the score to integer', () => {
            for (let i = 0; i < 5; i++) {
                comboSystem.addHit();
            }
            const score = comboSystem.calculateScore(33); // 33 * 1.5 = 49.5
            assert.strictEqual(score, 49);
        });
    });

    describe('Combo Reset', () => {
        it('should reset combo and multiplier', () => {
            for (let i = 0; i < 10; i++) {
                comboSystem.addHit();
            }

            assert.strictEqual(comboSystem.getCombo(), 10);
            assert.strictEqual(comboSystem.getMultiplier(), 2);

            comboSystem.resetCombo();

            assert.strictEqual(comboSystem.getCombo(), 0);
            assert.strictEqual(comboSystem.getMultiplier(), 1);
        });

        it('should preserve max combo after reset', () => {
            for (let i = 0; i < 15; i++) {
                comboSystem.addHit();
            }
            const maxCombo = comboSystem.getMaxCombo();

            comboSystem.resetCombo();

            assert.strictEqual(comboSystem.getMaxCombo(), maxCombo);
            assert.strictEqual(comboSystem.getCombo(), 0);
        });
    });

    describe('Multiplier Thresholds', () => {
        it('should have correct multiplier at threshold 5', () => {
            for (let i = 0; i < 5; i++) {
                comboSystem.addHit();
            }
            assert.strictEqual(comboSystem.getMultiplier(), 1.5);
        });

        it('should have correct multiplier at threshold 10', () => {
            for (let i = 0; i < 10; i++) {
                comboSystem.addHit();
            }
            assert.strictEqual(comboSystem.getMultiplier(), 2);
        });

        it('should have correct multiplier at threshold 20', () => {
            for (let i = 0; i < 20; i++) {
                comboSystem.addHit();
            }
            assert.strictEqual(comboSystem.getMultiplier(), 3);
        });

        it('should have correct multiplier at threshold 30', () => {
            for (let i = 0; i < 30; i++) {
                comboSystem.addHit();
            }
            assert.strictEqual(comboSystem.getMultiplier(), 4);
        });

        it('should have correct multiplier at threshold 50', () => {
            for (let i = 0; i < 50; i++) {
                comboSystem.addHit();
            }
            assert.strictEqual(comboSystem.getMultiplier(), 5);
        });

        it('should cap multiplier at 5x', () => {
            for (let i = 0; i < 100; i++) {
                comboSystem.addHit();
            }
            assert.strictEqual(comboSystem.getMultiplier(), 5);
        });
    });
});
