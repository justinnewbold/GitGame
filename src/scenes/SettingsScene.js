import Phaser from 'phaser';
import { COLORS } from '../main.js';
import { gameData } from '../utils/GameData.js';

export default class SettingsScene extends Phaser.Scene {
    constructor() {
        super({ key: 'SettingsScene' });
    }

    create() {
        const { width, height } = this.cameras.main;

        this.cameras.main.fadeIn(300, 10, 10, 11);

        // Header
        this.createHeader(width);

        // Settings sections
        this.createSettings(width, height);

        // Footer actions
        this.createFooter(width, height);
    }

    createHeader(width) {
        // Back button
        const backBtn = this.add.container(24, 50);
        const backBg = this.add.circle(0, 0, 20, COLORS.surface);
        const backIcon = this.add.text(0, 0, '\u2190', {
            fontSize: '20px',
            color: '#71717a'
        }).setOrigin(0.5);

        backBtn.add([backBg, backIcon]);
        backBg.setInteractive({ useHandCursor: true });

        backBg.on('pointerdown', () => {
            this.tweens.add({
                targets: backBtn,
                scale: 0.9,
                duration: 50,
                yoyo: true,
                onComplete: () => {
                    this.cameras.main.fadeOut(200, 10, 10, 11);
                    this.time.delayedCall(200, () => {
                        this.scene.start('MainMenuScene');
                    });
                }
            });
        });

        // Title
        this.add.text(width / 2, 50, 'Settings', {
            fontSize: '24px',
            fontFamily: 'Inter, sans-serif',
            color: '#fafafa',
            fontStyle: 'bold'
        }).setOrigin(0.5);
    }

    createSettings(width, height) {
        const startY = 120;
        const itemHeight = 70;
        let currentY = startY;

        // Sound section header
        this.add.text(24, currentY, 'AUDIO', {
            fontSize: '12px',
            fontFamily: 'Inter, sans-serif',
            color: '#71717a',
            fontStyle: '600'
        });
        currentY += 35;

        // Sound Effects toggle
        this.createToggle(width, currentY, 'Sound Effects', 'soundEnabled');
        currentY += itemHeight;

        // Music toggle
        this.createToggle(width, currentY, 'Music', 'musicEnabled');
        currentY += itemHeight;

        // Haptics toggle
        this.createToggle(width, currentY, 'Vibration', 'haptics');
        currentY += itemHeight + 20;

        // Data section header
        this.add.text(24, currentY, 'DATA', {
            fontSize: '12px',
            fontFamily: 'Inter, sans-serif',
            color: '#71717a',
            fontStyle: '600'
        });
        currentY += 35;

        // Stats display
        this.createStatsCard(width, currentY);
    }

    createToggle(width, y, label, settingKey) {
        const container = this.add.container(0, y);

        // Background
        const bg = this.add.rectangle(width / 2, 0, width - 48, 56, COLORS.surface);
        bg.setStrokeStyle(1, COLORS.surfaceLight);

        // Label
        const labelText = this.add.text(40, 0, label, {
            fontSize: '16px',
            fontFamily: 'Inter, sans-serif',
            color: '#fafafa'
        }).setOrigin(0, 0.5);

        // Toggle
        const isEnabled = gameData.getSetting(settingKey);
        const toggleWidth = 50;
        const toggleHeight = 28;
        const toggleX = width - 55;

        const toggleBg = this.add.rectangle(toggleX, 0, toggleWidth, toggleHeight,
            isEnabled ? COLORS.primary : COLORS.surfaceLight
        );
        toggleBg.setInteractive({ useHandCursor: true });

        const toggleKnob = this.add.circle(
            isEnabled ? toggleX + 12 : toggleX - 12,
            0,
            10,
            0xfafafa
        );

        container.add([bg, labelText, toggleBg, toggleKnob]);

        toggleBg.on('pointerdown', () => {
            const newState = gameData.toggleSetting(settingKey);

            this.tweens.add({
                targets: toggleKnob,
                x: newState ? toggleX + 12 : toggleX - 12,
                duration: 150,
                ease: 'Quad.easeOut'
            });

            this.tweens.add({
                targets: toggleBg,
                fillColor: newState ? COLORS.primary : COLORS.surfaceLight,
                duration: 150
            });
        });
    }

    createStatsCard(width, y) {
        const stats = gameData.data.stats;
        const cardHeight = 160;

        const bg = this.add.rectangle(width / 2, y + cardHeight / 2, width - 48, cardHeight, COLORS.surface);
        bg.setStrokeStyle(1, COLORS.surfaceLight);

        // Stats
        const statItems = [
            { label: 'Games Played', value: stats.gamesPlayed },
            { label: 'Total Score', value: stats.totalScore },
            { label: 'Survivor Best', value: stats.gitSurvivor.highScore },
            { label: 'Sprint Best', value: stats.sprintSurvivor.highScore },
            { label: 'Debug Level', value: stats.bugBounty.bestLevel }
        ];

        statItems.forEach((stat, index) => {
            const itemY = y + 25 + index * 28;

            this.add.text(40, itemY, stat.label, {
                fontSize: '14px',
                fontFamily: 'Inter, sans-serif',
                color: '#71717a'
            }).setOrigin(0, 0.5);

            this.add.text(width - 40, itemY, stat.value.toString(), {
                fontSize: '14px',
                fontFamily: 'Inter, sans-serif',
                color: '#fafafa',
                fontStyle: '600'
            }).setOrigin(1, 0.5);
        });
    }

    createFooter(width, height) {
        // Reset button
        const resetBtn = this.add.container(width / 2, height - 100);

        const resetBg = this.add.rectangle(0, 0, width - 48, 50, COLORS.surface);
        resetBg.setStrokeStyle(1, COLORS.error);

        const resetText = this.add.text(0, 0, 'Reset All Data', {
            fontSize: '16px',
            fontFamily: 'Inter, sans-serif',
            color: '#ef4444',
            fontStyle: '600'
        }).setOrigin(0.5);

        resetBtn.add([resetBg, resetText]);
        resetBg.setInteractive({ useHandCursor: true });

        resetBg.on('pointerdown', () => {
            this.showResetConfirmation(width, height);
        });

        // Version
        this.add.text(width / 2, height - 40, 'GitGame v2.0', {
            fontSize: '12px',
            fontFamily: 'Inter, sans-serif',
            color: '#52525b'
        }).setOrigin(0.5);
    }

    showResetConfirmation(width, height) {
        // Overlay
        const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8);
        overlay.setInteractive();

        // Modal
        const modalBg = this.add.rectangle(width / 2, height / 2, width - 48, 200, COLORS.surface);
        modalBg.setStrokeStyle(2, COLORS.error);

        // Title
        const title = this.add.text(width / 2, height / 2 - 60, 'Reset Data?', {
            fontSize: '20px',
            fontFamily: 'Inter, sans-serif',
            color: '#fafafa',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Description
        const desc = this.add.text(width / 2, height / 2 - 20, 'All progress will be lost.\nThis cannot be undone.', {
            fontSize: '14px',
            fontFamily: 'Inter, sans-serif',
            color: '#71717a',
            align: 'center'
        }).setOrigin(0.5);

        // Cancel button
        const cancelBg = this.add.rectangle(width / 2 - 70, height / 2 + 50, 120, 44, COLORS.surfaceLight);
        const cancelText = this.add.text(width / 2 - 70, height / 2 + 50, 'Cancel', {
            fontSize: '14px',
            fontFamily: 'Inter, sans-serif',
            color: '#fafafa'
        }).setOrigin(0.5);

        cancelBg.setInteractive({ useHandCursor: true });
        cancelBg.on('pointerdown', () => {
            overlay.destroy();
            modalBg.destroy();
            title.destroy();
            desc.destroy();
            cancelBg.destroy();
            cancelText.destroy();
            confirmBg.destroy();
            confirmText.destroy();
        });

        // Confirm button
        const confirmBg = this.add.rectangle(width / 2 + 70, height / 2 + 50, 120, 44, COLORS.error);
        const confirmText = this.add.text(width / 2 + 70, height / 2 + 50, 'Reset', {
            fontSize: '14px',
            fontFamily: 'Inter, sans-serif',
            color: '#fafafa',
            fontStyle: '600'
        }).setOrigin(0.5);

        confirmBg.setInteractive({ useHandCursor: true });
        confirmBg.on('pointerdown', () => {
            gameData.reset();
            this.scene.restart();
        });
    }
}
