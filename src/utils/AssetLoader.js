/**
 * AssetLoader - Centralized asset loading and management
 * Future-proof system for when real assets are added
 */

import { logger } from './Logger.js';

export default class AssetLoader {
    constructor(scene) {
        this.scene = scene;
        this.loadedAssets = new Map();
        this.failedAssets = new Set();
        this.assetManifest = {};
    }

    /**
     * Load asset manifest
     */
    loadManifest(manifest) {
        this.assetManifest = manifest;
        return this;
    }

    /**
     * Load all assets for a scene
     */
    loadSceneAssets(sceneName) {
        const assets = this.assetManifest[sceneName];
        if (!assets) {
            logger.warn('AssetLoader', 'No assets defined for scene', { scene: sceneName });
            return this;
        }

        // Load each asset type
        if (assets.images) {
            assets.images.forEach(img => this.loadImage(img.key, img.path));
        }

        if (assets.spritesheets) {
            assets.spritesheets.forEach(sheet => {
                this.loadSpritesheet(sheet.key, sheet.path, sheet.frameConfig);
            });
        }

        if (assets.audio) {
            assets.audio.forEach(audio => this.loadAudio(audio.key, audio.path));
        }

        if (assets.json) {
            assets.json.forEach(json => this.loadJSON(json.key, json.path));
        }

        return this;
    }

    /**
     * Load image
     */
    loadImage(key, path) {
        if (this.loadedAssets.has(key)) {
            logger.debug('AssetLoader', 'Asset already loaded', { key });
            return;
        }

        try {
            this.scene.load.image(key, path);
            this.loadedAssets.set(key, { type: 'image', path });
            logger.debug('AssetLoader', 'Loading image', { key, path });
        } catch (error) {
            logger.error('AssetLoader', 'Failed to load image', { key, path, error });
            this.failedAssets.add(key);
        }
    }

    /**
     * Load spritesheet
     */
    loadSpritesheet(key, path, frameConfig) {
        if (this.loadedAssets.has(key)) {
            logger.debug('AssetLoader', 'Asset already loaded', { key });
            return;
        }

        try {
            this.scene.load.spritesheet(key, path, frameConfig);
            this.loadedAssets.set(key, { type: 'spritesheet', path, frameConfig });
            logger.debug('AssetLoader', 'Loading spritesheet', { key, path });
        } catch (error) {
            logger.error('AssetLoader', 'Failed to load spritesheet', { key, path, error });
            this.failedAssets.add(key);
        }
    }

    /**
     * Load audio
     */
    loadAudio(key, path) {
        if (this.loadedAssets.has(key)) {
            logger.debug('AssetLoader', 'Asset already loaded', { key });
            return;
        }

        try {
            this.scene.load.audio(key, path);
            this.loadedAssets.set(key, { type: 'audio', path });
            logger.debug('AssetLoader', 'Loading audio', { key, path });
        } catch (error) {
            logger.error('AssetLoader', 'Failed to load audio', { key, path, error });
            this.failedAssets.add(key);
        }
    }

    /**
     * Load JSON
     */
    loadJSON(key, path) {
        if (this.loadedAssets.has(key)) {
            logger.debug('AssetLoader', 'Asset already loaded', { key });
            return;
        }

        try {
            this.scene.load.json(key, path);
            this.loadedAssets.set(key, { type: 'json', path });
            logger.debug('AssetLoader', 'Loading JSON', { key, path });
        } catch (error) {
            logger.error('AssetLoader', 'Failed to load JSON', { key, path, error });
            this.failedAssets.add(key);
        }
    }

    /**
     * Load atlas
     */
    loadAtlas(key, imagePath, jsonPath) {
        if (this.loadedAssets.has(key)) {
            logger.debug('AssetLoader', 'Asset already loaded', { key });
            return;
        }

        try {
            this.scene.load.atlas(key, imagePath, jsonPath);
            this.loadedAssets.set(key, { type: 'atlas', imagePath, jsonPath });
            logger.debug('AssetLoader', 'Loading atlas', { key });
        } catch (error) {
            logger.error('AssetLoader', 'Failed to load atlas', { key, error });
            this.failedAssets.add(key);
        }
    }

    /**
     * Create placeholder assets for development
     */
    createPlaceholders() {
        // Create simple colored rectangles as placeholders
        const placeholders = {
            player: { width: 32, height: 32, color: 0x00aaff },
            enemy: { width: 24, height: 24, color: 0xff0000 },
            powerup: { width: 16, height: 16, color: 0xffff00 },
            projectile: { width: 8, height: 8, color: 0x00ff00 }
        };

        Object.entries(placeholders).forEach(([key, config]) => {
            if (!this.loadedAssets.has(key)) {
                this.createPlaceholder(key, config.width, config.height, config.color);
            }
        });
    }

    /**
     * Create a placeholder texture
     */
    createPlaceholder(key, width, height, color) {
        const graphics = this.scene.make.graphics({ x: 0, y: 0, add: false });
        graphics.fillStyle(color);
        graphics.fillRect(0, 0, width, height);
        graphics.generateTexture(key, width, height);
        graphics.destroy();

        this.loadedAssets.set(key, { type: 'placeholder', width, height, color });
        logger.debug('AssetLoader', 'Created placeholder', { key, width, height });
    }

    /**
     * Check if asset is loaded
     */
    isLoaded(key) {
        return this.loadedAssets.has(key);
    }

    /**
     * Check if asset failed to load
     */
    hasFailed(key) {
        return this.failedAssets.has(key);
    }

    /**
     * Get load progress
     */
    getProgress() {
        const total = this.loadedAssets.size + this.failedAssets.size;
        const loaded = this.loadedAssets.size;
        return total > 0 ? loaded / total : 0;
    }

    /**
     * Get load statistics
     */
    getStats() {
        return {
            loaded: this.loadedAssets.size,
            failed: this.failedAssets.size,
            total: this.loadedAssets.size + this.failedAssets.size,
            progress: this.getProgress()
        };
    }

    /**
     * Preload common assets
     */
    preloadCommon() {
        // This would load assets used across all scenes
        // For now, just create placeholders
        this.createPlaceholders();
    }

    /**
     * Unload assets
     */
    unload(key) {
        if (!this.loadedAssets.has(key)) {
            return false;
        }

        try {
            const asset = this.loadedAssets.get(key);

            switch (asset.type) {
                case 'image':
                case 'spritesheet':
                case 'atlas':
                    if (this.scene.textures.exists(key)) {
                        this.scene.textures.remove(key);
                    }
                    break;

                case 'audio':
                    if (this.scene.cache.audio.exists(key)) {
                        this.scene.cache.audio.remove(key);
                    }
                    break;

                case 'json':
                    if (this.scene.cache.json.exists(key)) {
                        this.scene.cache.json.remove(key);
                    }
                    break;
            }

            this.loadedAssets.delete(key);
            logger.debug('AssetLoader', 'Unloaded asset', { key });
            return true;
        } catch (error) {
            logger.error('AssetLoader', 'Failed to unload asset', { key, error });
            return false;
        }
    }

    /**
     * Unload all assets
     */
    unloadAll() {
        const keys = Array.from(this.loadedAssets.keys());
        keys.forEach(key => this.unload(key));
        this.failedAssets.clear();
        logger.info('AssetLoader', 'All assets unloaded');
    }

    /**
     * Get asset manifest template
     */
    static getManifestTemplate() {
        return {
            SceneName: {
                images: [
                    { key: 'asset_key', path: 'assets/images/asset.png' }
                ],
                spritesheets: [
                    {
                        key: 'spritesheet_key',
                        path: 'assets/spritesheets/sprite.png',
                        frameConfig: { frameWidth: 32, frameHeight: 32 }
                    }
                ],
                audio: [
                    { key: 'sound_key', path: 'assets/audio/sound.mp3' }
                ],
                json: [
                    { key: 'data_key', path: 'assets/data/data.json' }
                ]
            }
        };
    }
}
