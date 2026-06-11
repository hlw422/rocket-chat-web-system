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
  optimizeDeps: {
    include: ['@base-ui/react'],
  },
  server: {
    host: '0.0.0.0',
    port: 6290,
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'http://192.168.1.189:3000',
        changeOrigin: true,
      },
      '/file-upload': {
        target: 'http://192.168.1.189:3000',
        changeOrigin: true,
      },
      '/avatar': {
        target: 'http://192.168.1.189:3000',
        changeOrigin: true,
      },
      '/websocket': {
        target: 'ws://192.168.1.189:3000',
        ws: true,
        changeOrigin: true,
      },
    },
  },
})
