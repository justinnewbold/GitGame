// Clan/Guild System - Team up with other players for shared progression

import { gameData } from './GameData.js';

export default class ClanSystem {
    constructor() {
        this.initializeClans();
    }

    initializeClans() {
        if (!gameData.data.clan) {
            gameData.data.clan = {
                clanId: null,
                role: null, // 'leader', 'officer', 'member'
                joinDate: null,
                contributionPoints: 0,
                clanData: null // Full clan data if player is in a clan
            };
            gameData.save();
        }
    }

    // Clan structure
    createClan(name, tag, description = '') {
        const playerClan = gameData.data.clan;

        if (playerClan.clanId) {
            return { success: false, message: 'Already in a clan!' };
        }

        // Validate clan name and tag
        if (name.length < 3 || name.length > 30) {
            return { success: false, message: 'Clan name must be 3-30 characters!' };
        }

        if (tag.length < 2 || tag.length > 5) {
            return { success: false, message: 'Clan tag must be 2-5 characters!' };
        }

        // Create cost
        const createCost = 10000;
        if (gameData.data.stats.totalScore < createCost) {
            return { success: false, message: `Need ${createCost} coins to create a clan!` };
        }

        // Deduct cost
        gameData.data.stats.totalScore -= createCost;

        const clanId = 'clan_' + Date.now();

        const newClan = {
            id: clanId,
            name: name,
            tag: tag,
            description: description,
            level: 1,
            xp: 0,
            createdDate: new Date().toISOString(),
            icon: '⚔️',
            color: 0x4CAF50,

            // Members
            members: [
                {
                    playerId: 'player',
                    name: 'You',
                    role: 'leader',
                    joinDate: new Date().toISOString(),
                    contributionPoints: 0,
                    lastActive: new Date().toISOString()
                }
            ],
            maxMembers: 30,

            // Stats
            stats: {
                totalXP: 0,
                totalWins: 0,
                totalGamesPlayed: 0,
                bossesDefeated: 0,
                achievementsUnlocked: 0
            },

            // Treasury
            treasury: {
                coins: 0,
                resources: 0
            },

            // Perks
            perks: {
                xpBoost: 0,
                coinBoost: 0,
                memberSlots: 0,
                warBonuses: 0
            },

            // Settings
            settings: {
                joinType: 'open', // 'open', 'approval', 'invite_only'
                minLevel: 1,
                language: 'en',
                region: 'global'
            },

            // Wars
            wars: {
                wins: 0,
                losses: 0,
                currentWar: null,
                warHistory: []
            },

            // Achievements
            achievements: []
        };

        // Set player clan data
        playerClan.clanId = clanId;
        playerClan.role = 'leader';
        playerClan.joinDate = new Date().toISOString();
        playerClan.clanData = newClan;

        gameData.save();

        return {
            success: true,
            clan: newClan,
            message: `Clan [${tag}] ${name} created successfully!`
        };
    }

    // Join a clan
    joinClan(clanId, password = null) {
        const playerClan = gameData.data.clan;

        if (playerClan.clanId) {
            return { success: false, message: 'Already in a clan!' };
        }

        // In a real game, this would fetch clan from server
        // For now, simulate
        return {
            success: true,
            message: 'Clan join request sent!',
            pending: true
        };
    }

    // Leave clan
    leaveClan() {
        const playerClan = gameData.data.clan;

        if (!playerClan.clanId) {
            return { success: false, message: 'Not in a clan!' };
        }

        if (playerClan.role === 'leader' && playerClan.clanData.members.length > 1) {
            return {
                success: false,
                message: 'Transfer leadership before leaving!'
            };
        }

        // Leave clan
        const clanName = playerClan.clanData?.name || 'Unknown';

        playerClan.clanId = null;
        playerClan.role = null;
        playerClan.joinDate = null;
        playerClan.contributionPoints = 0;
        playerClan.clanData = null;

        gameData.save();

        return {
            success: true,
            message: `Left clan ${clanName}`
        };
    }

    // Contribute to clan
    contribute(type, amount) {
        const playerClan = gameData.data.clan;

        if (!playerClan.clanId) {
            return { success: false, message: 'Not in a clan!' };
        }

        const clan = playerClan.clanData;

        if (type === 'coins') {
            if (gameData.data.stats.totalScore < amount) {
                return { success: false, message: 'Not enough coins!' };
            }

            gameData.data.stats.totalScore -= amount;
            clan.treasury.coins += amount;
            playerClan.contributionPoints += amount;

            this.addClanXP(amount / 10);
        }

        gameData.save();

        return {
            success: true,
            contributed: amount,
            contributionPoints: playerClan.contributionPoints
        };
    }

    // Add XP to clan
    addClanXP(amount) {
        const playerClan = gameData.data.clan;
        if (!playerClan.clanData) return;

        const clan = playerClan.clanData;
        clan.xp += amount;
        clan.stats.totalXP += amount;

        // Check for level up
        while (clan.level < 50) {
            const requiredXP = this.getRequiredClanXP(clan.level);

            if (clan.xp >= requiredXP) {
                clan.xp -= requiredXP;
                clan.level++;

                // Unlock clan perk
                this.unlockClanPerk(clan.level);
            } else {
                break;
            }
        }

        gameData.save();
    }

    // XP required for clan level
    getRequiredClanXP(level) {
        return 1000 * level * 1.5;
    }

    // Unlock clan perks
    unlockClanPerk(level) {
        const playerClan = gameData.data.clan;
        if (!playerClan.clanData) return;

        const clan = playerClan.clanData;

        // Perks every 5 levels
        if (level % 5 === 0) {
            clan.perks.xpBoost += 0.05; // +5% XP per 5 levels
            clan.perks.coinBoost += 0.05; // +5% coins per 5 levels
        }

        // Member slots every 10 levels
        if (level % 10 === 0) {
            clan.maxMembers += 10;
            clan.perks.memberSlots++;
        }

        // War bonuses at certain levels
        if (level === 20 || level === 35 || level === 50) {
            clan.perks.warBonuses++;
        }

        gameData.save();
    }

    // Get clan info
    getClanInfo() {
        const playerClan = gameData.data.clan;

        if (!playerClan.clanId) {
            return null;
        }

        const clan = playerClan.clanData;

        return {
            ...clan,
            requiredXP: this.getRequiredClanXP(clan.level),
            progress: (clan.xp / this.getRequiredClanXP(clan.level)) * 100,
            playerRole: playerClan.role,
            playerContribution: playerClan.contributionPoints,
            activeBonuses: this.getActiveClanBonuses()
        };
    }

    // Get active clan bonuses
    getActiveClanBonuses() {
        const playerClan = gameData.data.clan;
        if (!playerClan.clanData) return {};

        const clan = playerClan.clanData;

        return {
            xpBonus: 1 + clan.perks.xpBoost,
            coinBonus: 1 + clan.perks.coinBoost,
            memberSlots: clan.maxMembers,
            warBonuses: clan.perks.warBonuses
        };
    }

    // Promote/demote member
    changeMemberRole(memberId, newRole) {
        const playerClan = gameData.data.clan;

        if (!playerClan.clanId) {
            return { success: false, message: 'Not in a clan!' };
        }

        if (playerClan.role !== 'leader' && playerClan.role !== 'officer') {
            return { success: false, message: 'No permission!' };
        }

        const clan = playerClan.clanData;
        const member = clan.members.find(m => m.playerId === memberId);

        if (!member) {
            return { success: false, message: 'Member not found!' };
        }

        member.role = newRole;
        gameData.save();

        return {
            success: true,
            message: `${member.name} is now ${newRole}`
        };
    }

    // Kick member
    kickMember(memberId) {
        const playerClan = gameData.data.clan;

        if (!playerClan.clanId) {
            return { success: false, message: 'Not in a clan!' };
        }

        if (playerClan.role !== 'leader' && playerClan.role !== 'officer') {
            return { success: false, message: 'No permission!' };
        }

        const clan = playerClan.clanData;
        const memberIndex = clan.members.findIndex(m => m.playerId === memberId);

        if (memberIndex === -1) {
            return { success: false, message: 'Member not found!' };
        }

        const member = clan.members[memberIndex];

        if (member.role === 'leader') {
            return { success: false, message: 'Cannot kick clan leader!' };
        }

        clan.members.splice(memberIndex, 1);
        gameData.save();

        return {
            success: true,
            message: `${member.name} has been kicked`
        };
    }

    // Transfer leadership
    transferLeadership(memberId) {
        const playerClan = gameData.data.clan;

        if (!playerClan.clanId) {
            return { success: false, message: 'Not in a clan!' };
        }

        if (playerClan.role !== 'leader') {
            return { success: false, message: 'Only leader can transfer!' };
        }

        const clan = playerClan.clanData;
        const newLeader = clan.members.find(m => m.playerId === memberId);
        const currentLeader = clan.members.find(m => m.playerId === 'player');

        if (!newLeader) {
            return { success: false, message: 'Member not found!' };
        }

        newLeader.role = 'leader';
        currentLeader.role = 'officer';
        playerClan.role = 'officer';

        gameData.save();

        return {
            success: true,
            message: `${newLeader.name} is now the clan leader`
        };
    }

    // Clan Wars
    startClanWar(opponentClanId) {
        const playerClan = gameData.data.clan;

        if (!playerClan.clanId) {
            return { success: false, message: 'Not in a clan!' };
        }

        if (playerClan.role !== 'leader' && playerClan.role !== 'officer') {
            return { success: false, message: 'No permission to start wars!' };
        }

        const clan = playerClan.clanData;

        if (clan.wars.currentWar) {
            return { success: false, message: 'Already in a war!' };
        }

        // In a real game, this would match with another clan
        const war = {
            id: 'war_' + Date.now(),
            opponentClanId: opponentClanId,
            opponentClanName: 'Enemy Clan',
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), // 48 hours
            yourScore: 0,
            opponentScore: 0,
            status: 'active',
            participants: []
        };

        clan.wars.currentWar = war;
        gameData.save();

        return {
            success: true,
            war: war,
            message: 'Clan war started!'
        };
    }

    // Contribute to clan war
    contributeToWar(points) {
        const playerClan = gameData.data.clan;

        if (!playerClan.clanId) {
            return { success: false, message: 'Not in a clan!' };
        }

        const clan = playerClan.clanData;

        if (!clan.wars.currentWar) {
            return { success: false, message: 'No active war!' };
        }

        clan.wars.currentWar.yourScore += points;

        // Check if player already participated
        const participant = clan.wars.currentWar.participants.find(p => p.playerId === 'player');

        if (participant) {
            participant.score += points;
        } else {
            clan.wars.currentWar.participants.push({
                playerId: 'player',
                name: 'You',
                score: points
            });
        }

        gameData.save();

        return {
            success: true,
            totalScore: clan.wars.currentWar.yourScore,
            message: `Contributed ${points} war points!`
        };
    }

    // End clan war
    endClanWar() {
        const playerClan = gameData.data.clan;

        if (!playerClan.clanId) return;

        const clan = playerClan.clanData;
        const war = clan.wars.currentWar;

        if (!war) return;

        // Simulate opponent score
        war.opponentScore = Math.floor(Math.random() * war.yourScore * 1.5);

        const won = war.yourScore > war.opponentScore;

        war.status = won ? 'won' : 'lost';

        // Update war record
        if (won) {
            clan.wars.wins++;
        } else {
            clan.wars.losses++;
        }

        // Archive war
        clan.wars.warHistory.push({
            ...war,
            endedDate: new Date().toISOString()
        });

        // Distribute rewards
        if (won) {
            const warReward = 5000 + (war.yourScore * 2);
            clan.treasury.coins += warReward;

            this.addClanXP(war.yourScore);
        }

        clan.wars.currentWar = null;
        gameData.save();

        return {
            won: won,
            yourScore: war.yourScore,
            opponentScore: war.opponentScore,
            rewards: won ? { coins: 5000, xp: war.yourScore } : null
        };
    }

    // Clan achievements
    checkClanAchievements() {
        const playerClan = gameData.data.clan;
        if (!playerClan.clanData) return [];

        const clan = playerClan.clanData;
        const unlocked = [];

        const achievements = [
            {
                id: 'clan_first_level',
                name: 'Getting Started',
                description: 'Reach clan level 5',
                condition: () => clan.level >= 5,
                reward: { coins: 1000 }
            },
            {
                id: 'clan_mid_level',
                name: 'Growing Strong',
                description: 'Reach clan level 25',
                condition: () => clan.level >= 25,
                reward: { coins: 5000 }
            },
            {
                id: 'clan_max_level',
                name: 'Elite Clan',
                description: 'Reach clan level 50',
                condition: () => clan.level >= 50,
                reward: { coins: 20000 }
            },
            {
                id: 'clan_first_war',
                name: 'First Victory',
                description: 'Win your first clan war',
                condition: () => clan.wars.wins >= 1,
                reward: { coins: 2000 }
            },
            {
                id: 'clan_war_champion',
                name: 'War Champion',
                description: 'Win 10 clan wars',
                condition: () => clan.wars.wins >= 10,
                reward: { coins: 10000 }
            },
            {
                id: 'clan_full_roster',
                name: 'Full House',
                description: 'Have max members in clan',
                condition: () => clan.members.length >= clan.maxMembers,
                reward: { coins: 3000 }
            }
        ];

        achievements.forEach(achievement => {
            if (!clan.achievements.includes(achievement.id) && achievement.condition()) {
                clan.achievements.push(achievement.id);
                unlocked.push(achievement);

                // Give rewards
                if (achievement.reward.coins) {
                    clan.treasury.coins += achievement.reward.coins;
                }
            }
        });

        if (unlocked.length > 0) {
            gameData.save();
        }

        return unlocked;
    }

    // Get clan leaderboard
    getClanLeaderboard() {
        // In a real game, fetch from server
        // For now, generate mock data
        return this.generateMockClanLeaderboard();
    }

    generateMockClanLeaderboard() {
        const clans = [];
        const names = [
            'Code Warriors', 'Debug Masters', 'Syntax Errors',
            'Merge Conflicts', 'Git Gud', 'Stack Overflow',
            'Binary Beasts', 'Byte Breakers', 'Compile Time',
            'Runtime Errors'
        ];

        const tags = ['CODE', 'DEBG', 'SYNTX', 'MERGE', 'GITG', 'STKOF', 'BINRY', 'BYTE', 'CMPL', 'RNTM'];

        for (let i = 0; i < 100; i++) {
            clans.push({
                rank: i + 1,
                name: names[i % names.length],
                tag: tags[i % tags.length],
                level: Math.floor(Math.random() * 50) + 1,
                members: Math.floor(Math.random() * 40) + 10,
                totalXP: Math.floor(Math.random() * 1000000),
                warWins: Math.floor(Math.random() * 50)
            });
        }

        // Sort by total XP
        clans.sort((a, b) => b.totalXP - a.totalXP);

        return clans;
    }

    // Clan chat (basic message system)
    sendClanMessage(message) {
        const playerClan = gameData.data.clan;

        if (!playerClan.clanId) {
            return { success: false, message: 'Not in a clan!' };
        }

        // In a real game, this would send to server
        return {
            success: true,
            message: 'Message sent to clan chat!'
        };
    }

    // Get member contribution ranking
    getMemberRankings() {
        const playerClan = gameData.data.clan;
        if (!playerClan.clanData) return [];

        const clan = playerClan.clanData;

        const rankings = clan.members
            .map(member => ({
                name: member.name,
                role: member.role,
                contribution: member.contributionPoints,
                joinDate: member.joinDate
            }))
            .sort((a, b) => b.contribution - a.contribution);

        return rankings;
    }

    // Clan shop (spend clan treasury)
    purchaseClanPerk(perkId) {
        const playerClan = gameData.data.clan;

        if (!playerClan.clanId) {
            return { success: false, message: 'Not in a clan!' };
        }

        if (playerClan.role !== 'leader' && playerClan.role !== 'officer') {
            return { success: false, message: 'No permission!' };
        }

        const clan = playerClan.clanData;

        const clanPerks = {
            xp_boost: { cost: 10000, effect: 'Increase XP gain by 5%' },
            coin_boost: { cost: 10000, effect: 'Increase coin gain by 5%' },
            member_slots: { cost: 20000, effect: 'Add 5 member slots' },
            war_preparation: { cost: 15000, effect: 'Reduce war cooldown' }
        };

        const perk = clanPerks[perkId];

        if (!perk) {
            return { success: false, message: 'Invalid perk!' };
        }

        if (clan.treasury.coins < perk.cost) {
            return { success: false, message: 'Not enough clan coins!' };
        }

        clan.treasury.coins -= perk.cost;

        // Apply perk
        if (perkId === 'xp_boost') {
            clan.perks.xpBoost += 0.05;
        } else if (perkId === 'coin_boost') {
            clan.perks.coinBoost += 0.05;
        } else if (perkId === 'member_slots') {
            clan.maxMembers += 5;
        }

        gameData.save();

        return {
            success: true,
            perk: perk,
            message: `Purchased ${perkId}!`
        };
    }
}

// Singleton
export const clanSystem = new ClanSystem();
