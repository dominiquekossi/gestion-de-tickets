import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Proxying /api keeps the browser on a single origin, so the server needs no CORS configuration.
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
})
