/**
 * EventBus - Global event system for decoupled communication
 * Implements the Observer pattern for pub/sub messaging
 *
 * Usage:
 *   EventBus.on('event:name', callback);
 *   EventBus.emit('event:name', data);
 *   EventBus.off('event:name', callback);
 */

class EventBus {
    constructor() {
        this.events = new Map();
        this.onceEvents = new Map();
    }

    /**
     * Subscribe to an event
     * @param {string} eventName - Event identifier
     * @param {Function} callback - Handler function
     * @param {Object} context - 'this' context for callback
     */
    on(eventName, callback, context = null) {
        if (!eventName || typeof callback !== 'function') {
            console.error('EventBus.on: Invalid event name or callback');
            return;
        }

        if (!this.events.has(eventName)) {
            this.events.set(eventName, []);
        }

        this.events.get(eventName).push({ callback, context });
    }

    /**
     * Subscribe to an event once (auto-unsubscribe after first trigger)
     * @param {string} eventName - Event identifier
     * @param {Function} callback - Handler function
     * @param {Object} context - 'this' context for callback
     */
    once(eventName, callback, context = null) {
        if (!eventName || typeof callback !== 'function') {
            console.error('EventBus.once: Invalid event name or callback');
            return;
        }

        if (!this.onceEvents.has(eventName)) {
            this.onceEvents.set(eventName, []);
        }

        this.onceEvents.get(eventName).push({ callback, context });
    }

    /**
     * Unsubscribe from an event
     * @param {string} eventName - Event identifier
     * @param {Function} callback - Handler function to remove (optional)
     */
    off(eventName, callback = null) {
        if (!eventName) {
            console.error('EventBus.off: Invalid event name');
            return;
        }

        // Remove from regular events
        if (this.events.has(eventName)) {
            if (callback) {
                const listeners = this.events.get(eventName);
                const filtered = listeners.filter(listener => listener.callback !== callback);
                this.events.set(eventName, filtered);
            } else {
                this.events.delete(eventName);
            }
        }

        // Remove from once events
        if (this.onceEvents.has(eventName)) {
            if (callback) {
                const listeners = this.onceEvents.get(eventName);
                const filtered = listeners.filter(listener => listener.callback !== callback);
                this.onceEvents.set(eventName, filtered);
            } else {
                this.onceEvents.delete(eventName);
            }
        }
    }

    /**
     * Emit an event to all subscribers
     * @param {string} eventName - Event identifier
     * @param {*} data - Data to pass to callbacks
     */
    emit(eventName, data = null) {
        if (!eventName) {
            console.error('EventBus.emit: Invalid event name');
            return;
        }

        // Trigger regular listeners
        if (this.events.has(eventName)) {
            const listeners = this.events.get(eventName);
            listeners.forEach(({ callback, context }) => {
                try {
                    callback.call(context, data);
                } catch (error) {
                    console.error(`EventBus: Error in event handler for '${eventName}':`, error);
                }
            });
        }

        // Trigger once listeners and remove them
        if (this.onceEvents.has(eventName)) {
            const listeners = this.onceEvents.get(eventName);
            listeners.forEach(({ callback, context }) => {
                try {
                    callback.call(context, data);
                } catch (error) {
                    console.error(`EventBus: Error in once handler for '${eventName}':`, error);
                }
            });
            this.onceEvents.delete(eventName);
        }
    }

    /**
     * Remove all event listeners
     */
    clear() {
        this.events.clear();
        this.onceEvents.clear();
    }

    /**
     * Get count of listeners for an event
     * @param {string} eventName - Event identifier
     * @returns {number} Number of listeners
     */
    listenerCount(eventName) {
        const regularCount = this.events.has(eventName) ? this.events.get(eventName).length : 0;
        const onceCount = this.onceEvents.has(eventName) ? this.onceEvents.get(eventName).length : 0;
        return regularCount + onceCount;
    }

    /**
     * Get all registered event names
     * @returns {Array<string>} Array of event names
     */
    getEventNames() {
        const regular = Array.from(this.events.keys());
        const once = Array.from(this.onceEvents.keys());
        return [...new Set([...regular, ...once])];
    }

    /**
     * Debug: Log all registered events and their listener counts
     */
    debug() {
        console.log('=== EventBus Debug ===');
        console.log('Regular Events:', this.events);
        console.log('Once Events:', this.onceEvents);
        console.log('Event Names:', this.getEventNames());
        console.log('Total Events:', this.events.size + this.onceEvents.size);
    }
}

// Export singleton instance
export default new EventBus();
