// 华夏知识库 · IndexedDB 封装 · 六大主题分区
// 主题：shici 诗词 / shuhua 书画 / chadao 茶道 / jieqi 节气 / guqin 古琴 / wendao 问道
// 兼容模式（首页飞书）传 topic=null 表示贯通查所有主题

export type KBTopic = "shici" | "shuhua" | "chadao" | "jieqi" | "guqin" | "wendao";

export interface KBEntry {
  id: string;
  topic: KBTopic;          // 所属主题
  question: string;        // 问题/关键词
  answer: string;          // 知识正文
  source: "seed" | "llm";  // seed 预置 / llm 大模型补齐
  quality: number;         // 质量分 0-1 · 蒸馏用
  hits: number;            // 命中次数
  createdAt: number;
  updatedAt: number;
  tags?: string[];         // 蒸馏分类标签
}

const DB_NAME = "qingyan-kb";
const DB_VERSION = 1;
const STORE = "entries";

// —— IndexedDB 基础 ——
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const os = db.createObjectStore(STORE, { keyPath: "id" });
        os.createIndex("topic", "topic", { unique: false });
        os.createIndex("question", "question", { unique: false });
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
export async function queryKB(
  topic: KBTopic | null,
  query: string,
  limit = 3,
): Promise<KBEntry[]> {
  const all = await tx<KBEntry[]>("readonly", (os) => os.getAll() as IDBRequest<KBEntry[]>);
  const q = query.toLowerCase();
  const tokens = q.split(/\s+|[，。、！？；：]/).filter((t) => t.length > 1);

  const scored = all
    .filter((e) => !topic || e.topic === topic)
    .map((e) => {
      const text = (e.question + " " + e.answer + " " + (e.tags || []).join(" ")).toLowerCase();
      let score = 0;
      // 整句包含
      if (text.includes(q)) score += 3;
      // 关键词命中
      for (const tk of tokens) {
        if (text.includes(tk)) score += 1;
      }
      // 质量分加权
      score += e.quality * 0.5;
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

// —— 补齐 —— 大模型兜底后写入
export async function addToKB(
  topic: KBTopic,
  question: string,
  answer: string,
  source: "seed" | "llm" = "llm",
  tags?: string[],
): Promise<void> {
  const entry: KBEntry = {
    id: `kb-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    topic,
    question: question.slice(0, 200),
    answer,
    source,
    quality: source === "seed" ? 0.9 : 0.6,
    hits: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    tags,
  };
  await tx("readwrite", (os) => os.add(entry));
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
export async function distillKB(topic?: KBTopic): Promise<{ merged: number; pruned: number }> {
  const all = await tx<KBEntry[]>("readonly", (os) => os.getAll() as IDBRequest<KBEntry[]>);
  const scope = topic ? all.filter((e) => e.topic === topic) : all;
  if (scope.length === 0) return { merged: 0, pruned: 0 };

  let merged = 0;
  let pruned = 0;
  const survivors: KBEntry[] = [];

  // 按 question 相似度分组（简易：question 前 12 字相同视为同类）
  const groups = new Map<string, KBEntry[]>();
  scope.forEach((e) => {
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
  const toDelete = scope.filter((e) => !survivorIds.has(e.id));
  await tx("readwrite", (os) => {
    toDelete.forEach((e) => os.delete(e.id));
    survivors.forEach((e) => os.put(e));
    return os.getAll();
  });

  return { merged, pruned };
}

// —— 统计 · 调试用 ——
export async function kbStats(topic?: KBTopic): Promise<{ total: number; bySource: Record<string, number> }> {
  const all = await tx<KBEntry[]>("readonly", (os) => os.getAll() as IDBRequest<KBEntry[]>);
  const scope = topic ? all.filter((e) => e.topic === topic) : all;
  const bySource: Record<string, number> = {};
  scope.forEach((e) => { bySource[e.source] = (bySource[e.source] || 0) + 1; });
  return { total: scope.length, bySource };
}
