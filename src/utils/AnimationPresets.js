// AnimationPresets - Reusable animation library for common effects
// Makes it easy to apply professional animations to any game object

export default class AnimationPresets {
    constructor(scene) {
        this.scene = scene;
    }

    /**
     * Bounce animation
     */
    bounce(target, config = {}) {
        return this.scene.tweens.add({
            targets: target,
            scaleY: config.scaleY || 1.2,
            scaleX: config.scaleX || 0.8,
            duration: config.duration || 150,
            yoyo: true,
            repeat: config.repeat || 0,
            ease: 'Cubic.easeOut',
            onComplete: config.onComplete
        });
    }

    /**
     * Pulse animation (scale up/down)
     */
    pulse(target, config = {}) {
        return this.scene.tweens.add({
            targets: target,
            scale: config.scale || 1.2,
            duration: config.duration || 300,
            yoyo: true,
            repeat: config.repeat !== undefined ? config.repeat : -1,
            ease: 'Sine.easeInOut',
            onComplete: config.onComplete
        });
    }

    /**
     * Shake animation
     */
    shake(target, config = {}) {
        const originalX = target.x;
        const originalY = target.y;

        return this.scene.tweens.add({
            targets: target,
            x: originalX + (config.intensity || 10),
            duration: 50,
            yoyo: true,
            repeat: config.repeat || 5,
            ease: 'Sine.easeInOut',
            onComplete: () => {
                target.x = originalX;
                target.y = originalY;
                if (config.onComplete) config.onComplete();
            }
        });
    }

    /**
     * Float/Hover animation
     */
    float(target, config = {}) {
        return this.scene.tweens.add({
            targets: target,
            y: target.y + (config.distance || 10),
            duration: config.duration || 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    /**
     * Fade in animation
     */
    fadeIn(target, config = {}) {
        target.alpha = 0;
        return this.scene.tweens.add({
            targets: target,
            alpha: config.alpha || 1,
            duration: config.duration || 500,
            ease: 'Power2',
            onComplete: config.onComplete
        });
    }

    /**
     * Fade out animation
     */
    fadeOut(target, config = {}) {
        return this.scene.tweens.add({
            targets: target,
            alpha: 0,
            duration: config.duration || 500,
            ease: 'Power2',
            onComplete: () => {
                if (config.destroy) target.destroy();
                if (config.onComplete) config.onComplete();
            }
        });
    }

    /**
     * Slide in from direction
     */
    slideIn(target, direction = 'left', config = {}) {
        const width = this.scene.cameras.main.width;
        const height = this.scene.cameras.main.height;
        const finalX = target.x;
        const finalY = target.y;

        const startPositions = {
            left: { x: -100, y: finalY },
            right: { x: width + 100, y: finalY },
            top: { x: finalX, y: -100 },
            bottom: { x: finalX, y: height + 100 }
        };

        const start = startPositions[direction] || startPositions.left;
        target.setPosition(start.x, start.y);

        return this.scene.tweens.add({
            targets: target,
            x: finalX,
            y: finalY,
            duration: config.duration || 500,
            ease: config.ease || 'Back.easeOut',
            onComplete: config.onComplete
        });
    }

    /**
     * Slide out to direction
     */
    slideOut(target, direction = 'right', config = {}) {
        const width = this.scene.cameras.main.width;
        const height = this.scene.cameras.main.height;

        const endPositions = {
            left: { x: -100, y: target.y },
            right: { x: width + 100, y: target.y },
            top: { x: target.x, y: -100 },
            bottom: { x: target.x, y: height + 100 }
        };

        const end = endPositions[direction] || endPositions.right;

        return this.scene.tweens.add({
            targets: target,
            x: end.x,
            y: end.y,
            duration: config.duration || 500,
            ease: config.ease || 'Back.easeIn',
            onComplete: () => {
                if (config.destroy) target.destroy();
                if (config.onComplete) config.onComplete();
            }
        });
    }

    /**
     * Spin animation
     */
    spin(target, config = {}) {
        return this.scene.tweens.add({
            targets: target,
            angle: config.angle || 360,
            duration: config.duration || 1000,
            repeat: config.repeat !== undefined ? config.repeat : 0,
            ease: 'Linear',
            onComplete: config.onComplete
        });
    }

    /**
     * Pop in animation (scale from 0)
     */
    popIn(target, config = {}) {
        target.setScale(0);
        return this.scene.tweens.add({
            targets: target,
            scale: config.scale || 1,
            duration: config.duration || 300,
            ease: 'Back.easeOut',
            onComplete: config.onComplete
        });
    }

    /**
     * Pop out animation (scale to 0)
     */
    popOut(target, config = {}) {
        return this.scene.tweens.add({
            targets: target,
            scale: 0,
            duration: config.duration || 300,
            ease: 'Back.easeIn',
            onComplete: () => {
                if (config.destroy) target.destroy();
                if (config.onComplete) config.onComplete();
            }
        });
    }

    /**
     * Wiggle animation (rotate back and forth)
     */
    wiggle(target, config = {}) {
        return this.scene.tweens.add({
            targets: target,
            angle: config.angle || 15,
            duration: config.duration || 100,
            yoyo: true,
            repeat: config.repeat || 5,
            ease: 'Sine.easeInOut',
            onComplete: () => {
                target.angle = 0;
                if (config.onComplete) config.onComplete();
            }
        });
    }

    /**
     * Glow effect (tint animation)
     */
    glow(target, config = {}) {
        return this.scene.tweens.add({
            targets: target,
            tint: config.color || 0xffff00,
            duration: config.duration || 300,
            yoyo: true,
            repeat: config.repeat !== undefined ? config.repeat : 2,
            onComplete: () => {
                target.clearTint();
                if (config.onComplete) config.onComplete();
            }
        });
    }

    /**
     * Flicker animation (alpha on/off)
     */
    flicker(target, config = {}) {
        return this.scene.tweens.add({
            targets: target,
            alpha: 0.3,
            duration: config.duration || 100,
            yoyo: true,
            repeat: config.repeat || 5,
            onComplete: () => {
                target.alpha = 1;
                if (config.onComplete) config.onComplete();
            }
        });
    }

    /**
     * Typewriter text effect
     */
    typewriter(textObject, fullText, config = {}) {
        textObject.text = '';
        const chars = fullText.split('');
        const charDelay = config.charDelay || 50;

        chars.forEach((char, index) => {
            this.scene.time.delayedCall(index * charDelay, () => {
                textObject.text += char;
                if (index === chars.length - 1 && config.onComplete) {
                    config.onComplete();
                }
            });
        });
    }

    /**
     * Elastic bounce (overshoot animation)
     */
    elasticBounce(target, config = {}) {
        target.setScale(0);
        return this.scene.tweens.add({
            targets: target,
            scale: config.scale || 1,
            duration: config.duration || 600,
            ease: 'Elastic.easeOut',
            onComplete: config.onComplete
        });
    }

    /**
     * Combo chain animation sequence
     */
    combo(target, animations) {
        const timeline = this.scene.tweens.createTimeline();

        animations.forEach(anim => {
            const config = {
                targets: target,
                ...anim.config,
                duration: anim.duration || 300,
                ease: anim.ease || 'Power2'
            };
            timeline.add(config);
        });

        timeline.play();
        return timeline;
    }

    /**
     * Impact animation (squash and stretch)
     */
    impact(target, config = {}) {
        const timeline = this.scene.tweens.createTimeline({
            targets: target
        });

        // Squash
        timeline.add({
            scaleX: 1.3,
            scaleY: 0.7,
            duration: 100,
            ease: 'Power2'
        });

        // Bounce back
        timeline.add({
            scaleX: 1,
            scaleY: 1,
            duration: 200,
            ease: 'Elastic.easeOut'
        });

        if (config.onComplete) {
            timeline.setCallback('onComplete', config.onComplete);
        }

        timeline.play();
        return timeline;
    }

    /**
     * Rainbow color cycle
     */
    rainbow(target, config = {}) {
        const colors = config.colors || [
            0xff0000, 0xff7f00, 0xffff00, 0x00ff00,
            0x0000ff, 0x4b0082, 0x9400d3
        ];

        let index = 0;
        const interval = this.scene.time.addEvent({
            delay: config.delay || 200,
            callback: () => {
                target.setTint(colors[index]);
                index = (index + 1) % colors.length;
            },
            repeat: config.repeat !== undefined ? config.repeat : 20
        });

        return interval;
    }

    /**
     * Stop all animations on target
     */
    stopAll(target) {
        this.scene.tweens.killTweensOf(target);
    }
}
