import Phaser from 'phaser';
import { gameData } from '../utils/GameData.js';
import { battlePassSystem } from '../utils/BattlePassSystem.js';

export default class BattlePassScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BattlePassScene' });
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Background
        this.add.rectangle(0, 0, width, height, 0x1a1a2e).setOrigin(0);

        // Title
        this.add.text(width / 2, 40, '🎖️ BATTLE PASS', {
            fontSize: '48px',
            fontFamily: 'monospace',
            color: '#9370DB',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Get current season
        const season = battlePassSystem.getCurrentSeason();
        const progress = battlePassSystem.getProgress();

        // Season info
        this.add.text(width / 2, 100, `Season ${season.number}: ${season.name}`, {
            fontSize: '20px',
            fontFamily: 'monospace',
            color: '#ffffff'
        }).setOrigin(0.5);

        this.add.text(width / 2, 130, `${season.daysRemaining} days remaining`, {
            fontSize: '14px',
            fontFamily: 'monospace',
            color: '#888888'
        }).setOrigin(0.5);

        // XP Progress bar
        const progressBarWidth = 600;
        const progressBarHeight = 30;
        const progressBarX = width / 2 - progressBarWidth / 2;
        const progressBarY = 160;

        this.add.rectangle(progressBarX, progressBarY, progressBarWidth, progressBarHeight, 0x333333).setOrigin(0);
        this.add.rectangle(progressBarX, progressBarY, progressBarWidth * progress.progress, progressBarHeight, 0x9370DB).setOrigin(0);
        this.add.rectangle(progressBarX, progressBarY, progressBarWidth, progressBarHeight).setStrokeStyle(2, 0xffffff).setOrigin(0);

        this.add.text(width / 2, progressBarY + 15, `Tier ${progress.tier} - ${progress.xp}/${progress.requiredXP} XP`, {
            fontSize: '14px',
            fontFamily: 'monospace',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Tier display (show current tier and next 4 tiers)
        this.createTierDisplay(progress.tier);

        // Tabs: Tiers / Missions / Info
        this.createTabs();

        // Premium status
        if (!progress.premium) {
            const premiumBtn = this.add.text(width - 20, 20, '✨ UNLOCK PREMIUM', {
                fontSize: '14px',
                fontFamily: 'monospace',
                color: '#ffffff',
                backgroundColor: '#FFD700',
                padding: { x: 15, y: 8 }
            }).setOrigin(1, 0);
            premiumBtn.setInteractive({ useHandCursor: true });

            premiumBtn.on('pointerdown', () => {
                battlePassSystem.purchasePremium();
                this.scene.restart();
            });

            premiumBtn.on('pointerover', () => {
                premiumBtn.setStyle({ backgroundColor: '#FFA500' });
            });

            premiumBtn.on('pointerout', () => {
                premiumBtn.setStyle({ backgroundColor: '#FFD700' });
            });
        } else {
            this.add.text(width - 20, 20, '✨ PREMIUM ACTIVE', {
                fontSize: '14px',
                fontFamily: 'monospace',
                color: '#FFD700',
                backgroundColor: '#333333',
                padding: { x: 15, y: 8 }
            }).setOrigin(1, 0);
        }

        // Back button
        this.createBackButton();
    }

    createTierDisplay(currentTier) {
        const width = this.cameras.main.width;
        const startY = 230;
        const tierWidth = 120;
        const spacing = 10;

        // Show 5 tiers centered on current tier
        const startTier = Math.max(1, currentTier - 2);

        for (let i = 0; i < 5; i++) {
            const tier = startTier + i;
            if (tier > 50) break;

            const x = width / 2 - (tierWidth * 2.5) - (spacing * 2) + (i * (tierWidth + spacing));
            const y = startY;

            const isCurrent = tier === currentTier;
            const isCompleted = tier < currentTier;

            // Tier box
            const boxColor = isCurrent ? 0x9370DB : (isCompleted ? 0x4CAF50 : 0x333333);
            const box = this.add.rectangle(x, y, tierWidth, 180, boxColor, 0.8);
            box.setStrokeStyle(isCurrent ? 4 : 2, isCurrent ? 0xFFD700 : 0xffffff);

            // Tier number
            this.add.text(x, y - 70, `TIER ${tier}`, {
                fontSize: '16px',
                fontFamily: 'monospace',
                color: '#ffffff',
                fontStyle: 'bold'
            }).setOrigin(0.5);

            // Free reward
            const freeReward = battlePassSystem.getTierReward(tier, false);
            this.add.text(x, y - 40, '🆓 FREE', {
                fontSize: '10px',
                fontFamily: 'monospace',
                color: '#888888'
            }).setOrigin(0.5);

            this.add.text(x, y - 20, this.getRewardText(freeReward), {
                fontSize: '12px',
                fontFamily: 'monospace',
                color: '#ffffff'
            }).setOrigin(0.5);

            // Premium reward
            const premiumReward = battlePassSystem.getTierReward(tier, true);
            this.add.text(x, y + 10, '✨ PREMIUM', {
                fontSize: '10px',
                fontFamily: 'monospace',
                color: '#FFD700'
            }).setOrigin(0.5);

            this.add.text(x, y + 30, this.getRewardText(premiumReward), {
                fontSize: '12px',
                fontFamily: 'monospace',
                color: '#ffffff'
            }).setOrigin(0.5);

            // Claim button if tier is completed and not claimed
            if (isCompleted) {
                const claimed = battlePassSystem.isTierClaimed(tier);
                if (!claimed) {
                    const claimBtn = this.add.text(x, y + 60, '[ CLAIM ]', {
                        fontSize: '12px',
                        fontFamily: 'monospace',
                        color: '#00ff00',
                        backgroundColor: '#333333',
                        padding: { x: 8, y: 4 }
                    }).setOrigin(0.5);
                    claimBtn.setInteractive({ useHandCursor: true });

                    claimBtn.on('pointerdown', () => {
                        battlePassSystem.claimTier(tier);
                        this.scene.restart();
                    });
                } else {
                    this.add.text(x, y + 60, '✓ CLAIMED', {
                        fontSize: '10px',
                        fontFamily: 'monospace',
                        color: '#4CAF50'
                    }).setOrigin(0.5);
                }
            }
        }
    }

    createTabs() {
        const width = this.cameras.main.width;
        const tabY = 450;

        // Missions tab
        const missionsBtn = this.add.text(width / 2 - 150, tabY, '📋 WEEKLY MISSIONS', {
            fontSize: '14px',
            fontFamily: 'monospace',
            color: '#ffffff',
            backgroundColor: '#333333',
            padding: { x: 12, y: 8 }
        }).setOrigin(0.5);
        missionsBtn.setInteractive({ useHandCursor: true });

        missionsBtn.on('pointerdown', () => {
            this.showMissions();
        });

        // Info tab
        const infoBtn = this.add.text(width / 2 + 150, tabY, 'ℹ️ SEASON INFO', {
            fontSize: '14px',
            fontFamily: 'monospace',
            color: '#ffffff',
            backgroundColor: '#333333',
            padding: { x: 12, y: 8 }
        }).setOrigin(0.5);
        infoBtn.setInteractive({ useHandCursor: true });

        infoBtn.on('pointerdown', () => {
            this.showSeasonInfo();
        });
    }

    showMissions() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Clear existing content below tabs
        // Create missions display
        const missions = battlePassSystem.getWeeklyMissions();
        const startY = 500;

        missions.forEach((mission, index) => {
            const y = startY + (index * 50);

            const isComplete = mission.progress >= mission.requirement;
            const bgColor = isComplete ? 0x4CAF50 : 0x333333;

            const box = this.add.rectangle(width / 2, y, 700, 45, bgColor, 0.8);
            box.setStrokeStyle(1, 0xffffff);

            this.add.text(width / 2 - 330, y, mission.name, {
                fontSize: '14px',
                fontFamily: 'monospace',
                color: '#ffffff',
                fontStyle: 'bold'
            }).setOrigin(0, 0.5);

            this.add.text(width / 2 - 330, y + 15, mission.description, {
                fontSize: '10px',
                fontFamily: 'monospace',
                color: '#aaaaaa'
            }).setOrigin(0, 0.5);

            this.add.text(width / 2 + 250, y, `${mission.progress}/${mission.requirement}`, {
                fontSize: '12px',
                fontFamily: 'monospace',
                color: '#ffffff'
            }).setOrigin(0.5);

            this.add.text(width / 2 + 330, y, `+${mission.reward} XP`, {
                fontSize: '12px',
                fontFamily: 'monospace',
                color: '#9370DB'
            }).setOrigin(1, 0.5);
        });
    }

    showSeasonInfo() {
        const width = this.cameras.main.width;
        const startY = 500;

        const season = battlePassSystem.getCurrentSeason();

        const info = [
            `Season ${season.number}: ${season.name}`,
            ``,
            `Duration: ${season.daysRemaining} days remaining`,
            `Total Tiers: 50`,
            ``,
            `Free Track: Coins, XP, Basic Items`,
            `Premium Track: Exclusive Skins, Pets, Emotes`,
            ``,
            `Complete Weekly Missions for XP!`,
            `Play any game mode to earn XP!`
        ];

        info.forEach((line, index) => {
            this.add.text(width / 2, startY + (index * 25), line, {
                fontSize: '14px',
                fontFamily: 'monospace',
                color: '#ffffff',
                align: 'center'
            }).setOrigin(0.5);
        });
    }

    getRewardText(reward) {
        if (!reward) return '-';

        switch (reward.type) {
            case 'coins':
                return `${reward.amount} 💰`;
            case 'xp':
                return `${reward.amount} XP`;
            case 'skin':
                return `Skin`;
            case 'emote':
                return `Emote`;
            case 'pet':
                return `Pet`;
            case 'title':
                return `Title`;
            default:
                return reward.type;
        }
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
