/**
 * Tests for GameStateManager
 * Run with: npm test
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';

// Mock localStorage
const localStorageData = {};
global.localStorage = {
    getItem: (key) => localStorageData[key] || null,
    setItem: (key, value) => { localStorageData[key] = value; },
    removeItem: (key) => { delete localStorageData[key]; },
    clear: () => { Object.keys(localStorageData).forEach(k => delete localStorageData[k]); }
};

const { default: GameStateManager, GitSurvivorStateManager, AutoSaveManager } = await import('../src/utils/GameStateManager.js');

describe('GameStateManager', () => {
    let stateManager;

    beforeEach(() => {
        localStorage.clear();
        stateManager = new GameStateManager('test_state');
    });

    describe('Save State', () => {
        it('should save state to localStorage', () => {
            const result = stateManager.saveState('TestScene', { score: 100 });
            assert.strictEqual(result, true);
            assert.notStrictEqual(localStorage.getItem('test_state'), null);
        });

        it('should save state with timestamp and version', () => {
            stateManager.saveState('TestScene', { score: 100 });
            const saved = JSON.parse(localStorage.getItem('test_state'));
            assert.ok(saved.timestamp);
            assert.strictEqual(saved.version, '1.0.0');
            assert.strictEqual(saved.sceneName, 'TestScene');
        });

        it('should update currentState after save', () => {
            stateManager.saveState('TestScene', { score: 100 });
            assert.notStrictEqual(stateManager.currentState, null);
            assert.strictEqual(stateManager.currentState.sceneName, 'TestScene');
        });
    });

    describe('Load State', () => {
        it('should return null when no state exists', () => {
            const result = stateManager.loadState();
            assert.strictEqual(result, null);
        });

        it('should load saved state', () => {
            stateManager.saveState('TestScene', { score: 100 });
            const loaded = stateManager.loadState();
            assert.strictEqual(loaded.sceneName, 'TestScene');
            assert.strictEqual(loaded.state.score, 100);
        });

        it('should return null for expired state', () => {
            // Save state with old timestamp
            const oldState = {
                sceneName: 'TestScene',
                state: { score: 100 },
                timestamp: Date.now() - (8 * 24 * 60 * 60 * 1000), // 8 days ago
                version: '1.0.0'
            };
            localStorage.setItem('test_state', JSON.stringify(oldState));

            const result = stateManager.loadState();
            assert.strictEqual(result, null);
        });
    });

    describe('Has Saved State', () => {
        it('should return false when no state exists', () => {
            assert.strictEqual(stateManager.hasSavedState(), false);
        });

        it('should return true when state exists', () => {
            stateManager.saveState('TestScene', { score: 100 });
            assert.strictEqual(stateManager.hasSavedState(), true);
        });
    });

    describe('Clear State', () => {
        it('should remove saved state', () => {
            stateManager.saveState('TestScene', { score: 100 });
            stateManager.clearState();
            assert.strictEqual(stateManager.hasSavedState(), false);
            assert.strictEqual(stateManager.currentState, null);
        });
    });

    describe('Time Since Save', () => {
        it('should return null when no state exists', () => {
            const result = stateManager.getTimeSinceSave();
            assert.strictEqual(result, null);
        });

        it('should return elapsed time since save', async () => {
            stateManager.saveState('TestScene', { score: 100 });
            await new Promise(r => setTimeout(r, 10));
            const timeSince = stateManager.getTimeSinceSave();
            assert.ok(timeSince >= 10);
        });
    });

    describe('Format Time Since Save', () => {
        it('should return "No saved game" when no state exists', () => {
            const result = stateManager.formatTimeSinceSave();
            assert.strictEqual(result, 'No saved game');
        });

        it('should format seconds correctly', () => {
            stateManager.saveState('TestScene', { score: 100 });
            const formatted = stateManager.formatTimeSinceSave();
            assert.ok(formatted.includes('second'));
        });
    });
});

describe('GitSurvivorStateManager', () => {
    let gsStateManager;
    let mockScene;

    beforeEach(() => {
        localStorage.clear();
        gsStateManager = new GitSurvivorStateManager();
        mockScene = {
            playerHealth: 80,
            playerSanity: 90,
            diskSpace: 75,
            level: 5,
            score: 1500,
            enemiesKilled: 42,
            powerUpsCollected: 10,
            player: { x: 400, y: 300 },
            difficultyMult: 1.5,
            powerUpManager: {
                getActiveEffects: () => [{ type: 'speed', remaining: 3000 }]
            },
            enemies: [1, 2, 3],
            time: { now: 60000 },
            updateHUD: () => {}
        };
    });

    describe('Save GitSurvivor State', () => {
        it('should save all relevant game state', () => {
            const result = gsStateManager.saveGitSurvivorState(mockScene);
            assert.strictEqual(result, true);

            const loaded = gsStateManager.loadState();
            assert.strictEqual(loaded.state.playerHealth, 80);
            assert.strictEqual(loaded.state.score, 1500);
            assert.strictEqual(loaded.state.level, 5);
        });

        it('should handle missing player position', () => {
            mockScene.player = null;
            const result = gsStateManager.saveGitSurvivorState(mockScene);
            assert.strictEqual(result, true);

            const loaded = gsStateManager.loadState();
            assert.strictEqual(loaded.state.playerX, 0);
            assert.strictEqual(loaded.state.playerY, 0);
        });
    });

    describe('Restore GitSurvivor State', () => {
        it('should restore player stats', () => {
            gsStateManager.saveGitSurvivorState(mockScene);

            const newScene = {
                player: { setPosition: () => {} },
                powerUpManager: { activateEffect: () => {} },
                updateHUD: () => {}
            };

            const result = gsStateManager.restoreGitSurvivorState(newScene);
            assert.strictEqual(result, true);
            assert.strictEqual(newScene.playerHealth, 80);
            assert.strictEqual(newScene.score, 1500);
        });

        it('should return false when no saved state', () => {
            const result = gsStateManager.restoreGitSurvivorState({});
            assert.strictEqual(result, false);
        });

        it('should return false for wrong scene type', () => {
            gsStateManager.saveState('OtherScene', { test: true });
            const result = gsStateManager.restoreGitSurvivorState({});
            assert.strictEqual(result, false);
        });
    });
});

describe('AutoSaveManager', () => {
    let autoSave;
    let mockScene;
    let mockStateManager;

    beforeEach(() => {
        mockStateManager = new GitSurvivorStateManager();
        mockScene = {
            playerHealth: 100,
            playerSanity: 100,
            diskSpace: 100,
            level: 1,
            score: 0,
            enemiesKilled: 0,
            powerUpsCollected: 0,
            player: { x: 0, y: 0 },
            difficultyMult: 1,
            powerUpManager: { getActiveEffects: () => [] },
            enemies: [],
            time: {
                now: 0,
                addEvent: ({ callback, loop }) => {
                    return { remove: () => {} };
                }
            },
            cameras: { main: { width: 800 } },
            add: {
                text: () => ({
                    setOrigin: () => {},
                    setAlpha: () => {},
                    setDepth: () => {},
                    destroy: () => {}
                })
            },
            tweens: { add: () => {} }
        };
        autoSave = new AutoSaveManager(mockScene, mockStateManager, 1000);
    });

    afterEach(() => {
        autoSave.destroy();
    });

    describe('Initialization', () => {
        it('should initialize with correct interval', () => {
            assert.strictEqual(autoSave.interval, 1000);
            assert.strictEqual(autoSave.enabled, true);
        });
    });

    describe('Enable/Disable', () => {
        it('should toggle enabled state', () => {
            autoSave.setEnabled(false);
            assert.strictEqual(autoSave.enabled, false);
            autoSave.setEnabled(true);
            assert.strictEqual(autoSave.enabled, true);
        });
    });

    describe('Manual Save', () => {
        it('should perform manual save', () => {
            localStorage.clear();
            mockScene.add = null; // Disable indicator
            const result = autoSave.save();
            assert.strictEqual(result, true);
        });
    });
});
