/**
 * PerformanceMonitor - Track FPS, memory usage, and performance metrics
 * Useful for debugging performance issues
 */

import { logger } from './Logger.js';

export default class PerformanceMonitor {
    constructor(scene, options = {}) {
        this.scene = scene;
        this.enabled = options.enabled !== false;
        this.showOverlay = options.showOverlay || false;

        // FPS tracking
        this.fps = 60;
        this.fpsHistory = [];
        this.maxFPSHistory = 60;

        // Memory tracking
        this.memoryUsage = 0;
        this.memoryHistory = [];

        // Performance marks
        this.marks = new Map();

        // Update counters
        this.frameCount = 0;
        this.lastTime = performance.now();

        // Overlay elements
        this.overlay = null;
        this.fpsText = null;
        this.memoryText = null;
        this.statsText = null;

        if (this.enabled && this.showOverlay) {
            this.createOverlay();
        }

        logger.debug('Performance', 'Performance monitor initialized');
    }

    /**
     * Create performance overlay
     */
    createOverlay() {
        const x = 10;
        const y = this.scene.cameras.main.height - 80;

        // Background
        this.overlay = this.scene.add.rectangle(x, y, 200, 70, 0x000000, 0.7);
        this.overlay.setOrigin(0);
        this.overlay.setDepth(10000);
        this.overlay.setScrollFactor(0);

        // FPS text
        this.fpsText = this.scene.add.text(x + 5, y + 5, 'FPS: --', {
            fontSize: '12px',
            fontFamily: 'monospace',
            color: '#00ff00'
        });
        this.fpsText.setDepth(10001);
        this.fpsText.setScrollFactor(0);

        // Memory text
        this.memoryText = this.scene.add.text(x + 5, y + 20, 'Memory: --', {
            fontSize: '12px',
            fontFamily: 'monospace',
            color: '#ffaa00'
        });
        this.memoryText.setDepth(10001);
        this.memoryText.setScrollFactor(0);

        // Stats text
        this.statsText = this.scene.add.text(x + 5, y + 35, 'Objects: --', {
            fontSize: '12px',
            fontFamily: 'monospace',
            color: '#00aaff'
        });
        this.statsText.setDepth(10001);
        this.statsText.setScrollFactor(0);
    }

    /**
     * Update performance metrics (call every frame)
     */
    update() {
        if (!this.enabled) return;

        this.frameCount++;
        const now = performance.now();
        const delta = now - this.lastTime;

        // Update FPS every second
        if (delta >= 1000) {
            this.fps = Math.round((this.frameCount * 1000) / delta);
            this.fpsHistory.push(this.fps);

            if (this.fpsHistory.length > this.maxFPSHistory) {
                this.fpsHistory.shift();
            }

            this.frameCount = 0;
            this.lastTime = now;

            // Update memory if available
            if (performance.memory) {
                this.memoryUsage = Math.round(performance.memory.usedJSHeapSize / 1048576); // MB
                this.memoryHistory.push(this.memoryUsage);

                if (this.memoryHistory.length > 60) {
                    this.memoryHistory.shift();
                }
            }

            // Update overlay
            if (this.showOverlay) {
                this.updateOverlay();
            }

            // Warn on low FPS
            if (this.fps < 30) {
                logger.warn('Performance', 'Low FPS detected: ' + this.fps);
            }
        }
    }

    /**
     * Update overlay display
     */
    updateOverlay() {
        if (!this.overlay) return;

        // FPS with color coding
        const fpsColor = this.fps >= 55 ? '#00ff00' : this.fps >= 30 ? '#ffaa00' : '#ff0000';
        const avgFPS = Math.round(this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length);
        this.fpsText.setText('FPS: ' + this.fps + ' (avg: ' + avgFPS + ')');
        this.fpsText.setColor(fpsColor);

        // Memory
        if (performance.memory) {
            const memLimit = Math.round(performance.memory.jsHeapSizeLimit / 1048576);
            this.memoryText.setText('Memory: ' + this.memoryUsage + 'MB / ' + memLimit + 'MB');
        }

        // Scene stats
        const displayList = this.scene.children.list.length;
        const updateList = this.scene.sys.displayList.list.length;
        this.statsText.setText('Objects: ' + displayList + ' | Updates: ' + updateList);
    }

    /**
     * Start performance mark
     */
    mark(name) {
        this.marks.set(name, performance.now());
    }

    /**
     * End performance mark and log duration
     */
    measure(name, logLevel = 'debug') {
        const startTime = this.marks.get(name);
        if (!startTime) {
            logger.warn('Performance', 'No mark found for: ' + name);
            return null;
        }

        const duration = performance.now() - startTime;
        this.marks.delete(name);

        logger[logLevel]('Performance', name + ': ' + duration.toFixed(2) + 'ms');
        return duration;
    }

    /**
     * Get average FPS
     */
    getAverageFPS() {
        if (this.fpsHistory.length === 0) return 0;
        return Math.round(this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length);
    }

    /**
     * Get minimum FPS
     */
    getMinFPS() {
        if (this.fpsHistory.length === 0) return 0;
        return Math.min(...this.fpsHistory);
    }

    /**
     * Get performance summary
     */
    getSummary() {
        return {
            currentFPS: this.fps,
            averageFPS: this.getAverageFPS(),
            minFPS: this.getMinFPS(),
            memoryUsage: this.memoryUsage,
            frameCount: this.frameCount,
            displayObjects: this.scene?.children.list.length || 0
        };
    }

    /**
     * Log performance summary
     */
    logSummary() {
        const summary = this.getSummary();
        logger.info('Performance', 'Performance Summary:', summary);
    }

    /**
     * Toggle overlay visibility
     */
    toggleOverlay() {
        if (!this.overlay) {
            this.showOverlay = true;
            this.createOverlay();
        } else {
            this.showOverlay = !this.showOverlay;
            this.overlay.setVisible(this.showOverlay);
            this.fpsText.setVisible(this.showOverlay);
            this.memoryText.setVisible(this.showOverlay);
            this.statsText.setVisible(this.showOverlay);
        }
    }

    /**
     * Cleanup
     */
    destroy() {
        if (this.overlay) {
            this.overlay.destroy();
            this.fpsText.destroy();
            this.memoryText.destroy();
            this.statsText.destroy();
        }

        this.marks.clear();
        this.fpsHistory = [];
        this.memoryHistory = [];
    }
}

// Add keyboard shortcut to toggle performance overlay (F3)
if (typeof window !== 'undefined') {
    window.addEventListener('keydown', (e) => {
        if (e.key === 'F3') {
            e.preventDefault();
            // Toggle on active scene's performance monitor
            const game = window.game;
            if (game && game.scene.scenes[0] && game.scene.scenes[0].performanceMonitor) {
                game.scene.scenes.forEach(scene => {
                    if (scene.performanceMonitor) {
                        scene.performanceMonitor.toggleOverlay();
                    }
                });
            }
        }
    });
}
