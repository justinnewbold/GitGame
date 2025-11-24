/**
 * Main entry point for GitGame
 * Bootstraps the game with Phaser and initializes all services
 */

import Phaser from 'phaser';

// Core infrastructure
import ServiceLocator from './core/ServiceLocator.js';
import EventBus from './core/EventBus.js';
import { GAME_CONFIG } from './constants/GameConstants.js';

// Scenes
import BootScene from './scenes/BootScene.js';
import MainMenuScene from './scenes/MainMenuScene.js';
import GitSurvivorScene from './scenes/GitSurvivorScene.js';
import CodeDefenseScene from './scenes/CodeDefenseScene.js';
import PRRushScene from './scenes/PRRushScene.js';
import DevCommanderScene from './scenes/DevCommanderScene.js';
import DebugDungeonScene from './scenes/DebugDungeonScene.js';
import RefactorRaceScene from './scenes/RefactorRaceScene.js';
import SprintSurvivorScene from './scenes/SprintSurvivorScene.js';
import BugBountyScene from './scenes/BugBountyScene.js';
import LegacyExcavatorScene from './scenes/LegacyExcavatorScene.js';
import BossRushScene from './scenes/BossRushScene.js';
import SettingsScene from './scenes/SettingsScene.js';
import StatsScene from './scenes/StatsScene.js';

// Feature UI scenes
import BattlePassScene from './scenes/BattlePassScene.js';
import ProfileScene from './scenes/ProfileScene.js';
import RankedScene from './scenes/RankedScene.js';
import ClanScene from './scenes/ClanScene.js';
import ChallengesScene from './scenes/ChallengesScene.js';
import LootCrateScene from './scenes/LootCrateScene.js';
import FriendsScene from './scenes/FriendsScene.js';
import CampaignScene from './scenes/CampaignScene.js';

// Services
import SoundManager from './utils/SoundManager.js';
import MusicManager from './utils/MusicManager.js';
import ParticleEffects from './utils/ParticleEffects.js';
import { gameData } from './systems/persistence/GameDataManager.js';

/**
 * Initialize all global services and register them with ServiceLocator
 */
function initializeServices(game) {
    console.log('🚀 Initializing services...');

    // Register game data manager
    ServiceLocator.register('gameData', gameData);

    // Note: SoundManager, MusicManager, and ParticleEffects need a Phaser scene
    // They will be registered in BootScene after Phaser is fully initialized

    console.log('✅ Services initialized');
}

/**
 * Phaser game configuration
 */
const config = {
    type: Phaser.AUTO,
    width: GAME_CONFIG.WIDTH,
    height: GAME_CONFIG.HEIGHT,
    parent: 'game-container',
    backgroundColor: '#1a1a2e',
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
        StatsScene,
        // Game modes
        GitSurvivorScene,
        CodeDefenseScene,
        PRRushScene,
        DevCommanderScene,
        DebugDungeonScene,
        RefactorRaceScene,
        SprintSurvivorScene,
        BugBountyScene,
        LegacyExcavatorScene,
        BossRushScene,
        // Feature UI scenes
        BattlePassScene,
        ProfileScene,
        RankedScene,
        ClanScene,
        ChallengesScene,
        LootCrateScene,
        FriendsScene,
        CampaignScene
    ],
    // Callbacks
    callbacks: {
        postBoot: (game) => {
            initializeServices(game);
        }
    }
};

// Create the game instance
console.log('🎮 Starting GitGame...');
const game = new Phaser.Game(config);

// Expose game globally for debugging
window.game = game;
window.ServiceLocator = ServiceLocator;
window.EventBus = EventBus;

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    console.log('👋 Cleaning up...');
    gameData.cleanup();
    ServiceLocator.cleanupAll();
});

console.log('✅ GitGame initialized');
