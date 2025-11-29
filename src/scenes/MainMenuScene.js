import Phaser from 'phaser';
import { COLORS } from '../main.js';
import { gameData } from '../utils/GameData.js';

export default class MainMenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenuScene' });
    }

    create() {
        const { width, height } = this.cameras.main;

        // Fade in
        this.cameras.main.fadeIn(400, 10, 10, 11);

        // Subtle animated background gradient dots
        this.createBackgroundEffect();

        // Header section
        this.createHeader(width);

        // Game mode cards
        this.createGameCards(width, height);

        // Footer
        this.createFooter(width, height);
    }

    createBackgroundEffect() {
        // Subtle floating particles
        for (let i = 0; i < 20; i++) {
            const x = Phaser.Math.Between(0, 390);
            const y = Phaser.Math.Between(0, 844);
            const size = Phaser.Math.Between(1, 3);
            const alpha = Phaser.Math.FloatBetween(0.05, 0.15);

            const dot = this.add.circle(x, y, size, COLORS.primary, alpha);

            this.tweens.add({
                targets: dot,
                y: y - 100,
                alpha: 0,
                duration: Phaser.Math.Between(8000, 15000),
                repeat: -1,
                onRepeat: () => {
                    dot.x = Phaser.Math.Between(0, 390);
                    dot.y = 900;
                    dot.alpha = alpha;
                }
            });
        }
    }

    createHeader(width) {
        const centerX = width / 2;

        // Logo
        this.add.text(centerX, 80, 'GitGame', {
            fontSize: '42px',
            fontFamily: 'Inter, sans-serif',
            color: '#fafafa',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Tagline
        this.add.text(centerX, 125, 'Survive the code', {
            fontSize: '16px',
            fontFamily: 'Inter, sans-serif',
            color: '#71717a'
        }).setOrigin(0.5);

        // Stats pill
        const gamesPlayed = gameData.data.stats.gamesPlayed;
        if (gamesPlayed > 0) {
            const statsBg = this.add.rectangle(centerX, 165, 140, 32, COLORS.surface, 1);
            statsBg.setStrokeStyle(1, COLORS.surfaceLight);

            this.add.text(centerX, 165, `${gamesPlayed} games played`, {
                fontSize: '12px',
                fontFamily: 'Inter, sans-serif',
                color: '#71717a'
            }).setOrigin(0.5);
        }

        // Settings button (top right)
        const settingsBtn = this.add.container(width - 24, 50);
        const settingsBg = this.add.circle(0, 0, 20, COLORS.surface);
        const settingsIcon = this.add.text(0, 0, '\u2699', {
            fontSize: '18px',
            color: '#71717a'
        }).setOrigin(0.5);

        settingsBtn.add([settingsBg, settingsIcon]);
        settingsBg.setInteractive({ useHandCursor: true });

        settingsBg.on('pointerover', () => {
            this.tweens.add({
                targets: settingsBg,
                fillColor: COLORS.surfaceLight,
                duration: 150
            });
        });

        settingsBg.on('pointerout', () => {
            this.tweens.add({
                targets: settingsBg,
                fillColor: COLORS.surface,
                duration: 150
            });
        });

        settingsBg.on('pointerdown', () => {
            this.tweens.add({
                targets: settingsBtn,
                scale: 0.9,
                duration: 50,
                yoyo: true,
                onComplete: () => {
                    this.cameras.main.fadeOut(200, 10, 10, 11);
                    this.time.delayedCall(200, () => {
                        this.scene.start('SettingsScene');
                    });
                }
            });
        });
    }

    createGameCards(width, height) {
        const centerX = width / 2;
        const cardWidth = width - 48;
        const cardHeight = 140;
        const startY = 230;
        const cardGap = 20;

        const games = [
            {
                key: 'GitSurvivorScene',
                title: 'Survivor',
                subtitle: 'Dodge bugs, survive waves',
                icon: '\u2694',
                color: COLORS.primary,
                highScore: gameData.getHighScore('gitSurvivor')
            },
            {
                key: 'SprintSurvivorScene',
                title: 'Sprint',
                subtitle: 'Endless runner, beat your distance',
                icon: '\u26A1',
                color: COLORS.success,
                highScore: gameData.getHighScore('sprintSurvivor')
            },
            {
                key: 'BugBountyScene',
                title: 'Debug',
                subtitle: 'Fix bugs, solve puzzles',
                icon: '\u{1F41B}',
                color: COLORS.warning,
                highScore: gameData.getStat('bugBounty', 'bestLevel'),
                highScoreLabel: 'Best Level'
            }
        ];

        games.forEach((game, index) => {
            const y = startY + (cardHeight + cardGap) * index;
            this.createGameCard(centerX, y, cardWidth, cardHeight, game, index);
        });
    }

    createGameCard(x, y, width, height, game, index) {
        const container = this.add.container(x, y);

        // Card background
        const bg = this.add.rectangle(0, 0, width, height, COLORS.surface, 1);
        bg.setStrokeStyle(1, COLORS.surfaceLight);

        // Accent bar on left
        const accent = this.add.rectangle(-width / 2 + 3, 0, 6, height - 20, game.color);

        // Icon
        const icon = this.add.text(-width / 2 + 40, -20, game.icon, {
            fontSize: '36px'
        }).setOrigin(0.5);

        // Title
        const title = this.add.text(-width / 2 + 80, -25, game.title, {
            fontSize: '22px',
            fontFamily: 'Inter, sans-serif',
            color: '#fafafa',
            fontStyle: '600'
        }).setOrigin(0, 0.5);

        // Subtitle
        const subtitle = this.add.text(-width / 2 + 80, 5, game.subtitle, {
            fontSize: '13px',
            fontFamily: 'Inter, sans-serif',
            color: '#71717a'
        }).setOrigin(0, 0.5);

        // High score badge
        if (game.highScore > 0) {
            const label = game.highScoreLabel || 'Best';
            const scoreBg = this.add.rectangle(width / 2 - 50, -20, 80, 28, COLORS.surfaceLight);
            const scoreText = this.add.text(width / 2 - 50, -20, `${label}: ${game.highScore}`, {
                fontSize: '11px',
                fontFamily: 'Inter, sans-serif',
                color: '#a1a1aa'
            }).setOrigin(0.5);
            container.add([scoreBg, scoreText]);
        }

        // Play button
        const playBtnX = width / 2 - 50;
        const playBtnY = 30;
        const playBtn = this.add.rectangle(playBtnX, playBtnY, 80, 36, game.color);
        const playText = this.add.text(playBtnX, playBtnY, 'Play', {
            fontSize: '14px',
            fontFamily: 'Inter, sans-serif',
            color: '#fafafa',
            fontStyle: '600'
        }).setOrigin(0.5);

        container.add([bg, accent, icon, title, subtitle, playBtn, playText]);

        // Make entire card interactive
        bg.setInteractive({ useHandCursor: true });

        bg.on('pointerover', () => {
            this.tweens.add({
                targets: container,
                scale: 1.02,
                duration: 150,
                ease: 'Quad.easeOut'
            });
            this.tweens.add({
                targets: bg,
                fillColor: COLORS.surfaceLight,
                duration: 150
            });
        });

        bg.on('pointerout', () => {
            this.tweens.add({
                targets: container,
                scale: 1,
                duration: 150,
                ease: 'Quad.easeOut'
            });
            this.tweens.add({
                targets: bg,
                fillColor: COLORS.surface,
                duration: 150
            });
        });

        bg.on('pointerdown', () => {
            this.tweens.add({
                targets: container,
                scale: 0.98,
                duration: 50,
                yoyo: true,
                onComplete: () => {
                    this.cameras.main.fadeOut(200, 10, 10, 11);
                    this.time.delayedCall(200, () => {
                        this.scene.start(game.key);
                    });
                }
            });
        });

        // Entrance animation
        container.alpha = 0;
        container.y = y + 30;
        this.tweens.add({
            targets: container,
            alpha: 1,
            y: y,
            duration: 400,
            delay: 100 + index * 100,
            ease: 'Quad.easeOut'
        });

        return container;
    }

    createFooter(width, height) {
        this.add.text(width / 2, height - 40, 'v2.0', {
            fontSize: '12px',
            fontFamily: 'Inter, sans-serif',
            color: '#52525b'
        }).setOrigin(0.5);
    }
}
