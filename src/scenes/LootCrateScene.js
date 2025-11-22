import Phaser from 'phaser';
import { lootCrateSystem } from '../utils/LootCrateSystem.js';

export default class LootCrateScene extends Phaser.Scene {
    constructor() {
        super({ key: 'LootCrateScene' });
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Background
        this.add.rectangle(0, 0, width, height, 0x1a1a2e).setOrigin(0);

        // Title
        this.add.text(width / 2, 40, '🎁 LOOT CRATES', {
            fontSize: '48px',
            fontFamily: 'monospace',
            color: '#9B59B6',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Get unopened crates
        this.unopenedCrates = lootCrateSystem.getUnopenedCrates();

        // Stats
        const stats = lootCrateSystem.getStats();
        this.add.text(width / 2, 100, `Total Opened: ${stats.totalOpened} | Crates Available: ${this.unopenedCrates.length}`, {
            fontSize: '14px',
            fontFamily: 'monospace',
            color: '#888888'
        }).setOrigin(0.5);

        // Display crates
        this.displayCrates();

        // Open all button
        if (this.unopenedCrates.length > 1) {
            this.createOpenAllButton();
        }

        // Back button
        this.createBackButton();
    }

    displayCrates() {
        const width = this.cameras.main.width;
        const startY = 160;

        if (this.unopenedCrates.length === 0) {
            this.add.text(width / 2, 350, 'No crates available', {
                fontSize: '20px',
                fontFamily: 'monospace',
                color: '#888888'
            }).setOrigin(0.5);

            this.add.text(width / 2, 400, 'Earn crates by playing games!', {
                fontSize: '14px',
                fontFamily: 'monospace',
                color: '#666666'
            }).setOrigin(0.5);

            // Give player a free common crate for demo
            const giftBtn = this.add.text(width / 2, 460, '🎁 CLAIM FREE CRATE', {
                fontSize: '16px',
                fontFamily: 'monospace',
                color: '#ffffff',
                backgroundColor: '#4CAF50',
                padding: { x: 20, y: 10 }
            }).setOrigin(0.5);
            giftBtn.setInteractive({ useHandCursor: true });

            giftBtn.on('pointerdown', () => {
                lootCrateSystem.earnCrate('common', 'gift');
                this.scene.restart();
            });

            return;
        }

        // Group crates by rarity
        const grouped = {};
        this.unopenedCrates.forEach(crate => {
            if (!grouped[crate.rarity]) {
                grouped[crate.rarity] = [];
            }
            grouped[crate.rarity].push(crate);
        });

        let y = startY;

        Object.keys(grouped).forEach((rarity) => {
            const crates = grouped[rarity];
            const rarityInfo = lootCrateSystem.getRarityInfo(rarity);

            // Rarity header
            this.add.text(width / 2 - 300, y, `${rarityInfo.icon} ${rarityInfo.name.toUpperCase()} (${crates.length})`, {
                fontSize: '18px',
                fontFamily: 'monospace',
                color: '#' + rarityInfo.color.toString(16).padStart(6, '0'),
                fontStyle: 'bold'
            });

            y += 40;

            // Display first 3 crates of this rarity
            const cratesToShow = crates.slice(0, 3);
            const startX = width / 2 - 200;

            cratesToShow.forEach((crate, index) => {
                const x = startX + (index * 140);

                // Crate box
                const box = this.add.rectangle(x, y, 120, 120, rarityInfo.color, 0.3);
                box.setStrokeStyle(3, rarityInfo.color);
                box.setInteractive({ useHandCursor: true });

                // Crate icon
                this.add.text(x, y - 10, rarityInfo.icon, {
                    fontSize: '64px'
                }).setOrigin(0.5);

                // Open button
                const openBtn = this.add.text(x, y + 50, '[ OPEN ]', {
                    fontSize: '12px',
                    fontFamily: 'monospace',
                    color: '#ffffff',
                    backgroundColor: '#333333',
                    padding: { x: 8, y: 4 }
                }).setOrigin(0.5);
                openBtn.setInteractive({ useHandCursor: true });

                openBtn.on('pointerdown', () => {
                    this.openCrate(crate);
                });

                // Hover effect on box
                box.on('pointerdown', () => {
                    this.openCrate(crate);
                });

                box.on('pointerover', () => {
                    box.setScale(1.05);
                });

                box.on('pointerout', () => {
                    box.setScale(1.0);
                });
            });

            y += 150;
        });
    }

    openCrate(crate) {
        const result = lootCrateSystem.openCrate(crate.id);

        if (result.success) {
            this.showRewards(result.rewards, crate.rarity);
        }
    }

    showRewards(rewards, rarity) {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const rarityInfo = lootCrateSystem.getRarityInfo(rarity);

        // Overlay
        const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.9);
        overlay.setOrigin(0);
        overlay.setDepth(100);

        // Rewards box
        const box = this.add.rectangle(width / 2, height / 2, 700, 500, 0x1a1a2e);
        box.setStrokeStyle(4, rarityInfo.color);
        box.setDepth(101);

        // Title
        this.add.text(width / 2, height / 2 - 220, `${rarityInfo.icon} ${rarityInfo.name.toUpperCase()} CRATE`, {
            fontSize: '32px',
            fontFamily: 'monospace',
            color: '#' + rarityInfo.color.toString(16).padStart(6, '0'),
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(102);

        // Rewards
        let y = height / 2 - 150;

        rewards.forEach((reward, index) => {
            const rewardText = this.getRewardText(reward);

            this.add.text(width / 2, y + (index * 40), rewardText, {
                fontSize: '18px',
                fontFamily: 'monospace',
                color: '#ffffff'
            }).setOrigin(0.5).setDepth(102);
        });

        // Close button
        const closeBtn = this.add.text(width / 2, height / 2 + 200, '[ CONTINUE ]', {
            fontSize: '16px',
            fontFamily: 'monospace',
            color: '#ffffff',
            backgroundColor: rarityInfo.color,
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setDepth(102);
        closeBtn.setInteractive({ useHandCursor: true });

        closeBtn.on('pointerdown', () => {
            overlay.destroy();
            box.destroy();
            this.scene.restart();
        });
    }

    getRewardText(reward) {
        switch (reward.type) {
            case 'coins':
                return `💰 ${reward.amount} Coins`;
            case 'xp':
                return `⭐ ${reward.amount} XP`;
            case 'skin':
                return `👕 Skin: ${reward.id}`;
            case 'emote':
                return `😀 Emote: ${reward.id}`;
            case 'pet':
                return `🐾 Pet: ${reward.id}`;
            case 'title':
                return `👑 Title: ${reward.id}`;
            case 'color':
                return `🎨 Color: ${reward.id}`;
            case 'trail':
                return `✨ Trail: ${reward.id}`;
            default:
                return `✨ ${reward.type}`;
        }
    }

    createOpenAllButton() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        const openAllBtn = this.add.text(width / 2, height - 80, '🎁 OPEN ALL CRATES', {
            fontSize: '18px',
            fontFamily: 'monospace',
            color: '#ffffff',
            backgroundColor: '#9B59B6',
            padding: { x: 25, y: 12 }
        }).setOrigin(0.5);
        openAllBtn.setInteractive({ useHandCursor: true });

        openAllBtn.on('pointerdown', () => {
            const result = lootCrateSystem.bulkOpenCrates();
            alert(`Opened ${result.count} crates!\n\nRewards:\n${result.rewards.map(r => this.getRewardText(r)).join('\n')}`);
            this.scene.restart();
        });

        openAllBtn.on('pointerover', () => {
            openAllBtn.setScale(1.05);
        });

        openAllBtn.on('pointerout', () => {
            openAllBtn.setScale(1.0);
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
