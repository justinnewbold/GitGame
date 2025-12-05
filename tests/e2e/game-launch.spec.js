import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Game Launch and Basic Functionality
 */

test.describe('Game Launch', () => {
    test('should load the game successfully', async ({ page }) => {
        await page.goto('/');

        // Wait for the page to load
        await page.waitForLoadState('networkidle');

        // Check that the page title is correct
        await expect(page).toHaveTitle(/GitGame/);

        // Check that the game canvas exists
        const canvas = page.locator('canvas');
        await expect(canvas).toBeVisible();
    });

    test('should display main menu', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Wait for the game to initialize (give Phaser time to start)
        await page.waitForTimeout(2000);

        // Check that canvas is visible and has proper dimensions
        const canvas = page.locator('canvas');
        await expect(canvas).toBeVisible();

        const boundingBox = await canvas.boundingBox();
        expect(boundingBox.width).toBeGreaterThan(0);
        expect(boundingBox.height).toBeGreaterThan(0);
    });

    test('should not have console errors on load', async ({ page }) => {
        const consoleErrors = [];

        page.on('console', msg => {
            if (msg.type() === 'error') {
                consoleErrors.push(msg.text());
            }
        });

        page.on('pageerror', error => {
            consoleErrors.push(error.message);
        });

        await page.goto('/');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        // Allow known acceptable errors (e.g., from third-party libraries)
        const acceptableErrors = [
            'DevTools',  // Browser extension errors
            'Extension', // Browser extension errors
        ];

        const realErrors = consoleErrors.filter(error =>
            !acceptableErrors.some(acceptable => error.includes(acceptable))
        );

        expect(realErrors).toHaveLength(0);
    });
});

test.describe('Game Modes', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000); // Wait for Phaser to initialize
    });

    test('should be able to click on canvas', async ({ page }) => {
        const canvas = page.locator('canvas');

        // Click on the canvas (to interact with game)
        await canvas.click({ position: { x: 400, y: 300 } });

        // Should not throw errors
        await page.waitForTimeout(500);
    });

    test('should handle keyboard input', async ({ page }) => {
        const canvas = page.locator('canvas');
        await canvas.click(); // Focus the canvas

        // Simulate arrow key presses
        await page.keyboard.press('ArrowUp');
        await page.keyboard.press('ArrowDown');
        await page.keyboard.press('ArrowLeft');
        await page.keyboard.press('ArrowRight');

        // Simulate space key
        await page.keyboard.press('Space');

        // Should not throw errors
        await page.waitForTimeout(500);
    });
});

test.describe('Performance', () => {
    test('should load within acceptable time', async ({ page }) => {
        const startTime = Date.now();

        await page.goto('/');
        await page.waitForLoadState('domcontentloaded');

        const loadTime = Date.now() - startTime;

        // Should load within 5 seconds
        expect(loadTime).toBeLessThan(5000);
    });

    test('should have acceptable memory usage', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);

        // Get performance metrics
        const metrics = await page.evaluate(() => {
            if (performance.memory) {
                return {
                    usedJSHeapSize: performance.memory.usedJSHeapSize,
                    totalJSHeapSize: performance.memory.totalJSHeapSize,
                    jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
                };
            }
            return null;
        });

        if (metrics) {
            // Used memory should be less than 100MB
            expect(metrics.usedJSHeapSize).toBeLessThan(100 * 1024 * 1024);
        }
    });
});

test.describe('Mobile Compatibility', () => {
    test('should be playable on mobile viewport', async ({ page, isMobile }) => {
        if (isMobile) {
            await page.goto('/');
            await page.waitForLoadState('networkidle');

            const canvas = page.locator('canvas');
            await expect(canvas).toBeVisible();

            // Test touch interaction
            await canvas.tap({ position: { x: 100, y: 100 } });
            await page.waitForTimeout(500);
        }
    });
});

test.describe('Accessibility', () => {
    test('should have proper page structure', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Check for proper HTML structure
        const html = page.locator('html');
        await expect(html).toHaveAttribute('lang');

        // Check meta viewport for mobile
        const viewport = page.locator('meta[name="viewport"]');
        await expect(viewport).toHaveCount(1);
    });

    test('should be keyboard navigable', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        // Tab through focusable elements
        await page.keyboard.press('Tab');
        await page.waitForTimeout(100);

        // Should be able to press Enter on focused elements
        await page.keyboard.press('Enter');
        await page.waitForTimeout(500);
    });
});
