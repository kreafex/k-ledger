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
        name: 'K-Ledger Finance',
        short_name: 'K-Ledger',
        description: 'Personal Finance & Life Planner',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'logo-192.png', // Removed the leading slash
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable' // <--- ADD THIS
          },
          {
            src: 'logo-512.png', // Removed the leading slash
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable' // <--- ADD THIS
          }
        ]
      }
    })
  ]
});