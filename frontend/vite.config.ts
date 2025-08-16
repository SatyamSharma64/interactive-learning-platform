import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/trpc': {
        target: 'http://localhost:3000',
        // changeOrigin: true,
      },
      '/api': {
        target: 'http://localhost:3000',
        // changeOrigin: true,
      },
      '/ws': {
        target: 'http://localhost:3000',
        ws: true,
        // changeOrigin: true,
      },
    },
  }
})
