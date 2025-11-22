import Phaser from 'phaser';
import { rankedSystem } from '../utils/RankedSystem.js';

export default class RankedScene extends Phaser.Scene {
    constructor() {
        super({ key: 'RankedScene' });
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Background
        this.add.rectangle(0, 0, width, height, 0x1a1a2e).setOrigin(0);

        // Title
        this.add.text(width / 2, 40, '🏆 RANKED MODE', {
            fontSize: '48px',
            fontFamily: 'monospace',
            color: '#FFD700',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        const currentRank = rankedSystem.getCurrentRank();
        const tiers = rankedSystem.getRankTiers();
        const tier = tiers[currentRank.rank];

        // Rank display (large center)
        this.createRankDisplay(currentRank, tier);

        // Progress to next rank
        this.createProgressBar(currentRank);

        // Stats
        this.createStatsDisplay(currentRank);

        // Play ranked button
        this.createPlayButton();

        // Leaderboard button
        this.createLeaderboardButton();

        // Back button
        this.createBackButton();
    }

    createRankDisplay(currentRank, tier) {
        const width = this.cameras.main.width;
        const y = 150;

        // Rank icon
        this.add.text(width / 2, y, tier.icon, {
            fontSize: '128px'
        }).setOrigin(0.5);

        // Rank name
        this.add.text(width / 2, y + 100, rankedSystem.getRankDisplayName(), {
            fontSize: '32px',
            fontFamily: 'monospace',
            color: '#' + tier.color.toString(16).padStart(6, '0'),
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // MMR
        this.add.text(width / 2, y + 140, `MMR: ${currentRank.mmr}`, {
            fontSize: '16px',
            fontFamily: 'monospace',
            color: '#888888'
        }).setOrigin(0.5);

        // Placement status
        if (!currentRank.isPlaced) {
            this.add.text(width / 2, y + 170, `Placement Matches: ${currentRank.placementMatches}/10`, {
                fontSize: '14px',
                fontFamily: 'monospace',
                color: '#ffaa00'
            }).setOrigin(0.5);
        }
    }

    createProgressBar(currentRank) {
        const width = this.cameras.main.width;
        const y = 330;

        if (!currentRank.isPlaced) return;

        // LP Progress
        const progress = rankedSystem.getProgressToNextRank();

        this.add.text(width / 2, y - 20, `League Points: ${currentRank.lp}/100`, {
            fontSize: '14px',
            fontFamily: 'monospace',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Progress bar
        const barWidth = 600;
        const barHeight = 30;
        const barX = width / 2 - barWidth / 2;

        this.add.rectangle(barX, y, barWidth, barHeight, 0x333333).setOrigin(0);
        this.add.rectangle(barX, y, barWidth * (currentRank.lp / 100), barHeight, 0xFFD700).setOrigin(0);
        this.add.rectangle(barX, y, barWidth, barHeight).setStrokeStyle(2, 0xffffff).setOrigin(0);

        // Next rank
        this.add.text(width / 2, y + 45, `Next: ${progress.nextRank}`, {
            fontSize: '12px',
            fontFamily: 'monospace',
            color: '#888888'
        }).setOrigin(0.5);
    }

    createStatsDisplay(currentRank) {
        const width = this.cameras.main.width;
        const y = 420;

        const stats = [
            { label: 'Wins', value: currentRank.wins, color: '#4CAF50' },
            { label: 'Losses', value: currentRank.losses, color: '#E74C3C' },
            { label: 'Win Rate', value: `${currentRank.winRate}%`, color: '#2196F3' },
            { label: 'Win Streak', value: currentRank.winStreak, color: '#FF9800' }
        ];

        const startX = width / 2 - 300;
        const spacing = 150;

        stats.forEach((stat, index) => {
            const x = startX + (index * spacing);

            this.add.text(x, y, stat.value.toString(), {
                fontSize: '32px',
                fontFamily: 'monospace',
                color: stat.color,
                fontStyle: 'bold'
            }).setOrigin(0.5);

            this.add.text(x, y + 35, stat.label, {
                fontSize: '12px',
                fontFamily: 'monospace',
                color: '#888888'
            }).setOrigin(0.5);
        });
    }

    createPlayButton() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        const playBtn = this.add.text(width / 2, height - 150, '▶ PLAY RANKED', {
            fontSize: '24px',
            fontFamily: 'monospace',
            color: '#ffffff',
            backgroundColor: '#FFD700',
            padding: { x: 40, y: 15 }
        }).setOrigin(0.5);
        playBtn.setInteractive({ useHandCursor: true });

        playBtn.on('pointerdown', () => {
            // Show mode selection for ranked
            this.showModeSelection();
        });

        playBtn.on('pointerover', () => {
            playBtn.setStyle({ backgroundColor: '#FFA500' });
            playBtn.setScale(1.05);
        });

        playBtn.on('pointerout', () => {
            playBtn.setStyle({ backgroundColor: '#FFD700' });
            playBtn.setScale(1.0);
        });
    }

    showModeSelection() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Overlay
        const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.8);
        overlay.setOrigin(0);
        overlay.setDepth(100);

        // Selection box
        const box = this.add.rectangle(width / 2, height / 2, 600, 400, 0x1a1a2e);
        box.setStrokeStyle(3, 0xFFD700);
        box.setDepth(101);

        this.add.text(width / 2, height / 2 - 160, 'SELECT RANKED MODE', {
            fontSize: '24px',
            fontFamily: 'monospace',
            color: '#FFD700',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(102);

        const modes = [
            { name: 'Git Survivor', scene: 'GitSurvivorScene' },
            { name: 'Code Defense', scene: 'CodeDefenseScene' },
            { name: 'PR Rush', scene: 'PRRushScene' }
        ];

        modes.forEach((mode, index) => {
            const btn = this.add.text(width / 2, height / 2 - 80 + (index * 60), mode.name, {
                fontSize: '18px',
                fontFamily: 'monospace',
                color: '#ffffff',
                backgroundColor: '#333333',
                padding: { x: 30, y: 10 }
            }).setOrigin(0.5).setDepth(102);
            btn.setInteractive({ useHandCursor: true });

            btn.on('pointerdown', () => {
                this.scene.start(mode.scene, { ranked: true });
            });

            btn.on('pointerover', () => {
                btn.setStyle({ backgroundColor: '#555555' });
            });

            btn.on('pointerout', () => {
                btn.setStyle({ backgroundColor: '#333333' });
            });
        });

        // Cancel button
        const cancelBtn = this.add.text(width / 2, height / 2 + 150, '[ CANCEL ]', {
            fontSize: '14px',
            fontFamily: 'monospace',
            color: '#ff0000',
            backgroundColor: '#333333',
            padding: { x: 15, y: 8 }
        }).setOrigin(0.5).setDepth(102);
        cancelBtn.setInteractive({ useHandCursor: true });

        cancelBtn.on('pointerdown', () => {
            overlay.destroy();
            box.destroy();
            this.scene.restart();
        });
    }

    createLeaderboardButton() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        const lbBtn = this.add.text(width / 2, height - 90, '📊 VIEW LEADERBOARD', {
            fontSize: '16px',
            fontFamily: 'monospace',
            color: '#ffffff',
            backgroundColor: '#333333',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5);
        lbBtn.setInteractive({ useHandCursor: true });

        lbBtn.on('pointerdown', () => {
            this.showLeaderboard();
        });

        lbBtn.on('pointerover', () => {
            lbBtn.setStyle({ backgroundColor: '#555555' });
        });

        lbBtn.on('pointerout', () => {
            lbBtn.setStyle({ backgroundColor: '#333333' });
        });
    }

    showLeaderboard() {
        // In a real game, fetch from server
        const leaderboard = rankedSystem.getLeaderboard();

        alert(`Your Rank: #${leaderboard.playerRank}\nMMR: ${leaderboard.playerMMR}\n\nTop players would be displayed here in full UI!`);
    }

    createBackButton() {
        const backBtn = this.add.text(20, 20, '← BACK', {
            fontSize: '14px',
            fontFamily: 'monospace',
            color: '#ffffff',
            backgroundColor: '#333333',
            padding: { x: 10, y: 5 }
        });
        backBtn.setInteractive({ useHandCursor: true });

        backBtn.on('pointerdown', () => {
            this.cameras.main.fade(250, 0, 0, 0);
            this.time.delayedCall(250, () => {
                this.scene.start('MainMenuScene');
            });
        });

        backBtn.on('pointerover', () => {
            backBtn.setStyle({ backgroundColor: '#555555' });
        });

        backBtn.on('pointerout', () => {
            backBtn.setStyle({ backgroundColor: '#333333' });
        });
    }
}
