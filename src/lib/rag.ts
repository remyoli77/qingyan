// 华夏知识库 RAG 流程 · 主题模式 + 兼容模式
// 主题模式（六事雅赏入口）：库优先 → 大模型兜底 → 蒸馏总结 → 补齐缺失 → 触发蒸馏
// 兼容模式（首页飞书）：贯通查库 → 命中则引华夏知识点缀 → 否则纯大模型
import { queryKB, addToKB, distillKB, type KBTopic, type KBEntry } from "@/lib/knowledgeBase";
import { chatWithLLM } from "@/lib/llm";
import { DYNASTIES, useThemeStore } from "@/store/themeStore";

export type ChatMode = "compatible" | "topic";

export interface RagContext {
  mode: ChatMode;
  topic?: KBTopic;          // 主题模式时必传
  history: { role: "user" | "assistant"; content: string }[];
  query: string;
  onChunk?: (delta: string) => void;
}

export interface RagResult {
  text: string;
  ok: boolean;
  error?: string;
  source: "kb" | "llm" | "kb+llm" | "fallback";  // 知识来源
  kbHits?: KBEntry[];                              // 命中的知识条目
}

// 从大模型回复中蒸馏出有用的知识正文 · 用于补齐
function distillAnswer(query: string, raw: string): string {
  // 去除明显的前后缀寒暄与落款 · 取核心段落
  let t = raw.trim();
  // 去落款
  t = t.replace(/〔灵台[^〕]*〕/g, "").trim();
  // 若过长 · 取前 800 字
  if (t.length > 800) t = t.slice(0, 800) + "…";
  return t;
}

// 主题模式 · 严格 RAG
async function topicRag(ctx: RagContext): Promise<RagResult> {
  const { topic, query, history, onChunk } = ctx;
  if (!topic) return { text: "", ok: false, error: "主题未明", source: "fallback" };

  // 取当前朝代上下文
  const dynasty = useThemeStore.getState().dynasty;
  const meta = DYNASTIES[dynasty];
  const dynastyHint = `${meta.promptHint} 用户所问若涉此朝代，即以此朝代典制人物答之。`;

  // 1. 优先查主题知识库
  const hits = await queryKB(topic, query, 3);

  if (hits.length > 0) {
    // 命中 · 以知识为上下文让大模型润色总结
    const kbContext = hits
      .map((h, i) => `【典据${i + 1}】${h.question}\n${h.answer}`)
      .join("\n\n");

    const ragMessages = [
      ...history.slice(-4),
      {
        role: "user" as const,
        content: `[此刻朝代] ${dynastyHint}\n\n华夏知识库有如下典据，请据此回答用户所问「${query}」。\n\n${kbContext}\n\n要求：以典据为本，文风雅正，契合此刻朝代气韵，可适当引申，但不可背离典据。若典据不足以完全回答，可酌情补充。`,
      },
    ];

    const result = await chatWithLLM(ragMessages, onChunk);
    if (result.ok && result.text.trim()) {
      return { text: result.text, ok: true, source: "kb+llm", kbHits: hits };
    }
    // 大模型不通 · 直接用知识原文拼接回退
    const fallback = hits.map((h) => h.answer).join("\n\n");
    return {
      text: fallback,
      ok: true,
      source: "kb",
      kbHits: hits,
      error: result.error,
    };
  }

  // 2. 知识库未命中 · 大模型兜底查询 · 带上朝代上下文
  const result = await chatWithLLM(
    [
      ...history.slice(-4),
      { role: "user", content: `${query}\n\n[此刻朝代] ${dynastyHint}` },
    ],
    onChunk,
  );

  if (!result.ok || !result.text.trim()) {
    return { text: result.text, ok: false, error: result.error, source: "fallback" };
  }

  // 3. 蒸馏有用信息 · 补齐到主题知识库
  const distilled = distillAnswer(query, result.text);
  if (distilled.length > 20) {
    await addToKB(topic, query, distilled, "llm");
    // 补齐后即对该主题做一次蒸馏去重
    void distillKB(topic);
  }

  return { text: result.text, ok: true, source: "llm" };
}

// 兼容模式 · 知识库贯通 · 命中则点缀 · 否则纯大模型
async function compatibleRag(ctx: RagContext): Promise<RagResult> {
  const { query, history, onChunk } = ctx;

  // 取当前朝代上下文 · 提示大模型以该朝代为底色回答
  const dynasty = useThemeStore.getState().dynasty;
  const meta = DYNASTIES[dynasty];
  const dynastyHint = `${meta.promptHint} 用户所问若涉此朝代，即以此朝代典制人物答之。`;

  // 贯通查所有主题
  const hits = await queryKB(null, query, 2);

  if (hits.length > 0) {
    // 命中 · 把知识作为提示注入，但不强制约束
    const kbHint = hits
      .map((h) => `${h.question}：${h.answer}`)
      .join("\n");

    const messages = [
      ...history.slice(-4),
      {
        role: "user" as const,
        content: `${query}\n\n[此刻朝代] ${dynastyHint}\n\n[可参酌的华夏知识]\n${kbHint}\n\n请自然融入回答，不必照搬，但须契合此刻朝代气韵。`,
      },
    ];

    const result = await chatWithLLM(messages, onChunk);
    if (result.ok && result.text.trim()) {
      return { text: result.text, ok: true, source: "kb+llm", kbHits: hits };
    }
    return { text: result.text, ok: false, error: result.error, source: "fallback", kbHits: hits };
  }

  // 未命中 · 纯大模型 · 仍须带上朝代上下文
  const messages = [
    ...history.slice(-4),
    {
      role: "user" as const,
      content: `${query}\n\n[此刻朝代] ${dynastyHint}`,
    },
  ];
  const result = await chatWithLLM(messages, onChunk);
  return {
    text: result.text,
    ok: result.ok,
    error: result.error,
    source: result.ok ? "llm" : "fallback",
  };
}

export async function runRag(ctx: RagContext): Promise<RagResult> {
  if (ctx.mode === "topic") return topicRag(ctx);
  return compatibleRag(ctx);
}

// 会话内 idle 自清洗 · 浏览器关闭即停
let idleTimer: number | null = null;
let lastDistillTs = 0;

export function scheduleIdleDistill(): void {
  if (idleTimer) window.clearTimeout(idleTimer);
  idleTimer = window.setTimeout(async () => {
    // 至少间隔 60s 才再蒸馏 · 避免频繁
    if (Date.now() - lastDistillTs < 60000) return;
    lastDistillTs = Date.now();
    try {
      await distillKB();
    } catch {
      /* 静默 */
    }
    // 继续排下一轮
    scheduleIdleDistill();
  }, 30000);
}

export function cancelIdleDistill(): void {
  if (idleTimer) {
    window.clearTimeout(idleTimer);
    idleTimer = null;
  }
}
