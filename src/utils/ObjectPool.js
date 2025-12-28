// ObjectPool - Reusable object pool for performance optimization
// Reduces garbage collection by reusing objects instead of creating/destroying

import { logger } from './Logger.js';

export default class ObjectPool {
    /**
     * Create an object pool
     * @param {Function} createFn - Function to create new objects
     * @param {Function} resetFn - Function to reset objects before reuse
     * @param {number} initialSize - Initial pool size
     */
    constructor(createFn, resetFn, initialSize = 10) {
        this.createFn = createFn;
        this.resetFn = resetFn;
        this.pool = [];
        this.active = [];
        this.stats = {
            created: 0,
            acquired: 0,
            released: 0,
            poolHits: 0,
            poolMisses: 0
        };

        // Pre-create initial pool
        for (let i = 0; i < initialSize; i++) {
            const obj = this.createFn();
            obj.pooled = true;
            obj.poolActive = false;
            this.pool.push(obj);
            this.stats.created++;
        }
    }

    /**
     * Get an object from the pool
     * @returns {Object} Pooled object
     */
    acquire() {
        let obj;

        if (this.pool.length > 0) {
            // Reuse from pool
            obj = this.pool.pop();
            this.stats.poolHits++;
        } else {
            // Create new object
            obj = this.createFn();
            obj.pooled = true;
            this.stats.created++;
            this.stats.poolMisses++;
        }

        obj.poolActive = true;
        this.active.push(obj);
        this.stats.acquired++;

        return obj;
    }

    /**
     * Return an object to the pool
     * @param {Object} obj - Object to return
     */
    release(obj) {
        if (!obj || !obj.pooled) {
            logger.warn('ObjectPool', 'Attempted to release non-pooled object');
            return;
        }

        // Remove from active list
        const index = this.active.indexOf(obj);
        if (index > -1) {
            this.active.splice(index, 1);
        }

        // Reset object state
        if (this.resetFn) {
            this.resetFn(obj);
        }

        // Return to pool
        obj.poolActive = false;
        this.pool.push(obj);
        this.stats.released++;
    }

    /**
     * Release all active objects
     */
    releaseAll() {
        // Copy active array since release() modifies it
        const toRelease = [...this.active];
        toRelease.forEach(obj => this.release(obj));
    }

    /**
     * Get active objects count
     */
    getActiveCount() {
        return this.active.length;
    }

    /**
     * Get available pool size
     */
    getPoolSize() {
        return this.pool.length;
    }

    /**
     * Get pool statistics
     */
    getStats() {
        return {
            ...this.stats,
            activeCount: this.active.length,
            poolSize: this.pool.length,
            efficiency: this.stats.acquired > 0 ?
                (this.stats.poolHits / this.stats.acquired * 100).toFixed(1) + '%' : 'N/A'
        };
    }

    /**
     * Reset statistics
     */
    resetStats() {
        this.stats = {
            created: this.stats.created, // Keep total created
            acquired: 0,
            released: 0,
            poolHits: 0,
            poolMisses: 0
        };
    }

    /**
     * Clear the entire pool (for cleanup)
     */
    clear() {
        this.pool = [];
        this.active = [];
        this.stats.created = 0;
    }

    /**
     * Destroy all objects in pool and active
     * @param {Function} destroyFn - Optional custom destroy function
     */
    destroy(destroyFn) {
        // Destroy active objects
        this.active.forEach(obj => {
            if (destroyFn) {
                destroyFn(obj);
            } else if (obj.destroy && typeof obj.destroy === 'function') {
                obj.destroy();
            }
        });

        // Destroy pooled objects
        this.pool.forEach(obj => {
            if (destroyFn) {
                destroyFn(obj);
            } else if (obj.destroy && typeof obj.destroy === 'function') {
                obj.destroy();
            }
        });

        this.pool = [];
        this.active = [];
    }
}

/**
 * PoolManager - Manage multiple object pools
 */
export class PoolManager {
    constructor() {
        this.pools = new Map();
    }

    /**
     * Create a new pool
     * @param {string} name - Pool name
     * @param {Function} createFn - Function to create objects
     * @param {Function} resetFn - Function to reset objects
     * @param {number} initialSize - Initial pool size
     */
    createPool(name, createFn, resetFn, initialSize = 10) {
        const pool = new ObjectPool(createFn, resetFn, initialSize);
        this.pools.set(name, pool);
        return pool;
    }

    /**
     * Get a pool by name
     * @param {string} name - Pool name
     */
    getPool(name) {
        return this.pools.get(name);
    }

    /**
     * Acquire object from named pool
     * @param {string} poolName - Pool name
     */
    acquire(poolName) {
        const pool = this.pools.get(poolName);
        if (!pool) {
            throw new Error(`Pool '${poolName}' does not exist`);
        }
        return pool.acquire();
    }

    /**
     * Release object to its pool
     * @param {string} poolName - Pool name
     * @param {Object} obj - Object to release
     */
    release(poolName, obj) {
        const pool = this.pools.get(poolName);
        if (!pool) {
            throw new Error(`Pool '${poolName}' does not exist`);
        }
        pool.release(obj);
    }

    /**
     * Release all objects from all pools
     */
    releaseAll() {
        this.pools.forEach(pool => pool.releaseAll());
    }

    /**
     * Get statistics for all pools
     */
    getAllStats() {
        const stats = {};
        this.pools.forEach((pool, name) => {
            stats[name] = pool.getStats();
        });
        return stats;
    }

    /**
     * Destroy all pools
     */
    destroy() {
        this.pools.forEach(pool => pool.destroy());
        this.pools.clear();
    }
}

/**
 * Phaser-specific object pool for sprites
 */
export class PhaserSpritePool extends ObjectPool {
    constructor(scene, texture, initialSize = 10) {
        const createFn = () => {
            const sprite = scene.add.sprite(0, 0, texture);
            sprite.setActive(false);
            sprite.setVisible(false);
            if (scene.physics) {
                scene.physics.add.existing(sprite);
                sprite.body.enable = false;
            }
            return sprite;
        };

        const resetFn = (sprite) => {
            sprite.setActive(false);
            sprite.setVisible(false);
            sprite.setPosition(0, 0);
            sprite.setRotation(0);
            sprite.setScale(1);
            sprite.setAlpha(1);
            sprite.setTint(0xffffff);
            if (sprite.body) {
                sprite.body.enable = false;
                sprite.body.setVelocity(0, 0);
            }
        };

        super(createFn, resetFn, initialSize);
        this.scene = scene;
        this.texture = texture;
    }

    /**
     * Spawn a sprite at position
     * @param {number} x - X position
     * @param {number} y - Y position
     */
    spawn(x, y) {
        const sprite = this.acquire();
        sprite.setPosition(x, y);
        sprite.setActive(true);
        sprite.setVisible(true);
        if (sprite.body) {
            sprite.body.enable = true;
        }
        return sprite;
    }

    /**
     * Despawn a sprite
     * @param {Phaser.GameObjects.Sprite} sprite
     */
    despawn(sprite) {
        this.release(sprite);
    }
}

/**
 * Phaser-specific object pool for particle effects
 */
export class PhaserParticlePool extends ObjectPool {
    constructor(scene, config, initialSize = 5) {
        const createFn = () => {
            return scene.add.particles(0, 0, config.texture, config);
        };

        const resetFn = (emitter) => {
            emitter.stop();
            emitter.setPosition(0, 0);
        };

        super(createFn, resetFn, initialSize);
        this.scene = scene;
        this.config = config;
    }

    /**
     * Emit particles at position
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} count - Particle count
     */
    emit(x, y, count = 10) {
        const emitter = this.acquire();
        emitter.setPosition(x, y);
        emitter.explode(count);

        // Auto-release after particles finish
        this.scene.time.delayedCall(emitter.lifespan + 100, () => {
            this.release(emitter);
        });

        return emitter;
    }
}
