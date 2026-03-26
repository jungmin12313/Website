import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
  },
  build: {
    // 거대한 Base64 파일로 인한 Vite 빌드 OOM(메모리 초과) 크래시를 막기 위해 임시로 minify를 끕니다.
    minify: false
  },
  base: './',
})
