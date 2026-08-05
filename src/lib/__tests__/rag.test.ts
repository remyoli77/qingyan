import { describe, expect, it } from "vitest";
import { distillAnswer, filterCitedHits } from "@/lib/rag";
import type { KBEntry } from "@/lib/knowledgeBase";

const entry = (partial: Partial<KBEntry>): KBEntry => ({
  id: "1",
  topic: "shici",
  question: "q",
  answer: "a",
  source: "seed",
  library: "seed",
  quality: 0.9,
  hits: 0,
  createdAt: 0,
  updatedAt: 0,
  ...partial,
});

describe("distillAnswer · 蒸馏清洗", () => {
  it("去掉尾部「」引号落款", () => {
    expect(distillAnswer("此为正文。\n\n「青砚谨复」")).toBe("此为正文。");
  });

  it("去掉尾部〔〕式落款", () => {
    expect(distillAnswer("正文内容〔青花谨复〕")).toBe("正文内容");
  });

  it("去掉灵台未通标记", () => {
    expect(distillAnswer("〔灵台未通：超时〕\n\n正文")).toBe("正文");
  });

  it("超过 800 字截断并保留省略号", () => {
    const out = distillAnswer("字".repeat(900));
    expect(out.length).toBeLessThanOrEqual(801);
    expect(out.endsWith("…")).toBe(true);
  });
});

describe("filterCitedHits · 引用判定", () => {
  const hits = [
    entry({
      id: "a",
      question: "宋代点茶法",
      answer: "宋人点茶先炙茶碾茶罗茶得末，注汤调膏，以茶筅击拂生沫。",
    }),
  ];

  it("正文实质引用典据 → 命中", () => {
    const reply = "宋人点茶先炙茶碾茶罗茶得末，注汤调膏，以茶筅击拂生沫。此乃蔡襄《茶录》所载。";
    expect(filterCitedHits(reply, hits)).toHaveLength(1);
  });

  it("正文未引用 → 不命中", () => {
    const reply = "今日天朗气清，宜携琴访友。";
    expect(filterCitedHits(reply, hits)).toHaveLength(0);
  });

  it("问题核心词连续出现 ≥4 字 → 命中", () => {
    const reply = "聊点茶之法：宋代点茶法讲究注汤七次。";
    expect(filterCitedHits(reply, hits)).toHaveLength(1);
  });
});
