import Phaser from 'phaser';
import { profileSystem } from '../utils/SocialSystems.js';

export default class ProfileScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ProfileScene' });
        this.currentTab = 'profile';
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Background
        this.add.rectangle(0, 0, width, height, 0x1a1a2e).setOrigin(0);

        // Title
        this.add.text(width / 2, 40, '👤 PROFILE', {
            fontSize: '48px',
            fontFamily: 'monospace',
            color: '#4169E1',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Get profile
        this.profile = profileSystem.getProfile();

        // Profile Card Preview
        this.createProfileCard();

        // Tabs
        this.createTabs();

        // Content area based on current tab
        this.contentY = 350;
        this.showContent();

        // Back button
        this.createBackButton();
    }

    createProfileCard() {
        const width = this.cameras.main.width;
        const cardY = 150;

        // Card background
        const cardWidth = 700;
        const cardHeight = 150;
        const card = this.add.rectangle(width / 2, cardY, cardWidth, cardHeight, this.profile.customization.primaryColor, 0.3);
        card.setStrokeStyle(3, this.profile.customization.accentColor);

        // Avatar (left side)
        const avatarX = width / 2 - 300;
        const avatars = profileSystem.getAvatars();
        const avatar = avatars[this.profile.avatar] || avatars.default;

        this.add.text(avatarX, cardY - 40, avatar.emoji, {
            fontSize: '64px'
        }).setOrigin(0.5);

        // Display name and title
        this.add.text(avatarX + 120, cardY - 50, this.profile.displayName, {
            fontSize: '24px',
            fontFamily: 'monospace',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0, 0.5);

        if (this.profile.title) {
            this.add.text(avatarX + 120, cardY - 25, `"${this.profile.title}"`, {
                fontSize: '14px',
                fontFamily: 'monospace',
                color: this.profile.customization.accentColor,
                fontStyle: 'italic'
            }).setOrigin(0, 0.5);
        }

        // Level and Prestige
        this.add.text(avatarX + 120, cardY + 5, `Level ${this.profile.level}`, {
            fontSize: '16px',
            fontFamily: 'monospace',
            color: '#00ff00'
        }).setOrigin(0, 0.5);

        if (this.profile.prestige > 0) {
            this.add.text(avatarX + 220, cardY + 5, `⭐ Prestige ${this.profile.prestige}`, {
                fontSize: '14px',
                fontFamily: 'monospace',
                color: '#FFD700'
            }).setOrigin(0, 0.5);
        }

        // Bio
        if (this.profile.bio) {
            this.add.text(avatarX + 120, cardY + 30, this.profile.bio, {
                fontSize: '12px',
                fontFamily: 'monospace',
                color: '#aaaaaa',
                wordWrap: { width: 500 }
            }).setOrigin(0, 0.5);
        }
    }

    createTabs() {
        const width = this.cameras.main.width;
        const tabY = 320;

        const tabs = [
            { id: 'profile', label: '📝 Edit Profile' },
            { id: 'avatar', label: '🎨 Avatar' },
            { id: 'banner', label: '🎭 Banner & Colors' },
            { id: 'showcase', label: '🏆 Showcase' }
        ];

        tabs.forEach((tab, index) => {
            const x = width / 2 - 300 + (index * 160);
            const isActive = this.currentTab === tab.id;

            const btn = this.add.text(x, tabY, tab.label, {
                fontSize: '12px',
                fontFamily: 'monospace',
                color: isActive ? '#ffffff' : '#888888',
                backgroundColor: isActive ? '#4169E1' : '#333333',
                padding: { x: 10, y: 6 }
            }).setOrigin(0, 0.5);
            btn.setInteractive({ useHandCursor: true });

            btn.on('pointerdown', () => {
                this.currentTab = tab.id;
                this.scene.restart();
            });
        });
    }

    showContent() {
        switch (this.currentTab) {
            case 'profile':
                this.showProfileEdit();
                break;
            case 'avatar':
                this.showAvatarSelection();
                break;
            case 'banner':
                this.showBannerAndColors();
                break;
            case 'showcase':
                this.showShowcaseSettings();
                break;
        }
    }

    showProfileEdit() {
        const width = this.cameras.main.width;
        let y = this.contentY;

        // Display Name
        this.add.text(width / 2 - 300, y, 'Display Name:', {
            fontSize: '14px',
            fontFamily: 'monospace',
            color: '#ffffff'
        });

        const nameInput = this.add.text(width / 2 - 100, y, this.profile.displayName, {
            fontSize: '14px',
            fontFamily: 'monospace',
            color: '#00ff00',
            backgroundColor: '#333333',
            padding: { x: 10, y: 5 }
        });
        nameInput.setInteractive({ useHandCursor: true });

        nameInput.on('pointerdown', () => {
            const newName = prompt('Enter new display name (3-20 characters):', this.profile.displayName);
            if (newName) {
                profileSystem.setDisplayName(newName);
                this.scene.restart();
            }
        });

        y += 50;

        // Bio
        this.add.text(width / 2 - 300, y, 'Bio:', {
            fontSize: '14px',
            fontFamily: 'monospace',
            color: '#ffffff'
        });

        const bioText = this.profile.bio || 'Click to add bio';
        const bioInput = this.add.text(width / 2 - 100, y, bioText, {
            fontSize: '12px',
            fontFamily: 'monospace',
            color: this.profile.bio ? '#ffffff' : '#666666',
            backgroundColor: '#333333',
            padding: { x: 10, y: 5 },
            wordWrap: { width: 400 }
        });
        bioInput.setInteractive({ useHandCursor: true });

        bioInput.on('pointerdown', () => {
            const newBio = prompt('Enter bio (max 200 characters):', this.profile.bio);
            if (newBio !== null) {
                profileSystem.setBio(newBio);
                this.scene.restart();
            }
        });

        y += 80;

        // Visibility
        this.add.text(width / 2 - 300, y, 'Profile Visibility:', {
            fontSize: '14px',
            fontFamily: 'monospace',
            color: '#ffffff'
        });

        const visibilities = ['public', 'friends', 'private'];
        visibilities.forEach((vis, index) => {
            const x = width / 2 - 100 + (index * 120);
            const isActive = this.profile.visibility === vis;

            const btn = this.add.text(x, y, vis.toUpperCase(), {
                fontSize: '12px',
                fontFamily: 'monospace',
                color: isActive ? '#ffffff' : '#888888',
                backgroundColor: isActive ? '#4169E1' : '#333333',
                padding: { x: 10, y: 5 }
            });
            btn.setInteractive({ useHandCursor: true });

            btn.on('pointerdown', () => {
                profileSystem.setVisibility(vis);
                this.scene.restart();
            });
        });
    }

    showAvatarSelection() {
        const width = this.cameras.main.width;
        const avatars = profileSystem.getAvatars();
        const startX = width / 2 - 350;
        const startY = this.contentY;
        const spacing = 100;

        let x = startX;
        let y = startY;
        let count = 0;

        Object.values(avatars).forEach((avatar) => {
            const isSelected = this.profile.avatar === avatar.id;

            // Avatar box
            const box = this.add.rectangle(x, y, 80, 80, isSelected ? 0x4169E1 : 0x333333, 0.8);
            box.setStrokeStyle(2, isSelected ? 0xFFD700 : 0x666666);
            box.setInteractive({ useHandCursor: true });

            box.on('pointerdown', () => {
                profileSystem.setAvatar(avatar.id);
                this.scene.restart();
            });

            // Avatar emoji
            this.add.text(x, y - 10, avatar.emoji, {
                fontSize: '48px'
            }).setOrigin(0.5);

            // Avatar name
            this.add.text(x, y + 40, avatar.name, {
                fontSize: '10px',
                fontFamily: 'monospace',
                color: '#ffffff'
            }).setOrigin(0.5);

            count++;
            x += spacing;
            if (count % 7 === 0) {
                x = startX;
                y += 120;
            }
        });
    }

    showBannerAndColors() {
        const width = this.cameras.main.width;
        let y = this.contentY;

        // Banners
        this.add.text(width / 2 - 300, y, 'Banner:', {
            fontSize: '14px',
            fontFamily: 'monospace',
            color: '#ffffff',
            fontStyle: 'bold'
        });

        y += 30;

        const banners = profileSystem.getBanners();
        const startX = width / 2 - 350;
        let x = startX;

        Object.values(banners).forEach((banner, index) => {
            const isSelected = this.profile.banner === banner.id;

            const box = this.add.rectangle(x, y, 100, 60, banner.color, 0.8);
            box.setStrokeStyle(2, isSelected ? 0xFFD700 : 0x666666);
            box.setInteractive({ useHandCursor: true });

            box.on('pointerdown', () => {
                profileSystem.setBanner(banner.id);
                this.scene.restart();
            });

            this.add.text(x, y + 40, banner.name, {
                fontSize: '10px',
                fontFamily: 'monospace',
                color: '#ffffff'
            }).setOrigin(0.5);

            x += 110;
            if ((index + 1) % 6 === 0) {
                x = startX;
                y += 90;
            }
        });

        y += 120;

        // Colors
        this.add.text(width / 2 - 300, y, 'Profile Colors:', {
            fontSize: '14px',
            fontFamily: 'monospace',
            color: '#ffffff',
            fontStyle: 'bold'
        });

        y += 30;

        const colors = [
            { name: 'Green', value: 0x4CAF50 },
            { name: 'Blue', value: 0x2196F3 },
            { name: 'Purple', value: 0x9C27B0 },
            { name: 'Red', value: 0xE74C3C },
            { name: 'Orange', value: 0xFF9800 },
            { name: 'Pink', value: 0xE91E63 },
            { name: 'Cyan', value: 0x00BCD4 },
            { name: 'Gold', value: 0xFFD700 }
        ];

        x = startX;

        colors.forEach((color, index) => {
            const isSelected = this.profile.customization.primaryColor === color.value;

            const box = this.add.rectangle(x, y, 70, 40, color.value);
            box.setStrokeStyle(2, isSelected ? 0xFFFFFF : 0x666666);
            box.setInteractive({ useHandCursor: true });

            box.on('pointerdown', () => {
                profileSystem.setProfileColors(color.value, this.profile.customization.accentColor);
                this.scene.restart();
            });

            this.add.text(x, y + 30, color.name, {
                fontSize: '9px',
                fontFamily: 'monospace',
                color: '#ffffff'
            }).setOrigin(0.5);

            x += 85;
            if ((index + 1) % 8 === 0) {
                x = startX;
                y += 70;
            }
        });
    }

    showShowcaseSettings() {
        const width = this.cameras.main.width;
        let y = this.contentY;

        this.add.text(width / 2, y, 'Choose what to display on your profile', {
            fontSize: '14px',
            fontFamily: 'monospace',
            color: '#888888'
        }).setOrigin(0.5);

        y += 40;

        const stats = [
            { key: 'totalScore', label: 'Total Score' },
            { key: 'gamesPlayed', label: 'Games Played' },
            { key: 'totalKills', label: 'Total Kills' },
            { key: 'highestWave', label: 'Highest Wave' },
            { key: 'fastestTime', label: 'Fastest Time' }
        ];

        stats.forEach((stat, index) => {
            const isShowcased = this.profile.showcaseStats.includes(stat.key);

            const btn = this.add.text(width / 2 - 250, y + (index * 40),
                `${isShowcased ? '✓' : '○'} ${stat.label}`, {
                fontSize: '14px',
                fontFamily: 'monospace',
                color: isShowcased ? '#00ff00' : '#ffffff',
                backgroundColor: '#333333',
                padding: { x: 10, y: 6 }
            });
            btn.setInteractive({ useHandCursor: true });

            btn.on('pointerdown', () => {
                let newStats = [...this.profile.showcaseStats];
                if (isShowcased) {
                    newStats = newStats.filter(s => s !== stat.key);
                } else {
                    if (newStats.length < 5) {
                        newStats.push(stat.key);
                    }
                }
                profileSystem.setShowcaseStats(newStats);
                this.scene.restart();
            });
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
