import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/',
  server: {
    port: 3001,
    open: false,
  },
  build: {
    outDir: 'dist',
    // 2026-10 修复: sourcemap 曾为 true, dist/*.map 可被公网直接下载,
    // 等于在线公开全部 React 源码(含注释/内部端点/逻辑)。
    // 本项无 error-reporting 消费方, 直接关闭。
    sourcemap: false,
  },
})
