// Replay & Photo Mode - Record gameplay and take epic screenshots

import { gameData } from './GameData.js';

export default class ReplayPhotoMode {
    constructor(scene) {
        this.scene = scene;
        this.isRecording = false;
        this.isPlayingReplay = false;
        this.isPhotoMode = false;
        this.recordedFrames = [];
        this.currentFrame = 0;
        this.playbackSpeed = 1.0;
        this.freeCamera = false;
        this.cameraPosition = { x: 0, y: 0 };
        this.initializeReplaySystem();
    }

    initializeReplaySystem() {
        if (!gameData.data.replays) {
            gameData.data.replays = {
                savedReplays: [],
                screenshots: [],
                settings: {
                    autoRecord: true,
                    maxReplays: 50,
                    recordQuality: 'high',
                    screenshotFormat: 'png'
                },
                stats: {
                    totalReplays: 0,
                    totalScreenshots: 0,
                    watchTime: 0
                }
            };
            gameData.save();
        }
    }

    // Start recording a replay
    startRecording() {
        if (this.isRecording) return;

        this.isRecording = true;
        this.recordedFrames = [];
        this.recordingStartTime = Date.now();

        console.log('Replay recording started');
    }

    // Stop recording
    stopRecording() {
        if (!this.isRecording) return;

        this.isRecording = false;
        const duration = Date.now() - this.recordingStartTime;

        console.log(`Replay recording stopped. Duration: ${duration}ms, Frames: ${this.recordedFrames.length}`);

        return {
            frames: this.recordedFrames.length,
            duration: duration,
            fps: Math.round((this.recordedFrames.length / duration) * 1000)
        };
    }

    // Record a frame of gameplay
    recordFrame(gameState) {
        if (!this.isRecording) return;

        const frame = {
            timestamp: Date.now() - this.recordingStartTime,
            gameState: this.cloneGameState(gameState)
        };

        this.recordedFrames.push(frame);
    }

    // Clone game state for recording
    cloneGameState(gameState) {
        return {
            player: {
                x: gameState.player?.x || 0,
                y: gameState.player?.y || 0,
                rotation: gameState.player?.rotation || 0,
                health: gameState.player?.health || 100,
                score: gameState.score || 0
            },
            enemies: gameState.enemies?.map(e => ({
                x: e.x,
                y: e.y,
                type: e.type,
                health: e.health
            })) || [],
            projectiles: gameState.projectiles?.map(p => ({
                x: p.x,
                y: p.y,
                vx: p.vx,
                vy: p.vy
            })) || [],
            powerups: gameState.powerups?.map(p => ({
                x: p.x,
                y: p.y,
                type: p.type
            })) || [],
            effects: gameState.effects || []
        };
    }

    // Save replay
    saveReplay(name, metadata = {}) {
        const replays = gameData.data.replays;

        if (this.recordedFrames.length === 0) {
            return { success: false, message: 'No replay data to save!' };
        }

        const replay = {
            id: 'replay_' + Date.now(),
            name: name || `Replay ${replays.totalReplays + 1}`,
            date: new Date().toISOString(),
            duration: metadata.duration || 0,
            frames: this.recordedFrames.length,
            mode: metadata.mode || 'unknown',
            score: metadata.score || 0,
            survived: metadata.survived || false,
            thumbnail: this.generateThumbnail(),
            data: this.compressReplayData(this.recordedFrames)
        };

        replays.savedReplays.push(replay);
        replays.stats.totalReplays++;

        // Limit number of saved replays
        if (replays.savedReplays.length > replays.settings.maxReplays) {
            replays.savedReplays.shift(); // Remove oldest
        }

        gameData.save();

        return {
            success: true,
            replay: replay,
            message: 'Replay saved successfully!'
        };
    }

    // Compress replay data (simple JSON compression)
    compressReplayData(frames) {
        // In a real implementation, this would use actual compression
        // For now, just store a subset of frames for memory efficiency
        const compressed = [];
        const step = Math.max(1, Math.floor(frames.length / 1000)); // Max 1000 keyframes

        for (let i = 0; i < frames.length; i += step) {
            compressed.push(frames[i]);
        }

        return compressed;
    }

    // Generate thumbnail (mock)
    generateThumbnail() {
        // In a real game, this would capture a screenshot
        return 'data:image/png;base64,thumbnail_data_here';
    }

    // Load and play replay
    loadReplay(replayId) {
        const replays = gameData.data.replays;
        const replay = replays.savedReplays.find(r => r.id === replayId);

        if (!replay) {
            return { success: false, message: 'Replay not found!' };
        }

        this.currentReplay = replay;
        this.recordedFrames = this.decompressReplayData(replay.data);
        this.currentFrame = 0;
        this.isPlayingReplay = true;

        return {
            success: true,
            replay: replay,
            message: 'Replay loaded!'
        };
    }

    // Decompress replay data
    decompressReplayData(data) {
        return data; // Simple passthrough for now
    }

    // Playback controls
    play() {
        if (!this.currentReplay) return;
        this.isPlayingReplay = true;
    }

    pause() {
        this.isPlayingReplay = false;
    }

    stop() {
        this.isPlayingReplay = false;
        this.currentFrame = 0;
    }

    // Seek to specific frame
    seekToFrame(frameNumber) {
        if (frameNumber < 0 || frameNumber >= this.recordedFrames.length) return;
        this.currentFrame = frameNumber;
    }

    // Seek to time (in milliseconds)
    seekToTime(timeMs) {
        const frame = this.recordedFrames.findIndex(f => f.timestamp >= timeMs);
        if (frame !== -1) {
            this.currentFrame = frame;
        }
    }

    // Set playback speed
    setPlaybackSpeed(speed) {
        this.playbackSpeed = Math.max(0.1, Math.min(5.0, speed));
    }

    // Step forward one frame
    stepForward() {
        if (this.currentFrame < this.recordedFrames.length - 1) {
            this.currentFrame++;
        }
    }

    // Step backward one frame
    stepBackward() {
        if (this.currentFrame > 0) {
            this.currentFrame--;
        }
    }

    // Get current frame data
    getCurrentFrame() {
        if (this.currentFrame >= this.recordedFrames.length) {
            return null;
        }
        return this.recordedFrames[this.currentFrame];
    }

    // Update replay playback
    updateReplay(delta) {
        if (!this.isPlayingReplay) return;

        // Advance frame based on playback speed
        const frameAdvance = this.playbackSpeed;
        this.currentFrame += frameAdvance;

        // Loop or stop at end
        if (this.currentFrame >= this.recordedFrames.length) {
            this.currentFrame = 0; // Loop
            // Or: this.stop(); // Stop at end
        }
    }

    // Photo Mode
    enterPhotoMode() {
        this.isPhotoMode = true;
        this.freeCamera = true;
        this.pause(); // Pause replay if playing

        if (this.scene) {
            // Pause game physics
            this.scene.physics?.pause();

            // Store original camera position
            this.originalCameraPosition = {
                x: this.scene.cameras.main.scrollX,
                y: this.scene.cameras.main.scrollY,
                zoom: this.scene.cameras.main.zoom
            };
        }
    }

    exitPhotoMode() {
        this.isPhotoMode = false;
        this.freeCamera = false;

        if (this.scene) {
            // Resume game physics
            this.scene.physics?.resume();

            // Restore camera
            if (this.originalCameraPosition) {
                this.scene.cameras.main.scrollX = this.originalCameraPosition.x;
                this.scene.cameras.main.scrollY = this.originalCameraPosition.y;
                this.scene.cameras.main.setZoom(this.originalCameraPosition.zoom);
            }
        }
    }

    // Camera controls in photo mode
    moveCameraInPhotoMode(dx, dy) {
        if (!this.isPhotoMode || !this.scene) return;

        this.scene.cameras.main.scrollX += dx;
        this.scene.cameras.main.scrollY += dy;
    }

    zoomCamera(zoomDelta) {
        if (!this.scene) return;

        const newZoom = this.scene.cameras.main.zoom + zoomDelta;
        this.scene.cameras.main.setZoom(Phaser.Math.Clamp(newZoom, 0.1, 5.0));
    }

    // Reset camera to default
    resetCamera() {
        if (!this.scene) return;

        this.scene.cameras.main.scrollX = 0;
        this.scene.cameras.main.scrollY = 0;
        this.scene.cameras.main.setZoom(1.0);
        this.scene.cameras.main.setRotation(0);
    }

    // Rotate camera
    rotateCamera(angle) {
        if (!this.scene) return;

        this.scene.cameras.main.setRotation(angle);
    }

    // Screenshot/Photo capture
    takeScreenshot(options = {}) {
        if (!this.scene) {
            return { success: false, message: 'No scene available!' };
        }

        const replays = gameData.data.replays;

        const screenshot = {
            id: 'screenshot_' + Date.now(),
            name: options.name || `Screenshot ${replays.stats.totalScreenshots + 1}`,
            date: new Date().toISOString(),
            mode: options.mode || 'unknown',
            filter: options.filter || 'none',
            // In a real implementation, capture actual screenshot
            data: 'data:image/png;base64,screenshot_data_here',
            metadata: {
                cameraPosition: {
                    x: this.scene.cameras.main.scrollX,
                    y: this.scene.cameras.main.scrollY,
                    zoom: this.scene.cameras.main.zoom,
                    rotation: this.scene.cameras.main.rotation
                },
                timestamp: this.getCurrentReplayTime()
            }
        };

        replays.screenshots.push(screenshot);
        replays.stats.totalScreenshots++;

        gameData.save();

        return {
            success: true,
            screenshot: screenshot,
            message: 'Screenshot saved!'
        };
    }

    // Photo filters
    applyFilter(filterName) {
        if (!this.scene) return;

        const camera = this.scene.cameras.main;

        // Reset any existing effects
        camera.clearAlpha();
        camera.clearTint();

        switch (filterName) {
            case 'grayscale':
                camera.setPostPipeline('GrayscalePipeline');
                break;

            case 'sepia':
                camera.setTintFill(0xFFD7A8);
                break;

            case 'vintage':
                camera.setAlpha(0.9);
                camera.setTintFill(0xFFD7A8);
                break;

            case 'noir':
                camera.setTintFill(0x444444);
                break;

            case 'vibrant':
                camera.setTintFill(0xFFFFFF);
                // Increase saturation (would need custom shader)
                break;

            case 'vignette':
                // Would need custom shader for vignette effect
                break;

            case 'none':
            default:
                // No filter
                break;
        }
    }

    // Get all available filters
    getAvailableFilters() {
        return [
            { id: 'none', name: 'None', icon: '🚫' },
            { id: 'grayscale', name: 'Grayscale', icon: '⬛' },
            { id: 'sepia', name: 'Sepia', icon: '📜' },
            { id: 'vintage', name: 'Vintage', icon: '📷' },
            { id: 'noir', name: 'Film Noir', icon: '🎬' },
            { id: 'vibrant', name: 'Vibrant', icon: '🌈' },
            { id: 'vignette', name: 'Vignette', icon: '⭕' }
        ];
    }

    // Delete replay
    deleteReplay(replayId) {
        const replays = gameData.data.replays;
        const index = replays.savedReplays.findIndex(r => r.id === replayId);

        if (index === -1) {
            return { success: false, message: 'Replay not found!' };
        }

        replays.savedReplays.splice(index, 1);
        gameData.save();

        return { success: true, message: 'Replay deleted!' };
    }

    // Delete screenshot
    deleteScreenshot(screenshotId) {
        const replays = gameData.data.replays;
        const index = replays.screenshots.findIndex(s => s.id === screenshotId);

        if (index === -1) {
            return { success: false, message: 'Screenshot not found!' };
        }

        replays.screenshots.splice(index, 1);
        gameData.save();

        return { success: true, message: 'Screenshot deleted!' };
    }

    // Get replay progress
    getReplayProgress() {
        if (!this.currentReplay || this.recordedFrames.length === 0) {
            return { progress: 0, currentTime: 0, totalTime: 0 };
        }

        const progress = (this.currentFrame / this.recordedFrames.length) * 100;
        const currentTime = this.getCurrentReplayTime();
        const totalTime = this.getTotalReplayTime();

        return {
            progress: progress,
            currentTime: currentTime,
            totalTime: totalTime,
            currentFrame: this.currentFrame,
            totalFrames: this.recordedFrames.length
        };
    }

    getCurrentReplayTime() {
        if (this.currentFrame < this.recordedFrames.length) {
            return this.recordedFrames[this.currentFrame].timestamp;
        }
        return 0;
    }

    getTotalReplayTime() {
        if (this.recordedFrames.length > 0) {
            return this.recordedFrames[this.recordedFrames.length - 1].timestamp;
        }
        return 0;
    }

    // Export replay (mock)
    exportReplay(replayId, format = 'mp4') {
        // In a real implementation, this would convert replay to video
        return {
            success: true,
            message: `Replay exported as ${format}`,
            url: 'export_url_here'
        };
    }

    // Share screenshot (mock)
    shareScreenshot(screenshotId, platform = 'twitter') {
        // In a real implementation, this would share to social media
        return {
            success: true,
            message: `Screenshot shared to ${platform}`,
            shareUrl: 'share_url_here'
        };
    }

    // Get replay statistics
    getReplayStats() {
        const replays = gameData.data.replays;

        return {
            totalReplays: replays.stats.totalReplays,
            savedReplays: replays.savedReplays.length,
            totalScreenshots: replays.stats.totalScreenshots,
            watchTime: replays.stats.watchTime,
            settings: replays.settings
        };
    }

    // Update settings
    updateSettings(newSettings) {
        const replays = gameData.data.replays;

        replays.settings = {
            ...replays.settings,
            ...newSettings
        };

        gameData.save();

        return { success: true, settings: replays.settings };
    }

    // Add replay markers (for highlights)
    addMarker(name, time) {
        if (!this.currentReplay) return;

        if (!this.currentReplay.markers) {
            this.currentReplay.markers = [];
        }

        this.currentReplay.markers.push({
            name: name,
            time: time,
            frame: this.currentFrame
        });

        return { success: true, message: 'Marker added!' };
    }

    // Jump to marker
    jumpToMarker(markerIndex) {
        if (!this.currentReplay || !this.currentReplay.markers) return;

        const marker = this.currentReplay.markers[markerIndex];
        if (marker) {
            this.seekToTime(marker.time);
        }
    }

    // Trim replay
    trimReplay(startFrame, endFrame) {
        if (!this.currentReplay) return { success: false };

        this.recordedFrames = this.recordedFrames.slice(startFrame, endFrame + 1);

        return {
            success: true,
            newLength: this.recordedFrames.length,
            message: 'Replay trimmed!'
        };
    }
}

export default ReplayPhotoMode;
