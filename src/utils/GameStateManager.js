// GameStateManager - Save and resume gameplay state
// Allows players to pause and resume games across sessions

export default class GameStateManager {
    constructor(storageKey = 'gitgame_state') {
        this.storageKey = storageKey;
        this.currentState = null;
    }

    /**
     * Save current game state
     * @param {string} sceneName - Scene identifier
     * @param {Object} state - Game state to save
     */
    saveState(sceneName, state) {
        try {
            const gameState = {
                sceneName,
                state,
                timestamp: Date.now(),
                version: '1.0.0'
            };

            localStorage.setItem(this.storageKey, JSON.stringify(gameState));
            this.currentState = gameState;
            return true;
        } catch (error) {
            console.error('Failed to save game state:', error);
            return false;
        }
    }

    /**
     * Load saved game state
     */
    loadState() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (!saved) return null;

            const gameState = JSON.parse(saved);

            // Check if state is not too old (default: 7 days)
            const maxAge = 7 * 24 * 60 * 60 * 1000;
            if (Date.now() - gameState.timestamp > maxAge) {
                this.clearState();
                return null;
            }

            this.currentState = gameState;
            return gameState;
        } catch (error) {
            console.error('Failed to load game state:', error);
            return null;
        }
    }

    /**
     * Check if saved state exists
     */
    hasSavedState() {
        const saved = localStorage.getItem(this.storageKey);
        return saved !== null;
    }

    /**
     * Clear saved state
     */
    clearState() {
        localStorage.removeItem(this.storageKey);
        this.currentState = null;
    }

    /**
     * Get time since last save
     */
    getTimeSinceSave() {
        if (!this.currentState) {
            const saved = this.loadState();
            if (!saved) return null;
        }

        return Date.now() - this.currentState.timestamp;
    }

    /**
     * Format time for display
     */
    formatTimeSinceSave() {
        const ms = this.getTimeSinceSave();
        if (ms === null) return 'No saved game';

        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
        if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        return `${seconds} second${seconds > 1 ? 's' : ''} ago`;
    }
}

/**
 * Scene-specific state manager for GitSurvivorScene
 */
export class GitSurvivorStateManager extends GameStateManager {
    constructor() {
        super('gitgame_gitsurvivor_state');
    }

    /**
     * Save GitSurvivor game state
     */
    saveGitSurvivorState(scene) {
        const state = {
            // Player stats
            playerHealth: scene.playerHealth,
            playerSanity: scene.playerSanity,
            diskSpace: scene.diskSpace,
            level: scene.level,
            score: scene.score,
            enemiesKilled: scene.enemiesKilled,
            powerUpsCollected: scene.powerUpsCollected,

            // Player position
            playerX: scene.player?.x || 0,
            playerY: scene.player?.y || 0,

            // Game settings
            difficulty: scene.difficultyMult,

            // Active power-ups
            activePowerUps: scene.powerUpManager?.getActiveEffects() || [],

            // Enemies (basic info only)
            enemyCount: scene.enemies?.length || 0,

            // Time played in this session
            timePlayed: scene.time?.now || 0
        };

        return this.saveState('GitSurvivorScene', state);
    }

    /**
     * Restore GitSurvivor game state
     */
    restoreGitSurvivorState(scene) {
        const saved = this.loadState();
        if (!saved || saved.sceneName !== 'GitSurvivorScene') {
            return false;
        }

        const state = saved.state;

        try {
            // Restore player stats
            scene.playerHealth = state.playerHealth;
            scene.playerSanity = state.playerSanity;
            scene.diskSpace = state.diskSpace;
            scene.level = state.level;
            scene.score = state.score;
            scene.enemiesKilled = state.enemiesKilled;
            scene.powerUpsCollected = state.powerUpsCollected;
            scene.difficultyMult = state.difficulty;

            // Restore player position
            if (scene.player) {
                scene.player.setPosition(state.playerX, state.playerY);
            }

            // Restore power-ups
            if (scene.powerUpManager && state.activePowerUps) {
                state.activePowerUps.forEach(powerUp => {
                    scene.powerUpManager.activateEffect(powerUp.type, powerUp.remaining);
                });
            }

            // Update HUD
            if (scene.updateHUD) {
                scene.updateHUD();
            }

            return true;
        } catch (error) {
            console.error('Failed to restore game state:', error);
            return false;
        }
    }
}

/**
 * Auto-save manager - Automatically saves game at intervals
 */
export class AutoSaveManager {
    constructor(scene, stateManager, interval = 30000) {
        this.scene = scene;
        this.stateManager = stateManager;
        this.interval = interval;
        this.timer = null;
        this.enabled = true;
    }

    /**
     * Start auto-save
     */
    start() {
        if (this.timer) {
            this.stop();
        }

        this.timer = this.scene.time.addEvent({
            delay: this.interval,
            callback: () => {
                if (this.enabled) {
                    this.save();
                }
            },
            loop: true
        });
    }

    /**
     * Stop auto-save
     */
    stop() {
        if (this.timer) {
            this.timer.remove();
            this.timer = null;
        }
    }

    /**
     * Perform save
     */
    save() {
        if (this.stateManager instanceof GitSurvivorStateManager) {
            const success = this.stateManager.saveGitSurvivorState(this.scene);
            if (success && this.scene.add) {
                // Show save indicator
                this.showSaveIndicator();
            }
            return success;
        }
        return false;
    }

    /**
     * Show a small save indicator
     */
    showSaveIndicator() {
        const width = this.scene.cameras.main.width;

        const indicator = this.scene.add.text(width - 20, 20, '=¾ Saved', {
            fontSize: '12px',
            fontFamily: 'monospace',
            color: '#00ff00',
            backgroundColor: '#1a1a2e',
            padding: { x: 8, y: 4 }
        });
        indicator.setOrigin(1, 0);
        indicator.setAlpha(0);
        indicator.setDepth(10000);

        // Fade in and out
        this.scene.tweens.add({
            targets: indicator,
            alpha: 1,
            duration: 200,
            yoyo: true,
            hold: 1000,
            onComplete: () => indicator.destroy()
        });
    }

    /**
     * Enable/disable auto-save
     */
    setEnabled(enabled) {
        this.enabled = enabled;
    }

    /**
     * Cleanup
     */
    destroy() {
        this.stop();
    }
}

// Singleton instances
export const gameStateManager = new GameStateManager();
export const gitSurvivorStateManager = new GitSurvivorStateManager();
