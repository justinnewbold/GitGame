import Phaser from 'phaser';
import { gameData } from '../utils/GameData.js';
import { logger } from '../utils/Logger.js';
import PerformanceMonitor from '../utils/PerformanceMonitor.js';
import InputManager from '../utils/InputManager.js';
import SceneTransitionManager from '../utils/SceneTransitionManager.js';
import AchievementNotification from '../utils/AchievementNotification.js';
import HelpOverlay from '../utils/HelpOverlay.js';
import PauseMenu from '../utils/PauseMenu.js';
import { errorHandler } from '../utils/ErrorHandler.js';
// New integrated systems
import AchievementSystem from '../utils/AchievementSystem.js';
import { challengeSystem } from '../utils/ChallengeSystem.js';
import { analyticsSystem } from '../utils/AnalyticsSystem.js';
import { cosmeticsSystem } from '../utils/CosmeticsSystem.js';
import ReplaySystem from '../utils/ReplaySystem.js';

/**
 * BaseScene - Common functionality for all game scenes
 * Provides standardized methods for:
 * - Back buttons
 * - Scene transitions
 * - Resource cleanup
 * - HUD elements
 * - Optional utilities (InputManager, PerformanceMonitor, etc.)
 *
 * Enable utilities via config:
 * constructor() {
 *     super({ key: 'MyScene', enableInput: true, enablePerformance: true });
 * }
 */
export default class BaseScene extends Phaser.Scene {
    constructor(config) {
        super(config);
        this.timers = [];
        this.tweens = [];
        this.sounds = null;

        // Store config for utility initialization
        this.config = config;
        this.enableInput = config.enableInput || false;
        this.enablePerformance = config.enablePerformance || false;
        this.enableTransitions = config.enableTransitions !== false; // Default true
        this.enableAchievements = config.enableAchievements !== false; // Default true
        this.enableHelp = config.enableHelp !== false; // Default true
        this.enablePauseMenu = config.enablePauseMenu || false; // Pause menu disabled by default
        this.helpConfig = config.helpConfig || {}; // Custom help config
        this.pauseMenuConfig = config.pauseMenuConfig || {}; // Custom pause menu config

        // Utility instances
        this.inputManager = null;
        this.performanceMonitor = null;
        this.transitionManager = null;
        this.achievementNotification = null;
        this.helpOverlay = null;
        this.pauseMenu = null;

        // Integrated game systems
        this.achievementSystem = null;
        this.replaySystem = null;
        this.gameStats = {
            score: 0,
            kills: 0,
            combo: 0,
            maxCombo: 0,
            powerups: 0,
            damageTaken: 0,
            time: 0,
            startTime: 0
        };
    }

    /**
     * Initialize utilities based on config
     * Call this in your scene's create() method: this.initUtilities()
     */
    initUtilities() {
        try {
            // Initialize InputManager if enabled
            if (this.enableInput && !this.inputManager) {
                this.inputManager = new InputManager(this);
                logger.debug('BaseScene', 'InputManager initialized', { scene: this.scene.key });
            }

            // Initialize PerformanceMonitor if enabled
            if (this.enablePerformance && !this.performanceMonitor) {
                this.performanceMonitor = new PerformanceMonitor(this, {
                    showOverlay: true,
                    trackMemory: true
                });
                logger.debug('BaseScene', 'PerformanceMonitor initialized', { scene: this.scene.key });
            }

            // Initialize SceneTransitionManager if enabled
            if (this.enableTransitions && !this.transitionManager) {
                this.transitionManager = new SceneTransitionManager(this);
                logger.debug('BaseScene', 'SceneTransitionManager initialized', { scene: this.scene.key });
            }

            // Initialize AchievementNotification if enabled
            if (this.enableAchievements && !this.achievementNotification) {
                this.achievementNotification = new AchievementNotification(this);
                logger.debug('BaseScene', 'AchievementNotification initialized', { scene: this.scene.key });
            }

            // Initialize HelpOverlay if enabled
            if (this.enableHelp && !this.helpOverlay) {
                this.helpOverlay = new HelpOverlay(this, this.helpConfig);
                logger.debug('BaseScene', 'HelpOverlay initialized', { scene: this.scene.key });
            }

            // Initialize PauseMenu if enabled
            if (this.enablePauseMenu && !this.pauseMenu) {
                const defaultPauseConfig = {
                    onQuit: () => this.transitionToScene('MainMenuScene'),
                    onRestart: () => this.scene.restart()
                };
                this.pauseMenu = new PauseMenu(this, { ...defaultPauseConfig, ...this.pauseMenuConfig });
                logger.debug('BaseScene', 'PauseMenu initialized', { scene: this.scene.key });
            }

            // Initialize integrated game systems
            this.achievementSystem = new AchievementSystem(this);
            this.replaySystem = new ReplaySystem(this);
            logger.debug('BaseScene', 'Game systems initialized', { scene: this.scene.key });
        } catch (error) {
            logger.error('BaseScene', 'Error initializing utilities', { error });
            errorHandler.handleError(error, 'BaseScene.initUtilities');
        }
    }

    /**
     * Start tracking a game session
     * Call this at the beginning of gameplay
     */
    startGameSession() {
        const gameMode = this.scene.key;
        this.gameStats = {
            score: 0,
            kills: 0,
            combo: 0,
            maxCombo: 0,
            powerups: 0,
            damageTaken: 0,
            time: 0,
            startTime: Date.now()
        };

        // Start analytics session
        analyticsSystem.startSession(gameMode);

        // Start replay recording
        if (this.replaySystem) {
            this.replaySystem.startRecording(gameMode);
        }

        logger.info('BaseScene', `Game session started: ${gameMode}`);
    }

    /**
     * Update game stats during gameplay
     * Call this in your update loop or when stats change
     */
    updateGameStats(stats) {
        Object.assign(this.gameStats, stats);
        this.gameStats.maxCombo = Math.max(this.gameStats.maxCombo, this.gameStats.combo || 0);
        this.gameStats.time = Date.now() - this.gameStats.startTime;

        // Update analytics
        analyticsSystem.updateSession({
            score: this.gameStats.score,
            kills: this.gameStats.kills,
            powerups: this.gameStats.powerups,
            combo: this.gameStats.maxCombo,
            damage: this.gameStats.damageTaken
        });

        // Record replay frame
        if (this.replaySystem && this.player) {
            this.replaySystem.recordFrame({
                playerX: this.player.x,
                playerY: this.player.y,
                playerHealth: this.player.health || 100,
                score: this.gameStats.score
            });
        }
    }

    /**
     * End game session and process all systems
     * Call this when the game ends (death, victory, quit)
     */
    endGameSession(finalScore = null) {
        if (finalScore !== null) {
            this.gameStats.score = finalScore;
        }
        this.gameStats.time = Date.now() - this.gameStats.startTime;

        const gameMode = this.scene.key;
        const gameStats = {
            score: this.gameStats.score,
            time: Math.floor(this.gameStats.time / 1000), // Convert to seconds
            kills: this.gameStats.kills,
            combo: this.gameStats.maxCombo,
            powerups: this.gameStats.powerups,
            damageTaken: this.gameStats.damageTaken,
            gameMode: gameMode
        };

        // Check achievements
        if (this.achievementSystem) {
            this.achievementSystem.checkAchievements(gameStats);
        }

        // Update challenge progress
        challengeSystem.updateProgress(gameStats);

        // End analytics session
        analyticsSystem.endSession();

        // Stop replay recording
        if (this.replaySystem) {
            this.replaySystem.stopRecording(this.gameStats.score);
        }

        // Award currency based on score
        const currencyReward = cosmeticsSystem.calculateReward(this.gameStats.score);
        if (currencyReward > 0) {
            cosmeticsSystem.addCurrency(currencyReward);
        }

        logger.info('BaseScene', `Game session ended: ${gameMode}`, gameStats);
    }

    /**
     * Record a game event (kill, damage, powerup collected, etc.)
     */
    recordGameEvent(eventType, eventData = {}) {
        if (this.replaySystem) {
            this.replaySystem.recordEvent(eventType, eventData);
        }
        analyticsSystem.recordEvent(eventType, eventData);
    }

    /**
     * Update utilities (call this in your scene's update() method)
     */
    updateUtilities() {
        try {
            if (this.performanceMonitor) {
                this.performanceMonitor.update();
            }

            if (this.inputManager) {
                this.inputManager.update();
            }
        } catch (error) {
            logger.error('BaseScene', 'Error updating utilities', { error });
        }
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
     * @param {Object} data - Optional data to pass to target scene
     */
    transitionToScene(sceneName, fadeTime = 250, data = {}) {
        // Use SceneTransitionManager if available
        if (this.transitionManager) {
            this.transitionManager.quickFade(sceneName, data);
        } else {
            // Fallback to simple fade
            this.cameras.main.fade(fadeTime, 0, 0, 0);
            this.time.delayedCall(fadeTime, () => {
                this.scene.start(sceneName, data);
            });
        }
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

        // Clean up utilities
        if (this.inputManager && typeof this.inputManager.destroy === 'function') {
            this.inputManager.destroy();
            this.inputManager = null;
        }

        if (this.performanceMonitor && typeof this.performanceMonitor.destroy === 'function') {
            this.performanceMonitor.destroy();
            this.performanceMonitor = null;
        }

        if (this.pauseMenu && typeof this.pauseMenu.destroy === 'function') {
            this.pauseMenu.destroy();
            this.pauseMenu = null;
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

        // End game session and process all integrated systems
        this.endGameSession(score);

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
