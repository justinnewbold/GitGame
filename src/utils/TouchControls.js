/**
 * TouchControls - Mobile virtual joystick and button controls
 * Provides touch-friendly input for mobile devices
 */

import Phaser from 'phaser';
import { logger } from './Logger.js';
import { gameData } from './GameData.js';

export default class TouchControls {
    constructor(scene) {
        this.scene = scene;
        this.enabled = false;
        this.container = null;

        // Joystick state
        this.joystick = null;
        this.joystickBase = null;
        this.joystickThumb = null;
        this.joystickPointer = null;
        this.joystickVector = { x: 0, y: 0 };
        this.joystickRadius = 50;

        // Action buttons
        this.actionButtons = [];
        this.buttonStates = {};

        // Check if touch device
        this.isTouchDevice = this.checkTouchDevice();

        // Settings
        this.settings = {
            joystickAlpha: 0.6,
            buttonAlpha: 0.7,
            joystickSize: 100,
            buttonSize: 60,
            deadzone: 0.1
        };
    }

    /**
     * Check if device supports touch
     */
    checkTouchDevice() {
        return 'ontouchstart' in window ||
               navigator.maxTouchPoints > 0 ||
               navigator.msMaxTouchPoints > 0;
    }

    /**
     * Initialize touch controls
     */
    create(config = {}) {
        // Only enable on touch devices or if forced
        if (!this.isTouchDevice && !config.force) {
            logger.debug('TouchControls', 'Not a touch device, skipping');
            return;
        }

        this.enabled = true;
        const { width, height } = this.scene.cameras.main;

        // Create container
        this.container = this.scene.add.container(0, 0);
        this.container.setDepth(10000);
        this.container.setScrollFactor(0);

        // Create joystick on left side
        this.createJoystick(120, height - 120);

        // Create action buttons on right side
        const buttonConfig = config.buttons || [
            { key: 'action', label: 'A', x: width - 80, y: height - 140 },
            { key: 'secondary', label: 'B', x: width - 150, y: height - 80 }
        ];

        buttonConfig.forEach(btn => {
            this.createActionButton(btn.key, btn.label, btn.x, btn.y);
        });

        // Setup input handlers
        this.setupInputHandlers();

        logger.info('TouchControls', 'Touch controls initialized');
    }

    /**
     * Create virtual joystick
     */
    createJoystick(x, y) {
        const size = this.settings.joystickSize;
        this.joystickRadius = size / 2;

        // Joystick base (outer circle)
        this.joystickBase = this.scene.add.circle(x, y, size / 2, 0x333333, 0.5);
        this.joystickBase.setStrokeStyle(3, 0x00ff00, 0.5);
        this.container.add(this.joystickBase);

        // Joystick thumb (inner circle)
        this.joystickThumb = this.scene.add.circle(x, y, size / 4, 0x00ff00, this.settings.joystickAlpha);
        this.container.add(this.joystickThumb);

        // Store base position
        this.joystickBasePos = { x, y };

        // Make base interactive for touch
        this.joystickBase.setInteractive(
            new Phaser.Geom.Circle(0, 0, size),
            Phaser.Geom.Circle.Contains
        );
    }

    /**
     * Create action button
     */
    createActionButton(key, label, x, y) {
        const size = this.settings.buttonSize;

        // Button background
        const bg = this.scene.add.circle(x, y, size / 2, 0x333333, 0.5);
        bg.setStrokeStyle(3, 0x00ff00, 0.7);
        this.container.add(bg);

        // Button label
        const text = this.scene.add.text(x, y, label, {
            fontSize: '24px',
            fontFamily: 'monospace',
            color: '#00ff00'
        });
        text.setOrigin(0.5);
        text.setAlpha(this.settings.buttonAlpha);
        this.container.add(text);

        // Make interactive
        bg.setInteractive(
            new Phaser.Geom.Circle(0, 0, size / 2),
            Phaser.Geom.Circle.Contains
        );

        // Store button reference
        const button = { bg, text, key, x, y, pressed: false };
        this.actionButtons.push(button);
        this.buttonStates[key] = false;

        // Button handlers
        bg.on('pointerdown', () => {
            button.pressed = true;
            this.buttonStates[key] = true;
            bg.setFillStyle(0x00ff00, 0.7);
            text.setColor('#000000');
        });

        bg.on('pointerup', () => {
            button.pressed = false;
            this.buttonStates[key] = false;
            bg.setFillStyle(0x333333, 0.5);
            text.setColor('#00ff00');
        });

        bg.on('pointerout', () => {
            button.pressed = false;
            this.buttonStates[key] = false;
            bg.setFillStyle(0x333333, 0.5);
            text.setColor('#00ff00');
        });

        return button;
    }

    /**
     * Setup input handlers for joystick
     */
    setupInputHandlers() {
        // Joystick pointer down
        this.joystickBase.on('pointerdown', (pointer) => {
            this.joystickPointer = pointer;
            this.updateJoystickPosition(pointer);
        });

        // Global pointer move for joystick
        this.scene.input.on('pointermove', (pointer) => {
            if (this.joystickPointer && pointer.id === this.joystickPointer.id) {
                this.updateJoystickPosition(pointer);
            }
        });

        // Global pointer up
        this.scene.input.on('pointerup', (pointer) => {
            if (this.joystickPointer && pointer.id === this.joystickPointer.id) {
                this.resetJoystick();
            }
        });
    }

    /**
     * Update joystick thumb position
     */
    updateJoystickPosition(pointer) {
        const dx = pointer.x - this.joystickBasePos.x;
        const dy = pointer.y - this.joystickBasePos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Clamp to radius
        const clampedDistance = Math.min(distance, this.joystickRadius);
        const angle = Math.atan2(dy, dx);

        // Update thumb position
        const thumbX = this.joystickBasePos.x + Math.cos(angle) * clampedDistance;
        const thumbY = this.joystickBasePos.y + Math.sin(angle) * clampedDistance;
        this.joystickThumb.setPosition(thumbX, thumbY);

        // Calculate normalized vector (-1 to 1)
        const normalizedDistance = clampedDistance / this.joystickRadius;
        this.joystickVector = {
            x: Math.cos(angle) * normalizedDistance,
            y: Math.sin(angle) * normalizedDistance
        };

        // Apply deadzone
        if (normalizedDistance < this.settings.deadzone) {
            this.joystickVector = { x: 0, y: 0 };
        }
    }

    /**
     * Reset joystick to center
     */
    resetJoystick() {
        this.joystickPointer = null;
        this.joystickThumb.setPosition(this.joystickBasePos.x, this.joystickBasePos.y);
        this.joystickVector = { x: 0, y: 0 };
    }

    /**
     * Get current joystick input
     */
    getJoystickVector() {
        return this.joystickVector;
    }

    /**
     * Check if button is pressed
     */
    isButtonPressed(key) {
        return this.buttonStates[key] || false;
    }

    /**
     * Check if button was just pressed
     */
    isButtonJustPressed(key) {
        const button = this.actionButtons.find(b => b.key === key);
        if (button && button.justPressed) {
            button.justPressed = false;
            return true;
        }
        return false;
    }

    /**
     * Get movement input (compatible with keyboard input)
     */
    getMovementInput() {
        if (!this.enabled) {
            return { x: 0, y: 0, moving: false };
        }

        const vec = this.getJoystickVector();
        return {
            x: vec.x,
            y: vec.y,
            moving: Math.abs(vec.x) > 0.1 || Math.abs(vec.y) > 0.1,
            left: vec.x < -0.3,
            right: vec.x > 0.3,
            up: vec.y < -0.3,
            down: vec.y > 0.3
        };
    }

    /**
     * Show/hide controls
     */
    setVisible(visible) {
        if (this.container) {
            this.container.setVisible(visible);
        }
    }

    /**
     * Update alpha
     */
    setAlpha(alpha) {
        if (this.container) {
            this.container.setAlpha(alpha);
        }
    }

    /**
     * Resize controls for different screen sizes
     */
    resize(width, height) {
        if (!this.enabled) return;

        // Reposition joystick
        if (this.joystickBase) {
            const newX = 120;
            const newY = height - 120;
            this.joystickBase.setPosition(newX, newY);
            this.joystickThumb.setPosition(newX, newY);
            this.joystickBasePos = { x: newX, y: newY };
        }

        // Reposition buttons
        this.actionButtons.forEach((btn, i) => {
            const newX = width - 80 - (i * 70);
            const newY = height - 120;
            btn.bg.setPosition(newX, newY);
            btn.text.setPosition(newX, newY);
            btn.x = newX;
            btn.y = newY;
        });
    }

    /**
     * Cleanup
     */
    destroy() {
        if (this.container) {
            this.container.destroy();
            this.container = null;
        }
        this.joystickPointer = null;
        this.enabled = false;
    }
}
