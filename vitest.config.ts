import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

// vitest 独立配置 · 仅复用路径别名 · 测试为纯逻辑不需要 react 插件
export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
  },
});
