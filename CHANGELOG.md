# Changelog

All notable changes to GitGame will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Logger utility for structured, filterable logging
- PerformanceMonitor for FPS and memory tracking
- DeviceDetection utility for mobile vs desktop optimization
- .gitignore file for proper version control
- Comprehensive testing infrastructure with unit tests
- GameConfig.js for centralized configuration constants
- BaseScene class for shared scene functionality
- Export/import functionality for game data backups

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
