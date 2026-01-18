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
        display: 'standalone', // <--- This hides the browser URL bar
        orientation: 'portrait',
        start_url: '/',
        icons: [
          {
            src: '/logo-192.png', // We will create this in Step 3
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/logo-512.png', // We will create this in Step 3
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
});