// Character Customization System - Skins, colors, and styles!

import { gameData } from './GameData.js';

export default class CharacterCustomization {
    constructor() {
        this.initializeCustomization();
    }

    initializeCustomization() {
        if (!gameData.data.customization) {
            gameData.data.customization = {
                unlockedSkins: ['default'],
                selectedSkin: 'default',
                unlockedColors: ['blue', 'green'],
                selectedColor: 'blue',
                unlockedTrails: ['none'],
                selectedTrail: 'none'
            };
            gameData.save();
        }
    }

    // All available skins
    getSkins() {
        return {
            default: {
                id: 'default',
                name: 'Classic Dev',
                description: 'The original developer',
                icon: '👨‍💻',
                color: 0x00aaff,
                unlockRequirement: 'Default',
                unlocked: true
            },
            ninja: {
                id: 'ninja',
                name: 'Code Ninja',
                description: 'Silent but deadly bug hunter',
                icon: '🥷',
                color: 0x000000,
                unlockRequirement: 'Kill 500 enemies',
                unlocked: false
            },
            wizard: {
                id: 'wizard',
                name: 'Tech Wizard',
                description: 'Master of code magic',
                icon: '🧙',
                color: 0x9966ff,
                unlockRequirement: 'Complete 10 achievements',
                unlocked: false
            },
            robot: {
                id: 'robot',
                name: 'Debug Bot',
                description: 'Automated perfection',
                icon: '🤖',
                color: 0xcccccc,
                unlockRequirement: 'Reach wave 20 in Code Defense',
                unlocked: false
            },
            superhero: {
                id: 'superhero',
                name: 'Code Crusader',
                description: 'Fighting bugs with style',
                icon: '🦸',
                color: 0xff0000,
                unlockRequirement: 'Score 5000 in any mode',
                unlocked: false
            },
            alien: {
                id: 'alien',
                name: 'Area 51 Dev',
                description: 'Out of this world coding',
                icon: '👽',
                color: 0x00ff00,
                unlockRequirement: 'Find secret easter egg',
                unlocked: false
            },
            pirate: {
                id: 'pirate',
                name: 'Code Pirate',
                description: 'Arr, matey! Pillaging bugs',
                icon: '🏴‍☠️',
                color: 0x8B4513,
                unlockRequirement: 'Complete all daily challenges',
                unlocked: false
            },
            vampire: {
                id: 'vampire',
                name: 'Night Coder',
                description: 'Coding till dawn',
                icon: '🧛',
                color: 0x8B0000,
                unlockRequirement: 'Play at midnight',
                unlocked: false
            }
        };
    }

    // All available colors
    getColors() {
        return {
            blue: {
                id: 'blue',
                name: 'Electric Blue',
                value: 0x00aaff,
                unlockRequirement: 'Default'
            },
            green: {
                id: 'green',
                name: 'Matrix Green',
                value: 0x00ff00,
                unlockRequirement: 'Default'
            },
            red: {
                id: 'red',
                name: 'Critical Red',
                value: 0xff0000,
                unlockRequirement: 'Take 1000 damage total'
            },
            purple: {
                id: 'purple',
                name: 'Royal Purple',
                value: 0x9966ff,
                unlockRequirement: 'Win 10 games'
            },
            gold: {
                id: 'gold',
                name: 'Golden Code',
                value: 0xffd700,
                unlockRequirement: 'Earn 10000 score'
            },
            pink: {
                id: 'pink',
                name: 'Bubblegum Pink',
                value: 0xff69b4,
                unlockRequirement: 'Buy coffee 50 times'
            },
            cyan: {
                id: 'cyan',
                name: 'Cyan Storm',
                value: 0x00ffff,
                unlockRequirement: 'Get 50x combo'
            },
            orange: {
                id: 'orange',
                name: 'Stack Overflow Orange',
                value: 0xff6600,
                unlockRequirement: 'Collect Stack Overflow power-up'
            }
        };
    }

    // Trail effects
    getTrails() {
        return {
            none: {
                id: 'none',
                name: 'No Trail',
                description: 'Clean and simple',
                unlockRequirement: 'Default'
            },
            sparkle: {
                id: 'sparkle',
                name: 'Sparkle Trail',
                description: 'Leave sparkles behind',
                unlockRequirement: 'Collect 20 power-ups'
            },
            fire: {
                id: 'fire',
                name: 'Fire Trail',
                description: 'Blazing path of glory',
                unlockRequirement: 'Get 30x combo'
            },
            rainbow: {
                id: 'rainbow',
                name: 'Rainbow Trail',
                description: 'Taste the rainbow',
                unlockRequirement: 'Unlock all colors'
            },
            code: {
                id: 'code',
                name: 'Code Trail',
                description: 'Leave binary in your wake',
                unlockRequirement: 'Write 1000 lines (jk - play 50 games)'
            }
        };
    }

    // Get current selections
    getCurrentCustomization() {
        return {
            skin: gameData.data.customization.selectedSkin,
            color: gameData.data.customization.selectedColor,
            trail: gameData.data.customization.selectedTrail
        };
    }

    // Set skin
    setSkin(skinId) {
        if (this.isUnlocked('skin', skinId)) {
            gameData.data.customization.selectedSkin = skinId;
            gameData.save();
            return true;
        }
        return false;
    }

    // Set color
    setColor(colorId) {
        if (this.isUnlocked('color', colorId)) {
            gameData.data.customization.selectedColor = colorId;
            gameData.save();
            return true;
        }
        return false;
    }

    // Set trail
    setTrail(trailId) {
        if (this.isUnlocked('trail', trailId)) {
            gameData.data.customization.selectedTrail = trailId;
            gameData.save();
            return true;
        }
        return false;
    }

    // Check if unlocked
    isUnlocked(type, id) {
        const key = `unlocked${type.charAt(0).toUpperCase() + type.slice(1)}s`;
        return gameData.data.customization[key].includes(id);
    }

    // Unlock item
    unlock(type, id) {
        const key = `unlocked${type.charAt(0).toUpperCase() + type.slice(1)}s`;
        if (!gameData.data.customization[key].includes(id)) {
            gameData.data.customization[key].push(id);
            gameData.save();
            return true;
        }
        return false;
    }

    // Check unlock conditions and auto-unlock
    checkUnlocks() {
        const stats = gameData.data.stats;
        const unlocked = [];

        // Check skins
        if (stats.gitSurvivor.enemiesKilled >= 500 && !this.isUnlocked('skin', 'ninja')) {
            this.unlock('skin', 'ninja');
            unlocked.push({ type: 'skin', id: 'ninja', item: this.getSkins().ninja });
        }

        if (gameData.data.achievements.length >= 10 && !this.isUnlocked('skin', 'wizard')) {
            this.unlock('skin', 'wizard');
            unlocked.push({ type: 'skin', id: 'wizard', item: this.getSkins().wizard });
        }

        if (stats.codeDefense.highWave >= 20 && !this.isUnlocked('skin', 'robot')) {
            this.unlock('skin', 'robot');
            unlocked.push({ type: 'skin', id: 'robot', item: this.getSkins().robot });
        }

        // Check colors
        if (stats.gamesPlayed >= 10 && !this.isUnlocked('color', 'purple')) {
            this.unlock('color', 'purple');
            unlocked.push({ type: 'color', id: 'purple', item: this.getColors().purple });
        }

        if (stats.totalScore >= 10000 && !this.isUnlocked('color', 'gold')) {
            this.unlock('color', 'gold');
            unlocked.push({ type: 'color', id: 'gold', item: this.getColors().gold });
        }

        // Check trails
        if (stats.gamesPlayed >= 50 && !this.isUnlocked('trail', 'code')) {
            this.unlock('trail', 'code');
            unlocked.push({ type: 'trail', id: 'code', item: this.getTrails().code });
        }

        return unlocked;
    }

    // Get player appearance for rendering
    getPlayerAppearance() {
        const customization = this.getCurrentCustomization();
        const skins = this.getSkins();
        const colors = this.getColors();

        const skin = skins[customization.skin] || skins.default;
        const color = colors[customization.color] || colors.blue;

        return {
            skin: skin,
            color: color.value,
            trail: customization.trail,
            icon: skin.icon
        };
    }
}

// Singleton
export const characterCustomization = new CharacterCustomization();
