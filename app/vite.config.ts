import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    // Force all React/Remotion imports to resolve from app/node_modules to avoid
    // dual-instance issues: @remotion-root files (from ../src/) would otherwise
    // resolve to root node_modules which has React 19, while @remotion/player
    // uses app/node_modules React 18. Two React instances break Remotion context.
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@remotion-root': path.resolve(__dirname, '../src'),
      'react': path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
      'react/jsx-runtime': path.resolve(__dirname, 'node_modules/react/jsx-runtime'),
      'remotion': path.resolve(__dirname, 'node_modules/remotion'),
    },
  },
  clearScreen: false,
  server: {
    port: 5180,
    strictPort: true,
    fs: {
      allow: [path.resolve(__dirname, '..')],
    },
  },
  envPrefix: ['VITE_', 'TAURI_'],
  build: {
    target: ['es2021', 'chrome100', 'safari13'],
    minify: !process.env.TAURI_DEBUG ? 'esbuild' : false,
    sourcemap: !!process.env.TAURI_DEBUG,
  },
});
