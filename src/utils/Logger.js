/**
 * Logger - Centralized logging utility with debug levels
 * Replaces console.log with structured, filterable logging
 */

export const LogLevel = {
    NONE: 0,
    ERROR: 1,
    WARN: 2,
    INFO: 3,
    DEBUG: 4,
    TRACE: 5
};

class Logger {
    constructor() {
        // Set default log level from environment or default to INFO
        this.level = this.getEnvLogLevel();
        this.enabledCategories = new Set();
        this.disabledCategories = new Set();
        this.timestamps = true;
        this.logHistory = [];
        this.maxHistory = 100;
    }

    /**
     * Get log level from URL parameters or localStorage
     */
    getEnvLogLevel() {
        // Check if running in browser environment
        if (typeof window !== 'undefined' && window.location) {
            // Check URL parameter first (?debug=true or ?loglevel=DEBUG)
            try {
                const urlParams = new URLSearchParams(window.location.search);

                if (urlParams.get('debug') === 'true') {
                    return LogLevel.DEBUG;
                }

                const urlLevel = urlParams.get('loglevel');
                if (urlLevel && LogLevel[urlLevel.toUpperCase()] !== undefined) {
                    return LogLevel[urlLevel.toUpperCase()];
                }
            } catch (e) {
                // URL parsing might fail in some environments
            }
        }

        // Check localStorage (also might not be available in Node.js)
        try {
            if (typeof localStorage !== 'undefined') {
                const stored = localStorage.getItem('gitgame_loglevel');
                if (stored && LogLevel[stored] !== undefined) {
                    return LogLevel[stored];
                }
            }
        } catch (e) {
            // localStorage might not be available
        }

        // Default to WARN in production, DEBUG in development
        // In Node.js test environment, default to WARN
        if (typeof window !== 'undefined' && window.location && window.location.hostname === 'localhost') {
            return LogLevel.DEBUG;
        }
        return LogLevel.WARN;
    }

    /**
     * Set the logging level
     */
    setLevel(level) {
        this.level = level;
        try {
            const levelName = Object.keys(LogLevel).find(key => LogLevel[key] === level);
            localStorage.setItem('gitgame_loglevel', levelName);
        } catch (e) {
            // Ignore localStorage errors
        }
    }

    /**
     * Enable logging for specific category
     */
    enableCategory(category) {
        this.enabledCategories.add(category);
        this.disabledCategories.delete(category);
    }

    /**
     * Disable logging for specific category
     */
    disableCategory(category) {
        this.disabledCategories.add(category);
        this.enabledCategories.delete(category);
    }

    /**
     * Check if logging is allowed for this level and category
     */
    shouldLog(level, category) {
        if (level > this.level) return false;
        
        // If category is disabled, don't log
        if (category && this.disabledCategories.has(category)) return false;
        
        // If we have enabled categories and this isn't one, don't log
        if (this.enabledCategories.size > 0 && category && !this.enabledCategories.has(category)) {
            return false;
        }
        
        return true;
    }

    /**
     * Format log message
     */
    format(level, category, message, data) {
        const levelName = Object.keys(LogLevel).find(key => LogLevel[key] === level);
        const timestamp = this.timestamps ? new Date().toISOString().substr(11, 12) : '';
        const categoryStr = category ? `[${category}]` : '';
        
        return {
            timestamp,
            level: levelName,
            category,
            message,
            data
        };
    }

    /**
     * Core logging method
     */
    log(level, category, message, ...data) {
        if (!this.shouldLog(level, category)) return;

        const formatted = this.format(level, category, message, data);
        
        // Store in history
        this.logHistory.push(formatted);
        if (this.logHistory.length > this.maxHistory) {
            this.logHistory.shift();
        }

        // Build console output
        const parts = [];
        if (formatted.timestamp) parts.push(`[${formatted.timestamp}]`);
        parts.push(`[${formatted.level}]`);
        if (formatted.category) parts.push(`[${formatted.category}]`);
        parts.push(formatted.message);

        // Choose console method based on level
        const consoleMethod = {
            [LogLevel.ERROR]: 'error',
            [LogLevel.WARN]: 'warn',
            [LogLevel.INFO]: 'info',
            [LogLevel.DEBUG]: 'log',
            [LogLevel.TRACE]: 'log'
        }[level] || 'log';

        console[consoleMethod](parts.join(' '), ...data);
    }

    /**
     * Public logging methods
     */
    error(category, message, ...data) {
        this.log(LogLevel.ERROR, category, message, ...data);
    }

    warn(category, message, ...data) {
        this.log(LogLevel.WARN, category, message, ...data);
    }

    info(category, message, ...data) {
        this.log(LogLevel.INFO, category, message, ...data);
    }

    debug(category, message, ...data) {
        this.log(LogLevel.DEBUG, category, message, ...data);
    }

    trace(category, message, ...data) {
        this.log(LogLevel.TRACE, category, message, ...data);
    }

    /**
     * Get log history
     */
    getHistory() {
        return [...this.logHistory];
    }

    /**
     * Clear log history
     */
    clearHistory() {
        this.logHistory = [];
    }

    /**
     * Export logs as JSON
     */
    exportLogs() {
        return JSON.stringify(this.logHistory, null, 2);
    }

    /**
     * Performance timing helper
     */
    time(label) {
        console.time(label);
    }

    timeEnd(label) {
        console.timeEnd(label);
    }

    /**
     * Group logs
     */
    group(label) {
        if (this.level >= LogLevel.DEBUG) {
            console.group(label);
        }
    }

    groupEnd() {
        if (this.level >= LogLevel.DEBUG) {
            console.groupEnd();
        }
    }
}

// Singleton instance
export const logger = new Logger();

// Expose globally for debugging
if (typeof window !== 'undefined') {
    window.logger = logger;
    window.LogLevel = LogLevel;
}
