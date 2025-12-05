# GitGame Features Documentation

## Table of Contents
- [Development Tools](#development-tools)
- [Testing Infrastructure](#testing-infrastructure)
- [CI/CD Pipeline](#cicd-pipeline)
- [PWA Support](#pwa-support)
- [Performance](#performance)
- [Accessibility](#accessibility)
- [Internationalization](#internationalization)
- [Analytics](#analytics)

## Development Tools

### Logger
Professional logging system with category filtering and log levels.

```javascript
import { logger } from './utils/Logger.js';

logger.debug('Category', 'Debug message', { data });
logger.info('Category', 'Info message');
logger.warn('Category', 'Warning message');
logger.error('Category', 'Error message', { error });
```

**Features:**
- 5 log levels: NONE, ERROR, WARN, INFO, DEBUG, TRACE
- Category-based filtering
- URL parameter support (?debug=true)
- Log history (last 100)
- Export functionality

### PerformanceMonitor
Real-time FPS and memory tracking with visual overlay.

```javascript
import PerformanceMonitor from './utils/PerformanceMonitor.js';

this.performanceMonitor = new PerformanceMonitor(this, {
    showOverlay: true,
    trackMemory: true
});

// In update()
this.performanceMonitor.update();

// Press F3 to toggle overlay
```

**Features:**
- Real-time FPS tracking
- Memory usage monitoring
- Visual overlay (F3 toggle)
- Color-coded performance indicators
- Performance mark/measure
- Low FPS warnings

### InputManager
Unified input API for keyboard, mouse, touch, and gamepad.

```javascript
import InputManager from './utils/InputManager.js';

this.inputManager = new InputManager(this);

// Bind actions
this.inputManager.bind('jump', ['SPACE', 'W']);
this.inputManager.bind('shoot', ['MOUSE_LEFT']);

// Check input
if (this.inputManager.isDown('jump')) {
    player.jump();
}

// Get movement vector
const movement = this.inputManager.getMovementVector();
player.x += movement.x * speed;
```

**Features:**
- Unified API for all input types
- Customizable key bindings
- Normalized movement vectors
- Virtual joystick for mobile
- Dead zone configuration
- Touch support

### ErrorHandler
Global error handling and crash prevention.

```javascript
import { errorHandler } from './utils/ErrorHandler.js';

try {
    riskyOperation();
} catch (error) {
    errorHandler.handleError(error, 'MyClass.method');
}

// Wrap functions
const safe = errorHandler.wrap(riskyFunction, 'context');
const safeAsync = errorHandler.wrapAsync(asyncFunction, 'context');
```

**Features:**
- Global error catching
- User-friendly error screens
- Error history tracking
- Export error reports
- Function wrapping utilities
- Smart error classification

### SaveStateManager
Robust game state persistence with autosave.

```javascript
import { saveStateManager } from './utils/SaveStateManager.js';

// Start autosave
saveStateManager.startAutoSave(scene, 10000); // Every 10s

// Manual save
const state = { score: 100, level: 5 };
saveStateManager.save('slot1', state);

// Load
const loaded = saveStateManager.load('slot1');

// Export/Import
const backup = saveStateManager.exportSave('slot1');
saveStateManager.importSave('slot2', backup);
```

**Features:**
- Autosave with configurable interval
- Multiple save slots (max 5)
- Optional compression
- Save validation
- Import/export backups
- Auto-cleanup on quota exceeded

### SceneTransitionManager
Smooth scene transitions with multiple effects.

```javascript
import SceneTransitionManager from './utils/SceneTransitionManager.js';
import { TransitionType } from './utils/SceneTransitionManager.js';

this.transitionManager = new SceneTransitionManager(this);

// Quick fade
this.transitionManager.quickFade('MainMenu');

// Custom transition
await this.transitionManager.transition(
    'GameScene',
    TransitionType.SLIDE_LEFT,
    1000,
    { level: 2 }
);

// With loading screen
await this.transitionManager.transitionWithLoading(
    'HeavyScene',
    'Loading assets...'
);
```

**Transition Types:**
- FADE
- SLIDE_LEFT, SLIDE_RIGHT, SLIDE_UP, SLIDE_DOWN
- ZOOM_IN, ZOOM_OUT
- PIXELATE
- WIPE
- CIRCLE

### Analytics
Anonymous game telemetry for improving game balance.

```javascript
import { analytics } from './utils/Analytics.js';

// Track events
analytics.trackEvent('level_complete', { level: 1, score: 100 });
analytics.trackGameStart('survivor');
analytics.trackGameEnd('survivor', 500, 120000);
analytics.trackDeath('merge_conflict', 3, 450);

// User consent
analytics.setConsent(true);

// Export data
const data = analytics.exportData();
```

**Features:**
- Anonymous tracking
- User consent management
- Session tracking
- Event recording
- Performance metrics
- Error tracking
- Export functionality

### i18n (Internationalization)
Multi-language support system.

```javascript
import { i18n } from './utils/i18n.js';

// Set language
i18n.setLanguage('es'); // Spanish

// Translate
const text = i18n.t('menu.play'); // "Jugar"

// With variables
const score = i18n.t('score.final', { score: 100 });
// "Puntuación Final: 100"

// Auto-detect
i18n.detectLanguage();
```

**Supported Languages:**
- English (en)
- Spanish (es)
- French (fr)
- German (de)

## Testing Infrastructure

### Unit Tests
Comprehensive test suite using Node.js built-in test runner.

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# With coverage
npm run test:coverage
```

**Test Coverage:**
- GameData (25+ tests)
- ComboSystem (15+ tests)
- SoundManager (25+ tests)
- More coming!

### E2E Tests
End-to-end testing with Playwright across multiple browsers.

```bash
# Run E2E tests
npm run test:e2e

# Interactive UI mode
npm run test:e2e:ui
```

**Test Coverage:**
- Game launch and initialization
- Canvas rendering
- Keyboard and mouse input
- Mobile touch interaction
- Performance metrics
- Memory usage
- Accessibility checks

**Browsers Tested:**
- Chromium (Desktop)
- Firefox (Desktop)
- WebKit (Desktop)
- Mobile Chrome (Pixel 5)
- Mobile Safari (iPhone 12)

### Code Coverage
Detailed coverage reports with c8.

```bash
npm run test:coverage
```

**Output Formats:**
- HTML report (coverage/index.html)
- Text summary in terminal
- LCOV format for CI integration

## CI/CD Pipeline

### GitHub Actions Workflow
Automated testing, linting, and builds on every push/PR.

**Jobs:**
1. **Test** - Unit tests on Node 18.x and 20.x
2. **Lint** - ESLint code quality checks
3. **Build** - Production build
4. **Coverage** - Code coverage reporting
5. **E2E** - Playwright tests across browsers
6. **Lighthouse** - Performance audits
7. **Bundle Size** - Size budget enforcement (10MB max)

**Artifacts Uploaded:**
- Test results
- Coverage reports
- E2E test reports
- Lighthouse reports
- Build artifacts

### Pre-commit Hooks
Automatic code quality checks before commits.

```bash
# Setup hooks
npm run setup-hooks

# What it checks:
# ✅ ESLint code quality
# ✅ All tests pass
# ⚠️  console.log warnings
# ℹ️  TODO/FIXME count
```

### Dependabot
Automated dependency updates.

- Weekly updates (Mondays 9am ET)
- Grouped minor/patch updates
- Separate PRs for major updates
- Auto-labels for easy filtering

## PWA Support

### Installation
GitGame can be installed as a Progressive Web App!

**Features:**
- Install to home screen
- Offline functionality
- App-like experience
- Fast loading
- Background updates

**Install Methods:**
1. **Desktop:** Click install button in browser
2. **Mobile:** "Add to Home Screen" prompt
3. **iOS:** Safari → Share → Add to Home Screen

### Service Worker
Offline caching and background updates.

**Caching Strategy:**
- Precache: Critical assets (HTML, manifest)
- Runtime cache: Dynamic resources
- Network-first for pages
- Cache-first for assets

**Features:**
- Offline gameplay
- Background updates
- Push notifications (future)
- Update notifications

### Manifest
Web App Manifest for installability.

**Includes:**
- App name and description
- Icons (72px-512px)
- Theme colors
- Start URL
- Display mode (standalone)
- Orientation settings
- Screenshots
- Shortcuts

## Performance

### Bundle Analysis
Visualize bundle composition and size.

```bash
npm run build:analyze
```

**Opens interactive report showing:**
- Module sizes
- Gzip/Brotli sizes
- Dependency tree
- Optimization opportunities

### Performance Budgets
Enforced in CI pipeline:

- **Total Bundle:** < 10MB
- **Load Time:** < 5 seconds
- **FPS:** > 30 average
- **Memory:** < 100MB

### Lighthouse CI
Automated performance audits.

```bash
npm run lighthouse
```

**Metrics Tracked:**
- Performance score (>70%)
- Accessibility score (>80%)
- Best practices score (>80%)
- SEO score (>80%)
- First Contentful Paint
- Largest Contentful Paint
- Cumulative Layout Shift
- Total Blocking Time

### Optimization Features
- Code splitting (Phaser separated)
- Tree shaking
- Minification
- Gzip/Brotli compression
- Image optimization (future)
- Lazy loading (future)

## Accessibility

### Features Implemented
- ✅ ARIA labels and roles
- ✅ Semantic HTML structure
- ✅ Keyboard navigation
- ✅ Skip to content links
- ✅ Screen reader support
- ✅ Loading indicators
- ✅ Proper meta viewport
- ✅ Language attribute

### Keyboard Navigation
All interactive elements are keyboard-accessible:
- Tab: Navigate elements
- Enter: Activate buttons
- Arrow keys: Game controls
- Escape: Pause/back
- F3: Performance overlay

### Testing
E2E tests include accessibility checks:
- Proper page structure
- Meta viewport
- Keyboard navigation
- Focus management

## Best Practices

### Using BaseScene
All scenes should extend BaseScene:

```javascript
import BaseScene from './BaseScene.js';

export default class MyScene extends BaseScene {
    constructor() {
        super({
            key: 'MyScene',
            enableInput: true,
            enablePerformance: true,
            enableTransitions: true
        });
    }

    create() {
        this.initUtilities();
        // Your code...
    }

    update() {
        this.updateUtilities();
        // Your code...
    }

    shutdown() {
        super.shutdown();
    }
}
```

### Error Handling
Always wrap risky operations:

```javascript
try {
    riskyOperation();
} catch (error) {
    logger.error('MyClass', 'Operation failed', { error });
    errorHandler.handleError(error, 'MyClass.method');
}
```

### Logging
Use Logger instead of console.log:

```javascript
// Bad
console.log('Player moved', x, y);

// Good
logger.debug('Player', 'Moved', { x, y });
```

### Configuration
Use GameConfig for all constants:

```javascript
// Bad
const speed = 200;

// Good
import { GameConfig } from '../config/GameConfig.js';
const speed = GameConfig.PLAYER.BASE_SPEED;
```

## Future Enhancements

### Planned Features
- [ ] Visual regression testing
- [ ] Image optimization pipeline
- [ ] Service worker strategies per asset type
- [ ] Push notification system
- [ ] More languages (Japanese, Chinese, etc.)
- [ ] Advanced analytics dashboard
- [ ] A/B testing framework
- [ ] Social sharing integration

---

**For more information, see:**
- [README.md](../README.md) - Project overview
- [CONTRIBUTING.md](../CONTRIBUTING.md) - Contribution guidelines
- [CHANGELOG.md](../CHANGELOG.md) - Change history
