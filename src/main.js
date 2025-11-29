import Phaser from 'phaser';
import BootScene from './scenes/BootScene.js';
import MainMenuScene from './scenes/MainMenuScene.js';
import GitSurvivorScene from './scenes/GitSurvivorScene.js';
import SprintSurvivorScene from './scenes/SprintSurvivorScene.js';
import BugBountyScene from './scenes/BugBountyScene.js';
import SettingsScene from './scenes/SettingsScene.js';

// Modern color palette
export const COLORS = {
    bg: 0x0a0a0b,
    surface: 0x1a1a1d,
    surfaceLight: 0x2a2a2d,
    primary: 0x6366f1,
    primaryLight: 0x818cf8,
    success: 0x22c55e,
    warning: 0xeab308,
    error: 0xef4444,
    text: 0xfafafa,
    textMuted: 0x71717a,
    textDim: 0x52525b
};

// Game configuration
const config = {
    type: Phaser.AUTO,
    width: 390,
    height: 844,
    parent: 'game-container',
    backgroundColor: COLORS.bg,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [
        BootScene,
        MainMenuScene,
        SettingsScene,
        GitSurvivorScene,
        SprintSurvivorScene,
        BugBountyScene
    ]
};

// Create the game instance
const game = new Phaser.Game(config);

export default game;
