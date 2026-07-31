import { create } from "zustand";
import type { MemoryEntry, Message, TaskPlan, TaskStatus, ThinkingTrace, TraceKind, IndexEntry } from "@/types";
import { pickReply, mockMemory, createWelcomeMessage } from "@/data/mockChat";
import { getTaskTemplate } from "@/data/features";
import { brushSpeedDelay, useSettingsStore } from "@/store/settingsStore";
import { runRag, scheduleIdleDistill, cancelIdleDistill, type ChatMode } from "@/lib/rag";
import type { KBTopic } from "@/lib/knowledgeBase";
import { DYNASTIES, useThemeStore } from "@/store/themeStore";
import { ambience } from "@/lib/ambience";

// 取当前朝代的欢迎消息 · 初始化 / 重置时调用
function currentWelcome(): Message {
  const dynasty = useThemeStore.getState().dynasty;
  const meta = DYNASTIES[dynasty];
  return createWelcomeMessage(meta.brand);
}

interface ChatState {
  messages: Message[];
  taskPlan: TaskPlan | null;
  memory: MemoryEntry[];
  isThinking: boolean;
  activeTool: Message["toolInvokes"] | null;
  traces: ThinkingTrace[];      // 研思录 · 思考链
  hasNewTrace: boolean;         // 有新记录未查看
  indexEntries: IndexEntry[];   // 案头索引 · 按问题归目
  mode: ChatMode;          // compatible 兼容 / topic 主题
  topic?: KBTopic;         // 主题模式时

  initConversation: (initialQuery?: string, mode?: ChatMode, topic?: KBTopic) => void;
  sendUserMessage: (text: string) => void;
  resetConversation: () => void;
  setTaskStatus: (nodeId: string, status: TaskStatus) => void;
  addTrace: (kind: TraceKind, title: string, detail: string, status?: TaskStatus) => void;
  markTracesRead: () => void;
}

let msgSeq = 0;
let traceSeq = 0;
const nextId = () => `m-${Date.now()}-${msgSeq++}`;
const nextTraceId = () => `t-${Date.now()}-${traceSeq++}`;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  taskPlan: null,
  memory: mockMemory,
  isThinking: false,
  activeTool: null,
  traces: [],
  hasNewTrace: false,
  indexEntries: [],
  mode: "compatible" as ChatMode,
  topic: undefined,

  initConversation: (initialQuery, mode, topic) => {
    set({
      messages: [currentWelcome()],
      taskPlan: null,
      isThinking: false,
      activeTool: null,
      traces: [],
      hasNewTrace: false,
      indexEntries: [],
      mode: mode ?? "compatible",
      topic,
    });
    // 启动 idle 自清洗
    scheduleIdleDistill();
    if (initialQuery) {
      // 等一拍再发，避免初始化闪烁
      setTimeout(() => get().sendUserMessage(initialQuery), 400);
    }
  },

  sendUserMessage: (text) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMsg: Message = {
      id: nextId(),
      role: "user",
      content: trimmed,
      timestamp: Date.now(),
    };

    set((s) => ({ messages: [...s.messages, userMsg], isThinking: true, traces: [], hasNewTrace: false }));
    ambience.brushSend();

    // 选任务模板 · 主题模式优先用主题模板 · 否则按关键词推断
    const state = get();
    const tplId = state.topic ?? inferTemplate(trimmed);
    const plan = clonePlan(getTaskTemplate(tplId));
    plan.query = trimmed;
    set({ taskPlan: plan });

    // 异步推进任务节点 + 工具调用 + RAG 回信
    void runAgentPipeline(trimmed, set, plan, state.mode, state.topic);
  },

  resetConversation: () => {
    cancelIdleDistill();
    set({ messages: [currentWelcome()], taskPlan: null, isThinking: false, activeTool: null, traces: [], hasNewTrace: false, indexEntries: [] });
  },

  addTrace: (kind, title, detail, status) => {
    set((s) => ({
      traces: [...s.traces, { id: nextTraceId(), kind, title, detail, status, ts: Date.now() }],
      hasNewTrace: true,
    }));
  },

  markTracesRead: () => set({ hasNewTrace: false }),

  setTaskStatus: (nodeId, status) => {
    set((s) => {
      if (!s.taskPlan) return {};
      const nodes = s.taskPlan.nodes.map((n) =>
        n.id === nodeId ? { ...n, status } : n,
      );
      return { taskPlan: { ...s.taskPlan, nodes } };
    });
  },
}));

// 关键词推断任务模板 · 返回 KBTopic 或 "default"
function inferTemplate(query: string): string {
  if (/(绝句|七言|五言|诗|词|韵|赋|曲|律)/.test(query)) return "shici";
  if (/(范宽|画|笔法|构图|溪山|皴|墨|山水)/.test(query)) return "shuhua";
  if (/(点茶|茶道|茶|普洱|龙井|盏|壶|盏)/.test(query)) return "chadao";
  if (/(霜降|节气|养生|立春|冬至|清明|夏至|物候)/.test(query)) return "jieqi";
  if (/(广陵散|古琴|琴曲|琴|减字谱|嵇康)/.test(query)) return "guqin";
  if (/(雅集|策划|请帖|菜单|焚香|插花|挂画)/.test(query)) return "wendao";
  return "default";
}

// 推断问题归属主题 · 兼容模式用 · default 归问道
function inferTopic(query: string): KBTopic {
  const t = inferTemplate(query);
  return (t === "default" ? "wendao" : t) as KBTopic;
}

// 剥离 <think>...</think> 标签 · 返回正文与思考内容
function stripThinkTags(text: string): { content: string; thinking: string } {
  let content = "";
  let thinking = "";
  let rest = text;
  while (rest.length > 0) {
    const start = rest.indexOf("<think>");
    if (start === -1) {
      content += rest;
      break;
    }
    content += rest.slice(0, start);
    rest = rest.slice(start + 7);
    const end = rest.indexOf("</think>");
    if (end === -1) {
      thinking += rest;
      break;
    }
    thinking += rest.slice(0, end);
    rest = rest.slice(end + 8);
  }
  return { content: content.trim(), thinking: thinking.trim() };
}

function clonePlan(plan: TaskPlan): TaskPlan {
  return {
    ...plan,
    nodes: plan.nodes.map((n) => ({ ...n, status: "pending" as TaskStatus })),
  };
}

// 异步推进：依次点亮任务节点 + 展示工具调用 + RAG 流式回信
type SetFn = {
  (partial: Partial<ChatState>): void;
  (fn: (s: ChatState) => Partial<ChatState>): void;
};
async function runAgentPipeline(
  query: string,
  set: SetFn,
  plan: TaskPlan,
  mode: ChatMode,
  topic?: KBTopic,
) {
  const pack = pickReply(query);
  const addTrace = useChatStore.getState().addTrace;
  // 思考环境音 · 按当前朝代循环 · 至回信完成停止
  ambience.startThinking(useThemeStore.getState().dynasty);

  // 第一阶段：依次推进任务节点（思考链入 trace · 对话流不再渲染）
  for (let i = 0; i < plan.nodes.length; i++) {
    set({ taskPlan: { ...plan, nodes: plan.nodes.map((n, idx) => idx === i ? { ...n, status: "running" } : n) } });
    addTrace("node", plan.nodes[i].title, plan.nodes[i].description, "running");
    const tool = pack.toolInvokes?.[i % Math.max(1, pack.toolInvokes.length)];
    if (tool) {
      set({ activeTool: [tool] });
      addTrace("tool", tool.label, tool.detail);
    }
    await sleep(900);
    set({ taskPlan: { ...plan, nodes: plan.nodes.map((n, idx) => idx === i ? { ...n, status: "done" } : n) } });
    addTrace("node", plan.nodes[i].title, plan.nodes[i].description, "done");
    await sleep(250);
  }

  set({ activeTool: null });

  // 第二阶段：RAG 回信
  const state = useChatStore.getState();
  const history = state.messages
    .filter((m) => m.role === "user" || m.role === "agent")
    .filter((m) => !m.streaming)
    .map((m) => ({
      role: (m.role === "user" ? "user" : "assistant") as "user" | "assistant",
      content: m.content,
    }));

  const agentId = nextId();
  // 消息创建时不预设 citations · 典据须与 RAG 实际命中内容一致 · 待检索完成后回填
  set((s) => ({
    messages: [
      ...s.messages,
      {
        id: agentId,
        role: "agent",
        content: "",
        timestamp: Date.now(),
        toolInvokes: pack.toolInvokes,
        streaming: true,
      } as Message,
    ],
  }));

  const baseDelay = brushSpeedDelay[useSettingsStore.getState().brushSpeed];

  let finalText = "";
  let streamed = false;

  // <think> 标签解析状态机 · 思考内容入 thinking 字段 · 正文入 content
  let thinkBuf = "";          // 累积原始流 · 用于跨 chunk 的标签匹配
  let inThink = false;        // 是否处于 <think>...</think> 内
  let thinkingAcc = "";       // 累积思考内容

  // 增量解析 · 返回 { thinkDelta, contentDelta }
  function parseThinkDelta(delta: string): { thinkDelta: string; contentDelta: string } {
    thinkBuf += delta;
    let thinkDelta = "";
    let contentDelta = "";

    while (thinkBuf.length > 0) {
      if (inThink) {
        // 寻找结束标签 </think>
        const endIdx = thinkBuf.indexOf("</think>");
        if (endIdx === -1) {
          // 未找到结束 · 但需保留末尾可能匹配 "</think" 前缀的部分
          const safeLen = thinkBuf.length - 7; // "</think".length === 7
          if (safeLen > 0) {
            thinkDelta += thinkBuf.slice(0, safeLen);
            thinkBuf = thinkBuf.slice(safeLen);
          } else {
            // 全部保留 · 等下一 chunk
            break;
          }
        } else {
          // 找到结束 · 取之前的思考内容
          thinkDelta += thinkBuf.slice(0, endIdx);
          thinkBuf = thinkBuf.slice(endIdx + 8); // 跳过 "</think>"
          inThink = false;
        }
      } else {
        // 寻找开始标签 <think>
        const startIdx = thinkBuf.indexOf("<think>");
        if (startIdx === -1) {
          // 未找到开始 · 保留末尾可能匹配 "<think" 前缀的部分
          const safeLen = thinkBuf.length - 6; // "<think".length === 6
          if (safeLen > 0) {
            contentDelta += thinkBuf.slice(0, safeLen);
            thinkBuf = thinkBuf.slice(safeLen);
          } else {
            break;
          }
        } else {
          // 找到开始 · 之前的为正文
          contentDelta += thinkBuf.slice(0, startIdx);
          thinkBuf = thinkBuf.slice(startIdx + 7); // 跳过 "<think>"
          inThink = true;
        }
      }
    }

    return { thinkDelta, contentDelta };
  }

  try {
    const result = await runRag({
      mode,
      topic,
      history,
      query,
      onChunk: (delta) => {
        streamed = true;
        const { thinkDelta, contentDelta } = parseThinkDelta(delta);
        if (thinkDelta || contentDelta) {
          set((s) => ({
            messages: s.messages.map((m) => {
              if (m.id !== agentId) return m;
              const newThinking = thinkDelta ? (m.thinking || "") + thinkDelta : m.thinking;
              const newContent = contentDelta ? (m.content || "") + contentDelta : m.content;
              return {
                ...m,
                thinking: newThinking,
                content: newContent,
                hasThinking: !!(newThinking && newThinking.trim()),
              };
            }),
          }));
        }
      },
    });

    if (result.ok && result.text.trim()) {
      finalText = result.text;
      // 非流式结果 · 也需剥离 <think> 标签
      if (!streamed) {
        const parsed = stripThinkTags(finalText);
        thinkingAcc = parsed.thinking;
        finalText = parsed.content;
      }
      // RAG 来源入思考链
      if (result.source === "kb+llm" && result.kbHits) {
        addTrace("kb", "叩问典籍", `命中 ${result.kbHits.length} 条 · ${result.kbHits.map((h) => h.question).join("、")}`);
      } else if (result.source === "kb" && result.kbHits) {
        addTrace("kb", "典籍直引", result.kbHits.map((h) => h.question).join("、"));
      } else if (result.source === "llm") {
        addTrace("llm", "灵台运思", mode === "topic" ? `典籍未载 · 问于灵台 · 已蒸馏补齐${topic ? `·${topic}` : ""}` : "典籍未载 · 问于灵台");
      }
      // 主题模式命中知识库 · 在文末附典据标注
      if (mode === "topic" && result.kbHits && result.kbHits.length > 0) {
        const citeLabel = `\n\n〔典据：${result.kbHits.map((h) => h.question).join(" · ")}〕`;
        finalText += citeLabel;
        if (!streamed) {
          // 非流式 · 后续按字补写时带上
        } else {
          // 流式已写完正文 · 直接追加标注
          set((s) => ({
            messages: s.messages.map((m) =>
              m.id === agentId ? { ...m, content: m.content + citeLabel } : m,
            ),
          }));
        }
      }
      // 写入案头索引 · 按问题归属主题归目
      const inferredTopic: KBTopic = topic ?? inferTopic(query);
      const citations = (result.kbHits ?? []).map((h) => ({
        source: h.question,
        snippet: h.answer.slice(0, 60),
      }));
      // 以 RAG 实际命中回填消息 citations · 典据与正文真实关联 · 无命中则不显典据区
      set((s) => ({
        messages: s.messages.map((m) =>
          m.id === agentId
            ? { ...m, citations: citations.length > 0 ? citations : undefined }
            : m,
        ),
      }));
      set((s) => ({
        indexEntries: [
          ...s.indexEntries,
          {
            id: `idx-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            query,
            topic: inferredTopic,
            citations,
            ts: Date.now(),
          },
        ],
      }));
    } else if (!result.ok) {
      finalText = `〔灵台未通：${result.error}〕\n\n${pack.content}`;
      addTrace("llm", "灵台未通", result.error ?? "调用异常");
      // 灵台不通 · 回退预设内容 · 典据用预设以保一致
      set((s) => ({
        messages: s.messages.map((m) =>
          m.id === agentId ? { ...m, citations: pack.citations } : m,
        ),
      }));
    }
  } catch {
    finalText = `〔灵台未通：调用异常〕\n\n${pack.content}`;
    set((s) => ({
      messages: s.messages.map((m) =>
        m.id === agentId ? { ...m, citations: pack.citations } : m,
      ),
    }));
  }

  // 非流式或失败回退 · 按字流式补写
  if (!streamed && finalText) {
    const chars = Array.from(finalText);
    for (let i = 0; i < chars.length; i++) {
      const slice = chars.slice(0, i + 1).join("");
      set((s) => ({
        messages: s.messages.map((m) => (m.id === agentId ? {
          ...m,
          content: slice,
          thinking: thinkingAcc || undefined,
          hasThinking: !!(thinkingAcc && thinkingAcc.trim()),
        } : m)),
      }));
      const ch = chars[i];
      const delay = /[，。！？\n、；：〕〔]/.test(ch) ? baseDelay * 2.5 : baseDelay;
      await sleep(delay);
    }
  }

  set((s) => ({
    messages: s.messages.map((m) => (m.id === agentId ? {
      ...m,
      streaming: false,
      // 确保思考内容最终落盘
      thinking: m.thinking || thinkingAcc || undefined,
      hasThinking: !!((m.thinking || thinkingAcc) && (m.thinking || thinkingAcc).trim()),
    } : m)),
    isThinking: false,
  }));
  // 回信完成 · 停思考环境音 + 一声清磬
  ambience.stopThinking();
  ambience.chime();

  // 追加记忆 · 主题模式标注主题
  set((s) => ({
    memory: [
      {
        id: `mem-${Date.now()}`,
        label: topic ? `${topicLabel(topic)}` : "新记",
        content: `方才所问：${query.slice(0, 18)}${query.length > 18 ? "…" : ""}`,
        ts: Date.now(),
      },
      ...s.memory,
    ].slice(0, 8),
  }));
}

function topicLabel(t: KBTopic): string {
  const m: Record<KBTopic, string> = {
    shici: "诗词", shuhua: "书画", chadao: "茶道",
    jieqi: "节气", guqin: "古琴", wendao: "问道",
  };
  return m[t] ?? "新记";
}
