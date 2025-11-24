/**
 * ServiceLocator - Dependency injection container
 * Manages singleton services and provides them to scenes/systems
 *
 * Usage:
 *   ServiceLocator.register('soundManager', new SoundManager());
 *   const sound = ServiceLocator.get('soundManager');
 */

class ServiceLocator {
    constructor() {
        this.services = new Map();
        this.factories = new Map();
    }

    /**
     * Register a service instance
     * @param {string} name - Service identifier
     * @param {*} instance - Service instance
     * @param {boolean} overwrite - Allow overwriting existing service
     */
    register(name, instance, overwrite = false) {
        if (!name) {
            throw new Error('ServiceLocator.register: Service name is required');
        }

        if (this.services.has(name) && !overwrite) {
            console.warn(`ServiceLocator: Service '${name}' already registered. Use overwrite=true to replace.`);
            return;
        }

        this.services.set(name, instance);
    }

    /**
     * Register a factory function for lazy instantiation
     * @param {string} name - Service identifier
     * @param {Function} factory - Factory function that returns service instance
     */
    registerFactory(name, factory) {
        if (!name || typeof factory !== 'function') {
            throw new Error('ServiceLocator.registerFactory: Invalid name or factory function');
        }

        this.factories.set(name, factory);
    }

    /**
     * Get a service instance
     * @param {string} name - Service identifier
     * @returns {*} Service instance or null
     */
    get(name) {
        // Return existing instance if available
        if (this.services.has(name)) {
            return this.services.get(name);
        }

        // Create from factory if available
        if (this.factories.has(name)) {
            const factory = this.factories.get(name);
            try {
                const instance = factory();
                this.services.set(name, instance);
                return instance;
            } catch (error) {
                console.error(`ServiceLocator: Failed to create service '${name}':`, error);
                return null;
            }
        }

        console.warn(`ServiceLocator: Service '${name}' not found`);
        return null;
    }

    /**
     * Check if a service is registered
     * @param {string} name - Service identifier
     * @returns {boolean} True if service exists
     */
    has(name) {
        return this.services.has(name) || this.factories.has(name);
    }

    /**
     * Unregister a service
     * @param {string} name - Service identifier
     */
    unregister(name) {
        this.services.delete(name);
        this.factories.delete(name);
    }

    /**
     * Clear all services
     */
    clear() {
        this.services.clear();
        this.factories.clear();
    }

    /**
     * Get all registered service names
     * @returns {Array<string>} Array of service names
     */
    getServiceNames() {
        const serviceNames = Array.from(this.services.keys());
        const factoryNames = Array.from(this.factories.keys());
        return [...new Set([...serviceNames, ...factoryNames])];
    }

    /**
     * Initialize all services that have an init method
     * Useful for setting up services at game start
     */
    initializeAll() {
        this.services.forEach((service, name) => {
            if (service && typeof service.init === 'function') {
                try {
                    service.init();
                } catch (error) {
                    console.error(`ServiceLocator: Failed to initialize service '${name}':`, error);
                }
            }
        });
    }

    /**
     * Cleanup all services that have a cleanup method
     * Useful for game shutdown or scene transitions
     */
    cleanupAll() {
        this.services.forEach((service, name) => {
            if (service && typeof service.cleanup === 'function') {
                try {
                    service.cleanup();
                } catch (error) {
                    console.error(`ServiceLocator: Failed to cleanup service '${name}':`, error);
                }
            }
        });
    }

    /**
     * Debug: Log all registered services
     */
    debug() {
        console.log('=== ServiceLocator Debug ===');
        console.log('Registered Services:', Array.from(this.services.keys()));
        console.log('Registered Factories:', Array.from(this.factories.keys()));
        console.log('Total Services:', this.services.size);
        console.log('Total Factories:', this.factories.size);
    }
}

// Export singleton instance
export default new ServiceLocator();
