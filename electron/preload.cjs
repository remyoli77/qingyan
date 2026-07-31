// Electron 预加载脚本 · 桌面环境信息透传 · 安全隔离
const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("desktop", {
  platform: process.platform,
  isElectron: true,
  version: process.versions.electron,
});
