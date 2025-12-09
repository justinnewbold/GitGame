// Daily Challenges System - New challenges every day!

import { gameData } from './GameData.js';

export default class DailyChallenges {
    constructor() {
        this.challenges = [];
        this.generateDailyChallenges();
    }

    // Get today's date string (YYYY-MM-DD)
    getTodayString() {
        const date = new Date();
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }

    // Check if challenges need to be refreshed
    needsRefresh() {
        const lastDate = gameData.data.dailyChallenges?.lastRefresh || '';
        return lastDate !== this.getTodayString();
    }

    // Generate daily challenges
    generateDailyChallenges() {
        if (!gameData.data.dailyChallenges) {
            gameData.data.dailyChallenges = {
                lastRefresh: '',
                challenges: [],
                completed: []
            };
        }

        if (this.needsRefresh()) {
            // Generate new challenges
            const allChallenges = this.getAllChallenges();

            // Pick 1 random challenge (simplified from 3)
            const shuffled = [...allChallenges].sort(() => Math.random() - 0.5);
            const selected = shuffled.slice(0, 1);

            gameData.data.dailyChallenges = {
                lastRefresh: this.getTodayString(),
                challenges: selected,
                completed: []
            };
            gameData.save();
        }

        this.challenges = gameData.data.dailyChallenges.challenges;
    }

    // All possible challenges
    getAllChallenges() {
        return [
            // Git Survivor Challenges
            {
                id: 'survivor_score_1000',
                mode: 'GitSurvivor',
                title: 'Score Master',
                description: 'Score 1000 points in Git Survivor',
                icon: '🏆',
                reward: 500,
                target: 1000,
                progress: 0,
                check: (stats) => stats.gitSurvivor.highScore >= 1000
            },
            {
                id: 'survivor_kills_50',
                mode: 'GitSurvivor',
                title: 'Bug Exterminator',
                description: 'Kill 50 enemies in a single run',
                icon: '💀',
                reward: 300,
                target: 50,
                progress: 0,
                check: (stats, runData) => runData?.enemiesKilled >= 50
            },
            {
                id: 'survivor_no_damage',
                mode: 'GitSurvivor',
                title: 'Untouchable',
                description: 'Survive 30 seconds without taking damage',
                icon: '🛡️',
                reward: 400,
                target: 30,
                progress: 0,
                check: (stats, runData) => runData?.noHitStreak >= 30
            },
            {
                id: 'survivor_combo_20',
                mode: 'GitSurvivor',
                title: 'Combo King',
                description: 'Achieve a 20x combo',
                icon: '🔥',
                reward: 350,
                target: 20,
                progress: 0,
                check: (stats, runData) => runData?.maxCombo >= 20
            },
            {
                id: 'survivor_boss_3',
                mode: 'GitSurvivor',
                title: 'Boss Hunter',
                description: 'Defeat 3 bosses in one game',
                icon: '👹',
                reward: 600,
                target: 3,
                progress: 0,
                check: (stats, runData) => runData?.bossesKilled >= 3
            },

            // Code Defense Challenges
            {
                id: 'defense_wave_15',
                mode: 'CodeDefense',
                title: 'Wave Survivor',
                description: 'Reach wave 15',
                icon: '🌊',
                reward: 400,
                target: 15,
                progress: 0,
                check: (stats) => stats.codeDefense.highWave >= 15
            },
            {
                id: 'defense_towers_20',
                mode: 'CodeDefense',
                title: 'Tower Baron',
                description: 'Place 20 towers in one game',
                icon: '🏰',
                reward: 300,
                target: 20,
                progress: 0,
                check: (stats, runData) => runData?.towersPlaced >= 20
            },
            {
                id: 'defense_perfect',
                mode: 'CodeDefense',
                title: 'Perfect Defense',
                description: 'Complete 5 waves without losing health',
                icon: '❤️',
                reward: 500,
                target: 5,
                progress: 0,
                check: (stats, runData) => runData?.perfectWaves >= 5
            },

            // PR Rush Challenges
            {
                id: 'pr_accuracy_95',
                mode: 'PRRush',
                title: 'Code Reviewer Pro',
                description: 'Achieve 95% accuracy',
                icon: '🎯',
                reward: 400,
                target: 95,
                progress: 0,
                check: (stats) => stats.prRush.bestAccuracy >= 95
            },
            {
                id: 'pr_review_30',
                mode: 'PRRush',
                title: 'PR Machine',
                description: 'Review 30 PRs in one game',
                icon: '📝',
                reward: 350,
                target: 30,
                progress: 0,
                check: (stats, runData) => runData?.prsReviewed >= 30
            },
            {
                id: 'pr_perfect',
                mode: 'PRRush',
                title: 'Flawless Reviewer',
                description: 'Get 100% accuracy with 10+ PRs',
                icon: '💯',
                reward: 600,
                target: 10,
                progress: 0,
                check: (stats, runData) => runData?.accuracy === 100 && runData?.prsReviewed >= 10
            },

            // Dev Commander Challenges
            {
                id: 'commander_sprint_10',
                mode: 'DevCommander',
                title: 'Sprint Master',
                description: 'Complete 10 sprints',
                icon: '🏃',
                reward: 500,
                target: 10,
                progress: 0,
                check: (stats) => stats.devCommander.maxSprints >= 10
            },
            {
                id: 'commander_tasks_50',
                mode: 'DevCommander',
                title: 'Task Manager',
                description: 'Complete 50 tasks in one game',
                icon: '✅',
                reward: 400,
                target: 50,
                progress: 0,
                check: (stats, runData) => runData?.tasksCompleted >= 50
            },
            {
                id: 'commander_coffee_10',
                mode: 'DevCommander',
                title: 'Coffee Enthusiast',
                description: 'Buy coffee 10 times in one game',
                icon: '☕',
                reward: 300,
                target: 10,
                progress: 0,
                check: (stats, runData) => runData?.coffeesBought >= 10
            },

            // Universal Challenges
            {
                id: 'play_all_modes',
                mode: 'All',
                title: 'Jack of All Trades',
                description: 'Play all 4 game modes today',
                icon: '🎮',
                reward: 800,
                target: 4,
                progress: 0,
                check: (stats, runData, dailyData) => {
                    const modes = dailyData?.modesPlayed || new Set();
                    return modes.size >= 4;
                }
            },
            {
                id: 'win_3_games',
                mode: 'All',
                title: 'Triple Threat',
                description: 'Win 3 games today',
                icon: '🏅',
                reward: 600,
                target: 3,
                progress: 0,
                check: (stats, runData, dailyData) => {
                    return (dailyData?.gamesWon || 0) >= 3;
                }
            }
        ];
    }

    // Get today's challenges
    getTodaysChallenges() {
        this.generateDailyChallenges();
        return this.challenges;
    }

    // Check if a challenge is completed
    isCompleted(challengeId) {
        return gameData.data.dailyChallenges.completed.includes(challengeId);
    }

    // Complete a challenge
    completeChallenge(challengeId) {
        if (!this.isCompleted(challengeId)) {
            gameData.data.dailyChallenges.completed.push(challengeId);

            const challenge = this.challenges.find(c => c.id === challengeId);
            if (challenge) {
                // Award reward (could be XP, currency, etc.)
                gameData.updateStat('totalScore', challenge.reward, 'increment');
            }

            gameData.save();
            return challenge;
        }
        return null;
    }

    // Check challenges against current game stats
    checkChallenges(runData) {
        const stats = gameData.data.stats;
        const completed = [];

        this.challenges.forEach(challenge => {
            if (!this.isCompleted(challenge.id)) {
                if (challenge.check(stats, runData)) {
                    const completedChallenge = this.completeChallenge(challenge.id);
                    if (completedChallenge) {
                        completed.push(completedChallenge);
                    }
                }
            }
        });

        return completed;
    }

    // Get completion status
    getCompletionStatus() {
        const total = this.challenges.length;
        const completed = gameData.data.dailyChallenges.completed.length;
        return {
            total,
            completed,
            percentage: total > 0 ? Math.floor((completed / total) * 100) : 0
        };
    }
}

// Singleton instance
export const dailyChallenges = new DailyChallenges();
