// Daily/Weekly Runs - Seeded roguelike challenges with leaderboards

import { gameData } from './GameData.js';

export default class DailyWeeklyRuns {
    constructor() {
        this.initializeRuns();
    }

    initializeRuns() {
        if (!gameData.data.runs) {
            gameData.data.runs = {
                daily: {
                    lastPlayedDate: null,
                    lastSeed: null,
                    bestScore: 0,
                    attempts: 0,
                    completions: 0,
                    history: []
                },
                weekly: {
                    lastPlayedDate: null,
                    lastSeed: null,
                    bestScore: 0,
                    attempts: 0,
                    completions: 0,
                    history: []
                },
                totalRuns: 0,
                perfectRuns: 0
            };
            gameData.save();
        }
    }

    // Generate daily seed (same for all players on that day)
    getDailySeed() {
        const today = new Date();
        const dateString = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
        return this.hashCode(dateString);
    }

    // Generate weekly seed
    getWeeklySeed() {
        const today = new Date();
        const weekNumber = this.getWeekNumber(today);
        const weekString = `${today.getFullYear()}-W${weekNumber}`;
        return this.hashCode(weekString);
    }

    // Simple hash function for seeds
    hashCode(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return Math.abs(hash);
    }

    // Get week number of year
    getWeekNumber(date) {
        const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    }

    // Check if daily run is available
    isDailyRunAvailable() {
        const runs = gameData.data.runs;
        const todaySeed = this.getDailySeed();

        // If no run today, or seed has changed (new day)
        return !runs.daily.lastPlayedDate || runs.daily.lastSeed !== todaySeed;
    }

    // Check if weekly run is available
    isWeeklyRunAvailable() {
        const runs = gameData.data.runs;
        const weekSeed = this.getWeeklySeed();

        return !runs.weekly.lastPlayedDate || runs.weekly.lastSeed !== weekSeed;
    }

    // Get daily run configuration
    getDailyRunConfig() {
        const seed = this.getDailySeed();
        const rng = this.seededRandom(seed);

        // Generate modifiers based on seed
        const modifiers = this.generateModifiers(rng, 3, 'daily');

        return {
            type: 'daily',
            seed: seed,
            mode: this.selectMode(rng),
            difficulty: this.selectDifficulty(rng, 'daily'),
            modifiers: modifiers,
            rewards: this.calculateRewards('daily'),
            leaderboard: this.getLeaderboard('daily', seed)
        };
    }

    // Get weekly run configuration
    getWeeklyRunConfig() {
        const seed = this.getWeeklySeed();
        const rng = this.seededRandom(seed);

        const modifiers = this.generateModifiers(rng, 5, 'weekly');

        return {
            type: 'weekly',
            seed: seed,
            mode: this.selectMode(rng),
            difficulty: this.selectDifficulty(rng, 'weekly'),
            modifiers: modifiers,
            rewards: this.calculateRewards('weekly'),
            leaderboard: this.getLeaderboard('weekly', seed)
        };
    }

    // Seeded random number generator
    seededRandom(seed) {
        let value = seed;
        return function() {
            value = (value * 9301 + 49297) % 233280;
            return value / 233280;
        };
    }

    // Select game mode based on seed
    selectMode(rng) {
        const modes = [
            'gitSurvivor',
            'codeDefense',
            'prRush',
            'devCommander',
            'debugDungeon',
            'refactorRace',
            'sprintSurvivor',
            'bugBounty',
            'legacyExcavator'
        ];

        const index = Math.floor(rng() * modes.length);
        return modes[index];
    }

    // Select difficulty
    selectDifficulty(rng, type) {
        if (type === 'daily') {
            const difficulties = ['normal', 'hard', 'hard', 'nightmare'];
            return difficulties[Math.floor(rng() * difficulties.length)];
        } else {
            // Weekly runs are always harder
            const difficulties = ['hard', 'hard', 'nightmare', 'nightmare'];
            return difficulties[Math.floor(rng() * difficulties.length)];
        }
    }

    // Generate modifiers/mutations
    generateModifiers(rng, count, type) {
        const allModifiers = [
            // Positive modifiers
            {
                id: 'double_damage',
                name: 'Glass Cannon',
                description: '2x damage, but take 2x damage',
                type: 'mixed',
                icon: '⚡',
                effects: { damageMultiplier: 2, damageTaken: 2 }
            },
            {
                id: 'speed_boost',
                name: 'Caffeine Rush',
                description: 'Move 50% faster',
                type: 'positive',
                icon: '☕',
                effects: { speedMultiplier: 1.5 }
            },
            {
                id: 'lucky',
                name: 'Lucky Day',
                description: '2x power-up spawn rate',
                type: 'positive',
                icon: '🍀',
                effects: { luckMultiplier: 2 }
            },
            {
                id: 'tank',
                name: 'Tank Mode',
                description: '3x health, 50% slower',
                type: 'mixed',
                icon: '🛡️',
                effects: { healthMultiplier: 3, speedMultiplier: 0.5 }
            },
            {
                id: 'ricochet',
                name: 'Ricochet Bullets',
                description: 'Bullets bounce off walls',
                type: 'positive',
                icon: '🔄',
                effects: { ricochet: true }
            },

            // Negative modifiers
            {
                id: 'one_hp',
                name: 'One Hit Wonder',
                description: 'Start with 1 HP',
                type: 'negative',
                icon: '💀',
                effects: { startingHealth: 1 }
            },
            {
                id: 'no_powerups',
                name: 'Raw Skill',
                description: 'No power-ups spawn',
                type: 'negative',
                icon: '🚫',
                effects: { powerupsDisabled: true }
            },
            {
                id: 'darkness',
                name: 'Darkness',
                description: 'Limited visibility',
                type: 'negative',
                icon: '🌑',
                effects: { visibility: 0.3 }
            },
            {
                id: 'time_pressure',
                name: 'Race Against Time',
                description: 'Strict time limits',
                type: 'negative',
                icon: '⏱️',
                effects: { timeMultiplier: 0.5 }
            },
            {
                id: 'chaos',
                name: 'Chaos Mode',
                description: 'Random effects every 10 seconds',
                type: 'chaotic',
                icon: '🎲',
                effects: { chaos: true }
            },

            // Unique modifiers
            {
                id: 'big_head',
                name: 'Big Head Mode',
                description: 'Everyone has big heads',
                type: 'fun',
                icon: '🤪',
                effects: { bigHead: true }
            },
            {
                id: 'mirror',
                name: 'Mirror World',
                description: 'Everything is flipped',
                type: 'chaotic',
                icon: '🪞',
                effects: { mirrored: true }
            },
            {
                id: 'low_gravity',
                name: 'Low Gravity',
                description: 'Floaty physics',
                type: 'fun',
                icon: '🌙',
                effects: { gravity: 0.3 }
            },
            {
                id: 'explosive',
                name: 'Explosive Ending',
                description: 'Enemies explode on death',
                type: 'positive',
                icon: '💥',
                effects: { explosive: true }
            },
            {
                id: 'vampire',
                name: 'Vampiric',
                description: 'Heal on kill',
                type: 'positive',
                icon: '🧛',
                effects: { lifesteal: 0.2 }
            },
            {
                id: 'freeze',
                name: 'Ice Age',
                description: 'Enemies move 50% slower',
                type: 'positive',
                icon: '❄️',
                effects: { enemySpeedMultiplier: 0.5 }
            },
            {
                id: 'giant',
                name: 'Giant Mode',
                description: 'You are 2x bigger',
                type: 'mixed',
                icon: '🗿',
                effects: { sizeMultiplier: 2 }
            },
            {
                id: 'tiny',
                name: 'Tiny Mode',
                description: 'You are 0.5x smaller',
                type: 'mixed',
                icon: '🐜',
                effects: { sizeMultiplier: 0.5 }
            },
            {
                id: 'rainbow',
                name: 'Rainbow Trail',
                description: 'Leave rainbow trail that damages enemies',
                type: 'positive',
                icon: '🌈',
                effects: { rainbowTrail: true }
            },
            {
                id: 'magnet',
                name: 'Magnetic',
                description: 'Auto-collect nearby items',
                type: 'positive',
                icon: '🧲',
                effects: { magnet: true }
            }
        ];

        const selected = [];
        const used = new Set();

        for (let i = 0; i < count; i++) {
            let modifier;
            let attempts = 0;

            do {
                const index = Math.floor(rng() * allModifiers.length);
                modifier = allModifiers[index];
                attempts++;
            } while (used.has(modifier.id) && attempts < 50);

            if (!used.has(modifier.id)) {
                selected.push(modifier);
                used.add(modifier.id);
            }
        }

        return selected;
    }

    // Calculate rewards based on type
    calculateRewards(type) {
        if (type === 'daily') {
            return {
                participation: { coins: 1000, xp: 500 },
                top100: { coins: 5000, xp: 2000, title: 'Daily Top 100' },
                top10: { coins: 10000, xp: 5000, title: 'Daily Top 10', skin: 'daily_champion' },
                top1: { coins: 25000, xp: 10000, title: 'Daily Winner', skin: 'daily_king' }
            };
        } else {
            return {
                participation: { coins: 5000, xp: 2000 },
                top100: { coins: 15000, xp: 7000, title: 'Weekly Top 100' },
                top10: { coins: 30000, xp: 15000, title: 'Weekly Top 10', skin: 'weekly_champion' },
                top1: { coins: 100000, xp: 50000, title: 'Weekly Winner', skin: 'weekly_king', exclusive: true }
            };
        }
    }

    // Start a run
    startRun(type) {
        const runs = gameData.data.runs;
        const runData = runs[type];

        if (type === 'daily' && !this.isDailyRunAvailable()) {
            return { success: false, message: 'Daily run already completed!' };
        }

        if (type === 'weekly' && !this.isWeeklyRunAvailable()) {
            return { success: false, message: 'Weekly run already completed!' };
        }

        const config = type === 'daily' ? this.getDailyRunConfig() : this.getWeeklyRunConfig();

        runData.lastPlayedDate = new Date().toISOString();
        runData.lastSeed = config.seed;
        runData.attempts++;
        runs.totalRuns++;

        gameData.save();

        return {
            success: true,
            config: config,
            message: `${type === 'daily' ? 'Daily' : 'Weekly'} run started!`
        };
    }

    // Complete a run
    completeRun(type, score, survived = true) {
        const runs = gameData.data.runs;
        const runData = runs[type];

        if (survived) {
            runData.completions++;
        }

        // Update best score
        if (score > runData.bestScore) {
            runData.bestScore = score;
        }

        // Check for perfect run
        if (survived && score === this.getPerfectScore(type)) {
            runs.perfectRuns++;
        }

        // Add to history
        runData.history.push({
            seed: runData.lastSeed,
            score: score,
            survived: survived,
            date: new Date().toISOString(),
            leaderboardRank: this.calculateRank(score, type)
        });

        // Keep only last 50 runs in history
        if (runData.history.length > 50) {
            runData.history = runData.history.slice(-50);
        }

        // Calculate rewards
        const rewards = this.calculateRunRewards(type, score, survived);

        // Apply rewards
        if (rewards.coins) {
            gameData.data.stats.totalScore += rewards.coins;
        }

        if (rewards.skin && gameData.data.customization) {
            if (!gameData.data.customization.unlockedSkins.includes(rewards.skin)) {
                gameData.data.customization.unlockedSkins.push(rewards.skin);
            }
        }

        if (rewards.title && gameData.data.titles) {
            if (!gameData.data.titles.includes(rewards.title)) {
                gameData.data.titles.push(rewards.title);
            }
        }

        gameData.save();

        return {
            score: score,
            survived: survived,
            bestScore: runData.bestScore,
            rewards: rewards,
            rank: this.calculateRank(score, type)
        };
    }

    // Calculate run rewards
    calculateRunRewards(type, score, survived) {
        const rewardTiers = this.calculateRewards(type);
        const rank = this.calculateRank(score, type);

        if (rank === 1) {
            return rewardTiers.top1;
        } else if (rank <= 10) {
            return rewardTiers.top10;
        } else if (rank <= 100) {
            return rewardTiers.top100;
        } else {
            return rewardTiers.participation;
        }
    }

    // Calculate leaderboard rank (mock)
    calculateRank(score, type) {
        // In a real game, this would query the server
        // For now, simulate based on score
        if (score >= 10000) return Math.floor(Math.random() * 10) + 1;
        if (score >= 7500) return Math.floor(Math.random() * 50) + 10;
        if (score >= 5000) return Math.floor(Math.random() * 100) + 50;
        return Math.floor(Math.random() * 1000) + 100;
    }

    // Get perfect score threshold
    getPerfectScore(type) {
        return type === 'daily' ? 15000 : 30000;
    }

    // Get leaderboard (mock)
    getLeaderboard(type, seed) {
        return this.generateMockLeaderboard(type, seed);
    }

    generateMockLeaderboard(type, seed) {
        const leaderboard = [];
        const names = [
            'SpeedRunner', 'ProGamer', 'CodeNinja', 'BugSlayer',
            'GitMaster', 'DevOpsGod', 'ScriptKid', 'MergeKing',
            'RefactorQueen', 'DebugWizard'
        ];

        const baseScore = type === 'daily' ? 15000 : 30000;

        for (let i = 0; i < 100; i++) {
            leaderboard.push({
                rank: i + 1,
                name: names[Math.floor(Math.random() * names.length)] + Math.floor(Math.random() * 999),
                score: Math.floor(baseScore - (i * 100) + (Math.random() * 200)),
                survived: true,
                country: ['US', 'UK', 'JP', 'KR', 'DE', 'FR'][Math.floor(Math.random() * 6)]
            });
        }

        return leaderboard;
    }

    // Get run statistics
    getRunStats() {
        const runs = gameData.data.runs;

        return {
            daily: {
                attempts: runs.daily.attempts,
                completions: runs.daily.completions,
                bestScore: runs.daily.bestScore,
                completionRate: runs.daily.attempts > 0 ?
                    (runs.daily.completions / runs.daily.attempts) * 100 : 0,
                available: this.isDailyRunAvailable()
            },
            weekly: {
                attempts: runs.weekly.attempts,
                completions: runs.weekly.completions,
                bestScore: runs.weekly.bestScore,
                completionRate: runs.weekly.attempts > 0 ?
                    (runs.weekly.completions / runs.weekly.attempts) * 100 : 0,
                available: this.isWeeklyRunAvailable()
            },
            total: {
                runs: runs.totalRuns,
                perfectRuns: runs.perfectRuns
            }
        };
    }

    // Get time until next daily run
    getTimeUntilNextDaily() {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);

        const diff = tomorrow - now;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        return {
            hours: hours,
            minutes: minutes,
            totalSeconds: Math.floor(diff / 1000)
        };
    }

    // Get time until next weekly run
    getTimeUntilNextWeekly() {
        const now = new Date();
        const nextMonday = new Date(now);
        nextMonday.setDate(nextMonday.getDate() + (7 - nextMonday.getDay() + 1) % 7);
        nextMonday.setHours(0, 0, 0, 0);

        const diff = nextMonday - now;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        return {
            days: days,
            hours: hours,
            totalSeconds: Math.floor(diff / 1000)
        };
    }
}

// Singleton
export const dailyWeeklyRuns = new DailyWeeklyRuns();
