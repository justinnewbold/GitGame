// Social Systems - Emotes, Profiles, and Social Features

import { gameData } from './GameData.js';

// Emote System
export class EmoteSystem {
    constructor() {
        this.initializeEmotes();
    }

    initializeEmotes() {
        if (!gameData.data.emotes) {
            gameData.data.emotes = {
                unlocked: ['wave', 'gg'], // Start with basic emotes
                equipped: ['wave', 'gg', null, null], // 4 emote slots
                favorites: [],
                stats: {
                    totalUsed: 0,
                    mostUsed: null
                }
            };
            gameData.save();
        }
    }

    // Get all available emotes
    getAllEmotes() {
        return {
            // Basic emotes
            wave: {
                id: 'wave',
                name: 'Wave',
                emoji: '👋',
                animation: 'wave',
                rarity: 'common',
                unlockRequirement: 'Default'
            },
            gg: {
                id: 'gg',
                name: 'GG',
                emoji: '🎮',
                animation: 'celebrate',
                rarity: 'common',
                unlockRequirement: 'Default'
            },
            thumbsup: {
                id: 'thumbsup',
                name: 'Thumbs Up',
                emoji: '👍',
                animation: 'thumbsup',
                rarity: 'common',
                unlockRequirement: 'Win 10 games'
            },

            // Celebration emotes
            dance: {
                id: 'dance',
                name: 'Dance',
                emoji: '💃',
                animation: 'dance',
                rarity: 'uncommon',
                unlockRequirement: 'Battle Pass Tier 1'
            },
            party: {
                id: 'party',
                name: 'Party',
                emoji: '🎉',
                animation: 'party',
                rarity: 'uncommon',
                unlockRequirement: 'Complete 5 achievements'
            },
            victory: {
                id: 'victory',
                name: 'Victory',
                emoji: '🏆',
                animation: 'victory_pose',
                rarity: 'rare',
                unlockRequirement: 'Win 50 games'
            },

            // Funny emotes
            facepalm: {
                id: 'facepalm',
                name: 'Facepalm',
                emoji: '🤦',
                animation: 'facepalm',
                rarity: 'common',
                unlockRequirement: 'Lose 10 games'
            },
            shrug: {
                id: 'shrug',
                name: 'Shrug',
                emoji: '🤷',
                animation: 'shrug',
                rarity: 'common',
                unlockRequirement: 'Play 20 games'
            },
            laugh: {
                id: 'laugh',
                name: 'Laugh',
                emoji: '😂',
                animation: 'laugh',
                rarity: 'uncommon',
                unlockRequirement: 'Score 10,000'
            },

            // Taunt emotes
            flex: {
                id: 'flex',
                name: 'Flex',
                emoji: '💪',
                animation: 'flex',
                rarity: 'rare',
                unlockRequirement: 'Reach level 25'
            },
            crown: {
                id: 'crown',
                name: 'Crown',
                emoji: '👑',
                animation: 'crown_appear',
                rarity: 'epic',
                unlockRequirement: 'Reach Grandmaster rank'
            },

            // Special emotes
            fire: {
                id: 'fire',
                name: 'On Fire',
                emoji: '🔥',
                animation: 'fire_effect',
                rarity: 'rare',
                unlockRequirement: '10x combo'
            },
            rainbow: {
                id: 'rainbow',
                name: 'Rainbow',
                emoji: '🌈',
                animation: 'rainbow_effect',
                rarity: 'epic',
                unlockRequirement: 'Find rainbow easter egg'
            },
            unicorn: {
                id: 'unicorn',
                name: 'Unicorn',
                emoji: '🦄',
                animation: 'unicorn_jump',
                rarity: 'legendary',
                unlockRequirement: 'Prestige level 5'
            },

            // Seasonal emotes
            halloween: {
                id: 'halloween',
                name: 'Spooky',
                emoji: '🎃',
                animation: 'spooky',
                rarity: 'rare',
                unlockRequirement: 'Play during Halloween',
                seasonal: true
            },
            christmas: {
                id: 'christmas',
                name: 'Ho Ho Ho',
                emoji: '🎅',
                animation: 'santa_laugh',
                rarity: 'rare',
                unlockRequirement: 'Play during Christmas',
                seasonal: true
            }
        };
    }

    // Unlock emote
    unlockEmote(emoteId) {
        const emotes = gameData.data.emotes;

        if (emotes.unlocked.includes(emoteId)) {
            return { success: false, message: 'Already unlocked!' };
        }

        emotes.unlocked.push(emoteId);
        gameData.save();

        return {
            success: true,
            message: `Emote "${emoteId}" unlocked!`
        };
    }

    // Equip emote to slot
    equipEmote(emoteId, slot) {
        const emotes = gameData.data.emotes;

        if (!emotes.unlocked.includes(emoteId)) {
            return { success: false, message: 'Emote not unlocked!' };
        }

        if (slot < 0 || slot >= emotes.equipped.length) {
            return { success: false, message: 'Invalid slot!' };
        }

        emotes.equipped[slot] = emoteId;
        gameData.save();

        return { success: true, equipped: emoteId, slot: slot };
    }

    // Use emote
    useEmote(slot) {
        const emotes = gameData.data.emotes;
        const emoteId = emotes.equipped[slot];

        if (!emoteId) {
            return { success: false, message: 'No emote in slot!' };
        }

        const allEmotes = this.getAllEmotes();
        const emote = allEmotes[emoteId];

        if (!emote) {
            return { success: false, message: 'Invalid emote!' };
        }

        // Track usage
        emotes.stats.totalUsed++;
        emotes.stats.mostUsed = emoteId;

        gameData.save();

        return {
            success: true,
            emote: emote
        };
    }

    // Add to favorites
    toggleFavorite(emoteId) {
        const emotes = gameData.data.emotes;

        if (emotes.favorites.includes(emoteId)) {
            emotes.favorites = emotes.favorites.filter(e => e !== emoteId);
        } else {
            emotes.favorites.push(emoteId);
        }

        gameData.save();

        return {
            success: true,
            favorited: emotes.favorites.includes(emoteId)
        };
    }

    // Get unlocked emotes
    getUnlockedEmotes() {
        const emotes = gameData.data.emotes;
        const allEmotes = this.getAllEmotes();

        return emotes.unlocked.map(id => allEmotes[id]).filter(e => e);
    }
}

// Profile System
export class ProfileSystem {
    constructor() {
        this.initializeProfile();
    }

    initializeProfile() {
        if (!gameData.data.profile) {
            gameData.data.profile = {
                displayName: 'Player',
                avatar: 'default',
                banner: 'default',
                title: null,
                level: 1,
                xp: 0,
                prestige: 0,
                bio: '',
                visibility: 'public', // public, friends, private
                showcaseAchievements: [],
                showcaseStats: ['totalScore', 'gamesPlayed', 'highestRank'],
                customization: {
                    primaryColor: 0x4CAF50,
                    accentColor: 0xFFD700,
                    profileBorder: 'default',
                    profileEffect: 'none'
                }
            };
            gameData.save();
        }
    }

    // Get profile
    getProfile() {
        return { ...gameData.data.profile };
    }

    // Update display name
    setDisplayName(name) {
        if (name.length < 3 || name.length > 20) {
            return { success: false, message: 'Name must be 3-20 characters!' };
        }

        gameData.data.profile.displayName = name;
        gameData.save();

        return { success: true, displayName: name };
    }

    // Set avatar
    setAvatar(avatarId) {
        const avatars = this.getAvatars();

        if (!avatars[avatarId]) {
            return { success: false, message: 'Invalid avatar!' };
        }

        gameData.data.profile.avatar = avatarId;
        gameData.save();

        return { success: true, avatar: avatarId };
    }

    // Set banner
    setBanner(bannerId) {
        const banners = this.getBanners();

        if (!banners[bannerId]) {
            return { success: false, message: 'Invalid banner!' };
        }

        gameData.data.profile.banner = bannerId;
        gameData.save();

        return { success: true, banner: bannerId };
    }

    // Set title
    setTitle(titleId) {
        if (!gameData.data.titles || !gameData.data.titles.includes(titleId)) {
            return { success: false, message: 'Title not unlocked!' };
        }

        gameData.data.profile.title = titleId;
        gameData.save();

        return { success: true, title: titleId };
    }

    // Set bio
    setBio(bio) {
        if (bio.length > 200) {
            return { success: false, message: 'Bio too long (max 200 characters)!' };
        }

        gameData.data.profile.bio = bio;
        gameData.save();

        return { success: true, bio: bio };
    }

    // Set visibility
    setVisibility(visibility) {
        const validOptions = ['public', 'friends', 'private'];

        if (!validOptions.includes(visibility)) {
            return { success: false, message: 'Invalid visibility!' };
        }

        gameData.data.profile.visibility = visibility;
        gameData.save();

        return { success: true, visibility: visibility };
    }

    // Showcase achievements
    setShowcaseAchievements(achievementIds) {
        if (achievementIds.length > 5) {
            return { success: false, message: 'Maximum 5 achievements!' };
        }

        gameData.data.profile.showcaseAchievements = achievementIds;
        gameData.save();

        return { success: true, achievements: achievementIds };
    }

    // Showcase stats
    setShowcaseStats(statKeys) {
        if (statKeys.length > 5) {
            return { success: false, message: 'Maximum 5 stats!' };
        }

        gameData.data.profile.showcaseStats = statKeys;
        gameData.save();

        return { success: true, stats: statKeys };
    }

    // Set colors
    setProfileColors(primary, accent) {
        gameData.data.profile.customization.primaryColor = primary;
        gameData.data.profile.customization.accentColor = accent;
        gameData.save();

        return { success: true, primary: primary, accent: accent };
    }

    // Set border
    setProfileBorder(borderId) {
        const borders = this.getProfileBorders();

        if (!borders[borderId]) {
            return { success: false, message: 'Invalid border!' };
        }

        gameData.data.profile.customization.profileBorder = borderId;
        gameData.save();

        return { success: true, border: borderId };
    }

    // Get all avatars
    getAvatars() {
        return {
            default: { id: 'default', name: 'Default', emoji: '👨‍💻', unlockRequirement: 'Default' },
            ninja: { id: 'ninja', name: 'Ninja', emoji: '🥷', unlockRequirement: 'Reach level 10' },
            wizard: { id: 'wizard', name: 'Wizard', emoji: '🧙', unlockRequirement: 'Mastery level 25' },
            robot: { id: 'robot', name: 'Robot', emoji: '🤖', unlockRequirement: 'Complete 10 achievements' },
            alien: { id: 'alien', name: 'Alien', emoji: '👽', unlockRequirement: 'Score 50,000' },
            pirate: { id: 'pirate', name: 'Pirate', emoji: '🏴‍☠️', unlockRequirement: 'Win 100 games' },
            vampire: { id: 'vampire', name: 'Vampire', emoji: '🧛', unlockRequirement: 'Play at midnight' },
            superhero: { id: 'superhero', name: 'Superhero', emoji: '🦸', unlockRequirement: 'Prestige level 3' }
        };
    }

    // Get all banners
    getBanners() {
        return {
            default: { id: 'default', name: 'Default', color: 0x4CAF50, unlockRequirement: 'Default' },
            fire: { id: 'fire', name: 'Fire', color: 0xFF4500, unlockRequirement: 'Win 50 games' },
            ice: { id: 'ice', name: 'Ice', color: 0x00CED1, unlockRequirement: 'Complete Ice Age event' },
            space: { id: 'space', name: 'Space', color: 0x1a1a4e, unlockRequirement: 'Reach Master rank' },
            rainbow: { id: 'rainbow', name: 'Rainbow', color: 0xFF00FF, unlockRequirement: 'Find rainbow easter egg' },
            gold: { id: 'gold', name: 'Gold', color: 0xFFD700, unlockRequirement: 'Total mastery level 200' }
        };
    }

    // Get all profile borders
    getProfileBorders() {
        return {
            default: { id: 'default', name: 'Default', color: 0xFFFFFF, unlockRequirement: 'Default' },
            bronze: { id: 'bronze', name: 'Bronze', color: 0xCD7F32, unlockRequirement: 'Bronze rank' },
            silver: { id: 'silver', name: 'Silver', color: 0xC0C0C0, unlockRequirement: 'Silver rank' },
            gold: { id: 'gold', name: 'Gold', color: 0xFFD700, unlockRequirement: 'Gold rank' },
            platinum: { id: 'platinum', name: 'Platinum', color: 0x00CED1, unlockRequirement: 'Platinum rank' },
            diamond: { id: 'diamond', name: 'Diamond', color: 0x1E90FF, unlockRequirement: 'Diamond rank' },
            master: { id: 'master', name: 'Master', color: 0x9370DB, unlockRequirement: 'Master rank' },
            grandmaster: { id: 'grandmaster', name: 'Grandmaster', color: 0xFF00FF, unlockRequirement: 'Grandmaster rank' }
        };
    }

    // Add XP to profile level
    addXP(amount) {
        const profile = gameData.data.profile;
        profile.xp += amount;

        // Check for level up
        const levelsGained = [];

        while (profile.level < 100) {
            const requiredXP = this.getRequiredXP(profile.level);

            if (profile.xp >= requiredXP) {
                profile.xp -= requiredXP;
                profile.level++;
                levelsGained.push(profile.level);
            } else {
                break;
            }
        }

        gameData.save();

        return {
            newLevel: profile.level,
            levelsGained: levelsGained,
            currentXP: profile.xp,
            requiredXP: this.getRequiredXP(profile.level)
        };
    }

    // Get required XP for level
    getRequiredXP(level) {
        return Math.floor(100 * Math.pow(1.1, level - 1));
    }

    // Get profile card (formatted for display)
    getProfileCard() {
        const profile = gameData.data.profile;
        const stats = gameData.data.stats;

        return {
            displayName: profile.displayName,
            avatar: profile.avatar,
            banner: profile.banner,
            title: profile.title,
            level: profile.level,
            prestige: profile.prestige,
            bio: profile.bio,
            showcaseAchievements: profile.showcaseAchievements,
            showcaseStats: profile.showcaseStats.map(key => ({
                key: key,
                value: stats[key] || 0
            })),
            customization: profile.customization
        };
    }
}

// Export singletons
export const emoteSystem = new EmoteSystem();
export const profileSystem = new ProfileSystem();
