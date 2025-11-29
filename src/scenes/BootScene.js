import Phaser from 'phaser';
import { COLORS } from '../main.js';

export default class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        const { width, height } = this.cameras.main;
        const centerX = width / 2;
        const centerY = height / 2;

        // Minimal loading indicator
        const progressTrack = this.add.rectangle(centerX, centerY + 60, 200, 4, COLORS.surface);
        const progressBar = this.add.rectangle(centerX - 100, centerY + 60, 0, 4, COLORS.primary);
        progressBar.setOrigin(0, 0.5);

        // Logo text
        this.add.text(centerX, centerY - 20, 'GitGame', {
            fontSize: '32px',
            fontFamily: 'Inter, sans-serif',
            color: '#fafafa',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(centerX, centerY + 20, 'Loading...', {
            fontSize: '14px',
            fontFamily: 'Inter, sans-serif',
            color: '#71717a'
        }).setOrigin(0.5);

        // Progress updates
        this.load.on('progress', (value) => {
            progressBar.width = 200 * value;
        });

        // Simulate minimal asset loading
        this.load.image('placeholder', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==');
    }

    create() {
        // Fade transition to menu
        this.cameras.main.fadeOut(300, 10, 10, 11);

        this.time.delayedCall(300, () => {
            this.scene.start('MainMenuScene');
        });
    }
}
