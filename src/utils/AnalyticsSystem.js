/**
 * AnalyticsSystem - Player statistics and insights
 * Tracks detailed gameplay metrics and provides analysis
 */

import { logger } from './Logger.js';
import { gameData } from './GameData.js';

export default class AnalyticsSystem {
    constructor() {
        this.currentSession = null;
        this.initializeStorage();
    }

    /**
     * Initialize analytics storage
     */
    initializeStorage() {
        if (!gameData.data.analytics) {
            gameData.data.analytics = {
                sessions: [],
                allTime: {
                    totalGames: 0,
                    totalPlayTime: 0,
                    totalScore: 0,
                    totalKills: 0,
                    totalDeaths: 0,
                    totalPowerups: 0,
                    highestScore: 0,
                    highestCombo: 0,
                    longestSurvival: 0,
                    firstPlayed: null,
                    lastPlayed: null
                },
                byMode: {},
                byHour: new Array(24).fill(0),
                byDayOfWeek: new Array(7).fill(0),
                deathPositions: [],
                scoreProgression: [],
                streaks: {
                    current: 0,
                    best: 0,
                    lastPlayDate: null
                }
            };
            gameData.save();
        }
    }

    /**
     * Start tracking a game session
     */
    startSession(gameMode) {
        this.currentSession = {
            id: `session_${Date.now()}`,
            gameMode,
            startTime: Date.now(),
            endTime: null,
            duration: 0,
            score: 0,
            kills: 0,
            deaths: 0,
            powerupsCollected: 0,
            maxCombo: 0,
            damageDealt: 0,
            damageTaken: 0,
            distanceTraveled: 0,
            lastPosition: null,
            deathPosition: null,
            events: []
        };

        logger.info('AnalyticsSystem', `Session started: ${gameMode}`);
    }

    /**
     * Update session with current game state
     */
    updateSession(data) {
        if (!this.currentSession) return;

        const { score, kills, powerups, combo, damage, position } = data;

        if (score !== undefined) this.currentSession.score = score;
        if (kills !== undefined) this.currentSession.kills = kills;
        if (powerups !== undefined) this.currentSession.powerupsCollected = powerups;
        if (combo !== undefined) {
            this.currentSession.maxCombo = Math.max(this.currentSession.maxCombo, combo);
        }
        if (damage !== undefined) this.currentSession.damageTaken = damage;

        // Track distance traveled
        if (position && this.currentSession.lastPosition) {
            const dx = position.x - this.currentSession.lastPosition.x;
            const dy = position.y - this.currentSession.lastPosition.y;
            this.currentSession.distanceTraveled += Math.sqrt(dx * dx + dy * dy);
        }
        if (position) {
            this.currentSession.lastPosition = { ...position };
        }
    }

    /**
     * Record a specific event
     */
    recordEvent(eventType, eventData = {}) {
        if (!this.currentSession) return;

        this.currentSession.events.push({
            type: eventType,
            time: Date.now() - this.currentSession.startTime,
            data: eventData
        });
    }

    /**
     * Record death position for heatmap
     */
    recordDeath(x, y) {
        if (!this.currentSession) return;

        this.currentSession.deathPosition = { x, y };
        this.currentSession.deaths = 1;

        // Store normalized position (0-1) for heatmap
        const normalized = {
            x: x / 800, // Assuming 800px width
            y: y / 600, // Assuming 600px height
            mode: this.currentSession.gameMode,
            timestamp: Date.now()
        };

        gameData.data.analytics.deathPositions.push(normalized);

        // Keep only last 500 death positions
        if (gameData.data.analytics.deathPositions.length > 500) {
            gameData.data.analytics.deathPositions =
                gameData.data.analytics.deathPositions.slice(-500);
        }
    }

    /**
     * End session and save analytics
     */
    endSession() {
        if (!this.currentSession) return null;

        const session = this.currentSession;
        session.endTime = Date.now();
        session.duration = session.endTime - session.startTime;

        // Update all-time stats
        const allTime = gameData.data.analytics.allTime;
        allTime.totalGames++;
        allTime.totalPlayTime += session.duration;
        allTime.totalScore += session.score;
        allTime.totalKills += session.kills;
        allTime.totalDeaths += session.deaths;
        allTime.totalPowerups += session.powerupsCollected;
        allTime.highestScore = Math.max(allTime.highestScore, session.score);
        allTime.highestCombo = Math.max(allTime.highestCombo, session.maxCombo);
        allTime.longestSurvival = Math.max(allTime.longestSurvival, session.duration);

        if (!allTime.firstPlayed) {
            allTime.firstPlayed = session.startTime;
        }
        allTime.lastPlayed = session.endTime;

        // Update by-mode stats
        if (!gameData.data.analytics.byMode[session.gameMode]) {
            gameData.data.analytics.byMode[session.gameMode] = {
                gamesPlayed: 0,
                totalScore: 0,
                totalTime: 0,
                highestScore: 0,
                totalKills: 0
            };
        }
        const modeStats = gameData.data.analytics.byMode[session.gameMode];
        modeStats.gamesPlayed++;
        modeStats.totalScore += session.score;
        modeStats.totalTime += session.duration;
        modeStats.highestScore = Math.max(modeStats.highestScore, session.score);
        modeStats.totalKills += session.kills;

        // Update time-based stats
        const sessionDate = new Date(session.startTime);
        gameData.data.analytics.byHour[sessionDate.getHours()]++;
        gameData.data.analytics.byDayOfWeek[sessionDate.getDay()]++;

        // Track score progression
        gameData.data.analytics.scoreProgression.push({
            date: session.startTime,
            score: session.score,
            mode: session.gameMode
        });

        // Keep only last 100 scores
        if (gameData.data.analytics.scoreProgression.length > 100) {
            gameData.data.analytics.scoreProgression =
                gameData.data.analytics.scoreProgression.slice(-100);
        }

        // Update play streaks
        this.updateStreaks(session.startTime);

        // Store session (keep last 50)
        gameData.data.analytics.sessions.push({
            id: session.id,
            gameMode: session.gameMode,
            startTime: session.startTime,
            duration: session.duration,
            score: session.score,
            kills: session.kills,
            maxCombo: session.maxCombo
        });

        if (gameData.data.analytics.sessions.length > 50) {
            gameData.data.analytics.sessions =
                gameData.data.analytics.sessions.slice(-50);
        }

        gameData.save();
        logger.info('AnalyticsSystem', `Session ended. Score: ${session.score}`);

        this.currentSession = null;
        return session;
    }

    /**
     * Update daily play streaks
     */
    updateStreaks(timestamp) {
        const streaks = gameData.data.analytics.streaks;
        const today = new Date(timestamp).toDateString();
        const lastPlay = streaks.lastPlayDate ? new Date(streaks.lastPlayDate).toDateString() : null;

        if (lastPlay === today) {
            // Already played today, no change
            return;
        }

        const yesterday = new Date(timestamp);
        yesterday.setDate(yesterday.getDate() - 1);

        if (lastPlay === yesterday.toDateString()) {
            // Consecutive day
            streaks.current++;
            streaks.best = Math.max(streaks.best, streaks.current);
        } else if (lastPlay !== today) {
            // Streak broken
            streaks.current = 1;
        }

        streaks.lastPlayDate = timestamp;
    }

    /**
     * Get all-time statistics
     */
    getAllTimeStats() {
        return gameData.data.analytics?.allTime || {};
    }

    /**
     * Get statistics for a specific game mode
     */
    getModeStats(gameMode) {
        return gameData.data.analytics?.byMode[gameMode] || null;
    }

    /**
     * Get play time distribution by hour
     */
    getHourlyDistribution() {
        return gameData.data.analytics?.byHour || new Array(24).fill(0);
    }

    /**
     * Get play time distribution by day of week
     */
    getDayOfWeekDistribution() {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const data = gameData.data.analytics?.byDayOfWeek || new Array(7).fill(0);
        return days.map((day, i) => ({ day, count: data[i] }));
    }

    /**
     * Get death heatmap data
     */
    getDeathHeatmap(gameMode = null) {
        let positions = gameData.data.analytics?.deathPositions || [];
        if (gameMode) {
            positions = positions.filter(p => p.mode === gameMode);
        }
        return positions;
    }

    /**
     * Get score progression over time
     */
    getScoreProgression(gameMode = null, limit = 20) {
        let progression = gameData.data.analytics?.scoreProgression || [];
        if (gameMode) {
            progression = progression.filter(p => p.mode === gameMode);
        }
        return progression.slice(-limit);
    }

    /**
     * Get recent sessions
     */
    getRecentSessions(limit = 10) {
        return (gameData.data.analytics?.sessions || []).slice(-limit).reverse();
    }

    /**
     * Get streak information
     */
    getStreaks() {
        return gameData.data.analytics?.streaks || { current: 0, best: 0 };
    }

    /**
     * Calculate average stats
     */
    getAverages() {
        const allTime = this.getAllTimeStats();
        const games = allTime.totalGames || 1;

        return {
            avgScore: Math.round(allTime.totalScore / games),
            avgPlayTime: Math.round(allTime.totalPlayTime / games / 1000), // seconds
            avgKills: Math.round(allTime.totalKills / games),
            avgPowerups: Math.round(allTime.totalPowerups / games),
            survivalRate: Math.round(((games - allTime.totalDeaths) / games) * 100)
        };
    }

    /**
     * Get percentile ranking (simulated - would need server for real rankings)
     */
    getPercentileRanking() {
        const allTime = this.getAllTimeStats();

        // Simulated percentiles based on score thresholds
        const scoreThresholds = [
            { score: 10000, percentile: 1 },
            { score: 5000, percentile: 5 },
            { score: 2500, percentile: 10 },
            { score: 1000, percentile: 25 },
            { score: 500, percentile: 50 },
            { score: 0, percentile: 100 }
        ];

        for (const threshold of scoreThresholds) {
            if (allTime.highestScore >= threshold.score) {
                return {
                    percentile: threshold.percentile,
                    message: `Top ${threshold.percentile}% of players`
                };
            }
        }

        return { percentile: 100, message: 'Keep playing to improve!' };
    }

    /**
     * Get favorite game mode
     */
    getFavoriteMode() {
        const byMode = gameData.data.analytics?.byMode || {};
        let favorite = null;
        let maxGames = 0;

        for (const [mode, stats] of Object.entries(byMode)) {
            if (stats.gamesPlayed > maxGames) {
                maxGames = stats.gamesPlayed;
                favorite = mode;
            }
        }

        return favorite;
    }

    /**
     * Get peak playing hour
     */
    getPeakHour() {
        const hourly = this.getHourlyDistribution();
        let peakHour = 0;
        let maxGames = 0;

        hourly.forEach((count, hour) => {
            if (count > maxGames) {
                maxGames = count;
                peakHour = hour;
            }
        });

        return {
            hour: peakHour,
            formatted: `${peakHour.toString().padStart(2, '0')}:00`,
            games: maxGames
        };
    }

    /**
     * Generate weekly summary
     */
    getWeeklySummary() {
        const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        const sessions = (gameData.data.analytics?.sessions || [])
            .filter(s => s.startTime > oneWeekAgo);

        if (sessions.length === 0) {
            return {
                gamesPlayed: 0,
                totalScore: 0,
                totalTime: 0,
                bestScore: 0,
                improvement: 0
            };
        }

        const totalScore = sessions.reduce((sum, s) => sum + s.score, 0);
        const totalTime = sessions.reduce((sum, s) => sum + s.duration, 0);
        const bestScore = Math.max(...sessions.map(s => s.score));

        // Calculate improvement (last 3 vs first 3 games)
        let improvement = 0;
        if (sessions.length >= 6) {
            const firstThree = sessions.slice(0, 3);
            const lastThree = sessions.slice(-3);
            const firstAvg = firstThree.reduce((sum, s) => sum + s.score, 0) / 3;
            const lastAvg = lastThree.reduce((sum, s) => sum + s.score, 0) / 3;
            improvement = Math.round(((lastAvg - firstAvg) / firstAvg) * 100);
        }

        return {
            gamesPlayed: sessions.length,
            totalScore,
            totalTime,
            bestScore,
            improvement
        };
    }

    /**
     * Export analytics data
     */
    exportData() {
        return JSON.stringify(gameData.data.analytics, null, 2);
    }

    /**
     * Reset all analytics (for testing)
     */
    static reset() {
        gameData.data.analytics = null;
        gameData.save();
    }
}

// Singleton instance
export const analyticsSystem = new AnalyticsSystem();
