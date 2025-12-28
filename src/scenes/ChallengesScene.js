/**
 * ChallengesScene - View daily and weekly challenges
 */

import Phaser from 'phaser';
import { logger } from '../utils/Logger.js';
import { COLORS, TEXT_STYLES } from '../utils/Theme.js';
import { challengeSystem } from '../utils/ChallengeSystem.js';

export default class ChallengesScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ChallengesScene' });
        this.currentTab = 'daily';
    }

    create() {
        const { width, height } = this.cameras.main;

        // Background
        this.add.rectangle(0, 0, width, height, COLORS.background).setOrigin(0);

        // Title
        this.add.text(width / 2, 40, 'Challenges', TEXT_STYLES.title).setOrigin(0.5);

        // Stats
        const stats = challengeSystem.getStats();
        this.add.text(width / 2, 80, `Total Completed: ${stats.totalCompleted} | Rewards: ${stats.totalRewards}`, {
            ...TEXT_STYLES.small,
            color: COLORS.accentHex
        }).setOrigin(0.5);

        // Tabs
        this.createTabs();

        // Back button
        this.createBackButton();

        // Challenge container
        this.challengeContainer = this.add.container(0, 180);

        // Load challenges
        this.loadChallenges();

        // Update timer
        this.time.addEvent({
            delay: 1000,
            callback: this.updateTimers,
            callbackScope: this,
            loop: true
        });

        logger.info('ChallengesScene', 'Scene created');
    }

    createTabs() {
        const { width } = this.cameras.main;
        const tabs = ['daily', 'weekly'];

        tabs.forEach((tab, i) => {
            const x = width / 2 - 80 + i * 160;
            const isActive = tab === this.currentTab;

            const tabBtn = this.add.text(x, 130, tab.toUpperCase(), {
                fontSize: '16px',
                fontFamily: 'monospace',
                color: isActive ? '#000000' : COLORS.textSecondary,
                backgroundColor: isActive ? COLORS.primaryHex : COLORS.buttonBg,
                padding: { x: 20, y: 8 }
            }).setOrigin(0.5);

            tabBtn.setInteractive({ useHandCursor: true });
            tabBtn.on('pointerdown', () => {
                this.currentTab = tab;
                this.scene.restart();
            });
        });
    }

    loadChallenges() {
        this.challengeContainer.removeAll(true);
        const { width } = this.cameras.main;

        const challenges = this.currentTab === 'daily'
            ? challengeSystem.getDailyChallenges()
            : challengeSystem.getWeeklyChallenges();

        // Time remaining
        const timeRemaining = this.currentTab === 'daily'
            ? challengeSystem.getDailyTimeRemaining()
            : challengeSystem.getWeeklyTimeRemaining();

        this.timerText = this.add.text(width / 2, 0, '', {
            fontSize: '14px',
            fontFamily: 'monospace',
            color: COLORS.warningHex
        }).setOrigin(0.5);
        this.challengeContainer.add(this.timerText);
        this.updateTimers();

        // Challenges
        challenges.forEach((challenge, i) => {
            this.createChallengeCard(challenge, width / 2, 40 + i * 120, this.currentTab === 'weekly');
        });

        // Streaks
        const streaks = challengeSystem.getStreaks();
        const streakY = 40 + challenges.length * 120 + 20;

        this.add.text(width / 2, streakY + 180, `Current Streak: ${streaks.daily} days`, {
            ...TEXT_STYLES.body,
            color: COLORS.goldHex
        }).setOrigin(0.5);

        this.add.text(width / 2, streakY + 205, `Best Streak: ${streaks.best} days`, {
            ...TEXT_STYLES.small
        }).setOrigin(0.5);
    }

    createChallengeCard(challenge, x, y, isWeekly) {
        const cardWidth = 500;
        const cardHeight = 100;
        const isCompleted = challenge.completed;
        const isClaimed = challenge.claimedReward;

        // Card background
        const bgColor = isCompleted
            ? (isClaimed ? 0x2a4a2a : 0x2a2a4e)
            : 0x1a1a2e;
        const bg = this.add.rectangle(x, y + cardHeight / 2, cardWidth, cardHeight, bgColor);
        bg.setStrokeStyle(2, isCompleted ? COLORS.primary : 0x333333);
        this.challengeContainer.add(bg);

        // Tier badge
        const tierColors = { easy: '#00ff00', medium: '#ffaa00', hard: '#ff4444' };
        const tierBadge = this.add.text(x - cardWidth / 2 + 40, y + 20,
            challenge.tier.toUpperCase(), {
                fontSize: '10px',
                fontFamily: 'monospace',
                color: tierColors[challenge.tier] || '#ffffff',
                backgroundColor: '#333333',
                padding: { x: 5, y: 2 }
            }).setOrigin(0.5);
        this.challengeContainer.add(tierBadge);

        // Description
        const desc = this.add.text(x - cardWidth / 2 + 20, y + 45, challenge.displayDescription, {
            fontSize: '14px',
            fontFamily: 'monospace',
            color: isCompleted ? '#00ff00' : '#ffffff',
            wordWrap: { width: cardWidth - 150 }
        });
        this.challengeContainer.add(desc);

        // Progress bar
        const progressWidth = cardWidth - 40;
        const progressBg = this.add.rectangle(x, y + 80, progressWidth, 12, 0x333333);
        this.challengeContainer.add(progressBg);

        const progress = Math.min(challenge.progress / challenge.target, 1);
        if (progress > 0) {
            const progressFill = this.add.rectangle(
                x - progressWidth / 2 + (progressWidth * progress) / 2,
                y + 80,
                progressWidth * progress,
                12,
                isCompleted ? COLORS.primary : COLORS.accent
            );
            this.challengeContainer.add(progressFill);
        }

        // Progress text
        const progressText = this.add.text(x, y + 80,
            `${challenge.progress}/${challenge.target}`, {
                fontSize: '10px',
                fontFamily: 'monospace',
                color: '#ffffff'
            }).setOrigin(0.5);
        this.challengeContainer.add(progressText);

        // Reward/Claim button
        if (isCompleted && !isClaimed) {
            const claimBtn = this.add.text(x + cardWidth / 2 - 60, y + 40, 'CLAIM', {
                fontSize: '14px',
                fontFamily: 'monospace',
                color: '#000000',
                backgroundColor: COLORS.goldHex,
                padding: { x: 10, y: 5 }
            }).setOrigin(0.5);
            claimBtn.setInteractive({ useHandCursor: true });
            claimBtn.on('pointerdown', () => {
                const reward = challengeSystem.claimReward(challenge.id, isWeekly);
                if (reward) {
                    this.showRewardPopup(reward);
                    this.scene.restart();
                }
            });
            this.challengeContainer.add(claimBtn);
        } else if (isClaimed) {
            const claimedText = this.add.text(x + cardWidth / 2 - 60, y + 40, 'CLAIMED', {
                fontSize: '12px',
                fontFamily: 'monospace',
                color: '#666666'
            }).setOrigin(0.5);
            this.challengeContainer.add(claimedText);
        } else {
            // Show reward amount
            const rewardAmounts = { easy: 50, medium: 100, hard: 200 };
            const weeklyMultiplier = isWeekly ? 3 : 1;
            const rewardText = this.add.text(x + cardWidth / 2 - 60, y + 40,
                `+${rewardAmounts[challenge.tier] * weeklyMultiplier}`, {
                    fontSize: '16px',
                    fontFamily: 'monospace',
                    color: COLORS.goldHex
                }).setOrigin(0.5);
            this.challengeContainer.add(rewardText);
        }
    }

    updateTimers() {
        if (!this.timerText) return;

        const timeRemaining = this.currentTab === 'daily'
            ? challengeSystem.getDailyTimeRemaining()
            : challengeSystem.getWeeklyTimeRemaining();

        const formatted = challengeSystem.formatTimeRemaining(timeRemaining);
        this.timerText.setText(`Resets in: ${formatted}`);
    }

    showRewardPopup(reward) {
        const { width, height } = this.cameras.main;

        const popup = this.add.container(width / 2, height / 2);
        popup.setDepth(1000);

        const bg = this.add.rectangle(0, 0, 300, 150, 0x000000, 0.9);
        bg.setStrokeStyle(3, COLORS.gold);
        popup.add(bg);

        popup.add(this.add.text(0, -40, 'REWARD CLAIMED!', {
            fontSize: '20px',
            fontFamily: 'monospace',
            color: COLORS.goldHex,
            fontStyle: 'bold'
        }).setOrigin(0.5));

        popup.add(this.add.text(0, 10, `+${reward.points} Points`, {
            fontSize: '24px',
            fontFamily: 'monospace',
            color: '#ffffff'
        }).setOrigin(0.5));

        this.tweens.add({
            targets: popup,
            alpha: 0,
            y: height / 2 - 50,
            duration: 2000,
            delay: 1000,
            onComplete: () => popup.destroy()
        });
    }

    createBackButton() {
        const backBtn = this.add.text(20, 20, '← Back', TEXT_STYLES.buttonSmall);
        backBtn.setInteractive({ useHandCursor: true });
        backBtn.on('pointerdown', () => this.scene.start('StatsScene'));
        backBtn.on('pointerover', () => backBtn.setStyle({ backgroundColor: COLORS.buttonHover }));
        backBtn.on('pointerout', () => backBtn.setStyle({ backgroundColor: COLORS.buttonBg }));
    }
}
