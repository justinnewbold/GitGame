# Contributing to GitGame

Thank you for your interest in contributing to GitGame! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Project Structure](#project-structure)
- [Utility Systems](#utility-systems)

## Code of Conduct

Be respectful, constructive, and professional in all interactions. We're here to build a fun game and learn together!

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm (comes with Node.js)
- Git
- A code editor (VS Code recommended)

### Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/GitGame.git
   cd GitGame
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser to `http://localhost:5173`

## Development Workflow

### Branch Strategy

- `main` - Production-ready code
- `develop` - Development branch (if available)
- Feature branches - `feature/your-feature-name`
- Bug fixes - `fix/bug-description`

### Creating a Feature Branch

```bash
git checkout -b feature/my-new-feature
```

### Running the Project

- **Development**: `npm run dev` - Hot-reloading dev server
- **Build**: `npm run build` - Production build
- **Preview**: `npm run preview` - Preview production build
- **Tests**: `npm test` - Run all tests
- **Test Watch**: `npm run test:watch` - Run tests in watch mode
- **Lint**: `npm run lint` - Check code quality
- **Lint Fix**: `npm run lint:fix` - Auto-fix linting issues

### Debug Mode

Enable debug logging by adding `?debug=true` to the URL:
```
http://localhost:5173/?debug=true
```

Enable specific categories:
```
http://localhost:5173/?debug=AssetLoader,InputManager
```

### Performance Monitoring

Press **F3** in-game to toggle the performance overlay showing:
- FPS (frames per second)
- Memory usage
- Performance warnings

## Coding Standards

### ESLint Configuration

We use ESLint to maintain code quality. The configuration is in `.eslintrc.json`.

**Key Rules:**
- 4-space indentation
- Single quotes (with `avoidEscape`)
- Semicolons required
- Unix line endings
- No unused variables (warnings)
- Consistent brace style (1tbs)
- No trailing spaces

### Code Style

**Good:**
```javascript
function processPlayer(player) {
    if (player.health <= 0) {
        return gameOver();
    }

    const newPosition = calculatePosition(player);
    player.x = newPosition.x;
    player.y = newPosition.y;
}
```

**Bad:**
```javascript
function processPlayer(player){
  if(player.health<=0) return gameOver()

  const newPosition=calculatePosition(player)
  player.x=newPosition.x;player.y=newPosition.y
}
```

### Naming Conventions

- **Classes**: `PascalCase` (e.g., `InputManager`, `BaseScene`)
- **Functions**: `camelCase` (e.g., `createButton`, `handleError`)
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `MAX_HEALTH`, `ENEMY_SPAWN_DELAY`)
- **Private properties**: Prefix with underscore (e.g., `this._internalState`)
- **Files**: Match class name (e.g., `InputManager.js`, `GameData.js`)

### Configuration

Use `GameConfig.js` for all configuration constants. **Never use magic numbers** in your code.

**Good:**
```javascript
import { GameConfig } from '../config/GameConfig.js';

this.spawnDelay = GameConfig.GIT_SURVIVOR.ENEMY_SPAWN_DELAY;
```

**Bad:**
```javascript
this.spawnDelay = 2000; // What does 2000 mean?
```

### Error Handling

Always use try-catch for operations that can fail:

```javascript
import { logger } from '../utils/Logger.js';
import { errorHandler } from '../utils/ErrorHandler.js';

try {
    const data = JSON.parse(localStorage.getItem('save'));
    // Process data
} catch (error) {
    logger.error('SaveSystem', 'Failed to load save', { error });
    errorHandler.handleError(error, 'SaveSystem.load');
}
```

### Logging

Use the Logger utility instead of `console.log`:

```javascript
import { logger } from '../utils/Logger.js';

logger.debug('MyClass', 'Processing started', { count: 10 });
logger.info('MyClass', 'User action completed');
logger.warn('MyClass', 'Deprecated method used');
logger.error('MyClass', 'Operation failed', { error });
```

## Testing

### Writing Tests

Tests are located in the `tests/` directory. Use Node.js built-in test runner:

```javascript
import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';

describe('MyClass', () => {
    let instance;

    before(() => {
        instance = new MyClass();
    });

    it('should do something', () => {
        const result = instance.doSomething();
        assert.strictEqual(result, expectedValue);
    });

    after(() => {
        instance.cleanup();
    });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
node --test tests/MyClass.test.js
```

### Test Coverage

Aim for:
- **Critical systems**: 80%+ coverage (GameData, SaveStateManager, etc.)
- **Game logic**: 60%+ coverage (Enemy spawning, collision, etc.)
- **UI components**: 40%+ coverage

## Commit Guidelines

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting, etc.)
- `refactor` - Code refactoring
- `perf` - Performance improvements
- `test` - Adding or updating tests
- `chore` - Maintenance tasks

**Examples:**

```
feat(input): Add gamepad support to InputManager

- Implemented gamepad polling in update loop
- Added dead zone configuration
- Added button mapping system

Closes #42
```

```
fix(memory): Prevent AudioContext memory leak in SoundManager

Previously creating new AudioContext for every sound.
Now using singleton pattern with proper cleanup.

Fixes #38
```

### Atomic Commits

Make small, focused commits that do one thing. This makes:
- Code review easier
- Debugging simpler
- Git history cleaner

**Good:**
- Commit 1: `feat(logger): Add Logger utility`
- Commit 2: `feat(error): Add ErrorHandler utility`
- Commit 3: `refactor(scenes): Integrate Logger into BaseScene`

**Bad:**
- Commit 1: `feat: Add logger, error handler, refactor scenes, fix bugs`

## Pull Request Process

### Before Submitting

1. **Run tests**: `npm test` - All tests must pass
2. **Run linter**: `npm run lint:fix` - No linting errors
3. **Build check**: `npm run build` - Build must succeed
4. **Update CHANGELOG**: Add your changes under `[Unreleased]`
5. **Test manually**: Play the game and verify your changes work

### PR Template

```markdown
## Description
[Clear description of what this PR does]

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests pass (`npm test`)
- [ ] Lint passes (`npm run lint`)
- [ ] Build succeeds (`npm run build`)
- [ ] Manually tested in browser

## Related Issues
Closes #[issue number]

## Screenshots (if applicable)
[Add screenshots or GIFs of new features]

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-reviewed code
- [ ] Commented complex code
- [ ] Updated documentation
- [ ] Added/updated tests
- [ ] Updated CHANGELOG.md
```

### Review Process

1. Submit your PR
2. Wait for automated checks (GitHub Actions)
3. Respond to review comments
4. Make requested changes
5. Once approved, your PR will be merged

## Project Structure

```
GitGame/
├── src/
│   ├── config/
│   │   └── GameConfig.js          # All configuration constants
│   ├── scenes/
│   │   ├── BaseScene.js           # Base class for all scenes
│   │   ├── BootScene.js           # Initial loading scene
│   │   ├── MainMenuScene.js       # Main menu
│   │   └── GitSurvivorScene.js    # Game modes
│   └── utils/
│       ├── Logger.js              # Logging system
│       ├── ErrorHandler.js        # Global error handling
│       ├── PerformanceMonitor.js  # FPS and memory tracking
│       ├── InputManager.js        # Unified input handling
│       ├── SaveStateManager.js    # Game state persistence
│       ├── SceneTransitionManager.js # Scene transitions
│       ├── AssetLoader.js         # Asset management
│       ├── GameData.js            # Player data and stats
│       ├── SoundManager.js        # Audio system
│       └── ...
├── tests/
│   ├── run-tests.js               # Test runner
│   └── *.test.js                  # Test files
├── .github/
│   └── workflows/
│       └── ci.yml                 # GitHub Actions CI/CD
├── .eslintrc.json                 # ESLint configuration
├── .gitignore                     # Git ignore rules
├── package.json                   # Project dependencies
├── vite.config.js                 # Vite configuration
├── CHANGELOG.md                   # Change history
└── README.md                      # Project documentation
```

## Utility Systems

### Using BaseScene

All game scenes should extend `BaseScene`:

```javascript
import BaseScene from './BaseScene.js';

export default class MyGameScene extends BaseScene {
    constructor() {
        super({
            key: 'MyGameScene',
            enableInput: true,         // Enable InputManager
            enablePerformance: true,   // Enable PerformanceMonitor
            enableTransitions: true    // Enable SceneTransitionManager
        });
    }

    create() {
        // Initialize utilities
        this.initUtilities();

        // Your game logic
        this.createBackButton();
        // ...
    }

    update() {
        // Update utilities first
        this.updateUtilities();

        // Your game logic
        // ...
    }

    shutdown() {
        // Always call super.shutdown()
        super.shutdown();
    }
}
```

### Using InputManager

```javascript
// In create()
this.inputManager.bind('jump', ['SPACE', 'W']);
this.inputManager.bind('shoot', ['MOUSE_LEFT']);

// In update()
if (this.inputManager.isDown('jump')) {
    this.player.jump();
}

const movement = this.inputManager.getMovementVector();
this.player.x += movement.x * speed;
this.player.y += movement.y * speed;
```

### Using Logger

```javascript
import { logger } from '../utils/Logger.js';

// Different log levels
logger.debug('Category', 'Debug info', { data });
logger.info('Category', 'User action completed');
logger.warn('Category', 'Deprecated feature used');
logger.error('Category', 'Operation failed', { error });
```

### Using PerformanceMonitor

```javascript
// In create()
this.performanceMonitor = new PerformanceMonitor(this);

// In update()
this.performanceMonitor.update();

// Check performance
const avgFPS = this.performanceMonitor.getAverageFPS();
if (avgFPS < 30) {
    logger.warn('Performance', 'Low FPS detected', { avgFPS });
}
```

## Questions?

- Check existing issues for answers
- Create a new issue for questions
- Join discussions in pull requests
- Review the README.md for basic documentation

## License

By contributing, you agree that your contributions will be licensed under the same license as the project (ISC).

---

Thank you for contributing to GitGame! 🎮
