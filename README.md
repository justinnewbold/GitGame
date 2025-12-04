# 🎮 GitGame - Survive the Code!

**A hilarious survival game about coding struggles where only the best developers survive!**

GitGame is a unique multi-mode mobile game that puts you through the real horrors of software development: merge conflicts, production bugs, security vulnerabilities, PR reviews, and team management disasters.

## 🕹️ Game Modes

### 🗡️ Git Survivor (Roguelike)
Face waves of enemies like Merge Conflicts, Memory Leaks, and NPM Packages in this fast-paced action game. Shoot down bugs and survive the sprint!

**Controls:**
- Arrow Keys / WASD: Move
- Space / Click: Attack
- Survive as long as possible!

### 🏰 Code Defense (Tower Defense)
Defend your production environment from bugs and security threats! Place defensive towers like Unit Tests, Linters, and CI/CD pipelines to stop attacks.

**Gameplay:**
- Buy defensive tools from the arsenal
- Place them strategically around the path
- Start waves and defend production!
- Earn money to upgrade your defenses

### ⏰ PR Rush (Time Management)
Review pull requests under intense time pressure! Approve good code, reject dangerous changes, and maintain your reputation.

**How to Play:**
- Read each PR carefully
- Approve safe changes, reject dangerous ones
- Watch for security issues, bad practices
- Maintain high accuracy to keep your job!

### ⚔️ Dev Commander (RTS)
Manage a team of developers, assign tasks, balance budgets, and keep morale high while delivering projects.

**Strategy:**
- Hire developers (Junior, Mid, Senior)
- Assign them to tasks
- Manage budget, morale, and code quality
- Complete sprints to advance!

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ (required for built-in test runner)
- **npm** or **yarn** or **pnpm**
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

```bash
# Clone the repository
git clone https://github.com/justinnewbold/GitGame.git
cd GitGame

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000 in your browser
```

### Development Commands

```bash
# Development server with hot reload
npm run dev

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🧪 Testing

GitGame includes comprehensive unit tests for game logic and utilities.

```bash
# Run all tests
npm test

# Watch mode (auto-reruns on file changes)
npm run test:watch
```

**Test Coverage:**
- GameData (25+ test cases)
- ComboSystem (15+ test cases)
- More tests coming soon!

See `tests/README.md` for detailed testing documentation.

## 🔧 Development Tools

### Debug Mode

Enable debug logging by adding URL parameters:
```
http://localhost:3000?debug=true
http://localhost:3000?loglevel=DEBUG
```

Or use the browser console:
```javascript
logger.setLevel(LogLevel.DEBUG)
logger.enableCategory('Performance')
```

### Performance Monitor

Press **F3** to toggle the performance overlay showing:
- Current and average FPS
- Memory usage
- Active game objects

Or programmatically:
```javascript
// In any scene
this.performanceMonitor = new PerformanceMonitor(this, {
    enabled: true,
    showOverlay: true
});
```

### Device Detection

Check device capabilities:
```javascript
import { deviceInfo } from './utils/DeviceDetection.js';

console.log(deviceInfo.getSummary());
// { type: 'mobile', platform: 'iPhone', features: {...}, ... }
```

## 📁 Project Structure

```
GitGame/
├── src/
│   ├── main.js              # Game entry point
│   ├── config/
│   │   └── GameConfig.js    # Centralized configuration
│   ├── scenes/              # Game scenes
│   │   ├── BaseScene.js     # Base class for all scenes
│   │   ├── MainMenuScene.js
│   │   ├── GitSurvivorScene.js
│   │   └── ...
│   └── utils/               # Utility classes
│       ├── GameData.js      # Persistent data management
│       ├── Logger.js        # Debug logging
│       ├── PerformanceMonitor.js
│       ├── DeviceDetection.js
│       ├── SoundManager.js
│       ├── PowerUps.js
│       └── ...
├── tests/                   # Unit tests
│   ├── GameData.test.js
│   ├── ComboSystem.test.js
│   └── run-tests.js
├── index.html
├── package.json
└── vite.config.js
```

## 🎯 Features

✨ **4 Complete Game Modes** - Each with unique gameplay mechanics
😂 **Hilarious Humor** - Funny messages and developer in-jokes throughout
📱 **Mobile Ready** - Designed for iOS and Android
🎨 **Cartoonish Style** - Fun, lighthearted graphics
🏆 **High Replayability** - Procedurally generated challenges

## 🛠️ Tech Stack

- **Phaser 3** - Industry-leading 2D game engine
- **Vite** - Lightning-fast build tool
- **JavaScript/ES6** - Modern web development
- **Capacitor** (coming soon) - Mobile deployment

## 📱 Mobile Deployment

To deploy to iOS/Android, we'll use Capacitor (coming soon):

```bash
# Install Capacitor
npm install @capacitor/core @capacitor/cli

# Initialize Capacitor
npx cap init

# Add platforms
npx cap add ios
npx cap add android

# Build and sync
npm run build
npx cap sync
```

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| **F3** | Toggle performance monitor overlay |
| **Arrow Keys / WASD** | Move player (in applicable game modes) |
| **Space** | Attack / Shoot (in applicable game modes) |
| **Escape** | Pause / Return to menu (in applicable game modes) |

**Debug Console:**
```javascript
// Available in browser console
logger.setLevel(LogLevel.DEBUG)  // Change log level
logger.enableCategory('Performance')  // Filter by category
deviceInfo.getSummary()  // Check device info
game.scene.scenes  // List all scenes
```

## 🎮 Gameplay Tips

- **Git Survivor**: Keep moving! Standing still means death.
- **Code Defense**: Place towers away from the path but close enough to hit enemies.
- **PR Rush**: Look for security red flags like hardcoded passwords or SQL injection risks.
- **Dev Commander**: Balance hiring costs with task rewards. Keep morale high with coffee!

## 🤝 Contributing

We welcome contributions! Here's how to get started:

### Development Setup

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass (`npm test`)
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to your branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

### Code Standards

- Use ESLint/Prettier for code formatting
- Write unit tests for new utilities
- Add JSDoc comments for public methods
- Follow existing code structure and patterns
- Update CHANGELOG.md with your changes

### Adding New Game Modes

1. Create a new scene in `src/scenes/YourModeScene.js`
2. Extend `BaseScene` for common functionality
3. Add your scene to `src/main.js`
4. Update GameConfig with any new constants
5. Add button in MainMenuScene
6. Write tests for game logic

### Adding New Features

- **New Power-ups**: Update `src/utils/PowerUps.js`
- **New Enemies**: Add to `GameConfig.ENEMY_TYPES`
- **New Achievements**: Update `GameData.getAchievements()`

## 🐛 Bug Reports

Found a bug? Please open an issue with:
- Description of the bug
- Steps to reproduce
- Expected vs actual behavior
- Browser/device information
- Console errors (if any)

## 📝 License

ISC License - Have fun!

## 🎪 Fun Facts

- All the bugs in this game are intentional... unlike real life 😅
- "Works on my machine" is not just a meme, it's a death sentence in Git Survivor
- The most dangerous PR is the one that looks innocent
- Junior devs are cheap but make lots of mistakes
- Coffee is the most valuable resource in any development team

---

**Made with ❤️ and lots of git conflicts**

*Warning: This game may cause flashbacks to real development nightmares*
