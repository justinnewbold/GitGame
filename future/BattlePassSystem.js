// Battle Pass System - Seasonal progression with free and premium tracks

import { gameData } from './GameData.js';

export default class BattlePassSystem {
    constructor() {
        this.initializeBattlePass();
    }

    initializeBattlePass() {
        if (!gameData.data.battlePass) {
            gameData.data.battlePass = {
                season: 1,
                tier: 0,
                xp: 0,
                isPremium: false,
                claimedRewards: [],
                completedMissions: [],
                seasonStartDate: new Date().toISOString()
            };
            gameData.save();
        }
    }

    // Get current season info
    getCurrentSeason() {
        return {
            number: gameData.data.battlePass.season,
            name: this.getSeasonName(gameData.data.battlePass.season),
            theme: this.getSeasonTheme(gameData.data.battlePass.season),
            startDate: new Date(gameData.data.battlePass.seasonStartDate),
            endDate: this.getSeasonEndDate(),
            daysRemaining: this.getDaysRemaining()
        };
    }

    getSeasonName(seasonNum) {
        const names = [
            'The Legacy Code',
            'Refactor Revolution',
            'Production Panic',
            'Debug Dynasty',
            'Merge Mayhem',
            'Sprint Supreme',
            'Code Crusade',
            'Tech Titans'
        ];
        return names[(seasonNum - 1) % names.length] || `Season ${seasonNum}`;
    }

    getSeasonTheme(seasonNum) {
        const themes = ['legacy', 'refactor', 'production', 'debug', 'merge', 'sprint', 'code', 'tech'];
        return themes[(seasonNum - 1) % themes.length];
    }

    getSeasonEndDate() {
        const start = new Date(gameData.data.battlePass.seasonStartDate);
        const end = new Date(start);
        end.setDate(end.getDate() + 42); // 6 week seasons
        return end;
    }

    getDaysRemaining() {
        const now = new Date();
        const end = this.getSeasonEndDate();
        const diff = end - now;
        return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    }

    // Get all tier rewards (50 tiers)
    getTierRewards() {
        const rewards = [];

        for (let tier = 0; tier < 50; tier++) {
            rewards.push({
                tier: tier,
                free: this.getFreeTierReward(tier),
                premium: this.getPremiumTierReward(tier)
            });
        }

        return rewards;
    }

    getFreeTierReward(tier) {
        // Free track rewards
        if (tier === 0) return { type: 'coins', amount: 100, icon: '💰' };
        if (tier === 5) return { type: 'color', id: 'red', icon: '🎨' };
        if (tier === 10) return { type: 'coins', amount: 500, icon: '💰' };
        if (tier === 15) return { type: 'trail', id: 'sparkle', icon: '✨' };
        if (tier === 20) return { type: 'coins', amount: 1000, icon: '💰' };
        if (tier === 25) return { type: 'skin', id: 'ninja', icon: '🥷' };
        if (tier === 30) return { type: 'coins', amount: 1500, icon: '💰' };
        if (tier === 35) return { type: 'emote', id: 'gg', icon: '👍' };
        if (tier === 40) return { type: 'coins', amount: 2000, icon: '💰' };
        if (tier === 45) return { type: 'title', id: 'season_veteran', name: 'Season Veteran', icon: '🏆' };
        if (tier === 49) return { type: 'coins', amount: 5000, icon: '💰' };

        // Filler rewards
        if (tier % 5 === 0) return { type: 'coins', amount: 250, icon: '💰' };
        return { type: 'xp_boost', amount: 100, icon: '📈' };
    }

    getPremiumTierReward(tier) {
        // Premium track rewards
        if (tier === 0) return { type: 'coins', amount: 500, icon: '💰' };
        if (tier === 1) return { type: 'emote', id: 'dance', icon: '💃' };
        if (tier === 5) return { type: 'skin', id: 'wizard', icon: '🧙' };
        if (tier === 10) return { type: 'pet', id: 'code_cat', icon: '🐱' };
        if (tier === 15) return { type: 'trail', id: 'fire', icon: '🔥' };
        if (tier === 20) return { type: 'victory_pose', id: 'champion', icon: '🎯' };
        if (tier === 25) return { type: 'skin', id: 'superhero', exclusive: true, icon: '🦸' };
        if (tier === 30) return { type: 'emote', id: 'legendary', icon: '👑' };
        if (tier === 35) return { type: 'pet', id: 'cyber_dragon', icon: '🐉' };
        if (tier === 40) return { type: 'trail', id: 'rainbow', icon: '🌈' };
        if (tier === 45) return { type: 'banner', id: 'season_champion', icon: '🎖️' };
        if (tier === 49) return { type: 'skin', id: 'ultimate_season', legendary: true, exclusive: true, icon: '👑' };

        // Premium filler rewards
        if (tier % 3 === 0) return { type: 'coins', amount: 500, icon: '💰' };
        if (tier % 2 === 0) return { type: 'loot_crate', rarity: 'gold', icon: '📦' };
        return { type: 'xp_boost', amount: 200, icon: '📊' };
    }

    // XP required per tier
    getXPRequired(tier) {
        return 1000 + (tier * 100); // Increasing XP per tier
    }

    // Add XP to battle pass
    addXP(amount) {
        const bp = gameData.data.battlePass;
        bp.xp += amount;

        const tiersGained = [];

        // Check for tier ups
        while (bp.tier < 49) {
            const required = this.getXPRequired(bp.tier);

            if (bp.xp >= required) {
                bp.xp -= required;
                bp.tier++;
                tiersGained.push(bp.tier);
            } else {
                break;
            }
        }

        gameData.save();

        return {
            newTier: bp.tier,
            tiersGained: tiersGained,
            currentXP: bp.xp,
            requiredXP: this.getXPRequired(bp.tier)
        };
    }

    // Claim tier reward
    claimReward(tier, isPremium = false) {
        const bp = gameData.data.battlePass;

        if (tier > bp.tier) {
            return { success: false, message: 'Tier not unlocked yet!' };
        }

        const rewardKey = `${tier}_${isPremium ? 'premium' : 'free'}`;

        if (bp.claimedRewards.includes(rewardKey)) {
            return { success: false, message: 'Already claimed!' };
        }

        if (isPremium && !bp.isPremium) {
            return { success: false, message: 'Premium Battle Pass required!' };
        }

        const rewards = this.getTierRewards();
        const reward = isPremium ? rewards[tier].premium : rewards[tier].free;

        // Apply reward
        this.applyReward(reward);

        bp.claimedRewards.push(rewardKey);
        gameData.save();

        return {
            success: true,
            reward: reward
        };
    }

    applyReward(reward) {
        switch (reward.type) {
            case 'coins':
                gameData.data.stats.totalScore += reward.amount;
                break;

            case 'skin':
            case 'color':
            case 'trail':
                const key = `unlocked${reward.type.charAt(0).toUpperCase() + reward.type.slice(1)}s`;
                if (!gameData.data.customization[key].includes(reward.id)) {
                    gameData.data.customization[key].push(reward.id);
                }
                break;

            case 'pet':
                if (!gameData.data.pets.unlocked.includes(reward.id)) {
                    gameData.data.pets.unlocked.push(reward.id);
                }
                break;

            case 'emote':
                if (!gameData.data.emotes) gameData.data.emotes = { unlocked: [] };
                if (!gameData.data.emotes.unlocked.includes(reward.id)) {
                    gameData.data.emotes.unlocked.push(reward.id);
                }
                break;

            case 'victory_pose':
                if (!gameData.data.victoryPoses) gameData.data.victoryPoses = { unlocked: [] };
                if (!gameData.data.victoryPoses.unlocked.includes(reward.id)) {
                    gameData.data.victoryPoses.unlocked.push(reward.id);
                }
                break;

            case 'title':
                if (!gameData.data.titles) gameData.data.titles = [];
                if (!gameData.data.titles.includes(reward.id)) {
                    gameData.data.titles.push(reward.id);
                }
                break;

            case 'banner':
                if (!gameData.data.banners) gameData.data.banners = { unlocked: [] };
                if (!gameData.data.banners.unlocked.includes(reward.id)) {
                    gameData.data.banners.unlocked.push(reward.id);
                }
                break;

            case 'loot_crate':
                if (!gameData.data.lootCrates) gameData.data.lootCrates = [];
                gameData.data.lootCrates.push({ rarity: reward.rarity, opened: false });
                break;
        }

        gameData.save();
    }

    // Get weekly missions (10 per week)
    getWeeklyMissions() {
        return [
            {
                id: 'weekly_1',
                name: 'Score Master',
                description: 'Earn 10,000 score',
                progress: 0,
                target: 10000,
                reward: 500,
                type: 'score',
                icon: '🎯'
            },
            {
                id: 'weekly_2',
                name: 'Game Marathon',
                description: 'Play 20 games',
                progress: 0,
                target: 20,
                reward: 400,
                type: 'games',
                icon: '🎮'
            },
            {
                id: 'weekly_3',
                name: 'Mode Master',
                description: 'Play 3 different modes',
                progress: 0,
                target: 3,
                reward: 600,
                type: 'modes',
                icon: '🎪'
            },
            {
                id: 'weekly_4',
                name: 'Boss Hunter',
                description: 'Defeat 5 bosses',
                progress: 0,
                target: 5,
                reward: 700,
                type: 'bosses',
                icon: '👹'
            },
            {
                id: 'weekly_5',
                name: 'Perfect Run',
                description: 'Complete a game without taking damage',
                progress: 0,
                target: 1,
                reward: 1000,
                type: 'perfect',
                icon: '✨'
            },
            {
                id: 'weekly_6',
                name: 'Combo King',
                description: 'Achieve 50x combo',
                progress: 0,
                target: 50,
                reward: 800,
                type: 'combo',
                icon: '🔥'
            },
            {
                id: 'weekly_7',
                name: 'Power Collector',
                description: 'Collect 30 power-ups',
                progress: 0,
                target: 30,
                reward: 500,
                type: 'powerups',
                icon: '⚡'
            },
            {
                id: 'weekly_8',
                name: 'Daily Dedication',
                description: 'Play on 5 different days',
                progress: 0,
                target: 5,
                reward: 900,
                type: 'daily',
                icon: '📅'
            },
            {
                id: 'weekly_9',
                name: 'Achievement Hunter',
                description: 'Unlock 3 achievements',
                progress: 0,
                target: 3,
                reward: 750,
                type: 'achievements',
                icon: '🏆'
            },
            {
                id: 'weekly_10',
                name: 'Complete All',
                description: 'Complete all 9 weekly missions',
                progress: 0,
                target: 9,
                reward: 2000,
                type: 'meta',
                icon: '👑'
            }
        ];
    }

    // Update mission progress
    updateMissionProgress(missionType, amount = 1) {
        const bp = gameData.data.battlePass;
        const missions = this.getWeeklyMissions();

        missions.forEach(mission => {
            if (mission.type === missionType) {
                const key = `mission_${mission.id}`;
                if (!bp[key]) bp[key] = 0;

                bp[key] += amount;

                if (bp[key] >= mission.target && !bp.completedMissions.includes(mission.id)) {
                    bp.completedMissions.push(mission.id);
                    this.addXP(mission.reward);
                }
            }
        });

        gameData.save();
    }

    // Purchase premium battle pass
    purchasePremium() {
        // In a real game, this would require payment
        // For now, just unlock it
        gameData.data.battlePass.isPremium = true;
        gameData.save();

        return { success: true, message: 'Premium Battle Pass unlocked!' };
    }

    // Start new season
    newSeason() {
        const bp = gameData.data.battlePass;

        // Archive old season rewards
        if (!gameData.data.seasonArchive) {
            gameData.data.seasonArchive = [];
        }

        gameData.data.seasonArchive.push({
            season: bp.season,
            tier: bp.tier,
            isPremium: bp.isPremium,
            rewards: bp.claimedRewards
        });

        // Reset for new season
        bp.season++;
        bp.tier = 0;
        bp.xp = 0;
        bp.isPremium = false;
        bp.claimedRewards = [];
        bp.completedMissions = [];
        bp.seasonStartDate = new Date().toISOString();

        gameData.save();

        return {
            newSeason: bp.season,
            name: this.getSeasonName(bp.season)
        };
    }

    // Get progress info
    getProgress() {
        const bp = gameData.data.battlePass;

        return {
            tier: bp.tier,
            xp: bp.xp,
            requiredXP: this.getXPRequired(bp.tier),
            progress: (bp.xp / this.getXPRequired(bp.tier)) * 100,
            isPremium: bp.isPremium,
            missionsCompleted: bp.completedMissions.length,
            totalMissions: 10
        };
    }
}

// Singleton
export const battlePassSystem = new BattlePassSystem();
