/**
 * Analytics - Anonymous game telemetry system
 *
 * Tracks player behavior and game metrics for improving balance and UX.
 * All data is anonymous and stored locally or sent to analytics endpoint.
 *
 * Usage:
 *   import { analytics } from './utils/Analytics.js';
 *
 *   analytics.trackEvent('level_complete', { level: 1, score: 100 });
 *   analytics.trackScreen('main_menu');
 *   analytics.trackError('payment_failed', error);
 */

import { logger } from './Logger.js';

class Analytics {
    constructor() {
        this.enabled = true;
        this.sessionId = this.generateSessionId();
        this.sessionStart = Date.now();
        this.events = [];
        this.maxEvents = 1000;

        // User consent (check localStorage)
        this.checkConsent();

        logger.info('Analytics', 'Analytics initialized', {
            sessionId: this.sessionId,
            enabled: this.enabled
        });
    }

    /**
     * Check if user has consented to analytics
     */
    checkConsent() {
        try {
            const consent = localStorage.getItem('analytics_consent');
            if (consent === 'false') {
                this.enabled = false;
                logger.info('Analytics', 'User opted out of analytics');
            }
        } catch (error) {
            logger.warn('Analytics', 'Could not check consent', { error });
        }
    }

    /**
     * Set user consent for analytics
     */
    setConsent(consent) {
        this.enabled = consent;
        try {
            localStorage.setItem('analytics_consent', consent.toString());
            logger.info('Analytics', 'Analytics consent updated', { consent });
        } catch (error) {
            logger.error('Analytics', 'Could not save consent', { error });
        }
    }

    /**
     * Generate unique session ID
     */
    generateSessionId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Track a custom event
     */
    trackEvent(eventName, properties = {}) {
        if (!this.enabled) return;

        const event = {
            type: 'event',
            name: eventName,
            properties,
            timestamp: Date.now(),
            sessionId: this.sessionId,
            sessionDuration: Date.now() - this.sessionStart
        };

        this.recordEvent(event);
        logger.debug('Analytics', 'Event tracked', event);
    }

    /**
     * Track screen/scene view
     */
    trackScreen(screenName) {
        if (!this.enabled) return;

        this.trackEvent('screen_view', {
            screen_name: screenName
        });
    }

    /**
     * Track game start
     */
    trackGameStart(gameMode) {
        this.trackEvent('game_start', {
            game_mode: gameMode,
            timestamp: Date.now()
        });
    }

    /**
     * Track game end
     */
    trackGameEnd(gameMode, score, duration, stats = {}) {
        this.trackEvent('game_end', {
            game_mode: gameMode,
            score,
            duration,
            ...stats
        });
    }

    /**
     * Track level completion
     */
    trackLevelComplete(level, score, duration) {
        this.trackEvent('level_complete', {
            level,
            score,
            duration
        });
    }

    /**
     * Track player death
     */
    trackDeath(cause, level, score) {
        this.trackEvent('player_death', {
            cause,
            level,
            score
        });
    }

    /**
     * Track power-up collection
     */
    trackPowerUp(powerUpType) {
        this.trackEvent('powerup_collected', {
            type: powerUpType
        });
    }

    /**
     * Track achievement unlocked
     */
    trackAchievement(achievementId) {
        this.trackEvent('achievement_unlocked', {
            achievement_id: achievementId
        });
    }

    /**
     * Track error
     */
    trackError(errorType, error) {
        if (!this.enabled) return;

        const errorEvent = {
            type: 'error',
            error_type: errorType,
            message: error?.message || 'Unknown error',
            stack: error?.stack,
            timestamp: Date.now(),
            sessionId: this.sessionId
        };

        this.recordEvent(errorEvent);
        logger.debug('Analytics', 'Error tracked', errorEvent);
    }

    /**
     * Track performance metric
     */
    trackPerformance(metricName, value, unit = 'ms') {
        if (!this.enabled) return;

        this.trackEvent('performance', {
            metric: metricName,
            value,
            unit
        });
    }

    /**
     * Record event in memory
     */
    recordEvent(event) {
        this.events.push(event);

        // Limit stored events
        if (this.events.length > this.maxEvents) {
            this.events.shift();
        }

        // Send to analytics endpoint (if configured)
        this.sendToEndpoint(event);
    }

    /**
     * Send event to analytics endpoint
     */
    async sendToEndpoint(event) {
        // Only send in production or if endpoint is configured
        const endpoint = this.getAnalyticsEndpoint();
        if (!endpoint) return;

        try {
            await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(event)
            });
        } catch (error) {
            // Silently fail - don't interrupt gameplay
            logger.debug('Analytics', 'Failed to send event', { error });
        }
    }

    /**
     * Get analytics endpoint from config
     */
    getAnalyticsEndpoint() {
        // Configure this in production
        return process.env.ANALYTICS_ENDPOINT || null;
    }

    /**
     * Get all recorded events
     */
    getEvents() {
        return [...this.events];
    }

    /**
     * Get session summary
     */
    getSessionSummary() {
        const duration = Date.now() - this.sessionStart;

        const eventCounts = {};
        this.events.forEach(event => {
            const name = event.name || event.type;
            eventCounts[name] = (eventCounts[name] || 0) + 1;
        });

        return {
            sessionId: this.sessionId,
            duration,
            eventCount: this.events.length,
            eventCounts
        };
    }

    /**
     * Export analytics data
     */
    exportData() {
        return JSON.stringify({
            sessionId: this.sessionId,
            sessionStart: this.sessionStart,
            sessionDuration: Date.now() - this.sessionStart,
            events: this.events
        }, null, 2);
    }

    /**
     * Clear all analytics data
     */
    clear() {
        this.events = [];
        logger.info('Analytics', 'Analytics data cleared');
    }
}

// Export singleton instance
export const analytics = new Analytics();
export default Analytics;
