import Phaser from 'phaser';
import { dailyWeeklyRuns } from '../utils/DailyWeeklyRuns.js';
import { dailyChallenges } from '../utils/DailyChallenges.js';

export default class ChallengesScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ChallengesScene' });
        this.currentTab = 'daily';
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Background
        this.add.rectangle(0, 0, width, height, 0x1a1a2e).setOrigin(0);

        // Title
        this.add.text(width / 2, 40, '🎯 CHALLENGES', {
            fontSize: '48px',
            fontFamily: 'monospace',
            color: '#F39C12',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Tabs
        this.createTabs();

        // Content
        this.showContent();

        // Back button
        this.createBackButton();
    }

    createTabs() {
        const width = this.cameras.main.width;
        const tabY = 120;

        const tabs = [
            { id: 'daily', label: '📅 Daily Run' },
            { id: 'weekly', label: '🗓️ Weekly Run' },
            { id: 'challenges', label: '✨ Daily Challenges' }
        ];

        tabs.forEach((tab, index) => {
            const x = width / 2 - 250 + (index * 180);
            const isActive = this.currentTab === tab.id;

            const btn = this.add.text(x, tabY, tab.label, {
                fontSize: '14px',
                fontFamily: 'monospace',
                color: isActive ? '#ffffff' : '#888888',
                backgroundColor: isActive ? '#F39C12' : '#333333',
                padding: { x: 12, y: 8 }
            }).setOrigin(0.5);
            btn.setInteractive({ useHandCursor: true });

            btn.on('pointerdown', () => {
                this.currentTab = tab.id;
                this.scene.restart();
            });
        });
    }

    showContent() {
        switch (this.currentTab) {
            case 'daily':
                this.showDailyRun();
                break;
            case 'weekly':
                this.showWeeklyRun();
                break;
            case 'challenges':
                this.showDailyChallenges();
                break;
        }
    }

    showDailyRun() {
        const width = this.cameras.main.width;
        const stats = dailyWeeklyRuns.getRunStats();
        const dailyRun = dailyWeeklyRuns.getDailyRunConfig();

        let y = 200;

        // Title
        this.add.text(width / 2, y, 'DAILY RUN', {
            fontSize: '24px',
            fontFamily: 'monospace',
            color: '#F39C12',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        y += 50;

        // Mode and modifiers
        this.add.text(width / 2, y, `Mode: ${dailyRun.mode}`, {
            fontSize: '16px',
            fontFamily: 'monospace',
            color: '#ffffff'
        }).setOrigin(0.5);

        y += 40;

        this.add.text(width / 2, y, 'ACTIVE MODIFIERS:', {
            fontSize: '14px',
            fontFamily: 'monospace',
            color: '#888888'
        }).setOrigin(0.5);

        y += 30;

        dailyRun.modifiers.forEach((mod, index) => {
            this.add.text(width / 2, y + (index * 30), `${mod.icon} ${mod.name} - ${mod.description}`, {
                fontSize: '12px',
                fontFamily: 'monospace',
                color: '#ffffff'
            }).setOrigin(0.5);
        });

        y += dailyRun.modifiers.length * 30 + 40;

        // Stats
        this.add.text(width / 2 - 150, y, `Best Score: ${stats.daily.bestScore}`, {
            fontSize: '14px',
            fontFamily: 'monospace',
            color: '#4CAF50'
        });

        this.add.text(width / 2 + 150, y, `Attempts: ${stats.daily.attempts}`, {
            fontSize: '14px',
            fontFamily: 'monospace',
            color: '#2196F3'
        }).setOrigin(1, 0);

        y += 50;

        // Play button or time remaining
        if (stats.daily.available) {
            const playBtn = this.add.text(width / 2, y, '▶ PLAY DAILY RUN', {
                fontSize: '20px',
                fontFamily: 'monospace',
                color: '#ffffff',
                backgroundColor: '#F39C12',
                padding: { x: 30, y: 12 }
            }).setOrigin(0.5);
            playBtn.setInteractive({ useHandCursor: true });

            playBtn.on('pointerdown', () => {
                dailyWeeklyRuns.startRun('daily');
                this.scene.start(dailyRun.mode, { dailyRun: true });
            });

            playBtn.on('pointerover', () => {
                playBtn.setScale(1.05);
            });

            playBtn.on('pointerout', () => {
                playBtn.setScale(1.0);
            });
        } else {
            const timeRemaining = dailyWeeklyRuns.getTimeUntilNextDaily();
            this.add.text(width / 2, y, `Next run in: ${timeRemaining.hours}h ${timeRemaining.minutes}m`, {
                fontSize: '16px',
                fontFamily: 'monospace',
                color: '#888888'
            }).setOrigin(0.5);
        }
    }

    showWeeklyRun() {
        const width = this.cameras.main.width;
        const stats = dailyWeeklyRuns.getRunStats();
        const weeklyRun = dailyWeeklyRuns.getWeeklyRunConfig();

        let y = 200;

        // Title
        this.add.text(width / 2, y, 'WEEKLY RUN', {
            fontSize: '24px',
            fontFamily: 'monospace',
            color: '#F39C12',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        y += 50;

        // Mode and modifiers
        this.add.text(width / 2, y, `Mode: ${weeklyRun.mode}`, {
            fontSize: '16px',
            fontFamily: 'monospace',
            color: '#ffffff'
        }).setOrigin(0.5);

        y += 40;

        this.add.text(width / 2, y, 'ACTIVE MODIFIERS:', {
            fontSize: '14px',
            fontFamily: 'monospace',
            color: '#888888'
        }).setOrigin(0.5);

        y += 30;

        weeklyRun.modifiers.forEach((mod, index) => {
            this.add.text(width / 2, y + (index * 30), `${mod.icon} ${mod.name} - ${mod.description}`, {
                fontSize: '12px',
                fontFamily: 'monospace',
                color: '#ffffff'
            }).setOrigin(0.5);
        });

        y += weeklyRun.modifiers.length * 30 + 40;

        // Stats
        this.add.text(width / 2 - 150, y, `Best Score: ${stats.weekly.bestScore}`, {
            fontSize: '14px',
            fontFamily: 'monospace',
            color: '#4CAF50'
        });

        this.add.text(width / 2 + 150, y, `Attempts: ${stats.weekly.attempts}`, {
            fontSize: '14px',
            fontFamily: 'monospace',
            color: '#2196F3'
        }).setOrigin(1, 0);

        y += 50;

        // Play button or time remaining
        if (stats.weekly.available) {
            const playBtn = this.add.text(width / 2, y, '▶ PLAY WEEKLY RUN', {
                fontSize: '20px',
                fontFamily: 'monospace',
                color: '#ffffff',
                backgroundColor: '#9C27B0',
                padding: { x: 30, y: 12 }
            }).setOrigin(0.5);
            playBtn.setInteractive({ useHandCursor: true });

            playBtn.on('pointerdown', () => {
                dailyWeeklyRuns.startRun('weekly');
                this.scene.start(weeklyRun.mode, { weeklyRun: true });
            });

            playBtn.on('pointerover', () => {
                playBtn.setScale(1.05);
            });

            playBtn.on('pointerout', () => {
                playBtn.setScale(1.0);
            });
        } else {
            const timeRemaining = dailyWeeklyRuns.getTimeUntilNextWeekly();
            this.add.text(width / 2, y, `Next run in: ${timeRemaining.days}d ${timeRemaining.hours}h`, {
                fontSize: '16px',
                fontFamily: 'monospace',
                color: '#888888'
            }).setOrigin(0.5);
        }
    }

    showDailyChallenges() {
        const width = this.cameras.main.width;
        const challenges = dailyChallenges.getTodayChallenges();

        let y = 200;

        this.add.text(width / 2, y, 'TODAY\'S CHALLENGES', {
            fontSize: '24px',
            fontFamily: 'monospace',
            color: '#F39C12',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        y += 50;

        challenges.forEach((challenge, index) => {
            const yPos = y + (index * 100);

            const box = this.add.rectangle(width / 2, yPos, 700, 90, 0x333333, 0.8);
            box.setStrokeStyle(2, challenge.completed ? 0x4CAF50 : 0x666666);

            // Challenge name
            this.add.text(width / 2 - 330, yPos - 25, challenge.name, {
                fontSize: '16px',
                fontFamily: 'monospace',
                color: '#ffffff',
                fontStyle: 'bold'
            });

            // Description
            this.add.text(width / 2 - 330, yPos, challenge.description, {
                fontSize: '12px',
                fontFamily: 'monospace',
                color: '#aaaaaa'
            });

            // Progress
            this.add.text(width / 2 - 330, yPos + 25, `Progress: ${challenge.progress}/${challenge.requirement}`, {
                fontSize: '12px',
                fontFamily: 'monospace',
                color: challenge.completed ? '#4CAF50' : '#F39C12'
            });

            // Reward
            this.add.text(width / 2 + 280, yPos, `${challenge.reward} 💰`, {
                fontSize: '14px',
                fontFamily: 'monospace',
                color: '#FFD700'
            }).setOrigin(1, 0.5);

            // Claim button if completed
            if (challenge.completed && !challenge.claimed) {
                const claimBtn = this.add.text(width / 2 + 330, yPos, '[ CLAIM ]', {
                    fontSize: '12px',
                    fontFamily: 'monospace',
                    color: '#00ff00',
                    backgroundColor: '#333333',
                    padding: { x: 8, y: 4 }
                }).setOrigin(1, 0.5);
                claimBtn.setInteractive({ useHandCursor: true });

                claimBtn.on('pointerdown', () => {
                    dailyChallenges.claimReward(challenge.id);
                    this.scene.restart();
                });
            } else if (challenge.claimed) {
                this.add.text(width / 2 + 330, yPos, '✓ CLAIMED', {
                    fontSize: '10px',
                    fontFamily: 'monospace',
                    color: '#4CAF50'
                }).setOrigin(1, 0.5);
            }
        });
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
