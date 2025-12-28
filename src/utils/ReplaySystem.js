/**
 * ReplaySystem - Records and plays back game sessions
 * Captures player inputs and game state for replay viewing
 */

import { logger } from './Logger.js';
import { gameData } from './GameData.js';

// Maximum replay storage (to prevent localStorage overflow)
const MAX_REPLAYS = 10;
const MAX_REPLAY_DURATION = 600000; // 10 minutes in ms

export default class ReplaySystem {
    constructor(scene) {
        this.scene = scene;
        this.isRecording = false;
        this.isPlaying = false;
        this.currentReplay = null;
        this.recordingData = null;
        this.playbackIndex = 0;
        this.playbackEventIndex = 0;  // Initialize playback event index
        this.playbackTimer = null;
        this.startTime = 0;

        this.initializeStorage();
    }

    /**
     * Initialize replay storage
     */
    initializeStorage() {
        if (!gameData.data.replays) {
            gameData.data.replays = [];
        }
    }

    /**
     * Start recording a game session
     */
    startRecording(gameMode, playerName = 'Player') {
        if (this.isRecording) {
            logger.warn('ReplaySystem', 'Already recording');
            return;
        }

        this.isRecording = true;
        this.startTime = Date.now();

        this.recordingData = {
            id: `replay_${Date.now()}`,
            gameMode,
            playerName,
            startTime: this.startTime,
            endTime: null,
            duration: 0,
            finalScore: 0,
            frames: [],
            events: [],
            metadata: {
                version: '1.0',
                screenWidth: this.scene.cameras.main.width,
                screenHeight: this.scene.cameras.main.height
            }
        };

        logger.info('ReplaySystem', `Started recording for ${gameMode}`);
    }

    /**
     * Record a frame of game state
     */
    recordFrame(frameData) {
        if (!this.isRecording || !this.recordingData) return;

        const elapsed = Date.now() - this.startTime;

        // Stop recording if too long
        if (elapsed > MAX_REPLAY_DURATION) {
            this.stopRecording(frameData.score || 0);
            return;
        }

        // Only record keyframes (every 100ms) to save space
        if (this.recordingData.frames.length > 0) {
            const lastFrame = this.recordingData.frames[this.recordingData.frames.length - 1];
            if (elapsed - lastFrame.time < 100) return;
        }

        this.recordingData.frames.push({
            time: elapsed,
            playerX: frameData.playerX,
            playerY: frameData.playerY,
            playerHealth: frameData.playerHealth,
            score: frameData.score,
            enemies: frameData.enemies?.map(e => ({
                x: e.x,
                y: e.y,
                type: e.type
            })) || [],
            powerups: frameData.powerups?.map(p => ({
                x: p.x,
                y: p.y,
                type: p.type
            })) || []
        });
    }

    /**
     * Record a game event (kills, powerups, damage, etc.)
     */
    recordEvent(eventType, eventData) {
        if (!this.isRecording || !this.recordingData) return;

        const elapsed = Date.now() - this.startTime;

        this.recordingData.events.push({
            time: elapsed,
            type: eventType,
            data: eventData
        });
    }

    /**
     * Stop recording and save the replay
     */
    stopRecording(finalScore = 0) {
        if (!this.isRecording || !this.recordingData) return null;

        this.isRecording = false;
        this.recordingData.endTime = Date.now();
        this.recordingData.duration = this.recordingData.endTime - this.startTime;
        this.recordingData.finalScore = finalScore;

        // Compress frames by removing redundant data
        this.compressReplay();

        // Save replay
        const replay = { ...this.recordingData };
        this.saveReplay(replay);

        logger.info('ReplaySystem', `Stopped recording. Duration: ${Math.round(replay.duration / 1000)}s, Frames: ${replay.frames.length}`);

        this.recordingData = null;
        return replay;
    }

    /**
     * Compress replay data to reduce storage size
     */
    compressReplay() {
        if (!this.recordingData || this.recordingData.frames.length < 2) return;

        // Remove frames where player position hasn't changed significantly
        const compressed = [this.recordingData.frames[0]];
        let lastFrame = this.recordingData.frames[0];

        for (let i = 1; i < this.recordingData.frames.length; i++) {
            const frame = this.recordingData.frames[i];
            const dx = Math.abs(frame.playerX - lastFrame.playerX);
            const dy = Math.abs(frame.playerY - lastFrame.playerY);
            const dScore = frame.score !== lastFrame.score;
            const dHealth = frame.playerHealth !== lastFrame.playerHealth;

            // Keep frame if significant change occurred
            if (dx > 5 || dy > 5 || dScore || dHealth || i === this.recordingData.frames.length - 1) {
                compressed.push(frame);
                lastFrame = frame;
            }
        }

        this.recordingData.frames = compressed;
    }

    /**
     * Save replay to storage
     */
    saveReplay(replay) {
        // Remove oldest replays if at limit
        while (gameData.data.replays.length >= MAX_REPLAYS) {
            gameData.data.replays.shift();
        }

        gameData.data.replays.push(replay);
        gameData.save();

        logger.info('ReplaySystem', `Saved replay: ${replay.id}`);
    }

    /**
     * Get all saved replays
     */
    getReplays() {
        return gameData.data.replays || [];
    }

    /**
     * Get a specific replay by ID
     */
    getReplay(replayId) {
        return gameData.data.replays?.find(r => r.id === replayId);
    }

    /**
     * Delete a replay
     */
    deleteReplay(replayId) {
        if (!gameData.data.replays) return false;
        const index = gameData.data.replays.findIndex(r => r.id === replayId);
        if (index !== -1) {
            gameData.data.replays.splice(index, 1);
            gameData.save();
            logger.info('ReplaySystem', `Deleted replay: ${replayId}`);
            return true;
        }
        return false;
    }

    /**
     * Start playing back a replay
     */
    startPlayback(replayId, onFrame, onEvent, onComplete) {
        const replay = this.getReplay(replayId);
        if (!replay) {
            logger.error('ReplaySystem', `Replay not found: ${replayId}`);
            return false;
        }

        this.isPlaying = true;
        this.currentReplay = replay;
        this.playbackIndex = 0;
        this.playbackEventIndex = 0;

        const startTime = Date.now();

        // Playback loop
        this.playbackTimer = setInterval(() => {
            const elapsed = Date.now() - startTime;

            // Process frames up to current time
            while (this.playbackIndex < replay.frames.length &&
                   replay.frames[this.playbackIndex].time <= elapsed) {
                if (onFrame) {
                    onFrame(replay.frames[this.playbackIndex]);
                }
                this.playbackIndex++;
            }

            // Process events up to current time
            while (this.playbackEventIndex < replay.events.length &&
                   replay.events[this.playbackEventIndex].time <= elapsed) {
                if (onEvent) {
                    onEvent(replay.events[this.playbackEventIndex]);
                }
                this.playbackEventIndex++;
            }

            // Check if playback complete
            if (this.playbackIndex >= replay.frames.length) {
                this.stopPlayback();
                if (onComplete) {
                    onComplete(replay);
                }
            }
        }, 16); // ~60fps

        logger.info('ReplaySystem', `Started playback: ${replayId}`);
        return true;
    }

    /**
     * Stop playback
     */
    stopPlayback() {
        if (this.playbackTimer) {
            clearInterval(this.playbackTimer);
            this.playbackTimer = null;
        }
        this.isPlaying = false;
        this.currentReplay = null;
        this.playbackIndex = 0;
        this.playbackEventIndex = 0;  // Reset event index

        logger.info('ReplaySystem', 'Stopped playback');
    }

    /**
     * Pause playback
     */
    pausePlayback() {
        if (this.playbackTimer) {
            clearInterval(this.playbackTimer);
            this.playbackTimer = null;
        }
    }

    /**
     * Get playback progress (0-1)
     */
    getPlaybackProgress() {
        if (!this.currentReplay || !this.isPlaying) return 0;
        return this.playbackIndex / this.currentReplay.frames.length;
    }

    /**
     * Export replay as JSON string for sharing
     */
    exportReplay(replayId) {
        const replay = this.getReplay(replayId);
        if (!replay) return null;

        return JSON.stringify(replay);
    }

    /**
     * Import replay from JSON string
     */
    importReplay(jsonString) {
        try {
            const replay = JSON.parse(jsonString);

            // Validate replay structure
            if (!replay.id || !replay.frames || !Array.isArray(replay.frames)) {
                logger.error('ReplaySystem', 'Invalid replay format');
                return false;
            }

            // Generate new ID to avoid conflicts
            replay.id = `replay_imported_${Date.now()}`;
            replay.imported = true;

            this.saveReplay(replay);
            return true;
        } catch (e) {
            logger.error('ReplaySystem', `Failed to import replay: ${e.message}`);
            return false;
        }
    }

    /**
     * Get replay statistics
     */
    getReplayStats(replayId) {
        const replay = this.getReplay(replayId);
        if (!replay) return null;

        const killEvents = replay.events.filter(e => e.type === 'kill');
        const damageEvents = replay.events.filter(e => e.type === 'damage');
        const powerupEvents = replay.events.filter(e => e.type === 'powerup');

        return {
            duration: replay.duration,
            finalScore: replay.finalScore,
            totalKills: killEvents.length,
            totalDamage: damageEvents.reduce((sum, e) => sum + (e.data?.amount || 0), 0),
            powerupsCollected: powerupEvents.length,
            framesRecorded: replay.frames.length
        };
    }

    /**
     * Take a screenshot of current game state
     */
    takeScreenshot(callback) {
        if (!this.scene || !this.scene.game) {
            logger.error('ReplaySystem', 'Cannot take screenshot - no scene');
            return;
        }

        this.scene.game.renderer.snapshot((image) => {
            const screenshot = {
                id: `screenshot_${Date.now()}`,
                timestamp: Date.now(),
                dataUrl: image.src
            };

            // Store screenshot
            if (!gameData.data.screenshots) {
                gameData.data.screenshots = [];
            }

            // Limit screenshots
            if (gameData.data.screenshots.length >= 20) {
                gameData.data.screenshots.shift();
            }

            gameData.data.screenshots.push(screenshot);
            gameData.save();

            if (callback) callback(screenshot);

            logger.info('ReplaySystem', 'Screenshot captured');
        });
    }

    /**
     * Get all screenshots
     */
    getScreenshots() {
        return gameData.data.screenshots || [];
    }

    /**
     * Delete a screenshot
     */
    deleteScreenshot(screenshotId) {
        if (!gameData.data.screenshots) return false;
        const index = gameData.data.screenshots.findIndex(s => s.id === screenshotId);
        if (index !== -1) {
            gameData.data.screenshots.splice(index, 1);
            gameData.save();
            return true;
        }
        return false;
    }

    /**
     * Cleanup
     */
    destroy() {
        this.stopRecording();
        this.stopPlayback();
    }
}
