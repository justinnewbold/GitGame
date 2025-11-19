// Ranked Seasons System - Competitive play with ELO/MMR and rank tiers

import { gameData } from './GameData.js';

export default class RankedSystem {
    constructor() {
        this.initializeRanked();
    }

    initializeRanked() {
        if (!gameData.data.ranked) {
            gameData.data.ranked = {
                currentSeason: 1,
                seasonStartDate: new Date().toISOString(),
                mmr: 1000, // Starting MMR
                rank: 'bronze',
                division: 4,
                lp: 0, // League Points (0-100)
                wins: 0,
                losses: 0,
                winStreak: 0,
                placementMatches: 0,
                isPlaced: false,
                highestRank: 'bronze',
                seasonHistory: [],
                lastPlayedDate: new Date().toISOString()
            };
            gameData.save();
        }
    }

    // Rank tiers and divisions
    getRankTiers() {
        return {
            bronze: {
                name: 'Bronze',
                divisions: [4, 3, 2, 1],
                minMMR: 0,
                maxMMR: 1199,
                color: 0xCD7F32,
                icon: '🥉',
                lpPerWin: 20,
                lpPerLoss: 15
            },
            silver: {
                name: 'Silver',
                divisions: [4, 3, 2, 1],
                minMMR: 1200,
                maxMMR: 1399,
                color: 0xC0C0C0,
                icon: '🥈',
                lpPerWin: 18,
                lpPerLoss: 17
            },
            gold: {
                name: 'Gold',
                divisions: [4, 3, 2, 1],
                minMMR: 1400,
                maxMMR: 1599,
                color: 0xFFD700,
                icon: '🥇',
                lpPerWin: 16,
                lpPerLoss: 18
            },
            platinum: {
                name: 'Platinum',
                divisions: [4, 3, 2, 1],
                minMMR: 1600,
                maxMMR: 1799,
                color: 0x00CED1,
                icon: '💎',
                lpPerWin: 15,
                lpPerLoss: 19
            },
            diamond: {
                name: 'Diamond',
                divisions: [4, 3, 2, 1],
                minMMR: 1800,
                maxMMR: 1999,
                color: 0x1E90FF,
                icon: '💠',
                lpPerWin: 14,
                lpPerLoss: 20
            },
            master: {
                name: 'Master',
                divisions: [1], // No divisions in Master
                minMMR: 2000,
                maxMMR: 2299,
                color: 0x9370DB,
                icon: '👑',
                lpPerWin: 12,
                lpPerLoss: 22
            },
            grandmaster: {
                name: 'Grandmaster',
                divisions: [1], // No divisions in Grandmaster
                minMMR: 2300,
                maxMMR: 9999,
                color: 0xFF00FF,
                icon: '⭐',
                lpPerWin: 10,
                lpPerLoss: 25
            }
        };
    }

    // Get current rank info
    getCurrentRank() {
        const ranked = gameData.data.ranked;
        const tiers = this.getRankTiers();
        const tier = tiers[ranked.rank];

        return {
            rank: ranked.rank,
            division: ranked.division,
            lp: ranked.lp,
            mmr: ranked.mmr,
            displayName: this.getRankDisplayName(),
            tier: tier,
            wins: ranked.wins,
            losses: ranked.losses,
            winRate: this.getWinRate(),
            winStreak: ranked.winStreak,
            isPlaced: ranked.isPlaced,
            placementMatches: ranked.placementMatches
        };
    }

    getRankDisplayName() {
        const ranked = gameData.data.ranked;
        const tiers = this.getRankTiers();
        const tier = tiers[ranked.rank];

        if (ranked.rank === 'master' || ranked.rank === 'grandmaster') {
            return tier.name;
        }

        return `${tier.name} ${ranked.division}`;
    }

    getWinRate() {
        const ranked = gameData.data.ranked;
        const total = ranked.wins + ranked.losses;
        if (total === 0) return 0;
        return Math.round((ranked.wins / total) * 100);
    }

    // Calculate MMR change based on performance
    calculateMMRChange(won, performanceScore = 1.0) {
        const ranked = gameData.data.ranked;
        const baseMMRChange = 25;

        // Performance multiplier (0.5 - 1.5x)
        const perfMultiplier = Math.max(0.5, Math.min(1.5, performanceScore));

        // Streak bonus
        let streakBonus = 0;
        if (won && ranked.winStreak >= 3) {
            streakBonus = Math.min(ranked.winStreak - 2, 10);
        }

        const mmrChange = Math.round(baseMMRChange * perfMultiplier) + streakBonus;

        return won ? mmrChange : -mmrChange;
    }

    // Record a ranked match result
    recordMatch(won, performanceScore = 1.0, mode = 'ranked') {
        const ranked = gameData.data.ranked;

        // Placement matches (first 10 games)
        if (!ranked.isPlaced && ranked.placementMatches < 10) {
            return this.recordPlacementMatch(won, performanceScore);
        }

        const tiers = this.getRankTiers();
        const currentTier = tiers[ranked.rank];

        // Update win/loss record
        if (won) {
            ranked.wins++;
            ranked.winStreak++;
        } else {
            ranked.losses++;
            ranked.winStreak = 0;
        }

        // Calculate MMR change
        const mmrChange = this.calculateMMRChange(won, performanceScore);
        ranked.mmr = Math.max(0, ranked.mmr + mmrChange);

        // Calculate LP change
        let lpChange = won ? currentTier.lpPerWin : -currentTier.lpPerLoss;

        // Add streak bonus to LP
        if (won && ranked.winStreak >= 3) {
            lpChange += Math.min(ranked.winStreak - 2, 5);
        }

        ranked.lp += lpChange;

        // Check for promotion
        if (ranked.lp >= 100) {
            this.promote();
        }

        // Check for demotion
        if (ranked.lp < 0) {
            this.demote();
        }

        // Update last played date
        ranked.lastPlayedDate = new Date().toISOString();

        // Update rank based on MMR
        this.updateRankFromMMR();

        // Update highest rank
        this.updateHighestRank();

        gameData.save();

        return {
            won: won,
            mmrChange: mmrChange,
            lpChange: lpChange,
            newMMR: ranked.mmr,
            newLP: ranked.lp,
            rank: this.getRankDisplayName(),
            promoted: false,
            demoted: false
        };
    }

    // Placement matches
    recordPlacementMatch(won, performanceScore) {
        const ranked = gameData.data.ranked;

        ranked.placementMatches++;

        if (won) {
            ranked.wins++;
            ranked.winStreak++;
        } else {
            ranked.losses++;
            ranked.winStreak = 0;
        }

        // Add MMR based on performance
        const mmrGain = won ? 50 : 10;
        ranked.mmr += Math.round(mmrGain * performanceScore);

        // After 10 placement matches, place the player
        if (ranked.placementMatches >= 10) {
            ranked.isPlaced = true;
            this.updateRankFromMMR();
            this.updateHighestRank();
        }

        gameData.save();

        return {
            placementMatch: ranked.placementMatches,
            totalPlacements: 10,
            placed: ranked.isPlaced,
            rank: ranked.isPlaced ? this.getRankDisplayName() : 'Unranked',
            mmr: ranked.mmr
        };
    }

    // Update rank and division based on current MMR
    updateRankFromMMR() {
        const ranked = gameData.data.ranked;
        const tiers = this.getRankTiers();

        for (const [rankKey, tier] of Object.entries(tiers)) {
            if (ranked.mmr >= tier.minMMR && ranked.mmr <= tier.maxMMR) {
                ranked.rank = rankKey;

                // Calculate division based on MMR within tier
                if (tier.divisions.length > 1) {
                    const tierRange = tier.maxMMR - tier.minMMR;
                    const mmrInTier = ranked.mmr - tier.minMMR;
                    const divisionIndex = Math.floor((mmrInTier / tierRange) * 4);
                    ranked.division = tier.divisions[Math.min(3 - divisionIndex, 3)];
                } else {
                    ranked.division = 1;
                }

                break;
            }
        }
    }

    // Promote to next division/rank
    promote() {
        const ranked = gameData.data.ranked;
        const tiers = this.getRankTiers();
        const currentTier = tiers[ranked.rank];

        ranked.lp = 0;

        // If in division 1, promote to next tier
        if (ranked.division === 1) {
            const rankOrder = ['bronze', 'silver', 'gold', 'platinum', 'diamond', 'master', 'grandmaster'];
            const currentIndex = rankOrder.indexOf(ranked.rank);

            if (currentIndex < rankOrder.length - 1) {
                ranked.rank = rankOrder[currentIndex + 1];
                const newTier = tiers[ranked.rank];
                ranked.division = newTier.divisions[newTier.divisions.length - 1];

                return {
                    type: 'tier_promotion',
                    newRank: this.getRankDisplayName()
                };
            }
        } else {
            // Promote to next division
            ranked.division--;

            return {
                type: 'division_promotion',
                newRank: this.getRankDisplayName()
            };
        }
    }

    // Demote to previous division/rank
    demote() {
        const ranked = gameData.data.ranked;
        const tiers = this.getRankTiers();
        const currentTier = tiers[ranked.rank];

        ranked.lp = 50; // Start at 50 LP after demotion

        // If in division 4, demote to previous tier
        if (ranked.division === 4 || ranked.division === currentTier.divisions[currentTier.divisions.length - 1]) {
            const rankOrder = ['bronze', 'silver', 'gold', 'platinum', 'diamond', 'master', 'grandmaster'];
            const currentIndex = rankOrder.indexOf(ranked.rank);

            if (currentIndex > 0) {
                ranked.rank = rankOrder[currentIndex - 1];
                ranked.division = 1;

                return {
                    type: 'tier_demotion',
                    newRank: this.getRankDisplayName()
                };
            } else {
                // Can't demote below Bronze 4
                ranked.lp = 0;
            }
        } else {
            // Demote to previous division
            ranked.division++;

            return {
                type: 'division_demotion',
                newRank: this.getRankDisplayName()
            };
        }
    }

    // Update highest rank achieved
    updateHighestRank() {
        const ranked = gameData.data.ranked;
        const rankOrder = ['bronze', 'silver', 'gold', 'platinum', 'diamond', 'master', 'grandmaster'];

        const currentRankIndex = rankOrder.indexOf(ranked.rank);
        const highestRankIndex = rankOrder.indexOf(ranked.highestRank);

        if (currentRankIndex > highestRankIndex) {
            ranked.highestRank = ranked.rank;
        }
    }

    // Rank decay for inactivity
    applyRankDecay() {
        const ranked = gameData.data.ranked;

        // Only apply decay to Diamond and above
        const rankOrder = ['bronze', 'silver', 'gold', 'platinum', 'diamond', 'master', 'grandmaster'];
        const currentRankIndex = rankOrder.indexOf(ranked.rank);

        if (currentRankIndex < 4) return; // Below Diamond, no decay

        const lastPlayed = new Date(ranked.lastPlayedDate);
        const now = new Date();
        const daysSinceLastGame = Math.floor((now - lastPlayed) / (1000 * 60 * 60 * 24));

        // Decay starts after 7 days, lose LP every day after
        if (daysSinceLastGame > 7) {
            const decayDays = daysSinceLastGame - 7;
            const lpLoss = decayDays * 5; // 5 LP per day

            ranked.lp -= lpLoss;

            if (ranked.lp < 0) {
                this.demote();
            }

            gameData.save();

            return {
                decayed: true,
                lpLost: lpLoss,
                daysSinceLastGame: daysSinceLastGame
            };
        }

        return { decayed: false };
    }

    // Season management
    getCurrentSeason() {
        const ranked = gameData.data.ranked;

        return {
            number: ranked.currentSeason,
            name: this.getSeasonName(ranked.currentSeason),
            startDate: new Date(ranked.seasonStartDate),
            endDate: this.getSeasonEndDate(),
            daysRemaining: this.getSeasonDaysRemaining()
        };
    }

    getSeasonName(seasonNum) {
        const names = [
            'Initialization',
            'Deployment',
            'Refactor',
            'Optimization',
            'Scalability',
            'Innovation',
            'Evolution',
            'Revolution'
        ];
        return names[(seasonNum - 1) % names.length] || `Season ${seasonNum}`;
    }

    getSeasonEndDate() {
        const start = new Date(gameData.data.ranked.seasonStartDate);
        const end = new Date(start);
        end.setDate(end.getDate() + 90); // 3 month seasons
        return end;
    }

    getSeasonDaysRemaining() {
        const now = new Date();
        const end = this.getSeasonEndDate();
        const diff = end - now;
        return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    }

    // End season and start new one
    endSeason() {
        const ranked = gameData.data.ranked;

        // Archive current season
        if (!ranked.seasonHistory) {
            ranked.seasonHistory = [];
        }

        ranked.seasonHistory.push({
            season: ranked.currentSeason,
            finalRank: ranked.rank,
            finalDivision: ranked.division,
            finalMMR: ranked.mmr,
            wins: ranked.wins,
            losses: ranked.losses,
            winRate: this.getWinRate(),
            highestRank: ranked.highestRank,
            rewards: this.calculateSeasonRewards()
        });

        // Distribute season rewards
        const rewards = this.calculateSeasonRewards();
        this.distributeSeasonRewards(rewards);

        // Soft reset MMR
        const softResetMMR = Math.floor((ranked.mmr + 1000) / 2);

        // Start new season
        ranked.currentSeason++;
        ranked.seasonStartDate = new Date().toISOString();
        ranked.mmr = softResetMMR;
        ranked.wins = 0;
        ranked.losses = 0;
        ranked.winStreak = 0;
        ranked.placementMatches = 0;
        ranked.isPlaced = false;
        ranked.lp = 0;

        // Reset to Bronze 4 but keep soft MMR
        ranked.rank = 'bronze';
        ranked.division = 4;

        gameData.save();

        return {
            newSeason: ranked.currentSeason,
            seasonName: this.getSeasonName(ranked.currentSeason),
            rewards: rewards,
            newMMR: ranked.mmr
        };
    }

    // Calculate season-end rewards
    calculateSeasonRewards() {
        const ranked = gameData.data.ranked;
        const tiers = this.getRankTiers();
        const tier = tiers[ranked.rank];

        const rewards = {
            coins: 0,
            title: null,
            skin: null,
            icon: null,
            banner: null
        };

        // Rewards based on rank
        const rankOrder = ['bronze', 'silver', 'gold', 'platinum', 'diamond', 'master', 'grandmaster'];
        const rankIndex = rankOrder.indexOf(ranked.rank);

        // Coins based on rank
        const coinRewards = [1000, 2500, 5000, 10000, 20000, 40000, 100000];
        rewards.coins = coinRewards[rankIndex] || 1000;

        // Titles
        const titleRewards = {
            bronze: null,
            silver: 'Silver Streak',
            gold: 'Golden Coder',
            platinum: 'Platinum Developer',
            diamond: 'Diamond Engineer',
            master: 'Code Master',
            grandmaster: 'Grandmaster Programmer'
        };
        rewards.title = titleRewards[ranked.rank];

        // Exclusive skins for high ranks
        if (ranked.rank === 'master') {
            rewards.skin = 'master_season_' + ranked.currentSeason;
        } else if (ranked.rank === 'grandmaster') {
            rewards.skin = 'grandmaster_season_' + ranked.currentSeason;
        }

        // Banner for Diamond+
        if (rankIndex >= 4) {
            rewards.banner = `season_${ranked.currentSeason}_${ranked.rank}`;
        }

        // Icon for everyone
        rewards.icon = `season_${ranked.currentSeason}`;

        return rewards;
    }

    // Distribute season rewards
    distributeSeasonRewards(rewards) {
        // Add coins
        if (rewards.coins) {
            gameData.data.stats.totalScore += rewards.coins;
        }

        // Unlock title
        if (rewards.title) {
            if (!gameData.data.titles) gameData.data.titles = [];
            if (!gameData.data.titles.includes(rewards.title)) {
                gameData.data.titles.push(rewards.title);
            }
        }

        // Unlock skin
        if (rewards.skin) {
            if (!gameData.data.customization.unlockedSkins.includes(rewards.skin)) {
                gameData.data.customization.unlockedSkins.push(rewards.skin);
            }
        }

        // Unlock banner
        if (rewards.banner) {
            if (!gameData.data.banners) gameData.data.banners = { unlocked: [] };
            if (!gameData.data.banners.unlocked.includes(rewards.banner)) {
                gameData.data.banners.unlocked.push(rewards.banner);
            }
        }

        gameData.save();
    }

    // Leaderboard
    getLeaderboard(mode = 'ranked', limit = 100) {
        // In a real game, this would fetch from a server
        // For now, return mock data
        const ranked = gameData.data.ranked;

        return {
            playerRank: this.calculateLeaderboardPosition(ranked.mmr),
            playerMMR: ranked.mmr,
            topPlayers: this.generateMockLeaderboard(limit)
        };
    }

    calculateLeaderboardPosition(mmr) {
        // Mock calculation based on MMR distribution
        if (mmr >= 2300) return Math.floor(Math.random() * 100) + 1;
        if (mmr >= 2000) return Math.floor(Math.random() * 500) + 100;
        if (mmr >= 1800) return Math.floor(Math.random() * 2000) + 600;
        if (mmr >= 1600) return Math.floor(Math.random() * 5000) + 2600;
        return Math.floor(Math.random() * 50000) + 7600;
    }

    generateMockLeaderboard(limit) {
        const leaderboard = [];
        const names = [
            'CodeMaster', 'DebugKing', 'RefactorQueen', 'MergeWizard',
            'ProductionHero', 'SecurityGuru', 'TestingLegend', 'DevOpsNinja',
            'ArchitectPro', 'ScriptKiddo', 'BugHunter', 'GitGod'
        ];

        for (let i = 0; i < Math.min(limit, 100); i++) {
            leaderboard.push({
                rank: i + 1,
                name: names[Math.floor(Math.random() * names.length)] + Math.floor(Math.random() * 9999),
                mmr: 2500 - (i * 10) + Math.floor(Math.random() * 20),
                wins: Math.floor(Math.random() * 500) + 50,
                losses: Math.floor(Math.random() * 400) + 30,
                winRate: Math.floor(Math.random() * 30) + 50
            });
        }

        return leaderboard;
    }

    // Get progress to next rank
    getProgressToNextRank() {
        const ranked = gameData.data.ranked;
        const currentRank = this.getCurrentRank();

        return {
            currentLP: ranked.lp,
            lpToPromotion: 100 - ranked.lp,
            progressPercent: ranked.lp,
            currentRank: this.getRankDisplayName(),
            nextRank: this.getNextRankName()
        };
    }

    getNextRankName() {
        const ranked = gameData.data.ranked;
        const tiers = this.getRankTiers();
        const currentTier = tiers[ranked.rank];

        if (ranked.division === 1) {
            const rankOrder = ['bronze', 'silver', 'gold', 'platinum', 'diamond', 'master', 'grandmaster'];
            const currentIndex = rankOrder.indexOf(ranked.rank);

            if (currentIndex < rankOrder.length - 1) {
                const nextRankKey = rankOrder[currentIndex + 1];
                const nextTier = tiers[nextRankKey];
                return `${nextTier.name} ${nextTier.divisions[nextTier.divisions.length - 1]}`;
            }

            return 'Max Rank';
        }

        return `${currentTier.name} ${ranked.division - 1}`;
    }
}

// Singleton
export const rankedSystem = new RankedSystem();
