import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

const srcDir = fileURLToPath(new URL('./src', import.meta.url));
const newtabEntry = fileURLToPath(new URL('./newtab.html', import.meta.url));
const backgroundEntry = fileURLToPath(new URL('./src/entrypoints/background/main.ts', import.meta.url));

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': srcDir,
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        newtab: newtabEntry,
        background: backgroundEntry,
      },
      output: {
        entryFileNames: (chunk) => {
          if (chunk.name === 'background') {
            return 'background.js';
          }
          return 'assets/[name].js';
        },
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]',
      },
    },
  },
  test: {
    environment: 'jsdom',
  },
});
