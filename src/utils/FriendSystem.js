// Friend System - Add friends, send challenges, compare scores

import { gameData } from './GameData.js';

export default class FriendSystem {
    constructor() {
        this.initializeFriends();
    }

    initializeFriends() {
        if (!gameData.data.friends) {
            gameData.data.friends = {
                friendList: [],
                pendingRequests: [],
                sentRequests: [],
                blocked: [],
                settings: {
                    allowRequests: true,
                    showOnlineStatus: true,
                    allowChallenges: true
                },
                stats: {
                    totalFriends: 0,
                    challengesSent: 0,
                    challengesWon: 0
                }
            };
            gameData.save();
        }
    }

    // Send friend request
    sendFriendRequest(playerId, playerName) {
        const friends = gameData.data.friends;

        if (friends.friendList.some(f => f.id === playerId)) {
            return { success: false, message: 'Already friends!' };
        }

        if (friends.sentRequests.includes(playerId)) {
            return { success: false, message: 'Request already sent!' };
        }

        if (friends.blocked.includes(playerId)) {
            return { success: false, message: 'Cannot send request to blocked player!' };
        }

        friends.sentRequests.push(playerId);
        gameData.save();

        return {
            success: true,
            message: `Friend request sent to ${playerName}!`
        };
    }

    // Accept friend request
    acceptFriendRequest(playerId, playerName) {
        const friends = gameData.data.friends;

        if (!friends.pendingRequests.includes(playerId)) {
            return { success: false, message: 'No pending request from this player!' };
        }

        const newFriend = {
            id: playerId,
            name: playerName,
            addedDate: new Date().toISOString(),
            lastOnline: new Date().toISOString(),
            online: false,
            level: 1,
            rank: 'bronze',
            status: 'offline'
        };

        friends.friendList.push(newFriend);
        friends.pendingRequests = friends.pendingRequests.filter(id => id !== playerId);
        friends.stats.totalFriends++;

        gameData.save();

        return {
            success: true,
            message: `${playerName} is now your friend!`,
            friend: newFriend
        };
    }

    // Decline friend request
    declineFriendRequest(playerId) {
        const friends = gameData.data.friends;

        friends.pendingRequests = friends.pendingRequests.filter(id => id !== playerId);
        gameData.save();

        return { success: true, message: 'Friend request declined!' };
    }

    // Remove friend
    removeFriend(playerId) {
        const friends = gameData.data.friends;

        const friend = friends.friendList.find(f => f.id === playerId);

        if (!friend) {
            return { success: false, message: 'Not in friend list!' };
        }

        friends.friendList = friends.friendList.filter(f => f.id !== playerId);
        friends.stats.totalFriends--;

        gameData.save();

        return {
            success: true,
            message: `Removed ${friend.name} from friends!`
        };
    }

    // Block player
    blockPlayer(playerId) {
        const friends = gameData.data.friends;

        if (friends.blocked.includes(playerId)) {
            return { success: false, message: 'Already blocked!' };
        }

        friends.blocked.push(playerId);

        // Remove from friends if present
        friends.friendList = friends.friendList.filter(f => f.id !== playerId);

        // Remove pending requests
        friends.pendingRequests = friends.pendingRequests.filter(id => id !== playerId);
        friends.sentRequests = friends.sentRequests.filter(id => id !== playerId);

        gameData.save();

        return { success: true, message: 'Player blocked!' };
    }

    // Unblock player
    unblockPlayer(playerId) {
        const friends = gameData.data.friends;

        friends.blocked = friends.blocked.filter(id => id !== playerId);
        gameData.save();

        return { success: true, message: 'Player unblocked!' };
    }

    // Get friend list
    getFriendList(sortBy = 'online') {
        const friends = gameData.data.friends.friendList;

        switch (sortBy) {
            case 'online':
                return friends.sort((a, b) => b.online - a.online);

            case 'name':
                return friends.sort((a, b) => a.name.localeCompare(b.name));

            case 'level':
                return friends.sort((a, b) => b.level - a.level);

            case 'recent':
                return friends.sort((a, b) =>
                    new Date(b.lastOnline) - new Date(a.lastOnline)
                );

            default:
                return friends;
        }
    }

    // Get online friends
    getOnlineFriends() {
        return gameData.data.friends.friendList.filter(f => f.online);
    }

    // Get pending requests
    getPendingRequests() {
        return gameData.data.friends.pendingRequests;
    }

    // Send challenge to friend
    sendChallenge(friendId, mode, bet = 0) {
        const friends = gameData.data.friends;

        if (!friends.settings.allowChallenges) {
            return { success: false, message: 'Challenges disabled!' };
        }

        const friend = friends.friendList.find(f => f.id === friendId);

        if (!friend) {
            return { success: false, message: 'Not in friend list!' };
        }

        const challenge = {
            id: 'challenge_' + Date.now(),
            from: 'player',
            to: friendId,
            mode: mode,
            bet: bet,
            status: 'pending',
            sentDate: new Date().toISOString()
        };

        // In real game, this would send to server
        friends.stats.challengesSent++;
        gameData.save();

        return {
            success: true,
            challenge: challenge,
            message: `Challenge sent to ${friend.name}!`
        };
    }

    // Compare scores with friend
    compareScores(friendId, mode = null) {
        const friend = gameData.data.friends.friendList.find(f => f.id === friendId);

        if (!friend) {
            return { success: false, message: 'Friend not found!' };
        }

        // In real game, fetch friend's scores from server
        // For now, generate mock comparison
        const comparison = {
            player: {
                name: 'You',
                totalScore: gameData.data.stats.totalScore,
                level: gameData.data.profile?.level || 1,
                rank: gameData.data.ranked?.rank || 'bronze'
            },
            friend: {
                name: friend.name,
                totalScore: Math.floor(Math.random() * 100000),
                level: friend.level,
                rank: friend.rank
            }
        };

        if (mode) {
            const playerModeStats = gameData.data.stats[mode];
            comparison.player.modeStats = playerModeStats;
            comparison.friend.modeStats = {
                highScore: Math.floor(Math.random() * 10000),
                gamesPlayed: Math.floor(Math.random() * 100)
            };
        }

        return {
            success: true,
            comparison: comparison
        };
    }

    // Get friend leaderboard
    getFriendLeaderboard(mode = null, stat = 'totalScore') {
        const friends = gameData.data.friends.friendList;

        // In real game, fetch from server
        // For now, generate mock leaderboard
        const leaderboard = friends.map(friend => ({
            id: friend.id,
            name: friend.name,
            value: Math.floor(Math.random() * 100000),
            rank: friend.rank,
            level: friend.level
        }));

        // Add player
        leaderboard.push({
            id: 'player',
            name: 'You',
            value: gameData.data.stats.totalScore,
            rank: gameData.data.ranked?.rank || 'bronze',
            level: gameData.data.profile?.level || 1
        });

        // Sort by value
        leaderboard.sort((a, b) => b.value - a.value);

        // Add positions
        leaderboard.forEach((entry, index) => {
            entry.position = index + 1;
        });

        return leaderboard;
    }

    // Gift items to friend
    giftItem(friendId, itemType, itemId) {
        const friend = gameData.data.friends.friendList.find(f => f.id === friendId);

        if (!friend) {
            return { success: false, message: 'Friend not found!' };
        }

        // In real game, send gift to server
        return {
            success: true,
            message: `Gift sent to ${friend.name}!`
        };
    }

    // Update friend settings
    updateSettings(newSettings) {
        const friends = gameData.data.friends;

        friends.settings = {
            ...friends.settings,
            ...newSettings
        };

        gameData.save();

        return { success: true, settings: friends.settings };
    }

    // Search for players
    searchPlayers(query) {
        // In real game, query server
        // For now, return mock results
        const mockPlayers = [
            { id: 'player1', name: 'CodeMaster', level: 25, rank: 'gold' },
            { id: 'player2', name: 'DebugKing', level: 42, rank: 'platinum' },
            { id: 'player3', name: 'RefactorQueen', level: 18, rank: 'silver' }
        ];

        return mockPlayers.filter(p =>
            p.name.toLowerCase().includes(query.toLowerCase())
        );
    }

    // Get stats
    getStats() {
        return gameData.data.friends.stats;
    }

    // Get friend by ID
    getFriend(friendId) {
        return gameData.data.friends.friendList.find(f => f.id === friendId);
    }

    // Update friend status (mock - in real game would come from server)
    updateFriendStatus(friendId, online, status = 'online') {
        const friend = this.getFriend(friendId);

        if (friend) {
            friend.online = online;
            friend.status = status;
            friend.lastOnline = new Date().toISOString();
            gameData.save();
        }
    }

    // Get suggested friends (based on mutual friends, similar level, etc.)
    getSuggestedFriends() {
        // In real game, get from server based on algorithms
        // For now, return mock suggestions
        return [
            { id: 'suggested1', name: 'ProGamer99', level: 20, mutualFriends: 3 },
            { id: 'suggested2', name: 'DevOpsNinja', level: 22, mutualFriends: 2 },
            { id: 'suggested3', name: 'BugHunter', level: 18, mutualFriends: 5 }
        ];
    }

    // Get recent players (players you've played with recently)
    getRecentPlayers() {
        // In real game, track players from multiplayer matches
        return [];
    }

    // Get mutual friends with another player
    getMutualFriends(playerId) {
        // In real game, query server
        return [];
    }

    // Send message to friend
    sendMessage(friendId, message) {
        const friend = this.getFriend(friendId);

        if (!friend) {
            return { success: false, message: 'Friend not found!' };
        }

        // In real game, send to server
        return {
            success: true,
            message: 'Message sent!'
        };
    }

    // Invite friend to game
    inviteToGame(friendId, mode) {
        const friend = this.getFriend(friendId);

        if (!friend) {
            return { success: false, message: 'Friend not found!' };
        }

        if (!friend.online) {
            return { success: false, message: 'Friend is offline!' };
        }

        // In real game, send invite to server
        return {
            success: true,
            message: `Invited ${friend.name} to ${mode}!`
        };
    }

    // Get friend count
    getFriendCount() {
        return gameData.data.friends.friendList.length;
    }

    // Check if at friend limit
    isAtFriendLimit() {
        const maxFriends = 200;
        return this.getFriendCount() >= maxFriends;
    }
}

// Singleton
export const friendSystem = new FriendSystem();
