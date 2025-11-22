import Phaser from 'phaser';
import { friendSystem } from '../utils/FriendSystem.js';

export default class FriendsScene extends Phaser.Scene {
    constructor() {
        super({ key: 'FriendsScene' });
        this.currentTab = 'friends';
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Background
        this.add.rectangle(0, 0, width, height, 0x1a1a2e).setOrigin(0);

        // Title
        this.add.text(width / 2, 40, '👥 FRIENDS', {
            fontSize: '48px',
            fontFamily: 'monospace',
            color: '#3498DB',
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
            { id: 'friends', label: '👥 Friends' },
            { id: 'requests', label: '📨 Requests' },
            { id: 'leaderboard', label: '🏆 Leaderboard' },
            { id: 'search', label: '🔍 Search' }
        ];

        tabs.forEach((tab, index) => {
            const x = width / 2 - 300 + (index * 160);
            const isActive = this.currentTab === tab.id;

            const btn = this.add.text(x, tabY, tab.label, {
                fontSize: '12px',
                fontFamily: 'monospace',
                color: isActive ? '#ffffff' : '#888888',
                backgroundColor: isActive ? '#3498DB' : '#333333',
                padding: { x: 10, y: 6 }
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
            case 'friends':
                this.showFriendsList();
                break;
            case 'requests':
                this.showRequests();
                break;
            case 'leaderboard':
                this.showLeaderboard();
                break;
            case 'search':
                this.showSearch();
                break;
        }
    }

    showFriendsList() {
        const width = this.cameras.main.width;
        const friends = friendSystem.getFriendList('online');

        let y = 180;

        this.add.text(width / 2, y, `${friends.length} Friends`, {
            fontSize: '18px',
            fontFamily: 'monospace',
            color: '#3498DB',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        y += 50;

        if (friends.length === 0) {
            this.add.text(width / 2, 350, 'No friends yet', {
                fontSize: '16px',
                fontFamily: 'monospace',
                color: '#888888'
            }).setOrigin(0.5);

            this.add.text(width / 2, 390, 'Use the Search tab to find players!', {
                fontSize: '12px',
                fontFamily: 'monospace',
                color: '#666666'
            }).setOrigin(0.5);

            // Add mock friend for demo
            const addMockBtn = this.add.text(width / 2, 450, '👤 ADD DEMO FRIEND', {
                fontSize: '14px',
                fontFamily: 'monospace',
                color: '#ffffff',
                backgroundColor: '#3498DB',
                padding: { x: 15, y: 8 }
            }).setOrigin(0.5);
            addMockBtn.setInteractive({ useHandCursor: true });

            addMockBtn.on('pointerdown', () => {
                friendSystem.acceptFriendRequest('demo123', 'DemoPlayer');
                this.scene.restart();
            });

            return;
        }

        friends.forEach((friend, index) => {
            if (index >= 10) return; // Show max 10

            const yPos = y + (index * 60);

            // Friend box
            const box = this.add.rectangle(width / 2, yPos, 700, 55, 0x333333, 0.8);
            box.setStrokeStyle(1, friend.online ? 0x4CAF50 : 0x666666);

            // Online status
            const statusColor = friend.online ? 0x4CAF50 : 0x888888;
            this.add.circle(width / 2 - 330, yPos, 8, statusColor);

            // Name
            this.add.text(width / 2 - 310, yPos - 12, friend.name, {
                fontSize: '16px',
                fontFamily: 'monospace',
                color: '#ffffff',
                fontStyle: 'bold'
            });

            // Level and rank
            this.add.text(width / 2 - 310, yPos + 10, `Level ${friend.level} • ${friend.rank}`, {
                fontSize: '11px',
                fontFamily: 'monospace',
                color: '#888888'
            });

            // Action buttons
            const challengeBtn = this.add.text(width / 2 + 150, yPos, '⚔️ Challenge', {
                fontSize: '11px',
                fontFamily: 'monospace',
                color: '#ffffff',
                backgroundColor: '#E74C3C',
                padding: { x: 8, y: 4 }
            }).setOrigin(0.5);
            challengeBtn.setInteractive({ useHandCursor: true });

            challengeBtn.on('pointerdown', () => {
                const result = friendSystem.sendChallenge(friend.id, 'gitSurvivor');
                alert(result.message);
            });

            const compareBtn = this.add.text(width / 2 + 270, yPos, '📊 Compare', {
                fontSize: '11px',
                fontFamily: 'monospace',
                color: '#ffffff',
                backgroundColor: '#3498DB',
                padding: { x: 8, y: 4 }
            }).setOrigin(0.5);
            compareBtn.setInteractive({ useHandCursor: true });

            compareBtn.on('pointerdown', () => {
                const comparison = friendSystem.compareScores(friend.id);
                if (comparison.success) {
                    alert(`Your Score: ${comparison.comparison.player.totalScore}\n${friend.name}'s Score: ${comparison.comparison.friend.totalScore}`);
                }
            });
        });
    }

    showRequests() {
        const width = this.cameras.main.width;
        const pending = friendSystem.getPendingRequests();

        let y = 200;

        if (pending.length === 0) {
            this.add.text(width / 2, 350, 'No pending requests', {
                fontSize: '16px',
                fontFamily: 'monospace',
                color: '#888888'
            }).setOrigin(0.5);
            return;
        }

        pending.forEach((playerId, index) => {
            const yPos = y + (index * 80);

            const box = this.add.rectangle(width / 2, yPos, 600, 70, 0x333333, 0.8);
            box.setStrokeStyle(2, 0x3498DB);

            this.add.text(width / 2 - 250, yPos, `Player: ${playerId}`, {
                fontSize: '14px',
                fontFamily: 'monospace',
                color: '#ffffff'
            });

            // Accept button
            const acceptBtn = this.add.text(width / 2 + 150, yPos, '✓ ACCEPT', {
                fontSize: '12px',
                fontFamily: 'monospace',
                color: '#ffffff',
                backgroundColor: '#4CAF50',
                padding: { x: 12, y: 6 }
            }).setOrigin(0.5);
            acceptBtn.setInteractive({ useHandCursor: true });

            acceptBtn.on('pointerdown', () => {
                friendSystem.acceptFriendRequest(playerId, playerId);
                this.scene.restart();
            });

            // Decline button
            const declineBtn = this.add.text(width / 2 + 250, yPos, '✗ DECLINE', {
                fontSize: '12px',
                fontFamily: 'monospace',
                color: '#ffffff',
                backgroundColor: '#E74C3C',
                padding: { x: 12, y: 6 }
            }).setOrigin(0.5);
            declineBtn.setInteractive({ useHandCursor: true });

            declineBtn.on('pointerdown', () => {
                friendSystem.declineFriendRequest(playerId);
                this.scene.restart();
            });
        });
    }

    showLeaderboard() {
        const width = this.cameras.main.width;
        const leaderboard = friendSystem.getFriendLeaderboard();

        let y = 180;

        this.add.text(width / 2, y, 'FRIEND LEADERBOARD', {
            fontSize: '20px',
            fontFamily: 'monospace',
            color: '#3498DB',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        y += 50;

        leaderboard.forEach((entry, index) => {
            if (index >= 15) return;

            const yPos = y + (index * 35);
            const isPlayer = entry.id === 'player';

            // Rank
            let rankColor = '#888888';
            if (entry.position === 1) rankColor = '#FFD700';
            else if (entry.position === 2) rankColor = '#C0C0C0';
            else if (entry.position === 3) rankColor = '#CD7F32';

            this.add.text(width / 2 - 300, yPos, `#${entry.position}`, {
                fontSize: '14px',
                fontFamily: 'monospace',
                color: rankColor,
                fontStyle: 'bold'
            });

            // Name
            this.add.text(width / 2 - 250, yPos, entry.name, {
                fontSize: '14px',
                fontFamily: 'monospace',
                color: isPlayer ? '#00ff00' : '#ffffff',
                fontStyle: isPlayer ? 'bold' : 'normal'
            });

            // Score
            this.add.text(width / 2 + 250, yPos, entry.value.toLocaleString(), {
                fontSize: '14px',
                fontFamily: 'monospace',
                color: '#3498DB'
            }).setOrigin(1, 0);
        });
    }

    showSearch() {
        const width = this.cameras.main.width;

        let y = 200;

        this.add.text(width / 2, y, 'SEARCH PLAYERS', {
            fontSize: '20px',
            fontFamily: 'monospace',
            color: '#3498DB',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        y += 50;

        // Search box (simulated)
        const searchBox = this.add.text(width / 2, y, '[ Click to search for players ]', {
            fontSize: '14px',
            fontFamily: 'monospace',
            color: '#666666',
            backgroundColor: '#333333',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5);
        searchBox.setInteractive({ useHandCursor: true });

        searchBox.on('pointerdown', () => {
            const query = prompt('Enter player name:');
            if (query) {
                this.showSearchResults(query);
            }
        });

        y += 80;

        // Suggested friends
        this.add.text(width / 2, y, 'SUGGESTED FRIENDS', {
            fontSize: '16px',
            fontFamily: 'monospace',
            color: '#888888'
        }).setOrigin(0.5);

        y += 40;

        const suggested = friendSystem.getSuggestedFriends();

        suggested.forEach((player, index) => {
            const yPos = y + (index * 60);

            const box = this.add.rectangle(width / 2, yPos, 600, 50, 0x333333, 0.8);
            box.setStrokeStyle(1, 0x666666);

            this.add.text(width / 2 - 250, yPos - 8, player.name, {
                fontSize: '14px',
                fontFamily: 'monospace',
                color: '#ffffff'
            });

            this.add.text(width / 2 - 250, yPos + 10, `Level ${player.level} • ${player.mutualFriends} mutual friends`, {
                fontSize: '10px',
                fontFamily: 'monospace',
                color: '#888888'
            });

            const addBtn = this.add.text(width / 2 + 220, yPos, '+ ADD', {
                fontSize: '12px',
                fontFamily: 'monospace',
                color: '#ffffff',
                backgroundColor: '#4CAF50',
                padding: { x: 12, y: 6 }
            }).setOrigin(0.5);
            addBtn.setInteractive({ useHandCursor: true });

            addBtn.on('pointerdown', () => {
                const result = friendSystem.sendFriendRequest(player.id, player.name);
                alert(result.message);
            });
        });
    }

    showSearchResults(query) {
        const results = friendSystem.searchPlayers(query);
        if (results.length > 0) {
            alert(`Found ${results.length} players matching "${query}"`);
        } else {
            alert('No players found');
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
