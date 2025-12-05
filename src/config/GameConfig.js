// Game Configuration Constants
// Centralized configuration for easy tweaking and maintenance

export const GameConfig = {
    // Display Settings
    GAME_WIDTH: 800,
    GAME_HEIGHT: 600,
    BACKGROUND_COLOR: '#1a1a2e',

    // Player Settings
    PLAYER: {
        INITIAL_HEALTH: 100,
        INITIAL_SANITY: 100,
        INITIAL_DISK_SPACE: 100,
        BASE_SPEED: 200,
        RADIUS: 15,
        COLOR: 0x00aaff
    },

    // Git Survivor Settings
    GIT_SURVIVOR: {
        ENEMY_SPAWN_DELAY: 2000, // milliseconds
        POWER_UP_SPAWN_DELAY: 10000,
        BOSS_SPAWN_INTERVAL: 30, // enemies killed
        LEVEL_UP_INTERVAL: 10, // enemies killed
        PROJECTILE_SPEED: 400,
        PROJECTILE_DAMAGE: 10,
        PROJECTILE_LIFETIME: 2000,
        PROJECTILE_RADIUS: 5,
        PROJECTILE_COLOR: 0x00ff00,
        GAME_AREA_WIDTH: 700,
        GAME_AREA_HEIGHT: 400
    },

    // Enemy Types
    ENEMY_TYPES: [
        { name: '🐛 Bug', color: 0xff00ff, health: 30, speed: 80, reward: 10 },
        { name: '⚠️ Merge Conflict', color: 0xff0000, health: 40, speed: 60, reward: 15 },
        { name: '💣 Memory Leak', color: 0xffff00, health: 50, speed: 40, reward: 20 },
        { name: '📦 NPM Package', color: 0x00ffff, health: 25, speed: 100, reward: 12 },
        { name: '🔓 Null Pointer', color: 0xff6600, health: 35, speed: 70, reward: 18 },
        { name: '🌊 Race Condition', color: 0x6600ff, health: 45, speed: 120, reward: 25 },
        { name: '💀 Segfault', color: 0xff0000, health: 60, speed: 50, reward: 30 },
        { name: '🐞 Heisenbug', color: 0xff00ff, health: 40, speed: 150, reward: 35 }
    ],

    // Boss Types
    BOSS_TYPES: [
        { name: '👹 The Product Manager', health: 500, speed: 40, color: 0xff0000, reward: 200 },
        { name: '💼 Legacy Codebase', health: 800, speed: 20, color: 0x666666, reward: 200 },
        { name: '🔥 Production Outage', health: 600, speed: 60, color: 0xff6600, reward: 200 },
        { name: '📊 The Auditor', health: 700, speed: 30, color: 0x6600ff, reward: 200 }
    ],

    // Difficulty Settings
    DIFFICULTY: {
        NORMAL: {
            name: 'normal',
            label: '😊 Normal',
            multiplier: 1.0,
            color: 0x00ff00
        },
        HARD: {
            name: 'hard',
            label: '😅 Hard',
            multiplier: 1.5,
            color: 0xffaa00
        },
        NIGHTMARE: {
            name: 'nightmare',
            label: '💀 Nightmare',
            multiplier: 2.0,
            color: 0xff0000
        }
    },

    // Combo System
    COMBO: {
        TIMEOUT: 3000, // milliseconds
        MILESTONES: {
            5: { msg: 'Nice!', color: '#ffaa00', multiplier: 1.5 },
            10: { msg: 'Great!', color: '#ff6600', multiplier: 2 },
            20: { msg: 'Awesome!', color: '#ff00ff', multiplier: 3 },
            30: { msg: 'Incredible!', color: '#00ffff', multiplier: 4 },
            50: { msg: 'LEGENDARY!', color: '#ffff00', multiplier: 5 },
            100: { msg: 'GODLIKE!!!', color: '#ff0000', multiplier: 5 }
        }
    },

    // Power-up Settings
    POWER_UPS: {
        DESPAWN_TIME: 15000, // milliseconds
        DROP_CHANCE: 0.15,
        BOSS_DROP_CHANCE: 1.0,
        COLLECTION_RADIUS: 20,
        SIZE: 12
    },

    // Sound Settings
    SOUND: {
        DEFAULT_MUSIC_VOLUME: 0.3,
        DEFAULT_SFX_VOLUME: 0.5,
        SOUNDS: {
            shoot: { freq: 440, duration: 0.1, type: 'square' },
            hit: { freq: 220, duration: 0.15, type: 'sawtooth' },
            death: { freq: 110, duration: 0.3, type: 'triangle' },
            collect: { freq: 880, duration: 0.2, type: 'sine' },
            victory: { freq: 660, duration: 0.4, type: 'sine' },
            place: { freq: 550, duration: 0.1, type: 'square' },
            wave: { freq: 330, duration: 0.5, type: 'triangle' },
            error: { freq: 150, duration: 0.2, type: 'sawtooth' },
            upgrade: { freq: 990, duration: 0.3, type: 'sine' },
            boss: { freq: 100, duration: 1.0, type: 'sawtooth' }
        }
    },

    // Particle Effects
    PARTICLES: {
        EXPLOSION_COUNT: 20,
        SPARKLE_COUNT: 10,
        TRAIL_SIZE: 5,
        TRAIL_ALPHA: 0.6,
        SHAKE_DURATION: 200,
        SHAKE_INTENSITY: 0.01
    },

    // Tutorial Settings
    TUTORIAL: {
        BOX_WIDTH: 600,
        BOX_HEIGHT: 200,
        OVERLAY_ALPHA: 0.7,
        OVERLAY_COLOR: 0x000000,
        BOX_COLOR: 0x1a1a2e,
        BORDER_COLOR: 0x00ff00,
        BORDER_WIDTH: 3
    },

    // UI Colors
    COLORS: {
        PRIMARY: '#00ff00',
        SECONDARY: '#ffaa00',
        DANGER: '#ff0000',
        INFO: '#00aaff',
        WARNING: '#ff6600',
        SUCCESS: '#00cc00',
        TEXT: '#ffffff',
        TEXT_DIM: '#888888',
        BACKGROUND_DARK: '#1a1a2e',
        BACKGROUND_DARKER: '#0a0a1a',
        BUTTON_BG: '#333333',
        BUTTON_HOVER: '#555555'
    },

    // Humor Messages
    HUMOR: {
        GAME_OVER: [
            '💀 "It compiles on my machine..."',
            '☠️ Killed by a null pointer exception',
            '💀 Forgot to save before force push',
            '☠️ Deployed on Friday at 5pm',
            '💀 Merged without reviewing',
            '☠️ Deleted node_modules without backup',
            '💀 Pushed secrets to GitHub',
            '☠️ Updated dependencies without testing'
        ],
        SPAWN_MESSAGES: [
            'A wild MERGE CONFLICT appears!',
            'Bug spotted! It\'s got 3 heads!',
            'npm packages everywhere!',
            'Someone force-pushed to main!',
            'Your tests are failing... again!',
            'Production is down! 🔥',
            'The intern deleted the database!',
            'Circular dependency detected!',
            'It works on my machine!',
            'Forgot to git pull before push!',
            'Pushed to main at 5pm Friday!',
            'Undefined is not a function!'
        ],
        MENU_QUOTES: [
            '"Works on my machine" - Famous Last Words',
            '"It\'s not a bug, it\'s a feature" - Survivor Chronicles',
            '"Just one more merge..." - Epitaph',
            '"I\'ll fix it in production" - Legends Never Die',
            '"Who needs tests anyway?" - Natural Selection'
        ]
    },

    // Storage Keys
    STORAGE: {
        GAME_DATA: 'gitgame_data'
    }
};

// Helper function to get difficulty config
export function getDifficultyConfig(difficulty) {
    const configs = {
        normal: GameConfig.DIFFICULTY.NORMAL,
        hard: GameConfig.DIFFICULTY.HARD,
        nightmare: GameConfig.DIFFICULTY.NIGHTMARE
    };
    return configs[difficulty] || GameConfig.DIFFICULTY.NORMAL;
}

// Helper function to scale value by difficulty
export function scaleByDifficulty(baseValue, difficulty) {
    const config = getDifficultyConfig(difficulty);
    return baseValue * config.multiplier;
}
