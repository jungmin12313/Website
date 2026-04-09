import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
  },
  build: {
    minify: true, // esbuild (default, faster)
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react/') || id.includes('react-dom/')) return 'vendor';
            if (id.includes('firebase')) return 'firebase';
            if (id.includes('lucide-react')) return 'icons';
          }
        }
      }
    },
    chunkSizeWarningLimit: 1000,
  },
  base: '/',
})
