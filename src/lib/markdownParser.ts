// Markdown 解析 · 外接库专用 · 支持 frontmatter + 正文 → KBEntry
// Obsidian vault 的 md 通常含 YAML frontmatter（--- 包裹）+ 正文
// 解析规则：
//   - frontmatter 的 title / tags / topic 字段映射到 KBEntry
//   - 正文首段（前 200 字）作为 question，全文作为 answer
//   - 无 frontmatter 时，文件名作 question，正文作 answer

import type { KBEntry, KBTopic } from "@/lib/knowledgeBase";

// 简易字符串 hash · 浏览器端无 Buffer · 用于生成稳定 id
function simpleHash(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h).toString(36).slice(0, 12);
}

interface ParsedMd {
  frontmatter: Record<string, unknown>;
  content: string;
}

// 解析 frontmatter · 简易 YAML 子集 · 仅支持 key: value 与 key: [a, b]
export function parseMarkdown(raw: string): ParsedMd {
  const fm: Record<string, unknown> = {};
  let content = raw;

  // 检测 --- 开头的 frontmatter
  const fmMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (fmMatch) {
    const fmText = fmMatch[1];
    content = fmMatch[2];
    // 逐行解析 key: value
    for (const line of fmText.split(/\r?\n/)) {
      const m = line.match(/^(\w+)\s*:\s*(.*)$/);
      if (!m) continue;
      const key = m[1].trim();
      const val = m[2].trim();
      // 数组 [a, b, c]
      if (val.startsWith("[") && val.endsWith("]")) {
        fm[key] = val.slice(1, -1).split(",").map((s) => s.trim().replace(/^["']|["']$/g, "")).filter(Boolean);
      } else {
        fm[key] = val.replace(/^["']|["']$/g, "");
      }
    }
  }

  return { frontmatter: fm, content: content.trim() };
}

// 从 frontmatter 或正文推断主题 · 关键词匹配
function inferTopic(fm: Record<string, unknown>, content: string): KBTopic {
  const explicit = fm.topic as string | undefined;
  if (explicit && ["shici", "shuhua", "chadao", "jieqi", "guqin", "wendao"].includes(explicit)) {
    return explicit as KBTopic;
  }
  // 从标签推断
  const tags = Array.isArray(fm.tags) ? (fm.tags as string[]).join(" ") : "";
  const text = `${tags} ${content}`.toLowerCase();
  if (/(诗|词|赋|曲|律|绝句|韵)/.test(text)) return "shici";
  if (/(画|书法|笔墨|皴|山水|水墨|丹青)/.test(text)) return "shuhua";
  if (/(茶|点茶|煎茶|泡茶|盏|壶|茗)/.test(text)) return "chadao";
  if (/(节气|物候|立春|冬至|清明|霜降)/.test(text)) return "jieqi";
  if (/(琴|古琴|琴曲|减字谱|广陵)/.test(text)) return "guqin";
  return "wendao";
}

// md 文件 → KBEntry · 用于外接库读取
export function mdToEntry(
  raw: string,
  filePath: string,
  fileName: string,
  vaultName: string,
): KBEntry | null {
  const { frontmatter, content } = parseMarkdown(raw);
  if (!content || content.length < 5) return null;

  // question 优先取 frontmatter.title · 否则取正文首行 / 文件名
  const title = (frontmatter.title as string) || content.split(/\r?\n/)[0].slice(0, 80) || fileName.replace(/\.md$/, "");
  const topic = inferTopic(frontmatter, content);
  const tags = Array.isArray(frontmatter.tags) ? (frontmatter.tags as string[]) : undefined;

  return {
    id: `kb-ext-${vaultName}-${simpleHash(filePath)}`,
    topic,
    question: title.slice(0, 200),
    answer: content,
    source: "external",
    library: "external",
    origin: `obsidian:${vaultName}:${filePath}`,
    quality: 0.7,
    hits: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    tags,
  };
}

// KBEntry → md 文件内容 · 用于「收入典籍」写入 vault
export function entryToMd(question: string, answer: string, topic: KBTopic, tags?: string[]): string {
  const tagStr = tags && tags.length > 0 ? `\ntags: [${tags.join(", ")}]` : "";
  const date = new Date().toISOString().slice(0, 10);
  return `---
title: ${question}
topic: ${topic}
source: 青砚典籍阁
created: ${date}${tagStr}
---

${answer}
`;
}
