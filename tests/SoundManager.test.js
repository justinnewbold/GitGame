import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert';

/**
 * SoundManager Tests
 *
 * Note: These tests mock the Web Audio API since it's not available in Node.js
 */

// Mock AudioContext
global.AudioContext = class AudioContext {
    constructor() {
        this.state = 'running';
        this.destination = {};
    }

    createOscillator() {
        return {
            type: 'sine',
            frequency: { value: 440 },
            connect: () => {},
            start: () => {},
            stop: () => {},
            disconnect: () => {}
        };
    }

    createGain() {
        return {
            gain: { value: 1, setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} },
            connect: () => {},
            disconnect: () => {}
        };
    }

    createBiquadFilter() {
        return {
            type: 'lowpass',
            frequency: { value: 1000 },
            Q: { value: 1 },
            connect: () => {},
            disconnect: () => {}
        };
    }

    close() {
        this.state = 'closed';
        return Promise.resolve();
    }
};

// Import after mocking
const SoundManager = (await import('../src/utils/SoundManager.js')).default;

describe('SoundManager', () => {
    let soundManager;

    beforeEach(() => {
        soundManager = new SoundManager();
    });

    describe('Initialization', () => {
        it('should initialize with default values', () => {
            assert.strictEqual(typeof soundManager, 'object');
            assert.strictEqual(soundManager.enabled, true);
            assert.strictEqual(soundManager.volume, 1.0);
            assert.strictEqual(soundManager.audioContext, null);
        });

        it('should create AudioContext on first sound', () => {
            soundManager.playSound('test');
            assert.notStrictEqual(soundManager.audioContext, null);
        });

        it('should reuse AudioContext for multiple sounds', () => {
            soundManager.playSound('test1');
            const firstContext = soundManager.audioContext;

            soundManager.playSound('test2');
            const secondContext = soundManager.audioContext;

            assert.strictEqual(firstContext, secondContext);
        });
    });

    describe('Volume Control', () => {
        it('should set volume correctly', () => {
            soundManager.setVolume(0.5);
            assert.strictEqual(soundManager.volume, 0.5);
        });

        it('should clamp volume to valid range', () => {
            soundManager.setVolume(1.5);
            assert.strictEqual(soundManager.volume, 1.0);

            soundManager.setVolume(-0.5);
            assert.strictEqual(soundManager.volume, 0.0);
        });
    });

    describe('Enable/Disable', () => {
        it('should enable sound', () => {
            soundManager.setEnabled(false);
            assert.strictEqual(soundManager.enabled, false);

            soundManager.setEnabled(true);
            assert.strictEqual(soundManager.enabled, true);
        });

        it('should not play sounds when disabled', () => {
            soundManager.setEnabled(false);
            // Should not throw error
            soundManager.playSound('test');
        });
    });

    describe('Sound Types', () => {
        it('should handle collect sound', () => {
            assert.doesNotThrow(() => {
                soundManager.playSound('collect');
            });
        });

        it('should handle powerup sound', () => {
            assert.doesNotThrow(() => {
                soundManager.playSound('powerup');
            });
        });

        it('should handle shoot sound', () => {
            assert.doesNotThrow(() => {
                soundManager.playSound('shoot');
            });
        });

        it('should handle hit sound', () => {
            assert.doesNotThrow(() => {
                soundManager.playSound('hit');
            });
        });

        it('should handle explosion sound', () => {
            assert.doesNotThrow(() => {
                soundManager.playSound('explosion');
            });
        });

        it('should handle upgrade sound', () => {
            assert.doesNotThrow(() => {
                soundManager.playSound('upgrade');
            });
        });
    });

    describe('Game Over Sounds', () => {
        it('should play game over sound', () => {
            assert.doesNotThrow(() => {
                soundManager.playGameOver();
            });
        });
    });

    describe('Cleanup', () => {
        it('should close AudioContext on destroy', async () => {
            soundManager.playSound('test');
            const context = soundManager.audioContext;

            soundManager.destroy();

            assert.strictEqual(context.state, 'closed');
            assert.strictEqual(soundManager.audioContext, null);
        });

        it('should handle destroy without AudioContext', () => {
            assert.doesNotThrow(() => {
                soundManager.destroy();
            });
        });

        it('should handle multiple destroy calls', () => {
            soundManager.playSound('test');

            assert.doesNotThrow(() => {
                soundManager.destroy();
                soundManager.destroy();
            });
        });
    });

    describe('Memory Leak Prevention', () => {
        it('should not create multiple AudioContexts', () => {
            soundManager.playSound('test1');
            const context1 = soundManager.audioContext;

            soundManager.playSound('test2');
            soundManager.playSound('test3');
            const context2 = soundManager.audioContext;

            assert.strictEqual(context1, context2, 'Should reuse same AudioContext');
        });

        it('should properly cleanup after many sounds', () => {
            for (let i = 0; i < 100; i++) {
                soundManager.playSound('test');
            }

            // Should still have only one AudioContext
            assert.notStrictEqual(soundManager.audioContext, null);

            soundManager.destroy();
            assert.strictEqual(soundManager.audioContext, null);
        });
    });

    describe('Edge Cases', () => {
        it('should handle unknown sound type', () => {
            assert.doesNotThrow(() => {
                soundManager.playSound('unknown');
            });
        });

        it('should handle null sound type', () => {
            assert.doesNotThrow(() => {
                soundManager.playSound(null);
            });
        });

        it('should handle rapid play calls', () => {
            assert.doesNotThrow(() => {
                for (let i = 0; i < 10; i++) {
                    soundManager.playSound('test');
                }
            });
        });
    });
});
