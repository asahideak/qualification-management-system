import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3247,
    host: '127.0.0.1',
    watch: {
      usePolling: true,
      interval: 1000,
    },
    hmr: {
      overlay: true,
      port: 3249,
    },
  },
  optimizeDeps: {
    force: false,
  },
})
