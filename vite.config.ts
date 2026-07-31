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
