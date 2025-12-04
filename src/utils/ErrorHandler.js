/**
 * ErrorHandler - Global error handling and crash prevention
 * Catches unhandled errors and provides user-friendly error screens
 */

import { logger } from './Logger.js';
import { gameData } from './GameData.js';

class ErrorHandler {
    constructor() {
        this.errors = [];
        this.maxErrors = 50;
        this.errorScene = null;
        this.lastError = null;
        this.errorCount = 0;

        this.setupHandlers();
    }

    /**
     * Setup global error handlers
     */
    setupHandlers() {
        // Handle uncaught errors
        window.addEventListener('error', (event) => {
            this.handleError(event.error || event.message, {
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno
            });
        });

        // Handle unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.handleError(event.reason, {
                type: 'unhandled_rejection',
                promise: event.promise
            });
        });

        logger.info('ErrorHandler', 'Global error handlers initialized');
    }

    /**
     * Handle an error
     */
    handleError(error, context = {}) {
        this.errorCount++;

        // Create error object
        const errorObj = {
            message: error?.message || String(error),
            stack: error?.stack || '',
            context,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userAgent: navigator.userAgent
        };

        // Store error
        this.errors.push(errorObj);
        if (this.errors.length > this.maxErrors) {
            this.errors.shift();
        }

        this.lastError = errorObj;

        // Log error
        logger.error('ErrorHandler', 'Unhandled error:', {
            message: errorObj.message,
            context: errorObj.context
        });

        // Save error to localStorage for debugging
        try {
            const savedErrors = JSON.parse(localStorage.getItem('gitgame_errors') || '[]');
            savedErrors.push(errorObj);
            if (savedErrors.length > 20) savedErrors.shift();
            localStorage.setItem('gitgame_errors', JSON.stringify(savedErrors));
        } catch (e) {
            // Ignore localStorage errors
        }

        // Show error screen if critical
        if (this.shouldShowErrorScreen(error)) {
            this.showErrorScreen(errorObj);
        }

        return errorObj;
    }

    /**
     * Determine if error screen should be shown
     */
    shouldShowErrorScreen(error) {
        // Don't show for minor errors
        const minorErrors = [
            'ResizeObserver loop limit exceeded',
            'Non-Error promise rejection',
            'Script error'
        ];

        const message = error?.message || String(error);
        if (minorErrors.some(minor => message.includes(minor))) {
            return false;
        }

        // Show if too many errors in short time
        if (this.errorCount > 5) {
            return true;
        }

        // Show for critical errors
        const criticalErrors = [
            'Cannot read property',
            'is not a function',
            'is not defined',
            'null is not an object'
        ];

        return criticalErrors.some(critical => message.includes(critical));
    }

    /**
     * Show error screen to user
     */
    showErrorScreen(error) {
        // Prevent multiple error screens
        if (this.errorScene) return;

        // Create overlay
        const overlay = document.createElement('div');
        overlay.id = 'error-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 999999;
            font-family: monospace;
        `;

        overlay.innerHTML = `
            <div style="max-width: 600px; padding: 40px; text-align: center;">
                <div style="font-size: 48px; margin-bottom: 20px;">💥</div>
                <h1 style="color: #ff4444; margin-bottom: 20px;">Oops! Something broke</h1>
                <p style="color: #aaa; margin-bottom: 30px;">
                    Looks like we hit a bug. This happens in game development...
                    just like in real life! 😅
                </p>
                <div style="background: #1a1a1a; padding: 20px; border-radius: 8px; margin-bottom: 30px; text-align: left; font-size: 12px; max-height: 200px; overflow-y: auto;">
                    <div style="color: #ff4444; margin-bottom: 10px;">Error Details:</div>
                    <div style="color: #888; white-space: pre-wrap; word-break: break-word;">${this.sanitizeErrorMessage(error.message)}</div>
                </div>
                <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
                    <button id="error-reload" style="background: #00aa00; color: white; border: none; padding: 12px 24px; border-radius: 4px; cursor: pointer; font-family: monospace; font-size: 14px;">
                        🔄 Reload Game
                    </button>
                    <button id="error-continue" style="background: #0066aa; color: white; border: none; padding: 12px 24px; border-radius: 4px; cursor: pointer; font-family: monospace; font-size: 14px;">
                        ▶️ Try to Continue
                    </button>
                    <button id="error-report" style="background: #aa6600; color: white; border: none; padding: 12px 24px; border-radius: 4px; cursor: pointer; font-family: monospace; font-size: 14px;">
                        📋 Copy Error
                    </button>
                </div>
                <p style="color: #666; margin-top: 30px; font-size: 12px;">
                    Error ID: ${error.timestamp}
                </p>
            </div>
        `;

        document.body.appendChild(overlay);
        this.errorScene = overlay;

        // Button handlers
        document.getElementById('error-reload')?.addEventListener('click', () => {
            window.location.reload();
        });

        document.getElementById('error-continue')?.addEventListener('click', () => {
            overlay.remove();
            this.errorScene = null;
        });

        document.getElementById('error-report')?.addEventListener('click', () => {
            this.copyErrorReport(error);
        });
    }

    /**
     * Sanitize error message for display
     */
    sanitizeErrorMessage(message) {
        // Remove file paths and sensitive info
        return message
            .replace(/https?:\/\/[^\s]+/g, '[URL]')
            .replace(/file:\/\/[^\s]+/g, '[FILE]')
            .substring(0, 500); // Limit length
    }

    /**
     * Copy error report to clipboard
     */
    copyErrorReport(error) {
        const report = `
GitGame Error Report
====================
Time: ${error.timestamp}
Message: ${error.message}
URL: ${error.url}

Stack:
${error.stack}

Context:
${JSON.stringify(error.context, null, 2)}

User Agent: ${error.userAgent}
        `.trim();

        navigator.clipboard.writeText(report).then(() => {
            alert('Error report copied to clipboard!');
        }).catch(() => {
            // Fallback: show in alert
            prompt('Copy this error report:', report);
        });
    }

    /**
     * Wrap a function with error handling
     */
    wrap(fn, context = null) {
        return (...args) => {
            try {
                return fn.apply(context, args);
            } catch (error) {
                this.handleError(error, { function: fn.name });
                return null;
            }
        };
    }

    /**
     * Wrap an async function with error handling
     */
    wrapAsync(fn, context = null) {
        return async (...args) => {
            try {
                return await fn.apply(context, args);
            } catch (error) {
                this.handleError(error, { function: fn.name, async: true });
                return null;
            }
        };
    }

    /**
     * Get error history
     */
    getErrors() {
        return [...this.errors];
    }

    /**
     * Get error statistics
     */
    getStats() {
        return {
            totalErrors: this.errorCount,
            uniqueErrors: new Set(this.errors.map(e => e.message)).size,
            lastError: this.lastError,
            errorTypes: this.errors.reduce((acc, error) => {
                const type = error.context.type || 'error';
                acc[type] = (acc[type] || 0) + 1;
                return acc;
            }, {})
        };
    }

    /**
     * Clear error history
     */
    clear() {
        this.errors = [];
        this.errorCount = 0;
        this.lastError = null;

        try {
            localStorage.removeItem('gitgame_errors');
        } catch (e) {
            // Ignore
        }
    }

    /**
     * Export error logs
     */
    exportErrors() {
        return JSON.stringify({
            stats: this.getStats(),
            errors: this.errors,
            exportTime: new Date().toISOString()
        }, null, 2);
    }
}

// Singleton instance
export const errorHandler = new ErrorHandler();

// Expose globally for debugging
if (typeof window !== 'undefined') {
    window.errorHandler = errorHandler;
}
