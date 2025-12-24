import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

/**
 * Vite configuration for development tooling and optimization
 * Note: This app uses Next.js as the primary framework.
 * Vite is included for potential tooling, testing, or future migration needs.
 * 
 * For development, use: pnpm dev (uses Next.js with Turbopack)
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
  server: {
    port: 3001, // Different port from Next.js (3000)
    open: false,
    cors: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
})

