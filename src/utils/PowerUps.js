// Power-up definitions and spawning system

import Phaser from 'phaser';

export const PowerUpTypes = {
    // Universal power-ups
    COFFEE: {
        id: 'coffee',
        name: 'Coffee',
        emoji: '☕',
        color: 0xaa6600,
        effect: 'Boost speed and morale',
        rarity: 'common',
        duration: 5000
    },
    STACK_OVERFLOW: {
        id: 'stackoverflow',
        name: 'Stack Overflow Answer',
        emoji: '📚',
        color: 0xff6600,
        effect: 'Instant solve nearby problems',
        rarity: 'rare',
        duration: 0
    },
    RUBBER_DUCK: {
        id: 'rubberduck',
        name: 'Rubber Duck',
        emoji: '🦆',
        color: 0xffff00,
        effect: 'Debug boost - see enemy weaknesses',
        rarity: 'uncommon',
        duration: 8000
    },
    GIT_REVERT: {
        id: 'gitrevert',
        name: 'Git Revert',
        emoji: '↩️',
        color: 0x00aaff,
        effect: 'Undo last mistake',
        rarity: 'rare',
        duration: 0
    },
    DARK_MODE: {
        id: 'darkmode',
        name: 'Dark Mode',
        emoji: '🌙',
        color: 0x6600ff,
        effect: 'Invincibility for a short time',
        rarity: 'rare',
        duration: 3000
    },
    KEYBOARD_WARRIOR: {
        id: 'keyboard',
        name: 'Mechanical Keyboard',
        emoji: '⌨️',
        color: 0x00ff00,
        effect: 'Double attack speed',
        rarity: 'uncommon',
        duration: 7000
    },
    ENERGY_DRINK: {
        id: 'energydrink',
        name: 'Energy Drink',
        emoji: '🥤',
        color: 0x00ff00,
        effect: 'Extreme speed boost',
        rarity: 'uncommon',
        duration: 4000
    },
    COPILOT: {
        id: 'copilot',
        name: 'AI Copilot',
        emoji: '🤖',
        color: 0xff00ff,
        effect: 'Auto-complete tasks faster',
        rarity: 'epic',
        duration: 10000
    },
    PAIR_PROGRAMMING: {
        id: 'pair',
        name: 'Pair Programming',
        emoji: '👥',
        color: 0x00ffff,
        effect: 'Double effectiveness',
        rarity: 'rare',
        duration: 6000
    },
    DOCUMENTATION: {
        id: 'docs',
        name: 'Good Documentation',
        emoji: '📖',
        color: 0xffffff,
        effect: 'Increased accuracy',
        rarity: 'legendary',
        duration: 15000
    },
    UNIT_TESTS: {
        id: 'unittests',
        name: 'Unit Tests',
        emoji: '✅',
        color: 0x00ff00,
        effect: 'Auto-defend against bugs',
        rarity: 'uncommon',
        duration: 8000
    },
    DEBUGGER: {
        id: 'debugger',
        name: 'Debugger',
        emoji: '🐛',
        color: 0xff0000,
        effect: 'Slow down enemies',
        rarity: 'rare',
        duration: 6000
    },
    VIM_MODE: {
        id: 'vim',
        name: 'Vim Mode',
        emoji: '⚡',
        color: 0x00ff00,
        effect: 'Ultra-fast movement',
        rarity: 'epic',
        duration: 5000
    },
    STACK_TRACE: {
        id: 'stacktrace',
        name: 'Stack Trace',
        emoji: '🔍',
        color: 0xffaa00,
        effect: 'Reveal enemy paths',
        rarity: 'common',
        duration: 10000
    },
    CODE_REVIEW: {
        id: 'codereview',
        name: 'Code Review',
        emoji: '👁️',
        color: 0x00aaff,
        effect: 'Spot mistakes early',
        rarity: 'rare',
        duration: 7000
    },
    REFACTOR: {
        id: 'refactor',
        name: 'Refactor',
        emoji: '♻️',
        color: 0x00cc00,
        effect: 'Optimize everything',
        rarity: 'uncommon',
        duration: 9000
    },
    HOTFIX: {
        id: 'hotfix',
        name: 'Hotfix',
        emoji: '🚑',
        color: 0xff0000,
        effect: 'Emergency instant fix',
        rarity: 'rare',
        duration: 0
    },
    DEPLOYMENT: {
        id: 'deployment',
        name: 'Deployment',
        emoji: '🚀',
        color: 0xff6600,
        effect: 'Massive damage burst',
        rarity: 'epic',
        duration: 0
    },
    MERGE_SUCCESS: {
        id: 'merge',
        name: 'Merge Success',
        emoji: '🎯',
        color: 0xffff00,
        effect: 'Resolve all conflicts',
        rarity: 'legendary',
        duration: 12000
    },
    CLEAN_CODE: {
        id: 'cleancode',
        name: 'Clean Code',
        emoji: '✨',
        color: 0xffffff,
        effect: 'Perfect execution',
        rarity: 'epic',
        duration: 8000
    }
};

export default class PowerUpManager {
    constructor(scene) {
        this.scene = scene;
        this.activePowerUps = new Map();
        this.powerUps = [];
    }

    // Spawn a power-up at location
    spawn(x, y, type = null) {
        // Random power-up if not specified
        if (!type) {
            const types = Object.values(PowerUpTypes);
            const weights = types.map(t => {
                switch(t.rarity) {
                    case 'common': return 40;
                    case 'uncommon': return 25;
                    case 'rare': return 20;
                    case 'epic': return 10;
                    case 'legendary': return 5;
                    default: return 10;
                }
            });

            const totalWeight = weights.reduce((a, b) => a + b, 0);
            let random = Math.random() * totalWeight;

            for (let i = 0; i < types.length; i++) {
                random -= weights[i];
                if (random <= 0) {
                    type = types[i];
                    break;
                }
            }
        }

        // Create power-up sprite
        const powerUp = this.scene.add.circle(x, y, 12, type.color);
        powerUp.setStrokeStyle(2, 0xffffff);
        this.scene.physics.add.existing(powerUp);

        // Add emoji
        const emoji = this.scene.add.text(x, y, type.emoji, {
            fontSize: '20px'
        }).setOrigin(0.5);

        // Floating animation
        this.scene.tweens.add({
            targets: [powerUp, emoji],
            y: y - 10,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Glow effect
        const glow = this.scene.add.circle(x, y, 15, type.color, 0.3);
        this.scene.tweens.add({
            targets: glow,
            scale: 1.5,
            alpha: 0,
            duration: 1000,
            repeat: -1
        });

        powerUp.powerUpData = {
            type: type,
            emoji: emoji,
            glow: glow
        };

        this.powerUps.push(powerUp);

        // Auto-despawn after 15 seconds
        this.scene.time.delayedCall(15000, () => {
            if (powerUp.active) {
                this.scene.tweens.add({
                    targets: [powerUp, emoji, glow],
                    alpha: 0,
                    duration: 500,
                    onComplete: () => {
                        powerUp.destroy();
                        emoji.destroy();
                        glow.destroy();
                        const idx = this.powerUps.indexOf(powerUp);
                        if (idx > -1) this.powerUps.splice(idx, 1);
                    }
                });
            }
        });

        return powerUp;
    }

    // Collect power-up
    collect(powerUp, collector) {
        if (!powerUp.active) return;

        const type = powerUp.powerUpData.type;

        // Visual feedback
        if (this.scene.particles) {
            this.scene.particles.collectPowerUp(powerUp.x, powerUp.y);
        }

        // Play sound
        if (this.scene.sounds) {
            this.scene.sounds.playSound('collect');
        }

        // Show notification
        if (this.scene.particles) {
            this.scene.particles.floatingText(
                powerUp.x,
                powerUp.y - 30,
                `${type.emoji} ${type.name}`,
                '#ffff00'
            );
        }

        // Apply effect
        this.activate(type.id, type.duration, collector);

        // Clean up
        powerUp.powerUpData.emoji.destroy();
        powerUp.powerUpData.glow.destroy();
        powerUp.destroy();

        const idx = this.powerUps.indexOf(powerUp);
        if (idx > -1) this.powerUps.splice(idx, 1);

        return type;
    }

    // Activate power-up effect
    activate(typeId, duration, target) {
        // If already active, extend duration
        if (this.activePowerUps.has(typeId)) {
            const existing = this.activePowerUps.get(typeId);
            existing.timer.remove();
        }

        const activation = {
            id: typeId,
            startTime: Date.now(),
            duration: duration,
            target: target
        };

        if (duration > 0) {
            activation.timer = this.scene.time.delayedCall(duration, () => {
                this.deactivate(typeId);
            });
        } else {
            // Instant effect
            this.applyInstantEffect(typeId, target);
        }

        this.activePowerUps.set(typeId, activation);

        return activation;
    }

    // Deactivate power-up
    deactivate(typeId) {
        if (this.activePowerUps.has(typeId)) {
            const activation = this.activePowerUps.get(typeId);
            if (activation.timer) {
                activation.timer.remove();
            }
            this.activePowerUps.delete(typeId);
        }
    }

    // Apply instant effects
    applyInstantEffect(typeId, target) {
        switch(typeId) {
            case 'stackoverflow':
                // Kill nearby enemies or complete tasks
                if (this.scene.enemies) {
                    this.scene.enemies.slice(0, 5).forEach(enemy => {
                        if (enemy.enemyData) {
                            enemy.enemyData.health = 0;
                        }
                    });
                }
                break;

            case 'gitrevert':
                // Heal or restore resources
                if (this.scene.playerHealth !== undefined) {
                    this.scene.playerHealth = Math.min(100, this.scene.playerHealth + 30);
                }
                if (this.scene.health !== undefined) {
                    this.scene.health = Math.min(100, this.scene.health + 20);
                }
                break;

            case 'hotfix':
                // Emergency heal - restore more health
                if (this.scene.playerHealth !== undefined) {
                    this.scene.playerHealth = Math.min(100, this.scene.playerHealth + 50);
                }
                if (this.scene.playerSanity !== undefined) {
                    this.scene.playerSanity = Math.min(100, this.scene.playerSanity + 30);
                }
                if (this.scene.health !== undefined) {
                    this.scene.health = Math.min(100, this.scene.health + 40);
                }
                break;

            case 'deployment':
                // Massive damage - clear screen of enemies
                if (this.scene.enemies) {
                    this.scene.enemies.forEach(enemy => {
                        if (enemy.enemyData) {
                            enemy.enemyData.health = 0;
                        }
                    });

                    // Screen shake effect
                    if (this.scene.cameras && this.scene.cameras.main) {
                        this.scene.cameras.main.shake(300, 0.01);
                    }

                    // Flash effect
                    if (this.scene.particles) {
                        this.scene.particles.flash(300, 255, 100, 0);
                    }
                }
                break;
        }
    }

    // Check if power-up is active
    isActive(typeId) {
        return this.activePowerUps.has(typeId);
    }

    // Get active power-ups
    getActive() {
        return Array.from(this.activePowerUps.values());
    }

    // Get power-up multipliers
    getMultiplier(stat) {
        let multiplier = 1;

        // Original power-ups
        if (this.isActive('coffee')) multiplier *= 1.3;
        if (this.isActive('energydrink')) multiplier *= 1.5;
        if (this.isActive('keyboard')) multiplier *= 2;
        if (this.isActive('copilot')) multiplier *= 1.8;
        if (this.isActive('pair')) multiplier *= 2;

        // New power-ups
        if (this.isActive('vim')) multiplier *= 2.5;
        if (this.isActive('cleancode')) multiplier *= 2.2;
        if (this.isActive('refactor')) multiplier *= 1.6;
        if (this.isActive('unittests')) multiplier *= 1.4;
        if (this.isActive('merge')) multiplier *= 1.7;

        return multiplier;
    }

    // Check for collisions with collector
    checkCollisions(collector, radius = 20) {
        this.powerUps.forEach(powerUp => {
            if (!powerUp.active) return;

            const dist = Phaser.Math.Distance.Between(
                collector.x, collector.y,
                powerUp.x, powerUp.y
            );

            if (dist < radius) {
                this.collect(powerUp, collector);
            }
        });
    }

    // Update method to be called each frame
    update() {
        // Update power-up positions if needed
        this.powerUps.forEach(powerUp => {
            if (powerUp.active && powerUp.powerUpData) {
                powerUp.powerUpData.emoji.setPosition(powerUp.x, powerUp.y);
                powerUp.powerUpData.glow.setPosition(powerUp.x, powerUp.y);
            }
        });
    }

    // Clean up all power-ups
    cleanup() {
        this.powerUps.forEach(powerUp => {
            if (powerUp.active) {
                if (powerUp.powerUpData.emoji) powerUp.powerUpData.emoji.destroy();
                if (powerUp.powerUpData.glow) powerUp.powerUpData.glow.destroy();
                powerUp.destroy();
            }
        });
        this.powerUps = [];

        this.activePowerUps.forEach(activation => {
            if (activation.timer) activation.timer.remove();
        });
        this.activePowerUps.clear();
    }
}
