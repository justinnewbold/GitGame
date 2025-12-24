/**
 * PauseMenu - In-game pause menu with resume, settings, and quit options
 * Can be toggled with ESC or P keys
 */

import { logger } from './Logger.js';
import { haptics } from './HapticFeedback.js';
import { gameData } from './GameData.js';

/**
 * @typedef {Object} PauseMenuConfig
 * @property {string} [toggleKey='ESC'] - Key to toggle pause menu
 * @property {boolean} [showSettings=true] - Whether to show settings options
 * @property {boolean} [showStats=true] - Whether to show current game stats
 * @property {Function} [onResume] - Callback when game resumes
 * @property {Function} [onQuit] - Callback when quitting to menu
 * @property {Function} [onRestart] - Callback for restarting the game
 * @property {Object} [stats] - Current game stats to display
 */

export default class PauseMenu {
    /**
     * Create a pause menu
     * @param {Phaser.Scene} scene - The Phaser scene
     * @param {PauseMenuConfig} config - Configuration options
     */
    constructor(scene, config = {}) {
        /** @type {Phaser.Scene} */
        this.scene = scene;
        /** @type {boolean} */
        this.isPaused = false;
        /** @type {Phaser.GameObjects.Container|null} */
        this.container = null;

        // Configuration
        this.config = {
            toggleKey: config.toggleKey || 'ESC',
            showSettings: config.showSettings !== false,
            showStats: config.showStats !== false,
            onResume: config.onResume || null,
            onQuit: config.onQuit || null,
            onRestart: config.onRestart || null,
            stats: config.stats || {}
        };

        // Settings state
        this.settings = {
            soundEnabled: gameData.getSetting('soundEnabled', true),
            musicVolume: gameData.getSetting('musicVolume', 0.5),
            sfxVolume: gameData.getSetting('sfxVolume', 0.5),
            hapticEnabled: gameData.getSetting('hapticFeedback', true)
        };

        // UI elements for settings
        this.settingsElements = {};

        // Setup keyboard listeners
        this.setupKeyboardListener();

        logger.debug('PauseMenu', 'Initialized', { scene: scene.scene.key });
    }

    /**
     * Setup keyboard listener for pause toggle
     * @private
     */
    setupKeyboardListener() {
        // ESC key
        this.scene.input.keyboard.on('keydown-ESC', () => {
            this.toggle();
        });

        // P key
        this.scene.input.keyboard.on('keydown-P', () => {
            this.toggle();
        });
    }

    /**
     * Toggle pause state
     */
    toggle() {
        if (this.isPaused) {
            this.resume();
        } else {
            this.pause();
        }
    }

    /**
     * Pause the game and show menu
     */
    pause() {
        if (this.isPaused) return;

        this.isPaused = true;
        logger.debug('PauseMenu', 'Game paused');

        // Pause physics
        if (this.scene.physics && this.scene.physics.world) {
            this.scene.physics.pause();
        }

        // Pause all tweens
        this.scene.tweens.pauseAll();

        // Pause all timers
        if (this.scene.time) {
            this.scene.time.paused = true;
        }

        // Create the pause menu UI
        this.createPauseUI();

        // Haptic feedback
        haptics.medium();

        // Play sound
        if (this.scene.sounds) {
            this.scene.sounds.playSound('menu');
        }
    }

    /**
     * Resume the game
     */
    resume() {
        if (!this.isPaused) return;

        this.isPaused = false;
        logger.debug('PauseMenu', 'Game resumed');

        // Animate out and destroy UI
        if (this.container) {
            this.scene.tweens.add({
                targets: this.container,
                alpha: 0,
                duration: 150,
                onComplete: () => {
                    if (this.container) {
                        this.container.destroy();
                        this.container = null;
                    }
                }
            });
        }

        // Resume physics
        if (this.scene.physics && this.scene.physics.world) {
            this.scene.physics.resume();
        }

        // Resume tweens
        this.scene.tweens.resumeAll();

        // Resume timers
        if (this.scene.time) {
            this.scene.time.paused = false;
        }

        // Haptic feedback
        haptics.light();

        // Callback
        if (this.config.onResume) {
            this.config.onResume();
        }
    }

    /**
     * Create the pause menu UI
     * @private
     */
    createPauseUI() {
        const width = this.scene.cameras.main.width;
        const height = this.scene.cameras.main.height;

        // Container for all elements
        this.container = this.scene.add.container(0, 0);
        this.container.setDepth(10000);
        this.container.setScrollFactor(0);
        this.container.setAlpha(0);

        // Semi-transparent background
        const bg = this.scene.add.rectangle(0, 0, width, height, 0x000000, 0.8);
        bg.setOrigin(0);
        bg.setInteractive(); // Block input to game below

        // Panel dimensions
        const panelWidth = Math.min(400, width - 40);
        const panelHeight = this.config.showSettings ? 450 : 300;

        // Panel background
        const panel = this.scene.add.rectangle(width / 2, height / 2, panelWidth, panelHeight, 0x1a1a2e, 1);
        panel.setStrokeStyle(3, 0x00ff00);

        // "PAUSED" title
        const title = this.scene.add.text(width / 2, height / 2 - panelHeight / 2 + 40, 'PAUSED', {
            fontSize: '32px',
            fontFamily: 'monospace',
            color: '#00ff00',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Current stats (if enabled and stats provided)
        let yOffset = height / 2 - panelHeight / 2 + 80;

        const elements = [bg, panel, title];

        if (this.config.showStats && Object.keys(this.config.stats).length > 0) {
            const statsTitle = this.scene.add.text(width / 2, yOffset, '--- Current Stats ---', {
                fontSize: '12px',
                fontFamily: 'monospace',
                color: '#888888'
            }).setOrigin(0.5);
            elements.push(statsTitle);
            yOffset += 20;

            Object.entries(this.config.stats).forEach(([key, value]) => {
                const statText = this.scene.add.text(width / 2, yOffset, `${key}: ${value}`, {
                    fontSize: '14px',
                    fontFamily: 'monospace',
                    color: '#ffffff'
                }).setOrigin(0.5);
                elements.push(statText);
                yOffset += 20;
            });
            yOffset += 10;
        }

        // Settings section (if enabled)
        if (this.config.showSettings) {
            const settingsDivider = this.scene.add.rectangle(width / 2, yOffset, panelWidth - 60, 1, 0x444444);
            elements.push(settingsDivider);
            yOffset += 20;

            // Sound toggle
            const soundLabel = this.scene.add.text(width / 2 - 80, yOffset, 'Sound:', {
                fontSize: '14px',
                fontFamily: 'monospace',
                color: '#ffffff'
            });
            const soundToggle = this.createToggleButton(width / 2 + 50, yOffset, this.settings.soundEnabled, (enabled) => {
                this.settings.soundEnabled = enabled;
                gameData.setSetting('soundEnabled', enabled);
                if (this.scene.sounds) {
                    this.scene.sounds.setEnabled(enabled);
                }
            });
            elements.push(soundLabel, ...soundToggle);
            yOffset += 35;

            // Haptic feedback toggle (for mobile)
            const hapticLabel = this.scene.add.text(width / 2 - 80, yOffset, 'Vibration:', {
                fontSize: '14px',
                fontFamily: 'monospace',
                color: '#ffffff'
            });
            const hapticToggle = this.createToggleButton(width / 2 + 50, yOffset, this.settings.hapticEnabled, (enabled) => {
                this.settings.hapticEnabled = enabled;
                gameData.setSetting('hapticFeedback', enabled);
                haptics.setEnabled(enabled);
                if (enabled) haptics.light();
            });
            elements.push(hapticLabel, ...hapticToggle);
            yOffset += 40;
        }

        // Buttons section
        const buttonDivider = this.scene.add.rectangle(width / 2, yOffset, panelWidth - 60, 1, 0x444444);
        elements.push(buttonDivider);
        yOffset += 30;

        // Resume button
        const resumeBtn = this.createButton(width / 2, yOffset, '[ RESUME ]', '#00ff00', () => {
            this.resume();
        });
        elements.push(resumeBtn);
        yOffset += 40;

        // Restart button (if callback provided)
        if (this.config.onRestart) {
            const restartBtn = this.createButton(width / 2, yOffset, '[ RESTART ]', '#ffaa00', () => {
                this.isPaused = false;
                if (this.container) {
                    this.container.destroy();
                    this.container = null;
                }
                this.config.onRestart();
            });
            elements.push(restartBtn);
            yOffset += 40;
        }

        // Quit button
        const quitBtn = this.createButton(width / 2, yOffset, '[ QUIT TO MENU ]', '#ff6666', () => {
            this.isPaused = false;
            if (this.container) {
                this.container.destroy();
                this.container = null;
            }
            if (this.config.onQuit) {
                this.config.onQuit();
            } else {
                this.scene.scene.start('MainMenuScene');
            }
        });
        elements.push(quitBtn);

        // Hint text at bottom
        const hintText = this.scene.add.text(width / 2, height / 2 + panelHeight / 2 - 25, 'Press ESC or P to resume', {
            fontSize: '11px',
            fontFamily: 'monospace',
            color: '#666666',
            fontStyle: 'italic'
        }).setOrigin(0.5);
        elements.push(hintText);

        // Add all elements to container
        this.container.add(elements);

        // Fade in animation
        this.scene.tweens.add({
            targets: this.container,
            alpha: 1,
            duration: 150,
            ease: 'Power2'
        });
    }

    /**
     * Create a styled button
     * @private
     */
    createButton(x, y, text, color, callback) {
        const btn = this.scene.add.text(x, y, text, {
            fontSize: '16px',
            fontFamily: 'monospace',
            color: color,
            fontStyle: 'bold'
        }).setOrigin(0.5);

        btn.setInteractive({ useHandCursor: true });

        btn.on('pointerover', () => {
            btn.setScale(1.1);
            btn.setColor('#ffffff');
        });

        btn.on('pointerout', () => {
            btn.setScale(1);
            btn.setColor(color);
        });

        btn.on('pointerdown', () => {
            haptics.button();
            callback();
        });

        return btn;
    }

    /**
     * Create a toggle button for settings
     * @private
     */
    createToggleButton(x, y, initialValue, onChange) {
        const elements = [];

        // Background box
        const bgWidth = 60;
        const bgHeight = 24;
        const bg = this.scene.add.rectangle(x, y, bgWidth, bgHeight, 0x333333);
        bg.setStrokeStyle(1, 0x666666);
        elements.push(bg);

        // Toggle indicator
        const indicator = this.scene.add.rectangle(
            initialValue ? x + bgWidth / 4 : x - bgWidth / 4,
            y,
            bgWidth / 2 - 4,
            bgHeight - 4,
            initialValue ? 0x00ff00 : 0x666666
        );
        elements.push(indicator);

        // State text
        const stateText = this.scene.add.text(x, y, initialValue ? 'ON' : 'OFF', {
            fontSize: '10px',
            fontFamily: 'monospace',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        elements.push(stateText);

        // Make interactive
        bg.setInteractive({ useHandCursor: true });
        let currentValue = initialValue;

        bg.on('pointerdown', () => {
            currentValue = !currentValue;

            // Animate toggle
            this.scene.tweens.add({
                targets: indicator,
                x: currentValue ? x + bgWidth / 4 : x - bgWidth / 4,
                duration: 100
            });

            indicator.setFillStyle(currentValue ? 0x00ff00 : 0x666666);
            stateText.setText(currentValue ? 'ON' : 'OFF');

            haptics.light();
            onChange(currentValue);
        });

        return elements;
    }

    /**
     * Update stats displayed in pause menu
     * @param {Object} stats - New stats to display
     */
    updateStats(stats) {
        this.config.stats = stats;
    }

    /**
     * Check if the game is currently paused
     * @returns {boolean}
     */
    getIsPaused() {
        return this.isPaused;
    }

    /**
     * Cleanup resources
     */
    destroy() {
        if (this.container) {
            this.container.destroy();
            this.container = null;
        }
        this.isPaused = false;
    }
}
