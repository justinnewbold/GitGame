// Mutation/Modifier System - Weekly rotating challenge modifiers

import { gameData } from './GameData.js';

export default class MutationSystem {
    constructor() {
        this.initializeMutations();
    }

    initializeMutations() {
        if (!gameData.data.mutations) {
            gameData.data.mutations = {
                currentWeek: this.getCurrentWeek(),
                activeModifiers: [],
                unlockedMutations: [],
                completedWeeks: [],
                stats: {
                    totalModifiersPlayed: 0,
                    favoriteModifier: null,
                    hardestCompleted: null
                }
            };
            gameData.save();
        }

        // Check if week has changed
        this.checkWeeklyRotation();
    }

    // Get current week number
    getCurrentWeek() {
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 0);
        const diff = now - start;
        const oneWeek = 1000 * 60 * 60 * 24 * 7;
        return Math.floor(diff / oneWeek);
    }

    // Check and rotate weekly modifiers
    checkWeeklyRotation() {
        const mutations = gameData.data.mutations;
        const currentWeek = this.getCurrentWeek();

        if (mutations.currentWeek !== currentWeek) {
            // New week! Rotate modifiers
            mutations.currentWeek = currentWeek;
            mutations.activeModifiers = this.generateWeeklyModifiers(currentWeek);
            gameData.save();
        } else if (mutations.activeModifiers.length === 0) {
            // First time, generate modifiers
            mutations.activeModifiers = this.generateWeeklyModifiers(currentWeek);
            gameData.save();
        }
    }

    // Generate weekly modifiers based on week number
    generateWeeklyModifiers(weekNumber) {
        const seed = this.seedRandom(weekNumber);
        const allMutations = this.getAllMutations();

        // Select 5 random mutations for the week
        const selected = [];
        const used = new Set();

        for (let i = 0; i < 5; i++) {
            let mutation;
            let attempts = 0;

            do {
                const index = Math.floor(seed() * allMutations.length);
                mutation = allMutations[index];
                attempts++;
            } while (used.has(mutation.id) && attempts < 50);

            if (!used.has(mutation.id)) {
                selected.push({
                    ...mutation,
                    active: i === 0 // First one is active by default
                });
                used.add(mutation.id);
            }
        }

        return selected;
    }

    // Seeded random for consistent weekly mutations
    seedRandom(seed) {
        let value = seed;
        return function() {
            value = (value * 9301 + 49297) % 233280;
            return value / 233280;
        };
    }

    // Get all available mutations
    getAllMutations() {
        return [
            // Combat mutations
            {
                id: 'glass_cannon',
                name: 'Glass Cannon',
                description: 'Deal 3x damage but have 1 HP',
                category: 'combat',
                difficulty: 'extreme',
                icon: '💎',
                effects: {
                    damageMultiplier: 3,
                    health: 1
                },
                scoreMultiplier: 2.5
            },
            {
                id: 'berserker',
                name: 'Berserker',
                description: 'Gain damage as health decreases',
                category: 'combat',
                difficulty: 'hard',
                icon: '⚔️',
                effects: {
                    berserkerMode: true
                },
                scoreMultiplier: 1.5
            },
            {
                id: 'pacifist',
                name: 'Pacifist',
                description: 'Cannot attack, must avoid all enemies',
                category: 'combat',
                difficulty: 'extreme',
                icon: '🕊️',
                effects: {
                    noAttack: true
                },
                scoreMultiplier: 3.0
            },
            {
                id: 'one_shot',
                name: 'One Shot',
                description: 'You and enemies die in one hit',
                category: 'combat',
                difficulty: 'very_hard',
                icon: '🎯',
                effects: {
                    oneHitKill: true
                },
                scoreMultiplier: 2.0
            },

            // Movement mutations
            {
                id: 'speed_demon',
                name: 'Speed Demon',
                description: 'Move 3x faster',
                category: 'movement',
                difficulty: 'medium',
                icon: '⚡',
                effects: {
                    speedMultiplier: 3
                },
                scoreMultiplier: 1.3
            },
            {
                id: 'snail_pace',
                name: 'Snail Pace',
                description: 'Move 50% slower',
                category: 'movement',
                difficulty: 'hard',
                icon: '🐌',
                effects: {
                    speedMultiplier: 0.5
                },
                scoreMultiplier: 1.8
            },
            {
                id: 'teleporter',
                name: 'Teleporter',
                description: 'Teleport instead of walking',
                category: 'movement',
                difficulty: 'medium',
                icon: '✨',
                effects: {
                    teleportMode: true
                },
                scoreMultiplier: 1.4
            },
            {
                id: 'ice_floor',
                name: 'Ice Floor',
                description: 'Slippery movement, no friction',
                category: 'movement',
                difficulty: 'hard',
                icon: '❄️',
                effects: {
                    noFriction: true
                },
                scoreMultiplier: 1.7
            },

            // Visual mutations
            {
                id: 'darkness',
                name: 'Darkness',
                description: 'Very limited visibility',
                category: 'visual',
                difficulty: 'very_hard',
                icon: '🌑',
                effects: {
                    visibility: 0.2
                },
                scoreMultiplier: 2.2
            },
            {
                id: 'inverted',
                name: 'Inverted',
                description: 'All controls are reversed',
                category: 'visual',
                difficulty: 'hard',
                icon: '🔄',
                effects: {
                    invertedControls: true
                },
                scoreMultiplier: 1.9
            },
            {
                id: 'drunk',
                name: 'Drunk Mode',
                description: 'Wavy screen and imprecise movement',
                category: 'visual',
                difficulty: 'medium',
                icon: '🍺',
                effects: {
                    drunkMode: true
                },
                scoreMultiplier: 1.5
            },
            {
                id: 'big_head',
                name: 'Big Head',
                description: 'Everyone has comically large heads',
                category: 'visual',
                difficulty: 'easy',
                icon: '🤪',
                effects: {
                    bigHeadMode: true
                },
                scoreMultiplier: 1.1
            },

            // Enemy mutations
            {
                id: 'horde',
                name: 'Horde Mode',
                description: '5x more enemies',
                category: 'enemies',
                difficulty: 'very_hard',
                icon: '👥',
                effects: {
                    enemySpawnMultiplier: 5
                },
                scoreMultiplier: 2.5
            },
            {
                id: 'boss_rush',
                name: 'Boss Rush',
                description: 'Only boss enemies spawn',
                category: 'enemies',
                difficulty: 'extreme',
                icon: '👹',
                effects: {
                    onlyBosses: true
                },
                scoreMultiplier: 3.0
            },
            {
                id: 'fast_enemies',
                name: 'Sonic Enemies',
                description: 'Enemies move 3x faster',
                category: 'enemies',
                difficulty: 'hard',
                icon: '💨',
                effects: {
                    enemySpeedMultiplier: 3
                },
                scoreMultiplier: 1.8
            },
            {
                id: 'tank_enemies',
                name: 'Tank Enemies',
                description: 'Enemies have 5x health',
                category: 'enemies',
                difficulty: 'very_hard',
                icon: '🛡️',
                effects: {
                    enemyHealthMultiplier: 5
                },
                scoreMultiplier: 2.0
            },

            // Resource mutations
            {
                id: 'no_powerups',
                name: 'Raw Skill',
                description: 'No power-ups spawn',
                category: 'resources',
                difficulty: 'hard',
                icon: '🚫',
                effects: {
                    noPowerups: true
                },
                scoreMultiplier: 1.8
            },
            {
                id: 'powerup_rain',
                name: 'Powerup Rain',
                description: '10x power-up spawn rate',
                category: 'resources',
                difficulty: 'easy',
                icon: '🌧️',
                effects: {
                    powerupMultiplier: 10
                },
                scoreMultiplier: 0.8
            },
            {
                id: 'random_powerups',
                name: 'Random Chaos',
                description: 'Power-ups change randomly',
                category: 'resources',
                difficulty: 'medium',
                icon: '🎲',
                effects: {
                    randomPowerups: true
                },
                scoreMultiplier: 1.3
            },

            // Time mutations
            {
                id: 'bullet_time',
                name: 'Bullet Time',
                description: 'Everything moves in slow motion',
                category: 'time',
                difficulty: 'easy',
                icon: '⏱️',
                effects: {
                    timeScale: 0.5
                },
                scoreMultiplier: 0.9
            },
            {
                id: 'hyperspeed',
                name: 'Hyperspeed',
                description: 'Everything moves 2x faster',
                category: 'time',
                difficulty: 'hard',
                icon: '⚡',
                effects: {
                    timeScale: 2.0
                },
                scoreMultiplier: 1.7
            },
            {
                id: 'time_limit',
                name: 'Race Against Time',
                description: 'Strict 5 minute time limit',
                category: 'time',
                difficulty: 'medium',
                icon: '⏰',
                effects: {
                    timeLimit: 300
                },
                scoreMultiplier: 1.5
            },

            // Special mutations
            {
                id: 'permadeath',
                name: 'Permadeath',
                description: 'One life only, no continues',
                category: 'special',
                difficulty: 'extreme',
                icon: '💀',
                effects: {
                    permadeath: true
                },
                scoreMultiplier: 3.5
            },
            {
                id: 'vampire',
                name: 'Vampiric',
                description: 'Heal on kill, no health pickups',
                category: 'special',
                difficulty: 'medium',
                icon: '🧛',
                effects: {
                    vampiric: true,
                    noHealthPickups: true
                },
                scoreMultiplier: 1.4
            },
            {
                id: 'cursed',
                name: 'Cursed',
                description: 'Random negative effects trigger',
                category: 'special',
                difficulty: 'hard',
                icon: '👻',
                effects: {
                    cursed: true
                },
                scoreMultiplier: 2.0
            },
            {
                id: 'blessed',
                name: 'Blessed',
                description: 'Random positive effects trigger',
                category: 'special',
                difficulty: 'easy',
                icon: '😇',
                effects: {
                    blessed: true
                },
                scoreMultiplier: 0.9
            },

            // Fun mutations
            {
                id: 'gravity_flip',
                name: 'Gravity Flip',
                description: 'Gravity reverses randomly',
                category: 'fun',
                difficulty: 'medium',
                icon: '🔃',
                effects: {
                    gravityFlip: true
                },
                scoreMultiplier: 1.4
            },
            {
                id: 'mirror_world',
                name: 'Mirror World',
                description: 'Everything is mirrored',
                category: 'fun',
                difficulty: 'medium',
                icon: '🪞',
                effects: {
                    mirrored: true
                },
                scoreMultiplier: 1.3
            },
            {
                id: 'rainbow',
                name: 'Rainbow Mode',
                description: 'Everything is rainbow colored',
                category: 'fun',
                difficulty: 'easy',
                icon: '🌈',
                effects: {
                    rainbow: true
                },
                scoreMultiplier: 1.0
            },
            {
                id: 'party',
                name: 'Party Mode',
                description: 'Confetti and celebration effects',
                category: 'fun',
                difficulty: 'easy',
                icon: '🎉',
                effects: {
                    partyMode: true
                },
                scoreMultiplier: 1.0
            }
        ];
    }

    // Get active weekly modifiers
    getWeeklyModifiers() {
        this.checkWeeklyRotation();
        return gameData.data.mutations.activeModifiers;
    }

    // Toggle modifier active state
    toggleModifier(modifierId) {
        const mutations = gameData.data.mutations;
        const modifier = mutations.activeModifiers.find(m => m.id === modifierId);

        if (!modifier) {
            return { success: false, message: 'Modifier not found!' };
        }

        modifier.active = !modifier.active;
        gameData.save();

        return {
            success: true,
            active: modifier.active,
            modifier: modifier
        };
    }

    // Get combined effects from all active modifiers
    getCombinedEffects() {
        const mutations = gameData.data.mutations;
        const activeModifiers = mutations.activeModifiers.filter(m => m.active);

        const combined = {
            effects: {},
            scoreMultiplier: 1.0,
            modifiers: activeModifiers
        };

        activeModifiers.forEach(modifier => {
            // Merge effects
            Object.assign(combined.effects, modifier.effects);

            // Multiply score multipliers
            combined.scoreMultiplier *= modifier.scoreMultiplier;
        });

        return combined;
    }

    // Complete a run with modifiers
    completeModifierRun(score, modifiers) {
        const mutations = gameData.data.mutations;

        const weekKey = `week_${mutations.currentWeek}`;

        if (!mutations.completedWeeks.includes(weekKey)) {
            mutations.completedWeeks.push(weekKey);
        }

        mutations.stats.totalModifiersPlayed += modifiers.length;

        // Track favorite modifier
        modifiers.forEach(modifier => {
            // Simple tracking - in real game would be more sophisticated
            mutations.stats.favoriteModifier = modifier.id;
        });

        gameData.save();

        return {
            success: true,
            score: score,
            modifiersUsed: modifiers.length
        };
    }

    // Unlock mutation for custom use
    unlockMutation(mutationId) {
        const mutations = gameData.data.mutations;

        if (mutations.unlockedMutations.includes(mutationId)) {
            return { success: false, message: 'Already unlocked!' };
        }

        mutations.unlockedMutations.push(mutationId);
        gameData.save();

        return {
            success: true,
            message: 'Mutation unlocked for custom games!'
        };
    }

    // Get mutation by ID
    getMutation(mutationId) {
        const allMutations = this.getAllMutations();
        return allMutations.find(m => m.id === mutationId);
    }

    // Get mutations by category
    getMutationsByCategory(category) {
        const allMutations = this.getAllMutations();
        return allMutations.filter(m => m.category === category);
    }

    // Get mutations by difficulty
    getMutationsByDifficulty(difficulty) {
        const allMutations = this.getAllMutations();
        return allMutations.filter(m => m.difficulty === difficulty);
    }

    // Get all categories
    getCategories() {
        return [
            { id: 'combat', name: 'Combat', icon: '⚔️' },
            { id: 'movement', name: 'Movement', icon: '🏃' },
            { id: 'visual', name: 'Visual', icon: '👁️' },
            { id: 'enemies', name: 'Enemies', icon: '👥' },
            { id: 'resources', name: 'Resources', icon: '⚡' },
            { id: 'time', name: 'Time', icon: '⏱️' },
            { id: 'special', name: 'Special', icon: '✨' },
            { id: 'fun', name: 'Fun', icon: '🎉' }
        ];
    }

    // Get stats
    getStats() {
        return gameData.data.mutations.stats;
    }

    // Get days until next rotation
    getDaysUntilRotation() {
        const now = new Date();
        const nextMonday = new Date(now);
        nextMonday.setDate(nextMonday.getDate() + (7 - nextMonday.getDay() + 1) % 7);
        nextMonday.setHours(0, 0, 0, 0);

        const diff = nextMonday - now;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        return { days, hours };
    }
}

// Singleton
export const mutationSystem = new MutationSystem();
