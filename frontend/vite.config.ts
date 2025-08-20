import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import dotenv from 'dotenv';
dotenv.config();

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
        target: process.env.VITE_API_URL,
        // changeOrigin: true,
      },
      '/api': {
        target: process.env.VITE_API_URL,
        // changeOrigin: true,
      },
      '/ws': {
        target: process.env.VITE_API_URL,
        ws: true,
        // changeOrigin: true,
      },
    },
  }
})
