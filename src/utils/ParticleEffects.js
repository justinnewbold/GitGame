// Particle effects system for visual polish

export default class ParticleEffects {
    constructor(scene) {
        this.scene = scene;
    }

    // Explosion effect
    explosion(x, y, color = 0xff6600, count = 20) {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count;
            const speed = 50 + Math.random() * 100;

            const particle = this.scene.add.circle(x, y, 3, color);
            this.scene.physics.add.existing(particle);

            particle.body.setVelocity(
                Math.cos(angle) * speed,
                Math.sin(angle) * speed
            );

            this.scene.tweens.add({
                targets: particle,
                alpha: 0,
                scale: 0,
                duration: 500 + Math.random() * 500,
                onComplete: () => particle.destroy()
            });
        }
    }

    // Collect sparkle effect
    sparkle(x, y, color = 0xffff00, count = 10) {
        for (let i = 0; i < count; i++) {
            const particle = this.scene.add.circle(
                x + (Math.random() - 0.5) * 20,
                y + (Math.random() - 0.5) * 20,
                2,
                color
            );

            this.scene.tweens.add({
                targets: particle,
                y: y - 40 - Math.random() * 20,
                alpha: 0,
                scale: 0,
                duration: 800,
                ease: 'Cubic.easeOut',
                onComplete: () => particle.destroy()
            });
        }
    }

    // Power-up glow effect
    glow(target, color = 0x00ff00) {
        const glow = this.scene.add.circle(target.x, target.y, target.width || 20, color, 0.3);

        this.scene.tweens.add({
            targets: glow,
            scale: 1.5,
            alpha: 0,
            duration: 1000,
            repeat: -1
        });

        return glow;
    }

    // Trail effect for moving objects
    trail(x, y, color = 0x00ffff, size = 5) {
        const particle = this.scene.add.circle(x, y, size, color, 0.6);

        this.scene.tweens.add({
            targets: particle,
            alpha: 0,
            scale: 0,
            duration: 300,
            onComplete: () => particle.destroy()
        });
    }

    // Text popup effect
    floatingText(x, y, text, color = '#ffffff', fontSize = '16px') {
        const textObj = this.scene.add.text(x, y, text, {
            fontSize: fontSize,
            fontFamily: 'monospace',
            color: color,
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);

        this.scene.tweens.add({
            targets: textObj,
            y: y - 50,
            alpha: 0,
            duration: 1500,
            ease: 'Cubic.easeOut',
            onComplete: () => textObj.destroy()
        });

        return textObj;
    }

    // Screen shake effect
    shake(duration = 200, intensity = 0.01) {
        this.scene.cameras.main.shake(duration, intensity);
    }

    // Screen flash effect
    flash(duration = 100, r = 255, g = 255, b = 255) {
        this.scene.cameras.main.flash(duration, r, g, b);
    }

    // Impact effect (combines shake and flash)
    impact(x, y, color = 0xff0000) {
        this.explosion(x, y, color, 15);
        this.shake(150, 0.008);
        this.flash(100, 255, 100, 100);
    }

    // Power-up collect effect
    collectPowerUp(x, y) {
        this.sparkle(x, y, 0xffff00, 15);
        this.flash(150, 255, 255, 100);
    }

    // Level up effect
    levelUp(x, y) {
        // Ring explosion
        for (let ring = 0; ring < 3; ring++) {
            setTimeout(() => {
                const ringParticles = 12 + ring * 4;
                const radius = 30 + ring * 20;

                for (let i = 0; i < ringParticles; i++) {
                    const angle = (Math.PI * 2 * i) / ringParticles;
                    const px = x + Math.cos(angle) * radius;
                    const py = y + Math.sin(angle) * radius;

                    const particle = this.scene.add.circle(px, py, 4, 0x00ff00);

                    this.scene.tweens.add({
                        targets: particle,
                        alpha: 0,
                        scale: 0,
                        duration: 800,
                        onComplete: () => particle.destroy()
                    });
                }
            }, ring * 100);
        }
    }

    // Death effect
    death(x, y) {
        this.explosion(x, y, 0xff0000, 30);
        this.shake(300, 0.015);

        // Smoke particles
        for (let i = 0; i < 10; i++) {
            setTimeout(() => {
                const smoke = this.scene.add.circle(
                    x + (Math.random() - 0.5) * 40,
                    y + (Math.random() - 0.5) * 40,
                    8,
                    0x666666,
                    0.5
                );

                this.scene.tweens.add({
                    targets: smoke,
                    y: smoke.y - 60,
                    alpha: 0,
                    scale: 2,
                    duration: 1000,
                    onComplete: () => smoke.destroy()
                });
            }, i * 50);
        }
    }

    // Boss entrance effect
    bossEntrance(x, y) {
        // Dark pulse
        const overlay = this.scene.add.rectangle(
            this.scene.cameras.main.centerX,
            this.scene.cameras.main.centerY,
            this.scene.cameras.main.width,
            this.scene.cameras.main.height,
            0x000000,
            0
        );

        this.scene.tweens.add({
            targets: overlay,
            alpha: 0.7,
            duration: 500,
            yoyo: true,
            onComplete: () => overlay.destroy()
        });

        // Lightning effect
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                this.scene.cameras.main.flash(100, 200, 0, 0);
            }, i * 200);
        }

        this.shake(1000, 0.02);
    }
}
