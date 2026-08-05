import { beforeEach, describe, expect, it } from "vitest";
import {
  addToKB,
  distillKB,
  kbStats,
  listLibrary,
  queryKB,
  removeEntry,
  seedBatch,
} from "@/lib/knowledgeBase";

// 每个用例前清空 IndexedDB · 保证互不污染
beforeEach(async () => {
  await new Promise<void>((resolve) => {
    const req = indexedDB.deleteDatabase("qingyan-kb");
    req.onsuccess = () => resolve();
    req.onerror = () => resolve();
    req.onblocked = () => resolve();
  });
});

describe("knowledgeBase · IndexedDB", () => {
  it("seedBatch 后 queryKB 按主题过滤并按相关度排序", async () => {
    await seedBatch([
      { topic: "shici", question: "七言绝句格律", answer: "七言绝句四句，每句七字，二四句必押韵。", source: "seed", library: "seed", quality: 0.95, tags: ["格律"] },
      { topic: "chadao", question: "宋代点茶法", answer: "宋人点茶，注汤调膏，以茶筅击拂生沫。", source: "seed", library: "seed", quality: 0.95, tags: ["点茶"] },
      { topic: "chadao", question: "斗茶之戏", answer: "斗茶比汤花咬盏之久暂，先现水痕者负。", source: "seed", library: "seed", quality: 0.8, tags: ["斗茶"] },
    ]);

    const shici = await queryKB("shici", "绝句", 5);
    expect(shici.length).toBe(1);
    expect(shici[0].question).toBe("七言绝句格律");

    const all = await queryKB(null, "点茶", 5);
    expect(all[0].topic).toBe("chadao");
    expect(all[0].question).toBe("宋代点茶法");
  });

  it("命中后 hits 计数自增", async () => {
    await addToKB("shici", "HITS-测试题", "HITS-测试答案内容", "manual", undefined, { library: "user" });
    await queryKB("shici", "HITS-测试题", 5);
    const all = await listLibrary("user");
    const hit = all.find((e) => e.question === "HITS-测试题");
    expect(hit).toBeDefined();
    expect(hit!.hits).toBeGreaterThanOrEqual(1);
  });

  it("distillKB 合并同前缀相似 user 条目", async () => {
    await addToKB("shici", "七言绝句格律相同前缀内容甲", "甲答案", "llm", undefined, { library: "user" });
    await addToKB("shici", "七言绝句格律相同前缀内容乙", "乙答案", "llm", undefined, { library: "user" });
    const res = await distillKB("shici");
    expect(res.merged).toBeGreaterThanOrEqual(1);
    const all = await listLibrary("user");
    const qs = all.filter((e) => e.question.startsWith("七言绝句格律相同前缀"));
    expect(qs.length).toBe(1);
  });

  it("removeEntry 可删 user 库、拒绝删 seed", async () => {
    await addToKB("shici", "REMOVE-测试", "内容", "manual", undefined, { library: "user" });
    const users = await listLibrary("user");
    const u = users.find((e) => e.question === "REMOVE-测试");
    expect(u).toBeDefined();
    expect(await removeEntry(u!.id)).toBe(true);

    await seedBatch([
      { topic: "shici", question: "SEED-测试", answer: "种子", source: "seed", library: "seed", quality: 0.9, tags: [] },
    ]);
    const seeds = (await listLibrary("seed")).filter((e) => e.question === "SEED-测试");
    expect(seeds.length).toBeGreaterThan(0);
    expect(await removeEntry(seeds[0].id)).toBe(false);
  });

  it("kbStats 分库统计", async () => {
    await addToKB("guqin", "STATS-琴", "内容", "manual", undefined, { library: "user" });
    const s = await kbStats();
    expect(s.byLibrary.user).toBeGreaterThanOrEqual(1);
    expect(s.bySource.manual).toBeGreaterThanOrEqual(1);
  });
});
