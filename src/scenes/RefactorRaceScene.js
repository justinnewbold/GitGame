// Refactor Race - Fast-paced code optimization game mode

import Phaser from 'phaser';
import { gameData } from '../utils/GameData.js';
import SoundManager from '../utils/SoundManager.js';
import ParticleEffects from '../utils/ParticleEffects.js';
import TutorialSystem from '../utils/TutorialSystem.js';

export default class RefactorRaceScene extends Phaser.Scene {
    constructor() {
        super({ key: 'RefactorRaceScene' });
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Game state
        this.gameOver = false;
        this.timeRemaining = 60; // 60 seconds
        this.score = 0;
        this.refactorsCompleted = 0;
        this.streak = 0;
        this.currentCodeBlock = null;
        this.codeBlocks = [];
        this.difficultyMult = gameData.getDifficultyMultiplier();

        // Initialize systems
        this.sounds = new SoundManager();
        this.particles = new ParticleEffects(this);
        this.tutorial = new TutorialSystem(this);

        // Background
        this.add.rectangle(0, 0, width, height, 0x1a1a2e).setOrigin(0);

        // Create grid background effect
        this.createGridBackground();

        // HUD
        this.createHUD();

        // Spawn first code block
        this.spawnCodeBlock();

        // Controls
        this.createControls();

        // Help button
        this.createHelpButton();

        // Start timer
        this.startTimer();

        // Tutorial
        if (!gameData.data.tutorialsCompleted) {
            gameData.data.tutorialsCompleted = [];
        }
        if (!gameData.data.tutorialsCompleted.includes('RefactorRaceScene')) {
            this.tutorial.start('RefactorRaceScene');
            gameData.data.tutorialsCompleted.push('RefactorRaceScene');
            gameData.save();
        }
    }

    createGridBackground() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        const graphics = this.add.graphics();
        graphics.lineStyle(1, 0x00ff00, 0.1);

        // Vertical lines
        for (let x = 0; x < width; x += 50) {
            graphics.lineBetween(x, 0, x, height);
        }

        // Horizontal lines
        for (let y = 0; y < height; y += 50) {
            graphics.lineBetween(0, y, width, y);
        }
    }

    spawnCodeBlock() {
        const codeIssues = [
            {
                type: 'duplication',
                emoji: '📋',
                name: 'Code Duplication',
                code: 'function getUser() {\\n  db.query(...);\\n}\\nfunction getAdmin() {\\n  db.query(...);\\n}',
                fix: 'Extract common query',
                points: 10,
                time: 3
            },
            {
                type: 'longmethod',
                emoji: '📏',
                name: 'Long Method',
                code: 'function processData() {\\n  // 200 lines of code\\n  // doing everything\\n}',
                fix: 'Break into smaller functions',
                points: 15,
                time: 4
            },
            {
                type: 'magic',
                emoji: '🔮',
                name: 'Magic Numbers',
                code: 'if (status === 42) {\\n  timeout = 86400;\\n}',
                fix: 'Use named constants',
                points: 8,
                time: 2
            },
            {
                type: 'nested',
                emoji: '🪆',
                name: 'Nested Conditionals',
                code: 'if (a) {\\n  if (b) {\\n    if (c) {\\n      if (d) {...}',
                fix: 'Early returns / flatten',
                points: 12,
                time: 3
            },
            {
                type: 'global',
                emoji: '🌍',
                name: 'Global Variables',
                code: 'var userData;\\nvar config;\\nvar state;',
                fix: 'Encapsulate in module',
                points: 10,
                time: 3
            },
            {
                type: 'comments',
                emoji: '💬',
                name: 'Excessive Comments',
                code: '// This adds 1\\nx = x + 1;\\n// This checks if x > 5\\nif (x > 5) {...}',
                fix: 'Self-documenting code',
                points: 7,
                time: 2
            },
            {
                type: 'naming',
                emoji: '🏷️',
                name: 'Poor Naming',
                code: 'var x = getUserData();\\nvar y = x.map(z => z.a);',
                fix: 'Descriptive names',
                points: 9,
                time: 2
            },
            {
                type: 'deadcode',
                emoji: '💀',
                name: 'Dead Code',
                code: 'function unused() {\\n  // never called\\n}\\nvar oldVar = null;',
                fix: 'Delete unused code',
                points: 6,
                time: 2
            },
            {
                type: 'coupling',
                emoji: '🔗',
                name: 'Tight Coupling',
                code: 'class A {\\n  b = new B();\\n  b.method();\\n}',
                fix: 'Dependency injection',
                points: 14,
                time: 4
            },
            {
                type: 'complexity',
                emoji: '🌀',
                name: 'Cyclomatic Complexity',
                code: 'function calc(a,b,c,d,e,f) {\\n  if(...) if(...) if(...) {...}',
                fix: 'Simplify logic',
                points: 13,
                time: 4
            },
            {
                type: 'exception',
                emoji: '⚠️',
                name: 'Empty Catch',
                code: 'try {\\n  risky();\\n} catch(e) {\\n  // ignore\\n}',
                fix: 'Proper error handling',
                points: 11,
                time: 3
            },
            {
                type: 'primitive',
                emoji: '🧱',
                name: 'Primitive Obsession',
                code: 'function getUser(name, age, email, phone, ...) {',
                fix: 'Create User object',
                points: 10,
                time: 3
            }
        ];

        const issue = Phaser.Utils.Array.GetRandom(codeIssues);

        const width = this.cameras.main.width;
        const startY = 150;

        // Code block container
        const container = this.add.container(width / 2, startY);

        const bg = this.add.rectangle(0, 0, 600, 180, 0x2a2a3e, 0.95);
        bg.setStrokeStyle(3, 0xff6600);

        const emoji = this.add.text(-280, -70, issue.emoji, {
            fontSize: '32px'
        });

        const title = this.add.text(-280, -30, issue.name, {
            fontSize: '20px',
            fontFamily: 'monospace',
            color: '#ff6600',
            fontStyle: 'bold'
        });

        const codeText = this.add.text(-280, 0, issue.code, {
            fontSize: '12px',
            fontFamily: 'monospace',
            color: '#00ff00',
            wordWrap: { width: 540 }
        });

        const fixText = this.add.text(-280, 55, `Fix: ${issue.fix}`, {
            fontSize: '14px',
            fontFamily: 'monospace',
            color: '#ffff00'
        });

        // Button options
        const buttonY = 110;
        const refactorBtn = this.createButton(-100, buttonY, '✅ Refactor', 0x00aa00, () => {
            this.refactorCode(issue, true);
        });

        const skipBtn = this.createButton(100, buttonY, '⏭️ Skip', 0xaa0000, () => {
            this.refactorCode(issue, false);
        });

        container.add([bg, emoji, title, codeText, fixText, refactorBtn.bg, refactorBtn.text, skipBtn.bg, skipBtn.text]);

        this.currentCodeBlock = {
            container: container,
            issue: issue,
            refactorBtn: refactorBtn,
            skipBtn: skipBtn
        };

        // Slide in animation
        container.y = -200;
        this.tweens.add({
            targets: container,
            y: startY,
            duration: 300,
            ease: 'Back.easeOut'
        });
    }

    createButton(x, y, text, color, callback) {
        const bg = this.add.rectangle(x, y, 120, 35, color, 0.8);
        bg.setStrokeStyle(2, 0xffffff);
        bg.setInteractive({ useHandCursor: true });

        const label = this.add.text(x, y, text, {
            fontSize: '14px',
            fontFamily: 'monospace',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        bg.on('pointerdown', callback);
        bg.on('pointerover', () => {
            bg.setFillStyle(color, 1.0);
            bg.setScale(1.05);
        });
        bg.on('pointerout', () => {
            bg.setFillStyle(color, 0.8);
            bg.setScale(1);
        });

        return { bg, text: label };
    }

    refactorCode(issue, success) {
        if (this.gameOver) return;

        if (success) {
            // Successful refactor
            const points = issue.points * (1 + this.streak * 0.1);
            this.score += Math.floor(points);
            this.refactorsCompleted++;
            this.streak++;
            this.timeRemaining += issue.time;

            this.sounds.playSound('collect');
            this.particles.explosion(400, 150, 0x00ff00);
            this.particles.floatingText(400, 200, `+${Math.floor(points)} pts`, '#00ff00');

            // Combo notification
            if (this.streak >= 5) {
                this.particles.floatingText(400, 250, `${this.streak}x STREAK!`, '#ffff00', '20px');
            }
        } else {
            // Skipped
            this.streak = 0;
            this.sounds.playSound('damage');
        }

        // Remove current block
        if (this.currentCodeBlock) {
            this.tweens.add({
                targets: this.currentCodeBlock.container,
                y: -200,
                duration: 200,
                onComplete: () => {
                    this.currentCodeBlock.container.destroy();
                    this.currentCodeBlock = null;

                    // Spawn next block
                    if (!this.gameOver) {
                        this.time.delayedCall(300, () => this.spawnCodeBlock());
                    }
                }
            });
        }
    }

    createControls() {
        // Keyboard shortcuts
        this.input.keyboard.on('keydown-SPACE', () => {
            if (this.currentCodeBlock && !this.gameOver && !this.tutorial.isActive()) {
                this.refactorCode(this.currentCodeBlock.issue, true);
            }
        });

        this.input.keyboard.on('keydown-S', () => {
            if (this.currentCodeBlock && !this.gameOver && !this.tutorial.isActive()) {
                this.refactorCode(this.currentCodeBlock.issue, false);
            }
        });
    }

    createHUD() {
        const width = this.cameras.main.width;

        // Timer
        this.timerText = this.add.text(width / 2, 40, '⏱️ 60s', {
            fontSize: '32px',
            fontFamily: 'monospace',
            color: '#00ff00',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Score
        this.scoreText = this.add.text(20, 20, 'Score: 0', {
            fontSize: '18px',
            fontFamily: 'monospace',
            color: '#ffff00'
        });

        // Refactors completed
        this.refactorsText = this.add.text(20, 45, 'Refactored: 0', {
            fontSize: '14px',
            fontFamily: 'monospace',
            color: '#00aaff'
        });

        // Streak
        this.streakText = this.add.text(20, 65, 'Streak: 0x', {
            fontSize: '14px',
            fontFamily: 'monospace',
            color: '#ff00ff'
        });

        // Back button
        const backBtn = this.add.text(700, 20, '← Menu', {
            fontSize: '14px',
            fontFamily: 'monospace',
            color: '#ffffff',
            backgroundColor: '#333333',
            padding: { x: 8, y: 4 }
        });
        backBtn.setInteractive({ useHandCursor: true });
        backBtn.on('pointerdown', () => this.exitToMenu());
        backBtn.on('pointerover', () => backBtn.setStyle({ backgroundColor: '#555555' }));
        backBtn.on('pointerout', () => backBtn.setStyle({ backgroundColor: '#333333' }));
    }

    createHelpButton() {
        const helpBtn = this.add.text(640, 20, '❓', {
            fontSize: '18px',
            fontFamily: 'monospace',
            backgroundColor: '#333333',
            padding: { x: 6, y: 2 }
        });
        helpBtn.setInteractive({ useHandCursor: true });
        helpBtn.on('pointerdown', () => {
            if (!this.tutorial.isActive()) {
                this.tutorial.start('RefactorRaceScene');
            }
        });
        helpBtn.on('pointerover', () => helpBtn.setStyle({ backgroundColor: '#555555' }));
        helpBtn.on('pointerout', () => helpBtn.setStyle({ backgroundColor: '#333333' }));
    }

    startTimer() {
        this.timerEvent = this.time.addEvent({
            delay: 1000,
            callback: () => {
                if (!this.tutorial.isActive()) {
                    this.timeRemaining--;

                    // Update timer color based on time
                    let color = '#00ff00';
                    if (this.timeRemaining <= 10) {
                        color = '#ff0000';
                    } else if (this.timeRemaining <= 30) {
                        color = '#ffff00';
                    }

                    this.timerText.setText(`⏱️ ${this.timeRemaining}s`);
                    this.timerText.setColor(color);

                    // Warning flash
                    if (this.timeRemaining <= 10) {
                        this.tweens.add({
                            targets: this.timerText,
                            scale: 1.2,
                            duration: 250,
                            yoyo: true
                        });
                    }

                    if (this.timeRemaining <= 0) {
                        this.endGame();
                    }
                }
            },
            loop: true
        });
    }

    update() {
        if (this.gameOver || this.tutorial.isActive()) return;

        // Update HUD
        this.scoreText.setText(`Score: ${this.score}`);
        this.refactorsText.setText(`Refactored: ${this.refactorsCompleted}`);
        this.streakText.setText(`Streak: ${this.streak}x`);
    }

    endGame() {
        if (this.gameOver) return;
        this.gameOver = true;

        if (this.timerEvent) {
            this.timerEvent.remove();
        }

        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Game over screen
        const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.85);
        overlay.setOrigin(0);

        this.add.text(width / 2, height / 2 - 80, '⏱️ TIME\'S UP! ⏱️', {
            fontSize: '32px',
            fontFamily: 'monospace',
            color: '#ff6600',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(width / 2, height / 2 - 20, `Final Score: ${this.score}`, {
            fontSize: '24px',
            fontFamily: 'monospace',
            color: '#ffff00'
        }).setOrigin(0.5);

        this.add.text(width / 2, height / 2 + 15, `Refactors: ${this.refactorsCompleted}`, {
            fontSize: '18px',
            fontFamily: 'monospace',
            color: '#00aaff'
        }).setOrigin(0.5);

        this.add.text(width / 2, height / 2 + 45, `Best Streak: ${this.streak}x`, {
            fontSize: '18px',
            fontFamily: 'monospace',
            color: '#ff00ff'
        }).setOrigin(0.5);

        // Funny message
        const messages = [
            'Code quality: Acceptable!',
            'Shipped it anyway!',
            'Technical debt paid off!',
            'LGTM - Ship it!',
            'Refactored like a pro!',
            'Clean code achieved!'
        ];
        this.add.text(width / 2, height / 2 + 75, Phaser.Utils.Array.GetRandom(messages), {
            fontSize: '14px',
            fontFamily: 'monospace',
            color: '#888888',
            fontStyle: 'italic'
        }).setOrigin(0.5);

        // Update stats
        gameData.updateStat('refactorRace.gamesPlayed', 1, 'add');
        gameData.updateStat('refactorRace.highScore', this.score, 'max');
        gameData.updateStat('refactorRace.totalRefactors', this.refactorsCompleted, 'add');
        gameData.save();

        this.createReturnButton();
    }

    createReturnButton() {
        const btn = this.add.text(400, 500, '[ Return to Menu ]', {
            fontSize: '18px',
            fontFamily: 'monospace',
            color: '#00ff00',
            backgroundColor: '#000000',
            padding: { x: 15, y: 8 }
        }).setOrigin(0.5);

        btn.setInteractive({ useHandCursor: true });
        btn.on('pointerdown', () => this.exitToMenu());
        btn.on('pointerover', () => btn.setStyle({ backgroundColor: '#333333' }));
        btn.on('pointerout', () => btn.setStyle({ backgroundColor: '#000000' }));
    }

    exitToMenu() {
        if (this.timerEvent) {
            this.timerEvent.remove();
        }
        this.scene.start('MainMenuScene');
    }
}
