# Changelog

All notable changes to GitGame will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Development Tools:**
  - Logger utility for structured, filterable logging with category filtering
  - PerformanceMonitor for FPS and memory tracking with F3 overlay toggle
  - DeviceDetection utility for mobile vs desktop optimization
  - ErrorHandler for global error handling and crash prevention
  - InputManager for centralized keyboard/mouse/touch/gamepad input
  - SaveStateManager for robust game state persistence with autosave
  - SceneTransitionManager with 10 different transition effects
  - AssetLoader for future-proof asset loading and management
- **Configuration:**
  - .gitignore file for proper version control
  - .eslintrc.json for code quality enforcement
  - CHANGELOG.md for professional change tracking
  - Comprehensive testing infrastructure with unit tests
  - GameConfig.js for centralized configuration constants
- **Architecture:**
  - BaseScene class for shared scene functionality
  - Export/import functionality for game data backups
- **Documentation:**
  - Enhanced README with setup guide, development tools, and contribution guidelines
  - Keyboard shortcuts reference
  - Project structure documentation

### Changed
- Improved GameData with robust error handling and path validation
- Enhanced SoundManager to prevent memory leaks via AudioContext reuse
- GitSurvivorScene now extends BaseScene
- Test scripts now use Node.js built-in test runner

### Fixed
- Critical memory leak in SoundManager (AudioContext created repeatedly)
- Missing PowerUpTypes import in GitSurvivorScene
- Level-up logic bug causing multiple triggers in same frame
- Unsafe array modification during iteration in updateEnemies() and updateProjectiles()
- Tutorial overlay not blocking user interactions
- Corrupted localStorage handling
- Path validation in stat updates

### Security
- Added size limits to localStorage saves (5MB)
- Improved error handling to prevent data corruption
- Added data integrity validation

## [1.0.0] - Initial Release

### Added
- Four complete game modes:
  - Git Survivor (Roguelike)
  - Code Defense (Tower Defense)
  - PR Rush (Time Management)
  - Dev Commander (RTS)
- Additional game modes:
  - Debug Dungeon (Dungeon Crawler)
  - Refactor Race (Time Trial)
  - Sprint Survivor (Endless Runner)
  - Bug Bounty (Puzzle)
  - Legacy Excavator (Mining)
  - Boss Rush (Challenge Mode)
- Power-up system with 20+ power-ups
- Combo system with score multipliers
- Achievement system
- Tutorial system
- Persistent game data with localStorage
- Sound system with procedurally generated audio
- Particle effects system
- Difficulty settings (Normal, Hard, Nightmare)
- Mobile touch controls
- Humor messages and developer in-jokes

[Unreleased]: https://github.com/justinnewbold/GitGame/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/justinnewbold/GitGame/releases/tag/v1.0.0
