// Background Music Manager - Procedural music generation using Web Audio API

import { gameData } from './GameData.js';

export default class MusicManager {
    constructor() {
        this.audioContext = null;
        this.currentTrack = null;
        this.masterGain = null;
        this.isPlaying = false;
        this.currentTheme = null;
        this.oscillators = [];
        this.scheduledNotes = [];
        this.enabled = true;
    }

    init() {
        // Check if music is enabled in settings
        if (gameData.data.settings && !gameData.data.settings.musicEnabled) {
            this.enabled = false;
            return;
        }

        // Create audio context
        if (!this.audioContext) {
            try {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                this.audioContext = new AudioContext();

                // Create master gain (volume control)
                this.masterGain = this.audioContext.createGain();
                this.masterGain.connect(this.audioContext.destination);
                this.masterGain.gain.value = 0.3; // Default volume
            } catch (e) {
                console.warn('Web Audio API not supported:', e);
                this.enabled = false;
            }
        }
    }

    // Music themes for different game modes
    getMusicThemes() {
        return {
            menu: {
                tempo: 120,
                key: 'C',
                scale: [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88], // C Major
                bassline: [130.81, 164.81, 196.00, 174.61], // C, E, G, F
                melody: [523.25, 587.33, 659.25, 698.46, 783.99], // Higher octave
                style: 'upbeat'
            },
            gitSurvivor: {
                tempo: 140,
                key: 'Am',
                scale: [220.00, 246.94, 261.63, 293.66, 329.63, 349.23, 392.00], // A Minor
                bassline: [110.00, 130.81, 146.83, 164.81], // A, C, D, E
                melody: [440.00, 493.88, 523.25, 587.33, 659.25],
                style: 'intense'
            },
            codeDefense: {
                tempo: 110,
                key: 'G',
                scale: [196.00, 220.00, 246.94, 261.63, 293.66, 329.63, 369.99], // G Major
                bassline: [98.00, 123.47, 146.83, 130.81], // G, B, D, C
                melody: [392.00, 440.00, 493.88, 523.25, 587.33],
                style: 'strategic'
            },
            prRush: {
                tempo: 150,
                key: 'D',
                scale: [293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25], // D Major
                bassline: [146.83, 185.00, 220.00, 196.00], // D, F#, A, G
                melody: [587.33, 659.25, 698.46, 783.99, 880.00],
                style: 'energetic'
            },
            devCommander: {
                tempo: 100,
                key: 'Em',
                scale: [164.81, 185.00, 196.00, 220.00, 246.94, 261.63, 293.66], // E Minor
                bassline: [82.41, 98.00, 110.00, 123.47], // E, G, A, B
                melody: [329.63, 369.99, 392.00, 440.00, 493.88],
                style: 'ambient'
            },
            boss: {
                tempo: 160,
                key: 'Dm',
                scale: [293.66, 311.13, 329.63, 369.99, 392.00, 415.30, 466.16], // D Minor
                bassline: [146.83, 174.61, 196.00, 185.00], // D, F, G, F#
                melody: [587.33, 622.25, 659.25, 739.99, 783.99],
                style: 'dramatic'
            }
        };
    }

    // Play a music theme
    play(themeName = 'menu') {
        if (!this.enabled || !this.audioContext) {
            return;
        }

        // Resume audio context if suspended (browser autoplay policy)
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }

        // Stop current track if playing
        if (this.isPlaying) {
            this.stop();
        }

        const themes = this.getMusicThemes();
        const theme = themes[themeName] || themes.menu;
        this.currentTheme = theme;
        this.isPlaying = true;

        // Fade in
        this.masterGain.gain.setValueAtTime(0, this.audioContext.currentTime);
        this.masterGain.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 1);

        // Start musical layers
        this.playBassline(theme);
        this.playMelody(theme);
        this.playArpeggio(theme);
    }

    // Bass line layer
    playBassline(theme) {
        const beatDuration = 60 / theme.tempo;
        let beatIndex = 0;

        const playBeat = () => {
            if (!this.isPlaying || !this.audioContext) return;

            const now = this.audioContext.currentTime;
            const freq = theme.bassline[beatIndex % theme.bassline.length];

            // Create bass note
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();

            osc.type = 'sine';
            osc.frequency.value = freq;

            gain.gain.setValueAtTime(0.4, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + beatDuration * 2);

            osc.connect(gain);
            gain.connect(this.masterGain);

            osc.start(now);
            osc.stop(now + beatDuration * 2);

            this.oscillators.push(osc);

            beatIndex++;
            setTimeout(playBeat, beatDuration * 1000);
        };

        playBeat();
    }

    // Melody layer
    playMelody(theme) {
        const beatDuration = 60 / theme.tempo;
        let noteIndex = 0;
        const pattern = this.generateMelodyPattern(theme);

        const playNote = () => {
            if (!this.isPlaying || !this.audioContext) return;

            const now = this.audioContext.currentTime;
            const note = pattern[noteIndex % pattern.length];

            if (note.freq > 0) { // 0 = rest
                const osc = this.audioContext.createOscillator();
                const gain = this.audioContext.createGain();

                osc.type = theme.style === 'intense' ? 'square' : 'triangle';
                osc.frequency.value = note.freq;

                gain.gain.setValueAtTime(0.15, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + note.duration);

                osc.connect(gain);
                gain.connect(this.masterGain);

                osc.start(now);
                osc.stop(now + note.duration);

                this.oscillators.push(osc);
            }

            noteIndex++;
            setTimeout(playNote, note.duration * 1000);
        };

        playNote();
    }

    // Arpeggio layer
    playArpeggio(theme) {
        const beatDuration = 60 / theme.tempo / 4; // 16th notes
        let noteIndex = 0;

        const playNote = () => {
            if (!this.isPlaying || !this.audioContext) return;

            const now = this.audioContext.currentTime;
            const freq = theme.scale[noteIndex % theme.scale.length];

            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();

            osc.type = 'sine';
            osc.frequency.value = freq;

            gain.gain.setValueAtTime(0.08, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + beatDuration);

            osc.connect(gain);
            gain.connect(this.masterGain);

            osc.start(now);
            osc.stop(now + beatDuration);

            this.oscillators.push(osc);

            noteIndex++;
            setTimeout(playNote, beatDuration * 1000);
        };

        playNote();
    }

    // Generate melody pattern
    generateMelodyPattern(theme) {
        const beatDuration = 60 / theme.tempo;
        const pattern = [];

        // Create a simple 8-bar melody
        const bars = 8;
        const notesPerBar = 4;

        for (let bar = 0; bar < bars; bar++) {
            for (let note = 0; note < notesPerBar; note++) {
                const isRest = Math.random() < 0.2; // 20% chance of rest

                if (isRest) {
                    pattern.push({ freq: 0, duration: beatDuration });
                } else {
                    const scaleIndex = Math.floor(Math.random() * theme.melody.length);
                    const freq = theme.melody[scaleIndex];
                    const duration = beatDuration * (Math.random() < 0.3 ? 0.5 : 1); // Some shorter notes

                    pattern.push({ freq, duration });
                }
            }
        }

        return pattern;
    }

    // Stop current music
    stop() {
        if (!this.isPlaying) return;

        // Fade out
        if (this.masterGain && this.audioContext) {
            const now = this.audioContext.currentTime;
            this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
            this.masterGain.gain.linearRampToValueAtTime(0, now + 0.5);
        }

        // Stop all oscillators after fade
        setTimeout(() => {
            this.oscillators.forEach(osc => {
                try {
                    if (osc) osc.stop();
                } catch (e) {
                    // Already stopped
                }
            });
            this.oscillators = [];
            this.isPlaying = false;
        }, 600);
    }

    // Set volume (0-1)
    setVolume(volume) {
        if (this.masterGain && this.audioContext) {
            const now = this.audioContext.currentTime;
            this.masterGain.gain.linearRampToValueAtTime(
                Math.max(0, Math.min(1, volume)),
                now + 0.1
            );
        }
    }

    // Toggle music on/off
    toggle() {
        this.enabled = !this.enabled;

        if (!this.enabled) {
            this.stop();
        }

        return this.enabled;
    }

    // Check if music is playing
    isCurrentlyPlaying() {
        return this.isPlaying;
    }

    // Resume audio context (for handling browser autoplay restrictions)
    resume() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }
}

// Singleton
export const musicManager = new MusicManager();
