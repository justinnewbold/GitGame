/**
 * CosmeticsSystem - Player customization and cosmetic items
 * Manages skins, themes, effects, and unlockables
 */

import { logger } from './Logger.js';
import { gameData } from './GameData.js';

// Cosmetic item definitions
const COSMETICS = {
    // Player skins
    skins: {
        default: {
            id: 'default',
            name: 'Default Developer',
            description: 'The classic developer look',
            category: 'skins',
            rarity: 'common',
            price: 0,
            unlocked: true,
            color: 0x00ff00
        },
        hacker: {
            id: 'hacker',
            name: 'Elite Hacker',
            description: 'Mysterious hooded figure',
            category: 'skins',
            rarity: 'rare',
            price: 500,
            unlocked: false,
            color: 0x00ffff
        },
        coffee_addict: {
            id: 'coffee_addict',
            name: 'Coffee Addict',
            description: 'Powered by caffeine',
            category: 'skins',
            rarity: 'uncommon',
            price: 250,
            unlocked: false,
            color: 0x8b4513
        },
        night_owl: {
            id: 'night_owl',
            name: 'Night Owl',
            description: 'Codes best at 3 AM',
            category: 'skins',
            rarity: 'rare',
            price: 500,
            achievement: 'night_owl',
            color: 0x4b0082
        },
        golden_dev: {
            id: 'golden_dev',
            name: 'Golden Developer',
            description: 'Achieved legendary status',
            category: 'skins',
            rarity: 'legendary',
            price: 2000,
            unlocked: false,
            color: 0xffd700
        },
        matrix: {
            id: 'matrix',
            name: 'The One',
            description: 'You are the chosen one',
            category: 'skins',
            rarity: 'legendary',
            price: 0,
            achievement: 'score_10000',
            color: 0x00ff00
        }
    },

    // Trail effects
    trails: {
        none: {
            id: 'none',
            name: 'No Trail',
            description: 'Clean and simple',
            category: 'trails',
            rarity: 'common',
            price: 0,
            unlocked: true,
            particles: null
        },
        code: {
            id: 'code',
            name: 'Code Trail',
            description: 'Leave a trail of code snippets',
            category: 'trails',
            rarity: 'uncommon',
            price: 300,
            unlocked: false,
            particles: 'code'
        },
        fire: {
            id: 'fire',
            name: 'Blazing Trail',
            description: 'On fire with productivity',
            category: 'trails',
            rarity: 'rare',
            price: 600,
            unlocked: false,
            particles: 'fire'
        },
        rainbow: {
            id: 'rainbow',
            name: 'Rainbow Trail',
            description: 'Spread joy everywhere',
            category: 'trails',
            rarity: 'rare',
            price: 750,
            unlocked: false,
            particles: 'rainbow'
        },
        glitch: {
            id: 'glitch',
            name: 'Glitch Effect',
            description: 'Reality bends around you',
            category: 'trails',
            rarity: 'legendary',
            price: 1500,
            unlocked: false,
            particles: 'glitch'
        }
    },

    // UI Themes
    themes: {
        terminal: {
            id: 'terminal',
            name: 'Terminal Green',
            description: 'Classic hacker aesthetic',
            category: 'themes',
            rarity: 'common',
            price: 0,
            unlocked: true,
            colors: {
                primary: '#00ff00',
                secondary: '#003300',
                background: '#0a0a0a',
                text: '#00ff00',
                accent: '#00cc00'
            }
        },
        synthwave: {
            id: 'synthwave',
            name: 'Synthwave',
            description: 'Retro 80s vibes',
            category: 'themes',
            rarity: 'uncommon',
            price: 400,
            unlocked: false,
            colors: {
                primary: '#ff00ff',
                secondary: '#00ffff',
                background: '#1a0a2e',
                text: '#ffffff',
                accent: '#ff6ec7'
            }
        },
        ocean: {
            id: 'ocean',
            name: 'Deep Ocean',
            description: 'Calm and serene',
            category: 'themes',
            rarity: 'uncommon',
            price: 400,
            unlocked: false,
            colors: {
                primary: '#0077be',
                secondary: '#00a8e8',
                background: '#003459',
                text: '#ffffff',
                accent: '#00d4ff'
            }
        },
        blood: {
            id: 'blood',
            name: 'Blood Code',
            description: 'Dark and intense',
            category: 'themes',
            rarity: 'rare',
            price: 600,
            unlocked: false,
            colors: {
                primary: '#ff0000',
                secondary: '#8b0000',
                background: '#1a0000',
                text: '#ff6666',
                accent: '#ff3333'
            }
        },
        light: {
            id: 'light',
            name: 'Light Mode',
            description: 'For the brave souls',
            category: 'themes',
            rarity: 'legendary',
            price: 1000,
            unlocked: false,
            colors: {
                primary: '#333333',
                secondary: '#666666',
                background: '#ffffff',
                text: '#000000',
                accent: '#0066cc'
            }
        }
    },

    // Player titles
    titles: {
        newbie: {
            id: 'newbie',
            name: 'Newbie',
            description: 'Just getting started',
            category: 'titles',
            rarity: 'common',
            price: 0,
            unlocked: true
        },
        bug_hunter: {
            id: 'bug_hunter',
            name: 'Bug Hunter',
            description: 'Squashed 100 bugs',
            category: 'titles',
            rarity: 'uncommon',
            price: 0,
            achievement: 'kills_100'
        },
        survivor: {
            id: 'survivor',
            name: 'Survivor',
            description: 'Survived the night',
            category: 'titles',
            rarity: 'uncommon',
            price: 0,
            achievement: 'survive_5min'
        },
        untouchable: {
            id: 'untouchable',
            name: 'Untouchable',
            description: 'Perfect run achieved',
            category: 'titles',
            rarity: 'rare',
            price: 0,
            achievement: 'no_damage'
        },
        legend: {
            id: 'legend',
            name: 'Legend',
            description: 'Achieved legendary status',
            category: 'titles',
            rarity: 'legendary',
            price: 0,
            achievement: 'score_10000'
        },
        dedicated: {
            id: 'dedicated',
            name: 'Dedicated',
            description: 'Played 100 games',
            category: 'titles',
            rarity: 'rare',
            price: 0,
            achievement: 'games_100'
        }
    }
};

// Rarity colors
const RARITY_COLORS = {
    common: '#888888',
    uncommon: '#00ff00',
    rare: '#0088ff',
    epic: '#aa00ff',
    legendary: '#ffd700'
};

export default class CosmeticsSystem {
    constructor() {
        this.initializeStorage();
    }

    /**
     * Initialize cosmetics storage
     */
    initializeStorage() {
        if (!gameData.data.cosmetics) {
            gameData.data.cosmetics = {
                currency: 0,
                owned: {
                    skins: ['default'],
                    trails: ['none'],
                    themes: ['terminal'],
                    titles: ['newbie']
                },
                equipped: {
                    skin: 'default',
                    trail: 'none',
                    theme: 'terminal',
                    title: 'newbie'
                },
                purchaseHistory: []
            };
            gameData.save();
        }
    }

    /**
     * Get player's currency
     */
    getCurrency() {
        return gameData.data.cosmetics?.currency || 0;
    }

    /**
     * Add currency (from gameplay rewards)
     */
    addCurrency(amount) {
        if (!gameData.data.cosmetics) this.initializeStorage();
        gameData.data.cosmetics.currency += amount;
        gameData.save();
        logger.info('CosmeticsSystem', `Added ${amount} currency. Total: ${this.getCurrency()}`);
        return this.getCurrency();
    }

    /**
     * Spend currency
     */
    spendCurrency(amount) {
        if (this.getCurrency() < amount) return false;
        gameData.data.cosmetics.currency -= amount;
        gameData.save();
        return true;
    }

    /**
     * Check if player owns a cosmetic
     */
    ownsCosmetic(category, itemId) {
        return gameData.data.cosmetics?.owned[category]?.includes(itemId) || false;
    }

    /**
     * Get cosmetic details
     */
    getCosmetic(category, itemId) {
        return COSMETICS[category]?.[itemId] || null;
    }

    /**
     * Purchase a cosmetic
     */
    purchase(category, itemId) {
        const item = this.getCosmetic(category, itemId);
        if (!item) {
            logger.error('CosmeticsSystem', `Item not found: ${category}/${itemId}`);
            return { success: false, error: 'Item not found' };
        }

        if (this.ownsCosmetic(category, itemId)) {
            return { success: false, error: 'Already owned' };
        }

        if (item.achievement) {
            return { success: false, error: 'Unlock via achievement' };
        }

        if (!this.spendCurrency(item.price)) {
            return { success: false, error: 'Insufficient currency' };
        }

        // Add to owned
        gameData.data.cosmetics.owned[category].push(itemId);
        gameData.data.cosmetics.purchaseHistory.push({
            category,
            itemId,
            price: item.price,
            timestamp: Date.now()
        });
        gameData.save();

        logger.info('CosmeticsSystem', `Purchased: ${item.name}`);
        return { success: true, item };
    }

    /**
     * Unlock a cosmetic from achievement
     */
    unlockFromAchievement(achievementId) {
        const unlocked = [];

        // Check all categories for achievement-linked items
        for (const category of Object.keys(COSMETICS)) {
            for (const [itemId, item] of Object.entries(COSMETICS[category])) {
                if (item.achievement === achievementId && !this.ownsCosmetic(category, itemId)) {
                    gameData.data.cosmetics.owned[category].push(itemId);
                    unlocked.push(item);
                    logger.info('CosmeticsSystem', `Unlocked from achievement: ${item.name}`);
                }
            }
        }

        if (unlocked.length > 0) {
            gameData.save();
        }

        return unlocked;
    }

    /**
     * Equip a cosmetic
     */
    equip(category, itemId) {
        if (!this.ownsCosmetic(category, itemId)) {
            logger.warn('CosmeticsSystem', `Cannot equip unowned item: ${itemId}`);
            return false;
        }

        const categoryToEquipped = {
            skins: 'skin',
            trails: 'trail',
            themes: 'theme',
            titles: 'title'
        };

        const equippedKey = categoryToEquipped[category];
        if (!equippedKey) return false;

        gameData.data.cosmetics.equipped[equippedKey] = itemId;
        gameData.save();

        logger.info('CosmeticsSystem', `Equipped: ${itemId}`);
        return true;
    }

    /**
     * Get currently equipped cosmetics
     */
    getEquipped() {
        return gameData.data.cosmetics?.equipped || {
            skin: 'default',
            trail: 'none',
            theme: 'terminal',
            title: 'newbie'
        };
    }

    /**
     * Get equipped cosmetic details
     */
    getEquippedDetails() {
        const equipped = this.getEquipped();
        return {
            skin: this.getCosmetic('skins', equipped.skin),
            trail: this.getCosmetic('trails', equipped.trail),
            theme: this.getCosmetic('themes', equipped.theme),
            title: this.getCosmetic('titles', equipped.title)
        };
    }

    /**
     * Get all cosmetics in a category
     */
    getAllInCategory(category) {
        const items = COSMETICS[category];
        if (!items) return [];

        return Object.values(items).map(item => ({
            ...item,
            owned: this.ownsCosmetic(category, item.id),
            equipped: this.getEquipped()[category.slice(0, -1)] === item.id,
            rarityColor: RARITY_COLORS[item.rarity]
        }));
    }

    /**
     * Get all owned cosmetics
     */
    getOwnedCosmetics() {
        const result = {};
        for (const category of Object.keys(COSMETICS)) {
            result[category] = this.getAllInCategory(category).filter(item => item.owned);
        }
        return result;
    }

    /**
     * Get shop items (not owned, available for purchase)
     */
    getShopItems() {
        const result = {};
        for (const category of Object.keys(COSMETICS)) {
            result[category] = this.getAllInCategory(category).filter(item =>
                !item.owned && !item.achievement && item.price > 0
            );
        }
        return result;
    }

    /**
     * Get achievement-locked items
     */
    getAchievementItems() {
        const result = [];
        for (const category of Object.keys(COSMETICS)) {
            for (const item of Object.values(COSMETICS[category])) {
                if (item.achievement) {
                    result.push({
                        ...item,
                        categoryName: category,
                        owned: this.ownsCosmetic(category, item.id),
                        rarityColor: RARITY_COLORS[item.rarity]
                    });
                }
            }
        }
        return result;
    }

    /**
     * Apply theme colors to game
     */
    getThemeColors() {
        const equipped = this.getEquipped();
        const theme = this.getCosmetic('themes', equipped.theme);
        return theme?.colors || COSMETICS.themes.terminal.colors;
    }

    /**
     * Get player color from skin
     */
    getPlayerColor() {
        const equipped = this.getEquipped();
        const skin = this.getCosmetic('skins', equipped.skin);
        return skin?.color || 0x00ff00;
    }

    /**
     * Get player title
     */
    getPlayerTitle() {
        const equipped = this.getEquipped();
        const title = this.getCosmetic('titles', equipped.title);
        return title?.name || 'Newbie';
    }

    /**
     * Calculate currency reward from score
     */
    calculateReward(score, bonusMultiplier = 1) {
        // Base: 1 currency per 100 points
        const base = Math.floor(score / 100);
        return Math.floor(base * bonusMultiplier);
    }

    /**
     * Get stats
     */
    getStats() {
        const owned = gameData.data.cosmetics?.owned || {};
        const history = gameData.data.cosmetics?.purchaseHistory || [];

        let totalOwned = 0;
        let totalPossible = 0;

        for (const category of Object.keys(COSMETICS)) {
            totalOwned += owned[category]?.length || 0;
            totalPossible += Object.keys(COSMETICS[category]).length;
        }

        return {
            currency: this.getCurrency(),
            totalOwned,
            totalPossible,
            completionPercent: Math.round((totalOwned / totalPossible) * 100),
            totalSpent: history.reduce((sum, p) => sum + p.price, 0),
            purchaseCount: history.length
        };
    }

    /**
     * Reset all cosmetics (for testing)
     */
    static reset() {
        gameData.data.cosmetics = null;
        gameData.save();
    }
}

// Singleton instance
export const cosmeticsSystem = new CosmeticsSystem();
