import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from "vite-tsconfig-paths";

// https://vite.dev/config/
// base: './' · 让构建产物用相对路径 · Electron file:// 协议可正常加载
export default defineConfig({
  base: './',
  build: {
    sourcemap: 'hidden',
  },
  server: {
    port: 5273,           // 固定端口 · 避开 5173（与 codex 等 dev server 冲突）
    strictPort: true,     // 端口被占直接报错 · 不自动跳号（避免 main.cjs 加载错页面）
    allowedHosts: true,
  },
  plugins: [
    react({
      babel: {
        plugins: [
          'react-dev-locator',
        ],
      },
    }),
    tsconfigPaths()
  ],
})
