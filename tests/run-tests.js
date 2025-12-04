#!/usr/bin/env node

/**
 * Test runner for GitGame
 * Runs all test files in the tests directory
 */

import { run } from 'node:test';
import { spec as specReporter } from 'node:test/reporters';
import { glob } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Find all test files
const testFiles = [];
try {
    for await (const file of glob(path.join(__dirname, '**/*.test.js'))) {
        testFiles.push(file);
    }
} catch (e) {
    console.error('Error finding test files:', e.message);
    process.exit(1);
}

if (testFiles.length === 0) {
    console.log('No test files found!');
    process.exit(0);
}

console.log(`\n🧪 Running ${testFiles.length} test file(s)...\n`);

// Run tests
run({ files: testFiles })
    .compose(specReporter())
    .pipe(process.stdout);
