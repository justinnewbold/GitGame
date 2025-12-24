/**
 * Particle effects system for visual polish
 * Uses object pooling to reduce GC pressure
 * Respects reduced motion preferences for accessibility
 */

import { logger } from './Logger.js';
import { motionPrefs } from './MotionPreferences.js';

/**
 * Simple object pool for reusing game objects
 * @template T
 */
class ObjectPool {
    /**
     * @param {Function} createFn - Function to create new objects
     * @param {Function} resetFn - Function to reset object state
     * @param {number} initialSize - Initial pool size
     */
    constructor(createFn, resetFn, initialSize = 20) {
        this.createFn = createFn;
        this.resetFn = resetFn;
        this.pool = [];
        this.activeCount = 0;

        // Pre-populate pool
        for (let i = 0; i < initialSize; i++) {
            this.pool.push(this.createFn());
        }
    }

    /**
     * Get an object from the pool
     * @returns {T} Object from pool or newly created
     */
    get() {
        let obj;
        if (this.pool.length > 0) {
            obj = this.pool.pop();
        } else {
            obj = this.createFn();
        }
        this.activeCount++;
        return obj;
    }

    /**
     * Return an object to the pool
     * @param {T} obj - Object to return
     */
    release(obj) {
        if (obj) {
            this.resetFn(obj);
            this.pool.push(obj);
            this.activeCount--;
        }
    }

    /**
     * Get pool statistics
     * @returns {{pooled: number, active: number}}
     */
    getStats() {
        return {
            pooled: this.pool.length,
            active: this.activeCount
        };
    }

    /**
     * Clear all objects from the pool
     * @param {Function} [destroyFn] - Optional function to destroy objects
     */
    clear(destroyFn) {
        if (destroyFn) {
            this.pool.forEach(obj => destroyFn(obj));
        }
        this.pool = [];
        this.activeCount = 0;
    }
}

/**
 * ParticleEffects - Visual effects system with object pooling
 * @class
 */
export default class ParticleEffects {
    /**
     * @param {Phaser.Scene} scene - The Phaser scene
     */
    constructor(scene) {
        /** @type {Phaser.Scene} */
        this.scene = scene;

        /** @type {boolean} */
        this.reducedMotion = motionPrefs.shouldReduceMotion();

        // Initialize object pools for particles
        this.circlePool = new ObjectPool(
            () => this._createPooledCircle(),
            (circle) => this._resetCircle(circle),
            50
        );

        this.textPool = new ObjectPool(
            () => this._createPooledText(),
            (text) => this._resetText(text),
            10
        );
    }

    /**
     * Set reduced motion mode
     * @param {boolean} enabled - Whether to reduce motion
     */
    setReducedMotion(enabled) {
        this.reducedMotion = enabled;
    }

    /**
     * Check if full effects should be shown
     * @private
     * @returns {boolean}
     */
    _shouldShowFullEffects() {
        return !this.reducedMotion && !motionPrefs.shouldReduceMotion();
    }

    /**
     * Create a pooled circle particle
     * @private
     */
    _createPooledCircle() {
        const circle = this.scene.add.circle(0, 0, 3, 0xffffff);
        circle.setVisible(false);
        circle.setActive(false);
        return circle;
    }

    /**
     * Reset a circle for reuse
     * @private
     */
    _resetCircle(circle) {
        if (circle && circle.active !== undefined) {
            circle.setVisible(false);
            circle.setActive(false);
            circle.setPosition(0, 0);
            circle.setAlpha(1);
            circle.setScale(1);
            if (circle.body) {
                circle.body.setVelocity(0, 0);
            }
        }
    }

    /**
     * Create a pooled text object
     * @private
     */
    _createPooledText() {
        const text = this.scene.add.text(0, 0, '', {
            fontSize: '16px',
            fontFamily: 'monospace',
            color: '#ffffff',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);
        text.setVisible(false);
        text.setActive(false);
        return text;
    }

    /**
     * Reset a text object for reuse
     * @private
     */
    _resetText(text) {
        if (text && text.active !== undefined) {
            text.setVisible(false);
            text.setActive(false);
            text.setPosition(0, 0);
            text.setAlpha(1);
            text.setScale(1);
            text.setText('');
        }
    }

    /**
     * Get a particle from the pool and configure it
     * @private
     */
    _getParticle(x, y, radius, color, alpha = 1) {
        const particle = this.circlePool.get();
        particle.setPosition(x, y);
        particle.setRadius(radius);
        particle.setFillStyle(color, alpha);
        particle.setVisible(true);
        particle.setActive(true);
        particle.setAlpha(1);
        particle.setScale(1);

        // Add physics if not already present
        if (!particle.body) {
            this.scene.physics.add.existing(particle);
        }

        return particle;
    }

    /**
     * Release a particle back to the pool after animation
     * @private
     */
    _releaseParticle(particle) {
        this.circlePool.release(particle);
    }

    /**
     * Explosion effect
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} [color=0xff6600] - Particle color
     * @param {number} [count=20] - Number of particles
     */
    explosion(x, y, color = 0xff6600, count = 20) {
        // Reduce particles in reduced motion mode
        const actualCount = this._shouldShowFullEffects()
            ? count
            : motionPrefs.getParticleCount(count);

        for (let i = 0; i < actualCount; i++) {
            const angle = (Math.PI * 2 * i) / actualCount;
            const speed = 50 + Math.random() * 100;

            const particle = this._getParticle(x, y, 3, color);

            particle.body.setVelocity(
                Math.cos(angle) * speed,
                Math.sin(angle) * speed
            );

            const duration = this._shouldShowFullEffects()
                ? 500 + Math.random() * 500
                : motionPrefs.getTweenDuration(300);

            this.scene.tweens.add({
                targets: particle,
                alpha: 0,
                scale: 0,
                duration,
                onComplete: () => this._releaseParticle(particle)
            });
        }
    }

    /**
     * Collect sparkle effect
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} [color=0xffff00] - Particle color
     * @param {number} [count=10] - Number of particles
     */
    sparkle(x, y, color = 0xffff00, count = 10) {
        for (let i = 0; i < count; i++) {
            const particle = this._getParticle(
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
                onComplete: () => this._releaseParticle(particle)
            });
        }
    }

    /**
     * Power-up glow effect
     * @param {Phaser.GameObjects.GameObject} target - Target object
     * @param {number} [color=0x00ff00] - Glow color
     * @returns {Phaser.GameObjects.Arc} The glow circle
     */
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

    /**
     * Trail effect for moving objects
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} [color=0x00ffff] - Trail color
     * @param {number} [size=5] - Trail size
     */
    trail(x, y, color = 0x00ffff, size = 5) {
        const particle = this._getParticle(x, y, size, color, 0.6);

        this.scene.tweens.add({
            targets: particle,
            alpha: 0,
            scale: 0,
            duration: 300,
            onComplete: () => this._releaseParticle(particle)
        });
    }

    /**
     * Text popup effect
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string} text - Text to display
     * @param {string} [color='#ffffff'] - Text color
     * @param {string} [fontSize='16px'] - Font size
     * @returns {Phaser.GameObjects.Text} The text object
     */
    floatingText(x, y, text, color = '#ffffff', fontSize = '16px') {
        const textObj = this.textPool.get();
        textObj.setPosition(x, y);
        textObj.setText(text);
        textObj.setStyle({
            fontSize: fontSize,
            fontFamily: 'monospace',
            color: color,
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 3
        });
        textObj.setVisible(true);
        textObj.setActive(true);
        textObj.setAlpha(1);
        textObj.setScale(1);

        this.scene.tweens.add({
            targets: textObj,
            y: y - 50,
            alpha: 0,
            duration: 1500,
            ease: 'Cubic.easeOut',
            onComplete: () => this.textPool.release(textObj)
        });

        return textObj;
    }

    /**
     * Screen shake effect
     * @param {number} [duration=200] - Shake duration in ms
     * @param {number} [intensity=0.01] - Shake intensity
     */
    shake(duration = 200, intensity = 0.01) {
        // Skip shake in reduced motion mode
        if (!motionPrefs.canShake()) {
            return;
        }
        if (this.scene.cameras && this.scene.cameras.main) {
            this.scene.cameras.main.shake(duration, intensity);
        }
    }

    /**
     * Screen flash effect
     * @param {number} [duration=100] - Flash duration in ms
     * @param {number} [r=255] - Red value
     * @param {number} [g=255] - Green value
     * @param {number} [b=255] - Blue value
     */
    flash(duration = 100, r = 255, g = 255, b = 255) {
        // Skip flash in reduced motion mode
        if (!motionPrefs.canFlash()) {
            return;
        }
        if (this.scene.cameras && this.scene.cameras.main) {
            this.scene.cameras.main.flash(duration, r, g, b);
        }
    }

    /**
     * Impact effect (combines shake and flash)
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} [color=0xff0000] - Effect color
     */
    impact(x, y, color = 0xff0000) {
        this.explosion(x, y, color, 15);
        this.shake(150, 0.008);
        this.flash(100, 255, 100, 100);
    }

    /**
     * Power-up collect effect
     * @param {number} x - X position
     * @param {number} y - Y position
     */
    collectPowerUp(x, y) {
        this.sparkle(x, y, 0xffff00, 15);
        this.flash(150, 255, 255, 100);
    }

    /**
     * Level up effect with expanding rings
     * @param {number} x - X position
     * @param {number} y - Y position
     */
    levelUp(x, y) {
        // Ring explosion
        for (let ring = 0; ring < 3; ring++) {
            this.scene.time.delayedCall(ring * 100, () => {
                const ringParticles = 12 + ring * 4;
                const radius = 30 + ring * 20;

                for (let i = 0; i < ringParticles; i++) {
                    const angle = (Math.PI * 2 * i) / ringParticles;
                    const px = x + Math.cos(angle) * radius;
                    const py = y + Math.sin(angle) * radius;

                    const particle = this._getParticle(px, py, 4, 0x00ff00);

                    this.scene.tweens.add({
                        targets: particle,
                        alpha: 0,
                        scale: 0,
                        duration: 800,
                        onComplete: () => this._releaseParticle(particle)
                    });
                }
            });
        }
    }

    /**
     * Death effect with explosion and smoke
     * @param {number} x - X position
     * @param {number} y - Y position
     */
    death(x, y) {
        this.explosion(x, y, 0xff0000, 30);
        this.shake(300, 0.015);

        // Smoke particles
        for (let i = 0; i < 10; i++) {
            this.scene.time.delayedCall(i * 50, () => {
                const smoke = this._getParticle(
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
                    onComplete: () => this._releaseParticle(smoke)
                });
            });
        }
    }

    /**
     * Boss entrance effect with dark pulse and lightning
     * @param {number} x - X position
     * @param {number} y - Y position
     */
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
            this.scene.time.delayedCall(i * 200, () => {
                this.flash(100, 200, 0, 0);
            });
        }

        this.shake(1000, 0.02);
    }

    /**
     * Get pool statistics for debugging
     * @returns {{circles: {pooled: number, active: number}, texts: {pooled: number, active: number}}}
     */
    getPoolStats() {
        return {
            circles: this.circlePool.getStats(),
            texts: this.textPool.getStats()
        };
    }

    /**
     * Clean up all pooled objects
     */
    destroy() {
        this.circlePool.clear((circle) => {
            if (circle && circle.destroy) {
                circle.destroy();
            }
        });
        this.textPool.clear((text) => {
            if (text && text.destroy) {
                text.destroy();
            }
        });
    }
}
