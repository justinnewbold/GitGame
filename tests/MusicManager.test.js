/**
 * Tests for MusicManager
 * Run with: npm test
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
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

// Mock localStorage
global.localStorage = {
    data: {},
    getItem(key) { return this.data[key] || null; },
    setItem(key, value) { this.data[key] = value; },
    clear() { this.data = {}; }
};

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
            assert.ok(Array.isArray(musicManager.oscillators));
            assert.ok(Array.isArray(musicManager.pendingTimeouts));
        });

        it('should create audio context on init', () => {
            musicManager.init();
            assert.notStrictEqual(musicManager.audioContext, null);
            assert.notStrictEqual(musicManager.masterGain, null);
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
            musicManager.stop();
            assert.strictEqual(musicManager.pendingTimeouts.length, 0);
        });

        it('should switch tracks correctly', () => {
            musicManager.play('menu');
            musicManager.play('gitSurvivor');
            assert.strictEqual(musicManager.isPlaying, true);
        });
    });

    describe('Volume Control', () => {
        beforeEach(() => {
            musicManager.init();
        });

        it('should set volume without error', () => {
            musicManager.setVolume(0.5);
            assert.ok(true);
        });

        it('should handle volume bounds', () => {
            musicManager.setVolume(-0.5);
            musicManager.setVolume(1.5);
            assert.ok(true);
        });
    });

    describe('Toggle Functionality', () => {
        it('should toggle enabled state', () => {
            const initial = musicManager.enabled;
            musicManager.toggle();
            assert.strictEqual(musicManager.enabled, !initial);
            musicManager.toggle();
            assert.strictEqual(musicManager.enabled, initial);
        });

        it('should stop music when disabled via toggle', () => {
            musicManager.init();
            musicManager.play('menu');
            if (musicManager.enabled) {
                musicManager.toggle();
            }
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
