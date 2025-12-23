// Sound Manager - handles all game audio
// Uses Web Audio API for generated sounds (no external files needed for now)

export default class SoundManager {
    constructor(scene) {
        this.scene = scene;
        this.enabled = true;
        this.volume = 1.0;  // Master volume (0.0 to 1.0)
        this.musicVolume = 0.3;
        this.sfxVolume = 0.5;
        // Create AudioContext once and reuse it to prevent memory leaks
        this.audioContext = null;
    }

    // Get or create the AudioContext (singleton pattern)
    getAudioContext() {
        if (!this.audioContext) {
            // Support both browser (window) and Node.js test environments (global)
            const AudioContextClass = (typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext)) ||
                                      (typeof global !== 'undefined' && global.AudioContext);
            if (AudioContextClass) {
                this.audioContext = new AudioContextClass();
            }
        }
        return this.audioContext;
    }

    // Simple beep generator for retro feel
    playSound(type) {
        if (!this.enabled) return;

        const audioContext = this.getAudioContext();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        // Different sounds for different actions
        const sounds = {
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

        const sound = sounds[type] || sounds.shoot;

        oscillator.type = sound.type;
        oscillator.frequency.value = sound.freq;
        gainNode.gain.value = this.sfxVolume * this.volume;
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + sound.duration);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + sound.duration);
    }

    // Play a sequence of notes (for jingles)
    playMelody(notes) {
        if (!this.enabled) return;

        const audioContext = this.getAudioContext();
        let startTime = audioContext.currentTime;

        notes.forEach((note, index) => {
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
    }

    playGameOver() {
        this.playMelody([
            { freq: 440, duration: 0.3 },
            { freq: 392, duration: 0.3 },
            { freq: 349, duration: 0.3 },
            { freq: 294, duration: 0.6 }
        ]);
    }

    playVictory() {
        this.playMelody([
            { freq: 523, duration: 0.2 },
            { freq: 659, duration: 0.2 },
            { freq: 784, duration: 0.2 },
            { freq: 1047, duration: 0.4 }
        ]);
    }

    playLevelUp() {
        this.playMelody([
            { freq: 440, duration: 0.15 },
            { freq: 554, duration: 0.15 },
            { freq: 659, duration: 0.15 },
            { freq: 880, duration: 0.3 }
        ]);
    }

    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }

    /**
     * Set enabled state for sound
     * @param {boolean} enabled - Whether sound should be enabled
     */
    setEnabled(enabled) {
        this.enabled = enabled;
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

    // Cleanup method to properly dispose of AudioContext
    destroy() {
        if (this.audioContext && this.audioContext.state !== 'closed') {
            this.audioContext.close();
        }
        this.audioContext = null;
    }
}
