import { defineConfig } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig(({ mode }) => ({
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    minify: 'esbuild',
    target: 'es2015',
    // Enable source maps for production debugging
    sourcemap: mode === 'development',
    // Chunk size warnings
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        // Code splitting strategy
        manualChunks: (id) => {
          // Phaser in its own chunk (largest dependency)
          if (id.includes('node_modules/phaser')) {
            return 'phaser';
          }

          // Core utilities in shared chunk
          if (id.includes('src/utils/')) {
            // Large utilities get their own chunks
            if (id.includes('CloudSaveSystem')) return 'cloud-save';
            if (id.includes('AccessibilitySystem')) return 'accessibility';
            if (id.includes('TutorialSystem')) return 'tutorial';
            // Small utilities bundled together
            return 'utils';
          }

          // Game scenes - each gets its own lazy-loaded chunk
          if (id.includes('src/scenes/')) {
            const sceneName = id.split('/').pop().replace('.js', '');
            // Core scenes bundled with main
            if (['BootScene', 'MainMenuScene', 'BaseScene', 'SettingsScene'].some(s => id.includes(s))) {
              return 'core-scenes';
            }
            // Game mode scenes lazy-loaded separately
            return `scene-${sceneName.toLowerCase().replace('scene', '')}`;
          }

          // Config files bundled together
          if (id.includes('src/config/')) {
            return 'config';
          }
        },
        // Asset file naming
        assetFileNames: (assetInfo) => {
          const ext = assetInfo.name.split('.').pop();
          if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(ext)) {
            return 'assets/images/[name]-[hash][extname]';
          }
          if (['woff', 'woff2', 'ttf', 'eot'].includes(ext)) {
            return 'assets/fonts/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
        // Chunk file naming
        chunkFileNames: 'assets/js/[name]-[hash].js',
        // Entry file naming
        entryFileNames: 'assets/js/[name]-[hash].js'
      }
    }
  },
  server: {
    port: 3000,
    open: true,
    // Enable cors for development
    cors: true
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['phaser'],
    exclude: []
  },
  plugins: mode === 'analyze' ? [
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true,
      filename: 'dist/bundle-stats.html'
    })
  ] : []
}));
