/**
 * GameConstants - Centralized configuration for the entire game
 * All magic numbers, colors, and configuration values in one place
 */

export const SCENE_NAMES = {
    BOOT: 'BootScene',
    MAIN_MENU: 'MainMenuScene',
    SETTINGS: 'SettingsScene',
    STATS: 'StatsScene',

    // Game Modes
    GIT_SURVIVOR: 'GitSurvivorScene',
    CODE_DEFENSE: 'CodeDefenseScene',
    PR_RUSH: 'PRRushScene',
    DEV_COMMANDER: 'DevCommanderScene',
    DEBUG_DUNGEON: 'DebugDungeonScene',
    REFACTOR_RACE: 'RefactorRaceScene',
    SPRINT_SURVIVOR: 'SprintSurvivorScene',
    BUG_BOUNTY: 'BugBountyScene',
    LEGACY_EXCAVATOR: 'LegacyExcavatorScene',
    BOSS_RUSH: 'BossRushScene',

    // Feature UI Scenes
    BATTLE_PASS: 'BattlePassScene',
    PROFILE: 'ProfileScene',
    RANKED: 'RankedScene',
    CLAN: 'ClanScene',
    CHALLENGES: 'ChallengesScene',
    LOOT_CRATE: 'LootCrateScene',
    FRIENDS: 'FriendsScene',
    CAMPAIGN: 'CampaignScene'
};

export const COLORS = {
    // UI Colors
    BACKGROUND: 0x1a1a2e,
    BACKGROUND_DARK: 0x0a0a1a,
    PRIMARY: 0x00ff00,
    SECONDARY: 0x00aaff,
    ACCENT: 0xffaa00,
    DANGER: 0xff0000,
    SUCCESS: 0x00ff00,
    WARNING: 0xffaa00,
    INFO: 0x00aaff,

    // Element Colors
    BUTTON_DEFAULT: 0x333333,
    BUTTON_HOVER: 0x555555,
    OVERLAY: 0x000000,
    BORDER: 0xffffff,

    // Game Mode Colors
    GIT_SURVIVOR: 0x4a90e2,
    CODE_DEFENSE: 0xe24a4a,
    PR_RUSH: 0xe2a94a,
    DEV_COMMANDER: 0x7e4ae2,
    DEBUG_DUNGEON: 0x9b59b6,
    REFACTOR_RACE: 0x16a085,
    SPRINT_SURVIVOR: 0x3498db,
    BUG_BOUNTY: 0xe74c3c,
    LEGACY_EXCAVATOR: 0xf39c12,
    BOSS_RUSH: 0xc0392b,

    // Feature Colors
    BATTLE_PASS: 0x9370DB,
    RANKED: 0xFFD700,
    PROFILE: 0x4169E1,
    CLAN: 0xE74C3C,
    CAMPAIGN: 0x16A085,
    CHALLENGES: 0xF39C12,
    LOOT_CRATE: 0x9B59B6,
    FRIENDS: 0x3498DB,

    // Enemy Colors
    BUG: 0xff00ff,
    MERGE_CONFLICT: 0xff0000,
    MEMORY_LEAK: 0xffff00,
    NPM_PACKAGE: 0x00ffff,
    NULL_POINTER: 0xff6600,
    RACE_CONDITION: 0x6600ff,
    SEGFAULT: 0xff0000,
    HEISENBUG: 0xff00ff
};

export const COLORS_HEX = {
    PRIMARY: '#00ff00',
    SECONDARY: '#00aaff',
    ACCENT: '#ffaa00',
    DANGER: '#ff0000',
    SUCCESS: '#00ff00',
    WARNING: '#ffaa00',
    INFO: '#00aaff',
    WHITE: '#ffffff',
    BLACK: '#000000',
    GRAY: '#888888',
    GRAY_DARK: '#555555',
    GRAY_DARKER: '#333333'
};

export const DIFFICULTY = {
    NORMAL: 'normal',
    HARD: 'hard',
    NIGHTMARE: 'nightmare',

    MULTIPLIERS: {
        normal: 1.0,
        hard: 1.5,
        nightmare: 2.0
    },

    LABELS: {
        normal: '😊 Normal',
        hard: '😅 Hard',
        nightmare: '💀 Nightmare'
    }
};

export const GAME_CONFIG = {
    WIDTH: 800,
    HEIGHT: 600,

    // Player defaults
    PLAYER_HEALTH: 100,
    PLAYER_SANITY: 100,
    PLAYER_DISK_SPACE: 100,

    // Timing
    SCENE_FADE_DURATION: 250,
    NOTIFICATION_DURATION: 3000,
    ACHIEVEMENT_DISPLAY_DURATION: 3000,

    // Depths (z-index)
    DEPTH: {
        BACKGROUND: 0,
        GAME_AREA: 1,
        ENTITIES: 10,
        UI: 100,
        HUD: 500,
        OVERLAY: 1000,
        TUTORIAL: 1001,
        DIALOG: 2000
    }
};

export const UI_STYLES = {
    FONT: {
        FAMILY: 'monospace',
        SIZE: {
            TINY: '10px',
            SMALL: '12px',
            NORMAL: '14px',
            MEDIUM: '16px',
            LARGE: '20px',
            HUGE: '24px',
            MASSIVE: '48px',
            TITLE: '64px'
        }
    },

    BUTTON: {
        PADDING: { x: 10, y: 5 },
        PADDING_LARGE: { x: 15, y: 8 },
        PADDING_SMALL: { x: 8, y: 4 }
    },

    SPACING: {
        TINY: 5,
        SMALL: 10,
        NORMAL: 20,
        MEDIUM: 40,
        LARGE: 60,
        HUGE: 80
    }
};

export const AUDIO = {
    VOLUME: {
        MASTER: 1.0,
        MUSIC: 0.7,
        SFX: 0.8
    },

    SOUNDS: {
        SHOOT: 'shoot',
        HIT: 'hit',
        ERROR: 'error',
        SUCCESS: 'success',
        CLICK: 'click',
        UPGRADE: 'upgrade',
        LEVEL_UP: 'levelup',
        VICTORY: 'victory',
        GAME_OVER: 'gameover',
        BOSS: 'boss',
        WAVE: 'wave',
        PLACE: 'place'
    }
};

export const STORAGE = {
    KEY: 'gitgame_data',
    VERSION: '2.0.0', // Increment on breaking changes
    AUTO_SAVE_INTERVAL: 30000 // 30 seconds
};

export const ANIMATION = {
    TWEEN_DURATION: {
        FAST: 200,
        NORMAL: 500,
        SLOW: 1000
    },

    EASE: {
        DEFAULT: 'Power2',
        BOUNCE: 'Bounce',
        ELASTIC: 'Elastic'
    }
};

export const GAMEPLAY = {
    // Git Survivor
    GIT_SURVIVOR: {
        INITIAL_SPAWN_DELAY: 2000,
        POWER_UP_DELAY: 10000,
        BOSS_SPAWN_INTERVAL: 30, // enemies
        LEVEL_UP_INTERVAL: 10 // kills
    },

    // Code Defense
    CODE_DEFENSE: {
        STARTING_MONEY: 500,
        WAVE_COMPLETE_BONUS: 100
    },

    // General
    PROJECTILE_SPEED: 400,
    PLAYER_SPEED: 200,
    CAMERA_SHAKE_INTENSITY: 0.01
};

export const EVENTS = {
    // Game state
    GAME_START: 'game:start',
    GAME_PAUSE: 'game:pause',
    GAME_RESUME: 'game:resume',
    GAME_OVER: 'game:over',
    LEVEL_UP: 'game:levelup',

    // Stats
    STAT_UPDATED: 'stats:updated',
    ACHIEVEMENT_UNLOCKED: 'achievement:unlocked',

    // Settings
    SETTING_CHANGED: 'settings:changed',
    DIFFICULTY_CHANGED: 'difficulty:changed',

    // Social
    FRIEND_ADDED: 'friend:added',
    CLAN_JOINED: 'clan:joined',

    // Progression
    BATTLE_PASS_TIER_CLAIMED: 'battlepass:claimed',
    RANK_CHANGED: 'rank:changed',

    // Data
    DATA_SAVED: 'data:saved',
    DATA_LOADED: 'data:loaded',
    SAVE_ERROR: 'save:error'
};

export const RANKS = [
    { name: 'Bronze', tier: 1, color: 0xCD7F32, lpRequired: 0 },
    { name: 'Silver', tier: 2, color: 0xC0C0C0, lpRequired: 100 },
    { name: 'Gold', tier: 3, color: 0xFFD700, lpRequired: 300 },
    { name: 'Platinum', tier: 4, color: 0xE5E4E2, lpRequired: 600 },
    { name: 'Diamond', tier: 5, color: 0xB9F2FF, lpRequired: 1000 },
    { name: 'Master', tier: 6, color: 0xFF00FF, lpRequired: 1500 },
    { name: 'Grandmaster', tier: 7, color: 0xFF0000, lpRequired: 2100 }
];

export const BATTLE_PASS = {
    MAX_TIER: 50,
    XP_PER_TIER: 1000,
    SEASON_DURATION_DAYS: 90
};

export const ERRORS = {
    SCENE_NOT_FOUND: 'Scene not found',
    SAVE_FAILED: 'Failed to save game data',
    LOAD_FAILED: 'Failed to load game data',
    INVALID_INPUT: 'Invalid input provided',
    NETWORK_ERROR: 'Network error occurred'
};

export default {
    SCENE_NAMES,
    COLORS,
    COLORS_HEX,
    DIFFICULTY,
    GAME_CONFIG,
    UI_STYLES,
    AUDIO,
    STORAGE,
    ANIMATION,
    GAMEPLAY,
    EVENTS,
    RANKS,
    BATTLE_PASS,
    ERRORS
};
