// 典籍阁 · 三库分览 · 按主题归目
// seed 预置只读 / user 用户累计（可导出导入 JSON 备份）/ external 外接库（实时关联 Obsidian vault）
// 外接库：关联流程（选目录→扫描→自动配置）+ 同步 + 写入同步开关
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { KBEntry, KBLibrary, KBTopic } from "@/lib/knowledgeBase";
import { listLibrary, removeEntry, exportLibrary, importLibrary, kbStats } from "@/lib/knowledgeBase";
import { useDynastyMeta } from "@/store/themeStore";
import { useExternalStore } from "@/store/externalStore";
import Seal from "./Seal";

interface LibraryScrollProps {
  /** 外部传入刷新触发器 · 收入典籍后递增可触发重载 */
  refreshTick?: number;
  /** 外部触发的关联动作 · 递增则启动关联流程 */
  connectTick?: number;
}

const TOPIC_LABEL: Record<KBTopic, { label: string; icon: string }> = {
  shici: { label: "诗词", icon: "诗" },
  shuhua: { label: "书画", icon: "画" },
  chadao: { label: "茶道", icon: "茶" },
  jieqi: { label: "节气", icon: "节" },
  guqin: { label: "古琴", icon: "琴" },
  wendao: { label: "问道", icon: "雅" },
};

const LIB_META: Record<KBLibrary, { label: string; hint: string; seal: string }> = {
  seed: { label: "种子库", hint: "预置只读 · 应用自带", seal: "藏" },
  user: { label: "累计库", hint: "蒸馏补入 · 手动收入", seal: "录" },
  external: { label: "外接库", hint: "Obsidian vault 实时关联", seal: "外" },
};

export default function LibraryScroll({ refreshTick = 0, connectTick = 0 }: LibraryScrollProps) {
  const [entries, setEntries] = useState<KBEntry[]>([]);
  const [stats, setStats] = useState<{ seed: number; user: number; external: number }>({ seed: 0, user: 0, external: 0 });
  const [activeLib, setActiveLib] = useState<KBLibrary | "all">("all");
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [showExternalPanel, setShowExternalPanel] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const meta = useDynastyMeta();

  // externalStore
  const vault = useExternalStore((s) => s.vault);
  const scanning = useExternalStore((s) => s.scanning);
  const syncedCount = useExternalStore((s) => s.syncedCount);
  const error = useExternalStore((s) => s.error);
  const connectVault = useExternalStore((s) => s.connect);
  const disconnectVault = useExternalStore((s) => s.disconnect);
  const syncVault = useExternalStore((s) => s.sync);
  const clearExternal = useExternalStore((s) => s.clearExternal);
  const setVaultSyncWrite = useExternalStore((s) => s.setVaultSyncWrite);

  // desktop 能力探测 · Web 模式无 fs 能力
  const isDesktop = typeof window !== "undefined" && !!(window as { desktop?: unknown }).desktop;

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const [all, s] = await Promise.all([listLibrary(), kbStats()]);
      setEntries(all);
      setStats(s.byLibrary);
    } catch {
      /* IndexedDB 异常静默 */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload, refreshTick, syncedCount]);

  // 外部触发关联（AI 指令或按钮）· connectTick 递增则启动
  useEffect(() => {
    if (connectTick > 0) {
      void doConnect();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectTick]);

  // 按库 + 关键词过滤
  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return entries
      .filter((e) => activeLib === "all" || e.library === activeLib)
      .filter((e) => {
        if (!kw) return true;
        return (e.question + e.answer + (e.tags || []).join("")).toLowerCase().includes(kw);
      });
  }, [entries, activeLib, keyword]);

  // 按库分组
  const byLib = useMemo(() => {
    const map: Record<KBLibrary, KBEntry[]> = { seed: [], user: [], external: [] };
    filtered.forEach((e) => map[e.library].push(e));
    return map;
  }, [filtered]);

  const handleDelete = useCallback(async (id: string) => {
    const ok = await removeEntry(id);
    if (ok) void reload();
  }, [reload]);

  const handleExport = useCallback(async () => {
    const json = await exportLibrary();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `qingyan-library-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const handleImport = useCallback(async (file: File) => {
    const text = await file.text();
    const result = await importLibrary(text);
    if (result.imported > 0) void reload();
    return result;
  }, [reload]);

  // 关联外接库流程
  const doConnect = useCallback(async () => {
    setConnecting(true);
    try {
      const result = await connectVault();
      if (result.ok) {
        await reload();
        setShowExternalPanel(false);
      }
    } finally {
      setConnecting(false);
    }
  }, [connectVault, reload]);

  const total = entries.length;

  return (
    <div className="h-full flex flex-col">
      {/* 标题栏 */}
      <div className="px-4 py-3 border-b border-qingbi/15 bg-qingbi/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="seal w-7 h-7 text-[10px] rotate-[-3deg]">阁</span>
          <div className="leading-tight">
            <div className="font-song text-sm text-daiqing tracking-wider">典籍阁</div>
            <div className="font-song text-[10px] text-qingbi/55 tracking-wider">三库分览 · 随检</div>
          </div>
        </div>
        <div className="text-right leading-tight">
          <div className="font-song text-sm text-zheshi">{total}</div>
          <div className="font-song text-[10px] text-qingbi/55 tracking-wider">条目</div>
        </div>
      </div>

      {/* 搜索 + 库 tab */}
      <div className="px-4 py-2 border-b border-qingbi/10 space-y-2">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="检索典籍…"
          className="w-full px-2.5 py-1.5 font-song text-xs text-daiqing bg-xuanzhi-deep/40 border border-qingbi/20 focus:border-qingbi/50 outline-none transition-colors placeholder:text-qingbi/40"
          style={{ borderRadius: "2px" }}
        />
        <div className="flex gap-1">
          {(["all", "seed", "user", "external"] as const).map((lib) => {
            const count = lib === "all" ? total : stats[lib];
            const active = activeLib === lib;
            const label = lib === "all" ? "全部" : LIB_META[lib].label;
            return (
              <button
                key={lib}
                type="button"
                onClick={() => setActiveLib(lib)}
                className={`flex-1 py-1 font-song text-[10px] tracking-wider transition-all duration-300 ${
                  active ? "bg-qingbi text-xuanzhi-light shadow-seal" : "text-qingbi/70 hover:text-daiqing bg-xuanzhi-deep/30"
                }`}
                style={{ borderRadius: "2px" }}
              >
                {label}{count > 0 ? `·${count}` : ""}
              </button>
            );
          })}
        </div>
      </div>

      {/* 外接库状态条 · 已关联显示 vault 信息 + 同步 + 断开 · 未关联显示「关联外接库」按钮 */}
      <div className="px-4 py-2 border-b border-qingbi/10 bg-xuanzhi/10">
        {vault ? (
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="font-song text-[10px] text-qingbi/60">已关联</span>
              <span className="font-song text-xs text-daiqing truncate flex-1">{vault.name}</span>
              {vault.isObsidian && (
                <span className="font-song text-[9px] text-zheshi px-1 border border-zheshi/30" style={{ borderRadius: "1px" }}>Obsidian</span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => void syncVault()}
                disabled={scanning}
                className="flex-1 px-2 py-1 font-song text-[10px] text-qingbi/70 hover:text-daiqing hover:bg-xuanzhi-deep/60 border border-qingbi/15 hover:border-qingbi/40 transition-all disabled:opacity-50 disabled:cursor-wait"
                style={{ borderRadius: "2px" }}
              >
                {scanning ? "同步中…" : "重新扫描"}
              </button>
              <button
                type="button"
                onClick={() => setVaultSyncWrite(!vault.syncWrite)}
                className={`px-2 py-1 font-song text-[10px] transition-all border ${
                  vault.syncWrite
                    ? "text-daiqing bg-xuanzhi-deep/60 border-qingbi/40"
                    : "text-qingbi/50 bg-transparent border-qingbi/15"
                }`}
                style={{ borderRadius: "2px" }}
                title="开启后收入典籍时自动写入 vault"
              >
                {vault.syncWrite ? "写入✓" : "写入✗"}
              </button>
              <button
                type="button"
                onClick={() => void disconnectVault()}
                className="px-2 py-1 font-song text-[10px] text-qingbi/50 hover:text-zhusha hover:bg-zhusha/10 border border-qingbi/15 transition-all"
                style={{ borderRadius: "2px" }}
              >
                断开
              </button>
            </div>
            {vault.mdCount > 0 && (
              <div className="font-song text-[9px] text-qingbi/45 tracking-wider">
                {vault.mdCount} 篇 · 已载 {syncedCount} 条
              </div>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => (isDesktop ? void doConnect() : setShowExternalPanel((v) => !v))}
            disabled={connecting || !isDesktop}
            className="w-full py-1.5 font-song text-[10px] text-qingbi/70 hover:text-daiqing hover:bg-xuanzhi-deep/60 border border-qingbi/15 hover:border-qingbi/40 transition-all disabled:opacity-40"
            style={{ borderRadius: "2px" }}
          >
            {connecting ? "关联中…" : isDesktop ? "＋ 关联外接知识库" : "外接库需桌面版"}
          </button>
        )}
        {error && (
          <div className="mt-1 font-song text-[10px] text-zhusha/80">{error}</div>
        )}
        {!isDesktop && showExternalPanel && (
          <div className="mt-2 px-2 py-1.5 bg-xuanzhi-deep/30 border border-qingbi/15">
            <p className="font-song text-[10px] text-qingbi/60 leading-relaxed">
              外接库关联需文件系统能力 · 请以 Electron 桌面模式启动应用。<br />
              <span className="text-qingbi/45">当前为 Web 模式 · 仅可浏览已加载的外接条目</span>
            </p>
          </div>
        )}
      </div>

      {/* 条目列表 */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <span className="font-song text-xs text-qingbi/50 tracking-widest animate-pulse">展卷中…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-6 py-10">
            <svg viewBox="0 0 48 48" className="w-10 h-10 mb-3 opacity-40" aria-hidden="true">
              <rect x="8" y="10" width="32" height="30" rx="1" fill="none" stroke="rgb(var(--c-qingbi-rgb))" strokeWidth="1.2" />
              <line x1="8" y1="10" x2="40" y2="10" stroke="rgb(var(--c-qingbi-rgb))" strokeWidth="1.5" />
              <line x1="8" y1="40" x2="40" y2="40" stroke="rgb(var(--c-qingbi-rgb))" strokeWidth="1.5" />
              <line x1="24" y1="14" x2="24" y2="36" stroke="rgb(var(--c-qingbi-rgb))" strokeWidth="0.5" strokeDasharray="1.5 1.5" />
            </svg>
            <p className="font-song text-xs text-qingbi/55 leading-relaxed">
              {keyword ? "未检得相关典籍" : "典籍阁尚虚"}<br />
              {keyword ? "可换词再检" : "收入典籍 · 自有积累"}
            </p>
          </div>
        ) : (
          <div className="py-2">
            {(Object.keys(byLib) as KBLibrary[]).filter((lib) => byLib[lib].length > 0).map((lib) => {
              const libEntries = byLib[lib];
              const libMeta = LIB_META[lib];
              const canDelete = lib !== "seed";
              // 库内按主题分组
              const byTopic = new Map<KBTopic, KBEntry[]>();
              libEntries.forEach((e) => {
                if (!byTopic.has(e.topic)) byTopic.set(e.topic, []);
                byTopic.get(e.topic)!.push(e);
              });
              return (
                <div key={lib} className="mb-3">
                  {/* 库标题 */}
                  <div className="px-4 py-1.5 flex items-center gap-2 bg-xuanzhi/20">
                    <Seal text={libMeta.seal} size={18} shape="square" rotate={-2} />
                    <span className="font-song text-xs text-daiqing tracking-widest">{libMeta.label}</span>
                    <span className="font-song text-[10px] text-qingbi/55">· {libMeta.hint}</span>
                    <span className="ml-auto font-song text-[10px] text-qingbi/55">{libEntries.length}</span>
                  </div>
                  {/* 主题分组 */}
                  {(Array.from(byTopic.keys()) as KBTopic[]).map((topic) => {
                    const topicEntries = byTopic.get(topic)!;
                    const tm = TOPIC_LABEL[topic];
                    return (
                      <div key={topic} className="mb-1">
                        <div className="px-4 py-1 flex items-center gap-1.5">
                          <span className="font-song text-[10px] text-qingbi/60 tracking-wider">{tm.icon}</span>
                          <span className="font-song text-[10px] text-qingbi/65 tracking-widest">{tm.label}</span>
                          <span className="ml-auto font-song text-[9px] text-qingbi/45">{topicEntries.length}</span>
                        </div>
                        <ul>
                          {topicEntries.map((e) => (
                            <li
                              key={e.id}
                              className="px-4 py-2 mx-2 mb-1 hover:bg-xuanzhi/40 transition-colors group relative"
                              style={{ borderLeft: "2px solid rgb(var(--c-qingbi-rgb) / 0.2)" }}
                            >
                              <div className="font-song text-xs text-daiqing font-medium line-clamp-1">
                                {e.question}
                              </div>
                              <div className="mt-0.5 font-song text-[11px] text-qingbi/60 leading-relaxed line-clamp-2">
                                {e.answer}
                              </div>
                              <div className="mt-1 flex items-center gap-2 font-song text-[9px] text-qingbi/45 tracking-wider">
                                <span>{e.source === "seed" ? "预置" : e.source === "llm" ? "蒸馏" : e.source === "manual" ? "手录" : "外接"}</span>
                                {e.hits > 0 && <span>· 引{e.hits}</span>}
                                {e.origin && <span className="line-clamp-1">· {e.origin}</span>}
                              </div>
                              {/* 删除 · 仅 user/external · hover 显现 */}
                              {canDelete && (
                                <button
                                  type="button"
                                  onClick={() => void handleDelete(e.id)}
                                  className="absolute top-1.5 right-1.5 w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-zhusha/15 transition-all"
                                  style={{ borderRadius: "2px" }}
                                  aria-label="移出典籍"
                                  title="移出典籍"
                                >
                                  <svg viewBox="0 0 12 12" className="w-3 h-3 text-qingbi/50 hover:text-zhusha" aria-hidden="true">
                                    <path d="M3,3 L9,9 M9,3 L3,9" stroke="currentColor" strokeWidth="1" fill="none" strokeLinecap="round" />
                                  </svg>
                                </button>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 底部 · 累计库导出/导入 · 外接库清空 */}
      <div className="px-4 py-2.5 border-t border-qingbi/15 bg-qingbi/5">
        <div className="flex items-center justify-between gap-2">
          <span className="font-song text-[10px] text-qingbi/50 tracking-widest">
            典籍阁 · {meta.brand}藏
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => void handleExport()}
              disabled={stats.user === 0}
              className="px-2 py-1 font-song text-[10px] text-qingbi/70 hover:text-daiqing hover:bg-xuanzhi-deep/60 border border-qingbi/15 hover:border-qingbi/40 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ borderRadius: "2px" }}
              title="导出累计库为 JSON 备份"
            >
              导出
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-2 py-1 font-song text-[10px] text-qingbi/70 hover:text-daiqing hover:bg-xuanzhi-deep/60 border border-qingbi/15 hover:border-qingbi/40 transition-all"
              style={{ borderRadius: "2px" }}
              title="导入 JSON 恢复累计库"
            >
              导入
            </button>
            {stats.external > 0 && (
              <button
                type="button"
                onClick={() => void clearExternal()}
                className="px-2 py-1 font-song text-[10px] text-qingbi/50 hover:text-zhusha hover:bg-zhusha/10 border border-qingbi/15 transition-all"
                style={{ borderRadius: "2px" }}
                title="清空外接库缓存（不删除 vault 文件）"
              >
                清外接
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  await handleImport(file);
                  e.target.value = "";
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
