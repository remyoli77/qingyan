// Electron 主进程 · 加载 Vite 构建产物 · 桌面壳
// 开发模式加载 http://localhost:5173 · 生产模式加载 dist/index.html
// 提供文件系统能力：选目录、扫描 Obsidian vault、读写 Markdown · 用于外接知识库关联
const { app, BrowserWindow, shell, ipcMain, dialog } = require("electron");
const fs = require("fs");
const path = require("path");

const isDev = !app.isPackaged;

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 960,
    minHeight: 640,
    show: false,
    backgroundColor: "#F8F3E7",
    title: "青砚 · 国风 AI Agent",
    icon: path.join(__dirname, "../build/icon.png"),
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // 窗口准备就绪后再显示 · 避免白屏闪烁
  win.once("ready-to-show", () => win.show());

  // 外链用系统浏览器打开 · 不在应用内导航
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  if (isDev) {
    win.loadURL("http://localhost:5173");
    win.webContents.openDevTools({ mode: "detach" });
  } else {
    win.loadFile(path.join(__dirname, "../dist/index.html"));
  }
}

// —— IPC：外接知识库文件系统能力 ——

// 选目录 · 用于关联 Obsidian vault 或任意文件夹
ipcMain.handle("dialog:openDirectory", async () => {
  const result = await dialog.showOpenDialog({
    properties: ["openDirectory"],
    title: "选择知识库文件夹",
  });
  if (result.canceled || result.filePaths.length === 0) return null;
  return result.filePaths[0];
});

// 扫描文件夹 · 检测是否为 Obsidian vault + 列出所有 .md 文件
// 返回 { isObsidian, vaultName, mdFiles: [{path, name, mtime}] }
ipcMain.handle("fs:scanVault", async (_evt, dirPath) => {
  if (!dirPath || !fs.existsSync(dirPath)) {
    return { ok: false, error: "路径不存在" };
  }
  const stat = fs.statSync(dirPath);
  if (!stat.isDirectory()) {
    return { ok: false, error: "路径非文件夹" };
  }

  // 检测 .obsidian 目录 · 判定是否为 Obsidian vault
  const obsidianConfig = path.join(dirPath, ".obsidian");
  const isObsidian = fs.existsSync(obsidianConfig);

  // vault 名取文件夹名
  const vaultName = path.basename(dirPath);

  // 递归收集 .md 文件 · 跳过 .obsidian / node_modules / .git
  const mdFiles = [];
  const SKIP_DIRS = new Set([".obsidian", "node_modules", ".git", ".trash"]);

  function walk(dir) {
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (SKIP_DIRS.has(entry.name)) continue;
        walk(fullPath);
      } else if (entry.isFile() && entry.name.endsWith(".md")) {
        try {
          const st = fs.statSync(fullPath);
          mdFiles.push({
            path: fullPath,
            name: entry.name,
            relativePath: path.relative(dirPath, fullPath),
            mtime: st.mtimeMs,
            size: st.size,
          });
        } catch {
          /* 跳过无权限文件 */
        }
      }
    }
  }
  walk(dirPath);

  return {
    ok: true,
    isObsidian,
    vaultName,
    mdFiles,
    total: mdFiles.length,
  };
});

// 读单个 md 文件 · 返回原文
ipcMain.handle("fs:readFile", async (_evt, filePath) => {
  if (!filePath) return { ok: false, error: "路径为空" };
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    return { ok: true, content };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
});

// 写 md 文件到 vault · 用于「收入典籍」时同步到外接库
// 自动创建子目录（按主题） · 路径: vault/青砚典籍/{topic}/{filename}.md
ipcMain.handle("fs:writeMd", async (_evt, vaultPath, topic, filename, content) => {
  if (!vaultPath || !topic || !filename) {
    return { ok: false, error: "参数缺失" };
  }
  try {
    const subDir = path.join(vaultPath, "青砚典籍", topic);
    if (!fs.existsSync(subDir)) {
      fs.mkdirSync(subDir, { recursive: true });
    }
    // 文件名安全化 · 去除非法字符
    const safeName = filename.replace(/[\\/:*?"<>|]/g, "_").slice(0, 80);
    const fullPath = path.join(subDir, `${safeName}.md`);
    fs.writeFileSync(fullPath, content, "utf-8");
    return { ok: true, path: fullPath };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
});

// 检测路径是否仍存在 · 用于启动时校验外接库配置有效性
ipcMain.handle("fs:exists", async (_evt, filePath) => {
  if (!filePath) return false;
  return fs.existsSync(filePath);
});

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
