import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate vendor chunks for better caching
          'react-vendor': ['react', 'react-dom'],
          'mobx-vendor': ['mobx', 'mobx-react-lite'],
          'styled-vendor': ['styled-components'],
        },
      },
    },
    // Use esbuild for faster minification (default)
    minify: 'esbuild',
  },
})
