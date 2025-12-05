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
  - Analytics system for anonymous game telemetry and metrics tracking
  - i18n (internationalization) system with support for English, Spanish, French, and German
- **Configuration:**
  - .gitignore file for proper version control
  - .eslintrc.json for code quality enforcement
  - CHANGELOG.md for professional change tracking
  - Comprehensive testing infrastructure with unit tests (Node.js 18+)
  - GameConfig.js for centralized configuration constants
  - Dependabot configuration for automated dependency updates
  - Lighthouse CI configuration for performance monitoring
  - Playwright configuration for E2E testing across browsers
- **Architecture:**
  - BaseScene class for shared scene functionality with integrated utilities
  - BaseScene now supports opt-in utilities (InputManager, PerformanceMonitor, SceneTransitionManager)
  - initUtilities() and updateUtilities() helper methods for easy integration
  - Enhanced cleanup system for proper resource management
  - Export/import functionality for game data backups
  - ExampleScene demonstrating all utilities and best practices
- **Testing:**
  - Code coverage reporting with c8 (HTML, text, and lcov reports)
  - E2E testing with Playwright (Chromium, Firefox, WebKit, Mobile)
  - Comprehensive test suite for SoundManager
  - 40+ unit tests with watch mode support
  - Test results uploaded as CI artifacts
- **CI/CD:**
  - Enhanced GitHub Actions workflow with multiple jobs:
    - Unit tests (Node 18.x and 20.x matrix)
    - Code coverage with threshold checking
    - E2E tests across major browsers
    - Lighthouse performance audits
    - Bundle size budgets (max 10MB)
    - ESLint checks
  - Pre-commit hooks for code quality enforcement
  - Setup scripts for easy Git hook installation (Linux/Mac/Windows)
  - Automated dependency updates via Dependabot
- **PWA Support:**
  - Web App Manifest for installability
  - Service Worker for offline functionality
  - App icon configurations (72px-512px)
  - Install prompts and update notifications
  - Caching strategies for assets
- **Performance:**
  - Bundle analyzer with Rollup Visualizer
  - Build analysis mode (`npm run build:analyze`)
  - Phaser code splitting for better load times
  - Performance budgets enforced in CI
  - Lighthouse CI integration
- **Accessibility:**
  - ARIA labels and roles
  - Screen reader support
  - Keyboard navigation
  - Skip to content links
  - Semantic HTML structure
  - Loading indicators
- **SEO & Meta:**
  - Comprehensive Open Graph tags
  - Twitter Card meta tags
  - Proper meta descriptions and keywords
  - Apple mobile web app tags
  - Theme color configuration
- **Feature Flags System:**
  - Feature flags for A/B testing and gradual rollouts
  - URL parameter support for testing
  - LocalStorage persistence
  - Experiment percentage targeting
  - Bulk flag updates
- **Docker Support:**
  - Multi-stage Dockerfile for production
  - Development Dockerfile with hot reload
  - Docker Compose configuration
  - Health checks and automatic restarts
- **Save Migration System:**
  - Version-based save file migrations
  - Automatic backup before migration
  - Restore from backup on failure
  - Validation and error handling
- **Release Automation:**
  - GitHub Actions release workflow
  - Automatic changelog generation
  - Docker image publishing to GHCR
  - GitHub Pages deployment
  - Build artifacts attached to releases
- **SEO & Discovery:**
  - robots.txt for search engine crawlers
  - sitemap.xml with all pages
  - humans.txt with credits and easter eggs
  - Structured metadata
- **Security:**
  - security.txt for vulnerability reporting
  - Security policy documentation
  - Safe harbor for researchers
- **PWA Icons:**
  - SVG icon for all sizes
  - HTML-based icon generator
  - Script for batch generation
- **Documentation:**
  - Enhanced README with setup guide, development tools, and contribution guidelines
  - Comprehensive CONTRIBUTING.md with coding standards and workflows
  - Git hooks documentation
  - Keyboard shortcuts reference
  - Project structure documentation
  - PWA installation guide
  - Testing guide with coverage instructions
  - E2E testing documentation
  - Docker deployment guide
  - Feature flags documentation

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
