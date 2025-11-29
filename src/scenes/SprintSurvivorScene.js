import Phaser from 'phaser';
import { COLORS } from '../main.js';
import { gameData } from '../utils/GameData.js';

export default class SprintSurvivorScene extends Phaser.Scene {
    constructor() {
        super({ key: 'SprintSurvivorScene' });
    }

    init() {
        this.score = 0;
        this.distance = 0;
        this.speed = 200;
        this.maxSpeed = 500;
        this.lanes = [97, 195, 293]; // 3 lanes
        this.currentLane = 1;
        this.obstacles = [];
        this.collectibles = [];
        this.isGameOver = false;
        this.isJumping = false;
    }

    create() {
        const { width, height } = this.cameras.main;

        this.cameras.main.fadeIn(300, 10, 10, 11);

        // Create game elements
        this.createHUD(width);
        this.createTrack(width, height);
        this.createPlayer(height);
        this.createControls(width, height);

        // Start spawning
        this.startSpawning();

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
        this.add.text(width / 2, 50, 'Sprint', {
            fontSize: '20px',
            fontFamily: 'Inter, sans-serif',
            color: '#fafafa',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Distance
        this.distanceText = this.add.text(width - 24, 50, '0m', {
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

        // Speed indicator
        this.speedText = this.add.text(width / 2, 110, 'Speed: 200', {
            fontSize: '12px',
            fontFamily: 'Inter, sans-serif',
            color: '#71717a'
        }).setOrigin(0.5);
    }

    createTrack(width, height) {
        // Track background
        const trackX = 24;
        const trackWidth = width - 48;
        const trackHeight = height - 200;
        const trackY = 140;

        this.trackBounds = { x: trackX, y: trackY, width: trackWidth, height: trackHeight };

        // Track border
        this.add.rectangle(
            trackX + trackWidth / 2,
            trackY + trackHeight / 2,
            trackWidth,
            trackHeight,
            COLORS.surface,
            0.3
        ).setStrokeStyle(1, COLORS.surfaceLight);

        // Lane dividers
        this.laneDividers = [];
        for (let i = 1; i <= 2; i++) {
            const laneX = trackX + (trackWidth / 3) * i;
            for (let j = 0; j < 15; j++) {
                const dash = this.add.rectangle(
                    laneX,
                    trackY + j * 50,
                    2,
                    25,
                    COLORS.surfaceLight,
                    0.3
                );
                this.laneDividers.push(dash);
            }
        }
    }

    createPlayer(height) {
        const playerY = height - 180;

        // Player
        this.player = this.add.circle(this.lanes[this.currentLane], playerY, 18, COLORS.success);

        // Player indicator
        this.playerIndicator = this.add.triangle(
            this.lanes[this.currentLane],
            playerY - 25,
            0, 10,
            -8, -5,
            8, -5,
            COLORS.success
        );
    }

    createControls(width, height) {
        // Swipe detection
        this.swipeStartX = 0;
        this.swipeStartY = 0;

        this.input.on('pointerdown', (pointer) => {
            this.swipeStartX = pointer.x;
            this.swipeStartY = pointer.y;
        });

        this.input.on('pointerup', (pointer) => {
            const dx = pointer.x - this.swipeStartX;
            const dy = pointer.y - this.swipeStartY;
            const swipeThreshold = 30;

            if (Math.abs(dx) > Math.abs(dy)) {
                // Horizontal swipe
                if (dx > swipeThreshold) {
                    this.switchLane(1); // Right
                } else if (dx < -swipeThreshold) {
                    this.switchLane(-1); // Left
                }
            } else {
                // Vertical swipe - jump
                if (dy < -swipeThreshold) {
                    this.jump();
                }
            }
        });

        // Tap zones for lane switching
        const leftZone = this.add.rectangle(width / 3, height / 2, width / 3, height, 0x000000, 0);
        leftZone.setInteractive();
        leftZone.on('pointerdown', () => this.switchLane(-1));

        const rightZone = this.add.rectangle(width * 2 / 3, height / 2, width / 3, height, 0x000000, 0);
        rightZone.setInteractive();
        rightZone.on('pointerdown', () => this.switchLane(1));

        // Keyboard controls
        this.input.keyboard.on('keydown-LEFT', () => this.switchLane(-1));
        this.input.keyboard.on('keydown-RIGHT', () => this.switchLane(1));
        this.input.keyboard.on('keydown-A', () => this.switchLane(-1));
        this.input.keyboard.on('keydown-D', () => this.switchLane(1));
        this.input.keyboard.on('keydown-SPACE', () => this.jump());
        this.input.keyboard.on('keydown-UP', () => this.jump());
        this.input.keyboard.on('keydown-W', () => this.jump());

        // Instructions
        this.add.text(width / 2, height - 50, 'Swipe or tap sides to move · Swipe up to jump', {
            fontSize: '11px',
            fontFamily: 'Inter, sans-serif',
            color: '#52525b'
        }).setOrigin(0.5);
    }

    switchLane(direction) {
        if (this.isGameOver) return;

        const newLane = Phaser.Math.Clamp(this.currentLane + direction, 0, 2);

        if (newLane !== this.currentLane) {
            this.currentLane = newLane;

            // Smooth transition
            this.tweens.add({
                targets: [this.player, this.playerIndicator],
                x: this.lanes[this.currentLane],
                duration: 100,
                ease: 'Quad.easeOut'
            });
        }
    }

    jump() {
        if (this.isGameOver || this.isJumping) return;

        this.isJumping = true;

        // Jump animation
        this.tweens.add({
            targets: [this.player, this.playerIndicator],
            y: '-=80',
            duration: 200,
            yoyo: true,
            ease: 'Quad.easeOut',
            onComplete: () => {
                this.isJumping = false;
            }
        });

        // Scale effect
        this.tweens.add({
            targets: this.player,
            scale: 1.2,
            duration: 100,
            yoyo: true
        });
    }

    startSpawning() {
        // Obstacles
        this.obstacleTimer = this.time.addEvent({
            delay: 1200,
            callback: () => this.spawnObstacle(),
            loop: true
        });

        // Collectibles
        this.collectibleTimer = this.time.addEvent({
            delay: 2000,
            callback: () => this.spawnCollectible(),
            loop: true
        });
    }

    spawnObstacle() {
        if (this.isGameOver) return;

        const lane = Phaser.Math.Between(0, 2);
        const types = [
            { color: COLORS.error, size: 15 },
            { color: COLORS.warning, size: 12 },
            { color: 0x9333ea, size: 18 }
        ];

        const type = Phaser.Utils.Array.GetRandom(types);

        const obstacle = this.add.circle(
            this.lanes[lane],
            this.trackBounds.y - 20,
            type.size,
            type.color
        );

        obstacle.lane = lane;
        obstacle.isObstacle = true;
        this.obstacles.push(obstacle);
    }

    spawnCollectible() {
        if (this.isGameOver) return;

        const lane = Phaser.Math.Between(0, 2);

        const collectible = this.add.circle(
            this.lanes[lane],
            this.trackBounds.y - 20,
            10,
            COLORS.primary
        );

        // Glow effect
        collectible.glow = this.add.circle(
            this.lanes[lane],
            this.trackBounds.y - 20,
            14,
            COLORS.primary,
            0.3
        );

        collectible.lane = lane;
        collectible.value = 50;
        this.collectibles.push(collectible);
    }

    update(time, delta) {
        if (this.isGameOver) return;

        // Increase speed over time
        this.speed = Math.min(this.maxSpeed, this.speed + 0.02);

        // Update distance
        this.distance += (this.speed * delta) / 1000;

        // Scroll lane dividers
        this.laneDividers.forEach(dash => {
            dash.y += (this.speed * delta) / 1000;
            if (dash.y > this.trackBounds.y + this.trackBounds.height) {
                dash.y = this.trackBounds.y - 25;
            }
        });

        // Update obstacles
        this.updateObstacles(delta);

        // Update collectibles
        this.updateCollectibles(delta);

        // Passive score gain
        this.score += Math.floor(this.speed / 100);

        // Update UI
        this.updateUI();
    }

    updateObstacles(delta) {
        const playerY = this.player.y;

        this.obstacles.forEach((obstacle, index) => {
            obstacle.y += (this.speed * delta) / 1000;

            // Check collision
            if (!this.isJumping &&
                obstacle.lane === this.currentLane &&
                Math.abs(obstacle.y - playerY) < 30) {
                this.hitObstacle(obstacle, index);
            }

            // Remove off-screen
            if (obstacle.y > this.trackBounds.y + this.trackBounds.height + 30) {
                obstacle.destroy();
                this.obstacles.splice(index, 1);
                this.score += 10; // Dodge bonus
            }
        });
    }

    updateCollectibles(delta) {
        const playerY = this.player.y;

        this.collectibles.forEach((collectible, index) => {
            collectible.y += (this.speed * delta) / 1000;
            if (collectible.glow) {
                collectible.glow.y = collectible.y;
            }

            // Check collection
            if (collectible.lane === this.currentLane &&
                Math.abs(collectible.y - playerY) < 35) {
                this.collect(collectible, index);
            }

            // Remove off-screen
            if (collectible.y > this.trackBounds.y + this.trackBounds.height + 30) {
                if (collectible.glow) collectible.glow.destroy();
                collectible.destroy();
                this.collectibles.splice(index, 1);
            }
        });
    }

    hitObstacle(obstacle, index) {
        // Screen shake
        this.cameras.main.shake(150, 0.01);

        // Flash player
        this.tweens.add({
            targets: this.player,
            alpha: 0.3,
            duration: 100,
            yoyo: true,
            repeat: 2
        });

        // Slow down
        this.speed = Math.max(150, this.speed - 80);

        // Remove obstacle
        obstacle.destroy();
        this.obstacles.splice(index, 1);

        // Game over if too slow
        if (this.speed <= 150) {
            this.gameOver();
        }
    }

    collect(collectible, index) {
        this.score += collectible.value;

        // Speed boost
        this.speed = Math.min(this.maxSpeed, this.speed + 20);

        // Collection effect
        this.tweens.add({
            targets: collectible,
            scale: 1.5,
            alpha: 0,
            duration: 150,
            onComplete: () => collectible.destroy()
        });

        if (collectible.glow) {
            this.tweens.add({
                targets: collectible.glow,
                scale: 2,
                alpha: 0,
                duration: 150,
                onComplete: () => collectible.glow.destroy()
            });
        }

        this.collectibles.splice(index, 1);
    }

    updateUI() {
        this.scoreText.setText(Math.floor(this.score).toString());
        this.distanceText.setText(`${Math.floor(this.distance)}m`);
        this.speedText.setText(`Speed: ${Math.floor(this.speed)}`);
    }

    gameOver() {
        this.isGameOver = true;

        if (this.obstacleTimer) this.obstacleTimer.remove();
        if (this.collectibleTimer) this.collectibleTimer.remove();

        const { width, height } = this.cameras.main;

        // Update stats
        const finalScore = Math.floor(this.score);
        const isNewBest = gameData.updateHighScore('sprintSurvivor', finalScore);
        gameData.addToTotalScore(finalScore);
        gameData.updateStat('sprintSurvivor', 'bestDistance', Math.floor(this.distance));

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
        this.add.text(width / 2, height / 2 - 20, finalScore.toString(), {
            fontSize: '48px',
            fontFamily: 'Inter, sans-serif',
            color: '#22c55e',
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
        this.add.text(width / 2, height / 2 + 70, `${Math.floor(this.distance)}m  ·  Max speed: ${Math.floor(this.speed)}`, {
            fontSize: '14px',
            fontFamily: 'Inter, sans-serif',
            color: '#71717a'
        }).setOrigin(0.5);

        // Retry button
        const retryBg = this.add.rectangle(width / 2, height / 2 + 130, 200, 50, COLORS.success);
        this.add.text(width / 2, height / 2 + 130, 'Play Again', {
            fontSize: '16px',
            fontFamily: 'Inter, sans-serif',
            color: '#fafafa',
            fontStyle: '600'
        }).setOrigin(0.5);

        retryBg.setInteractive({ useHandCursor: true });
        retryBg.on('pointerdown', () => this.scene.restart());

        // Menu button
        const menuBg = this.add.rectangle(width / 2, height / 2 + 195, 200, 50, COLORS.surface);
        menuBg.setStrokeStyle(1, COLORS.surfaceLight);
        this.add.text(width / 2, height / 2 + 195, 'Menu', {
            fontSize: '16px',
            fontFamily: 'Inter, sans-serif',
            color: '#fafafa'
        }).setOrigin(0.5);

        menuBg.setInteractive({ useHandCursor: true });
        menuBg.on('pointerdown', () => this.exitGame());
    }

    exitGame() {
        if (this.obstacleTimer) this.obstacleTimer.remove();
        if (this.collectibleTimer) this.collectibleTimer.remove();

        this.cameras.main.fadeOut(200, 10, 10, 11);
        this.time.delayedCall(200, () => {
            this.scene.start('MainMenuScene');
        });
    }
}
