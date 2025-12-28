import Phaser from 'phaser';
import { gameData } from '../utils/GameData.js';
import { logger } from '../utils/Logger.js';
import { musicManager } from '../utils/MusicManager.js';
import { motionPrefs } from '../utils/MotionPreferences.js';

export default class SettingsScene extends Phaser.Scene {
    constructor() {
        super({ key: 'SettingsScene' });
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Background
        this.add.rectangle(0, 0, width, height, 0x1a1a2e).setOrigin(0);

        // Title
        this.add.text(width / 2, 60, '⚙️ Settings', {
            fontSize: '48px',
            fontFamily: 'monospace',
            color: '#00aaff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Back button
        this.createBackButton();

        let yPos = 140;

        // Sound Settings
        this.createSection('🔊 Sound', yPos);
        yPos += 40;

        this.createToggle('Sound Effects', yPos, 'soundEnabled', (enabled) => {
            gameData.data.settings.soundEnabled = enabled;
            gameData.save();
        });
        yPos += 50;

        this.createToggle('Music', yPos, 'musicEnabled', (enabled) => {
            gameData.data.settings.musicEnabled = enabled;
            gameData.save();

            // Control music playback
            if (enabled) {
                musicManager.init();
                musicManager.play('menu');
            } else {
                musicManager.stop();
            }
        });
        yPos += 50;

        // Volume sliders
        this.createVolumeSlider('Master Volume', yPos, 'masterVolume', (volume) => {
            gameData.data.settings.masterVolume = volume;
            gameData.save();
            // Apply to music
            const musicVol = gameData.data.settings.musicVolume || 1.0;
            musicManager.setVolume(volume * musicVol * 0.3);
        });
        yPos += 50;

        this.createVolumeSlider('Music Volume', yPos, 'musicVolume', (volume) => {
            gameData.data.settings.musicVolume = volume;
            gameData.save();
            // Apply to music
            const masterVol = gameData.data.settings.masterVolume || 1.0;
            musicManager.setVolume(masterVol * volume * 0.3);
        });
        yPos += 70;

        // Difficulty Settings
        this.createSection('😊 Difficulty', yPos);
        yPos += 40;

        this.createDifficultySelector(yPos);
        yPos += 80;

        // Accessibility Settings
        this.createSection('♿ Accessibility', yPos);
        yPos += 40;

        this.createMotionToggle(yPos);
        yPos += 70;

        // Features
        this.createSection('🎮 Features', yPos);
        yPos += 40;

        this.createFeatureButtons(yPos);
        yPos += 60;

        // Data Management
        this.createSection('💾 Data', yPos);
        yPos += 40;

        this.createDataButtons(yPos);
        yPos += 100;

        // Stats Display
        this.createStatsDisplay(yPos);

        // Version
        this.add.text(width / 2, height - 20, 'GitGame v1.0.0 - Made with ❤️', {
            fontSize: '10px',
            fontFamily: 'monospace',
            color: '#555555'
        }).setOrigin(0.5);
    }

    createSection(title, y) {
        this.add.text(400, y, title, {
            fontSize: '24px',
            fontFamily: 'monospace',
            color: '#ffaa00',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Underline
        this.add.rectangle(400, y + 15, 300, 2, 0xffaa00);
    }

    createToggle(label, y, settingKey, callback) {
        const isEnabled = gameData.data.settings[settingKey];

        // Label
        this.add.text(250, y, label + ':', {
            fontSize: '16px',
            fontFamily: 'monospace',
            color: '#ffffff'
        });

        // Toggle button
        const toggleBg = this.add.rectangle(500, y, 60, 30, isEnabled ? 0x00aa00 : 0xaa0000, 0.8);
        toggleBg.setStrokeStyle(2, 0xffffff);
        toggleBg.setInteractive({ useHandCursor: true });

        const toggleText = this.add.text(500, y, isEnabled ? 'ON' : 'OFF', {
            fontSize: '14px',
            fontFamily: 'monospace',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        toggleBg.on('pointerdown', () => {
            const newState = !gameData.data.settings[settingKey];
            gameData.data.settings[settingKey] = newState;
            gameData.save();

            toggleBg.setFillStyle(newState ? 0x00aa00 : 0xaa0000, 0.8);
            toggleText.setText(newState ? 'ON' : 'OFF');

            if (callback) callback(newState);

            // Visual feedback
            toggleBg.setScale(0.9);
            this.tweens.add({
                targets: toggleBg,
                scale: 1,
                duration: 100
            });
        });

        toggleBg.on('pointerover', () => {
            toggleBg.setFillStyle(isEnabled ? 0x00ff00 : 0xff0000, 1.0);
        });

        toggleBg.on('pointerout', () => {
            toggleBg.setFillStyle(isEnabled ? 0x00aa00 : 0xaa0000, 0.8);
        });
    }

    createVolumeSlider(label, y, settingKey, callback) {
        const currentVolume = gameData.data.settings[settingKey] !== undefined ?
            gameData.data.settings[settingKey] : 1.0;

        // Label
        this.add.text(250, y, label + ':', {
            fontSize: '16px',
            fontFamily: 'monospace',
            color: '#ffffff'
        });

        // Slider track
        const sliderWidth = 200;
        const sliderX = 450;
        const track = this.add.rectangle(sliderX, y, sliderWidth, 6, 0x333333);
        track.setOrigin(0, 0.5);

        // Filled portion
        const fill = this.add.rectangle(sliderX, y, sliderWidth * currentVolume, 6, 0x00aaff);
        fill.setOrigin(0, 0.5);

        // Slider handle
        const handle = this.add.circle(sliderX + (sliderWidth * currentVolume), y, 10, 0xffffff);
        handle.setStrokeStyle(2, 0x00aaff);
        handle.setInteractive({ useHandCursor: true, draggable: true });

        // Volume percentage
        const percentText = this.add.text(sliderX + sliderWidth + 20, y,
            Math.round(currentVolume * 100) + '%', {
            fontSize: '14px',
            fontFamily: 'monospace',
            color: '#ffffff'
        });
        percentText.setOrigin(0, 0.5);

        // Drag handler
        let isDragging = false;

        handle.on('dragstart', () => {
            isDragging = true;
            handle.setScale(1.2);
        });

        handle.on('drag', (pointer) => {
            // Calculate new position
            const relativeX = pointer.x - sliderX;
            const newVolume = Phaser.Math.Clamp(relativeX / sliderWidth, 0, 1);

            // Update visuals
            handle.x = sliderX + (sliderWidth * newVolume);
            fill.width = sliderWidth * newVolume;
            percentText.setText(Math.round(newVolume * 100) + '%');

            // Call callback
            if (callback) callback(newVolume);
        });

        handle.on('dragend', () => {
            isDragging = false;
            handle.setScale(1.0);
        });

        // Click on track to set position
        track.setInteractive({ useHandCursor: true });
        track.on('pointerdown', (pointer) => {
            if (!isDragging) {
                const relativeX = pointer.x - sliderX;
                const newVolume = Phaser.Math.Clamp(relativeX / sliderWidth, 0, 1);

                handle.x = sliderX + (sliderWidth * newVolume);
                fill.width = sliderWidth * newVolume;
                percentText.setText(Math.round(newVolume * 100) + '%');

                if (callback) callback(newVolume);
            }
        });
    }

    createDifficultySelector(y) {
        const difficulties = ['normal', 'hard', 'nightmare'];
        const currentDifficulty = gameData.getDifficulty();

        const labels = {
            normal: '😊 Normal',
            hard: '😅 Hard',
            nightmare: '💀 Nightmare'
        };

        const colors = {
            normal: 0x00ff00,
            hard: 0xffaa00,
            nightmare: 0xff0000
        };

        difficulties.forEach((difficulty, index) => {
            const x = 250 + (index * 120);
            const isSelected = difficulty === currentDifficulty;

            const btn = this.add.rectangle(x, y, 110, 40,
                isSelected ? colors[difficulty] : 0x333333, 0.8);
            btn.setStrokeStyle(2, isSelected ? 0xffffff : 0x666666);
            btn.setInteractive({ useHandCursor: true });

            const text = this.add.text(x, y, labels[difficulty], {
                fontSize: '12px',
                fontFamily: 'monospace',
                color: isSelected ? '#000000' : '#888888',
                fontStyle: isSelected ? 'bold' : 'normal'
            }).setOrigin(0.5);

            btn.on('pointerdown', () => {
                gameData.setDifficulty(difficulty);
                this.scene.restart(); // Refresh to update display
            });

            btn.on('pointerover', () => {
                if (!isSelected) {
                    btn.setFillStyle(0x555555, 0.8);
                    text.setColor('#ffffff');
                }
            });

            btn.on('pointerout', () => {
                if (!isSelected) {
                    btn.setFillStyle(0x333333, 0.8);
                    text.setColor('#888888');
                }
            });
        });

        // Difficulty description
        const descriptions = {
            normal: 'Standard challenge - recommended for first-time players',
            hard: 'Increased difficulty - 1.5x enemy strength and faster spawns',
            nightmare: 'Extreme challenge - 2x multiplier, only for the brave!'
        };

        this.add.text(400, y + 35, descriptions[currentDifficulty], {
            fontSize: '11px',
            fontFamily: 'monospace',
            color: '#888888',
            align: 'center'
        }).setOrigin(0.5);
    }

    createFeatureButtons(y) {
        const buttons = [
            { label: '🏆 Achievements', scene: 'AchievementsScene', color: 0x9b59b6 },
            { label: '📋 Challenges', scene: 'ChallengesScene', color: 0xe67e22 },
            { label: '🎨 Cosmetics', scene: 'CosmeticsScene', color: 0x3498db }
        ];

        buttons.forEach((btn, index) => {
            const x = 250 + (index * 150);

            const btnBg = this.add.rectangle(x, y, 130, 40, btn.color, 0.8);
            btnBg.setStrokeStyle(2, 0xffffff);
            btnBg.setInteractive({ useHandCursor: true });

            this.add.text(x, y, btn.label, {
                fontSize: '11px',
                fontFamily: 'monospace',
                color: '#ffffff',
                fontStyle: 'bold'
            }).setOrigin(0.5);

            btnBg.on('pointerdown', () => {
                this.scene.start(btn.scene);
            });

            btnBg.on('pointerover', () => btnBg.setAlpha(1.0));
            btnBg.on('pointerout', () => btnBg.setAlpha(0.8));
        });
    }

    createDataButtons(y) {
        // View Stats button
        const statsBtn = this.add.rectangle(300, y, 180, 40, 0x0000aa, 0.8);
        statsBtn.setStrokeStyle(2, 0xffffff);
        statsBtn.setInteractive({ useHandCursor: true });

        this.add.text(300, y, '📊 View Stats', {
            fontSize: '14px',
            fontFamily: 'monospace',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        statsBtn.on('pointerdown', () => {
            this.scene.start('StatsScene');
        });

        statsBtn.on('pointerover', () => statsBtn.setFillStyle(0x0000ff, 1.0));
        statsBtn.on('pointerout', () => statsBtn.setFillStyle(0x0000aa, 0.8));

        // Reset Data button (dangerous!)
        const resetBtn = this.add.rectangle(500, y, 180, 40, 0xaa0000, 0.8);
        resetBtn.setStrokeStyle(2, 0xffffff);
        resetBtn.setInteractive({ useHandCursor: true });

        this.add.text(500, y, '🗑️ Reset All Data', {
            fontSize: '14px',
            fontFamily: 'monospace',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        resetBtn.on('pointerdown', () => {
            this.confirmReset();
        });

        resetBtn.on('pointerover', () => resetBtn.setFillStyle(0xff0000, 1.0));
        resetBtn.on('pointerout', () => resetBtn.setFillStyle(0xaa0000, 0.8));
    }

    createMotionToggle(y) {
        // Reduced Motion setting with 3 modes: System, Enabled, Disabled
        const mode = motionPrefs.getMode();
        const modeLabel = motionPrefs.getModeLabel();
        const isActive = motionPrefs.shouldReduceMotion();

        // Label
        this.add.text(250, y, 'Reduce Motion:', {
            fontSize: '16px',
            fontFamily: 'monospace',
            color: '#ffffff'
        });

        // Mode button (cycles through modes)
        const modeColors = {
            system: 0x0066aa,    // Blue for system
            enabled: 0x00aa00,   // Green for enabled
            disabled: 0xaa6600   // Orange for disabled
        };

        const toggleBg = this.add.rectangle(500, y, 140, 30, modeColors[mode], 0.8);
        toggleBg.setStrokeStyle(2, 0xffffff);
        toggleBg.setInteractive({ useHandCursor: true });

        const toggleText = this.add.text(500, y, modeLabel, {
            fontSize: '12px',
            fontFamily: 'monospace',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        toggleBg.on('pointerdown', () => {
            const newMode = motionPrefs.cycleMode();
            const newLabel = motionPrefs.getModeLabel();

            toggleBg.setFillStyle(modeColors[newMode], 0.8);
            toggleText.setText(newLabel);

            // Visual feedback
            toggleBg.setScale(0.9);
            this.tweens.add({
                targets: toggleBg,
                scale: 1,
                duration: 100
            });
        });

        toggleBg.on('pointerover', () => {
            toggleBg.setAlpha(1.0);
        });

        toggleBg.on('pointerout', () => {
            toggleBg.setAlpha(0.8);
        });

        // Description
        const description = isActive
            ? 'Animations reduced for accessibility'
            : 'Full animations enabled';

        this.add.text(400, y + 25, description, {
            fontSize: '11px',
            fontFamily: 'monospace',
            color: '#888888'
        }).setOrigin(0.5);
    }

    confirmReset() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Overlay
        const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.9);
        overlay.setOrigin(0);
        overlay.setInteractive();

        // Confirmation box
        const box = this.add.rectangle(width / 2, height / 2, 500, 250, 0x1a1a2e);
        box.setStrokeStyle(3, 0xff0000);

        this.add.text(width / 2, height / 2 - 80, '⚠️ WARNING', {
            fontSize: '32px',
            fontFamily: 'monospace',
            color: '#ff0000',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(width / 2, height / 2 - 20,
            'This will delete ALL your progress:\n\n' +
            '• All achievements\n' +
            '• All high scores\n' +
            '• All statistics\n\n' +
            'This cannot be undone!', {
            fontSize: '14px',
            fontFamily: 'monospace',
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);

        // Cancel button
        const cancelBtn = this.add.rectangle(width / 2 - 80, height / 2 + 90, 120, 40, 0x00aa00, 0.8);
        cancelBtn.setStrokeStyle(2, 0xffffff);
        cancelBtn.setInteractive({ useHandCursor: true });

        this.add.text(width / 2 - 80, height / 2 + 90, 'Cancel', {
            fontSize: '16px',
            fontFamily: 'monospace',
            color: '#ffffff'
        }).setOrigin(0.5);

        cancelBtn.on('pointerdown', () => {
            overlay.destroy();
            box.destroy();
            this.scene.restart();
        });

        cancelBtn.on('pointerover', () => cancelBtn.setFillStyle(0x00ff00, 1.0));
        cancelBtn.on('pointerout', () => cancelBtn.setFillStyle(0x00aa00, 0.8));

        // Confirm button
        const confirmBtn = this.add.rectangle(width / 2 + 80, height / 2 + 90, 120, 40, 0xaa0000, 0.8);
        confirmBtn.setStrokeStyle(2, 0xffffff);
        confirmBtn.setInteractive({ useHandCursor: true });

        this.add.text(width / 2 + 80, height / 2 + 90, 'DELETE', {
            fontSize: '16px',
            fontFamily: 'monospace',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        confirmBtn.on('pointerdown', () => {
            gameData.reset();
            overlay.destroy();
            box.destroy();
            this.scene.start('MainMenuScene');
        });

        confirmBtn.on('pointerover', () => confirmBtn.setFillStyle(0xff0000, 1.0));
        confirmBtn.on('pointerout', () => confirmBtn.setFillStyle(0xaa0000, 0.8));
    }

    createStatsDisplay(y) {
        const stats = gameData.data.stats;

        this.add.text(400, y, '📈 Quick Stats', {
            fontSize: '16px',
            fontFamily: 'monospace',
            color: '#00aaff'
        }).setOrigin(0.5);

        const statText = `Games Played: ${stats.gamesPlayed} | Total Score: ${stats.totalScore}\n` +
                        `Achievements: ${gameData.data.achievements.length} / ${gameData.getAchievements().length}`;

        this.add.text(400, y + 30, statText, {
            fontSize: '12px',
            fontFamily: 'monospace',
            color: '#888888',
            align: 'center'
        }).setOrigin(0.5);
    }

    createBackButton() {
        const backBtn = this.add.text(20, 20, '← Back to Menu', {
            fontSize: '14px',
            fontFamily: 'monospace',
            color: '#ffffff',
            backgroundColor: '#333333',
            padding: { x: 10, y: 5 }
        });
        backBtn.setInteractive({ useHandCursor: true });
        backBtn.on('pointerdown', () => this.scene.start('MainMenuScene'));
        backBtn.on('pointerover', () => backBtn.setStyle({ backgroundColor: '#555555' }));
        backBtn.on('pointerout', () => backBtn.setStyle({ backgroundColor: '#333333' }));
    }
}
