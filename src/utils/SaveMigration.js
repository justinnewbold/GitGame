/**
 * Save File Migration System
 *
 * Handles version migrations for save data to ensure backward compatibility
 *
 * Usage:
 *   import { saveMigration } from './utils/SaveMigration.js';
 *
 *   const migratedData = saveMigration.migrate(loadedData);
 */

import { logger } from './Logger.js';

class SaveMigration {
    constructor() {
        this.currentVersion = 3; // Current save format version
        this.migrations = this.defineMigrations();

        logger.info('SaveMigration', 'Migration system initialized', {
            currentVersion: this.currentVersion,
            availableMigrations: Object.keys(this.migrations).length
        });
    }

    /**
     * Define all migration functions
     * Each migration transforms data from one version to the next
     */
    defineMigrations() {
        return {
            // Version 1 -> 2: Added achievements array
            1: (data) => {
                logger.info('SaveMigration', 'Migrating v1 -> v2');

                return {
                    ...data,
                    version: 2,
                    achievements: data.achievements || [],
                    migratedAt: Date.now()
                };
            },

            // Version 2 -> 3: Restructured stats object
            2: (data) => {
                logger.info('SaveMigration', 'Migrating v2 -> v3');

                const oldStats = data.stats || {};

                return {
                    ...data,
                    version: 3,
                    stats: {
                        gamesPlayed: oldStats.gamesPlayed || 0,
                        totalScore: oldStats.totalScore || 0,
                        gitSurvivor: {
                            highScore: oldStats.gitSurvivorHighScore || 0,
                            gamesPlayed: oldStats.gitSurvivorGames || 0,
                            enemiesKilled: oldStats.gitSurvivorKills || 0
                        },
                        codeDefense: {
                            highScore: oldStats.codeDefenseHighScore || 0,
                            gamesPlayed: oldStats.codeDefenseGames || 0,
                            wavesCompleted: oldStats.codeDefenseWaves || 0
                        },
                        prRush: {
                            highScore: oldStats.prRushHighScore || 0,
                            gamesPlayed: oldStats.prRushGames || 0,
                            prsReviewed: oldStats.prRushReviewed || 0
                        },
                        devCommander: {
                            highScore: oldStats.devCommanderHighScore || 0,
                            gamesPlayed: oldStats.devCommanderGames || 0,
                            sprintsCompleted: oldStats.devCommanderSprints || 0
                        }
                    },
                    migratedAt: Date.now()
                };
            }

            // Add future migrations here:
            // 3: (data) => { ... }
            // 4: (data) => { ... }
        };
    }

    /**
     * Migrate data from any version to current version
     */
    migrate(data) {
        // Check if data needs migration
        if (!data) {
            logger.warn('SaveMigration', 'No data to migrate');
            return this.getDefaultData();
        }

        const dataVersion = data.version || 1;

        // Already at current version
        if (dataVersion === this.currentVersion) {
            logger.debug('SaveMigration', 'Data already at current version', {
                version: dataVersion
            });
            return data;
        }

        // Data is from future version (downgrade not supported)
        if (dataVersion > this.currentVersion) {
            logger.error('SaveMigration', 'Data from future version', {
                dataVersion,
                currentVersion: this.currentVersion
            });
            throw new Error(`Save data is from a newer version (v${dataVersion}). Please update the game.`);
        }

        // Migrate step by step
        let migratedData = { ...data };
        let fromVersion = dataVersion;

        logger.info('SaveMigration', 'Starting migration', {
            from: fromVersion,
            to: this.currentVersion
        });

        while (fromVersion < this.currentVersion) {
            const migration = this.migrations[fromVersion];

            if (!migration) {
                logger.error('SaveMigration', 'Missing migration', {
                    fromVersion,
                    toVersion: fromVersion + 1
                });
                throw new Error(`No migration defined for v${fromVersion} -> v${fromVersion + 1}`);
            }

            try {
                migratedData = migration(migratedData);
                fromVersion++;

                logger.info('SaveMigration', 'Migration step completed', {
                    version: fromVersion
                });
            } catch (error) {
                logger.error('SaveMigration', 'Migration failed', {
                    error,
                    fromVersion,
                    toVersion: fromVersion + 1
                });
                throw new Error(`Migration failed at v${fromVersion}: ${error.message}`);
            }
        }

        logger.info('SaveMigration', 'Migration completed successfully', {
            from: dataVersion,
            to: this.currentVersion,
            steps: this.currentVersion - dataVersion
        });

        return migratedData;
    }

    /**
     * Validate migrated data structure
     */
    validate(data) {
        const required = [
            'version',
            'stats',
            'achievements',
            'settings'
        ];

        for (const field of required) {
            if (!(field in data)) {
                logger.error('SaveMigration', 'Invalid data structure', {
                    missing: field
                });
                return false;
            }
        }

        // Validate version
        if (data.version !== this.currentVersion) {
            logger.error('SaveMigration', 'Invalid version after migration', {
                expected: this.currentVersion,
                actual: data.version
            });
            return false;
        }

        return true;
    }

    /**
     * Get default data structure (current version)
     */
    getDefaultData() {
        return {
            version: this.currentVersion,
            stats: {
                gamesPlayed: 0,
                totalScore: 0,
                gitSurvivor: {
                    highScore: 0,
                    gamesPlayed: 0,
                    enemiesKilled: 0,
                    longestSurvival: 0
                },
                codeDefense: {
                    highScore: 0,
                    gamesPlayed: 0,
                    wavesCompleted: 0,
                    towersPlaced: 0
                },
                prRush: {
                    highScore: 0,
                    gamesPlayed: 0,
                    prsReviewed: 0,
                    accuracy: 0
                },
                devCommander: {
                    highScore: 0,
                    gamesPlayed: 0,
                    sprintsCompleted: 0,
                    devsHired: 0
                }
            },
            achievements: [],
            settings: {
                difficulty: 'normal',
                soundEnabled: true,
                musicEnabled: true,
                masterVolume: 1.0,
                sfxVolume: 1.0,
                musicVolume: 0.7,
                language: 'en',
                graphicsQuality: 'high',
                analyticsConsent: true,
                showFPS: false
            },
            createdAt: Date.now(),
            updatedAt: Date.now()
        };
    }

    /**
     * Check if data needs migration
     */
    needsMigration(data) {
        if (!data || !data.version) return true;
        return data.version < this.currentVersion;
    }

    /**
     * Get migration path (list of versions to migrate through)
     */
    getMigrationPath(data) {
        const fromVersion = data?.version || 1;
        const path = [];

        for (let v = fromVersion; v < this.currentVersion; v++) {
            path.push({ from: v, to: v + 1 });
        }

        return path;
    }

    /**
     * Create backup before migration
     */
    createBackup(data) {
        try {
            const backup = {
                data,
                timestamp: Date.now(),
                version: data.version
            };

            localStorage.setItem('save_backup', JSON.stringify(backup));
            logger.info('SaveMigration', 'Backup created');
            return true;
        } catch (error) {
            logger.error('SaveMigration', 'Failed to create backup', { error });
            return false;
        }
    }

    /**
     * Restore from backup
     */
    restoreBackup() {
        try {
            const backup = localStorage.getItem('save_backup');
            if (!backup) {
                logger.warn('SaveMigration', 'No backup found');
                return null;
            }

            const parsed = JSON.parse(backup);
            logger.info('SaveMigration', 'Backup restored', {
                version: parsed.version,
                timestamp: parsed.timestamp
            });

            return parsed.data;
        } catch (error) {
            logger.error('SaveMigration', 'Failed to restore backup', { error });
            return null;
        }
    }

    /**
     * Safe migration with automatic backup
     */
    safeMigrate(data) {
        // Create backup first
        if (this.needsMigration(data)) {
            this.createBackup(data);
        }

        try {
            const migrated = this.migrate(data);

            // Validate
            if (!this.validate(migrated)) {
                throw new Error('Migration produced invalid data');
            }

            return migrated;
        } catch (error) {
            logger.error('SaveMigration', 'Safe migration failed, restoring backup', { error });

            // Restore backup
            const backup = this.restoreBackup();
            if (backup) {
                return backup;
            }

            // Last resort: return default data
            logger.warn('SaveMigration', 'Returning default data');
            return this.getDefaultData();
        }
    }
}

// Export singleton instance
export const saveMigration = new SaveMigration();
export default SaveMigration;
