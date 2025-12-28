/**
 * Theme - Centralized color and style constants
 * Integrates with CosmeticsSystem for dynamic theming
 */

import { cosmeticsSystem } from './CosmeticsSystem.js';

// Base color palette (Terminal Green theme - default)
const BASE_COLORS = {
    // Backgrounds
    background: 0x1a1a2e,
    backgroundDark: 0x0a0a1a,
    backgroundLight: 0x2a2a4e,
    overlay: 0x000000,

    // Primary colors
    primary: 0x00ff00,
    primaryHex: '#00ff00',
    primaryDark: 0x00cc00,
    primaryLight: 0x33ff33,

    // Secondary colors
    secondary: 0x00ffff,
    secondaryHex: '#00ffff',

    // Accent colors
    accent: 0xffaa00,
    accentHex: '#ffaa00',
    gold: 0xffd700,
    goldHex: '#ffd700',

    // Status colors
    success: 0x00ff00,
    successHex: '#00ff00',
    warning: 0xffaa00,
    warningHex: '#ffaa00',
    error: 0xff0000,
    errorHex: '#ff0000',
    info: 0x00aaff,
    infoHex: '#00aaff',

    // Text colors
    textPrimary: '#ffffff',
    textSecondary: '#aaaaaa',
    textMuted: '#666666',
    textHighlight: '#00ff00',

    // UI colors
    buttonBg: '#333333',
    buttonHover: '#555555',
    buttonActive: '#00aa00',
    panelBg: 0x1a1a2e,
    panelBorder: 0x00ff00,

    // Game-specific colors
    player: 0x00ff00,
    enemy: 0xff0000,
    powerup: 0x00ffff,
    bullet: 0xffff00,
    health: 0x00ff00,
    healthLow: 0xff0000,
    shield: 0x0088ff,
    combo: 0xffaa00
};

// Rarity colors
export const RARITY_COLORS = {
    common: { hex: '#888888', int: 0x888888 },
    uncommon: { hex: '#00ff00', int: 0x00ff00 },
    rare: { hex: '#0088ff', int: 0x0088ff },
    epic: { hex: '#aa00ff', int: 0xaa00ff },
    legendary: { hex: '#ffd700', int: 0xffd700 }
};

// Text style presets
export const TEXT_STYLES = {
    title: {
        fontSize: '36px',
        fontFamily: 'monospace',
        color: '#00ff00',
        fontStyle: 'bold'
    },
    subtitle: {
        fontSize: '24px',
        fontFamily: 'monospace',
        color: '#00ff00',
        fontStyle: 'bold'
    },
    heading: {
        fontSize: '20px',
        fontFamily: 'monospace',
        color: '#ffffff',
        fontStyle: 'bold'
    },
    body: {
        fontSize: '16px',
        fontFamily: 'monospace',
        color: '#ffffff'
    },
    small: {
        fontSize: '14px',
        fontFamily: 'monospace',
        color: '#aaaaaa'
    },
    button: {
        fontSize: '16px',
        fontFamily: 'monospace',
        color: '#ffffff',
        backgroundColor: '#333333',
        padding: { x: 15, y: 8 }
    },
    buttonSmall: {
        fontSize: '14px',
        fontFamily: 'monospace',
        color: '#ffffff',
        backgroundColor: '#333333',
        padding: { x: 10, y: 5 }
    }
};

/**
 * Theme manager class
 */
class ThemeManager {
    constructor() {
        this.currentTheme = 'terminal';
        this.colors = { ...BASE_COLORS };
    }

    /**
     * Get current theme colors (integrates with cosmetics)
     */
    getColors() {
        try {
            const themeColors = cosmeticsSystem.getThemeColors();
            if (themeColors) {
                return {
                    ...this.colors,
                    primaryHex: themeColors.primary,
                    primary: this.hexToInt(themeColors.primary),
                    secondaryHex: themeColors.secondary,
                    secondary: this.hexToInt(themeColors.secondary),
                    backgroundHex: themeColors.background,
                    textPrimary: themeColors.text,
                    textHighlight: themeColors.accent
                };
            }
        } catch (e) {
            // Fall back to base colors if cosmetics not available
        }
        return this.colors;
    }

    /**
     * Convert hex string to integer
     */
    hexToInt(hex) {
        if (typeof hex === 'number') return hex;
        return parseInt(hex.replace('#', ''), 16);
    }

    /**
     * Get a specific color
     */
    getColor(name) {
        const colors = this.getColors();
        return colors[name] || BASE_COLORS[name];
    }

    /**
     * Get text style with theme colors applied
     */
    getTextStyle(preset, overrides = {}) {
        const baseStyle = TEXT_STYLES[preset] || TEXT_STYLES.body;
        const colors = this.getColors();

        // Apply theme colors to style
        const themedStyle = { ...baseStyle };
        if (baseStyle.color === '#00ff00') {
            themedStyle.color = colors.primaryHex;
        }

        return { ...themedStyle, ...overrides };
    }

    /**
     * Create a themed button style
     */
    getButtonStyle(variant = 'default') {
        const colors = this.getColors();

        const variants = {
            default: {
                ...TEXT_STYLES.button,
                backgroundColor: colors.buttonBg
            },
            primary: {
                ...TEXT_STYLES.button,
                backgroundColor: colors.primaryHex,
                color: '#000000'
            },
            danger: {
                ...TEXT_STYLES.button,
                backgroundColor: colors.errorHex,
                color: '#ffffff'
            },
            success: {
                ...TEXT_STYLES.button,
                backgroundColor: colors.successHex,
                color: '#000000'
            }
        };

        return variants[variant] || variants.default;
    }
}

// Export singleton
export const theme = new ThemeManager();

// Export base colors for direct access
export const COLORS = BASE_COLORS;

// Export for convenience
export default theme;
