import Phaser from 'phaser';
import { storyCampaign } from '../utils/StoryCampaign.js';

export default class CampaignScene extends Phaser.Scene {
    constructor() {
        super({ key: 'CampaignScene' });
        this.currentAct = 1;
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Background
        this.add.rectangle(0, 0, width, height, 0x1a1a2e).setOrigin(0);

        // Title
        this.add.text(width / 2, 40, '📖 CAMPAIGN', {
            fontSize: '48px',
            fontFamily: 'monospace',
            color: '#16A085',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Progress overview
        const progress = storyCampaign.getProgress();
        this.add.text(width / 2, 100, `Act ${progress.currentAct} • Mission ${progress.currentMission}/50 • ${progress.totalStars}/150 ⭐`, {
            fontSize: '14px',
            fontFamily: 'monospace',
            color: '#888888'
        }).setOrigin(0.5);

        // Act selector
        this.createActSelector();

        // Mission list for current act
        this.showActMissions();

        // Back button
        this.createBackButton();
    }

    createActSelector() {
        const width = this.cameras.main.width;
        const actY = 140;

        const campaign = storyCampaign.getCampaignStructure();

        for (let actNum = 1; actNum <= 5; actNum++) {
            const act = campaign[`act${actNum}`];
            const actProgress = storyCampaign.getActProgress(actNum);
            const isActive = this.currentAct === actNum;

            const x = width / 2 - 400 + (actNum - 1) * 200;

            // Act box
            const box = this.add.rectangle(x, actY, 180, 80, act.color, isActive ? 0.8 : 0.3);
            box.setStrokeStyle(isActive ? 3 : 1, isActive ? 0xffffff : 0x666666);
            box.setInteractive({ useHandCursor: true });

            box.on('pointerdown', () => {
                this.currentAct = actNum;
                this.scene.restart();
            });

            // Act icon and number
            this.add.text(x, actY - 20, `${act.icon} ACT ${actNum}`, {
                fontSize: '16px',
                fontFamily: 'monospace',
                color: '#ffffff',
                fontStyle: 'bold'
            }).setOrigin(0.5);

            // Progress
            this.add.text(x, actY + 10, `${actProgress.completed}/${actProgress.total} Missions`, {
                fontSize: '10px',
                fontFamily: 'monospace',
                color: '#aaaaaa'
            }).setOrigin(0.5);

            // Stars
            this.add.text(x, actY + 28, `${actProgress.stars}/${actProgress.maxStars} ⭐`, {
                fontSize: '10px',
                fontFamily: 'monospace',
                color: '#FFD700'
            }).setOrigin(0.5);

            // Hover effect
            box.on('pointerover', () => {
                if (!isActive) {
                    box.setFillStyle(act.color, 0.5);
                }
            });

            box.on('pointerout', () => {
                if (!isActive) {
                    box.setFillStyle(act.color, 0.3);
                }
            });
        }
    }

    showActMissions() {
        const width = this.cameras.main.width;
        const campaign = storyCampaign.getCampaignStructure();
        const act = campaign[`act${this.currentAct}`];

        let y = 260;

        // Act title and theme
        this.add.text(width / 2, y, `${act.icon} ${act.name}`, {
            fontSize: '24px',
            fontFamily: 'monospace',
            color: '#' + act.color.toString(16).padStart(6, '0'),
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(width / 2, y + 30, act.theme, {
            fontSize: '12px',
            fontFamily: 'monospace',
            color: '#888888',
            fontStyle: 'italic'
        }).setOrigin(0.5);

        y += 80;

        // Mission list
        act.missions.forEach((mission, index) => {
            const yPos = y + (index * 65);
            if (yPos > 800) return; // Don't render off-screen missions

            const isUnlocked = storyCampaign.isMissionUnlocked(mission.id);
            const isCompleted = storyCampaign.getProgress().completedMissions.includes(mission.id);
            const stars = storyCampaign.getProgress().missionStars[mission.id] || 0;

            // Mission box
            const boxColor = isCompleted ? 0x4CAF50 : (isUnlocked ? 0x333333 : 0x1a1a2e);
            const box = this.add.rectangle(width / 2, yPos, 700, 60, boxColor, 0.8);
            box.setStrokeStyle(isUnlocked ? 2 : 1, isUnlocked ? 0x666666 : 0x333333);

            if (isUnlocked) {
                box.setInteractive({ useHandCursor: true });

                box.on('pointerdown', () => {
                    this.playMission(mission);
                });

                box.on('pointerover', () => {
                    box.setFillStyle(boxColor, 1.0);
                });

                box.on('pointerout', () => {
                    box.setFillStyle(boxColor, 0.8);
                });
            }

            // Mission number
            this.add.text(width / 2 - 330, yPos - 15, `#${mission.number}`, {
                fontSize: '12px',
                fontFamily: 'monospace',
                color: '#888888',
                fontStyle: 'bold'
            });

            // Mission name
            this.add.text(width / 2 - 290, yPos - 15, mission.name, {
                fontSize: '16px',
                fontFamily: 'monospace',
                color: isUnlocked ? '#ffffff' : '#444444',
                fontStyle: 'bold'
            });

            // Description
            this.add.text(width / 2 - 290, yPos + 8, isUnlocked ? mission.description : '🔒 Locked', {
                fontSize: '11px',
                fontFamily: 'monospace',
                color: isUnlocked ? '#aaaaaa' : '#444444'
            });

            // Stars (if completed)
            if (isCompleted) {
                const starText = '⭐'.repeat(stars) + '☆'.repeat(3 - stars);
                this.add.text(width / 2 + 250, yPos - 10, starText, {
                    fontSize: '14px'
                }).setOrigin(1, 0.5);

                this.add.text(width / 2 + 320, yPos - 10, '✓ DONE', {
                    fontSize: '10px',
                    fontFamily: 'monospace',
                    color: '#4CAF50',
                    fontStyle: 'bold'
                }).setOrigin(1, 0.5);
            } else if (isUnlocked) {
                // Play button
                const playBtn = this.add.text(width / 2 + 300, yPos, '▶ PLAY', {
                    fontSize: '12px',
                    fontFamily: 'monospace',
                    color: '#ffffff',
                    backgroundColor: act.color,
                    padding: { x: 10, y: 5 }
                }).setOrigin(1, 0.5);
                playBtn.setInteractive({ useHandCursor: true });

                playBtn.on('pointerdown', (event) => {
                    event.stopPropagation();
                    this.playMission(mission);
                });
            }

            // Difficulty badge
            const diffColors = {
                easy: 0x4CAF50,
                medium: 0xF39C12,
                hard: 0xE74C3C,
                very_hard: 0x9B59B6,
                extreme: 0xFF0066
            };

            if (mission.difficulty && isUnlocked) {
                this.add.text(width / 2 + 250, yPos + 10, mission.difficulty.toUpperCase(), {
                    fontSize: '8px',
                    fontFamily: 'monospace',
                    color: '#ffffff',
                    backgroundColor: '#' + (diffColors[mission.difficulty] || 0x888888).toString(16).padStart(6, '0'),
                    padding: { x: 6, y: 2 }
                }).setOrigin(1, 0.5);
            }
        });
    }

    playMission(mission) {
        // Show mission briefing
        this.showMissionBriefing(mission);
    }

    showMissionBriefing(mission) {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Overlay
        const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.9);
        overlay.setOrigin(0);
        overlay.setDepth(100);

        // Briefing box
        const box = this.add.rectangle(width / 2, height / 2, 700, 500, 0x1a1a2e);
        box.setStrokeStyle(4, 0x16A085);
        box.setDepth(101);

        // Mission title
        this.add.text(width / 2, height / 2 - 220, `Mission ${mission.number}: ${mission.name}`, {
            fontSize: '24px',
            fontFamily: 'monospace',
            color: '#16A085',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(102);

        // Description
        this.add.text(width / 2, height / 2 - 170, mission.description, {
            fontSize: '14px',
            fontFamily: 'monospace',
            color: '#aaaaaa',
            align: 'center'
        }).setOrigin(0.5).setDepth(102);

        // Objectives
        let y = height / 2 - 120;

        this.add.text(width / 2, y, 'OBJECTIVES:', {
            fontSize: '14px',
            fontFamily: 'monospace',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(102);

        y += 30;

        mission.objectives.forEach((obj, index) => {
            this.add.text(width / 2 - 250, y + (index * 25), `• ${obj}`, {
                fontSize: '12px',
                fontFamily: 'monospace',
                color: '#ffffff'
            }).setDepth(102);
        });

        y += mission.objectives.length * 25 + 40;

        // Rewards
        this.add.text(width / 2, y, 'REWARDS:', {
            fontSize: '14px',
            fontFamily: 'monospace',
            color: '#FFD700',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(102);

        y += 30;

        const rewards = [];
        if (mission.rewards.xp) rewards.push(`${mission.rewards.xp} XP`);
        if (mission.rewards.coins) rewards.push(`${mission.rewards.coins} 💰`);
        if (mission.rewards.skin) rewards.push(`Skin: ${mission.rewards.skin}`);
        if (mission.rewards.title) rewards.push(`Title: ${mission.rewards.title}`);

        this.add.text(width / 2, y, rewards.join(' • '), {
            fontSize: '12px',
            fontFamily: 'monospace',
            color: '#FFD700'
        }).setOrigin(0.5).setDepth(102);

        // Dialogue preview
        if (mission.dialogue && mission.dialogue.intro) {
            y += 50;

            this.add.text(width / 2, y, `"${mission.dialogue.intro}"`, {
                fontSize: '11px',
                fontFamily: 'monospace',
                color: '#888888',
                fontStyle: 'italic',
                align: 'center',
                wordWrap: { width: 600 }
            }).setOrigin(0.5).setDepth(102);
        }

        // Start button
        const startBtn = this.add.text(width / 2, height / 2 + 200, '▶ START MISSION', {
            fontSize: '18px',
            fontFamily: 'monospace',
            color: '#ffffff',
            backgroundColor: '#16A085',
            padding: { x: 25, y: 12 }
        }).setOrigin(0.5).setDepth(102);
        startBtn.setInteractive({ useHandCursor: true });

        startBtn.on('pointerdown', () => {
            // Launch the game mode for this mission
            this.scene.start(mission.mode, { campaign: true, mission: mission });
        });

        // Cancel button
        const cancelBtn = this.add.text(width / 2, height / 2 + 240, '[ BACK ]', {
            fontSize: '14px',
            fontFamily: 'monospace',
            color: '#ffffff',
            backgroundColor: '#333333',
            padding: { x: 15, y: 8 }
        }).setOrigin(0.5).setDepth(102);
        cancelBtn.setInteractive({ useHandCursor: true });

        cancelBtn.on('pointerdown', () => {
            overlay.destroy();
            box.destroy();
            this.children.list.filter(c => c.depth >= 102).forEach(c => c.destroy());
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
