// 外接知识库 store · Zustand · 管理 Obsidian vault 等外接库的关联配置
// 配置持久化到 localStorage · 启动时校验路径有效性 · 扫描 vault 加载到 external 库
// 双向同步：读取 md → external 库（检索可用） · 收入典籍 → 写入 vault

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { mdToEntry, entryToMd } from "@/lib/markdownParser";
import { addToKB, listLibrary, removeEntry } from "@/lib/knowledgeBase";
import type { KBEntry, KBTopic } from "@/lib/knowledgeBase";

export interface VaultConfig {
  /** vault 绝对路径 */
  path: string;
  /** vault 名（文件夹名） */
  name: string;
  /** 是否检测到 .obsidian 目录 */
  isObsidian: boolean;
  /** 关联时间戳 */
  connectedAt: number;
  /** md 文件数 · 上次扫描结果 */
  mdCount: number;
  /** 是否启用写入同步 · 收入典籍时同步写 md 到 vault */
  syncWrite: boolean;
}

interface ExternalState {
  /** 已关联的外接库配置 · 当前仅支持单个 · 后续可扩展多库 */
  vault: VaultConfig | null;
  /** 扫描状态 · 用于 UI 反馈 */
  scanning: boolean;
  /** 上次扫描错误信息 */
  error: string | null;
  /** 上次同步到 external 库的条目数 */
  syncedCount: number;

  /** 关联流程：选目录 → 扫描 → 自动配置 */
  connect: () => Promise<{ ok: boolean; vault?: VaultConfig; error?: string }>;
  /** 断开关联 · 配置清除 · external 库条目保留（用户可手动清） */
  disconnect: () => Promise<void>;
  /** 扫描 vault · 读取所有 md → 解析 → 写入 external 库 */
  sync: () => Promise<{ imported: number; total: number }>;
  /** 收入典籍时同步写 md 到 vault · 需 syncWrite=true */
  writeToVault: (question: string, answer: string, topic: KBTopic, tags?: string[]) => Promise<boolean>;
  /** 清空 external 库所有条目 */
  clearExternal: () => Promise<void>;
  /** 切换写入同步开关 · 收入典籍时是否写 md 到 vault */
  setVaultSyncWrite: (on: boolean) => void;
}

// Electron desktop 能力探测 · Web 模式下降级
interface DesktopApi {
  selectDirectory: () => Promise<string | null>;
  scanVault: (dirPath: string) => Promise<{
    ok: boolean;
    error?: string;
    isObsidian?: boolean;
    vaultName?: string;
    mdFiles?: Array<{ path: string; name: string; relativePath: string; mtime: number; size: number }>;
    total?: number;
  }>;
  readFile: (filePath: string) => Promise<{ ok: boolean; content?: string; error?: string }>;
  writeMd: (vaultPath: string, topic: string, filename: string, content: string) => Promise<{ ok: boolean; path?: string; error?: string }>;
  exists: (filePath: string) => Promise<boolean>;
}

function getDesktop(): DesktopApi | null {
  const w = window as unknown as { desktop?: DesktopApi };
  return w.desktop ?? null;
}

export const useExternalStore = create<ExternalState>()(
  persist(
    (set, get) => ({
      vault: null,
      scanning: false,
      error: null,
      syncedCount: 0,

      connect: async () => {
        const desktop = getDesktop();
        if (!desktop) {
          return { ok: false, error: "外接库功能仅桌面版可用 · 请以 Electron 模式启动" };
        }
        // 1. 选目录
        const dirPath = await desktop.selectDirectory();
        if (!dirPath) return { ok: false, error: "未选择目录" };

        // 2. 扫描
        const scanResult = await desktop.scanVault(dirPath);
        if (!scanResult.ok || !scanResult.mdFiles) {
          return { ok: false, error: scanResult.error || "扫描失败" };
        }

        const config: VaultConfig = {
          path: dirPath,
          name: scanResult.vaultName || dirPath.split(/[\\/]/).pop() || "vault",
          isObsidian: scanResult.isObsidian || false,
          connectedAt: Date.now(),
          mdCount: scanResult.total || 0,
          syncWrite: true, // 默认开启写入同步
        };
        set({ vault: config, error: null });

        // 3. 自动扫描加载
        await get().sync();

        return { ok: true, vault: config };
      },

      disconnect: async () => {
        set({ vault: null, syncedCount: 0, error: null });
      },

      sync: async () => {
        const { vault } = get();
        const desktop = getDesktop();
        if (!vault || !desktop) return { imported: 0, total: 0 };

        set({ scanning: true, error: null });
        try {
          // 先清空旧的 external 条目（避免删除后重扫残留）
          const existing = await listLibrary("external");
          await Promise.all(existing.map((e) => removeEntry(e.id)));

          // 重新扫描 vault
          const scanResult = await desktop.scanVault(vault.path);
          if (!scanResult.ok || !scanResult.mdFiles) {
            set({ scanning: false, error: scanResult.error || "扫描失败" });
            return { imported: 0, total: 0 };
          }

          // 逐个读取 md → 解析 → 写入 external 库
          let imported = 0;
          for (const file of scanResult.mdFiles) {
            const readResult = await desktop.readFile(file.path);
            if (!readResult.ok || !readResult.content) continue;
            const entry = mdToEntry(readResult.content, file.path, file.name, vault.name);
            if (!entry) continue;
            await addToKB(entry.topic, entry.question, entry.answer, "external", entry.tags, {
              library: "external",
              origin: entry.origin,
            });
            imported++;
          }

          // 更新配置的 mdCount
          set((s) => ({
            vault: s.vault ? { ...s.vault, mdCount: scanResult.total || 0 } : null,
            syncedCount: imported,
            scanning: false,
          }));

          return { imported, total: scanResult.total || 0 };
        } catch (e) {
          set({ scanning: false, error: String(e) });
          return { imported: 0, total: 0 };
        }
      },

      writeToVault: async (question, answer, topic, tags) => {
        const { vault } = get();
        const desktop = getDesktop();
        if (!vault || !vault.syncWrite || !desktop) return false;

        const mdContent = entryToMd(question, answer, topic, tags);
        // 文件名用 question 前 30 字 + 时间戳后缀防重
        const filename = `${question.slice(0, 30)}-${Date.now().toString(36).slice(-4)}`;
        const result = await desktop.writeMd(vault.path, topic, filename, mdContent);
        return result.ok;
      },

      clearExternal: async () => {
        const existing = await listLibrary("external");
        await Promise.all(existing.map((e) => removeEntry(e.id)));
        set({ syncedCount: 0 });
      },

      setVaultSyncWrite: (on) => {
        set((s) => ({
          vault: s.vault ? { ...s.vault, syncWrite: on } : null,
        }));
      },
    }),
    {
      name: "qingyan-external-vault",
      // 仅持久化 vault 配置 · 不持久化 scanning/error 等临时状态
      partialize: (s) => ({ vault: s.vault }),
    },
  ),
);

// 启动时校验配置有效性 · 路径不存在则清空配置
export async function validateVaultOnBoot(): Promise<void> {
  const { vault } = useExternalStore.getState();
  const desktop = getDesktop();
  if (!vault || !desktop) return;
  const exists = await desktop.exists(vault.path);
  if (!exists) {
    useExternalStore.setState({ vault: null, error: "外接库路径已失效 · 请重新关联" });
  } else {
    // 路径有效则自动同步一次
    await useExternalStore.getState().sync();
  }
}

// 类型导出 · 供其他模块使用
export type { KBEntry };
