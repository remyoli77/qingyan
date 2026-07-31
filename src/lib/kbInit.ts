// 知识库初始化 · 首次加载灌入种子知识
import { kbStats, seedBatch } from "@/lib/knowledgeBase";
import { seedKnowledge } from "@/data/seedKnowledge";

let initialized = false;

export async function ensureKBSeeded(): Promise<void> {
  if (initialized) return;
  initialized = true;
  try {
    const stats = await kbStats();
    // 若库为空或种子缺失 · 灌入种子
    if (stats.total < seedKnowledge.length * 0.5) {
      await seedBatch(seedKnowledge);
    }
  } catch {
    // IndexedDB 不可用等异常 · 静默
    initialized = false;
  }
}
