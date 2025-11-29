import Phaser from 'phaser';
import { COLORS } from '../main.js';
import { gameData } from '../utils/GameData.js';

export default class GitSurvivorScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GitSurvivorScene' });
    }

    init() {
        this.score = 0;
        this.wave = 1;
        this.health = 100;
        this.enemies = [];
        this.projectiles = [];
        this.isGameOver = false;
        this.killCount = 0;
        this.lastShotTime = 0;
        this.shootCooldown = 250;
    }

    create() {
        const { width, height } = this.cameras.main;

        this.cameras.main.fadeIn(300, 10, 10, 11);

        // Game area
        this.gameArea = {
            x: 24,
            y: 120,
            width: width - 48,
            height: height - 240
        };

        // Create UI
        this.createHUD(width);
        this.createGameArea();
        this.createPlayer();
        this.createControls(width, height);

        // Start game
        this.startWave();

        // Auto-shoot timer
        this.time.addEvent({
            delay: this.shootCooldown,
            callback: () => this.autoShoot(),
            loop: true
        });

        // Track game start
        gameData.incrementGamesPlayed();
    }

    createHUD(width) {
        // Back button
        const backBtn = this.add.container(24, 50);
        const backBg = this.add.circle(0, 0, 20, COLORS.surface);
        const backIcon = this.add.text(0, 0, '\u2190', {
            fontSize: '20px',
            color: '#71717a'
        }).setOrigin(0.5);

        backBtn.add([backBg, backIcon]);
        backBg.setInteractive({ useHandCursor: true });
        backBg.on('pointerdown', () => this.exitGame());

        // Title
        this.add.text(width / 2, 50, 'Survivor', {
            fontSize: '20px',
            fontFamily: 'Inter, sans-serif',
            color: '#fafafa',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Wave indicator
        this.waveText = this.add.text(width - 24, 50, `Wave ${this.wave}`, {
            fontSize: '14px',
            fontFamily: 'Inter, sans-serif',
            color: '#71717a'
        }).setOrigin(1, 0.5);

        // Score
        this.scoreText = this.add.text(width / 2, 85, '0', {
            fontSize: '32px',
            fontFamily: 'Inter, sans-serif',
            color: '#fafafa',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Health bar
        const healthBarWidth = width - 48;
        this.healthBarBg = this.add.rectangle(width / 2, 110, healthBarWidth, 6, COLORS.surface);
        this.healthBar = this.add.rectangle(24 + healthBarWidth / 2, 110, healthBarWidth, 6, COLORS.primary);
        this.healthBar.setOrigin(0.5);
    }

    createGameArea() {
        const { x, y, width, height } = this.gameArea;

        // Game area border
        const border = this.add.rectangle(x + width / 2, y + height / 2, width, height, COLORS.surface, 0.3);
        border.setStrokeStyle(1, COLORS.surfaceLight);
    }

    createPlayer() {
        const { x, y, width, height } = this.gameArea;
        const centerX = x + width / 2;
        const centerY = y + height / 2;

        // Player
        this.player = this.add.circle(centerX, centerY, 16, COLORS.primary);
        this.physics.add.existing(this.player);
        this.player.body.setCollideWorldBounds(false);

        // Player glow
        this.playerGlow = this.add.circle(centerX, centerY, 20, COLORS.primary, 0.3);

        // Constrain to game area
        this.player.body.setBoundsRectangle(
            new Phaser.Geom.Rectangle(
                this.gameArea.x + 16,
                this.gameArea.y + 16,
                this.gameArea.width - 32,
                this.gameArea.height - 32
            )
        );
    }

    createControls(width, height) {
        // Virtual joystick zone (bottom third of screen)
        const joystickY = height - 100;
        const joystickRadius = 50;

        // Joystick base
        this.joystickBase = this.add.circle(width / 2, joystickY, joystickRadius, COLORS.surface, 0.5);
        this.joystickBase.setStrokeStyle(2, COLORS.surfaceLight);

        // Joystick knob
        this.joystickKnob = this.add.circle(width / 2, joystickY, 25, COLORS.surfaceLight);

        // Touch input for movement
        this.input.on('pointerdown', (pointer) => {
            if (pointer.y > height - 200) {
                this.joystickActive = true;
                this.joystickOrigin = { x: pointer.x, y: pointer.y };
                this.joystickBase.setPosition(pointer.x, pointer.y);
                this.joystickKnob.setPosition(pointer.x, pointer.y);
            }
        });

        this.input.on('pointermove', (pointer) => {
            if (this.joystickActive && pointer.isDown) {
                const dx = pointer.x - this.joystickOrigin.x;
                const dy = pointer.y - this.joystickOrigin.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const maxDist = 40;

                if (dist > maxDist) {
                    const angle = Math.atan2(dy, dx);
                    this.joystickKnob.setPosition(
                        this.joystickOrigin.x + Math.cos(angle) * maxDist,
                        this.joystickOrigin.y + Math.sin(angle) * maxDist
                    );
                } else {
                    this.joystickKnob.setPosition(pointer.x, pointer.y);
                }
            }
        });

        this.input.on('pointerup', () => {
            this.joystickActive = false;
            this.joystickKnob.setPosition(this.joystickBase.x, this.joystickBase.y);
        });

        // Keyboard controls as fallback
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys('W,A,S,D');
    }

    startWave() {
        const enemyCount = 3 + this.wave * 2;

        this.waveText.setText(`Wave ${this.wave}`);

        // Wave announcement
        const announcement = this.add.text(
            this.cameras.main.width / 2,
            this.gameArea.y + this.gameArea.height / 2,
            `Wave ${this.wave}`,
            {
                fontSize: '28px',
                fontFamily: 'Inter, sans-serif',
                color: '#fafafa',
                fontStyle: 'bold'
            }
        ).setOrigin(0.5).setAlpha(0);

        this.tweens.add({
            targets: announcement,
            alpha: 1,
            duration: 300,
            yoyo: true,
            hold: 500,
            onComplete: () => announcement.destroy()
        });

        // Spawn enemies with delay
        for (let i = 0; i < enemyCount; i++) {
            this.time.delayedCall(i * 300, () => this.spawnEnemy());
        }
    }

    spawnEnemy() {
        if (this.isGameOver) return;

        const { x, y, width, height } = this.gameArea;
        const enemies = [
            { name: 'Bug', color: COLORS.error, health: 20 + this.wave * 5, speed: 40 + this.wave * 2 },
            { name: 'Leak', color: COLORS.warning, health: 30 + this.wave * 5, speed: 30 + this.wave * 2 },
            { name: 'Conflict', color: 0x9333ea, health: 40 + this.wave * 5, speed: 25 + this.wave * 2 }
        ];

        const type = Phaser.Utils.Array.GetRandom(enemies);

        // Spawn from edge
        const side = Phaser.Math.Between(0, 3);
        let ex, ey;

        switch (side) {
            case 0: ex = x + Math.random() * width; ey = y - 20; break;
            case 1: ex = x + width + 20; ey = y + Math.random() * height; break;
            case 2: ex = x + Math.random() * width; ey = y + height + 20; break;
            case 3: ex = x - 20; ey = y + Math.random() * height; break;
        }

        const enemy = this.add.circle(ex, ey, 12, type.color);
        this.physics.add.existing(enemy);

        enemy.enemyData = {
            name: type.name,
            health: type.health,
            maxHealth: type.health,
            speed: type.speed
        };

        this.enemies.push(enemy);
    }

    autoShoot() {
        if (this.isGameOver || this.enemies.length === 0) return;

        // Find nearest enemy
        let nearest = null;
        let minDist = Infinity;

        this.enemies.forEach(enemy => {
            if (!enemy.active) return;
            const dist = Phaser.Math.Distance.Between(
                this.player.x, this.player.y,
                enemy.x, enemy.y
            );
            if (dist < minDist) {
                minDist = dist;
                nearest = enemy;
            }
        });

        if (nearest && minDist < 300) {
            this.shoot(nearest.x, nearest.y);
        }
    }

    shoot(targetX, targetY) {
        const angle = Phaser.Math.Angle.Between(
            this.player.x, this.player.y,
            targetX, targetY
        );

        const projectile = this.add.circle(this.player.x, this.player.y, 5, COLORS.primary);
        this.physics.add.existing(projectile);

        projectile.body.setVelocity(
            Math.cos(angle) * 400,
            Math.sin(angle) * 400
        );

        projectile.damage = 15;
        this.projectiles.push(projectile);

        // Auto-destroy after 2 seconds
        this.time.delayedCall(2000, () => {
            if (projectile.active) {
                projectile.destroy();
                const idx = this.projectiles.indexOf(projectile);
                if (idx > -1) this.projectiles.splice(idx, 1);
            }
        });
    }

    update() {
        if (this.isGameOver) return;

        this.updatePlayer();
        this.updateEnemies();
        this.checkCollisions();
        this.updateUI();
    }

    updatePlayer() {
        const speed = 150;
        let vx = 0;
        let vy = 0;

        // Virtual joystick
        if (this.joystickActive) {
            const dx = this.joystickKnob.x - this.joystickBase.x;
            const dy = this.joystickKnob.y - this.joystickBase.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > 5) {
                vx = (dx / 40) * speed;
                vy = (dy / 40) * speed;
            }
        }

        // Keyboard
        if (this.cursors.left.isDown || this.wasd.A.isDown) vx = -speed;
        if (this.cursors.right.isDown || this.wasd.D.isDown) vx = speed;
        if (this.cursors.up.isDown || this.wasd.W.isDown) vy = -speed;
        if (this.cursors.down.isDown || this.wasd.S.isDown) vy = speed;

        this.player.body.setVelocity(vx, vy);

        // Constrain to game area
        this.player.x = Phaser.Math.Clamp(
            this.player.x,
            this.gameArea.x + 20,
            this.gameArea.x + this.gameArea.width - 20
        );
        this.player.y = Phaser.Math.Clamp(
            this.player.y,
            this.gameArea.y + 20,
            this.gameArea.y + this.gameArea.height - 20
        );

        // Update glow position
        this.playerGlow.setPosition(this.player.x, this.player.y);
    }

    updateEnemies() {
        this.enemies.forEach((enemy, index) => {
            if (!enemy.active) return;

            // Move toward player
            const angle = Phaser.Math.Angle.Between(
                enemy.x, enemy.y,
                this.player.x, this.player.y
            );

            enemy.body.setVelocity(
                Math.cos(angle) * enemy.enemyData.speed,
                Math.sin(angle) * enemy.enemyData.speed
            );

            // Remove dead enemies
            if (enemy.enemyData.health <= 0) {
                this.enemyKilled(enemy, index);
            }
        });

        // Check for wave complete
        if (this.enemies.length === 0) {
            this.wave++;
            this.time.delayedCall(1000, () => this.startWave());
        }
    }

    enemyKilled(enemy, index) {
        this.score += 10 * this.wave;
        this.killCount++;

        // Death effect
        this.tweens.add({
            targets: enemy,
            scale: 0,
            alpha: 0,
            duration: 150,
            onComplete: () => enemy.destroy()
        });

        this.enemies.splice(index, 1);
    }

    checkCollisions() {
        // Projectile vs Enemy
        this.projectiles.forEach((projectile, pIdx) => {
            if (!projectile.active) return;

            this.enemies.forEach((enemy) => {
                if (!enemy.active) return;

                const dist = Phaser.Math.Distance.Between(
                    projectile.x, projectile.y,
                    enemy.x, enemy.y
                );

                if (dist < 17) {
                    enemy.enemyData.health -= projectile.damage;

                    // Hit flash
                    this.tweens.add({
                        targets: enemy,
                        alpha: 0.5,
                        duration: 50,
                        yoyo: true
                    });

                    projectile.destroy();
                    this.projectiles.splice(pIdx, 1);
                }
            });
        });

        // Enemy vs Player
        this.enemies.forEach((enemy) => {
            if (!enemy.active) return;

            const dist = Phaser.Math.Distance.Between(
                this.player.x, this.player.y,
                enemy.x, enemy.y
            );

            if (dist < 28) {
                this.takeDamage(10);

                // Knockback
                const angle = Phaser.Math.Angle.Between(
                    enemy.x, enemy.y,
                    this.player.x, this.player.y
                );
                this.player.body.setVelocity(
                    Math.cos(angle) * 200,
                    Math.sin(angle) * 200
                );
            }
        });
    }

    takeDamage(amount) {
        this.health -= amount;

        // Screen shake
        this.cameras.main.shake(100, 0.005);

        // Flash player
        this.tweens.add({
            targets: this.player,
            alpha: 0.3,
            duration: 100,
            yoyo: true,
            repeat: 2
        });

        if (this.health <= 0) {
            this.gameOver();
        }
    }

    updateUI() {
        this.scoreText.setText(this.score.toString());

        // Health bar
        const healthPercent = Math.max(0, this.health) / 100;
        const healthBarWidth = (this.cameras.main.width - 48) * healthPercent;
        this.healthBar.width = healthBarWidth;

        // Health bar color
        if (healthPercent < 0.3) {
            this.healthBar.setFillStyle(COLORS.error);
        } else if (healthPercent < 0.6) {
            this.healthBar.setFillStyle(COLORS.warning);
        } else {
            this.healthBar.setFillStyle(COLORS.primary);
        }
    }

    gameOver() {
        this.isGameOver = true;
        this.physics.pause();

        const { width, height } = this.cameras.main;

        // Update high score
        const isNewBest = gameData.updateHighScore('gitSurvivor', this.score);
        gameData.addToTotalScore(this.score);
        gameData.updateStat('gitSurvivor', 'bestWave', this.wave);

        // Overlay
        const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.85);

        // Game over text
        this.add.text(width / 2, height / 2 - 80, 'Game Over', {
            fontSize: '32px',
            fontFamily: 'Inter, sans-serif',
            color: '#fafafa',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Score
        this.add.text(width / 2, height / 2 - 20, this.score.toString(), {
            fontSize: '48px',
            fontFamily: 'Inter, sans-serif',
            color: COLORS.primary.toString().replace('0x', '#'),
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // New best indicator
        if (isNewBest) {
            this.add.text(width / 2, height / 2 + 30, 'New Best!', {
                fontSize: '16px',
                fontFamily: 'Inter, sans-serif',
                color: '#22c55e'
            }).setOrigin(0.5);
        }

        // Stats
        this.add.text(width / 2, height / 2 + 70, `Wave ${this.wave}  ·  ${this.killCount} kills`, {
            fontSize: '14px',
            fontFamily: 'Inter, sans-serif',
            color: '#71717a'
        }).setOrigin(0.5);

        // Retry button
        const retryBg = this.add.rectangle(width / 2, height / 2 + 130, 200, 50, COLORS.primary);
        const retryText = this.add.text(width / 2, height / 2 + 130, 'Play Again', {
            fontSize: '16px',
            fontFamily: 'Inter, sans-serif',
            color: '#fafafa',
            fontStyle: '600'
        }).setOrigin(0.5);

        retryBg.setInteractive({ useHandCursor: true });
        retryBg.on('pointerdown', () => {
            this.scene.restart();
        });

        // Menu button
        const menuBg = this.add.rectangle(width / 2, height / 2 + 195, 200, 50, COLORS.surface);
        menuBg.setStrokeStyle(1, COLORS.surfaceLight);
        const menuText = this.add.text(width / 2, height / 2 + 195, 'Menu', {
            fontSize: '16px',
            fontFamily: 'Inter, sans-serif',
            color: '#fafafa'
        }).setOrigin(0.5);

        menuBg.setInteractive({ useHandCursor: true });
        menuBg.on('pointerdown', () => this.exitGame());
    }

    exitGame() {
        this.cameras.main.fadeOut(200, 10, 10, 11);
        this.time.delayedCall(200, () => {
            this.scene.start('MainMenuScene');
        });
    }
}
