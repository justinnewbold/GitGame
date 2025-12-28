/**
 * PerformanceDashboard - In-game performance monitoring overlay
 * Shows FPS, memory usage, render stats, and performance metrics
 */

import { logger } from './Logger.js';
import { gameData } from './GameData.js';

export default class PerformanceDashboard {
    constructor(scene) {
        this.scene = scene;
        this.isVisible = false;
        this.container = null;
        this.metrics = {
            fps: [],
            frameTime: [],
            memoryUsage: [],
            drawCalls: 0,
            gameObjects: 0
        };
        this.maxSamples = 60; // 1 second of data at 60fps
        this.updateInterval = 100; // ms between updates
        this.lastUpdate = 0;

        // UI elements
        this.elements = {};

        // Load saved preference
        this.isVisible = gameData.data?.settings?.showPerformance ?? false;
    }

    /**
     * Create the performance dashboard UI
     */
    create() {
        const width = this.scene.cameras.main.width;
        const padding = 10;
        const dashWidth = 280;
        const dashHeight = 220;

        // Create container
        this.container = this.scene.add.container(width - dashWidth - padding, padding);
        this.container.setDepth(100000);
        this.container.setScrollFactor(0);
        this.container.setVisible(this.isVisible);

        // Background panel
        const bg = this.scene.add.rectangle(0, 0, dashWidth, dashHeight, 0x000000, 0.85);
        bg.setOrigin(0, 0);
        bg.setStrokeStyle(2, 0x00ff00);
        this.container.add(bg);

        // Title
        const title = this.scene.add.text(10, 8, '⚡ PERFORMANCE', {
            fontSize: '14px',
            fontFamily: 'monospace',
            color: '#00ff00',
            fontStyle: 'bold'
        });
        this.container.add(title);

        // Close button
        const closeBtn = this.scene.add.text(dashWidth - 25, 8, '✕', {
            fontSize: '14px',
            fontFamily: 'monospace',
            color: '#ff6666'
        });
        closeBtn.setInteractive({ useHandCursor: true });
        closeBtn.on('pointerdown', () => this.toggle());
        this.container.add(closeBtn);

        // Separator line
        const separator = this.scene.add.rectangle(10, 30, dashWidth - 20, 1, 0x00ff00);
        separator.setOrigin(0, 0);
        this.container.add(separator);

        // FPS Display
        this.elements.fps = this.createMetricRow(40, 'FPS', '60', '#00ff00');

        // Frame Time
        this.elements.frameTime = this.createMetricRow(60, 'Frame', '16.67ms', '#00ff00');

        // Memory Usage (if available)
        this.elements.memory = this.createMetricRow(80, 'Memory', 'N/A', '#ffaa00');

        // Game Objects
        this.elements.objects = this.createMetricRow(100, 'Objects', '0', '#00aaff');

        // Draw Calls
        this.elements.draws = this.createMetricRow(120, 'Draws', '0', '#ffaa00');

        // Scene
        this.elements.scene = this.createMetricRow(140, 'Scene', 'Unknown', '#aaaaaa');

        // FPS Graph
        this.createFpsGraph(160);

        // Performance tips
        this.elements.tip = this.scene.add.text(10, dashHeight - 25, '', {
            fontSize: '10px',
            fontFamily: 'monospace',
            color: '#666666',
            wordWrap: { width: dashWidth - 20 }
        });
        this.container.add(this.elements.tip);

        // Setup keyboard shortcut
        this.setupKeyboardShortcut();

        logger.info('PerformanceDashboard', 'Dashboard created');
    }

    /**
     * Create a metric row with label and value
     */
    createMetricRow(y, label, initialValue, color) {
        const labelText = this.scene.add.text(10, y, label + ':', {
            fontSize: '12px',
            fontFamily: 'monospace',
            color: '#888888'
        });
        this.container.add(labelText);

        const valueText = this.scene.add.text(100, y, initialValue, {
            fontSize: '12px',
            fontFamily: 'monospace',
            color: color
        });
        this.container.add(valueText);

        return valueText;
    }

    /**
     * Create FPS graph visualization
     */
    createFpsGraph(y) {
        const graphWidth = 260;
        const graphHeight = 30;

        // Graph background
        const graphBg = this.scene.add.rectangle(10, y, graphWidth, graphHeight, 0x111111);
        graphBg.setOrigin(0, 0);
        graphBg.setStrokeStyle(1, 0x333333);
        this.container.add(graphBg);

        // Graph line (will be updated)
        this.fpsGraphics = this.scene.add.graphics();
        this.fpsGraphics.setPosition(10, y);
        this.container.add(this.fpsGraphics);

        // Target FPS line (60fps)
        const targetLine = this.scene.add.rectangle(10, y + 5, graphWidth, 1, 0x00ff00, 0.3);
        targetLine.setOrigin(0, 0);
        this.container.add(targetLine);

        // Labels
        const label60 = this.scene.add.text(graphWidth - 10, y + 2, '60', {
            fontSize: '8px',
            fontFamily: 'monospace',
            color: '#00ff00'
        });
        this.container.add(label60);

        const label0 = this.scene.add.text(graphWidth - 5, y + graphHeight - 10, '0', {
            fontSize: '8px',
            fontFamily: 'monospace',
            color: '#ff0000'
        });
        this.container.add(label0);

        this.graphBounds = { width: graphWidth, height: graphHeight, y };
    }

    /**
     * Setup keyboard shortcut to toggle dashboard
     */
    setupKeyboardShortcut() {
        if (!this.scene.input.keyboard) return;

        // F3 to toggle performance dashboard
        this.scene.input.keyboard.on('keydown-F3', () => {
            this.toggle();
        });

        // Also support ` (backtick) as alternative
        this.scene.input.keyboard.on('keydown-BACKQUOTE', () => {
            this.toggle();
        });
    }

    /**
     * Toggle dashboard visibility
     */
    toggle() {
        this.isVisible = !this.isVisible;
        if (this.container) {
            this.container.setVisible(this.isVisible);
        }

        // Save preference
        if (gameData.data.settings) {
            gameData.data.settings.showPerformance = this.isVisible;
            gameData.save();
        }

        logger.info('PerformanceDashboard', `Dashboard ${this.isVisible ? 'shown' : 'hidden'}`);
    }

    /**
     * Update performance metrics
     */
    update(time, delta) {
        if (!this.isVisible || !this.container) return;

        // Throttle updates
        if (time - this.lastUpdate < this.updateInterval) return;
        this.lastUpdate = time;

        // Calculate FPS
        const fps = Math.round(1000 / delta);
        this.metrics.fps.push(fps);
        if (this.metrics.fps.length > this.maxSamples) {
            this.metrics.fps.shift();
        }

        // Frame time
        const frameTime = delta.toFixed(2);
        this.metrics.frameTime.push(parseFloat(frameTime));
        if (this.metrics.frameTime.length > this.maxSamples) {
            this.metrics.frameTime.shift();
        }

        // Update UI
        const avgFps = Math.round(this.metrics.fps.reduce((a, b) => a + b, 0) / this.metrics.fps.length);
        this.elements.fps.setText(avgFps.toString());
        this.elements.fps.setColor(this.getFpsColor(avgFps));

        this.elements.frameTime.setText(frameTime + 'ms');
        this.elements.frameTime.setColor(delta > 20 ? '#ff6666' : '#00ff00');

        // Memory usage (Chrome only)
        if (performance.memory) {
            const memMB = (performance.memory.usedJSHeapSize / 1048576).toFixed(1);
            const memLimit = (performance.memory.jsHeapSizeLimit / 1048576).toFixed(0);
            this.elements.memory.setText(`${memMB}MB / ${memLimit}MB`);
            const memPercent = performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit;
            this.elements.memory.setColor(memPercent > 0.8 ? '#ff6666' : memPercent > 0.5 ? '#ffaa00' : '#00ff00');
        }

        // Game objects count
        const objectCount = this.scene.children?.length || 0;
        this.elements.objects.setText(objectCount.toString());
        this.elements.objects.setColor(objectCount > 500 ? '#ff6666' : objectCount > 200 ? '#ffaa00' : '#00aaff');

        // Draw calls (from Phaser renderer if available)
        if (this.scene.game?.renderer?.gl) {
            // WebGL context - estimate based on visible objects
            const visibleObjects = this.scene.children?.list?.filter(c => c.visible && c.active)?.length || 0;
            this.elements.draws.setText(`~${visibleObjects}`);
        }

        // Scene name
        this.elements.scene.setText(this.scene.scene.key || 'Unknown');

        // Update FPS graph
        this.updateFpsGraph();

        // Performance tips
        this.updateTips(avgFps, objectCount);
    }

    /**
     * Get color based on FPS value
     */
    getFpsColor(fps) {
        if (fps >= 55) return '#00ff00'; // Green - excellent
        if (fps >= 45) return '#aaff00'; // Yellow-green - good
        if (fps >= 30) return '#ffaa00'; // Orange - acceptable
        return '#ff0000'; // Red - poor
    }

    /**
     * Update the FPS graph visualization
     */
    updateFpsGraph() {
        if (!this.fpsGraphics || !this.graphBounds) return;

        this.fpsGraphics.clear();

        const { width, height } = this.graphBounds;
        const samples = this.metrics.fps;

        if (samples.length < 2) return;

        // Draw FPS line
        this.fpsGraphics.lineStyle(2, 0x00ff00, 1);
        this.fpsGraphics.beginPath();

        samples.forEach((fps, i) => {
            const x = (i / (this.maxSamples - 1)) * width;
            const y = height - (Math.min(fps, 60) / 60) * height;

            if (i === 0) {
                this.fpsGraphics.moveTo(x, y);
            } else {
                this.fpsGraphics.lineTo(x, y);
            }
        });

        this.fpsGraphics.strokePath();

        // Draw warning zone (below 30fps)
        if (samples.some(fps => fps < 30)) {
            this.fpsGraphics.lineStyle(1, 0xff0000, 0.5);
            this.fpsGraphics.beginPath();
            this.fpsGraphics.moveTo(0, height - (30 / 60) * height);
            this.fpsGraphics.lineTo(width, height - (30 / 60) * height);
            this.fpsGraphics.strokePath();
        }
    }

    /**
     * Show performance tips based on current metrics
     */
    updateTips(fps, objectCount) {
        let tip = '';

        if (fps < 30) {
            tip = '⚠️ Low FPS - try reducing quality';
        } else if (objectCount > 500) {
            tip = '💡 Many objects - consider pooling';
        } else if (performance.memory && performance.memory.usedJSHeapSize > performance.memory.jsHeapSizeLimit * 0.8) {
            tip = '⚠️ High memory usage';
        } else if (fps >= 55) {
            tip = '✓ Performance is excellent';
        }

        this.elements.tip.setText(tip);
    }

    /**
     * Get current performance snapshot
     */
    getSnapshot() {
        return {
            timestamp: Date.now(),
            avgFps: this.metrics.fps.length > 0
                ? Math.round(this.metrics.fps.reduce((a, b) => a + b, 0) / this.metrics.fps.length)
                : 0,
            avgFrameTime: this.metrics.frameTime.length > 0
                ? (this.metrics.frameTime.reduce((a, b) => a + b, 0) / this.metrics.frameTime.length).toFixed(2)
                : 0,
            memory: performance.memory ? {
                used: performance.memory.usedJSHeapSize,
                total: performance.memory.totalJSHeapSize,
                limit: performance.memory.jsHeapSizeLimit
            } : null,
            objects: this.scene.children?.length || 0,
            scene: this.scene.scene.key
        };
    }

    /**
     * Export performance report
     */
    exportReport() {
        const snapshot = this.getSnapshot();
        const report = {
            ...snapshot,
            browser: navigator.userAgent,
            screen: {
                width: window.screen.width,
                height: window.screen.height,
                devicePixelRatio: window.devicePixelRatio
            },
            gameVersion: gameData.data.version || '1.0.0'
        };

        return JSON.stringify(report, null, 2);
    }

    /**
     * Cleanup
     */
    destroy() {
        if (this.container) {
            this.container.destroy();
            this.container = null;
        }
        if (this.fpsGraphics) {
            this.fpsGraphics.destroy();
            this.fpsGraphics = null;
        }
        this.metrics = { fps: [], frameTime: [], memoryUsage: [], drawCalls: 0, gameObjects: 0 };
    }
}
