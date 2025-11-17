import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true
      }
    }
  },
  build: {
    // TypeScript 에러를 무시하고 빌드
    rollupOptions: {
      onwarn(warning, warn) {
        // TypeScript 관련 경고 무시
        if (warning.code === 'UNUSED_EXTERNAL_IMPORT') return;
        warn(warning);
      }
    }
  },
  esbuild: {
    // TypeScript 에러를 경고로 변경
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  }
})
