// Simplified game data manager
// Tracks high scores and basic settings

class GameData {
    constructor() {
        this.storageKey = 'gitgame_v2';
        this.data = this.load();
    }

    load() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (e) {
            console.warn('Could not load game data:', e);
        }

        return this.getDefaultData();
    }

    getDefaultData() {
        return {
            stats: {
                gamesPlayed: 0,
                totalScore: 0,
                gitSurvivor: { highScore: 0, bestWave: 0 },
                sprintSurvivor: { highScore: 0, bestDistance: 0 },
                bugBounty: { levelsCompleted: 0, bestLevel: 0 }
            },
            settings: {
                soundEnabled: true,
                musicEnabled: true,
                haptics: true
            }
        };
    }

    save() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.data));
        } catch (e) {
            console.warn('Could not save game data:', e);
        }
    }

    // Stats helpers
    updateHighScore(mode, score) {
        if (score > this.data.stats[mode].highScore) {
            this.data.stats[mode].highScore = score;
            this.save();
            return true;
        }
        return false;
    }

    getHighScore(mode) {
        return this.data.stats[mode]?.highScore || 0;
    }

    incrementGamesPlayed() {
        this.data.stats.gamesPlayed++;
        this.save();
    }

    addToTotalScore(score) {
        this.data.stats.totalScore += score;
        this.save();
    }

    updateStat(mode, key, value, operation = 'max') {
        if (!this.data.stats[mode]) return;

        if (operation === 'max') {
            this.data.stats[mode][key] = Math.max(this.data.stats[mode][key] || 0, value);
        } else if (operation === 'increment') {
            this.data.stats[mode][key] = (this.data.stats[mode][key] || 0) + value;
        } else {
            this.data.stats[mode][key] = value;
        }
        this.save();
    }

    getStat(mode, key) {
        return this.data.stats[mode]?.[key] || 0;
    }

    // Settings helpers
    getSetting(key) {
        return this.data.settings[key];
    }

    setSetting(key, value) {
        this.data.settings[key] = value;
        this.save();
    }

    toggleSetting(key) {
        this.data.settings[key] = !this.data.settings[key];
        this.save();
        return this.data.settings[key];
    }

    reset() {
        this.data = this.getDefaultData();
        this.save();
    }
}

export const gameData = new GameData();
export default GameData;
