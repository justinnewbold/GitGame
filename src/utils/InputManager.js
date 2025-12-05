/**
 * InputManager - Centralized input handling for keyboard, mouse, touch, and gamepad
 * Provides consistent input API across all scenes
 */

import { logger } from './Logger.js';
import { deviceInfo } from './DeviceDetection.js';

export default class InputManager {
    constructor(scene) {
        this.scene = scene;

        // Input states
        this.keys = {};
        this.mouseButtons = {};
        this.touches = new Map();
        this.gamepadIndex = null;

        // Virtual controls for mobile
        this.virtualJoystick = null;
        this.virtualButtons = new Map();

        // Input bindings
        this.bindings = new Map();

        // Dead zones
        this.gamepadDeadZone = 0.2;
        this.joystickDeadZone = 0.15;

        this.initialize();
    }

    /**
     * Initialize input systems
     */
    initialize() {
        // Keyboard
        this.setupKeyboard();

        // Mouse
        this.setupMouse();

        // Touch
        if (deviceInfo.hasTouch) {
            this.setupTouch();
        }

        // Gamepad
        if (deviceInfo.hasGamepad) {
            this.setupGamepad();
        }

        // Create default bindings
        this.createDefaultBindings();

        logger.debug('Input', 'InputManager initialized', {
            touch: deviceInfo.hasTouch,
            gamepad: deviceInfo.hasGamepad
        });
    }

    /**
     * Setup keyboard input
     */
    setupKeyboard() {
        // Create cursor keys
        this.cursors = this.scene.input.keyboard.createCursorKeys();

        // Create WASD keys
        this.wasd = {
            up: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            down: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            left: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            right: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
        };

        // Common action keys
        this.actionKeys = {
            space: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
            enter: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER),
            escape: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC),
            shift: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT),
            ctrl: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.CTRL)
        };
    }

    /**
     * Setup mouse input
     */
    setupMouse() {
        this.scene.input.on('pointerdown', (pointer) => {
            this.mouseButtons[pointer.button] = true;
        });

        this.scene.input.on('pointerup', (pointer) => {
            this.mouseButtons[pointer.button] = false;
        });
    }

    /**
     * Setup touch input
     */
    setupTouch() {
        this.scene.input.on('pointerdown', (pointer) => {
            if (pointer.isDown) {
                this.touches.set(pointer.id, {
                    x: pointer.x,
                    y: pointer.y,
                    startX: pointer.x,
                    startY: pointer.y,
                    time: Date.now()
                });
            }
        });

        this.scene.input.on('pointermove', (pointer) => {
            if (this.touches.has(pointer.id)) {
                const touch = this.touches.get(pointer.id);
                touch.x = pointer.x;
                touch.y = pointer.y;
            }
        });

        this.scene.input.on('pointerup', (pointer) => {
            this.touches.delete(pointer.id);
        });
    }

    /**
     * Setup gamepad input
     */
    setupGamepad() {
        this.scene.input.gamepad.once('connected', (pad) => {
            this.gamepadIndex = pad.index;
            logger.info('Input', 'Gamepad connected:', pad.id);
        });

        this.scene.input.gamepad.on('disconnected', (pad) => {
            if (pad.index === this.gamepadIndex) {
                this.gamepadIndex = null;
                logger.info('Input', 'Gamepad disconnected');
            }
        });
    }

    /**
     * Create default input bindings
     */
    createDefaultBindings() {
        // Movement
        this.bind('moveUp', ['UP', 'W']);
        this.bind('moveDown', ['DOWN', 'S']);
        this.bind('moveLeft', ['LEFT', 'A']);
        this.bind('moveRight', ['RIGHT', 'D']);

        // Actions
        this.bind('action', ['SPACE', 'ENTER']);
        this.bind('cancel', ['ESC']);
        this.bind('pause', ['ESC', 'P']);
    }

    /**
     * Bind action to keys
     */
    bind(action, keys) {
        if (!Array.isArray(keys)) {
            keys = [keys];
        }
        this.bindings.set(action, keys);
    }

    /**
     * Check if action is currently pressed
     */
    isDown(action) {
        const keys = this.bindings.get(action);
        if (!keys) return false;

        return keys.some(key => {
            // Check keyboard
            const keyCode = Phaser.Input.Keyboard.KeyCodes[key];
            if (keyCode) {
                return this.scene.input.keyboard.addKey(keyCode).isDown;
            }
            return false;
        });
    }

    /**
     * Check if action was just pressed this frame
     */
    justDown(action) {
        const keys = this.bindings.get(action);
        if (!keys) return false;

        return keys.some(key => {
            const keyCode = Phaser.Input.Keyboard.KeyCodes[key];
            if (keyCode) {
                return Phaser.Input.Keyboard.JustDown(this.scene.input.keyboard.addKey(keyCode));
            }
            return false;
        });
    }

    /**
     * Get movement vector from input
     */
    getMovementVector() {
        const vector = { x: 0, y: 0 };

        // Keyboard
        if (this.isDown('moveLeft')) vector.x -= 1;
        if (this.isDown('moveRight')) vector.x += 1;
        if (this.isDown('moveUp')) vector.y -= 1;
        if (this.isDown('moveDown')) vector.y += 1;

        // Gamepad
        if (this.gamepadIndex !== null) {
            const gamepad = this.scene.input.gamepad.getPad(this.gamepadIndex);
            if (gamepad) {
                const leftStick = gamepad.leftStick;
                if (Math.abs(leftStick.x) > this.gamepadDeadZone) {
                    vector.x += leftStick.x;
                }
                if (Math.abs(leftStick.y) > this.gamepadDeadZone) {
                    vector.y += leftStick.y;
                }
            }
        }

        // Normalize diagonal movement
        if (vector.x !== 0 && vector.y !== 0) {
            const length = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
            vector.x /= length;
            vector.y /= length;
        }

        return vector;
    }

    /**
     * Get pointer position (mouse or touch)
     */
    getPointerPosition() {
        const pointer = this.scene.input.activePointer;
        return {
            x: pointer.x,
            y: pointer.y,
            isDown: pointer.isDown
        };
    }

    /**
     * Check if pointer is down
     */
    isPointerDown() {
        return this.scene.input.activePointer.isDown;
    }

    /**
     * Check if pointer just went down
     */
    isPointerJustDown() {
        return this.scene.input.activePointer.justDown;
    }

    /**
     * Get all active touches
     */
    getTouches() {
        return Array.from(this.touches.values());
    }

    /**
     * Create virtual joystick for mobile
     */
    createVirtualJoystick(x, y, radius = 50) {
        const base = this.scene.add.circle(x, y, radius, 0x888888, 0.3);
        base.setDepth(9999);
        base.setScrollFactor(0);

        const stick = this.scene.add.circle(x, y, radius / 2, 0xffffff, 0.5);
        stick.setDepth(10000);
        stick.setScrollFactor(0);

        this.virtualJoystick = {
            base,
            stick,
            baseX: x,
            baseY: y,
            radius,
            vector: { x: 0, y: 0 }
        };

        // Make interactive
        base.setInteractive();

        this.scene.input.on('pointermove', (pointer) => {
            if (pointer.isDown && this.virtualJoystick) {
                const dx = pointer.x - this.virtualJoystick.baseX;
                const dy = pointer.y - this.virtualJoystick.baseY;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance > 0) {
                    const angle = Math.atan2(dy, dx);
                    const maxDist = Math.min(distance, this.virtualJoystick.radius);

                    stick.x = this.virtualJoystick.baseX + Math.cos(angle) * maxDist;
                    stick.y = this.virtualJoystick.baseY + Math.sin(angle) * maxDist;

                    this.virtualJoystick.vector.x = (maxDist / this.virtualJoystick.radius) * Math.cos(angle);
                    this.virtualJoystick.vector.y = (maxDist / this.virtualJoystick.radius) * Math.sin(angle);
                }
            }
        });

        this.scene.input.on('pointerup', () => {
            if (this.virtualJoystick) {
                stick.x = this.virtualJoystick.baseX;
                stick.y = this.virtualJoystick.baseY;
                this.virtualJoystick.vector.x = 0;
                this.virtualJoystick.vector.y = 0;
            }
        });

        return this.virtualJoystick;
    }

    /**
     * Get virtual joystick vector
     */
    getVirtualJoystickVector() {
        if (!this.virtualJoystick) return { x: 0, y: 0 };

        const vec = this.virtualJoystick.vector;

        // Apply dead zone
        if (Math.abs(vec.x) < this.joystickDeadZone) vec.x = 0;
        if (Math.abs(vec.y) < this.joystickDeadZone) vec.y = 0;

        return vec;
    }

    /**
     * Enable/disable input
     */
    setEnabled(enabled) {
        this.scene.input.enabled = enabled;
    }

    /**
     * Cleanup
     */
    destroy() {
        if (this.virtualJoystick) {
            this.virtualJoystick.base.destroy();
            this.virtualJoystick.stick.destroy();
        }

        this.touches.clear();
        this.bindings.clear();
        this.virtualButtons.clear();
    }
}
