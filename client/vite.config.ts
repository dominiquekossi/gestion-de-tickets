import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
  },
  server: {
    port: 5173,
    // Relayer /api garde le navigateur sur une seule origine : le serveur n'a donc aucun CORS à configurer.
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
})
