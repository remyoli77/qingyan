// Electron 主进程 · 加载 Vite 构建产物 · 桌面壳
// 开发模式加载 http://localhost:5273 · 生产模式加载 dist/index.html
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
    win.loadURL("http://localhost:5273"); // 端口与 vite.config.ts server.port 保持一致
    win.webContents.openDevTools({ mode: "detach" });
  } else {
    win.loadFile(path.join(__dirname, "../dist/index.html"));
  }
}

// —— IPC：外接知识库文件系统能力 ——

// 安全校验 · 只接受来自主窗口渲染进程的调用
// 防止页面被注入内容后任意调用文件系统 IPC（读任意文件 / 写 vault）
function isTrustedSender(event) {
  try {
    const win = BrowserWindow.fromWebContents(event.sender);
    return win !== null && !win.isDestroyed() && event.sender === win.webContents;
  } catch {
    return false;
  }
}

// 选目录 · 用于关联 Obsidian vault 或任意文件夹
ipcMain.handle("dialog:openDirectory", async (event) => {
  if (!isTrustedSender(event)) return null;
  const result = await dialog.showOpenDialog({
    properties: ["openDirectory"],
    title: "选择知识库文件夹",
  });
  if (result.canceled || result.filePaths.length === 0) return null;
  return result.filePaths[0];
});

// 扫描文件夹 · 检测是否为 Obsidian vault + 列出所有 .md 文件
// 返回 { isObsidian, vaultName, mdFiles: [{path, name, mtime}] }
ipcMain.handle("fs:scanVault", async (event, dirPath) => {
  if (!isTrustedSender(event)) return { ok: false, error: "拒绝：调用方不受信" };
  if (!dirPath || typeof dirPath !== "string" || !fs.existsSync(dirPath)) {
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
// 安全：仅受信调用方 + 仅允许 .md 文件（防止任意文件读取）
ipcMain.handle("fs:readFile", async (event, filePath) => {
  if (!isTrustedSender(event)) return { ok: false, error: "拒绝：调用方不受信" };
  if (!filePath || typeof filePath !== "string") return { ok: false, error: "路径为空" };
  if (!filePath.toLowerCase().endsWith(".md")) {
    return { ok: false, error: "拒绝：仅支持读取 .md 文件" };
  }
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    return { ok: true, content };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
});

// 写 md 文件到 vault · 用于「收入典籍」时同步到外接库
// 自动创建子目录（按主题） · 路径: vault/青砚典籍/{topic}/{filename}.md
// 安全：仅受信调用方 + 路径穿越防护（topic/filename 均防 .. 与绝对路径）
ipcMain.handle("fs:writeMd", async (event, vaultPath, topic, filename, content) => {
  if (!isTrustedSender(event)) return { ok: false, error: "拒绝：调用方不受信" };
  if (!vaultPath || !topic || !filename) {
    return { ok: false, error: "参数缺失" };
  }
  if (typeof vaultPath !== "string" || typeof topic !== "string" || typeof filename !== "string" || typeof content !== "string") {
    return { ok: false, error: "参数类型错误" };
  }
  if (!fs.existsSync(vaultPath) || !fs.statSync(vaultPath).isDirectory()) {
    return { ok: false, error: "vault 路径无效" };
  }
  // 文件名安全化 · 去除非法字符 + 防路径穿越（.. 与路径分隔符）
  const safeName = filename
    .replace(/[\\/:*?"<>|]/g, "_")
    .replace(/\.\./g, "_")
    .replace(/^\.+/, "")
    .slice(0, 80);
  const safeTopic = String(topic).replace(/[\\/:*?"<>|]/g, "_").replace(/\.\./g, "_").slice(0, 60);
  if (!safeName) return { ok: false, error: "文件名非法" };
  try {
    const subDir = path.join(vaultPath, "青砚典籍", safeTopic);
    // 解析后再次校验 · 确保写入路径仍在 vault 内（防软链/穿越）
    const resolvedSub = path.resolve(subDir);
    const resolvedVault = path.resolve(vaultPath);
    if (!resolvedSub.startsWith(resolvedVault + path.sep)) {
      return { ok: false, error: "拒绝：写入路径超出 vault 范围" };
    }
    if (!fs.existsSync(subDir)) {
      fs.mkdirSync(subDir, { recursive: true });
    }
    const fullPath = path.join(subDir, `${safeName}.md`);
    fs.writeFileSync(fullPath, content, "utf-8");
    return { ok: true, path: fullPath };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
});

// 检测路径是否仍存在 · 用于启动时校验外接库配置有效性
ipcMain.handle("fs:exists", async (event, filePath) => {
  if (!isTrustedSender(event)) return false;
  if (!filePath || typeof filePath !== "string") return false;
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
