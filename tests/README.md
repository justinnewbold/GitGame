# GitGame Tests

Automated tests for GitGame utilities and game logic.

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (reruns on file changes)
npm run test:watch
```

## Test Coverage

### GameData Tests (`GameData.test.js`)
- Initialization and default values
- Stat updates (set, increment, max operations)
- Nested stat paths
- Achievement system
- Data persistence (save/load)
- Error handling for corrupted data
- Data validation
- Export/import functionality
- Reset functionality

### ComboSystem Tests (`ComboSystem.test.js`)
- Combo building and tracking
- Score multiplier calculation
- Combo reset behavior
- Max combo tracking
- Multiplier thresholds (1.5x, 2x, 3x, 4x, 5x)

## Writing New Tests

Tests use Node.js's built-in test runner (requires Node.js 18+).

```javascript
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';

describe('MyUtility', () => {
    let utility;

    beforeEach(() => {
        utility = new MyUtility();
    });

    it('should do something', () => {
        const result = utility.doSomething();
        assert.strictEqual(result, expectedValue);
    });
});
```

## Test Structure

- `tests/` - All test files
- `*.test.js` - Test files (auto-discovered by test runner)
- `run-tests.js` - Test runner script

## Future Test Coverage

Additional tests to implement:
- PowerUpManager
- ParticleEffects
- SoundManager
- ComboSystem edge cases
- Scene lifecycle tests
- Integration tests for game modes
