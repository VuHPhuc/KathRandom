import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  server: {
    port: 5173,
    watch: {
      ignored: ['**/build/**', '**/*.exe', '**/dist/**']
    }
  }
});
