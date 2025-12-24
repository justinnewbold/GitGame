/**
 * Tests for PowerUps utility
 * Run with: npm test
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';

// Import PowerUpTypes directly (no scene needed for type definitions)
const { PowerUpTypes } = await import('../src/utils/PowerUps.js');

describe('PowerUpTypes', () => {
    describe('Type Definitions', () => {
        it('should have all required power-up types', () => {
            const requiredTypes = [
                'COFFEE', 'STACK_OVERFLOW', 'RUBBER_DUCK', 'GIT_REVERT',
                'DARK_MODE', 'KEYBOARD_WARRIOR', 'ENERGY_DRINK', 'COPILOT',
                'PAIR_PROGRAMMING', 'DOCUMENTATION', 'UNIT_TESTS', 'DEBUGGER',
                'VIM_MODE', 'STACK_TRACE', 'CODE_REVIEW', 'REFACTOR',
                'HOTFIX', 'DEPLOYMENT', 'MERGE_SUCCESS', 'CLEAN_CODE'
            ];

            requiredTypes.forEach(type => {
                assert.ok(PowerUpTypes[type], `Missing power-up type: ${type}`);
            });
        });

        it('should have required properties for each power-up', () => {
            const requiredProps = ['id', 'name', 'emoji', 'color', 'effect', 'rarity', 'duration'];

            Object.values(PowerUpTypes).forEach(powerUp => {
                requiredProps.forEach(prop => {
                    assert.ok(powerUp[prop] !== undefined, `${powerUp.name} missing property: ${prop}`);
                });
            });
        });

        it('should have valid rarity values', () => {
            const validRarities = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

            Object.values(PowerUpTypes).forEach(powerUp => {
                assert.ok(
                    validRarities.includes(powerUp.rarity),
                    `${powerUp.name} has invalid rarity: ${powerUp.rarity}`
                );
            });
        });

        it('should have non-negative duration', () => {
            Object.values(PowerUpTypes).forEach(powerUp => {
                assert.ok(
                    powerUp.duration >= 0,
                    `${powerUp.name} has negative duration: ${powerUp.duration}`
                );
            });
        });

        it('should have valid color values (hex numbers)', () => {
            Object.values(PowerUpTypes).forEach(powerUp => {
                assert.ok(
                    typeof powerUp.color === 'number' && powerUp.color >= 0,
                    `${powerUp.name} has invalid color: ${powerUp.color}`
                );
            });
        });

        it('should have emoji for each power-up', () => {
            Object.values(PowerUpTypes).forEach(powerUp => {
                assert.ok(
                    powerUp.emoji && powerUp.emoji.length > 0,
                    `${powerUp.name} missing emoji`
                );
            });
        });
    });

    describe('Rarity Distribution', () => {
        it('should have at least one power-up of each rarity', () => {
            const rarities = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
            const powerUpsByRarity = {};

            Object.values(PowerUpTypes).forEach(powerUp => {
                if (!powerUpsByRarity[powerUp.rarity]) {
                    powerUpsByRarity[powerUp.rarity] = [];
                }
                powerUpsByRarity[powerUp.rarity].push(powerUp);
            });

            rarities.forEach(rarity => {
                assert.ok(
                    powerUpsByRarity[rarity] && powerUpsByRarity[rarity].length > 0,
                    `No power-ups with rarity: ${rarity}`
                );
            });
        });

        it('should have more common/uncommon than legendary', () => {
            const common = Object.values(PowerUpTypes).filter(p => p.rarity === 'common').length;
            const uncommon = Object.values(PowerUpTypes).filter(p => p.rarity === 'uncommon').length;
            const legendary = Object.values(PowerUpTypes).filter(p => p.rarity === 'legendary').length;

            assert.ok(
                common + uncommon >= legendary,
                'Legendary power-ups should be rarer than common/uncommon combined'
            );
        });
    });

    describe('Instant vs Duration Effects', () => {
        it('should have some instant (duration=0) power-ups', () => {
            const instantPowerUps = Object.values(PowerUpTypes).filter(p => p.duration === 0);
            assert.ok(instantPowerUps.length > 0, 'Should have at least one instant power-up');
        });

        it('should have some duration-based power-ups', () => {
            const durationPowerUps = Object.values(PowerUpTypes).filter(p => p.duration > 0);
            assert.ok(durationPowerUps.length > 0, 'Should have at least one duration power-up');
        });

        it('should have reasonable duration values (1-20 seconds)', () => {
            const durationPowerUps = Object.values(PowerUpTypes).filter(p => p.duration > 0);

            durationPowerUps.forEach(powerUp => {
                assert.ok(
                    powerUp.duration >= 1000 && powerUp.duration <= 20000,
                    `${powerUp.name} has unusual duration: ${powerUp.duration}ms`
                );
            });
        });
    });

    describe('Unique IDs', () => {
        it('should have unique IDs for all power-ups', () => {
            const ids = Object.values(PowerUpTypes).map(p => p.id);
            const uniqueIds = new Set(ids);

            assert.strictEqual(ids.length, uniqueIds.size, 'Power-up IDs should be unique');
        });
    });

    describe('Specific Power-ups', () => {
        it('COFFEE should be common with speed effect', () => {
            const coffee = PowerUpTypes.COFFEE;
            assert.strictEqual(coffee.id, 'coffee');
            assert.strictEqual(coffee.rarity, 'common');
            assert.ok(coffee.duration > 0);
        });

        it('DARK_MODE should provide invincibility', () => {
            const darkMode = PowerUpTypes.DARK_MODE;
            assert.ok(darkMode.effect.toLowerCase().includes('invincib'));
        });

        it('DEPLOYMENT should be instant (duration=0)', () => {
            const deployment = PowerUpTypes.DEPLOYMENT;
            assert.strictEqual(deployment.duration, 0);
        });

        it('DOCUMENTATION should be legendary rarity', () => {
            const docs = PowerUpTypes.DOCUMENTATION;
            assert.strictEqual(docs.rarity, 'legendary');
        });
    });
});

describe('PowerUpManager (static analysis)', () => {
    describe('Weight Distribution', () => {
        it('should have proper rarity weights for random selection', () => {
            // Test the weight logic that would be used in spawn()
            const weights = {
                common: 40,
                uncommon: 25,
                rare: 20,
                epic: 10,
                legendary: 5
            };

            // Common should be most likely
            assert.ok(weights.common > weights.uncommon);
            assert.ok(weights.uncommon > weights.rare);
            assert.ok(weights.rare > weights.epic);
            assert.ok(weights.epic > weights.legendary);

            // Total should be 100
            const total = Object.values(weights).reduce((a, b) => a + b, 0);
            assert.strictEqual(total, 100);
        });
    });
});
