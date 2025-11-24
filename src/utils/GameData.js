/**
 * GameData.js - Compatibility wrapper for new GameDataManager
 * This file maintains backward compatibility with existing code
 * while using the new modular architecture under the hood
 *
 * DEPRECATED: New code should use GameDataManager from systems/persistence
 */

import { gameData as gameDataManager } from '../systems/persistence/GameDataManager.js';

// Re-export the new GameDataManager as gameData for backward compatibility
export const gameData = gameDataManager;

// Also export as default for old import patterns
export default class GameData {
    constructor() {
        console.warn('GameData class is deprecated. Use gameData singleton or GameDataManager instead.');
        return gameDataManager;
    }
}

// Note: All existing code using `import { gameData } from './utils/GameData.js'`
// will now use the new architecture seamlessly!
