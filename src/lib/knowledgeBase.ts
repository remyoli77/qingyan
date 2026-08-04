// 华夏知识库 · IndexedDB 封装 · 六大主题分区
// 主题：shici 诗词 / shuhua 书画 / chadao 茶道 / jieqi 节气 / guqin 古琴 / wendao 问道
// 兼容模式（首页飞书）传 topic=null 表示贯通查所有主题
// 双层库结构：
//   seed     — 预置种子知识，只读不可改（source: seed）
//   user     — 用户累计库，蒸馏补入 + 显式入库（source: llm 或 manual）
//   external — 外接库，Obsidian/Markdown 导入（source: external）

export type KBTopic = "shici" | "shuhua" | "chadao" | "jieqi" | "guqin" | "wendao";
export type KBLibrary = "seed" | "user" | "external";

export interface KBEntry {
  id: string;
  topic: KBTopic;          // 所属主题
  question: string;        // 问题/关键词
  answer: string;          // 知识正文
  source: "seed" | "llm" | "manual" | "external";  // seed 预置 / llm 蒸馏 / manual 显式入库 / external 外接
  library: KBLibrary;      // 所属库 · seed 只读 / user 可读写 / external 外接
  origin?: string;         // 外接库专用 · 来源标识 "obsidian:vault名" 或文件路径
  quality: number;         // 质量分 0-1 · 蒸馏用
  hits: number;            // 命中次数
  createdAt: number;
  updatedAt: number;
  tags?: string[];         // 蒸馏分类标签
}

const DB_NAME = "qingyan-kb";
const DB_VERSION = 2;
const STORE = "entries";

// —— IndexedDB 基础 ——
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (event) => {
      const db = req.result;
      const oldVersion = event.oldVersion;
      if (!db.objectStoreNames.contains(STORE)) {
        // v1 → v2 新建
        const os = db.createObjectStore(STORE, { keyPath: "id" });
        os.createIndex("topic", "topic", { unique: false });
        os.createIndex("question", "question", { unique: false });
        os.createIndex("library", "library", { unique: false });
      } else if (oldVersion < 2) {
        // v1 → v2 迁移 · 为旧条目补 library 字段
        const os = req.transaction!.objectStore(STORE);
        if (!os.indexNames.contains("library")) {
          os.createIndex("library", "library", { unique: false });
        }
        const cursorReq = os.openCursor();
        cursorReq.onsuccess = () => {
          const cursor = cursorReq.result;
          if (!cursor) return;
          const value = cursor.value as KBEntry & { library?: KBLibrary };
          if (!value.library) {
            // 旧数据按 source 推断 library
            value.library = value.source === "seed" ? "seed" : "user";
            cursor.update(value);
          }
          cursor.continue();
        };
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function tx<T>(mode: IDBTransactionMode, fn: (os: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const t = db.transaction(STORE, mode);
    const os = t.objectStore(STORE);
    const req = fn(os);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
    t.oncomplete = () => db.close();
  });
}

// —— 查询 —— 简易关键词匹配 + 相关度排序
// 主题模式：仅查指定主题；兼容模式 topic=null 查所有
// library: 指定库可缩小范围 · null 查全部（seed+user+external 都参与检索）
export async function queryKB(
  topic: KBTopic | null,
  query: string,
  limit = 3,
  library?: KBLibrary | null,
): Promise<KBEntry[]> {
  const all = await tx<KBEntry[]>("readonly", (os) => os.getAll() as IDBRequest<KBEntry[]>);
  const q = query.toLowerCase();
  const tokens = q.split(/\s+|[，。、！？；：]/).filter((t) => t.length > 1);

  const scored = all
    .filter((e) => !topic || e.topic === topic)
    .filter((e) => !library || e.library === library)
    .map((e) => {
      const text = (e.question + " " + e.answer + " " + (e.tags || []).join(" ")).toLowerCase();
      let score = 0;
      // 整句包含
      if (text.includes(q)) score += 3;
      // 关键词命中
      for (const tk of tokens) {
        if (text.includes(tk)) score += 1;
      }
      // 质量分加权 · seed 库加权更高（可信度强）
      const libBoost = e.library === "seed" ? 0.6 : e.library === "external" ? 0.55 : 0.4;
      score += e.quality * libBoost;
      return { e, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  // 命中数 +1 · 异步不阻塞
  scored.forEach(({ e }) => {
    e.hits += 1;
    e.updatedAt = Date.now();
    void tx("readwrite", (os) => os.put(e));
  });

  return scored.map((x) => x.e);
}

// —— 补齐 —— 大模型兜底后写入 · 默认入 user 库
export async function addToKB(
  topic: KBTopic,
  question: string,
  answer: string,
  source: "seed" | "llm" | "manual" | "external" = "llm",
  tags?: string[],
  opts?: { library?: KBLibrary; origin?: string },
): Promise<void> {
  const library: KBLibrary = opts?.library ?? (source === "seed" ? "seed" : source === "external" ? "external" : "user");
  const entry: KBEntry = {
    id: `kb-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    topic,
    question: question.slice(0, 200),
    answer,
    source,
    library,
    origin: opts?.origin,
    quality: source === "seed" ? 0.9 : source === "external" ? 0.7 : 0.6,
    hits: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    tags,
  };
  await tx("readwrite", (os) => os.add(entry));
}

// —— 显式入库 · 用户在回复下方点「收入典籍」确认 · 入 user 库
export async function confirmToKB(
  topic: KBTopic,
  question: string,
  answer: string,
  tags?: string[],
): Promise<void> {
  await addToKB(topic, question, answer, "manual", tags, { library: "user" });
}

// —— 按库列出全部条目 · 典籍阁浏览用
export async function listLibrary(library?: KBLibrary | null): Promise<KBEntry[]> {
  const all = await tx<KBEntry[]>("readonly", (os) => os.getAll() as IDBRequest<KBEntry[]>);
  const scope = library ? all.filter((e) => e.library === library) : all;
  // 按更新时间倒序 · 高频命中靠前
  return scope.sort((a, b) => b.updatedAt - a.updatedAt);
}

// —— 删除条目 · 仅允许删 user / external 库 · seed 不可删
export async function removeEntry(id: string): Promise<boolean> {
  const all = await tx<KBEntry[]>("readonly", (os) => os.getAll() as IDBRequest<KBEntry[]>);
  const target = all.find((e) => e.id === id);
  if (!target || target.library === "seed") return false;
  await tx("readwrite", (os) => os.delete(id));
  return true;
}

// —— 导出 · 仅导出 user + external · seed 为应用自带不入备份
export async function exportLibrary(): Promise<string> {
  const all = await listLibrary();
  const exportable = all.filter((e) => e.library !== "seed");
  return JSON.stringify({
    version: 1,
    exportedAt: Date.now(),
    entries: exportable,
  }, null, 2);
}

// —— 导入 · 合并到 user 库 · 同 question 覆盖
export async function importLibrary(json: string): Promise<{ imported: number; skipped: number }> {
  let data: { entries?: KBEntry[] };
  try {
    data = JSON.parse(json);
  } catch {
    return { imported: 0, skipped: 0 };
  }
  if (!Array.isArray(data.entries)) return { imported: 0, skipped: 0 };

  const all = await listLibrary();
  const existingQ = new Set(all.map((e) => e.question));
  let imported = 0;
  let skipped = 0;
  for (const e of data.entries) {
    if (!e.topic || !e.question || !e.answer) { skipped++; continue; }
    if (existingQ.has(e.question)) { skipped++; continue; }
    // 统一标为 user 库 manual 来源 · 跨设备导入
    await addToKB(e.topic, e.question, e.answer, "manual", e.tags, { library: "user" });
    imported++;
  }
  return { imported, skipped };
}

// 批量补种子
export async function seedBatch(entries: Omit<KBEntry, "id" | "hits" | "createdAt" | "updatedAt">[]): Promise<void> {
  const now = Date.now();
  const full: KBEntry[] = entries.map((e, i) => ({
    ...e,
    id: `kb-seed-${e.topic}-${i}-${Math.random().toString(36).slice(2, 6)}`,
    hits: 0,
    createdAt: now,
    updatedAt: now,
  }));
  await tx("readwrite", (os) => {
    full.forEach((e) => os.put(e));
    return os.getAll(); // dummy request for tx return
  });
}

// —— 蒸馏 · 去重 + 质量重估 + 标签归类 ——
// 规则：相似度高的合并保留质量分高的；低命中且低质量的删除
// 保护：seed 库（预置只读）与 external 库（外接导入）永不裁汰 · 仅蒸馏 user 库
export async function distillKB(topic?: KBTopic): Promise<{ merged: number; pruned: number }> {
  const all = await tx<KBEntry[]>("readonly", (os) => os.getAll() as IDBRequest<KBEntry[]>);
  // 仅对 user 库做蒸馏 · seed/external 原样保留
  const scope = all.filter((e) => e.library === "user");
  const scopedTopic = topic ? scope.filter((e) => e.topic === topic) : scope;
  if (scopedTopic.length === 0) return { merged: 0, pruned: 0 };

  let merged = 0;
  let pruned = 0;
  const survivors: KBEntry[] = [];

  // 按 question 相似度分组（简易：question 前 12 字相同视为同类）
  const groups = new Map<string, KBEntry[]>();
  scopedTopic.forEach((e) => {
    const key = e.question.slice(0, 12);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(e);
  });

  groups.forEach((group) => {
    if (group.length === 1) {
      // 唯一条 · 低命中低质量裁汰
      const e = group[0];
      if (e.hits === 0 && e.quality < 0.5 && e.source === "llm" && Date.now() - e.createdAt > 86400000) {
        pruned++;
        return;
      }
      survivors.push(e);
      return;
    }
    // 多条相似 · 取质量分最高者，合并其余的 hits 与 tags
    group.sort((a, b) => b.quality - a.quality);
    const keep = group[0];
    const tagSet = new Set<string>(keep.tags || []);
    for (let i = 1; i < group.length; i++) {
      keep.hits += group[i].hits;
      (group[i].tags || []).forEach((t) => tagSet.add(t));
      merged++;
    }
    keep.tags = Array.from(tagSet);
    // 命中越多质量微升
    keep.quality = Math.min(1, keep.quality + keep.hits * 0.02);
    keep.updatedAt = Date.now();
    survivors.push(keep);
  });

  // 重写 store · 删除被裁汰的，更新保留的
  const survivorIds = new Set(survivors.map((s) => s.id));
  const toDelete = scopedTopic.filter((e) => !survivorIds.has(e.id));
  await tx("readwrite", (os) => {
    toDelete.forEach((e) => os.delete(e.id));
    survivors.forEach((e) => os.put(e));
    return os.getAll();
  });

  return { merged, pruned };
}

// —— 统计 · 分库 + 分来源 · 典籍阁/调试用 ——
export async function kbStats(topic?: KBTopic): Promise<{
  total: number;
  bySource: Record<string, number>;
  byLibrary: Record<KBLibrary, number>;
}> {
  const all = await tx<KBEntry[]>("readonly", (os) => os.getAll() as IDBRequest<KBEntry[]>);
  const scope = topic ? all.filter((e) => e.topic === topic) : all;
  const bySource: Record<string, number> = {};
  const byLibrary: Record<KBLibrary, number> = { seed: 0, user: 0, external: 0 };
  scope.forEach((e) => {
    bySource[e.source] = (bySource[e.source] || 0) + 1;
    byLibrary[e.library] = (byLibrary[e.library] || 0) + 1;
  });
  return { total: scope.length, bySource, byLibrary };
}
