import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['plateshare-logo.png', 'vite.svg'],
      manifest: {
        name: 'PlateShare',
        short_name: 'PlateShare',
        description: 'Food sharing platform to connect donors with volunteers and NGOs',
        theme_color: '#2f855a',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'plateshare-logo.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'plateshare-logo.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'plateshare-logo.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      devOptions: {
        enabled: true
      }
    })
  ],
  server: {
    host: true, // Allows external access
    port: 5173,
    allowedHosts: ['62f5-2401-4900-c99c-d70e-49bd-ee3b-f116-2081.ngrok-free.app'] // You can change this if needed
  }
})

