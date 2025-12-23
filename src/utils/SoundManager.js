/**
 * Sound Manager - handles all game audio
 * Uses Web Audio API for generated sounds (no external files needed)
 */

import { logger } from './Logger.js';

/**
 * @typedef {Object} SoundConfig
 * @property {number} freq - Frequency in Hz
 * @property {number} duration - Duration in seconds
 * @property {string} type - Oscillator type ('sine', 'square', 'sawtooth', 'triangle')
 */

/**
 * SoundManager - Web Audio API based sound effects manager
 * @class
 */
export default class SoundManager {
    /**
     * Create a SoundManager instance
     * @param {Phaser.Scene} [scene] - Optional Phaser scene reference
     */
    constructor(scene) {
        /** @type {Phaser.Scene|null} */
        this.scene = scene;
        /** @type {boolean} */
        this.enabled = true;
        /** @type {number} Master volume (0.0 to 1.0) */
        this.volume = 1.0;
        /** @type {number} Music volume (0.0 to 1.0) */
        this.musicVolume = 0.3;
        /** @type {number} SFX volume (0.0 to 1.0) */
        this.sfxVolume = 0.5;
        /** @type {AudioContext|null} */
        this.audioContext = null;

        /** @type {Object.<string, SoundConfig>} Sound definitions */
        this.sounds = {
            shoot: { freq: 440, duration: 0.1, type: 'square' },
            hit: { freq: 220, duration: 0.15, type: 'sawtooth' },
            death: { freq: 110, duration: 0.3, type: 'triangle' },
            collect: { freq: 880, duration: 0.2, type: 'sine' },
            victory: { freq: 660, duration: 0.4, type: 'sine' },
            place: { freq: 550, duration: 0.1, type: 'square' },
            wave: { freq: 330, duration: 0.5, type: 'triangle' },
            error: { freq: 150, duration: 0.2, type: 'sawtooth' },
            upgrade: { freq: 990, duration: 0.3, type: 'sine' },
            boss: { freq: 100, duration: 1.0, type: 'sawtooth' }
        };
    }

    /**
     * Get or create the AudioContext (singleton pattern)
     * @returns {AudioContext|null} The audio context or null if unavailable
     */
    getAudioContext() {
        if (!this.audioContext) {
            try {
                // Support both browser (window) and Node.js test environments (global)
                const AudioContextClass = (typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext)) ||
                                          (typeof global !== 'undefined' && global.AudioContext);
                if (AudioContextClass) {
                    this.audioContext = new AudioContextClass();
                }
            } catch (e) {
                logger.warn('SoundManager', 'Failed to create AudioContext', { error: e.message });
                return null;
            }
        }
        return this.audioContext;
    }

    /**
     * Play a sound effect
     * @param {string} type - Sound type (shoot, hit, death, collect, victory, place, wave, error, upgrade, boss)
     */
    playSound(type) {
        if (!this.enabled) return;

        const audioContext = this.getAudioContext();
        if (!audioContext) return; // Graceful degradation if audio unavailable

        try {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            const sound = this.sounds[type] || this.sounds.shoot;

            oscillator.type = sound.type;
            oscillator.frequency.value = sound.freq;
            gainNode.gain.value = this.sfxVolume * this.volume;
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + sound.duration);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + sound.duration);
        } catch (e) {
            logger.warn('SoundManager', 'Error playing sound', { type, error: e.message });
        }
    }

    /**
     * Play a sequence of notes (for jingles/melodies)
     * @param {Array<{freq: number, duration: number}>} notes - Array of note objects
     */
    playMelody(notes) {
        if (!this.enabled) return;
        if (!notes || !Array.isArray(notes) || notes.length === 0) return;

        const audioContext = this.getAudioContext();
        if (!audioContext) return; // Graceful degradation if audio unavailable

        let startTime = audioContext.currentTime;

        try {
            notes.forEach((note) => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);

                oscillator.type = 'sine';
                oscillator.frequency.value = note.freq;
                gainNode.gain.value = this.musicVolume * this.volume;

                oscillator.start(startTime);
                oscillator.stop(startTime + note.duration);

                startTime += note.duration;
            });
        } catch (e) {
            logger.warn('SoundManager', 'Error playing melody', { error: e.message });
        }
    }

    /**
     * Play game over sound (descending notes)
     */
    playGameOver() {
        this.playMelody([
            { freq: 440, duration: 0.3 },
            { freq: 392, duration: 0.3 },
            { freq: 349, duration: 0.3 },
            { freq: 294, duration: 0.6 }
        ]);
    }

    /**
     * Play victory sound (ascending notes)
     */
    playVictory() {
        this.playMelody([
            { freq: 523, duration: 0.2 },
            { freq: 659, duration: 0.2 },
            { freq: 784, duration: 0.2 },
            { freq: 1047, duration: 0.4 }
        ]);
    }

    /**
     * Play level up sound (quick ascending)
     */
    playLevelUp() {
        this.playMelody([
            { freq: 440, duration: 0.15 },
            { freq: 554, duration: 0.15 },
            { freq: 659, duration: 0.15 },
            { freq: 880, duration: 0.3 }
        ]);
    }

    /**
     * Toggle sound enabled state
     * @returns {boolean} New enabled state
     */
    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }

    /**
     * Set enabled state for sound
     * @param {boolean} enabled - Whether sound should be enabled
     */
    setEnabled(enabled) {
        this.enabled = Boolean(enabled);
    }

    /**
     * Set volume - supports single master volume or separate sfx/music volumes
     * @param {number} sfxOrMaster - SFX volume (0-1) or master volume if music is omitted
     * @param {number} [music] - Music volume (0-1), optional
     */
    setVolume(sfxOrMaster, music) {
        if (music === undefined) {
            // Single parameter: set master volume
            this.volume = Math.max(0, Math.min(1, sfxOrMaster));
        } else {
            // Two parameters: set separate sfx and music volumes
            this.sfxVolume = Math.max(0, Math.min(1, sfxOrMaster));
            this.musicVolume = Math.max(0, Math.min(1, music));
        }
    }

    /**
     * Get current volume settings
     * @returns {{master: number, sfx: number, music: number}} Volume settings
     */
    getVolume() {
        return {
            master: this.volume,
            sfx: this.sfxVolume,
            music: this.musicVolume
        };
    }

    /**
     * Check if sound is currently enabled
     * @returns {boolean} Whether sound is enabled
     */
    isEnabled() {
        return this.enabled;
    }

    /**
     * Cleanup method to properly dispose of AudioContext
     */
    destroy() {
        try {
            if (this.audioContext && this.audioContext.state !== 'closed') {
                this.audioContext.close();
            }
        } catch (e) {
            logger.warn('SoundManager', 'Error closing AudioContext', { error: e.message });
        }
        this.audioContext = null;
    }
}
