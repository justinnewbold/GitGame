/**
 * SceneTransitionManager - Smooth scene transitions with effects
 * Provides various transition effects between scenes
 */

import { logger } from './Logger.js';

export const TransitionType = {
    FADE: 'fade',
    SLIDE_LEFT: 'slide_left',
    SLIDE_RIGHT: 'slide_right',
    SLIDE_UP: 'slide_up',
    SLIDE_DOWN: 'slide_down',
    ZOOM_IN: 'zoom_in',
    ZOOM_OUT: 'zoom_out',
    PIXELATE: 'pixelate',
    WIPE: 'wipe',
    CIRCLE: 'circle'
};

export default class SceneTransitionManager {
    constructor(scene) {
        this.scene = scene;
        this.isTransitioning = false;
        this.defaultDuration = 500;
        this.defaultType = TransitionType.FADE;
    }

    /**
     * Transition to another scene
     */
    async transition(targetScene, type = this.defaultType, duration = this.defaultDuration, data = {}) {
        if (this.isTransitioning) {
            logger.warn('Transition', 'Transition already in progress');
            return;
        }

        this.isTransitioning = true;

        try {
            // Execute transition effect
            await this.playTransition(type, duration, 'out');

            // Start target scene
            this.scene.scene.start(targetScene, data);

            logger.debug('Transition', 'Transitioned to scene', {
                from: this.scene.scene.key,
                to: targetScene,
                type,
                duration
            });
        } finally {
            this.isTransitioning = false;
        }
    }

    /**
     * Play transition effect
     */
    playTransition(type, duration, direction = 'out') {
        return new Promise((resolve) => {
            switch (type) {
                case TransitionType.FADE:
                    this.fade(duration, direction, resolve);
                    break;

                case TransitionType.SLIDE_LEFT:
                    this.slide(duration, direction, 'left', resolve);
                    break;

                case TransitionType.SLIDE_RIGHT:
                    this.slide(duration, direction, 'right', resolve);
                    break;

                case TransitionType.SLIDE_UP:
                    this.slide(duration, direction, 'up', resolve);
                    break;

                case TransitionType.SLIDE_DOWN:
                    this.slide(duration, direction, 'down', resolve);
                    break;

                case TransitionType.ZOOM_IN:
                    this.zoom(duration, direction, 'in', resolve);
                    break;

                case TransitionType.ZOOM_OUT:
                    this.zoom(duration, direction, 'out', resolve);
                    break;

                case TransitionType.PIXELATE:
                    this.pixelate(duration, direction, resolve);
                    break;

                case TransitionType.WIPE:
                    this.wipe(duration, direction, resolve);
                    break;

                case TransitionType.CIRCLE:
                    this.circle(duration, direction, resolve);
                    break;

                default:
                    this.fade(duration, direction, resolve);
            }
        });
    }

    /**
     * Fade transition
     */
    fade(duration, direction, callback) {
        if (direction === 'out') {
            this.scene.cameras.main.fade(duration, 0, 0, 0, false, callback);
        } else {
            this.scene.cameras.main.fadeIn(duration, 0, 0, 0, callback);
        }
    }

    /**
     * Slide transition
     */
    slide(duration, direction, slideDirection, callback) {
        const width = this.scene.cameras.main.width;
        const height = this.scene.cameras.main.height;

        // Create slide overlay
        const overlay = this.scene.add.rectangle(0, 0, width, height, 0x000000);
        overlay.setOrigin(0);
        overlay.setDepth(10000);

        // Set initial position based on slide direction
        const positions = {
            left: { x: width, y: 0 },
            right: { x: -width, y: 0 },
            up: { x: 0, y: height },
            down: { x: 0, y: -height }
        };

        if (direction === 'out') {
            overlay.setPosition(positions[slideDirection].x, positions[slideDirection].y);

            this.scene.tweens.add({
                targets: overlay,
                x: 0,
                y: 0,
                duration,
                ease: 'Power2',
                onComplete: () => {
                    callback();
                }
            });
        } else {
            overlay.setPosition(0, 0);

            this.scene.tweens.add({
                targets: overlay,
                x: -positions[slideDirection].x,
                y: -positions[slideDirection].y,
                duration,
                ease: 'Power2',
                onComplete: () => {
                    overlay.destroy();
                    callback();
                }
            });
        }
    }

    /**
     * Zoom transition
     */
    zoom(duration, direction, zoomType, callback) {
        const camera = this.scene.cameras.main;
        const initialZoom = camera.zoom;

        if (direction === 'out') {
            const targetZoom = zoomType === 'in' ? 2 : 0.1;

            this.scene.tweens.add({
                targets: camera,
                zoom: targetZoom,
                duration,
                ease: 'Power2',
                onComplete: () => {
                    camera.setZoom(initialZoom);
                    callback();
                }
            });

            // Fade out simultaneously
            camera.fade(duration, 0, 0, 0);
        } else {
            camera.fadeIn(duration, 0, 0, 0, callback);
        }
    }

    /**
     * Pixelate transition
     */
    pixelate(duration, direction, callback) {
        // Simulate pixelation with flash and fade
        const camera = this.scene.cameras.main;

        if (direction === 'out') {
            camera.flash(duration / 4, 255, 255, 255);
            this.scene.time.delayedCall(duration / 4, () => {
                camera.fade(duration * 3 / 4, 0, 0, 0, false, callback);
            });
        } else {
            camera.fadeIn(duration, 0, 0, 0, callback);
        }
    }

    /**
     * Wipe transition
     */
    wipe(duration, direction, callback) {
        const width = this.scene.cameras.main.width;
        const height = this.scene.cameras.main.height;

        const wipeOverlay = this.scene.add.rectangle(0, 0, 0, height, 0x000000);
        wipeOverlay.setOrigin(0);
        wipeOverlay.setDepth(10000);

        if (direction === 'out') {
            this.scene.tweens.add({
                targets: wipeOverlay,
                width: width,
                duration,
                ease: 'Power2',
                onComplete: () => {
                    callback();
                }
            });
        } else {
            wipeOverlay.width = width;

            this.scene.tweens.add({
                targets: wipeOverlay,
                width: 0,
                duration,
                ease: 'Power2',
                onComplete: () => {
                    wipeOverlay.destroy();
                    callback();
                }
            });
        }
    }

    /**
     * Circle transition
     */
    circle(duration, direction, callback) {
        const width = this.scene.cameras.main.width;
        const height = this.scene.cameras.main.height;
        const maxRadius = Math.sqrt(width * width + height * height) / 2;

        const circle = this.scene.add.circle(width / 2, height / 2, 0, 0x000000);
        circle.setDepth(10000);

        if (direction === 'out') {
            this.scene.tweens.add({
                targets: circle,
                radius: maxRadius,
                duration,
                ease: 'Power2',
                onComplete: () => {
                    callback();
                }
            });
        } else {
            circle.radius = maxRadius;

            this.scene.tweens.add({
                targets: circle,
                radius: 0,
                duration,
                ease: 'Power2',
                onComplete: () => {
                    circle.destroy();
                    callback();
                }
            });
        }
    }

    /**
     * Transition with loading screen
     */
    async transitionWithLoading(targetScene, loadingText = 'Loading...', data = {}) {
        const width = this.scene.cameras.main.width;
        const height = this.scene.cameras.main.height;

        // Fade out
        await this.playTransition(TransitionType.FADE, this.defaultDuration / 2, 'out');

        // Show loading screen
        const loadingBg = this.scene.add.rectangle(0, 0, width, height, 0x000000);
        loadingBg.setOrigin(0);
        loadingBg.setDepth(10000);

        const loadingLabel = this.scene.add.text(width / 2, height / 2, loadingText, {
            fontSize: '24px',
            fontFamily: 'monospace',
            color: '#ffffff'
        });
        loadingLabel.setOrigin(0.5);
        loadingLabel.setDepth(10001);

        // Animate loading text
        this.scene.tweens.add({
            targets: loadingLabel,
            alpha: 0.3,
            duration: 500,
            yoyo: true,
            repeat: -1
        });

        // Wait a bit for effect
        await new Promise(resolve => setTimeout(resolve, 300));

        // Start target scene
        this.scene.scene.start(targetScene, data);
    }

    /**
     * Quick fade transition (utility method)
     */
    quickFade(targetScene, data = {}) {
        return this.transition(targetScene, TransitionType.FADE, 250, data);
    }

    /**
     * Custom transition with callback
     */
    customTransition(targetScene, customEffect, data = {}) {
        if (typeof customEffect !== 'function') {
            logger.error('Transition', 'Custom effect must be a function');
            return this.transition(targetScene);
        }

        this.isTransitioning = true;

        customEffect(() => {
            this.scene.scene.start(targetScene, data);
            this.isTransitioning = false;
        });
    }
}
