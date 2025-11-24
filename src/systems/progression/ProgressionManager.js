/**
 * ProgressionManager - Handles content unlocks and progression
 * Separated from GameData for single responsibility
 */

import EventBus from '../../core/EventBus.js';

export default class ProgressionManager {
    constructor() {
        this.progression = this.getDefaultProgression();
    }

    /**
     * Get default progression structure
     * @returns {Object} Default progression
     */
    getDefaultProgression() {
        return {
            difficulty: ['normal'],
            skins: ['default'],
            powerups: [],
            gameModes: ['gitSurvivor', 'codeDefense'], // Start with 2 unlocked
            features: ['profile', 'settings'], // Basic features
            customization: {
                avatars: ['default'],
                banners: ['default'],
                titles: ['Newbie']
            },
            battlePass: {
                currentTier: 0,
                currentSeason: 1,
                ownsPremium: false
            },
            ranked: {
                currentRank: 0,
                currentLP: 0,
                highestRank: 0
            },
            campaign: {
                currentMission: 0,
                completedMissions: []
            }
        };
    }

    /**
     * Load progression from data
     * @param {Object} data - Saved progression
     */
    load(data) {
        if (data && typeof data === 'object') {
            this.progression = { ...this.getDefaultProgression(), ...data };
        } else {
            this.progression = this.getDefaultProgression();
        }
    }

    /**
     * Check if content is unlocked
     * @param {string} category - Content category (e.g., 'skins', 'gameModes')
     * @param {string} item - Item identifier
     * @returns {boolean} True if unlocked
     */
    isUnlocked(category, item) {
        const categoryData = this.progression[category];
        if (!categoryData) {
            console.warn(`ProgressionManager: Category '${category}' not found`);
            return false;
        }

        if (Array.isArray(categoryData)) {
            return categoryData.includes(item);
        } else if (typeof categoryData === 'object') {
            const subCategory = categoryData[item];
            return Array.isArray(subCategory) ? subCategory.length > 0 : Boolean(subCategory);
        }

        return false;
    }

    /**
     * Unlock content
     * @param {string} category - Content category
     * @param {string} item - Item to unlock
     * @returns {boolean} True if newly unlocked
     */
    unlock(category, item) {
        if (!this.progression[category]) {
            console.warn(`ProgressionManager: Category '${category}' not found`);
            return false;
        }

        if (!Array.isArray(this.progression[category])) {
            console.warn(`ProgressionManager: Category '${category}' is not an array`);
            return false;
        }

        if (this.isUnlocked(category, item)) {
            return false; // Already unlocked
        }

        this.progression[category].push(item);
        console.log(`Unlocked: ${category}/${item}`);
        return true;
    }

    /**
     * Get all unlocked items in a category
     * @param {string} category - Content category
     * @returns {Array} Unlocked items
     */
    getUnlocked(category) {
        return this.progression[category] || [];
    }

    /**
     * Get battle pass tier
     * @returns {number} Current tier
     */
    getBattlePassTier() {
        return this.progression.battlePass.currentTier;
    }

    /**
     * Set battle pass tier
     * @param {number} tier - Tier number
     */
    setBattlePassTier(tier) {
        this.progression.battlePass.currentTier = tier;
    }

    /**
     * Check if player owns premium battle pass
     * @returns {boolean} True if premium
     */
    hasPremiumBattlePass() {
        return this.progression.battlePass.ownsPremium;
    }

    /**
     * Unlock premium battle pass
     */
    unlockPremiumBattlePass() {
        this.progression.battlePass.ownsPremium = true;
        console.log('Premium Battle Pass unlocked!');
    }

    /**
     * Get current rank
     * @returns {number} Rank tier
     */
    getRank() {
        return this.progression.ranked.currentRank;
    }

    /**
     * Set current rank
     * @param {number} rank - Rank tier
     */
    setRank(rank) {
        this.progression.ranked.currentRank = rank;
        this.progression.ranked.highestRank = Math.max(
            this.progression.ranked.highestRank,
            rank
        );
    }

    /**
     * Get League Points
     * @returns {number} Current LP
     */
    getLP() {
        return this.progression.ranked.currentLP;
    }

    /**
     * Set League Points
     * @param {number} lp - LP amount
     */
    setLP(lp) {
        this.progression.ranked.currentLP = lp;
    }

    /**
     * Get campaign progress
     * @returns {Object} Campaign data
     */
    getCampaignProgress() {
        return {
            currentMission: this.progression.campaign.currentMission,
            completedMissions: this.progression.campaign.completedMissions.length,
            totalMissions: 50 // From campaign system
        };
    }

    /**
     * Complete a campaign mission
     * @param {number} missionId - Mission ID
     */
    completeMission(missionId) {
        if (!this.progression.campaign.completedMissions.includes(missionId)) {
            this.progression.campaign.completedMissions.push(missionId);
            this.progression.campaign.currentMission = Math.max(
                this.progression.campaign.currentMission,
                missionId + 1
            );
        }
    }

    /**
     * Reset all progression
     */
    resetAll() {
        this.progression = this.getDefaultProgression();
        console.log('ProgressionManager: All progression reset');
    }

    /**
     * Export progression for saving
     * @returns {Object} Progression data
     */
    export() {
        return { ...this.progression };
    }
}
