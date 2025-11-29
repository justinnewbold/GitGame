import Phaser from 'phaser';
import { COLORS } from '../main.js';
import { gameData } from '../utils/GameData.js';

export default class BugBountyScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BugBountyScene' });
    }

    init() {
        this.currentLevel = 1;
        this.maxLevels = 10;
        this.moves = 0;
        this.maxMoves = 0;
    }

    create() {
        const { width, height } = this.cameras.main;

        this.cameras.main.fadeIn(300, 10, 10, 11);

        // Create HUD
        this.createHUD(width);

        // Load level
        this.loadLevel(this.currentLevel);
    }

    createHUD(width) {
        // Back button
        const backBtn = this.add.container(24, 50);
        const backBg = this.add.circle(0, 0, 20, COLORS.surface);
        const backIcon = this.add.text(0, 0, '\u2190', {
            fontSize: '20px',
            color: '#71717a'
        }).setOrigin(0.5);

        backBtn.add([backBg, backIcon]);
        backBg.setInteractive({ useHandCursor: true });
        backBg.on('pointerdown', () => this.exitGame());

        // Title
        this.add.text(width / 2, 50, 'Debug', {
            fontSize: '20px',
            fontFamily: 'Inter, sans-serif',
            color: '#fafafa',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Level indicator
        this.levelText = this.add.text(width - 24, 50, `Level 1/${this.maxLevels}`, {
            fontSize: '14px',
            fontFamily: 'Inter, sans-serif',
            color: '#71717a'
        }).setOrigin(1, 0.5);

        // Moves counter
        this.movesText = this.add.text(width / 2, 85, 'Moves: 0', {
            fontSize: '14px',
            fontFamily: 'Inter, sans-serif',
            color: '#71717a'
        }).setOrigin(0.5);
    }

    getPuzzles() {
        return [
            {
                level: 1,
                title: 'Missing Semicolon',
                code: ['let x = 5', 'console.log(x)'],
                bugs: [0, 1],
                solution: 'Add semicolons to fix syntax',
                maxMoves: 2
            },
            {
                level: 2,
                title: 'Undefined Variable',
                code: ['let x = 5;', 'console.log(y);'],
                bugs: [1],
                solution: 'y should be x',
                maxMoves: 1
            },
            {
                level: 3,
                title: 'Infinite Loop',
                code: ['let i = 0;', 'while (i < 10) {', '  log(i);', '}'],
                bugs: [3],
                solution: 'Missing i++ increment',
                maxMoves: 1
            },
            {
                level: 4,
                title: 'Type Error',
                code: ['let a = "5";', 'let b = 10;', 'let sum = a + b;'],
                bugs: [0],
                solution: 'Convert string to number',
                maxMoves: 1
            },
            {
                level: 5,
                title: 'Off By One',
                code: ['let arr = [1,2,3];', 'for(i=0; i<=3; i++)', '  log(arr[i]);'],
                bugs: [1],
                solution: 'i <= 3 should be i < 3',
                maxMoves: 1
            },
            {
                level: 6,
                title: 'Null Check',
                code: ['let obj = null;', 'log(obj.name);'],
                bugs: [1],
                solution: 'Check if obj exists first',
                maxMoves: 1
            },
            {
                level: 7,
                title: 'Async Issue',
                code: ['let data;', 'fetch(url).then(d=>', '  data = d);', 'log(data);'],
                bugs: [3],
                solution: 'Log inside the then',
                maxMoves: 1
            },
            {
                level: 8,
                title: 'Closure Bug',
                code: ['for(var i=0; i<3; i++)', '  setTimeout(()=>', '    log(i), 100);'],
                bugs: [0],
                solution: 'Use let instead of var',
                maxMoves: 1
            },
            {
                level: 9,
                title: 'Missing Return',
                code: ['function add(a,b) {', '  a + b;', '}'],
                bugs: [1],
                solution: 'Missing return statement',
                maxMoves: 1
            },
            {
                level: 10,
                title: 'Final Challenge',
                code: ['var data = null;', 'fetch().then(d =>', '  data = d)', 'if(data.ok)', '  process();'],
                bugs: [0, 2, 3],
                solution: 'Multiple bugs to fix',
                maxMoves: 3
            }
        ];
    }

    loadLevel(levelNum) {
        const { width, height } = this.cameras.main;

        // Clear previous puzzle
        if (this.puzzleContainer) {
            this.puzzleContainer.destroy();
        }

        const puzzles = this.getPuzzles();
        const puzzle = puzzles.find(p => p.level === levelNum);

        if (!puzzle) {
            this.winGame();
            return;
        }

        this.currentPuzzle = puzzle;
        this.moves = 0;
        this.maxMoves = puzzle.maxMoves;
        this.bugsFixed = [];

        // Update HUD
        this.levelText.setText(`Level ${levelNum}/${this.maxLevels}`);
        this.movesText.setText(`Moves: 0/${this.maxMoves}`);

        // Create puzzle container
        this.puzzleContainer = this.add.container(0, 0);

        // Puzzle title
        const title = this.add.text(width / 2, 140, puzzle.title, {
            fontSize: '24px',
            fontFamily: 'Inter, sans-serif',
            color: '#fafafa',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.puzzleContainer.add(title);

        // Code display
        const codeStartY = 200;
        const lineHeight = 50;

        puzzle.code.forEach((line, index) => {
            const isBug = puzzle.bugs.includes(index);
            const lineY = codeStartY + index * lineHeight;

            // Line background
            const lineBg = this.add.rectangle(
                width / 2,
                lineY,
                width - 48,
                44,
                isBug ? 0x3f1d1d : COLORS.surface
            );
            lineBg.setStrokeStyle(1, isBug ? COLORS.error : COLORS.surfaceLight);

            // Line number
            const lineNum = this.add.text(35, lineY, `${index + 1}`, {
                fontSize: '12px',
                fontFamily: 'monospace',
                color: '#52525b'
            }).setOrigin(0, 0.5);

            // Code text
            const codeText = this.add.text(60, lineY, line, {
                fontSize: '14px',
                fontFamily: 'monospace',
                color: isBug ? '#fca5a5' : '#a1a1aa'
            }).setOrigin(0, 0.5);

            this.puzzleContainer.add([lineBg, lineNum, codeText]);

            // Make bug lines tappable
            if (isBug) {
                lineBg.setInteractive({ useHandCursor: true });

                lineBg.on('pointerover', () => {
                    if (!this.bugsFixed.includes(index)) {
                        lineBg.setFillStyle(0x5f2d2d);
                    }
                });

                lineBg.on('pointerout', () => {
                    if (!this.bugsFixed.includes(index)) {
                        lineBg.setFillStyle(0x3f1d1d);
                    }
                });

                lineBg.on('pointerdown', () => {
                    if (!this.bugsFixed.includes(index)) {
                        this.fixBug(index, lineBg, codeText);
                    }
                });
            }
        });

        // Hint text
        const hint = this.add.text(width / 2, codeStartY + puzzle.code.length * lineHeight + 30,
            `Tap the buggy lines to fix them`, {
            fontSize: '13px',
            fontFamily: 'Inter, sans-serif',
            color: '#71717a'
        }).setOrigin(0.5);
        this.puzzleContainer.add(hint);

        // Hint button
        const hintBtn = this.add.container(width / 2, height - 120);
        const hintBg = this.add.rectangle(0, 0, 160, 44, COLORS.surface);
        hintBg.setStrokeStyle(1, COLORS.surfaceLight);
        const hintText = this.add.text(0, 0, 'Show Hint', {
            fontSize: '14px',
            fontFamily: 'Inter, sans-serif',
            color: '#71717a'
        }).setOrigin(0.5);

        hintBtn.add([hintBg, hintText]);
        this.puzzleContainer.add(hintBtn);

        hintBg.setInteractive({ useHandCursor: true });
        hintBg.on('pointerdown', () => {
            // Show hint
            const hintPopup = this.add.text(width / 2, height / 2, puzzle.solution, {
                fontSize: '16px',
                fontFamily: 'Inter, sans-serif',
                color: '#fafafa',
                backgroundColor: '#1a1a1d',
                padding: { x: 20, y: 15 }
            }).setOrigin(0.5);

            this.tweens.add({
                targets: hintPopup,
                alpha: 0,
                y: height / 2 - 30,
                duration: 2000,
                delay: 1000,
                onComplete: () => hintPopup.destroy()
            });
        });
    }

    fixBug(lineIndex, lineBg, codeText) {
        this.moves++;
        this.bugsFixed.push(lineIndex);

        // Update visuals
        lineBg.setFillStyle(0x1d3f1d);
        lineBg.setStrokeStyle(1, COLORS.success);
        codeText.setColor('#86efac');

        // Update moves counter
        this.movesText.setText(`Moves: ${this.moves}/${this.maxMoves}`);

        // Check if all bugs fixed
        if (this.bugsFixed.length === this.currentPuzzle.bugs.length) {
            this.time.delayedCall(500, () => this.completeLevel());
        }

        // Check if out of moves
        if (this.moves >= this.maxMoves && this.bugsFixed.length < this.currentPuzzle.bugs.length) {
            this.time.delayedCall(500, () => this.failLevel());
        }
    }

    completeLevel() {
        const { width, height } = this.cameras.main;

        // Calculate stars
        const efficiency = this.bugsFixed.length / this.moves;
        let stars = efficiency >= 1 ? 3 : efficiency >= 0.7 ? 2 : 1;

        // Update stats
        gameData.updateStat('bugBounty', 'bestLevel', this.currentLevel);

        // Success overlay
        const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.85);

        this.add.text(width / 2, height / 2 - 60, 'Level Complete!', {
            fontSize: '28px',
            fontFamily: 'Inter, sans-serif',
            color: '#fafafa',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Stars
        const starDisplay = '\u2605'.repeat(stars) + '\u2606'.repeat(3 - stars);
        this.add.text(width / 2, height / 2, starDisplay, {
            fontSize: '36px',
            color: '#eab308'
        }).setOrigin(0.5);

        this.add.text(width / 2, height / 2 + 50, `Moves: ${this.moves}/${this.maxMoves}`, {
            fontSize: '14px',
            fontFamily: 'Inter, sans-serif',
            color: '#71717a'
        }).setOrigin(0.5);

        // Next button
        const nextBg = this.add.rectangle(width / 2, height / 2 + 120, 200, 50, COLORS.warning);
        this.add.text(width / 2, height / 2 + 120, 'Next Level', {
            fontSize: '16px',
            fontFamily: 'Inter, sans-serif',
            color: '#fafafa',
            fontStyle: '600'
        }).setOrigin(0.5);

        nextBg.setInteractive({ useHandCursor: true });
        nextBg.on('pointerdown', () => {
            overlay.destroy();
            this.currentLevel++;
            this.loadLevel(this.currentLevel);
        });
    }

    failLevel() {
        const { width, height } = this.cameras.main;

        // Fail overlay
        const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.85);

        this.add.text(width / 2, height / 2 - 40, 'Out of Moves', {
            fontSize: '28px',
            fontFamily: 'Inter, sans-serif',
            color: '#fafafa',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(width / 2, height / 2 + 10, 'Try again?', {
            fontSize: '14px',
            fontFamily: 'Inter, sans-serif',
            color: '#71717a'
        }).setOrigin(0.5);

        // Retry button
        const retryBg = this.add.rectangle(width / 2, height / 2 + 80, 200, 50, COLORS.error);
        this.add.text(width / 2, height / 2 + 80, 'Retry', {
            fontSize: '16px',
            fontFamily: 'Inter, sans-serif',
            color: '#fafafa',
            fontStyle: '600'
        }).setOrigin(0.5);

        retryBg.setInteractive({ useHandCursor: true });
        retryBg.on('pointerdown', () => {
            overlay.destroy();
            this.loadLevel(this.currentLevel);
        });

        // Menu button
        const menuBg = this.add.rectangle(width / 2, height / 2 + 145, 200, 50, COLORS.surface);
        menuBg.setStrokeStyle(1, COLORS.surfaceLight);
        this.add.text(width / 2, height / 2 + 145, 'Menu', {
            fontSize: '16px',
            fontFamily: 'Inter, sans-serif',
            color: '#fafafa'
        }).setOrigin(0.5);

        menuBg.setInteractive({ useHandCursor: true });
        menuBg.on('pointerdown', () => this.exitGame());
    }

    winGame() {
        const { width, height } = this.cameras.main;

        // Update stats
        gameData.updateStat('bugBounty', 'levelsCompleted', this.maxLevels);

        // Win overlay
        const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.9);

        this.add.text(width / 2, height / 2 - 60, 'All Bugs Fixed!', {
            fontSize: '32px',
            fontFamily: 'Inter, sans-serif',
            color: '#fafafa',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(width / 2, height / 2, '\u{1F389}', {
            fontSize: '48px'
        }).setOrigin(0.5);

        this.add.text(width / 2, height / 2 + 50, `${this.maxLevels} levels completed`, {
            fontSize: '16px',
            fontFamily: 'Inter, sans-serif',
            color: '#71717a'
        }).setOrigin(0.5);

        // Menu button
        const menuBg = this.add.rectangle(width / 2, height / 2 + 120, 200, 50, COLORS.warning);
        this.add.text(width / 2, height / 2 + 120, 'Back to Menu', {
            fontSize: '16px',
            fontFamily: 'Inter, sans-serif',
            color: '#fafafa',
            fontStyle: '600'
        }).setOrigin(0.5);

        menuBg.setInteractive({ useHandCursor: true });
        menuBg.on('pointerdown', () => this.exitGame());
    }

    exitGame() {
        this.cameras.main.fadeOut(200, 10, 10, 11);
        this.time.delayedCall(200, () => {
            this.scene.start('MainMenuScene');
        });
    }
}
