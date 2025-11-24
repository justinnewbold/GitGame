/**
 * BaseScene - Abstract base class for all game scenes
 * Provides common functionality and reduces code duplication
 */

import Phaser from 'phaser';
import UIFactory from '../ui/factories/UIFactory.js';
import EventBus from './EventBus.js';
import ServiceLocator from './ServiceLocator.js';
import { COLORS, GAME_CONFIG, DIFFICULTY, EVENTS } from '../constants/GameConstants.js';

export default class BaseScene extends Phaser.Scene {
    constructor(config) {
        super(config);
        this.ui = null;
        this.sounds = null;
        this.particles = null;
        this.eventHandlers = [];
    }

    /**
     * Standard initialization - call from child classes
     * @param {Object} data - Scene data passed from previous scene
     */
    baseInit(data = {}) {
        this.sceneData = data;

        // Common game state
        this.isGameOver = false;
        this.isPaused = false;

        // Get difficulty multiplier
        const difficulty = this.getDifficulty();
        this.difficultyMult = DIFFICULTY.MULTIPLIERS[difficulty] || 1.0;
    }

    /**
     * Standard create - call from child classes
     */
    baseCreate() {
        // Initialize UI factory
        this.ui = new UIFactory(this);

        // Get services from ServiceLocator
        this.sounds = ServiceLocator.get('soundManager');
        this.particles = ServiceLocator.get('particleEffects');
        this.music = ServiceLocator.get('musicManager');

        // Set up dimensions
        this.width = this.cameras.main.width;
        this.height = this.cameras.main.height;

        // Create standard background
        this.createBackground();
    }

    /**
     * Create standard background
     * Can be overridden in child classes
     */
    createBackground() {
        this.add.rectangle(0, 0, this.width, this.height, COLORS.BACKGROUND).setOrigin(0);
    }

    /**
     * Get current difficulty setting
     * @returns {string} Difficulty level
     */
    getDifficulty() {
        const gameData = ServiceLocator.get('gameData');
        return gameData ? gameData.getDifficulty() : DIFFICULTY.NORMAL;
    }

    /**
     * Get game data manager
     * @returns {Object} GameData instance
     */
    getGameData() {
        return ServiceLocator.get('gameData');
    }

    /**
     * Update stat through GameData
     * @param {string} path - Stat path (e.g., 'gitSurvivor.gamesPlayed')
     * @param {*} value - Value to update
     * @param {string} operation - Operation type ('set', 'increment', 'max')
     */
    updateStat(path, value, operation = 'set') {
        try {
            const gameData = this.getGameData();
            if (gameData) {
                gameData.updateStat(path, value, operation);
            }
        } catch (error) {
            console.error(`BaseScene: Failed to update stat '${path}':`, error);
        }
    }

    /**
     * Subscribe to an event (automatically cleaned up on scene shutdown)
     * @param {string} eventName - Event identifier
     * @param {Function} callback - Event handler
     * @param {Object} context - Context for callback
     */
    on(eventName, callback, context = this) {
        EventBus.on(eventName, callback, context);
        this.eventHandlers.push({ eventName, callback });
    }

    /**
     * Emit a global event
     * @param {string} eventName - Event identifier
     * @param {*} data - Event data
     */
    emit(eventName, data = null) {
        EventBus.emit(eventName, data);
    }

    /**
     * Transition to another scene with fade effect
     * @param {string} targetScene - Scene to transition to
     * @param {Object} data - Data to pass to next scene
     * @param {number} duration - Fade duration
     */
    transitionTo(targetScene, data = {}, duration = GAME_CONFIG.SCENE_FADE_DURATION) {
        try {
            this.cameras.main.fade(duration, 0, 0, 0);
            this.time.delayedCall(duration, () => {
                this.scene.start(targetScene, data);
            });
        } catch (error) {
            console.error(`BaseScene: Failed to transition to ${targetScene}:`, error);
            // Fallback: direct transition
            this.scene.start(targetScene, data);
        }
    }

    /**
     * Show achievement notification
     * @param {Object} achievement - Achievement object
     */
    showAchievement(achievement) {
        if (!achievement) return;

        const achievementBox = this.add.rectangle(
            this.width - 150,
            100,
            280,
            60,
            COLORS.OVERLAY,
            0.9
        );
        achievementBox.setStrokeStyle(2, COLORS.ACCENT);
        achievementBox.setDepth(GAME_CONFIG.DEPTH.DIALOG);

        const achievementText = this.add.text(
            this.width - 150,
            90,
            '🏆 Achievement Unlocked!',
            {
                fontSize: '12px',
                fontFamily: 'monospace',
                color: '#ffaa00',
                fontStyle: 'bold'
            }
        );
        achievementText.setOrigin(0.5);
        achievementText.setDepth(GAME_CONFIG.DEPTH.DIALOG + 1);

        const achievementName = this.add.text(
            this.width - 150,
            110,
            `${achievement.icon} ${achievement.name}`,
            {
                fontSize: '14px',
                fontFamily: 'monospace',
                color: '#ffffff'
            }
        );
        achievementName.setOrigin(0.5);
        achievementName.setDepth(GAME_CONFIG.DEPTH.DIALOG + 1);

        if (this.sounds) {
            this.sounds.playSound('upgrade');
        }

        this.time.delayedCall(GAME_CONFIG.ACHIEVEMENT_DISPLAY_DURATION, () => {
            this.tweens.add({
                targets: [achievementBox, achievementText, achievementName],
                alpha: 0,
                duration: 500,
                onComplete: () => {
                    achievementBox.destroy();
                    achievementText.destroy();
                    achievementName.destroy();
                }
            });
        });
    }

    /**
     * Show floating text notification
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string} text - Text to display
     * @param {string} color - Text color
     * @param {string} fontSize - Font size
     */
    showFloatingText(x, y, text, color = '#ffffff', fontSize = '14px') {
        const floatingText = this.add.text(x, y, text, {
            fontSize: fontSize,
            fontFamily: 'monospace',
            color: color,
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 3
        });
        floatingText.setOrigin(0.5);
        floatingText.setDepth(GAME_CONFIG.DEPTH.UI);

        this.tweens.add({
            targets: floatingText,
            y: y - 40,
            alpha: 0,
            duration: 1500,
            onComplete: () => floatingText.destroy()
        });
    }

    /**
     * Pause the game
     */
    pauseGame() {
        this.isPaused = true;
        this.physics.pause();
        this.emit(EVENTS.GAME_PAUSE);
    }

    /**
     * Resume the game
     */
    resumeGame() {
        this.isPaused = false;
        this.physics.resume();
        this.emit(EVENTS.GAME_RESUME);
    }

    /**
     * Standard shutdown - cleans up resources
     * Override in child classes but call super.shutdown()
     */
    shutdown() {
        // Clean up event listeners
        this.eventHandlers.forEach(({ eventName, callback }) => {
            EventBus.off(eventName, callback);
        });
        this.eventHandlers = [];

        // Clean up timers
        if (this.time) {
            this.time.removeAllEvents();
        }

        // Clean up tweens
        if (this.tweens) {
            this.tweens.killAll();
        }
    }

    /**
     * Called when scene is destroyed
     */
    destroy() {
        this.shutdown();
        super.destroy();
    }
}
