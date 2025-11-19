// Boss Manager - Advanced boss encounters with unique abilities

export default class BossManager {
    constructor(scene) {
        this.scene = scene;
        this.currentBoss = null;
        this.bossAbilityTimer = null;
    }

    // Get all boss types with their unique abilities
    getBossTypes() {
        return {
            productManager: {
                id: 'productManager',
                name: '👹 The Product Manager',
                description: 'Constantly changing requirements',
                health: 500,
                speed: 40,
                color: 0xff0000,
                size: 30,
                reward: 250,
                abilities: [
                    {
                        name: 'Scope Creep',
                        cooldown: 5000,
                        effect: (boss) => this.scopeCreep(boss)
                    },
                    {
                        name: 'Meeting Call',
                        cooldown: 8000,
                        effect: (boss) => this.meetingCall(boss)
                    }
                ]
            },
            legacyCodebase: {
                id: 'legacyCodebase',
                name: '💼 Legacy Codebase',
                description: 'No documentation, no tests',
                health: 800,
                speed: 20,
                color: 0x666666,
                size: 35,
                reward: 300,
                abilities: [
                    {
                        name: 'Spaghetti Code',
                        cooldown: 6000,
                        effect: (boss) => this.spaghettiCode(boss)
                    },
                    {
                        name: 'Technical Debt',
                        cooldown: 10000,
                        effect: (boss) => this.technicalDebt(boss)
                    }
                ]
            },
            productionOutage: {
                id: 'productionOutage',
                name: '🔥 Production Outage',
                description: 'Everything is on fire!',
                health: 600,
                speed: 60,
                color: 0xff6600,
                size: 32,
                reward: 280,
                abilities: [
                    {
                        name: 'Alert Storm',
                        cooldown: 4000,
                        effect: (boss) => this.alertStorm(boss)
                    },
                    {
                        name: 'Cascading Failure',
                        cooldown: 7000,
                        effect: (boss) => this.cascadingFailure(boss)
                    }
                ]
            },
            auditor: {
                id: 'auditor',
                name: '📊 The Auditor',
                description: 'Questioning every decision',
                health: 700,
                speed: 30,
                color: 0x6600ff,
                size: 30,
                reward: 260,
                abilities: [
                    {
                        name: 'Compliance Check',
                        cooldown: 6000,
                        effect: (boss) => this.complianceCheck(boss)
                    },
                    {
                        name: 'Red Tape',
                        cooldown: 9000,
                        effect: (boss) => this.redTape(boss)
                    }
                ]
            },
            // NEW BOSSES
            securityBreach: {
                id: 'securityBreach',
                name: '🔓 Security Breach',
                description: 'Zero-day exploit unleashed',
                health: 650,
                speed: 70,
                color: 0xff0000,
                size: 28,
                reward: 320,
                abilities: [
                    {
                        name: 'SQL Injection',
                        cooldown: 5000,
                        effect: (boss) => this.sqlInjection(boss)
                    },
                    {
                        name: 'DDoS Attack',
                        cooldown: 8000,
                        effect: (boss) => this.ddosAttack(boss)
                    }
                ]
            },
            deadlineMonster: {
                id: 'deadlineMonster',
                name: '⏰ Deadline Monster',
                description: 'Time is running out!',
                health: 550,
                speed: 80,
                color: 0xff00ff,
                size: 30,
                reward: 270,
                abilities: [
                    {
                        name: 'Time Pressure',
                        cooldown: 4000,
                        effect: (boss) => this.timePressure(boss)
                    },
                    {
                        name: 'Overtime',
                        cooldown: 7000,
                        effect: (boss) => this.overtime(boss)
                    }
                ]
            },
            bugHorde: {
                id: 'bugHorde',
                name: '🐜 Bug Horde Queen',
                description: 'Spawns endless bugs',
                health: 750,
                speed: 35,
                color: 0x00ff00,
                size: 35,
                reward: 310,
                abilities: [
                    {
                        name: 'Spawn Bugs',
                        cooldown: 6000,
                        effect: (boss) => this.spawnMinions(boss)
                    },
                    {
                        name: 'Regression',
                        cooldown: 9000,
                        effect: (boss) => this.regression(boss)
                    }
                ]
            },
            stackOverflow: {
                id: 'stackOverflow',
                name: '📚 Stack Overflow',
                description: 'Recursive nightmare',
                health: 600,
                speed: 45,
                color: 0xff6600,
                size: 30,
                reward: 290,
                abilities: [
                    {
                        name: 'Infinite Loop',
                        cooldown: 5000,
                        effect: (boss) => this.infiniteLoop(boss)
                    },
                    {
                        name: 'Stack Trace',
                        cooldown: 7000,
                        effect: (boss) => this.stackTrace(boss)
                    }
                ]
            },
            mergeConflictKing: {
                id: 'mergeConflictKing',
                name: '⚔️ Merge Conflict King',
                description: 'Git merge gone wrong',
                health: 700,
                speed: 50,
                color: 0xff0000,
                size: 32,
                reward: 300,
                abilities: [
                    {
                        name: 'Rebase Hell',
                        cooldown: 6000,
                        effect: (boss) => this.rebaseHell(boss)
                    },
                    {
                        name: 'Force Push',
                        cooldown: 8000,
                        effect: (boss) => this.forcePush(boss)
                    }
                ]
            },
            burnoutBeast: {
                id: 'burnoutBeast',
                name: '😵 Burnout Beast',
                description: 'Drains your energy and sanity',
                health: 650,
                speed: 40,
                color: 0x000000,
                size: 33,
                reward: 280,
                abilities: [
                    {
                        name: 'Energy Drain',
                        cooldown: 5000,
                        effect: (boss) => this.energyDrain(boss)
                    },
                    {
                        name: 'Imposter Syndrome',
                        cooldown: 8000,
                        effect: (boss) => this.imposterSyndrome(boss)
                    }
                ]
            }
        };
    }

    // Spawn a random or specific boss
    spawnBoss(bossId = null) {
        const bossTypes = this.getBossTypes();
        const bossType = bossId ? bossTypes[bossId] :
            Object.values(bossTypes)[Math.floor(Math.random() * Object.values(bossTypes).length)];

        if (!bossType) return null;

        const width = this.scene.cameras.main.width;
        const height = this.scene.cameras.main.height;

        // Create boss sprite
        const boss = this.scene.add.circle(
            width / 2,
            height / 4,
            bossType.size,
            bossType.color
        );
        boss.setStrokeStyle(4, 0xffff00);
        this.scene.physics.add.existing(boss);

        // Get difficulty multiplier
        const difficultyMult = this.scene.difficultyMult || 1;

        // Boss data
        boss.enemyData = {
            name: bossType.name,
            health: bossType.health * difficultyMult,
            maxHealth: bossType.health * difficultyMult,
            speed: bossType.speed,
            reward: bossType.reward,
            isBoss: true,
            bossType: bossType,
            abilities: bossType.abilities,
            lastAbilityTime: 0
        };

        // Boss label
        boss.label = this.scene.add.text(boss.x, boss.y - 50, bossType.name, {
            fontSize: '16px',
            fontFamily: 'monospace',
            color: '#ff0000',
            backgroundColor: '#000000',
            padding: { x: 5, y: 3 },
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Health bar
        boss.healthBarBg = this.scene.add.rectangle(boss.x, boss.y - 60, 120, 10, 0x000000);
        boss.healthBar = this.scene.add.rectangle(boss.x, boss.y - 60, 120, 10, 0xff0000);

        // Store current boss reference
        this.currentBoss = boss;

        // Start ability timer
        this.startAbilityTimer(boss);

        // Visual effects
        if (this.scene.particles) {
            this.scene.particles.bossEntrance(boss.x, boss.y);
            this.scene.particles.floatingText(width / 2, height / 2, '⚠️ BOSS BATTLE! ⚠️', '#ff0000', '24px');
        }

        // Sound
        if (this.scene.sounds) {
            this.scene.sounds.playSound('boss');
        }

        return boss;
    }

    // Start boss ability timer
    startAbilityTimer(boss) {
        if (!boss || !boss.enemyData || !boss.enemyData.abilities) return;

        const useAbility = () => {
            if (!boss.active || !boss.enemyData) return;

            // Pick random ability
            const abilities = boss.enemyData.abilities;
            const ability = abilities[Math.floor(Math.random() * abilities.length)];

            // Execute ability
            if (ability && ability.effect) {
                ability.effect(boss);
            }

            // Schedule next ability
            const nextDelay = ability ? ability.cooldown : 5000;
            this.bossAbilityTimer = this.scene.time.delayedCall(nextDelay, useAbility);
        };

        // First ability after 3 seconds
        this.bossAbilityTimer = this.scene.time.delayedCall(3000, useAbility);
    }

    // BOSS ABILITIES

    // Product Manager abilities
    scopeCreep(boss) {
        // Spawn additional enemies
        for (let i = 0; i < 3; i++) {
            if (this.scene.spawnEnemy) {
                this.scene.spawnEnemy();
            }
        }
        this.showAbilityText(boss, 'SCOPE CREEP!');
    }

    meetingCall(boss) {
        // Slow down player
        if (this.scene.player && this.scene.playerSpeed) {
            const originalSpeed = this.scene.playerSpeed;
            this.scene.playerSpeed *= 0.5;
            this.scene.time.delayedCall(3000, () => {
                this.scene.playerSpeed = originalSpeed;
            });
        }
        this.showAbilityText(boss, 'MANDATORY MEETING!');
    }

    // Legacy Codebase abilities
    spaghettiCode(boss) {
        // Create obstacles that block movement
        for (let i = 0; i < 5; i++) {
            const x = Phaser.Math.Between(100, 700);
            const y = Phaser.Math.Between(100, 500);
            const obstacle = this.scene.add.circle(x, y, 20, 0x666666, 0.8);
            this.scene.physics.add.existing(obstacle);
            obstacle.body.setImmovable(true);

            this.scene.time.delayedCall(5000, () => {
                if (obstacle.active) obstacle.destroy();
            });
        }
        this.showAbilityText(boss, 'SPAGHETTI CODE!');
    }

    technicalDebt(boss) {
        // Drain sanity/resources
        if (this.scene.playerSanity !== undefined) {
            this.scene.playerSanity = Math.max(0, this.scene.playerSanity - 20);
        }
        this.showAbilityText(boss, 'TECHNICAL DEBT!');
    }

    // Production Outage abilities
    alertStorm(boss) {
        // Rapid enemy spawns
        for (let i = 0; i < 5; i++) {
            this.scene.time.delayedCall(i * 300, () => {
                if (this.scene.spawnEnemy) {
                    this.scene.spawnEnemy();
                }
            });
        }
        this.showAbilityText(boss, 'ALERT STORM!');
    }

    cascadingFailure(boss) {
        // Damage over time
        if (this.scene.playerHealth !== undefined) {
            let ticks = 5;
            const damageInterval = this.scene.time.addEvent({
                delay: 500,
                repeat: ticks,
                callback: () => {
                    if (this.scene.playerHealth !== undefined) {
                        this.scene.playerHealth = Math.max(0, this.scene.playerHealth - 5);
                    }
                }
            });
        }
        this.showAbilityText(boss, 'CASCADE FAILURE!');
    }

    // Auditor abilities
    complianceCheck(boss) {
        // Freeze player briefly
        if (this.scene.player) {
            this.scene.player.body.setVelocity(0, 0);
            const originalSpeed = this.scene.playerSpeed || 200;
            this.scene.playerSpeed = 0;
            this.scene.time.delayedCall(2000, () => {
                this.scene.playerSpeed = originalSpeed;
            });
        }
        this.showAbilityText(boss, 'COMPLIANCE CHECK!');
    }

    redTape(boss) {
        // Slow all player actions
        if (this.scene.fireRate) {
            this.scene.fireRate *= 2; // Slower firing
            this.scene.time.delayedCall(4000, () => {
                this.scene.fireRate /= 2;
            });
        }
        this.showAbilityText(boss, 'RED TAPE!');
    }

    // Security Breach abilities
    sqlInjection(boss) {
        // Corrupt player controls briefly
        this.showAbilityText(boss, 'SQL INJECTION!');
        if (this.scene.particles) {
            this.scene.particles.flash(200, 255, 0, 0);
        }
    }

    ddosAttack(boss) {
        // Screen shake and spawn attacks
        if (this.scene.cameras.main) {
            this.scene.cameras.main.shake(1000, 0.01);
        }
        this.showAbilityText(boss, 'DDOS ATTACK!');
    }

    // Deadline Monster abilities
    timePressure(boss) {
        // Speed up all enemies temporarily
        if (this.scene.enemies) {
            this.scene.enemies.forEach(enemy => {
                if (enemy.enemyData && enemy !== boss) {
                    enemy.enemyData.speed *= 1.5;
                }
            });
            this.scene.time.delayedCall(3000, () => {
                this.scene.enemies.forEach(enemy => {
                    if (enemy.enemyData && enemy !== boss) {
                        enemy.enemyData.speed /= 1.5;
                    }
                });
            });
        }
        this.showAbilityText(boss, 'TIME PRESSURE!');
    }

    overtime(boss) {
        // Drain health over time
        if (this.scene.playerHealth !== undefined) {
            for (let i = 0; i < 3; i++) {
                this.scene.time.delayedCall(i * 1000, () => {
                    if (this.scene.playerHealth !== undefined) {
                        this.scene.playerHealth = Math.max(0, this.scene.playerHealth - 8);
                    }
                });
            }
        }
        this.showAbilityText(boss, 'OVERTIME!');
    }

    // Bug Horde abilities
    spawnMinions(boss) {
        // Spawn small bugs
        for (let i = 0; i < 4; i++) {
            if (this.scene.spawnEnemy) {
                this.scene.spawnEnemy();
            }
        }
        this.showAbilityText(boss, 'BUG SWARM!');
    }

    regression(boss) {
        // Reduce player stats temporarily
        if (this.scene.playerHealth !== undefined) {
            this.scene.playerHealth = Math.max(0, this.scene.playerHealth - 15);
        }
        this.showAbilityText(boss, 'REGRESSION!');
    }

    // Stack Overflow abilities
    infiniteLoop(boss) {
        // Create circular projectile pattern
        for (let angle = 0; angle < 360; angle += 45) {
            const rad = angle * (Math.PI / 180);
            const x = boss.x + Math.cos(rad) * 100;
            const y = boss.y + Math.sin(rad) * 100;

            const projectile = this.scene.add.circle(x, y, 8, 0xff6600);
            this.scene.physics.add.existing(projectile);
            projectile.body.setVelocity(Math.cos(rad) * 150, Math.sin(rad) * 150);

            this.scene.time.delayedCall(2000, () => {
                if (projectile.active) projectile.destroy();
            });
        }
        this.showAbilityText(boss, 'INFINITE LOOP!');
    }

    stackTrace(boss) {
        // Show confusing effects
        if (this.scene.particles) {
            this.scene.particles.flash(300, 255, 100, 0);
        }
        this.showAbilityText(boss, 'STACK TRACE!');
    }

    // Merge Conflict abilities
    rebaseHell(boss) {
        // Teleport player randomly
        if (this.scene.player) {
            const newX = Phaser.Math.Between(100, 700);
            const newY = Phaser.Math.Between(100, 500);
            this.scene.player.setPosition(newX, newY);
        }
        this.showAbilityText(boss, 'REBASE HELL!');
    }

    forcePush(boss) {
        // Knock back player
        if (this.scene.player) {
            const angle = Phaser.Math.Angle.Between(boss.x, boss.y, this.scene.player.x, this.scene.player.y);
            this.scene.player.body.setVelocity(Math.cos(angle) * 500, Math.sin(angle) * 500);
        }
        this.showAbilityText(boss, 'FORCE PUSH!');
    }

    // Burnout Beast abilities
    energyDrain(boss) {
        // Drain both health and sanity
        if (this.scene.playerHealth !== undefined) {
            this.scene.playerHealth = Math.max(0, this.scene.playerHealth - 10);
        }
        if (this.scene.playerSanity !== undefined) {
            this.scene.playerSanity = Math.max(0, this.scene.playerSanity - 15);
        }
        this.showAbilityText(boss, 'ENERGY DRAIN!');
    }

    imposterSyndrome(boss) {
        // Reduce accuracy/effectiveness
        if (this.scene.particles) {
            this.scene.particles.flash(500, 0, 0, 100);
        }
        this.showAbilityText(boss, 'IMPOSTER SYNDROME!');
    }

    // Helper: Show ability text
    showAbilityText(boss, text) {
        if (!this.scene.particles) return;

        this.scene.particles.floatingText(
            boss.x,
            boss.y + 50,
            text,
            '#ffff00',
            '14px'
        );
    }

    // Clean up
    cleanup() {
        if (this.bossAbilityTimer) {
            this.bossAbilityTimer.remove();
            this.bossAbilityTimer = null;
        }
        this.currentBoss = null;
    }
}
