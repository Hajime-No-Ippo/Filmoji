import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      ogl: '/node_modules/ogl/src/index.js',
    },
  },
  server: {
    proxy: {
      '/api': process.env.VITE_BACKEND_URL || 'http://localhost:8080',
    },
  },
})
