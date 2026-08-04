// Electron 预加载脚本 · 桌面环境信息透传 + 文件系统能力 · 安全隔离
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("desktop", {
  platform: process.platform,
  isElectron: true,
  version: process.versions.electron,

  // —— 外接知识库文件系统能力 ——
  // 选目录 · 返回路径或 null（用户取消）
  selectDirectory: () => ipcRenderer.invoke("dialog:openDirectory"),

  // 扫描文件夹 · 返回 { ok, isObsidian, vaultName, mdFiles, total }
  scanVault: (dirPath) => ipcRenderer.invoke("fs:scanVault", dirPath),

  // 读 md 文件 · 返回 { ok, content } 或 { ok: false, error }
  readFile: (filePath) => ipcRenderer.invoke("fs:readFile", filePath),

  // 写 md 到 vault · 路径: vault/青砚典籍/{topic}/{filename}.md
  writeMd: (vaultPath, topic, filename, content) =>
    ipcRenderer.invoke("fs:writeMd", vaultPath, topic, filename, content),

  // 路径是否存在 · 启动校验配置有效性
  exists: (filePath) => ipcRenderer.invoke("fs:exists", filePath),
});
