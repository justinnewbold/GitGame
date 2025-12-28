// Easter Eggs and Secrets System - Hidden content and funny surprises!

import Phaser from 'phaser';
import { gameData } from './GameData.js';

export default class EasterEggs {
    constructor(scene) {
        this.scene = scene;
        this.secretCodes = [];
        this.currentInput = [];
        this.maxInputLength = 20;
        this.discovered = new Set();

        // Load discovered eggs
        if (gameData.data.easterEggs) {
            this.discovered = new Set(gameData.data.easterEggs.discovered || []);
        } else {
            gameData.data.easterEggs = { discovered: [] };
        }

        this.initializeSecretCodes();
    }

    // Initialize all secret codes
    initializeSecretCodes() {
        this.secretCodes = [
            {
                id: 'konami',
                name: 'Konami Code',
                code: ['UP', 'UP', 'DOWN', 'DOWN', 'LEFT', 'RIGHT', 'LEFT', 'RIGHT', 'B', 'A'],
                reward: {
                    type: 'powerup',
                    effect: 'invincibility',
                    duration: 30000,
                    message: '🎮 KONAMI CODE ACTIVATED! 30 SECONDS OF INVINCIBILITY!'
                }
            },
            {
                id: 'idkfa',
                name: 'DOOM Reference',
                code: ['I', 'D', 'K', 'F', 'A'],
                reward: {
                    type: 'allpowerups',
                    message: '💪 ALL POWER-UPS UNLOCKED! (DOOM style)'
                }
            },
            {
                id: 'iddqd',
                name: 'God Mode',
                code: ['I', 'D', 'D', 'Q', 'D'],
                reward: {
                    type: 'godmode',
                    duration: 60000,
                    message: '😇 GOD MODE ACTIVATED! (60 seconds)'
                }
            },
            {
                id: 'stackoverflow',
                name: 'Stack Overflow',
                code: ['S', 'T', 'A', 'C', 'K'],
                reward: {
                    type: 'knowledge',
                    message: '📚 STACK OVERFLOW WISDOM GRANTED! All answers revealed!'
                }
            },
            {
                id: 'coffee',
                name: 'Coffee Addict',
                code: ['C', 'O', 'F', 'F', 'E', 'E'],
                reward: {
                    type: 'caffeine',
                    message: '☕ MAXIMUM CAFFEINE! Speed x3!'
                }
            },
            {
                id: 'debug',
                name: 'Debug Mode',
                code: ['D', 'E', 'B', 'U', 'G'],
                reward: {
                    type: 'debug',
                    message: '🐛 DEBUG MODE ENABLED! See all the things!'
                }
            },
            {
                id: 'rushb',
                name: 'Rush B',
                code: ['R', 'U', 'S', 'H', 'B'],
                reward: {
                    type: 'speed',
                    message: '🏃 RUSH B! CYKA BLYAT! Speed boost!'
                }
            },
            {
                id: 'leet',
                name: '1337 H4X0R',
                code: ['ONE', 'THREE', 'THREE', 'SEVEN'],
                reward: {
                    type: 'hacker',
                    message: '👨‍💻 1337 H4X0R MODE! Matrix vision enabled!'
                }
            },
            {
                id: 'potato',
                name: 'Potato Code',
                code: ['P', 'O', 'T', 'A', 'T', 'O'],
                reward: {
                    type: 'funny',
                    message: '🥔 POTATO MODE! Everything is a potato now!',
                    skin: 'potato'
                }
            },
            {
                id: 'rubber',
                name: 'Rubber Duck',
                code: ['D', 'U', 'C', 'K'],
                reward: {
                    type: 'companion',
                    message: '🦆 RUBBER DUCK ARMY! They help you debug!',
                    skin: 'alien'
                }
            }
        ];
    }

    // Handle keyboard input for secret codes
    handleInput(key) {
        // Convert arrow keys
        const keyMap = {
            'ArrowUp': 'UP',
            'ArrowDown': 'DOWN',
            'ArrowLeft': 'LEFT',
            'ArrowRight': 'RIGHT',
            'KeyB': 'B',
            'KeyA': 'A',
            '1': 'ONE',
            '3': 'THREE',
            '7': 'SEVEN'
        };

        // Extract letter from KeyX format
        let input = keyMap[key] || (key.startsWith('Key') ? key.replace('Key', '') : key);

        // Add to input buffer
        this.currentInput.push(input);

        // Limit buffer size
        if (this.currentInput.length > this.maxInputLength) {
            this.currentInput.shift();
        }

        // Check for matches
        this.checkSecretCodes();
    }

    // Check if any secret code matches
    checkSecretCodes() {
        for (const secret of this.secretCodes) {
            if (this.matchesCode(secret.code)) {
                this.activateSecret(secret);
                this.currentInput = []; // Clear buffer
                return true;
            }
        }
        return false;
    }

    // Check if current input matches a code
    matchesCode(code) {
        if (this.currentInput.length < code.length) return false;

        const recentInput = this.currentInput.slice(-code.length);
        return JSON.stringify(recentInput) === JSON.stringify(code);
    }

    // Activate secret reward
    activateSecret(secret) {
        // Mark as discovered
        if (!this.discovered.has(secret.id)) {
            this.discovered.add(secret.id);
            gameData.data.easterEggs.discovered.push(secret.id);
            gameData.save();

            // Show discovery notification
            this.showDiscoveryNotification(secret);
        }

        // Apply reward
        this.applyReward(secret.reward);

        // Sound effect
        if (this.scene.sounds) {
            this.scene.sounds.playSound('upgrade');
        }

        // Particle effect
        if (this.scene.particles) {
            const width = this.scene.cameras.main.width;
            const height = this.scene.cameras.main.height;
            this.scene.particles.confetti(width / 2, height / 2);
        }
    }

    // Show discovery notification
    showDiscoveryNotification(secret) {
        const width = this.scene.cameras.main.width;
        const height = this.scene.cameras.main.height;

        // Big flashy notification
        const bg = this.scene.add.rectangle(0, 0, width, height, 0x000000, 0.8);
        bg.setOrigin(0);
        bg.setDepth(2000);

        const titleText = this.scene.add.text(width / 2, height / 2 - 50, '🎉 SECRET DISCOVERED!', {
            fontSize: '32px',
            fontFamily: 'monospace',
            color: '#ffff00',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 6
        });
        titleText.setOrigin(0.5);
        titleText.setDepth(2001);

        const nameText = this.scene.add.text(width / 2, height / 2, secret.name, {
            fontSize: '24px',
            fontFamily: 'monospace',
            color: '#00ff00',
            fontStyle: 'bold'
        });
        nameText.setOrigin(0.5);
        nameText.setDepth(2001);

        const messageText = this.scene.add.text(width / 2, height / 2 + 50, secret.reward.message, {
            fontSize: '16px',
            fontFamily: 'monospace',
            color: '#ffffff',
            align: 'center',
            wordWrap: { width: width - 100 }
        });
        messageText.setOrigin(0.5);
        messageText.setDepth(2001);

        // Pulse animation
        this.scene.tweens.add({
            targets: [titleText, nameText],
            scale: 1.2,
            duration: 500,
            yoyo: true,
            repeat: 2
        });

        // Auto-dismiss after 3 seconds
        this.scene.time.delayedCall(3000, () => {
            this.scene.tweens.add({
                targets: [bg, titleText, nameText, messageText],
                alpha: 0,
                duration: 500,
                onComplete: () => {
                    bg.destroy();
                    titleText.destroy();
                    nameText.destroy();
                    messageText.destroy();
                }
            });
        });
    }

    // Apply secret reward effects
    applyReward(reward) {
        switch (reward.type) {
            case 'powerup':
                if (this.scene.powerUps) {
                    this.scene.powerUps.activate('darkmode', reward.duration);
                }
                break;

            case 'allpowerups':
                if (this.scene.powerUps) {
                    const powerUpTypes = ['coffee', 'keyboard', 'copilot', 'pair', 'cleancode'];
                    powerUpTypes.forEach(type => {
                        this.scene.powerUps.activate(type, 10000);
                    });
                }
                break;

            case 'godmode':
                if (this.scene.playerHealth !== undefined) {
                    this.scene.godMode = true;
                    this.scene.time.delayedCall(reward.duration, () => {
                        this.scene.godMode = false;
                    });
                }
                break;

            case 'knowledge':
                // Reveal all enemy info
                if (this.scene.enemies) {
                    this.scene.showEnemyHealth = true;
                }
                break;

            case 'caffeine':
                // Triple speed boost
                if (this.scene.player) {
                    const originalSpeed = this.scene.playerSpeed || 200;
                    this.scene.playerSpeed = originalSpeed * 3;
                    this.scene.time.delayedCall(15000, () => {
                        this.scene.playerSpeed = originalSpeed;
                    });
                }
                break;

            case 'debug':
                // Enable debug overlays
                this.scene.physics.world.drawDebug = !this.scene.physics.world.drawDebug;
                break;

            case 'speed':
                // Major speed boost
                if (this.scene.player) {
                    const originalSpeed = this.scene.playerSpeed || 200;
                    this.scene.playerSpeed = originalSpeed * 2;
                    this.scene.time.delayedCall(10000, () => {
                        this.scene.playerSpeed = originalSpeed;
                    });
                }
                break;

            case 'hacker':
                // Matrix effect
                if (this.scene.particles) {
                    this.createMatrixEffect();
                }
                break;

            case 'funny':
                // Funny visual changes
                if (reward.skin) {
                    // Temporarily change player appearance
                    this.applyFunnyMode();
                }
                break;

            case 'companion':
                // Spawn helper ducks
                this.spawnRubberDucks();
                break;
        }
    }

    // Create Matrix rain effect
    createMatrixEffect() {
        const width = this.scene.cameras.main.width;
        const height = this.scene.cameras.main.height;

        for (let i = 0; i < 20; i++) {
            const x = Math.random() * width;
            const chars = '01';
            let yPos = 0;

            const dropMatrix = () => {
                if (yPos > height) return;

                const char = chars[Math.floor(Math.random() * chars.length)];
                const text = this.scene.add.text(x, yPos, char, {
                    fontSize: '16px',
                    fontFamily: 'monospace',
                    color: '#00ff00'
                });
                text.setDepth(500);

                yPos += 20;

                this.scene.tweens.add({
                    targets: text,
                    alpha: 0,
                    duration: 1000,
                    onComplete: () => text.destroy()
                });

                this.scene.time.delayedCall(100, dropMatrix);
            };

            this.scene.time.delayedCall(i * 100, dropMatrix);
        }
    }

    // Apply funny mode visuals
    applyFunnyMode() {
        // Make everything wobble
        if (this.scene.cameras.main) {
            this.scene.tweens.add({
                targets: this.scene.cameras.main,
                rotation: 0.1,
                duration: 500,
                yoyo: true,
                repeat: 10
            });
        }
    }

    // Spawn helper rubber ducks
    spawnRubberDucks() {
        if (!this.scene.physics || !this.scene.add) return;

        for (let i = 0; i < 5; i++) {
            const duck = this.scene.add.text(
                this.scene.player ? this.scene.player.x : 400,
                this.scene.player ? this.scene.player.y : 300,
                '🦆',
                { fontSize: '24px' }
            );

            this.scene.physics.add.existing(duck);
            duck.body.setVelocity(
                Phaser.Math.Between(-100, 100),
                Phaser.Math.Between(-100, 100)
            );

            // Ducks bounce around
            duck.body.setBounce(1);
            duck.body.setCollideWorldBounds(true);

            // Auto-remove after 10 seconds
            this.scene.time.delayedCall(10000, () => {
                if (duck && duck.active) {
                    this.scene.tweens.add({
                        targets: duck,
                        alpha: 0,
                        duration: 500,
                        onComplete: () => duck.destroy()
                    });
                }
            });
        }
    }

    // Get list of discovered secrets
    getDiscovered() {
        return Array.from(this.discovered);
    }

    // Get total secrets count
    getTotalSecretsCount() {
        return this.secretCodes.length;
    }

    // Get discovery percentage
    getDiscoveryPercentage() {
        return Math.floor((this.discovered.size / this.secretCodes.length) * 100);
    }

    // Hidden click Easter Eggs (for UI elements)
    checkClickSecret(elementName, clickCount) {
        const clickSecrets = {
            'title': {
                clicks: 10,
                reward: 'You found the secret! Have 1000 coins!',
                coins: 1000
            },
            'logo': {
                clicks: 5,
                reward: 'Logo lover! Here\'s a special color!',
                color: 'rainbow'
            },
            'credits': {
                clicks: 3,
                reward: 'Thanks for reading the credits! Achievement unlocked!',
                achievement: 'credits_reader'
            }
        };

        const secret = clickSecrets[elementName];
        if (secret && clickCount >= secret.clicks) {
            this.activateClickSecret(secret);
            return true;
        }

        return false;
    }

    // Activate click-based secret
    activateClickSecret(secret) {
        if (this.scene.particles) {
            this.scene.particles.floatingText(
                this.scene.cameras.main.width / 2,
                this.scene.cameras.main.height / 2,
                secret.reward,
                '#ffff00'
            );
        }

        if (secret.coins) {
            gameData.data.stats.totalScore += secret.coins;
            gameData.save();
        }
    }

    // Reset input buffer
    reset() {
        this.currentInput = [];
    }
}
