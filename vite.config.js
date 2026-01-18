import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'K-Ledger',
        short_name: 'K-Ledger',
        description: 'Personal Finance Planner',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',      // <--- Forces "App Mode" (No browser bar)
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'logo-192.png',    // <--- Make sure this file exists in /public
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable' // <--- REQUIRED for "Real App" status
          },
          {
            src: 'logo-512.png',    // <--- Make sure this file exists in /public
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable' // <--- REQUIRED for "Real App" status
          }
        ]
      }
    })
  ]
});