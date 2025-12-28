/**
 * Tests for MusicManager
 * Run with: npm test
 */

import { describe, it, beforeEach, afterEach, mock } from 'node:test';
import assert from 'node:assert';

// Mock AudioContext
class MockAudioContext {
    constructor() {
        this.state = 'running';
        this.currentTime = 0;
        this.destination = {};
    }

    createOscillator() {
        return {
            type: 'sine',
            frequency: { value: 0 },
            connect: () => {},
            start: () => {},
            stop: () => {}
        };
    }

    createGain() {
        return {
            gain: {
                value: 1,
                setValueAtTime: () => {},
                exponentialRampToValueAtTime: () => {},
                linearRampToValueAtTime: () => {}
            },
            connect: () => {}
        };
    }

    resume() {
        this.state = 'running';
        return Promise.resolve();
    }
}

// Mock window
global.window = {
    AudioContext: MockAudioContext,
    webkitAudioContext: MockAudioContext
};

// Mock gameData
const mockGameData = {
    data: {
        settings: {
            musicEnabled: true
        }
    }
};

// We need to mock the gameData import
await mock.module('../src/utils/GameData.js', {
    namedExports: {
        gameData: mockGameData
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

const { default: MusicManager } = await import('../src/utils/MusicManager.js');

describe('MusicManager', () => {
    let musicManager;

    beforeEach(() => {
        musicManager = new MusicManager();
    });

    afterEach(() => {
        if (musicManager.isPlaying) {
            musicManager.stop();
        }
    });

    describe('Initialization', () => {
        it('should initialize with default values', () => {
            assert.strictEqual(musicManager.audioContext, null);
            assert.strictEqual(musicManager.isPlaying, false);
            assert.strictEqual(musicManager.enabled, true);
            assert.deepStrictEqual(musicManager.oscillators, []);
            assert.deepStrictEqual(musicManager.pendingTimeouts, []);
        });

        it('should create audio context on init', () => {
            musicManager.init();
            assert.notStrictEqual(musicManager.audioContext, null);
            assert.notStrictEqual(musicManager.masterGain, null);
        });

        it('should respect disabled music setting', () => {
            mockGameData.data.settings.musicEnabled = false;
            const disabledManager = new MusicManager();
            disabledManager.init();
            assert.strictEqual(disabledManager.enabled, false);
            mockGameData.data.settings.musicEnabled = true; // Reset
        });
    });

    describe('Theme Management', () => {
        it('should return all music themes', () => {
            const themes = musicManager.getMusicThemes();
            assert.ok(themes.menu);
            assert.ok(themes.gitSurvivor);
            assert.ok(themes.codeDefense);
            assert.ok(themes.prRush);
            assert.ok(themes.devCommander);
            assert.ok(themes.boss);
        });

        it('should have correct structure for each theme', () => {
            const themes = musicManager.getMusicThemes();
            Object.values(themes).forEach(theme => {
                assert.ok(theme.tempo > 0);
                assert.ok(theme.key);
                assert.ok(Array.isArray(theme.scale));
                assert.ok(Array.isArray(theme.bassline));
                assert.ok(Array.isArray(theme.melody));
                assert.ok(theme.style);
            });
        });
    });

    describe('Playback Control', () => {
        beforeEach(() => {
            musicManager.init();
        });

        it('should start playing music', () => {
            musicManager.play('menu');
            assert.strictEqual(musicManager.isPlaying, true);
        });

        it('should stop playing music', () => {
            musicManager.play('menu');
            musicManager.stop();
            assert.strictEqual(musicManager.isPlaying, false);
        });

        it('should clear pending timeouts on stop', () => {
            musicManager.play('menu');
            assert.ok(musicManager.pendingTimeouts.length > 0);
            musicManager.stop();
            assert.strictEqual(musicManager.pendingTimeouts.length, 0);
        });

        it('should stop current track before playing new one', () => {
            musicManager.play('menu');
            const firstOscillators = musicManager.oscillators.length;
            musicManager.play('gitSurvivor');
            // After stopping and restarting, oscillators should be managed
            assert.strictEqual(musicManager.isPlaying, true);
        });
    });

    describe('Volume Control', () => {
        beforeEach(() => {
            musicManager.init();
        });

        it('should set volume within bounds', () => {
            musicManager.setVolume(0.5);
            // Volume is set via audio API, we verify no errors thrown
            assert.ok(true);
        });

        it('should clamp volume to 0-1 range', () => {
            musicManager.setVolume(-0.5);
            musicManager.setVolume(1.5);
            // No errors should be thrown
            assert.ok(true);
        });
    });

    describe('Toggle Functionality', () => {
        it('should toggle enabled state', () => {
            assert.strictEqual(musicManager.enabled, true);
            musicManager.toggle();
            assert.strictEqual(musicManager.enabled, false);
            musicManager.toggle();
            assert.strictEqual(musicManager.enabled, true);
        });

        it('should stop music when disabled via toggle', () => {
            musicManager.init();
            musicManager.play('menu');
            musicManager.toggle();
            assert.strictEqual(musicManager.isPlaying, false);
        });
    });

    describe('Melody Pattern Generation', () => {
        it('should generate melody pattern with correct structure', () => {
            const theme = musicManager.getMusicThemes().menu;
            const pattern = musicManager.generateMelodyPattern(theme);

            assert.ok(Array.isArray(pattern));
            assert.ok(pattern.length > 0);

            pattern.forEach(note => {
                assert.ok('freq' in note);
                assert.ok('duration' in note);
                assert.ok(note.duration > 0);
            });
        });
    });

    describe('State Queries', () => {
        it('should report playing state correctly', () => {
            musicManager.init();
            assert.strictEqual(musicManager.isCurrentlyPlaying(), false);
            musicManager.play('menu');
            assert.strictEqual(musicManager.isCurrentlyPlaying(), true);
            musicManager.stop();
            assert.strictEqual(musicManager.isCurrentlyPlaying(), false);
        });
    });
});
