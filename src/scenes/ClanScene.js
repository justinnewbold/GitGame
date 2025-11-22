import Phaser from 'phaser';
import { clanSystem } from '../utils/ClanSystem.js';

export default class ClanScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ClanScene' });
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Background
        this.add.rectangle(0, 0, width, height, 0x1a1a2e).setOrigin(0);

        // Title
        this.add.text(width / 2, 40, '⚔️ CLAN', {
            fontSize: '48px',
            fontFamily: 'monospace',
            color: '#E74C3C',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        const clanInfo = clanSystem.getClanInfo();

        if (!clanInfo) {
            this.showNoClan();
        } else {
            this.showClanInfo(clanInfo);
        }

        // Back button
        this.createBackButton();
    }

    showNoClan() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        this.add.text(width / 2, height / 2 - 50, 'You are not in a clan', {
            fontSize: '24px',
            fontFamily: 'monospace',
            color: '#888888'
        }).setOrigin(0.5);

        // Create Clan button
        const createBtn = this.add.text(width / 2 - 100, height / 2 + 50, '➕ CREATE CLAN', {
            fontSize: '16px',
            fontFamily: 'monospace',
            color: '#ffffff',
            backgroundColor: '#4CAF50',
            padding: { x: 20, y: 12 }
        }).setOrigin(0.5);
        createBtn.setInteractive({ useHandCursor: true });

        createBtn.on('pointerdown', () => {
            this.createClan();
        });

        // Join Clan button
        const joinBtn = this.add.text(width / 2 + 100, height / 2 + 50, '🔍 JOIN CLAN', {
            fontSize: '16px',
            fontFamily: 'monospace',
            color: '#ffffff',
            backgroundColor: '#2196F3',
            padding: { x: 20, y: 12 }
        }).setOrigin(0.5);
        joinBtn.setInteractive({ useHandCursor: true });

        joinBtn.on('pointerdown', () => {
            alert('Clan search feature - would show list of clans to join!');
        });
    }

    createClan() {
        const name = prompt('Enter clan name (3-30 characters):');
        if (!name) return;

        const tag = prompt('Enter clan tag (2-5 characters):');
        if (!tag) return;

        const result = clanSystem.createClan(name, tag);
        if (result.success) {
            this.scene.restart();
        } else {
            alert(result.message);
        }
    }

    showClanInfo(clanInfo) {
        const width = this.cameras.main.width;

        // Clan header
        const headerY = 120;

        this.add.text(width / 2, headerY, `[${clanInfo.tag}] ${clanInfo.name}`, {
            fontSize: '32px',
            fontFamily: 'monospace',
            color: '#E74C3C',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(width / 2, headerY + 40, `Level ${clanInfo.level}`, {
            fontSize: '20px',
            fontFamily: 'monospace',
            color: '#4CAF50'
        }).setOrigin(0.5);

        // XP Progress
        const progressY = 190;
        const barWidth = 500;
        const barHeight = 25;
        const barX = width / 2 - barWidth / 2;

        this.add.rectangle(barX, progressY, barWidth, barHeight, 0x333333).setOrigin(0);
        this.add.rectangle(barX, progressY, barWidth * clanInfo.progress / 100, barHeight, 0xE74C3C).setOrigin(0);
        this.add.rectangle(barX, progressY, barWidth, barHeight).setStrokeStyle(2, 0xffffff).setOrigin(0);

        this.add.text(width / 2, progressY + 13, `${clanInfo.xp}/${clanInfo.requiredXP} XP`, {
            fontSize: '12px',
            fontFamily: 'monospace',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Stats
        const statsY = 240;
        const stats = [
            { label: 'Members', value: `${clanInfo.members.length}/${clanInfo.maxMembers}` },
            { label: 'Wars Won', value: clanInfo.wars.wins },
            { label: 'Treasury', value: `${clanInfo.treasury.coins} 💰` }
        ];

        const startX = width / 2 - 250;
        stats.forEach((stat, index) => {
            const x = startX + (index * 180);

            this.add.text(x, statsY, stat.value.toString(), {
                fontSize: '24px',
                fontFamily: 'monospace',
                color: '#ffffff',
                fontStyle: 'bold'
            }).setOrigin(0.5);

            this.add.text(x, statsY + 30, stat.label, {
                fontSize: '12px',
                fontFamily: 'monospace',
                color: '#888888'
            }).setOrigin(0.5);
        });

        // Action buttons
        this.createClanActions();

        // Members list
        this.showMembersList(clanInfo.members);
    }

    createClanActions() {
        const width = this.cameras.main.width;
        const buttonsY = 330;

        const buttons = [
            { text: '💰 Contribute', action: () => this.contribute() },
            { text: '⚔️ Start War', action: () => this.startWar() },
            { text: '🏪 Clan Shop', action: () => this.showShop() },
            { text: '🚪 Leave Clan', action: () => this.leaveClan(), color: '#E74C3C' }
        ];

        const startX = width / 2 - 350;
        buttons.forEach((btn, index) => {
            const x = startX + (index * 180);

            const button = this.add.text(x, buttonsY, btn.text, {
                fontSize: '12px',
                fontFamily: 'monospace',
                color: '#ffffff',
                backgroundColor: btn.color || '#333333',
                padding: { x: 12, y: 8 }
            }).setOrigin(0.5);
            button.setInteractive({ useHandCursor: true });

            button.on('pointerdown', btn.action);

            button.on('pointerover', () => {
                button.setStyle({ backgroundColor: btn.color ? '#C0392B' : '#555555' });
            });

            button.on('pointerout', () => {
                button.setStyle({ backgroundColor: btn.color || '#333333' });
            });
        });
    }

    contribute() {
        const amount = prompt('Enter amount to contribute:');
        if (amount && !isNaN(amount)) {
            const result = clanSystem.contribute('coins', parseInt(amount));
            if (result.success) {
                alert(`Contributed ${amount} coins! Contribution points: ${result.contributionPoints}`);
                this.scene.restart();
            } else {
                alert(result.message);
            }
        }
    }

    startWar() {
        alert('Clan War system - would match with another clan for 48-hour war!');
    }

    showShop() {
        alert('Clan Shop - spend clan treasury on perks and upgrades!');
    }

    leaveClan() {
        if (confirm('Are you sure you want to leave the clan?')) {
            const result = clanSystem.leaveClan();
            alert(result.message);
            this.scene.restart();
        }
    }

    showMembersList(members) {
        const width = this.cameras.main.width;
        const startY = 400;

        this.add.text(width / 2, startY, 'MEMBERS', {
            fontSize: '16px',
            fontFamily: 'monospace',
            color: '#E74C3C',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        members.slice(0, 10).forEach((member, index) => {
            const y = startY + 40 + (index * 30);

            const roleIcon = member.role === 'leader' ? '👑' : (member.role === 'officer' ? '⭐' : '');

            this.add.text(width / 2 - 250, y, `${roleIcon} ${member.name}`, {
                fontSize: '12px',
                fontFamily: 'monospace',
                color: '#ffffff'
            });

            this.add.text(width / 2 + 100, y, `${member.contributionPoints} CP`, {
                fontSize: '12px',
                fontFamily: 'monospace',
                color: '#4CAF50'
            });

            this.add.text(width / 2 + 200, y, member.online ? '🟢 Online' : '⚫ Offline', {
                fontSize: '10px',
                fontFamily: 'monospace',
                color: '#888888'
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
