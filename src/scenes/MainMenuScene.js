/**
 * MainMenuScene - Main menu with game mode selection
 * Refactored to use new architecture (UIFactory, Constants, BaseScene)
 */

import BaseScene from '../core/BaseScene.js';
import { SCENE_NAMES, COLORS, UI_STYLES } from '../constants/GameConstants.js';

export default class MainMenuScene extends BaseScene {
    constructor() {
        super({ key: SCENE_NAMES.MAIN_MENU });
    }

    create() {
        // Call base create for common setup
        super.baseCreate();

        // Difficulty selector
        this.createDifficultySelector();

        // Title
        this.ui.createTitle(this.width / 2, 80, 'GitGame');

        // Subtitle
        this.add.text(this.width / 2, 130, '⚠️ Only the Best Devs Survive! ⚠️', {
            fontSize: UI_STYLES.FONT.SIZE.MEDIUM,
            fontFamily: UI_STYLES.FONT.FAMILY,
            color: '#ffaa00'
        }).setOrigin(0.5);

        // Funny quote
        const quotes = [
            '"Works on my machine" - Famous Last Words',
            '"It\'s not a bug, it\'s a feature" - Survivor Chronicles',
            '"Just one more merge..." - Epitaph',
            '"I\'ll fix it in production" - Legends Never Die',
            '"Who needs tests anyway?" - Natural Selection'
        ];
        const randomQuote = Phaser.Utils.Array.GetRandom(quotes);
        this.add.text(this.width / 2, 160, randomQuote, {
            fontSize: UI_STYLES.FONT.SIZE.SMALL,
            fontFamily: UI_STYLES.FONT.FAMILY,
            color: '#888888',
            fontStyle: 'italic'
        }).setOrigin(0.5);

        // Game mode buttons
        const buttonY = 220;
        const buttonSpacing = 80;

        this.ui.createGameModeButton(
            this.width / 2, buttonY,
            '🗡️ Git Survivor',
            'Roguelike: Face merge conflicts & bugs!',
            SCENE_NAMES.GIT_SURVIVOR,
            COLORS.GIT_SURVIVOR
        );

        this.ui.createGameModeButton(
            this.width / 2, buttonY + buttonSpacing,
            '🏰 Code Defense',
            'Tower Defense: Protect your codebase!',
            SCENE_NAMES.CODE_DEFENSE,
            COLORS.CODE_DEFENSE
        );

        this.ui.createGameModeButton(
            this.width / 2, buttonY + buttonSpacing * 2,
            '⏰ PR Rush',
            'Time Management: Review PRs under pressure!',
            SCENE_NAMES.PR_RUSH,
            COLORS.PR_RUSH
        );

        this.ui.createGameModeButton(
            this.width / 2, buttonY + buttonSpacing * 3,
            '⚔️ Dev Commander',
            'RTS: Manage your dev team!',
            SCENE_NAMES.DEV_COMMANDER,
            COLORS.DEV_COMMANDER
        );

        this.ui.createGameModeButton(
            this.width / 2, buttonY + buttonSpacing * 4,
            '🏰 Debug Dungeon',
            'Dungeon Crawler: Clear rooms of bugs!',
            SCENE_NAMES.DEBUG_DUNGEON,
            COLORS.DEBUG_DUNGEON
        );

        this.ui.createGameModeButton(
            this.width / 2, buttonY + buttonSpacing * 5,
            '🏎️ Refactor Race',
            'Time Trial: Refactor code at speed!',
            SCENE_NAMES.REFACTOR_RACE,
            COLORS.REFACTOR_RACE
        );

        this.ui.createGameModeButton(
            this.width / 2, buttonY + buttonSpacing * 6,
            '🏃 Sprint Survivor',
            'Endless Runner: Dodge to survive!',
            SCENE_NAMES.SPRINT_SURVIVOR,
            COLORS.SPRINT_SURVIVOR
        );

        this.ui.createGameModeButton(
            this.width / 2, buttonY + buttonSpacing * 7,
            '🐛 Bug Bounty',
            'Puzzle: Fix bugs with limited moves!',
            SCENE_NAMES.BUG_BOUNTY,
            COLORS.BUG_BOUNTY
        );

        this.ui.createGameModeButton(
            this.width / 2, buttonY + buttonSpacing * 8,
            '⛏️ Legacy Excavator',
            'Mining: Dig for code artifacts!',
            SCENE_NAMES.LEGACY_EXCAVATOR,
            COLORS.LEGACY_EXCAVATOR
        );

        this.ui.createGameModeButton(
            this.width / 2, buttonY + buttonSpacing * 9,
            '👹 Boss Rush',
            'Challenge: Fight all bosses!',
            SCENE_NAMES.BOSS_RUSH,
            COLORS.BOSS_RUSH
        );

        // Settings button
        this.ui.createButton(
            this.width - 20, 20,
            '⚙️ Settings',
            () => this.transitionTo(SCENE_NAMES.SETTINGS),
            { originX: 1, originY: 0 }
        );

        // Feature buttons (right side)
        this.createFeatureButtons();

        // Footer
        this.add.text(this.width / 2, this.height - 20,
            'Made with ❤️ and lots of git conflicts', {
            fontSize: UI_STYLES.FONT.SIZE.TINY,
            fontFamily: UI_STYLES.FONT.FAMILY,
            color: '#555555'
        }).setOrigin(0.5);
    }

    createFeatureButtons() {
        const startY = 200;
        const spacing = 65;

        // Section title
        this.ui.createSectionHeader(this.width - 180, startY - 30, 'FEATURES');

        // Feature buttons with UIFactory
        this.ui.createFeatureButton(this.width - 180, startY, '🎖️ Battle Pass', SCENE_NAMES.BATTLE_PASS, COLORS.BATTLE_PASS);
        this.ui.createFeatureButton(this.width - 180, startY + spacing, '🏆 Ranked', SCENE_NAMES.RANKED, COLORS.RANKED);
        this.ui.createFeatureButton(this.width - 180, startY + spacing * 2, '👤 Profile', SCENE_NAMES.PROFILE, COLORS.PROFILE);
        this.ui.createFeatureButton(this.width - 180, startY + spacing * 3, '⚔️ Clan', SCENE_NAMES.CLAN, COLORS.CLAN);
        this.ui.createFeatureButton(this.width - 180, startY + spacing * 4, '📖 Campaign', SCENE_NAMES.CAMPAIGN, COLORS.CAMPAIGN);
        this.ui.createFeatureButton(this.width - 180, startY + spacing * 5, '🎯 Challenges', SCENE_NAMES.CHALLENGES, COLORS.CHALLENGES);
        this.ui.createFeatureButton(this.width - 180, startY + spacing * 6, '🎁 Crates', SCENE_NAMES.LOOT_CRATE, COLORS.LOOT_CRATE);
        this.ui.createFeatureButton(this.width - 180, startY + spacing * 7, '👥 Friends', SCENE_NAMES.FRIENDS, COLORS.FRIENDS);
    }

    createDifficultySelector() {
        const gameData = this.getGameData();
        const currentDifficulty = gameData.getDifficulty();

        this.ui.createLabel(20, 20, 'Difficulty:');

        const difficulties = ['normal', 'hard', 'nightmare'];
        const colors = { normal: COLORS.SUCCESS, hard: COLORS.WARNING, nightmare: COLORS.DANGER };
        const labels = { normal: '😊 Normal', hard: '😅 Hard', nightmare: '💀 Nightmare' };

        difficulties.forEach((difficulty, index) => {
            const x = 100 + (index * 100);
            const y = 20;
            const isSelected = difficulty === currentDifficulty;

            const btn = this.ui.createButton(
                x, y, labels[difficulty],
                () => {
                    gameData.setDifficulty(difficulty);
                    this.scene.restart(); // Refresh the menu
                },
                {
                    fontSize: UI_STYLES.FONT.SIZE.SMALL,
                    color: isSelected ? '#ffffff' : '#888888',
                    backgroundColor: isSelected ? '#' + colors[difficulty].toString(16).padStart(6, '0') : '#333333'
                }
            );
        });

        // Stats display
        const gamesPlayed = gameData.getStat('gamesPlayed') || 0;
        const totalScore = gameData.getStat('totalScore') || 0;

        if (gamesPlayed > 0) {
            this.add.text(20, 45, `Games Played: ${gamesPlayed} | Total Score: ${totalScore}`, {
                fontSize: UI_STYLES.FONT.SIZE.TINY,
                fontFamily: UI_STYLES.FONT.FAMILY,
                color: '#888888'
            });
        }
    }
}
