// Achievement Notification System
// Shows animated popups when achievements are unlocked

export default class AchievementNotification {
    constructor(scene) {
        this.scene = scene;
        this.queue = [];
        this.isShowing = false;
        this.container = null;
    }

    /**
     * Show an achievement notification
     * @param {Object} achievement - Achievement data with title, description, icon
     */
    show(achievement) {
        // Add to queue
        this.queue.push(achievement);

        // Process queue if not already showing
        if (!this.isShowing) {
            this.processQueue();
        }
    }

    /**
     * Process the notification queue
     */
    processQueue() {
        if (this.queue.length === 0) {
            this.isShowing = false;
            return;
        }

        this.isShowing = true;
        const achievement = this.queue.shift();

        // Create notification
        this.createNotification(achievement);
    }

    /**
     * Create the notification UI
     */
    createNotification(achievement) {
        const width = this.scene.cameras.main.width;
        const height = this.scene.cameras.main.height;

        // Container for the notification
        this.container = this.scene.add.container(width / 2, -100);
        this.container.setDepth(10000); // Top layer

        // Background panel
        const bgWidth = 400;
        const bgHeight = 100;
        const bg = this.scene.add.rectangle(0, 0, bgWidth, bgHeight, 0x1a1a2e, 0.95);
        bg.setStrokeStyle(3, 0xffd700); // Gold border

        // Achievement icon/emoji
        const icon = this.scene.add.text(-150, 0, achievement.icon || '<Æ', {
            fontSize: '48px',
            fontFamily: 'monospace'
        });
        icon.setOrigin(0.5);

        // "Achievement Unlocked!" header
        const header = this.scene.add.text(-50, -25, '<‰ Achievement Unlocked!', {
            fontSize: '16px',
            fontFamily: 'monospace',
            color: '#ffd700',
            fontStyle: 'bold'
        });
        header.setOrigin(0, 0.5);

        // Achievement title
        const title = this.scene.add.text(-50, 0, achievement.title, {
            fontSize: '20px',
            fontFamily: 'monospace',
            color: '#ffffff',
            fontStyle: 'bold'
        });
        title.setOrigin(0, 0.5);

        // Achievement description
        const description = this.scene.add.text(-50, 25, achievement.description, {
            fontSize: '12px',
            fontFamily: 'monospace',
            color: '#aaaaaa'
        });
        description.setOrigin(0, 0.5);

        // Add all elements to container
        this.container.add([bg, icon, header, title, description]);

        // Animate in
        this.animateIn();
    }

    /**
     * Slide in animation from top
     */
    animateIn() {
        const targetY = 80;

        // Play sound effect if available
        if (this.scene.sounds) {
            this.scene.sounds.playSound('achievement');
        }

        // Slide down with bounce
        this.scene.tweens.add({
            targets: this.container,
            y: targetY,
            duration: 600,
            ease: 'Back.easeOut',
            onComplete: () => {
                // Pulse icon
                this.pulseIcon();

                // Wait 3 seconds then slide out
                this.scene.time.delayedCall(3000, () => {
                    this.animateOut();
                });
            }
        });

        // Add glow effect
        this.addGlowEffect();
    }

    /**
     * Pulse the icon for emphasis
     */
    pulseIcon() {
        // Get the icon (it's at index 1 in container)
        const icon = this.container.list[1];

        this.scene.tweens.add({
            targets: icon,
            scale: 1.3,
            duration: 300,
            yoyo: true,
            repeat: 2,
            ease: 'Sine.easeInOut'
        });
    }

    /**
     * Add particle glow effect
     */
    addGlowEffect() {
        // Create sparkle particles
        const particles = this.scene.add.particles(0, 0, 'pixel', {
            x: this.container.x,
            y: this.container.y,
            speed: { min: 50, max: 150 },
            angle: { min: 0, max: 360 },
            scale: { start: 2, end: 0 },
            alpha: { start: 1, end: 0 },
            tint: [0xffd700, 0xffaa00, 0xffffff],
            lifespan: 1000,
            quantity: 2,
            frequency: 50,
            blendMode: 'ADD'
        });

        particles.setDepth(9999);

        // Stop after 3 seconds
        this.scene.time.delayedCall(3000, () => {
            particles.stop();
            this.scene.time.delayedCall(1000, () => {
                particles.destroy();
            });
        });

        this.particles = particles;
    }

    /**
     * Slide out animation to top
     */
    animateOut() {
        this.scene.tweens.add({
            targets: this.container,
            y: -100,
            duration: 400,
            ease: 'Back.easeIn',
            onComplete: () => {
                // Cleanup
                this.cleanup();

                // Process next in queue
                this.scene.time.delayedCall(200, () => {
                    this.processQueue();
                });
            }
        });
    }

    /**
     * Clean up notification
     */
    cleanup() {
        if (this.container) {
            this.container.destroy();
            this.container = null;
        }

        if (this.particles) {
            this.particles.destroy();
            this.particles = null;
        }
    }

    /**
     * Clear all notifications and queue
     */
    clearAll() {
        this.queue = [];
        this.cleanup();
        this.isShowing = false;
    }
}
