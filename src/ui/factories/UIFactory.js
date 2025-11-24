/**
 * UIFactory - Factory for creating reusable UI components
 * Eliminates code duplication across scenes
 */

import { COLORS, COLORS_HEX, UI_STYLES, SCENE_NAMES, GAME_CONFIG } from '../../constants/GameConstants.js';

export default class UIFactory {
    constructor(scene) {
        this.scene = scene;
    }

    /**
     * Create a standard back button
     * @param {number} x - X position (default: 20)
     * @param {number} y - Y position (default: 20)
     * @param {string} targetScene - Scene to return to (default: MainMenuScene)
     * @param {string} text - Button text (default: '← Back')
     * @returns {Phaser.GameObjects.Text} Back button
     */
    createBackButton(x = 20, y = 20, targetScene = SCENE_NAMES.MAIN_MENU, text = '← Back') {
        const backBtn = this.scene.add.text(x, y, text, {
            fontSize: UI_STYLES.FONT.SIZE.NORMAL,
            fontFamily: UI_STYLES.FONT.FAMILY,
            color: COLORS_HEX.WHITE,
            backgroundColor: COLORS_HEX.GRAY_DARKER,
            padding: UI_STYLES.BUTTON.PADDING
        });

        backBtn.setInteractive({ useHandCursor: true });

        backBtn.on('pointerdown', () => {
            try {
                this.scene.scene.start(targetScene);
            } catch (error) {
                console.error(`UIFactory: Failed to transition to ${targetScene}:`, error);
            }
        });

        backBtn.on('pointerover', () => {
            backBtn.setStyle({ backgroundColor: COLORS_HEX.GRAY_DARK });
        });

        backBtn.on('pointerout', () => {
            backBtn.setStyle({ backgroundColor: COLORS_HEX.GRAY_DARKER });
        });

        return backBtn;
    }

    /**
     * Create a standard button with hover effects
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string} text - Button text
     * @param {Function} onClick - Click handler
     * @param {Object} options - Customization options
     * @returns {Phaser.GameObjects.Text} Button
     */
    createButton(x, y, text, onClick, options = {}) {
        const defaults = {
            fontSize: UI_STYLES.FONT.SIZE.NORMAL,
            fontFamily: UI_STYLES.FONT.FAMILY,
            color: COLORS_HEX.WHITE,
            backgroundColor: COLORS_HEX.GRAY_DARKER,
            padding: UI_STYLES.BUTTON.PADDING,
            hoverColor: COLORS_HEX.GRAY_DARK,
            originX: 0,
            originY: 0
        };

        const config = { ...defaults, ...options };

        const button = this.scene.add.text(x, y, text, {
            fontSize: config.fontSize,
            fontFamily: config.fontFamily,
            color: config.color,
            backgroundColor: config.backgroundColor,
            padding: config.padding
        });

        button.setOrigin(config.originX, config.originY);
        button.setInteractive({ useHandCursor: true });

        button.on('pointerdown', () => {
            try {
                onClick(button);
            } catch (error) {
                console.error('UIFactory: Button click handler error:', error);
            }
        });

        button.on('pointerover', () => {
            button.setStyle({ backgroundColor: config.hoverColor });
        });

        button.on('pointerout', () => {
            button.setStyle({ backgroundColor: config.backgroundColor });
        });

        return button;
    }

    /**
     * Create a large game mode button with description
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string} title - Button title
     * @param {string} description - Button description
     * @param {string} sceneName - Target scene
     * @param {number} color - Button color
     * @returns {Object} Object with button and text elements
     */
    createGameModeButton(x, y, title, description, sceneName, color) {
        const buttonWidth = 600;
        const buttonHeight = 60;

        const button = this.scene.add.rectangle(x, y, buttonWidth, buttonHeight, color, 0.8);
        button.setStrokeStyle(2, COLORS.BORDER);
        button.setInteractive({ useHandCursor: true });

        const titleText = this.scene.add.text(x, y - 12, title, {
            fontSize: UI_STYLES.FONT.SIZE.LARGE,
            fontFamily: UI_STYLES.FONT.FAMILY,
            color: COLORS_HEX.WHITE,
            fontStyle: 'bold'
        });
        titleText.setOrigin(0.5);

        const descText = this.scene.add.text(x, y + 12, description, {
            fontSize: UI_STYLES.FONT.SIZE.SMALL,
            fontFamily: UI_STYLES.FONT.FAMILY,
            color: '#dddddd'
        });
        descText.setOrigin(0.5);

        // Hover effects
        button.on('pointerover', () => {
            button.setFillStyle(color, 1.0);
            button.setScale(1.05);
            titleText.setScale(1.05);
            descText.setScale(1.05);
        });

        button.on('pointerout', () => {
            button.setFillStyle(color, 0.8);
            button.setScale(1.0);
            titleText.setScale(1.0);
            descText.setScale(1.0);
        });

        button.on('pointerdown', () => {
            button.setScale(0.95);
            titleText.setScale(0.95);
            descText.setScale(0.95);
        });

        button.on('pointerup', () => {
            button.setScale(1.0);
            titleText.setScale(1.0);
            descText.setScale(1.0);

            this.scene.cameras.main.fade(GAME_CONFIG.SCENE_FADE_DURATION, 0, 0, 0);
            this.scene.time.delayedCall(GAME_CONFIG.SCENE_FADE_DURATION, () => {
                try {
                    this.scene.scene.start(sceneName);
                } catch (error) {
                    console.error(`UIFactory: Failed to start scene ${sceneName}:`, error);
                }
            });
        });

        return { button, titleText, descText };
    }

    /**
     * Create a feature button (for right sidebar)
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string} text - Button text
     * @param {string} sceneName - Target scene
     * @param {number} color - Button color
     * @returns {Phaser.GameObjects.Text} Feature button
     */
    createFeatureButton(x, y, text, sceneName, color) {
        const btn = this.scene.add.text(x, y, text, {
            fontSize: UI_STYLES.FONT.SIZE.NORMAL,
            fontFamily: UI_STYLES.FONT.FAMILY,
            color: COLORS_HEX.WHITE,
            backgroundColor: '#' + color.toString(16).padStart(6, '0'),
            padding: { x: 12, y: 8 }
        });

        btn.setOrigin(0, 0.5);
        btn.setInteractive({ useHandCursor: true });

        btn.on('pointerdown', () => {
            this.scene.cameras.main.fade(GAME_CONFIG.SCENE_FADE_DURATION, 0, 0, 0);
            this.scene.time.delayedCall(GAME_CONFIG.SCENE_FADE_DURATION, () => {
                try {
                    this.scene.scene.start(sceneName);
                } catch (error) {
                    console.error(`UIFactory: Failed to start scene ${sceneName}:`, error);
                }
            });
        });

        btn.on('pointerover', () => {
            btn.setScale(1.05);
        });

        btn.on('pointerout', () => {
            btn.setScale(1.0);
        });

        return btn;
    }

    /**
     * Create a toggle button
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string} text - Label text
     * @param {boolean} initialState - Initial toggle state
     * @param {Function} onChange - Callback when toggled
     * @returns {Object} Object with label and toggle elements
     */
    createToggle(x, y, text, initialState, onChange) {
        const label = this.scene.add.text(x, y, text, {
            fontSize: UI_STYLES.FONT.SIZE.NORMAL,
            fontFamily: UI_STYLES.FONT.FAMILY,
            color: COLORS_HEX.WHITE
        });

        const toggle = this.scene.add.text(x + 200, y, initialState ? 'ON' : 'OFF', {
            fontSize: UI_STYLES.FONT.SIZE.NORMAL,
            fontFamily: UI_STYLES.FONT.FAMILY,
            color: COLORS_HEX.WHITE,
            backgroundColor: initialState ? COLORS_HEX.SUCCESS : COLORS_HEX.DANGER,
            padding: UI_STYLES.BUTTON.PADDING_SMALL
        });

        toggle.setInteractive({ useHandCursor: true });
        toggle.currentState = initialState;

        toggle.on('pointerdown', () => {
            toggle.currentState = !toggle.currentState;
            toggle.setText(toggle.currentState ? 'ON' : 'OFF');
            toggle.setStyle({
                backgroundColor: toggle.currentState ? COLORS_HEX.SUCCESS : COLORS_HEX.DANGER
            });

            try {
                onChange(toggle.currentState);
            } catch (error) {
                console.error('UIFactory: Toggle change handler error:', error);
            }
        });

        return { label, toggle };
    }

    /**
     * Create a tab button
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string} text - Tab text
     * @param {Function} onClick - Click handler
     * @param {boolean} active - Is tab active
     * @returns {Phaser.GameObjects.Text} Tab button
     */
    createTabButton(x, y, text, onClick, active = false) {
        const tab = this.scene.add.text(x, y, text, {
            fontSize: UI_STYLES.FONT.SIZE.NORMAL,
            fontFamily: UI_STYLES.FONT.FAMILY,
            color: active ? COLORS_HEX.WHITE : COLORS_HEX.GRAY,
            backgroundColor: active ? COLORS_HEX.GRAY_DARKER : 'transparent',
            padding: UI_STYLES.BUTTON.PADDING
        });

        tab.setInteractive({ useHandCursor: true });
        tab.isActive = active;

        tab.on('pointerdown', () => {
            try {
                onClick(tab);
            } catch (error) {
                console.error('UIFactory: Tab click handler error:', error);
            }
        });

        tab.setActive = (isActive) => {
            tab.isActive = isActive;
            tab.setStyle({
                color: isActive ? COLORS_HEX.WHITE : COLORS_HEX.GRAY,
                backgroundColor: isActive ? COLORS_HEX.GRAY_DARKER : 'transparent'
            });
        };

        return tab;
    }

    /**
     * Create a text label
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string} text - Label text
     * @param {Object} style - Text style overrides
     * @returns {Phaser.GameObjects.Text} Label
     */
    createLabel(x, y, text, style = {}) {
        const defaults = {
            fontSize: UI_STYLES.FONT.SIZE.NORMAL,
            fontFamily: UI_STYLES.FONT.FAMILY,
            color: COLORS_HEX.WHITE
        };

        return this.scene.add.text(x, y, text, { ...defaults, ...style });
    }

    /**
     * Create a title text
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string} text - Title text
     * @returns {Phaser.GameObjects.Text} Title
     */
    createTitle(x, y, text) {
        const title = this.scene.add.text(x, y, text, {
            fontSize: UI_STYLES.FONT.SIZE.HUGE,
            fontFamily: UI_STYLES.FONT.FAMILY,
            color: COLORS_HEX.PRIMARY,
            fontStyle: 'bold'
        });
        title.setOrigin(0.5);
        return title;
    }

    /**
     * Create a section header
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string} text - Header text
     * @returns {Phaser.GameObjects.Text} Header
     */
    createSectionHeader(x, y, text) {
        return this.scene.add.text(x, y, text, {
            fontSize: UI_STYLES.FONT.SIZE.MEDIUM,
            fontFamily: UI_STYLES.FONT.FAMILY,
            color: COLORS_HEX.PRIMARY,
            fontStyle: 'bold'
        });
    }
}
