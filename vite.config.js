import { defineConfig } from 'vite';

export default defineConfig({
  root: './src',
  base: './',
  server: {
    port: 8080,
    host: true
  },
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    assetsDir: 'assets'
  },
  publicDir: '../public'
});
