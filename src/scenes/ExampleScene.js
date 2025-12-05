import BaseScene from './BaseScene.js';
import { logger } from '../utils/Logger.js';
import { errorHandler } from '../utils/ErrorHandler.js';
import { saveStateManager } from '../utils/SaveStateManager.js';
import { GameConfig } from '../config/GameConfig.js';

/**
 * ExampleScene - Demonstrates usage of all utilities
 *
 * This scene shows best practices for using:
 * - BaseScene with utilities
 * - InputManager for controls
 * - PerformanceMonitor for FPS tracking
 * - SceneTransitionManager for transitions
 * - Logger for debugging
 * - ErrorHandler for error management
 * - SaveStateManager for persistence
 *
 * Use this as a reference when creating your own scenes!
 */
export default class ExampleScene extends BaseScene {
    constructor() {
        super({
            key: 'ExampleScene',
            enableInput: true,          // Enable InputManager
            enablePerformance: true,    // Enable PerformanceMonitor
            enableTransitions: true     // Enable SceneTransitionManager
        });

        // Scene-specific properties
        this.player = null;
        this.score = 0;
        this.moveSpeed = 200;
    }

    create() {
        logger.info('ExampleScene', 'Scene created');

        // Initialize utilities from BaseScene
        this.initUtilities();

        // Setup input bindings
        this.setupInput();

        // Create UI
        this.createUI();

        // Create player
        this.createPlayer();

        // Setup autosave
        this.setupAutosave();

        // Create back button
        this.createBackButton(() => {
            this.transitionToScene('MainMenuScene');
        });

        // Log scene start
        logger.debug('ExampleScene', 'All systems initialized', {
            hasInput: !!this.inputManager,
            hasPerformance: !!this.performanceMonitor,
            hasTransitions: !!this.transitionManager
        });
    }

    /**
     * Setup input bindings using InputManager
     */
    setupInput() {
        if (!this.inputManager) return;

        // Bind actions to keys
        this.inputManager.bind('moveUp', ['W', 'UP']);
        this.inputManager.bind('moveDown', ['S', 'DOWN']);
        this.inputManager.bind('moveLeft', ['A', 'LEFT']);
        this.inputManager.bind('moveRight', ['D', 'RIGHT']);
        this.inputManager.bind('action', ['SPACE', 'MOUSE_LEFT']);
        this.inputManager.bind('save', ['F5']);
        this.inputManager.bind('load', ['F9']);

        logger.info('ExampleScene', 'Input bindings configured');
    }

    /**
     * Create UI elements
     */
    createUI() {
        const width = this.cameras.main.width;

        // Title
        this.createTitle('Example Scene', 50);

        // Instructions
        const instructions = [
            'Demonstrating all utilities:',
            '',
            'Movement: WASD or Arrow Keys',
            'Action: Space or Click',
            'Save: F5',
            'Load: F9',
            'Performance: F3 (toggle overlay)',
            '',
            'Check console for logger output!'
        ];

        instructions.forEach((text, index) => {
            this.add.text(width / 2, 100 + (index * 20), text, {
                fontSize: '14px',
                fontFamily: 'monospace',
                color: index === 0 ? '#00ff00' : '#ffffff',
                fontStyle: index === 0 ? 'bold' : 'normal'
            }).setOrigin(0.5);
        });

        // Score display
        this.scoreText = this.add.text(20, 60, 'Score: 0', {
            fontSize: '18px',
            fontFamily: 'monospace',
            color: '#00ff00'
        });

        // FPS display (additional to PerformanceMonitor)
        this.fpsText = this.add.text(width - 20, 60, 'FPS: 60', {
            fontSize: '14px',
            fontFamily: 'monospace',
            color: '#ffaa00'
        }).setOrigin(1, 0);
    }

    /**
     * Create player object
     */
    createPlayer() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Create player (simple circle)
        this.player = this.add.circle(
            width / 2,
            height / 2,
            GameConfig.PLAYER.RADIUS,
            GameConfig.PLAYER.COLOR
        );

        // Add physics if available
        if (this.physics && this.physics.world) {
            this.physics.add.existing(this.player);
            this.player.body.setCollideWorldBounds(true);
        }

        logger.debug('ExampleScene', 'Player created', {
            x: this.player.x,
            y: this.player.y,
            radius: GameConfig.PLAYER.RADIUS
        });
    }

    /**
     * Setup autosave using SaveStateManager
     */
    setupAutosave() {
        try {
            // Start autosave every 10 seconds
            saveStateManager.startAutoSave(this, 10000);

            logger.info('ExampleScene', 'Autosave enabled (10s interval)');
        } catch (error) {
            logger.error('ExampleScene', 'Failed to setup autosave', { error });
            errorHandler.handleError(error, 'ExampleScene.setupAutosave');
        }
    }

    update(time, delta) {
        // Update utilities (handles PerformanceMonitor and InputManager)
        this.updateUtilities();

        // Update FPS display
        if (this.fpsText && this.performanceMonitor) {
            const fps = Math.round(this.performanceMonitor.getAverageFPS());
            this.fpsText.setText(`FPS: ${fps}`);
        }

        // Handle input
        this.handleInput(delta);

        // Handle save/load
        this.handleSaveLoad();
    }

    /**
     * Handle player input using InputManager
     */
    handleInput(delta) {
        if (!this.inputManager || !this.player) return;

        // Get movement vector (normalized)
        const movement = this.inputManager.getMovementVector();

        if (movement.x !== 0 || movement.y !== 0) {
            // Calculate velocity
            const velocity = this.moveSpeed * (delta / 1000);

            // Move player
            this.player.x += movement.x * velocity;
            this.player.y += movement.y * velocity;

            // Keep player in bounds (if no physics)
            if (!this.player.body) {
                this.player.x = Phaser.Math.Clamp(
                    this.player.x,
                    GameConfig.PLAYER.RADIUS,
                    this.cameras.main.width - GameConfig.PLAYER.RADIUS
                );
                this.player.y = Phaser.Math.Clamp(
                    this.player.y,
                    GameConfig.PLAYER.RADIUS,
                    this.cameras.main.height - GameConfig.PLAYER.RADIUS
                );
            }

            // Log movement (only once per second to avoid spam)
            if (!this._lastMoveLog || Date.now() - this._lastMoveLog > 1000) {
                logger.debug('ExampleScene', 'Player moved', {
                    x: Math.round(this.player.x),
                    y: Math.round(this.player.y),
                    movement: { x: movement.x.toFixed(2), y: movement.y.toFixed(2) }
                });
                this._lastMoveLog = Date.now();
            }
        }

        // Handle action
        if (this.inputManager.justDown('action')) {
            this.handleAction();
        }
    }

    /**
     * Handle action button press
     */
    handleAction() {
        this.score += 10;
        this.scoreText.setText(`Score: ${this.score}`);

        // Create particle effect
        this.createParticleEffect(this.player.x, this.player.y);

        logger.info('ExampleScene', 'Action performed', { score: this.score });

        // Test error handling with high score
        if (this.score >= 100) {
            try {
                // Demonstrate error handling
                throw new Error('Score too high! (This is a demo error)');
            } catch (error) {
                errorHandler.handleError(error, 'ExampleScene.handleAction');
            }
        }
    }

    /**
     * Handle save/load functionality
     */
    handleSaveLoad() {
        if (!this.inputManager) return;

        // Save game
        if (this.inputManager.justDown('save')) {
            const state = {
                score: this.score,
                playerX: this.player.x,
                playerY: this.player.y,
                timestamp: Date.now()
            };

            saveStateManager.save('example-save', state);
            logger.info('ExampleScene', 'Game saved', state);

            // Show feedback
            this.showSaveFeedback('Game Saved!');
        }

        // Load game
        if (this.inputManager.justDown('load')) {
            const state = saveStateManager.load('example-save');

            if (state) {
                this.score = state.score || 0;
                this.player.x = state.playerX || this.player.x;
                this.player.y = state.playerY || this.player.y;

                this.scoreText.setText(`Score: ${this.score}`);

                logger.info('ExampleScene', 'Game loaded', state);
                this.showSaveFeedback('Game Loaded!');
            } else {
                logger.warn('ExampleScene', 'No save data found');
                this.showSaveFeedback('No Save Found', 0xff0000);
            }
        }
    }

    /**
     * Create particle effect
     */
    createParticleEffect(x, y) {
        // Simple particle effect using circles
        for (let i = 0; i < 10; i++) {
            const angle = (Math.PI * 2 * i) / 10;
            const speed = 100 + Math.random() * 100;

            const particle = this.add.circle(x, y, 3, 0x00ff00);

            this.tweens.add({
                targets: particle,
                x: x + Math.cos(angle) * speed,
                y: y + Math.sin(angle) * speed,
                alpha: 0,
                duration: 500,
                onComplete: () => particle.destroy()
            });
        }
    }

    /**
     * Show save/load feedback
     */
    showSaveFeedback(message, color = 0x00ff00) {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        const text = this.add.text(width / 2, height - 100, message, {
            fontSize: '20px',
            fontFamily: 'monospace',
            color: '#' + color.toString(16).padStart(6, '0')
        }).setOrigin(0.5);

        this.tweens.add({
            targets: text,
            alpha: 0,
            y: height - 150,
            duration: 2000,
            onComplete: () => text.destroy()
        });
    }

    /**
     * Cleanup when scene shuts down
     */
    shutdown() {
        logger.info('ExampleScene', 'Scene shutting down');

        // Stop autosave
        saveStateManager.stopAutoSave();

        // Call parent cleanup
        super.shutdown();
    }
}
