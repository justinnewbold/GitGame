// Global game data manager - tracks achievements, stats, and progression
// Uses localStorage for persistence

export default class GameData {
    constructor() {
        this.storageKey = 'gitgame_data';
        this.data = this.load();
    }

    load() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (saved) {
                const parsed = JSON.parse(saved);
                // Validate the structure and merge with defaults to ensure all fields exist
                return this.mergeWithDefaults(parsed);
            }
        } catch (e) {
            console.error('Failed to load game data, using defaults:', e.message);
            // If parsing fails, clear corrupted data
            this.clearCorruptedData();
        }

        // Default data structure
        return this.getDefaultData();
    }

    getDefaultData() {
        return {
            stats: {
                gamesPlayed: 0,
                totalScore: 0,
                totalTimeplayed: 0,
                gitSurvivor: { highScore: 0, gamesPlayed: 0, enemiesKilled: 0 },
                codeDefense: { highWave: 0, gamesPlayed: 0, towersPlaced: 0 },
                prRush: { bestAccuracy: 0, gamesPlayed: 0, prsReviewed: 0 },
                devCommander: { maxSprints: 0, gamesPlayed: 0, tasksCompleted: 0 },
                debugDungeon: { highScore: 0, gamesPlayed: 0, bugsFixed: 0 },
                refactorRace: { highScore: 0, gamesPlayed: 0, totalRefactors: 0 },
                sprintSurvivor: { highScore: 0, gamesPlayed: 0, maxDistance: 0 },
                bugBounty: { levelsCompleted: 0, totalStars: 0 },
                legacyExcavator: { highScore: 0, gamesPlayed: 0, maxDepth: 0, artifactsFound: 0 },
                bossRush: { highScore: 0, gamesPlayed: 0, bossesDefeated: 0 }
            },
            achievements: [],
            unlockedContent: {
                difficulty: ['normal'], // normal, hard, nightmare
                skins: ['default'],
                powerups: []
            },
            settings: {
                soundEnabled: true,
                musicEnabled: true,
                masterVolume: 1.0,
                musicVolume: 1.0,
                sfxVolume: 1.0,
                difficulty: 'normal'
            }
        };
    }

    save() {
        try {
            const serialized = JSON.stringify(this.data);
            // Check if serialization worked and data isn't too large
            if (serialized && serialized.length < 5000000) { // 5MB limit
                localStorage.setItem(this.storageKey, serialized);
                return true;
            } else {
                console.error('Game data too large to save');
                return false;
            }
        } catch (e) {
            console.error('Failed to save game data:', e.message);
            // Check for quota exceeded error
            if (e.name === 'QuotaExceededError') {
                console.error('Storage quota exceeded. Consider clearing old data.');
            }
            return false;
        }
    }

    // Merge saved data with defaults to handle missing fields
    mergeWithDefaults(saved) {
        const defaults = this.getDefaultData();

        // Deep merge function
        const deepMerge = (target, source) => {
            const result = { ...target };
            for (const key in source) {
                if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                    result[key] = deepMerge(target[key] || {}, source[key]);
                } else {
                    result[key] = source[key] !== undefined ? source[key] : target[key];
                }
            }
            return result;
        };

        return deepMerge(defaults, saved);
    }

    // Clear corrupted localStorage data
    clearCorruptedData() {
        try {
            localStorage.removeItem(this.storageKey);
        } catch (e) {
            console.error('Failed to clear corrupted data:', e.message);
        }
    }

    // Achievement definitions
    getAchievements() {
        return [
            { id: 'first_blood', name: 'First Blood', desc: 'Kill your first bug', icon: '🐛' },
            { id: 'survivor', name: 'Survivor', desc: 'Survive 100 enemies in Git Survivor', icon: '💪' },
            { id: 'tower_master', name: 'Tower Master', desc: 'Place 50 towers', icon: '🏰' },
            { id: 'pr_pro', name: 'PR Pro', desc: 'Review 100 PRs', icon: '👀' },
            { id: 'perfect_review', name: 'Perfect Review', desc: 'Get 100% accuracy in PR Rush', icon: '💯' },
            { id: 'team_player', name: 'Team Player', desc: 'Hire 10 developers', icon: '👥' },
            { id: 'sprint_master', name: 'Sprint Master', desc: 'Complete 10 sprints', icon: '🏃' },
            { id: 'workaholic', name: 'Workaholic', desc: 'Play 50 games total', icon: '😅' },
            { id: 'coffee_addict', name: 'Coffee Addict', desc: 'Buy coffee 20 times', icon: '☕' },
            { id: 'boss_slayer', name: 'Boss Slayer', desc: 'Defeat a boss enemy', icon: '⚔️' },
            { id: 'no_bugs', name: 'Bug Free', desc: 'Win Code Defense without losing HP', icon: '✨' },
            { id: 'speedrun', name: 'Speedrunner', desc: 'Complete a game in under 2 minutes', icon: '⚡' },
            { id: 'hoarder', name: 'Hoarder', desc: 'Collect 50 power-ups', icon: '🎁' },
            { id: 'merge_king', name: 'Merge King', desc: 'Defeat 10 merge conflicts', icon: '👑' },
            { id: 'senior_dev', name: 'Senior Dev', desc: 'Hire a senior developer', icon: '🧔' }
        ];
    }

    unlockAchievement(id) {
        if (!this.data.achievements.includes(id)) {
            this.data.achievements.push(id);
            this.save();
            return this.getAchievements().find(a => a.id === id);
        }
        return null;
    }

    hasAchievement(id) {
        return this.data.achievements.includes(id);
    }

    updateStat(path, value, operation = 'set') {
        try {
            const keys = path.split('.');
            let current = this.data.stats;

            // Navigate and create missing intermediate objects
            for (let i = 0; i < keys.length - 1; i++) {
                const key = keys[i];
                if (!current[key] || typeof current[key] !== 'object') {
                    current[key] = {};
                }
                current = current[key];
            }

            const lastKey = keys[keys.length - 1];

            // Validate value is a number for numeric operations
            if ((operation === 'increment' || operation === 'max') && typeof value !== 'number') {
                console.error(`Invalid value type for ${operation} operation: ${typeof value}`);
                return false;
            }

            // Perform operation
            if (operation === 'increment') {
                current[lastKey] = (current[lastKey] || 0) + value;
            } else if (operation === 'max') {
                current[lastKey] = Math.max(current[lastKey] || 0, value);
            } else {
                current[lastKey] = value;
            }

            return this.save();
        } catch (e) {
            console.error(`Failed to update stat '${path}':`, e.message);
            return false;
        }
    }

    getStat(path) {
        try {
            const keys = path.split('.');
            let current = this.data.stats;

            for (let key of keys) {
                if (current === null || current === undefined) {
                    return 0;
                }
                current = current[key];
            }

            return current !== undefined ? current : 0;
        } catch (e) {
            console.error(`Failed to get stat '${path}':`, e.message);
            return 0;
        }
    }

    getDifficulty() {
        return this.data.settings.difficulty || 'normal';
    }

    setDifficulty(difficulty) {
        this.data.settings.difficulty = difficulty;
        this.save();
    }

    // Check and unlock achievements based on stats
    checkAchievements() {
        const unlocked = [];

        // Check various achievement conditions
        if (this.getStat('gitSurvivor.enemiesKilled') >= 100 && !this.hasAchievement('survivor')) {
            unlocked.push(this.unlockAchievement('survivor'));
        }

        if (this.getStat('codeDefense.towersPlaced') >= 50 && !this.hasAchievement('tower_master')) {
            unlocked.push(this.unlockAchievement('tower_master'));
        }

        if (this.getStat('prRush.prsReviewed') >= 100 && !this.hasAchievement('pr_pro')) {
            unlocked.push(this.unlockAchievement('pr_pro'));
        }

        if (this.getStat('gamesPlayed') >= 50 && !this.hasAchievement('workaholic')) {
            unlocked.push(this.unlockAchievement('workaholic'));
        }

        return unlocked.filter(a => a !== null);
    }

    reset() {
        try {
            localStorage.removeItem(this.storageKey);
            this.data = this.getDefaultData();
            this.save();
            return true;
        } catch (e) {
            console.error('Failed to reset game data:', e.message);
            return false;
        }
    }

    // Validate data integrity
    validateData() {
        if (!this.data || typeof this.data !== 'object') return false;
        if (!this.data.stats || typeof this.data.stats !== 'object') return false;
        if (!this.data.settings || typeof this.data.settings !== 'object') return false;
        if (!Array.isArray(this.data.achievements)) return false;
        return true;
    }

    // Export data for backup
    exportData() {
        try {
            return JSON.stringify(this.data, null, 2);
        } catch (e) {
            console.error('Failed to export data:', e.message);
            return null;
        }
    }

    // Import data from backup
    importData(jsonString) {
        try {
            const imported = JSON.parse(jsonString);
            this.data = this.mergeWithDefaults(imported);
            return this.save();
        } catch (e) {
            console.error('Failed to import data:', e.message);
            return false;
        }
    }
}

// Singleton instance
export const gameData = new GameData();
