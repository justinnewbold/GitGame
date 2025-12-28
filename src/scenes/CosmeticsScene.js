/**
 * CosmeticsScene - Browse and equip cosmetic items
 */

import Phaser from 'phaser';
import { logger } from '../utils/Logger.js';
import { COLORS, RARITY_COLORS, TEXT_STYLES } from '../utils/Theme.js';
import { cosmeticsSystem } from '../utils/CosmeticsSystem.js';

export default class CosmeticsScene extends Phaser.Scene {
    constructor() {
        super({ key: 'CosmeticsScene' });
        this.currentCategory = 'skins';
        this.selectedItem = null;
    }

    create() {
        const { width, height } = this.cameras.main;

        // Background
        this.add.rectangle(0, 0, width, height, COLORS.background).setOrigin(0);

        // Title
        this.add.text(width / 2, 40, 'Cosmetics Shop', TEXT_STYLES.title).setOrigin(0.5);

        // Currency display
        const currency = cosmeticsSystem.getCurrency();
        this.currencyText = this.add.text(width - 20, 40, `${currency} Coins`, {
            fontSize: '18px',
            fontFamily: 'monospace',
            color: COLORS.goldHex,
            fontStyle: 'bold'
        }).setOrigin(1, 0.5);

        // Category tabs
        this.createCategoryTabs();

        // Back button
        this.createBackButton();

        // Items container
        this.itemsContainer = this.add.container(0, 160);

        // Preview panel
        this.createPreviewPanel();

        // Load items
        this.loadItems();

        logger.info('CosmeticsScene', 'Scene created');
    }

    createCategoryTabs() {
        const { width } = this.cameras.main;
        const categories = ['skins', 'trails', 'themes', 'titles'];
        const tabWidth = 90;
        const startX = width / 2 - (categories.length * tabWidth) / 2;

        categories.forEach((cat, i) => {
            const x = startX + i * tabWidth + tabWidth / 2;
            const isActive = cat === this.currentCategory;

            const tab = this.add.text(x, 100, cat.toUpperCase(), {
                fontSize: '12px',
                fontFamily: 'monospace',
                color: isActive ? '#000000' : COLORS.textSecondary,
                backgroundColor: isActive ? COLORS.primaryHex : COLORS.buttonBg,
                padding: { x: 10, y: 5 }
            }).setOrigin(0.5);

            tab.setInteractive({ useHandCursor: true });
            tab.on('pointerdown', () => {
                this.currentCategory = cat;
                this.selectedItem = null;
                this.scene.restart();
            });
        });
    }

    createPreviewPanel() {
        const { width, height } = this.cameras.main;
        const panelX = width - 180;
        const panelY = 180;
        const panelWidth = 300;
        const panelHeight = height - 220;

        // Panel background
        this.previewBg = this.add.rectangle(panelX, panelY, panelWidth, panelHeight, 0x2a2a4e);
        this.previewBg.setOrigin(0, 0);
        this.previewBg.setStrokeStyle(2, COLORS.primary);

        // Preview content (will be updated on selection)
        this.previewContainer = this.add.container(panelX + panelWidth / 2, panelY + 40);

        this.previewTitle = this.add.text(0, 0, 'Select an item', {
            fontSize: '16px',
            fontFamily: 'monospace',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.previewContainer.add(this.previewTitle);

        this.previewIcon = this.add.text(0, 50, '', {
            fontSize: '48px'
        }).setOrigin(0.5);
        this.previewContainer.add(this.previewIcon);

        this.previewDesc = this.add.text(0, 110, '', {
            fontSize: '12px',
            fontFamily: 'monospace',
            color: '#aaaaaa',
            wordWrap: { width: 260 },
            align: 'center'
        }).setOrigin(0.5, 0);
        this.previewContainer.add(this.previewDesc);

        this.previewRarity = this.add.text(0, 160, '', {
            fontSize: '12px',
            fontFamily: 'monospace'
        }).setOrigin(0.5);
        this.previewContainer.add(this.previewRarity);

        // Action button (buy/equip)
        this.actionBtn = this.add.text(0, panelHeight - 80, '', {
            fontSize: '16px',
            fontFamily: 'monospace',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5);
        this.actionBtn.setInteractive({ useHandCursor: true });
        this.previewContainer.add(this.actionBtn);
        this.actionBtn.setVisible(false);
    }

    loadItems() {
        this.itemsContainer.removeAll(true);
        const items = cosmeticsSystem.getAllInCategory(this.currentCategory);

        const itemsPerRow = 4;
        const itemSize = 80;
        const startX = 60;
        const startY = 0;

        items.forEach((item, i) => {
            const row = Math.floor(i / itemsPerRow);
            const col = i % itemsPerRow;
            const x = startX + col * (itemSize + 20);
            const y = startY + row * (itemSize + 20);

            this.createItemCard(item, x, y, itemSize);
        });
    }

    createItemCard(item, x, y, size) {
        const isOwned = item.owned;
        const isEquipped = item.equipped;

        // Card background
        const bg = this.add.rectangle(x + size / 2, y + size / 2, size, size,
            isEquipped ? 0x004400 : (isOwned ? 0x2a2a4e : 0x1a1a2e));
        bg.setStrokeStyle(2, isEquipped ? COLORS.primary : (isOwned ? 0x444444 : 0x333333));
        bg.setInteractive({ useHandCursor: true });
        this.itemsContainer.add(bg);

        // Icon or color preview
        if (item.icon) {
            const icon = this.add.text(x + size / 2, y + size / 2 - 5, item.icon, {
                fontSize: '28px'
            }).setOrigin(0.5);
            if (!isOwned) icon.setAlpha(0.3);
            this.itemsContainer.add(icon);
        } else if (item.color) {
            const colorPreview = this.add.rectangle(x + size / 2, y + size / 2 - 5, 30, 30, item.color);
            if (!isOwned) colorPreview.setAlpha(0.3);
            this.itemsContainer.add(colorPreview);
        } else if (item.colors) {
            // Theme preview
            const themePreview = this.add.rectangle(x + size / 2, y + size / 2 - 5, 40, 20,
                parseInt(item.colors.primary.replace('#', '0x')));
            if (!isOwned) themePreview.setAlpha(0.3);
            this.itemsContainer.add(themePreview);
        }

        // Name
        const name = this.add.text(x + size / 2, y + size - 10, item.name, {
            fontSize: '9px',
            fontFamily: 'monospace',
            color: isOwned ? '#ffffff' : '#666666'
        }).setOrigin(0.5);
        this.itemsContainer.add(name);

        // Rarity dot
        const rarityColor = RARITY_COLORS[item.rarity]?.int || 0x888888;
        const rarityDot = this.add.circle(x + size - 8, y + 8, 4, rarityColor);
        this.itemsContainer.add(rarityDot);

        // Equipped indicator
        if (isEquipped) {
            const equipped = this.add.text(x + 8, y + 8, '✓', {
                fontSize: '12px',
                color: COLORS.primaryHex
            });
            this.itemsContainer.add(equipped);
        }

        // Click handler
        bg.on('pointerdown', () => this.selectItem(item));
        bg.on('pointerover', () => bg.setStrokeStyle(3, COLORS.accent));
        bg.on('pointerout', () => bg.setStrokeStyle(2,
            isEquipped ? COLORS.primary : (isOwned ? 0x444444 : 0x333333)));
    }

    selectItem(item) {
        this.selectedItem = item;
        this.updatePreview(item);
    }

    updatePreview(item) {
        this.previewTitle.setText(item.name);
        this.previewIcon.setText(item.icon || '');
        this.previewDesc.setText(item.description || '');

        const rarityColor = RARITY_COLORS[item.rarity]?.hex || '#888888';
        this.previewRarity.setText(item.rarity.toUpperCase());
        this.previewRarity.setColor(rarityColor);

        // Update action button
        this.actionBtn.setVisible(true);
        this.actionBtn.removeAllListeners();

        if (item.owned) {
            if (item.equipped) {
                this.actionBtn.setText('EQUIPPED');
                this.actionBtn.setStyle({
                    color: '#666666',
                    backgroundColor: '#333333',
                    padding: { x: 20, y: 10 }
                });
            } else {
                this.actionBtn.setText('EQUIP');
                this.actionBtn.setStyle({
                    color: '#000000',
                    backgroundColor: COLORS.primaryHex,
                    padding: { x: 20, y: 10 }
                });
                this.actionBtn.on('pointerdown', () => this.equipItem(item));
            }
        } else if (item.achievement) {
            this.actionBtn.setText('UNLOCK VIA ACHIEVEMENT');
            this.actionBtn.setStyle({
                color: '#aaaaaa',
                backgroundColor: '#333333',
                padding: { x: 10, y: 10 }
            });
        } else {
            const currency = cosmeticsSystem.getCurrency();
            const canAfford = currency >= item.price;

            this.actionBtn.setText(`BUY - ${item.price}`);
            this.actionBtn.setStyle({
                color: canAfford ? '#000000' : '#ff0000',
                backgroundColor: canAfford ? COLORS.goldHex : '#333333',
                padding: { x: 20, y: 10 }
            });

            if (canAfford) {
                this.actionBtn.on('pointerdown', () => this.buyItem(item));
            }
        }
    }

    equipItem(item) {
        const result = cosmeticsSystem.equip(this.currentCategory, item.id);
        if (result) {
            this.scene.restart();
        }
    }

    buyItem(item) {
        const result = cosmeticsSystem.purchase(this.currentCategory, item.id);
        if (result.success) {
            this.showPurchasePopup(item);
            this.scene.restart();
        } else {
            this.showErrorPopup(result.error);
        }
    }

    showPurchasePopup(item) {
        const { width, height } = this.cameras.main;

        const popup = this.add.container(width / 2, height / 2);
        popup.setDepth(1000);

        popup.add(this.add.rectangle(0, 0, 300, 150, 0x000000, 0.9)
            .setStrokeStyle(3, COLORS.gold));

        popup.add(this.add.text(0, -40, 'PURCHASED!', {
            fontSize: '24px',
            fontFamily: 'monospace',
            color: COLORS.goldHex,
            fontStyle: 'bold'
        }).setOrigin(0.5));

        popup.add(this.add.text(0, 10, item.name, {
            fontSize: '18px',
            fontFamily: 'monospace',
            color: '#ffffff'
        }).setOrigin(0.5));

        this.tweens.add({
            targets: popup,
            alpha: 0,
            duration: 2000,
            delay: 1000,
            onComplete: () => popup.destroy()
        });
    }

    showErrorPopup(message) {
        const { width, height } = this.cameras.main;

        const popup = this.add.text(width / 2, height / 2, message, {
            fontSize: '16px',
            fontFamily: 'monospace',
            color: COLORS.errorHex,
            backgroundColor: '#330000',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setDepth(1000);

        this.tweens.add({
            targets: popup,
            alpha: 0,
            duration: 1500,
            delay: 1000,
            onComplete: () => popup.destroy()
        });
    }

    createBackButton() {
        const backBtn = this.add.text(20, 20, '← Back', TEXT_STYLES.buttonSmall);
        backBtn.setInteractive({ useHandCursor: true });
        backBtn.on('pointerdown', () => this.scene.start('MainMenuScene'));
        backBtn.on('pointerover', () => backBtn.setStyle({ backgroundColor: COLORS.buttonHover }));
        backBtn.on('pointerout', () => backBtn.setStyle({ backgroundColor: COLORS.buttonBg }));
    }
}
