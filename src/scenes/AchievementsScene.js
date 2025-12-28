/**
 * AchievementsScene - View and track player achievements
 */

import Phaser from 'phaser';
import { logger } from '../utils/Logger.js';
import { COLORS, RARITY_COLORS, TEXT_STYLES } from '../utils/Theme.js';
import AchievementSystem from '../utils/AchievementSystem.js';

export default class AchievementsScene extends Phaser.Scene {
    constructor() {
        super({ key: 'AchievementsScene' });
        this.achievementSystem = null;
        this.currentCategory = 'all';
        this.scrollY = 0;
        this.achievements = [];
    }

    create() {
        const { width, height } = this.cameras.main;
        this.achievementSystem = new AchievementSystem();

        // Background
        this.add.rectangle(0, 0, width, height, COLORS.background).setOrigin(0);

        // Title
        this.add.text(width / 2, 40, 'Achievements', TEXT_STYLES.title).setOrigin(0.5);

        // Stats bar
        const stats = this.achievementSystem.getAllAchievements();
        const unlocked = stats.filter(a => a.unlocked).length;
        const total = stats.length;
        const points = this.achievementSystem.getTotalPoints();
        const percent = this.achievementSystem.getUnlockPercentage();

        this.add.text(width / 2, 80, `${unlocked}/${total} Unlocked (${percent}%) | ${points} Points`, {
            ...TEXT_STYLES.small,
            color: COLORS.accentHex
        }).setOrigin(0.5);

        // Category tabs
        this.createCategoryTabs();

        // Back button
        this.createBackButton();

        // Achievement list container
        this.listContainer = this.add.container(0, 160);

        // Load achievements
        this.loadAchievements();

        // Scroll handling
        this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY) => {
            this.scrollY = Phaser.Math.Clamp(this.scrollY - deltaY, -(this.achievements.length * 80 - height + 200), 0);
            this.listContainer.setY(160 + this.scrollY);
        });

        logger.info('AchievementsScene', 'Scene created');
    }

    createCategoryTabs() {
        const { width } = this.cameras.main;
        const categories = ['all', 'milestone', 'survival', 'combo', 'special'];
        const tabWidth = 100;
        const startX = width / 2 - (categories.length * tabWidth) / 2;

        categories.forEach((cat, i) => {
            const x = startX + i * tabWidth + tabWidth / 2;
            const isActive = cat === this.currentCategory;

            const tab = this.add.text(x, 120, cat.toUpperCase(), {
                fontSize: '12px',
                fontFamily: 'monospace',
                color: isActive ? '#000000' : COLORS.textSecondary,
                backgroundColor: isActive ? COLORS.primaryHex : COLORS.buttonBg,
                padding: { x: 10, y: 5 }
            }).setOrigin(0.5);

            tab.setInteractive({ useHandCursor: true });
            tab.on('pointerdown', () => {
                this.currentCategory = cat;
                this.scene.restart();
            });
        });
    }

    loadAchievements() {
        this.listContainer.removeAll(true);
        const { width } = this.cameras.main;

        let allAchievements = this.achievementSystem.getAllAchievements();

        // Filter by category
        if (this.currentCategory !== 'all') {
            allAchievements = allAchievements.filter(a => a.category === this.currentCategory);
        }

        // Sort: unlocked first, then by points
        allAchievements.sort((a, b) => {
            if (a.unlocked !== b.unlocked) return b.unlocked - a.unlocked;
            return b.points - a.points;
        });

        this.achievements = allAchievements;

        allAchievements.forEach((achievement, i) => {
            const y = i * 80;
            this.createAchievementCard(achievement, width / 2, y);
        });
    }

    createAchievementCard(achievement, x, y) {
        const cardWidth = 500;
        const cardHeight = 70;
        const isUnlocked = achievement.unlocked;

        // Card background
        const bg = this.add.rectangle(x, y + 35, cardWidth, cardHeight,
            isUnlocked ? 0x2a2a4e : 0x1a1a2e, isUnlocked ? 1 : 0.5);
        bg.setStrokeStyle(2, isUnlocked ? COLORS.primary : 0x333333);
        this.listContainer.add(bg);

        // Icon
        const icon = this.add.text(x - cardWidth / 2 + 40, y + 35,
            isUnlocked || !achievement.hidden ? achievement.icon : '?', {
                fontSize: '32px'
            }).setOrigin(0.5);
        if (!isUnlocked) icon.setAlpha(0.3);
        this.listContainer.add(icon);

        // Name
        const displayName = isUnlocked || !achievement.hidden
            ? achievement.name
            : '???';
        const name = this.add.text(x - cardWidth / 2 + 90, y + 20, displayName, {
            fontSize: '16px',
            fontFamily: 'monospace',
            color: isUnlocked ? '#ffffff' : '#666666',
            fontStyle: 'bold'
        });
        this.listContainer.add(name);

        // Description
        const displayDesc = isUnlocked || !achievement.hidden
            ? achievement.description
            : 'Hidden achievement';
        const desc = this.add.text(x - cardWidth / 2 + 90, y + 42, displayDesc, {
            fontSize: '12px',
            fontFamily: 'monospace',
            color: isUnlocked ? '#aaaaaa' : '#444444'
        });
        this.listContainer.add(desc);

        // Points
        const points = this.add.text(x + cardWidth / 2 - 50, y + 25, `+${achievement.points}`, {
            fontSize: '18px',
            fontFamily: 'monospace',
            color: isUnlocked ? COLORS.goldHex : '#444444',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.listContainer.add(points);

        // Rarity indicator
        const rarityColor = RARITY_COLORS[achievement.rarity]?.hex || '#888888';
        const rarity = this.add.text(x + cardWidth / 2 - 50, y + 48,
            achievement.rarity.toUpperCase(), {
                fontSize: '10px',
                fontFamily: 'monospace',
                color: isUnlocked ? rarityColor : '#333333'
            }).setOrigin(0.5);
        this.listContainer.add(rarity);

        // Unlock date
        if (isUnlocked && achievement.unlockedAt) {
            const date = new Date(achievement.unlockedAt).toLocaleDateString();
            const dateText = this.add.text(x - cardWidth / 2 + 90, y + 58, `Unlocked: ${date}`, {
                fontSize: '10px',
                fontFamily: 'monospace',
                color: '#666666'
            });
            this.listContainer.add(dateText);
        }
    }

    createBackButton() {
        const backBtn = this.add.text(20, 20, '← Back', {
            ...TEXT_STYLES.buttonSmall
        });
        backBtn.setInteractive({ useHandCursor: true });
        backBtn.on('pointerdown', () => this.scene.start('StatsScene'));
        backBtn.on('pointerover', () => backBtn.setStyle({ backgroundColor: COLORS.buttonHover }));
        backBtn.on('pointerout', () => backBtn.setStyle({ backgroundColor: COLORS.buttonBg }));
    }
}
