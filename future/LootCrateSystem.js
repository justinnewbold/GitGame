// Loot Crate System - Earn and open crates for random rewards

import { gameData } from './GameData.js';

export default class LootCrateSystem {
    constructor() {
        this.initializeLootCrates();
    }

    initializeLootCrates() {
        if (!gameData.data.lootCrates) {
            gameData.data.lootCrates = {
                inventory: [],
                openedCount: 0,
                stats: {
                    totalOpened: 0,
                    commonOpened: 0,
                    rareOpened: 0,
                    epicOpened: 0,
                    legendaryOpened: 0,
                    bestDrop: null
                }
            };
            gameData.save();
        }
    }

    // Earn a crate
    earnCrate(rarity = 'common', source = 'gameplay') {
        const lootCrates = gameData.data.lootCrates;

        const crate = {
            id: 'crate_' + Date.now(),
            rarity: rarity,
            earnedDate: new Date().toISOString(),
            source: source,
            opened: false
        };

        lootCrates.inventory.push(crate);
        gameData.save();

        return {
            success: true,
            crate: crate,
            message: `Earned ${rarity} crate!`
        };
    }

    // Open a crate
    openCrate(crateId) {
        const lootCrates = gameData.data.lootCrates;
        const crate = lootCrates.inventory.find(c => c.id === crateId);

        if (!crate) {
            return { success: false, message: 'Crate not found!' };
        }

        if (crate.opened) {
            return { success: false, message: 'Crate already opened!' };
        }

        // Generate rewards based on rarity
        const rewards = this.generateRewards(crate.rarity);

        // Mark as opened
        crate.opened = true;
        crate.openedDate = new Date().toISOString();
        crate.rewards = rewards;

        // Update stats
        lootCrates.stats.totalOpened++;
        lootCrates.stats[`${crate.rarity}Opened`]++;

        // Apply rewards
        this.applyRewards(rewards);

        gameData.save();

        return {
            success: true,
            crate: crate,
            rewards: rewards
        };
    }

    // Generate rewards based on crate rarity
    generateRewards(rarity) {
        const rewards = [];

        switch (rarity) {
            case 'common':
                rewards.push(...this.rollCommonRewards());
                break;

            case 'rare':
                rewards.push(...this.rollRareRewards());
                break;

            case 'epic':
                rewards.push(...this.rollEpicRewards());
                break;

            case 'legendary':
                rewards.push(...this.rollLegendaryRewards());
                break;

            case 'mythic':
                rewards.push(...this.rollMythicRewards());
                break;
        }

        return rewards;
    }

    // Roll common rewards (3-5 items)
    rollCommonRewards() {
        const rewards = [];
        const count = 3 + Math.floor(Math.random() * 3);

        const pool = [
            { type: 'coins', amount: () => 100 + Math.floor(Math.random() * 400), weight: 50 },
            { type: 'xp', amount: () => 50 + Math.floor(Math.random() * 200), weight: 40 },
            { type: 'color', id: () => this.randomColor(), weight: 5 },
            { type: 'trail', id: () => 'basic_trail', weight: 3 },
            { type: 'emote', id: () => 'wave', weight: 2 }
        ];

        for (let i = 0; i < count; i++) {
            const reward = this.weightedRandom(pool);
            rewards.push({
                type: reward.type,
                amount: reward.amount ? reward.amount() : null,
                id: reward.id ? reward.id() : null,
                rarity: 'common'
            });
        }

        return rewards;
    }

    // Roll rare rewards (4-6 items)
    rollRareRewards() {
        const rewards = [];
        const count = 4 + Math.floor(Math.random() * 3);

        const pool = [
            { type: 'coins', amount: () => 500 + Math.floor(Math.random() * 1500), weight: 40 },
            { type: 'xp', amount: () => 200 + Math.floor(Math.random() * 500), weight: 30 },
            { type: 'skin', id: () => this.randomSkin('rare'), weight: 15 },
            { type: 'emote', id: () => this.randomEmote('rare'), weight: 10 },
            { type: 'pet', id: () => this.randomPet('rare'), weight: 5 }
        ];

        for (let i = 0; i < count; i++) {
            const reward = this.weightedRandom(pool);
            rewards.push({
                type: reward.type,
                amount: reward.amount ? reward.amount() : null,
                id: reward.id ? reward.id() : null,
                rarity: 'rare'
            });
        }

        return rewards;
    }

    // Roll epic rewards (5-7 items)
    rollEpicRewards() {
        const rewards = [];
        const count = 5 + Math.floor(Math.random() * 3);

        const pool = [
            { type: 'coins', amount: () => 2000 + Math.floor(Math.random() * 3000), weight: 30 },
            { type: 'xp', amount: () => 500 + Math.floor(Math.random() * 1500), weight: 20 },
            { type: 'skin', id: () => this.randomSkin('epic'), weight: 20 },
            { type: 'emote', id: () => this.randomEmote('epic'), weight: 15 },
            { type: 'pet', id: () => this.randomPet('epic'), weight: 10 },
            { type: 'title', id: () => 'crate_opener', weight: 5 }
        ];

        for (let i = 0; i < count; i++) {
            const reward = this.weightedRandom(pool);
            rewards.push({
                type: reward.type,
                amount: reward.amount ? reward.amount() : null,
                id: reward.id ? reward.id() : null,
                rarity: 'epic'
            });
        }

        return rewards;
    }

    // Roll legendary rewards (6-8 items)
    rollLegendaryRewards() {
        const rewards = [];
        const count = 6 + Math.floor(Math.random() * 3);

        const pool = [
            { type: 'coins', amount: () => 5000 + Math.floor(Math.random() * 10000), weight: 25 },
            { type: 'xp', amount: () => 1000 + Math.floor(Math.random() * 3000), weight: 15 },
            { type: 'skin', id: () => this.randomSkin('legendary'), weight: 25 },
            { type: 'emote', id: () => this.randomEmote('legendary'), weight: 15 },
            { type: 'pet', id: () => this.randomPet('legendary'), weight: 15 },
            { type: 'title', id: () => 'legendary_finder', weight: 5 }
        ];

        for (let i = 0; i < count; i++) {
            const reward = this.weightedRandom(pool);
            rewards.push({
                type: reward.type,
                amount: reward.amount ? reward.amount() : null,
                id: reward.id ? reward.id() : null,
                rarity: 'legendary'
            });
        }

        return rewards;
    }

    // Roll mythic rewards (8-10 items, guaranteed best drops)
    rollMythicRewards() {
        const rewards = [];
        const count = 8 + Math.floor(Math.random() * 3);

        const pool = [
            { type: 'coins', amount: () => 20000 + Math.floor(Math.random() * 30000), weight: 20 },
            { type: 'xp', amount: () => 5000 + Math.floor(Math.random() * 10000), weight: 10 },
            { type: 'skin', id: () => 'mythic_exclusive', weight: 30 },
            { type: 'emote', id: () => 'mythic_dance', weight: 20 },
            { type: 'pet', id: () => 'mythic_dragon', weight: 15 },
            { type: 'title', id: () => 'mythic_champion', weight: 5 }
        ];

        for (let i = 0; i < count; i++) {
            const reward = this.weightedRandom(pool);
            rewards.push({
                type: reward.type,
                amount: reward.amount ? reward.amount() : null,
                id: reward.id ? reward.id() : null,
                rarity: 'mythic'
            });
        }

        return rewards;
    }

    // Weighted random selection
    weightedRandom(pool) {
        const totalWeight = pool.reduce((sum, item) => sum + item.weight, 0);
        let random = Math.random() * totalWeight;

        for (const item of pool) {
            random -= item.weight;
            if (random <= 0) {
                return item;
            }
        }

        return pool[pool.length - 1];
    }

    // Helper functions to get random items
    randomColor() {
        const colors = ['red', 'blue', 'green', 'purple', 'orange', 'pink', 'cyan'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    randomSkin(rarity) {
        const skins = {
            rare: ['ninja', 'wizard', 'robot'],
            epic: ['superhero', 'alien', 'pirate'],
            legendary: ['ultimate_dev', 'code_god', 'legendary_hacker']
        };
        const pool = skins[rarity] || skins.rare;
        return pool[Math.floor(Math.random() * pool.length)];
    }

    randomEmote(rarity) {
        const emotes = {
            rare: ['dance', 'party', 'victory'],
            epic: ['flex', 'fire', 'rainbow'],
            legendary: ['unicorn', 'crown', 'legendary_pose']
        };
        const pool = emotes[rarity] || emotes.rare;
        return pool[Math.floor(Math.random() * pool.length)];
    }

    randomPet(rarity) {
        const pets = {
            rare: ['code_cat', 'debug_dog', 'code_owl'],
            epic: ['cyber_dragon', 'phoenix'],
            legendary: ['golden_goose', 'robot_companion']
        };
        const pool = pets[rarity] || pets.rare;
        return pool[Math.floor(Math.random() * pool.length)];
    }

    // Apply rewards to player
    applyRewards(rewards) {
        rewards.forEach(reward => {
            switch (reward.type) {
                case 'coins':
                    gameData.data.stats.totalScore += reward.amount;
                    break;

                case 'xp':
                    // Apply to profile or mastery
                    break;

                case 'skin':
                    if (gameData.data.customization && !gameData.data.customization.unlockedSkins.includes(reward.id)) {
                        gameData.data.customization.unlockedSkins.push(reward.id);
                    }
                    break;

                case 'color':
                    if (gameData.data.customization && !gameData.data.customization.unlockedColors.includes(reward.id)) {
                        gameData.data.customization.unlockedColors.push(reward.id);
                    }
                    break;

                case 'trail':
                    if (gameData.data.customization && !gameData.data.customization.unlockedTrails.includes(reward.id)) {
                        gameData.data.customization.unlockedTrails.push(reward.id);
                    }
                    break;

                case 'emote':
                    if (gameData.data.emotes && !gameData.data.emotes.unlocked.includes(reward.id)) {
                        gameData.data.emotes.unlocked.push(reward.id);
                    }
                    break;

                case 'pet':
                    if (gameData.data.pets && !gameData.data.pets.unlocked.includes(reward.id)) {
                        gameData.data.pets.unlocked.push(reward.id);
                    }
                    break;

                case 'title':
                    if (!gameData.data.titles) gameData.data.titles = [];
                    if (!gameData.data.titles.includes(reward.id)) {
                        gameData.data.titles.push(reward.id);
                    }
                    break;
            }
        });

        gameData.save();
    }

    // Delete opened crates
    deleteOpenedCrates() {
        const lootCrates = gameData.data.lootCrates;
        lootCrates.inventory = lootCrates.inventory.filter(c => !c.opened);
        gameData.save();

        return { success: true, message: 'Opened crates deleted!' };
    }

    // Get crate rarity info
    getRarityInfo(rarity) {
        const rarities = {
            common: {
                name: 'Common',
                color: 0xCCCCCC,
                icon: '📦',
                dropRate: '60%',
                itemCount: '3-5'
            },
            rare: {
                name: 'Rare',
                color: 0x4169E1,
                icon: '🎁',
                dropRate: '25%',
                itemCount: '4-6'
            },
            epic: {
                name: 'Epic',
                color: 0x9370DB,
                icon: '💎',
                dropRate: '10%',
                itemCount: '5-7'
            },
            legendary: {
                name: 'Legendary',
                color: 0xFFD700,
                icon: '👑',
                dropRate: '4%',
                itemCount: '6-8'
            },
            mythic: {
                name: 'Mythic',
                color: 0xFF0066,
                icon: '✨',
                dropRate: '1%',
                itemCount: '8-10'
            }
        };

        return rarities[rarity] || rarities.common;
    }

    // Get inventory
    getInventory() {
        return gameData.data.lootCrates.inventory;
    }

    // Get unopened crates
    getUnopenedCrates() {
        return gameData.data.lootCrates.inventory.filter(c => !c.opened);
    }

    // Get opened crates
    getOpenedCrates() {
        return gameData.data.lootCrates.inventory.filter(c => c.opened);
    }

    // Get stats
    getStats() {
        return gameData.data.lootCrates.stats;
    }

    // Bulk open crates
    bulkOpenCrates(rarity = null) {
        const lootCrates = gameData.data.lootCrates;
        const cratesToOpen = lootCrates.inventory.filter(c =>
            !c.opened && (rarity === null || c.rarity === rarity)
        );

        const allRewards = [];

        cratesToOpen.forEach(crate => {
            const result = this.openCrate(crate.id);
            if (result.success) {
                allRewards.push(...result.rewards);
            }
        });

        return {
            success: true,
            count: cratesToOpen.length,
            rewards: this.consolidateRewards(allRewards)
        };
    }

    // Consolidate duplicate rewards
    consolidateRewards(rewards) {
        const consolidated = {};

        rewards.forEach(reward => {
            const key = `${reward.type}_${reward.id || 'default'}`;

            if (consolidated[key]) {
                if (reward.amount) {
                    consolidated[key].amount += reward.amount;
                }
                consolidated[key].count++;
            } else {
                consolidated[key] = {
                    ...reward,
                    count: 1
                };
            }
        });

        return Object.values(consolidated);
    }
}

// Singleton
export const lootCrateSystem = new LootCrateSystem();
