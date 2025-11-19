// Debug Dungeon - Roguelike dungeon crawler game mode

import Phaser from 'phaser';
import { gameData } from '../utils/GameData.js';
import SoundManager from '../utils/SoundManager.js';
import ParticleEffects from '../utils/ParticleEffects.js';
import PowerUpManager from '../utils/PowerUps.js';
import TutorialSystem from '../utils/TutorialSystem.js';

export default class DebugDungeonScene extends Phaser.Scene {
    constructor() {
        super({ key: 'DebugDungeonScene' });
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Game state
        this.gameOver = false;
        this.currentRoom = 1;
        this.maxRooms = 10;
        this.score = 0;
        this.playerHealth = 100;
        this.playerMana = 100;
        this.bugs = [];
        this.doors = [];
        this.treasures = [];
        this.difficultyMult = gameData.getDifficultyMultiplier();

        // Initialize systems
        this.sounds = new SoundManager();
        this.particles = new ParticleEffects(this);
        this.powerUps = new PowerUpManager(this);
        this.tutorial = new TutorialSystem(this);

        // Background
        this.add.rectangle(0, 0, width, height, 0x0f0f1e).setOrigin(0);

        // Create first room
        this.createRoom();

        // Create player
        this.createPlayer();

        // HUD
        this.createHUD();

        // Controls
        this.createControls();

        // Help button
        this.createHelpButton();

        // Tutorial (first time)
        if (!gameData.data.tutorialsCompleted) {
            gameData.data.tutorialsCompleted = [];
        }
        if (!gameData.data.tutorialsCompleted.includes('DebugDungeonScene')) {
            this.tutorial.start('DebugDungeonScene');
            gameData.data.tutorialsCompleted.push('DebugDungeonScene');
            gameData.save();
        }
    }

    createPlayer() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        this.player = this.add.circle(width / 2, height / 2, 15, 0x00aaff);
        this.physics.add.existing(this.player);
        this.player.body.setCollideWorldBounds(true);

        // Player icon
        this.playerIcon = this.add.text(this.player.x, this.player.y, '👨‍💻', {
            fontSize: '24px'
        }).setOrigin(0.5);

        this.playerSpeed = 250;
    }

    createRoom() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Clear previous room
        this.bugs.forEach(bug => {
            if (bug.active) {
                if (bug.icon) bug.icon.destroy();
                if (bug.label) bug.label.destroy();
                bug.destroy();
            }
        });
        this.doors.forEach(door => door.destroy());
        this.treasures.forEach(treasure => {
            if (treasure.active) {
                if (treasure.icon) treasure.icon.destroy();
                treasure.destroy();
            }
        });
        this.bugs = [];
        this.doors = [];
        this.treasures = [];

        // Room title
        const roomText = this.add.text(width / 2, 30, `🏰 Room ${this.currentRoom} / ${this.maxRooms}`, {
            fontSize: '20px',
            fontFamily: 'monospace',
            color: '#00aaff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Fade out after 2 seconds
        this.time.delayedCall(2000, () => {
            this.tweens.add({
                targets: roomText,
                alpha: 0,
                duration: 500,
                onComplete: () => roomText.destroy()
            });
        });

        // Room layout
        this.createRoomLayout();

        // Spawn bugs (enemies)
        this.spawnBugs();

        // Spawn treasure
        if (Math.random() < 0.4) {
            this.spawnTreasure();
        }

        // Create exit door (locked until bugs cleared)
        this.createExitDoor();
    }

    createRoomLayout() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Room walls
        const wallThickness = 10;

        const topWall = this.add.rectangle(width / 2, wallThickness / 2, width, wallThickness, 0x333333);
        this.physics.add.existing(topWall);
        topWall.body.setImmovable(true);

        const bottomWall = this.add.rectangle(width / 2, height - wallThickness / 2, width, wallThickness, 0x333333);
        this.physics.add.existing(bottomWall);
        bottomWall.body.setImmovable(true);

        const leftWall = this.add.rectangle(wallThickness / 2, height / 2, wallThickness, height, 0x333333);
        this.physics.add.existing(leftWall);
        leftWall.body.setImmovable(true);

        const rightWall = this.add.rectangle(width - wallThickness / 2, height / 2, wallThickness, height, 0x333333);
        this.physics.add.existing(rightWall);
        rightWall.body.setImmovable(true);

        // Random obstacles
        const obstacleCount = Math.floor(Math.random() * 4) + 2;
        for (let i = 0; i < obstacleCount; i++) {
            const x = Phaser.Math.Between(100, width - 100);
            const y = Phaser.Math.Between(100, height - 100);
            const obstacle = this.add.rectangle(x, y, 40, 40, 0x555555);
            this.physics.add.existing(obstacle);
            obstacle.body.setImmovable(true);
        }
    }

    spawnBugs() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const bugCount = Math.floor(this.currentRoom * 1.5 * this.difficultyMult) + 2;

        const bugTypes = [
            { name: '🐛 Syntax Error', color: 0xff0000, health: 20, speed: 60, reward: 10 },
            { name: '⚠️ Type Error', color: 0xff6600, health: 30, speed: 50, reward: 15 },
            { name: '💥 Runtime Error', color: 0xff00ff, health: 40, speed: 70, reward: 20 },
            { name: '🔴 Logic Error', color: 0xaa0000, health: 35, speed: 55, reward: 18 },
            { name: '⛔ Null Exception', color: 0x000000, health: 50, speed: 40, reward: 25 }
        ];

        for (let i = 0; i < bugCount; i++) {
            const x = Phaser.Math.Between(100, width - 100);
            const y = Phaser.Math.Between(100, height - 150);
            const type = Phaser.Utils.Array.GetRandom(bugTypes);

            const bug = this.add.circle(x, y, 12, type.color);
            this.physics.add.existing(bug);

            bug.bugData = {
                name: type.name,
                health: type.health,
                maxHealth: type.health,
                speed: type.speed,
                reward: type.reward
            };

            bug.icon = this.add.text(bug.x, bug.y, type.name.split(' ')[0], {
                fontSize: '20px'
            }).setOrigin(0.5);

            this.bugs.push(bug);
        }
    }

    spawnTreasure() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        const x = Phaser.Math.Between(150, width - 150);
        const y = Phaser.Math.Between(150, height - 150);

        const treasure = this.add.circle(x, y, 15, 0xffd700);
        this.physics.add.existing(treasure);

        treasure.icon = this.add.text(x, y, '💎', {
            fontSize: '24px'
        }).setOrigin(0.5);

        // Glow animation
        this.tweens.add({
            targets: treasure,
            scale: 1.2,
            alpha: 0.8,
            duration: 500,
            yoyo: true,
            repeat: -1
        });

        this.treasures.push(treasure);
    }

    createExitDoor() {
        const width = this.cameras.main.width;

        const door = this.add.rectangle(width / 2, 550, 80, 40, 0x666666);
        this.physics.add.existing(door);

        door.label = this.add.text(width / 2, 550, '🚪 LOCKED', {
            fontSize: '16px',
            fontFamily: 'monospace',
            color: '#ff0000'
        }).setOrigin(0.5);

        door.isLocked = true;

        this.doors.push(door);
    }

    createControls() {
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = {
            up: this.input.keyboard.addKey('W'),
            down: this.input.keyboard.addKey('S'),
            left: this.input.keyboard.addKey('A'),
            right: this.input.keyboard.addKey('D')
        };
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // Mouse click for shooting
        this.input.on('pointerdown', (pointer) => {
            if (!this.gameOver && !this.tutorial.isActive()) {
                this.shootProjectile(pointer.x, pointer.y);
            }
        });
    }

    shootProjectile(targetX, targetY) {
        if (this.playerMana < 10) return;

        this.playerMana -= 10;
        this.sounds.playSound('shoot');

        const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, targetX, targetY);

        const projectile = this.add.circle(this.player.x, this.player.y, 5, 0x00ffff);
        this.physics.add.existing(projectile);

        projectile.body.setVelocity(Math.cos(angle) * 400, Math.sin(angle) * 400);

        // Collision with bugs
        this.physics.add.overlap(projectile, this.bugs, (proj, bug) => {
            this.hitBug(bug, proj);
        });

        // Auto-destroy after 2 seconds
        this.time.delayedCall(2000, () => {
            if (projectile.active) projectile.destroy();
        });
    }

    hitBug(bug, projectile) {
        if (!bug.active || !bug.bugData) return;

        bug.bugData.health -= 15;

        this.sounds.playSound('hit');
        this.particles.hit(bug.x, bug.y);

        if (projectile && projectile.active) {
            projectile.destroy();
        }

        if (bug.bugData.health <= 0) {
            // Bug defeated
            this.score += bug.bugData.reward;
            this.particles.explosion(bug.x, bug.y);

            if (bug.icon) bug.icon.destroy();
            if (bug.label) bug.label.destroy();
            bug.destroy();

            const index = this.bugs.indexOf(bug);
            if (index > -1) this.bugs.splice(index, 1);

            // Check if room cleared
            this.checkRoomCleared();

            // Stats
            gameData.updateStat('debugDungeon.bugsFixed', 1, 'add');
            gameData.save();
        }
    }

    checkRoomCleared() {
        const activeBugs = this.bugs.filter(b => b.active);
        if (activeBugs.length === 0) {
            // Unlock door
            this.doors.forEach(door => {
                door.isLocked = false;
                door.setFillStyle(0x00ff00);
                if (door.label) {
                    door.label.setText('🚪 OPEN');
                    door.label.setColor('#00ff00');
                }
            });

            this.particles.floatingText(400, 300, '✅ ROOM CLEARED!', '#00ff00', '20px');
            this.sounds.playSound('upgrade');
        }
    }

    createHUD() {
        // Health bar
        this.add.text(20, 20, 'Health:', {
            fontSize: '14px',
            fontFamily: 'monospace',
            color: '#ffffff'
        });

        this.healthBarBg = this.add.rectangle(90, 28, 150, 15, 0x000000);
        this.healthBar = this.add.rectangle(90, 28, 150, 15, 0xff0000);
        this.healthBar.setOrigin(0, 0.5);

        // Mana bar
        this.add.text(20, 45, 'Mana:', {
            fontSize: '14px',
            fontFamily: 'monospace',
            color: '#ffffff'
        });

        this.manaBarBg = this.add.rectangle(90, 53, 150, 15, 0x000000);
        this.manaBar = this.add.rectangle(90, 53, 150, 15, 0x00aaff);
        this.manaBar.setOrigin(0, 0.5);

        // Score
        this.scoreText = this.add.text(20, 75, 'Score: 0', {
            fontSize: '14px',
            fontFamily: 'monospace',
            color: '#ffff00'
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
                this.tutorial.start('DebugDungeonScene');
            }
        });
        helpBtn.on('pointerover', () => helpBtn.setStyle({ backgroundColor: '#555555' }));
        helpBtn.on('pointerout', () => helpBtn.setStyle({ backgroundColor: '#333333' }));
    }

    update() {
        if (this.gameOver || this.tutorial.isActive()) return;

        // Player movement
        let velocityX = 0;
        let velocityY = 0;

        if (this.cursors.left.isDown || this.wasd.left.isDown) {
            velocityX = -this.playerSpeed;
        } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
            velocityX = this.playerSpeed;
        }

        if (this.cursors.up.isDown || this.wasd.up.isDown) {
            velocityY = -this.playerSpeed;
        } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
            velocityY = this.playerSpeed;
        }

        this.player.body.setVelocity(velocityX, velocityY);

        // Update player icon
        if (this.playerIcon) {
            this.playerIcon.setPosition(this.player.x, this.player.y);
        }

        // Update bugs
        this.updateBugs();

        // Check treasure collection
        this.checkTreasureCollection();

        // Check door interaction
        this.checkDoorInteraction();

        // Regenerate mana
        if (this.playerMana < 100) {
            this.playerMana = Math.min(100, this.playerMana + 0.2);
        }

        // Update HUD
        this.updateHUD();

        // Power-ups
        this.powerUps.update();
    }

    updateBugs() {
        this.bugs.forEach(bug => {
            if (!bug.active) return;

            const angle = Phaser.Math.Angle.Between(bug.x, bug.y, this.player.x, this.player.y);
            bug.body.setVelocity(
                Math.cos(angle) * bug.bugData.speed,
                Math.sin(angle) * bug.bugData.speed
            );

            if (bug.icon) {
                bug.icon.setPosition(bug.x, bug.y);
            }

            // Collision with player
            const dist = Phaser.Math.Distance.Between(bug.x, bug.y, this.player.x, this.player.y);
            if (dist < 20) {
                this.takeDamage(10);
                bug.bugData.health = 0;
                this.hitBug(bug, null);
            }
        });
    }

    checkTreasureCollection() {
        this.treasures.forEach(treasure => {
            if (!treasure.active) return;

            const dist = Phaser.Math.Distance.Between(
                treasure.x, treasure.y, this.player.x, this.player.y
            );

            if (dist < 25) {
                this.collectTreasure(treasure);
            }
        });
    }

    collectTreasure(treasure) {
        this.score += 100;
        this.playerHealth = Math.min(100, this.playerHealth + 30);
        this.playerMana = 100;

        this.sounds.playSound('collect');
        this.particles.collectPowerUp(treasure.x, treasure.y);
        this.particles.floatingText(treasure.x, treasure.y, '+100', '#ffd700');

        if (treasure.icon) treasure.icon.destroy();
        treasure.destroy();

        const index = this.treasures.indexOf(treasure);
        if (index > -1) this.treasures.splice(index, 1);
    }

    checkDoorInteraction() {
        this.doors.forEach(door => {
            if (door.isLocked) return;

            const dist = Phaser.Math.Distance.Between(
                door.x, door.y, this.player.x, this.player.y
            );

            if (dist < 50) {
                this.nextRoom();
            }
        });
    }

    nextRoom() {
        this.currentRoom++;

        if (this.currentRoom > this.maxRooms) {
            this.winGame();
        } else {
            this.createRoom();
            this.player.setPosition(400, 300);
        }
    }

    takeDamage(amount) {
        this.playerHealth = Math.max(0, this.playerHealth - amount);
        this.sounds.playSound('damage');
        this.cameras.main.shake(100, 0.005);

        if (this.playerHealth <= 0) {
            this.endGame();
        }
    }

    updateHUD() {
        const healthPercent = this.playerHealth / 100;
        this.healthBar.width = 150 * healthPercent;

        const manaPercent = this.playerMana / 100;
        this.manaBar.width = 150 * manaPercent;

        this.scoreText.setText(`Score: ${this.score}`);
    }

    winGame() {
        this.gameOver = true;

        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Victory screen
        const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.8);
        overlay.setOrigin(0);

        this.add.text(width / 2, height / 2 - 50, '🎉 DUNGEON CLEARED! 🎉', {
            fontSize: '32px',
            fontFamily: 'monospace',
            color: '#00ff00',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(width / 2, height / 2 + 20, `Final Score: ${this.score}`, {
            fontSize: '24px',
            fontFamily: 'monospace',
            color: '#ffff00'
        }).setOrigin(0.5);

        // Update stats
        gameData.updateStat('debugDungeon.gamesPlayed', 1, 'add');
        gameData.updateStat('debugDungeon.highScore', this.score, 'max');
        gameData.save();

        this.createReturnButton();
    }

    endGame() {
        this.gameOver = true;

        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.8);
        overlay.setOrigin(0);

        this.add.text(width / 2, height / 2 - 50, '💀 DEBUGGED! 💀', {
            fontSize: '32px',
            fontFamily: 'monospace',
            color: '#ff0000',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(width / 2, height / 2 + 20, `Score: ${this.score} | Room: ${this.currentRoom}`, {
            fontSize: '20px',
            fontFamily: 'monospace',
            color: '#ffffff'
        }).setOrigin(0.5);

        gameData.updateStat('debugDungeon.gamesPlayed', 1, 'add');
        gameData.save();

        this.createReturnButton();
    }

    createReturnButton() {
        const btn = this.add.text(400, 450, '[ Return to Menu ]', {
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
        this.powerUps.cleanup();
        this.scene.start('MainMenuScene');
    }
}
