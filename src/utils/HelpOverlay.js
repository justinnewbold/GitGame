// HelpOverlay - Shows keyboard shortcuts and game controls
// Can be toggled with a key (default: F1 or H)

export default class HelpOverlay {
    constructor(scene, config = {}) {
        this.scene = scene;
        this.isVisible = false;
        this.container = null;

        // Config
        this.toggleKey = config.toggleKey || 'F1';
        this.shortcuts = config.shortcuts || this.getDefaultShortcuts();
        this.customTips = config.tips || [];

        // Setup keyboard listener
        this.setupKeyboardListener();
    }

    /**
     * Get default keyboard shortcuts for common game controls
     */
    getDefaultShortcuts() {
        return [
            { keys: 'WASD / Arrow Keys', action: 'Move player' },
            { keys: 'Mouse', action: 'Auto-attack direction' },
            { keys: 'Space', action: 'Dodge/Special ability' },
            { keys: 'ESC', action: 'Pause/Menu' },
            { keys: 'F1 / H', action: 'Toggle this help' },
            { keys: 'M', action: 'Toggle music' },
            { keys: 'Tab', action: 'Show stats' }
        ];
    }

    /**
     * Setup keyboard listener for toggle
     */
    setupKeyboardListener() {
        // Listen for F1 or H key
        this.scene.input.keyboard.on('keydown-F1', () => {
            this.toggle();
        });

        this.scene.input.keyboard.on('keydown-H', () => {
            // Only toggle if Shift is not pressed (to avoid conflicts)
            if (!this.scene.input.keyboard.checkDown(this.scene.input.keyboard.addKey('SHIFT'))) {
                this.toggle();
            }
        });

        // ESC to close
        this.scene.input.keyboard.on('keydown-ESC', () => {
            if (this.isVisible) {
                this.hide();
            }
        });
    }

    /**
     * Toggle help overlay
     */
    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }

    /**
     * Show help overlay
     */
    show() {
        if (this.isVisible) return;

        this.isVisible = true;
        this.createOverlay();

        // Pause game if it's active
        if (this.scene.physics && this.scene.physics.world) {
            this.scene.physics.pause();
        }

        // Play sound
        if (this.scene.sounds) {
            this.scene.sounds.playSound('menu');
        }
    }

    /**
     * Hide help overlay
     */
    hide() {
        if (!this.isVisible) return;

        this.isVisible = false;

        // Animate out
        if (this.container) {
            this.scene.tweens.add({
                targets: this.container,
                alpha: 0,
                duration: 200,
                onComplete: () => {
                    this.container.destroy();
                    this.container = null;
                }
            });
        }

        // Resume game
        if (this.scene.physics && this.scene.physics.world) {
            this.scene.physics.resume();
        }
    }

    /**
     * Create the overlay UI
     */
    createOverlay() {
        const width = this.scene.cameras.main.width;
        const height = this.scene.cameras.main.height;

        // Container for all overlay elements
        this.container = this.scene.add.container(0, 0);
        this.container.setDepth(9999); // Top layer
        this.container.setAlpha(0);

        // Semi-transparent background
        const bg = this.scene.add.rectangle(0, 0, width, height, 0x000000, 0.85);
        bg.setOrigin(0);
        bg.setInteractive(); // Block clicks

        // Panel background
        const panelWidth = Math.min(600, width - 40);
        const panelHeight = Math.min(500, height - 40);
        const panel = this.scene.add.rectangle(width / 2, height / 2, panelWidth, panelHeight, 0x1a1a2e, 1);
        panel.setStrokeStyle(3, 0x00aaff);

        // Title
        const title = this.scene.add.text(width / 2, height / 2 - panelHeight / 2 + 30,
            '( Keyboard Shortcuts & Controls', {
            fontSize: '24px',
            fontFamily: 'monospace',
            color: '#00aaff',
            fontStyle: 'bold'
        });
        title.setOrigin(0.5);

        // Subtitle
        const subtitle = this.scene.add.text(width / 2, height / 2 - panelHeight / 2 + 55,
            'Press F1 or H to toggle this help anytime', {
            fontSize: '12px',
            fontFamily: 'monospace',
            color: '#888888',
            fontStyle: 'italic'
        });
        subtitle.setOrigin(0.5);

        // Divider
        const divider1 = this.scene.add.rectangle(
            width / 2,
            height / 2 - panelHeight / 2 + 75,
            panelWidth - 40,
            2,
            0x00aaff
        );

        // Shortcuts list
        let yOffset = height / 2 - panelHeight / 2 + 100;
        const shortcuts = [];

        this.shortcuts.forEach((shortcut, index) => {
            // Key text (bold)
            const keyText = this.scene.add.text(
                width / 2 - panelWidth / 2 + 50,
                yOffset,
                shortcut.keys, {
                fontSize: '14px',
                fontFamily: 'monospace',
                color: '#ffaa00',
                fontStyle: 'bold'
            });

            // Action text
            const actionText = this.scene.add.text(
                width / 2 - 50,
                yOffset,
                shortcut.action, {
                fontSize: '14px',
                fontFamily: 'monospace',
                color: '#ffffff'
            });

            shortcuts.push(keyText, actionText);
            yOffset += 30;
        });

        // Tips section
        if (this.customTips.length > 0) {
            yOffset += 10;
            const divider2 = this.scene.add.rectangle(
                width / 2,
                yOffset,
                panelWidth - 40,
                2,
                0x00aaff
            );
            shortcuts.push(divider2);

            yOffset += 20;
            const tipsTitle = this.scene.add.text(
                width / 2,
                yOffset,
                '=¡ Pro Tips', {
                fontSize: '16px',
                fontFamily: 'monospace',
                color: '#ffaa00',
                fontStyle: 'bold'
            });
            tipsTitle.setOrigin(0.5);
            shortcuts.push(tipsTitle);

            yOffset += 30;
            this.customTips.forEach((tip, index) => {
                const tipText = this.scene.add.text(
                    width / 2,
                    yOffset,
                    `" ${tip}`, {
                    fontSize: '12px',
                    fontFamily: 'monospace',
                    color: '#cccccc',
                    wordWrap: { width: panelWidth - 80 },
                    align: 'center'
                });
                tipText.setOrigin(0.5);
                shortcuts.push(tipText);
                yOffset += 25;
            });
        }

        // Close button
        const closeBtn = this.scene.add.text(
            width / 2,
            height / 2 + panelHeight / 2 - 35,
            '[ Press ESC or F1 to Close ]', {
            fontSize: '14px',
            fontFamily: 'monospace',
            color: '#00aaff'
        });
        closeBtn.setOrigin(0.5);
        closeBtn.setInteractive({ useHandCursor: true });
        closeBtn.on('pointerdown', () => {
            this.hide();
        });

        closeBtn.on('pointerover', () => {
            closeBtn.setColor('#00ffff');
        });

        closeBtn.on('pointerout', () => {
            closeBtn.setColor('#00aaff');
        });

        // Add all to container
        this.container.add([bg, panel, title, subtitle, divider1, ...shortcuts, closeBtn]);

        // Fade in animation
        this.scene.tweens.add({
            targets: this.container,
            alpha: 1,
            duration: 200,
            ease: 'Power2'
        });
    }

    /**
     * Update shortcuts list
     */
    setShortcuts(shortcuts) {
        this.shortcuts = shortcuts;
        if (this.isVisible) {
            // Refresh display
            this.hide();
            this.show();
        }
    }

    /**
     * Add custom tips
     */
    setTips(tips) {
        this.customTips = tips;
        if (this.isVisible) {
            this.hide();
            this.show();
        }
    }

    /**
     * Cleanup
     */
    destroy() {
        if (this.container) {
            this.container.destroy();
        }
        this.isVisible = false;
    }
}
