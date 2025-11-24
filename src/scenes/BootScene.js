/**
 * BootScene - Initial loading scene
 * Loads assets and initializes Phaser-dependent services
 */

import Phaser from 'phaser';
import ServiceLocator from '../core/ServiceLocator.js';
import SoundManager from '../utils/SoundManager.js';
import MusicManager from '../utils/MusicManager.js';
import ParticleEffects from '../utils/ParticleEffects.js';
import { SCENE_NAMES } from '../constants/GameConstants.js';

export default class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: SCENE_NAMES.BOOT });
    }

    preload() {
        // Create loading bar
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);

        const loadingText = this.make.text({
            x: width / 2,
            y: height / 2 - 50,
            text: 'Loading GitGame...',
            style: {
                font: '20px monospace',
                fill: '#00ff00'
            }
        });
        loadingText.setOrigin(0.5, 0.5);

        const percentText = this.make.text({
            x: width / 2,
            y: height / 2,
            text: '0%',
            style: {
                font: '18px monospace',
                fill: '#ffffff'
            }
        });
        percentText.setOrigin(0.5, 0.5);

        const assetText = this.make.text({
            x: width / 2,
            y: height / 2 + 50,
            text: '',
            style: {
                font: '12px monospace',
                fill: '#888888'
            }
        });
        assetText.setOrigin(0.5, 0.5);

        // Update progress bar
        this.load.on('progress', (value) => {
            progressBar.clear();
            progressBar.fillStyle(0x00ff00, 1);
            progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
            percentText.setText(parseInt(value * 100) + '%');
        });

        this.load.on('fileprogress', (file) => {
            assetText.setText('Loading: ' + file.key);
        });

        this.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
            percentText.destroy();
            assetText.destroy();
        });

        // Load assets (placeholder - will be updated in future)
        this.load.image('logo', 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzAwZmYwMCIvPjwvc3ZnPg==');
    }

    create() {
        console.log('🔧 BootScene: Registering Phaser-dependent services...');

        try {
            // Initialize and register services that need a Phaser scene
            const soundManager = new SoundManager(this);
            const musicManager = new MusicManager(this);
            const particleEffects = new ParticleEffects(this);

            ServiceLocator.register('soundManager', soundManager);
            ServiceLocator.register('musicManager', musicManager);
            ServiceLocator.register('particleEffects', particleEffects);

            console.log('✅ BootScene: Services registered successfully');
        } catch (error) {
            console.error('❌ BootScene: Failed to register services:', error);
        }

        // Move to main menu after a short delay
        this.time.delayedCall(500, () => {
            this.scene.start(SCENE_NAMES.MAIN_MENU);
        });
    }
}
