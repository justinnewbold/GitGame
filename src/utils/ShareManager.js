// ShareManager - Social sharing functionality
// Supports native Web Share API, social media, and clipboard

export default class ShareManager {
    constructor() {
        this.gameTitle = 'GitGame';
        this.gameUrl = typeof window !== 'undefined' ? window.location.href : 'https://github.com/yourusername/gitgame';
        this.supportsNativeShare = this.checkNativeShareSupport();
    }

    /**
     * Check if browser supports Web Share API
     */
    checkNativeShareSupport() {
        return typeof navigator !== 'undefined' && navigator.share !== undefined;
    }

    /**
     * Share a score
     * @param {string} gameMode - Name of game mode
     * @param {number} score - Score achieved
     * @param {Object} options - Additional options (difficulty, stats, etc.)
     */
    async shareScore(gameMode, score, options = {}) {
        const text = this.generateScoreText(gameMode, score, options);

        if (this.supportsNativeShare) {
            return this.nativeShare({
                title: `${this.gameTitle} - ${gameMode} Score`,
                text: text,
                url: this.gameUrl
            });
        } else {
            // Fallback to clipboard
            return this.copyToClipboard(text);
        }
    }

    /**
     * Share an achievement
     * @param {Object} achievement - Achievement data
     */
    async shareAchievement(achievement) {
        const text = this.generateAchievementText(achievement);

        if (this.supportsNativeShare) {
            return this.nativeShare({
                title: `${this.gameTitle} - Achievement Unlocked!`,
                text: text,
                url: this.gameUrl
            });
        } else {
            return this.copyToClipboard(text);
        }
    }

    /**
     * Share game stats
     * @param {Object} stats - Game statistics
     */
    async shareStats(stats) {
        const text = this.generateStatsText(stats);

        if (this.supportsNativeShare) {
            return this.nativeShare({
                title: `${this.gameTitle} - My Stats`,
                text: text,
                url: this.gameUrl
            });
        } else {
            return this.copyToClipboard(text);
        }
    }

    /**
     * Generate shareable text for a score
     */
    generateScoreText(gameMode, score, options = {}) {
        const difficulty = options.difficulty || 'normal';
        const emoji = this.getGameModeEmoji(gameMode);

        let text = `${emoji} I scored ${score} in ${gameMode}`;

        if (difficulty !== 'normal') {
            text += ` on ${difficulty} difficulty`;
        }

        if (options.enemiesKilled) {
            text += ` (${options.enemiesKilled} enemies defeated)`;
        }

        text += `! <®\n\n`;
        text += `Can you beat my score? Play ${this.gameTitle}!\n`;
        text += `#GitGame #IndieGame #Coding`;

        return text;
    }

    /**
     * Generate shareable text for an achievement
     */
    generateAchievementText(achievement) {
        return `<Æ Achievement Unlocked in ${this.gameTitle}!\n\n` +
               `${achievement.icon} ${achievement.name}\n` +
               `${achievement.description}\n\n` +
               `#GitGame #Achievement #Gaming`;
    }

    /**
     * Generate shareable text for stats
     */
    generateStatsText(stats) {
        return `=Ê My ${this.gameTitle} Stats:\n\n` +
               `<® Games Played: ${stats.gamesPlayed}\n` +
               `P Total Score: ${stats.totalScore}\n` +
               `<Æ Achievements: ${stats.achievements || 0}\n\n` +
               `Think you can do better?\n` +
               `#GitGame #Gaming`;
    }

    /**
     * Get emoji for game mode
     */
    getGameModeEmoji(gameMode) {
        const emojis = {
            'Git Survivor': '=á',
            'GitSurvivor': '=á',
            'Code Defense': '<ð',
            'CodeDefense': '<ð',
            'PR Rush': 'ð',
            'PRRush': 'ð',
            'Dev Commander': '”',
            'DevCommander': '”',
            'Debug Dungeon': '<ð',
            'DebugDungeon': '<ð',
            'Refactor Race': '<Î',
            'RefactorRace': '<Î',
            'Sprint Survivor': '<Ã',
            'SprintSurvivor': '<Ã',
            'Bug Bounty': '=',
            'BugBounty': '=',
            'Legacy Excavator': 'Ï',
            'LegacyExcavator': 'Ï',
            'Boss Rush': '=y',
            'BossRush': '=y'
        };

        return emojis[gameMode] || '<®';
    }

    /**
     * Use native Web Share API
     */
    async nativeShare(data) {
        try {
            await navigator.share(data);
            return { success: true, method: 'native' };
        } catch (error) {
            // User cancelled or error occurred
            if (error.name !== 'AbortError') {
                console.warn('Native share failed:', error);
            }
            return { success: false, error: error.message };
        }
    }

    /**
     * Copy text to clipboard
     */
    async copyToClipboard(text) {
        try {
            // Try modern Clipboard API first
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(text);
                return { success: true, method: 'clipboard' };
            }

            // Fallback to execCommand
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-9999px';
            document.body.appendChild(textArea);
            textArea.select();

            const successful = document.execCommand('copy');
            document.body.removeChild(textArea);

            if (successful) {
                return { success: true, method: 'clipboard' };
            } else {
                throw new Error('Copy command failed');
            }
        } catch (error) {
            console.error('Failed to copy to clipboard:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Share on Twitter
     */
    shareOnTwitter(text) {
        const tweetText = encodeURIComponent(text);
        const url = encodeURIComponent(this.gameUrl);
        const twitterUrl = `https://twitter.com/intent/tweet?text=${tweetText}&url=${url}`;

        window.open(twitterUrl, '_blank', 'width=550,height=420');
        return { success: true, method: 'twitter' };
    }

    /**
     * Share on Facebook
     */
    shareOnFacebook() {
        const url = encodeURIComponent(this.gameUrl);
        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;

        window.open(facebookUrl, '_blank', 'width=550,height=420');
        return { success: true, method: 'facebook' };
    }

    /**
     * Share on Reddit
     */
    shareOnReddit(title, text) {
        const encodedTitle = encodeURIComponent(title);
        const encodedText = encodeURIComponent(text);
        const url = encodeURIComponent(this.gameUrl);
        const redditUrl = `https://www.reddit.com/submit?title=${encodedTitle}&text=${encodedText}&url=${url}`;

        window.open(redditUrl, '_blank', 'width=700,height=500');
        return { success: true, method: 'reddit' };
    }

    /**
     * Create a shareable URL with encoded data
     * This can be used to share specific game states or challenges
     */
    createShareableUrl(data) {
        try {
            const encoded = btoa(JSON.stringify(data));
            const baseUrl = window.location.origin + window.location.pathname;
            return `${baseUrl}?share=${encoded}`;
        } catch (error) {
            console.error('Failed to create shareable URL:', error);
            return this.gameUrl;
        }
    }

    /**
     * Parse a shareable URL
     */
    parseShareableUrl() {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const shareData = urlParams.get('share');

            if (shareData) {
                const decoded = atob(shareData);
                return JSON.parse(decoded);
            }
        } catch (error) {
            console.error('Failed to parse shareable URL:', error);
        }

        return null;
    }

    /**
     * Show share options modal (for use with Phaser scenes)
     * Returns the text for display in a custom modal
     */
    getShareOptions(shareData) {
        return {
            native: this.supportsNativeShare,
            options: [
                {
                    name: 'Copy to Clipboard',
                    icon: '=Ë',
                    method: 'clipboard',
                    available: true
                },
                {
                    name: 'Share on Twitter',
                    icon: '=&',
                    method: 'twitter',
                    available: true
                },
                {
                    name: 'Share on Facebook',
                    icon: '=Ø',
                    method: 'facebook',
                    available: true
                },
                {
                    name: 'Share on Reddit',
                    icon: '=4',
                    method: 'reddit',
                    available: true
                }
            ]
        };
    }
}

// Singleton instance
export const shareManager = new ShareManager();
