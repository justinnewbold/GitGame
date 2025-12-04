import Phaser from 'phaser';
import { gameData } from '../utils/GameData.js';

/**
 * BaseScene - Common functionality for all game scenes
 * Provides standardized methods for:
 * - Back buttons
 * - Scene transitions
 * - Resource cleanup
 * - HUD elements
 */
export default class BaseScene extends Phaser.Scene {
    constructor(config) {
        super(config);
        this.timers = [];
        this.tweens = [];
        this.sounds = null;
    }

    /**
     * Create a standardized back button
     * @param {Function} onClickCallback - Optional callback, defaults to returning to main menu
     */
    createBackButton(onClickCallback = null) {
        const backBtn = this.add.text(20, 20, '← Back to Menu', {
            fontSize: '14px',
            fontFamily: 'monospace',
            color: '#ffffff',
            backgroundColor: '#333333',
            padding: { x: 10, y: 5 }
        });

        backBtn.setInteractive({ useHandCursor: true });
        backBtn.setDepth(100); // Ensure it's above most other elements

        backBtn.on('pointerdown', () => {
            this.cleanupResources();
            if (onClickCallback) {
                onClickCallback();
            } else {
                this.transitionToScene('MainMenuScene');
            }
        });

        backBtn.on('pointerover', () => {
            backBtn.setStyle({ backgroundColor: '#555555' });
        });

        backBtn.on('pointerout', () => {
            backBtn.setStyle({ backgroundColor: '#333333' });
        });

        return backBtn;
    }

    /**
     * Create a smooth scene transition
     * @param {string} sceneName - Target scene name
     * @param {number} fadeTime - Fade duration in ms
     */
    transitionToScene(sceneName, fadeTime = 250) {
        this.cameras.main.fade(fadeTime, 0, 0, 0);
        this.time.delayedCall(fadeTime, () => {
            this.scene.start(sceneName);
        });
    }

    /**
     * Track a timer for automatic cleanup
     * @param {Phaser.Time.TimerEvent} timer
     */
    trackTimer(timer) {
        if (timer) {
            this.timers.push(timer);
        }
        return timer;
    }

    /**
     * Track a tween for automatic cleanup
     * @param {Phaser.Tweens.Tween} tween
     */
    trackTween(tween) {
        if (tween) {
            this.tweens.push(tween);
        }
        return tween;
    }

    /**
     * Clean up all tracked resources
     */
    cleanupResources() {
        // Remove all tracked timers
        this.timers.forEach(timer => {
            if (timer) {
                timer.remove();
            }
        });
        this.timers = [];

        // Stop all tracked tweens
        this.tweens.forEach(tween => {
            if (tween) {
                tween.stop();
            }
        });
        this.tweens = [];

        // Clean up sound manager if present
        if (this.sounds && typeof this.sounds.destroy === 'function') {
            this.sounds.destroy();
            this.sounds = null;
        }

        // Clean up power-up manager if present
        if (this.powerUpManager && typeof this.powerUpManager.cleanup === 'function') {
            this.powerUpManager.cleanup();
        }

        // Pause physics
        if (this.physics) {
            this.physics.pause();
        }
    }

    /**
     * Create a standard title text
     * @param {string} text
     * @param {number} y - Y position
     */
    createTitle(text, y = 20) {
        const width = this.cameras.main.width;
        return this.add.text(width / 2, y, text, {
            fontSize: '24px',
            fontFamily: 'monospace',
            color: '#00ff00',
            fontStyle: 'bold'
        }).setOrigin(0.5);
    }

    /**
     * Create game over screen
     * @param {number} score
     * @param {Object} stats - Additional stats to display
     * @param {Array} funnyMessages - Array of funny messages
     */
    createGameOver(score, stats = {}, funnyMessages = []) {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Save score
        const gameMode = this.scene.key.replace('Scene', '');
        const statKey = gameMode.charAt(0).toLowerCase() + gameMode.slice(1);

        if (gameData.data.stats[statKey]) {
            gameData.updateStat(`${statKey}.highScore`, score, 'max');
        }
        gameData.updateStat('totalScore', score, 'increment');

        // Cleanup
        this.cleanupResources();

        // Darken screen
        const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.8).setOrigin(0);
        overlay.setDepth(1000);

        // Game Over text
        this.add.text(width / 2, height / 2 - 50, 'GAME OVER', {
            fontSize: '48px',
            fontFamily: 'monospace',
            color: '#ff0000',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(1001);

        // Funny message
        if (funnyMessages.length > 0) {
            const message = Phaser.Utils.Array.GetRandom(funnyMessages);
            this.add.text(width / 2, height / 2, message, {
                fontSize: '16px',
                fontFamily: 'monospace',
                color: '#ffaa00',
                fontStyle: 'italic'
            }).setOrigin(0.5).setDepth(1001);
        }

        // Score
        this.add.text(width / 2, height / 2 + 40, `Final Score: ${score}`, {
            fontSize: '24px',
            fontFamily: 'monospace',
            color: '#00ff00'
        }).setOrigin(0.5).setDepth(1001);

        // Additional stats
        let yOffset = 70;
        for (const [key, value] of Object.entries(stats)) {
            this.add.text(width / 2, height / 2 + yOffset, `${key}: ${value}`, {
                fontSize: '16px',
                fontFamily: 'monospace',
                color: '#ffffff'
            }).setOrigin(0.5).setDepth(1001);
            yOffset += 25;
        }

        // Return button
        const restartBtn = this.add.text(width / 2, height / 2 + yOffset + 30, '[ Click to Return to Menu ]', {
            fontSize: '16px',
            fontFamily: 'monospace',
            color: '#ffffff'
        }).setOrigin(0.5).setDepth(1001);

        restartBtn.setInteractive({ useHandCursor: true });
        restartBtn.on('pointerdown', () => {
            this.scene.start('MainMenuScene');
        });

        // Play sound
        if (this.sounds && typeof this.sounds.playGameOver === 'function') {
            this.sounds.playGameOver();
        }
    }

    /**
     * Show achievement notification
     * @param {Object} achievement - Achievement object with name, icon, description
     */
    showAchievement(achievement) {
        if (!achievement) return;

        const width = this.cameras.main.width;
        const achievementBox = this.add.rectangle(width - 150, 100, 280, 60, 0x000000, 0.9);
        achievementBox.setStrokeStyle(2, 0xffaa00);
        achievementBox.setDepth(2000);

        const achievementText = this.add.text(width - 150, 90, '🏆 Achievement Unlocked!', {
            fontSize: '12px',
            fontFamily: 'monospace',
            color: '#ffaa00',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(2001);

        const achievementName = this.add.text(width - 150, 110, `${achievement.icon} ${achievement.name}`, {
            fontSize: '14px',
            fontFamily: 'monospace',
            color: '#ffffff'
        }).setOrigin(0.5).setDepth(2001);

        if (this.sounds && typeof this.sounds.playSound === 'function') {
            this.sounds.playSound('upgrade');
        }

        this.time.delayedCall(3000, () => {
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
     * Lifecycle method called when scene is shut down
     * Override in child classes but always call super.shutdown()
     */
    shutdown() {
        this.cleanupResources();
    }

    /**
     * Helper to create a styled button
     * @param {number} x
     * @param {number} y
     * @param {string} text
     * @param {Function} callback
     * @param {Object} style - Custom style overrides
     */
    createButton(x, y, text, callback, style = {}) {
        const defaultStyle = {
            fontSize: '16px',
            fontFamily: 'monospace',
            color: '#ffffff',
            backgroundColor: '#333333',
            padding: { x: 15, y: 8 }
        };

        const buttonStyle = { ...defaultStyle, ...style };
        const button = this.add.text(x, y, text, buttonStyle);
        button.setOrigin(0.5);
        button.setInteractive({ useHandCursor: true });

        button.on('pointerdown', callback);
        button.on('pointerover', () => {
            button.setStyle({ backgroundColor: style.hoverColor || '#555555' });
        });
        button.on('pointerout', () => {
            button.setStyle({ backgroundColor: style.backgroundColor || '#333333' });
        });

        return button;
    }
}
