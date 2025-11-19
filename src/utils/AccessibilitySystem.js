// Accessibility System - Make the game accessible to all players

import { gameData } from './GameData.js';

export default class AccessibilitySystem {
    constructor(scene) {
        this.scene = scene;
        this.initializeAccessibility();
    }

    initializeAccessibility() {
        if (!gameData.data.accessibility) {
            gameData.data.accessibility = {
                // Visual
                colorblindMode: 'none', // none, deuteranopia, protanopia, tritanopia
                highContrast: false,
                textScale: 1.0,
                uiScale: 1.0,
                flashingEffects: true,
                screenShake: true,
                particleEffects: true,
                backgroundColor: '#1a1a2e',

                // Motion
                reducedMotion: false,
                cameraShake: true,
                animationSpeed: 1.0,

                // Audio
                subtitles: false,
                audioDescription: false,
                soundVisualization: false,
                monoAudio: false,

                // Controls
                oneHandedMode: false,
                autoAim: false,
                aimAssist: 0, // 0-100
                hapticFeedback: true,
                buttonHoldTime: 0.5, // seconds
                doubleTapTime: 0.3, // seconds

                // Gameplay
                pauseOnFocusLoss: true,
                gameSpeed: 1.0,
                difficultyAssist: false,
                autoCollect: false,
                autoFire: false,

                // UI
                largeButtons: false,
                tooltips: true,
                confirmDialogs: true,
                readableFont: false,

                // Presets
                preset: 'default' // default, low_vision, motor, hearing, cognitive
            };
            gameData.save();
        }
    }

    // Apply colorblind mode
    applyColorblindMode(mode) {
        const a11y = gameData.data.accessibility;
        a11y.colorblindMode = mode;

        if (!this.scene) {
            gameData.save();
            return;
        }

        const camera = this.scene.cameras.main;

        // Clear existing color filters
        camera.clearTint();

        switch (mode) {
            case 'deuteranopia': // Red-green (most common)
                // Shift reds to yellows, greens to blues
                camera.setTintFill(0xFFD700);
                break;

            case 'protanopia': // Red-blind
                camera.setTintFill(0x00BFFF);
                break;

            case 'tritanopia': // Blue-yellow
                camera.setTintFill(0xFF69B4);
                break;

            case 'none':
            default:
                // No filter
                break;
        }

        gameData.save();
    }

    // Get colorblind-safe color palette
    getColorblindSafePalette() {
        const mode = gameData.data.accessibility.colorblindMode;

        const palettes = {
            none: {
                red: 0xFF0000,
                green: 0x00FF00,
                blue: 0x0000FF,
                yellow: 0xFFFF00,
                orange: 0xFF8800,
                purple: 0xFF00FF
            },
            deuteranopia: {
                red: 0xFFAA00, // Orange instead of red
                green: 0x0088FF, // Blue instead of green
                blue: 0x0000FF,
                yellow: 0xFFFF00,
                orange: 0xFF6600,
                purple: 0xAA00FF
            },
            protanopia: {
                red: 0xFFDD00,
                green: 0x0077FF,
                blue: 0x0000FF,
                yellow: 0xFFFF00,
                orange: 0xFF9900,
                purple: 0xBB00FF
            },
            tritanopia: {
                red: 0xFF0066,
                green: 0x00FF66,
                blue: 0xFF00FF,
                yellow: 0xFFFF88,
                orange: 0xFF8866,
                purple: 0xFF0088
            }
        };

        return palettes[mode] || palettes.none;
    }

    // High contrast mode
    setHighContrast(enabled) {
        const a11y = gameData.data.accessibility;
        a11y.highContrast = enabled;

        if (!this.scene) {
            gameData.save();
            return;
        }

        if (enabled) {
            // Increase contrast
            a11y.backgroundColor = '#000000';
            this.scene.cameras.main.setBackgroundColor('#000000');

            // Make UI elements more visible
            // In a real implementation, this would update all UI elements
        } else {
            a11y.backgroundColor = '#1a1a2e';
            this.scene.cameras.main.setBackgroundColor('#1a1a2e');
        }

        gameData.save();
    }

    // Text scaling
    setTextScale(scale) {
        const a11y = gameData.data.accessibility;
        a11y.textScale = Math.max(0.5, Math.min(2.0, scale));

        if (this.scene) {
            // Update all text objects
            // In a real implementation, this would iterate through all text
            this.updateAllTextScaling();
        }

        gameData.save();
    }

    updateAllTextScaling() {
        if (!this.scene) return;

        const scale = gameData.data.accessibility.textScale;

        // This would update all text objects in the scene
        // Example: this.scene.children.list.forEach(child => {
        //     if (child.type === 'Text') {
        //         child.setScale(scale);
        //     }
        // });
    }

    // UI scaling
    setUIScale(scale) {
        const a11y = gameData.data.accessibility;
        a11y.uiScale = Math.max(0.5, Math.min(2.0, scale));

        if (this.scene) {
            this.updateAllUIScaling();
        }

        gameData.save();
    }

    updateAllUIScaling() {
        // Update all UI elements with new scale
    }

    // Reduced motion
    setReducedMotion(enabled) {
        const a11y = gameData.data.accessibility;
        a11y.reducedMotion = enabled;

        if (enabled) {
            a11y.screenShake = false;
            a11y.cameraShake = false;
            a11y.animationSpeed = 0.5;
            a11y.particleEffects = false;
        }

        gameData.save();
    }

    // Screen shake
    setScreenShake(enabled) {
        const a11y = gameData.data.accessibility;
        a11y.screenShake = enabled;
        a11y.cameraShake = enabled;
        gameData.save();
    }

    // Flashing effects
    setFlashingEffects(enabled) {
        const a11y = gameData.data.accessibility;
        a11y.flashingEffects = enabled;
        gameData.save();
    }

    // Subtitles
    setSubtitles(enabled) {
        const a11y = gameData.data.accessibility;
        a11y.subtitles = enabled;
        gameData.save();
    }

    // Sound visualization (visual indicators for audio events)
    setSoundVisualization(enabled) {
        const a11y = gameData.data.accessibility;
        a11y.soundVisualization = enabled;
        gameData.save();
    }

    // One-handed mode
    setOneHandedMode(enabled) {
        const a11y = gameData.data.accessibility;
        a11y.oneHandedMode = enabled;

        if (enabled) {
            // Rearrange controls for one-handed play
            // Enable auto-aim
            a11y.autoAim = true;
            a11y.aimAssist = 50;
        }

        gameData.save();
    }

    // Auto-aim
    setAutoAim(enabled) {
        const a11y = gameData.data.accessibility;
        a11y.autoAim = enabled;
        gameData.save();
    }

    // Aim assist (0-100)
    setAimAssist(value) {
        const a11y = gameData.data.accessibility;
        a11y.aimAssist = Math.max(0, Math.min(100, value));
        gameData.save();
    }

    // Game speed (0.25 - 2.0)
    setGameSpeed(speed) {
        const a11y = gameData.data.accessibility;
        a11y.gameSpeed = Math.max(0.25, Math.min(2.0, speed));

        if (this.scene && this.scene.physics) {
            this.scene.physics.world.timeScale = 1 / speed;
        }

        gameData.save();
    }

    // Difficulty assist
    setDifficultyAssist(enabled) {
        const a11y = gameData.data.accessibility;
        a11y.difficultyAssist = enabled;

        if (enabled) {
            // Make game easier
            a11y.autoCollect = true;
            // Increase player health, etc.
        }

        gameData.save();
    }

    // Auto-collect items
    setAutoCollect(enabled) {
        const a11y = gameData.data.accessibility;
        a11y.autoCollect = enabled;
        gameData.save();
    }

    // Auto-fire
    setAutoFire(enabled) {
        const a11y = gameData.data.accessibility;
        a11y.autoFire = enabled;
        gameData.save();
    }

    // Large buttons
    setLargeButtons(enabled) {
        const a11y = gameData.data.accessibility;
        a11y.largeButtons = enabled;
        gameData.save();
    }

    // Apply preset
    applyPreset(preset) {
        const a11y = gameData.data.accessibility;

        switch (preset) {
            case 'low_vision':
                // For players with low vision
                a11y.highContrast = true;
                a11y.textScale = 1.5;
                a11y.uiScale = 1.5;
                a11y.largeButtons = true;
                a11y.tooltips = true;
                a11y.readableFont = true;
                break;

            case 'motor':
                // For players with motor difficulties
                a11y.oneHandedMode = true;
                a11y.autoAim = true;
                a11y.aimAssist = 75;
                a11y.autoCollect = true;
                a11y.autoFire = true;
                a11y.gameSpeed = 0.75;
                a11y.buttonHoldTime = 1.0;
                a11y.largeButtons = true;
                break;

            case 'hearing':
                // For players with hearing difficulties
                a11y.subtitles = true;
                a11y.soundVisualization = true;
                a11y.monoAudio = true;
                a11y.hapticFeedback = true;
                break;

            case 'cognitive':
                // For players with cognitive difficulties
                a11y.gameSpeed = 0.5;
                a11y.reducedMotion = true;
                a11y.flashingEffects = false;
                a11y.particleEffects = false;
                a11y.tooltips = true;
                a11y.confirmDialogs = true;
                a11y.difficultyAssist = true;
                a11y.autoCollect = true;
                break;

            case 'default':
            default:
                // Reset to defaults
                this.resetToDefaults();
                return;
        }

        a11y.preset = preset;
        gameData.save();

        // Apply visual changes
        this.applyAllSettings();
    }

    // Reset to defaults
    resetToDefaults() {
        gameData.data.accessibility = {
            colorblindMode: 'none',
            highContrast: false,
            textScale: 1.0,
            uiScale: 1.0,
            flashingEffects: true,
            screenShake: true,
            particleEffects: true,
            backgroundColor: '#1a1a2e',
            reducedMotion: false,
            cameraShake: true,
            animationSpeed: 1.0,
            subtitles: false,
            audioDescription: false,
            soundVisualization: false,
            monoAudio: false,
            oneHandedMode: false,
            autoAim: false,
            aimAssist: 0,
            hapticFeedback: true,
            buttonHoldTime: 0.5,
            doubleTapTime: 0.3,
            pauseOnFocusLoss: true,
            gameSpeed: 1.0,
            difficultyAssist: false,
            autoCollect: false,
            autoFire: false,
            largeButtons: false,
            tooltips: true,
            confirmDialogs: true,
            readableFont: false,
            preset: 'default'
        };

        gameData.save();
        this.applyAllSettings();
    }

    // Apply all settings
    applyAllSettings() {
        const a11y = gameData.data.accessibility;

        this.applyColorblindMode(a11y.colorblindMode);
        this.setHighContrast(a11y.highContrast);
        this.setTextScale(a11y.textScale);
        this.setUIScale(a11y.uiScale);
        this.setGameSpeed(a11y.gameSpeed);
    }

    // Get accessibility settings
    getSettings() {
        return { ...gameData.data.accessibility };
    }

    // Get preset descriptions
    getPresets() {
        return {
            default: {
                name: 'Default',
                description: 'Standard settings',
                icon: '⚙️'
            },
            low_vision: {
                name: 'Low Vision',
                description: 'High contrast, large text',
                icon: '👁️'
            },
            motor: {
                name: 'Motor',
                description: 'One-handed, auto-aim',
                icon: '🎮'
            },
            hearing: {
                name: 'Hearing',
                description: 'Subtitles, sound visualization',
                icon: '🔊'
            },
            cognitive: {
                name: 'Cognitive',
                description: 'Slower pace, reduced motion',
                icon: '🧠'
            }
        };
    }

    // Screen reader announcements
    announce(message, priority = 'polite') {
        // In a real implementation, this would use ARIA live regions
        console.log(`[Screen Reader - ${priority}]:`, message);

        // Could also show on-screen text for deaf players
        if (gameData.data.accessibility.soundVisualization) {
            this.showVisualAnnouncement(message);
        }
    }

    // Visual announcement
    showVisualAnnouncement(message) {
        if (!this.scene) return;

        // Show text at top of screen
        const text = this.scene.add.text(
            this.scene.cameras.main.centerX,
            50,
            message,
            {
                fontSize: '24px',
                backgroundColor: '#000000',
                padding: { x: 20, y: 10 }
            }
        ).setOrigin(0.5).setScrollFactor(0).setDepth(10000);

        // Fade out after 3 seconds
        this.scene.tweens.add({
            targets: text,
            alpha: 0,
            duration: 500,
            delay: 3000,
            onComplete: () => text.destroy()
        });
    }

    // Haptic feedback
    vibrate(pattern = [100]) {
        const a11y = gameData.data.accessibility;

        if (!a11y.hapticFeedback) return;

        // In a real implementation on mobile
        if (navigator.vibrate) {
            navigator.vibrate(pattern);
        }
    }

    // Visual indicator for sounds
    showSoundIndicator(soundType, position) {
        if (!gameData.data.accessibility.soundVisualization) return;
        if (!this.scene) return;

        const indicators = {
            enemy: { color: 0xFF0000, icon: '❗' },
            powerup: { color: 0x00FF00, icon: '⭐' },
            damage: { color: 0xFF8800, icon: '💥' },
            achievement: { color: 0xFFD700, icon: '🏆' }
        };

        const indicator = indicators[soundType] || { color: 0xFFFFFF, icon: '🔊' };

        const circle = this.scene.add.circle(
            position.x,
            position.y,
            30,
            indicator.color,
            0.5
        ).setDepth(9999);

        const text = this.scene.add.text(
            position.x,
            position.y,
            indicator.icon,
            { fontSize: '24px' }
        ).setOrigin(0.5).setDepth(10000);

        // Fade and expand
        this.scene.tweens.add({
            targets: [circle, text],
            alpha: 0,
            scale: 2,
            duration: 1000,
            onComplete: () => {
                circle.destroy();
                text.destroy();
            }
        });
    }

    // Check if feature is enabled
    isEnabled(feature) {
        return gameData.data.accessibility[feature] || false;
    }

    // Get effective difficulty multiplier
    getDifficultyMultiplier() {
        const a11y = gameData.data.accessibility;
        let multiplier = 1.0;

        if (a11y.difficultyAssist) multiplier *= 0.7;
        if (a11y.autoAim) multiplier *= 0.9;
        if (a11y.gameSpeed < 1.0) multiplier *= a11y.gameSpeed;

        return multiplier;
    }
}

export default AccessibilitySystem;
