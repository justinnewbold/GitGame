#!/usr/bin/env node
/**
 * Generate Placeholder PWA Icons
 *
 * Creates simple placeholder icons for PWA until proper icons are designed.
 * Uses Canvas API to generate icons with "GG" logo.
 *
 * Run: node scripts/generate-icons.js
 */

import { createCanvas } from 'canvas';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const outputDir = path.join(__dirname, '../public/icons');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

console.log('🎨 Generating placeholder PWA icons...\n');

sizes.forEach(size => {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    // Background - Green gradient
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, '#00ff00');
    gradient.addColorStop(1, '#00aa00');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    // Border
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = size * 0.04;
    ctx.strokeRect(size * 0.05, size * 0.05, size * 0.9, size * 0.9);

    // Text - "GG"
    ctx.fillStyle = '#000000';
    ctx.font = `bold ${size * 0.5}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('GG', size / 2, size / 2);

    // Save
    const buffer = canvas.toBuffer('image/png');
    const filename = `icon-${size}x${size}.png`;
    const filepath = path.join(outputDir, filename);
    fs.writeFileSync(filepath, buffer);

    console.log(`✅ Generated: ${filename}`);
});

console.log('\n✨ All icons generated successfully!');
console.log(`📁 Location: ${outputDir}`);
