// 对话页 — 左侧案头翰墨索引 + 中间信笺对话流 + 右侧行军图/手札记忆
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import TaskScroll from "@/components/TaskScroll";
import MemoryPanel from "@/components/MemoryPanel";
import DeskIndex from "@/components/DeskIndex";
import LibraryScroll from "@/components/LibraryScroll";
import BambooSlip from "@/components/BambooSlip";
import LetterPaper from "@/components/LetterPaper";
import ToolInvoke from "@/components/ToolInvoke";
import ScrollInput from "@/components/ScrollInput";
import TraceDrawer from "@/components/TraceDrawer";
import { useChatStore } from "@/store/chatStore";
import { getFeatures } from "@/data/features";
import type { KBTopic } from "@/lib/knowledgeBase";
import { useDynastyMeta, useThemeStore } from "@/store/themeStore";
import ThinkingIcon from "@/components/ThinkingIcon";

type SidePanel = "task" | "memory";

export default function Chat({ onOpenSettings }: { onOpenSettings?: () => void }) {
  const params = useParams<{ topic?: string }>();
  const location = useLocation();
  const initialQueryFromState = (location.state as { initialQuery?: string } | null)?.initialQuery;

  const messages = useChatStore((s) => s.messages);
  const taskPlan = useChatStore((s) => s.taskPlan);
  const memory = useChatStore((s) => s.memory);
  const isThinking = useChatStore((s) => s.isThinking);
  const activeTool = useChatStore((s) => s.activeTool);
  const traces = useChatStore((s) => s.traces);
  const hasNewTrace = useChatStore((s) => s.hasNewTrace);
  const indexEntries = useChatStore((s) => s.indexEntries);
  const currentTopic = useChatStore((s) => s.topic);
  const markTracesRead = useChatStore((s) => s.markTracesRead);
  const initConversation = useChatStore((s) => s.initConversation);
  const sendUserMessage = useChatStore((s) => s.sendUserMessage);

  const [sidePanel, setSidePanel] = useState<SidePanel>("task");
  const [leftPanel, setLeftPanel] = useState<"desk" | "library">("desk");
  const [archiveTick, setArchiveTick] = useState(0);
  const [connectTick, setConnectTick] = useState(0);
  const [traceOpen, setTraceOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const didInitRef = useRef(false);
  const meta = useDynastyMeta();
  const dynasty = useThemeStore((s) => s.dynasty);

  // 初始化对话：若从多宝阁带 topic 进入，预设初始 query + 主题模式
  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;

    const feature = params.topic ? getFeatures(meta.id).find((f) => f.id === params.topic) : null;
    const initial = initialQueryFromState ?? feature?.initialQuery;
    // 有 topic = 主题模式 · 无 topic = 兼容模式
    const mode = feature ? "topic" : "compatible";
    const topic = feature?.id as KBTopic | undefined;
    initConversation(initial, mode, topic);
  }, [params.topic, initialQueryFromState, initConversation, meta.id]);

  // 消息变化时自动滚到底
  useLayoutEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, activeTool, isThinking]);

  // 收入典籍后 · 递增 archiveTick 触发典籍阁刷新
  const archivedCount = messages.filter((m) => m.archived).length;
  useEffect(() => {
    setArchiveTick((t) => t + 1);
  }, [archivedCount]);

  // AI 回复带 triggerConnect 标记 · 自动切到典籍阁 tab + 递增 connectTick 触发关联流程
  const triggerConnectMsg = messages.find((m) => m.triggerConnect);
  const triggerConnectId = triggerConnectMsg?.id;
  useEffect(() => {
    if (triggerConnectId) {
      setLeftPanel("library");
      setConnectTick((t) => t + 1);
    }
  }, [triggerConnectId]);

  function handleSend(text: string) {
    sendUserMessage(text);
  }

  function openTrace() {
    setTraceOpen(true);
    markTracesRead();
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar showBack onOpenSettings={onOpenSettings} />

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-6 py-5 grid grid-cols-1 lg:grid-cols-[260px_1fr] xl:grid-cols-[300px_1fr_280px] gap-5">
        {/* 左栏：案头 / 典籍阁 tab 切换（移动端折叠 · lg 起常驻） */}
        <aside className="hidden lg:block">
          <div className="sticky top-20 h-[calc(100vh-7rem)] bg-xuanzhi-light/60 border border-qingbi/20 shadow-card overflow-hidden flex flex-col" style={{ borderRadius: "2px" }}>
            {/* tab 切换 · 案头 / 典籍阁 */}
            <div className="flex gap-1 p-1 bg-qingbi/5 border-b border-qingbi/15">
              <button
                type="button"
                onClick={() => setLeftPanel("desk")}
                className={`flex-1 py-2 font-song text-xs tracking-widest transition-all duration-300 ${
                  leftPanel === "desk" ? "bg-qingbi text-xuanzhi-light shadow-seal" : "text-qingbi/70 hover:text-daiqing"
                }`}
                style={{ borderRadius: "2px" }}
              >
                案头
              </button>
              <button
                type="button"
                onClick={() => setLeftPanel("library")}
                className={`flex-1 py-2 font-song text-xs tracking-widest transition-all duration-300 ${
                  leftPanel === "library" ? "bg-qingbi text-xuanzhi-light shadow-seal" : "text-qingbi/70 hover:text-daiqing"
                }`}
                style={{ borderRadius: "2px" }}
              >
                典籍阁
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              {leftPanel === "desk" ? (
                <DeskIndex indexEntries={indexEntries} currentTopic={currentTopic} plan={taskPlan} />
              ) : (
                <LibraryScroll refreshTick={archiveTick} connectTick={connectTick} />
              )}
            </div>
          </div>
        </aside>

        {/* 中栏：对话流 */}
        <main className="flex flex-col min-h-[60vh]">
          <div className="flex-1 bg-xuanzhi-light/40 border border-qingbi/15 shadow-card flex flex-col" style={{ borderRadius: "2px" }}>
            {/* 对话区标题 · 含研思录入口 */}
            <div className="px-6 py-3 border-b border-qingbi/15 bg-qingbi/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="seal w-7 h-7 text-[10px] rotate-[-3deg]">对谈</span>
                <span className="font-song text-sm text-daiqing tracking-wider">与{meta.brand}清话</span>
              </div>
              <div className="flex items-center gap-3">
                {isThinking && (
                  <span className="font-song text-xs text-zheshi tracking-widest animate-inkBreathe">
                    · {meta.thinkingHint} ·
                  </span>
                )}
                {/* 研思录按钮 · 卷轴册页式 */}
                <button
                  onClick={openTrace}
                  className="relative flex items-center gap-1.5 px-2.5 py-1.5 border border-qingbi/25 hover:border-qingbi/50 hover:bg-qingbi/8 transition-all group"
                  style={{ borderRadius: "2px" }}
                  aria-label="研思录 · 思考链"
                >
                  <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 text-zheshi group-hover:rotate-90 transition-transform duration-500" aria-hidden="true">
                    <rect x="2" y="2" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.2" />
                    <path d="M5,5 L11,5 M5,8 L11,8 M5,11 L9,11" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
                  </svg>
                  <span className="font-song text-[11px] text-daiqing/80 group-hover:text-qingbi tracking-wider">研思录</span>
                  {/* 未读红点 · 朱印式 */}
                  {hasNewTrace && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-zhusha shadow-seal animate-inkBreathe" />
                  )}
                </button>
              </div>
            </div>

            {/* 消息流 · 含工具调用气泡与研思动画 */}
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5" style={{ maxHeight: "calc(100vh - 18rem)" }}>
              {/* 空状态 · 极端兜底（initConversation 通常会推欢迎语）· 研墨以待 */}
              {messages.length === 0 && !isThinking && (
                <div className="flex flex-col items-center justify-center py-16 opacity-70" aria-live="polite">
                  <svg viewBox="0 0 64 64" className="w-12 h-12 text-qingbi/40 mb-3" aria-hidden="true">
                    {/* 砚台 + 墨锭 · 静态简笔 */}
                    <ellipse cx="32" cy="42" rx="20" ry="6" fill="rgb(var(--c-daiqing-rgb) / 0.15)" />
                    <path d="M14,36 L50,36 L46,46 L18,46 Z" fill="rgb(var(--c-qingbi-rgb) / 0.18)" stroke="rgb(var(--c-qingbi-rgb) / 0.4)" strokeWidth="0.8" />
                    <ellipse cx="32" cy="40" rx="10" ry="2.5" fill="rgb(var(--c-daiqing-rgb) / 0.5)" />
                    <rect x="29" y="22" width="6" height="14" rx="1" fill="rgb(var(--c-daiqing-rgb) / 0.6)" />
                  </svg>
                  <span className="font-song text-sm text-qingbi/70 tracking-widest">研墨以待</span>
                  <span className="mt-1 font-song text-[10px] text-qingbi/50 tracking-widest">落笔所求 · 鸿雁将至</span>
                </div>
              )}

              {messages.map((m) => (
                <div key={m.id}>
                  {m.role === "user" ? (
                    <BambooSlip message={m} />
                  ) : (
                    <LetterPaper message={m} />
                  )}
                </div>
              ))}

              {/* 实时工具调用气泡 · 研墨/铺纸/翻书 */}
              {activeTool && activeTool.map((t, i) => (
                <ToolInvoke key={`tool-${i}`} tool={t} />
              ))}

              {/* 研思中提示 · 朝代专属器物动画 · 宋砚墨/明茶盏/秦竹简刻刀/唐风炉火 */}
              {isThinking && !activeTool && (
                <div className="flex justify-start animate-liftUp">
                  <div className="shrink-0 mr-3 w-10" />
                  <div className="inline-flex items-center gap-3 px-5 py-3 bg-qingbi/8 border border-qingbi/20" style={{ borderRadius: "2px" }}>
                    <ThinkingIcon dynasty={dynasty} />
                    <span className="font-song text-xs text-qingbi/70 tracking-wider animate-inkBreathe" style={{ animationDelay: "0.3s" }}>{meta.thinkingHint}中…</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* 输入区 */}
            <div className="px-5 py-4 border-t border-qingbi/15 bg-xuanzhi/40">
              <ScrollInput onSubmit={handleSend} compact />
            </div>
          </div>

          {/* 折叠区 · xl 以下（含移动端与 lg）显示 · 支持 行军图/手札 tab 切换 */}
          <details className="xl:hidden mt-4 bg-xuanzhi-light/60 border border-qingbi/20 shadow-card" style={{ borderRadius: "2px" }}>
            <summary className="px-5 py-3 cursor-pointer font-song text-sm text-daiqing tracking-wider flex items-center justify-between">
              <span>{sidePanel === "task" ? "行军图 · 任务规划" : "手札 · 对话记忆"}</span>
              <span className="text-xs text-qingbi/60">点此展开</span>
            </summary>
            <div className="h-80 border-t border-qingbi/15 flex flex-col">
              {/* 折叠内 tab 切换 · 与右栏一致 */}
              <div className="flex gap-1 p-1 bg-xuanzhi-deep/40 border-b border-qingbi/15">
                <button
                  onClick={() => setSidePanel("task")}
                  className={`flex-1 py-2 font-song text-xs tracking-widest transition-all duration-300 ${
                    sidePanel === "task" ? "bg-qingbi text-xuanzhi-light shadow-seal" : "text-qingbi/70 hover:text-daiqing"
                  }`}
                  style={{ borderRadius: "2px" }}
                >
                  行军图
                </button>
                <button
                  onClick={() => setSidePanel("memory")}
                  className={`flex-1 py-2 font-song text-xs tracking-widest transition-all duration-300 ${
                    sidePanel === "memory" ? "bg-qingbi text-xuanzhi-light shadow-seal" : "text-qingbi/70 hover:text-daiqing"
                  }`}
                  style={{ borderRadius: "2px" }}
                >
                  手札
                </button>
              </div>
              <div className="flex-1 overflow-hidden">
                {sidePanel === "task" ? <TaskScroll plan={taskPlan} /> : <MemoryPanel memory={memory} />}
              </div>
            </div>
          </details>
        </main>

        {/* 右栏：手札记忆 / 任务规划切换 · xl 起常驻 · lg 及以下走折叠 */}
        <aside className="hidden xl:block">
          <div className="sticky top-20 h-[calc(100vh-7rem)] flex flex-col gap-3">
            {/* 切换标签 */}
            <div className="flex gap-1 p-1 bg-xuanzhi-deep/40 border border-qingbi/20" style={{ borderRadius: "2px" }}>
              <button
                onClick={() => setSidePanel("task")}
                className={`flex-1 py-2 font-song text-xs tracking-widest transition-all duration-300 ${
                  sidePanel === "task"
                    ? "bg-qingbi text-xuanzhi-light shadow-seal"
                    : "text-qingbi/70 hover:text-daiqing"
                }`}
                style={{ borderRadius: "2px" }}
              >
                行军图
              </button>
              <button
                onClick={() => setSidePanel("memory")}
                className={`flex-1 py-2 font-song text-xs tracking-widest transition-all duration-300 ${
                  sidePanel === "memory"
                    ? "bg-qingbi text-xuanzhi-light shadow-seal"
                    : "text-qingbi/70 hover:text-daiqing"
                }`}
                style={{ borderRadius: "2px" }}
              >
                手札
              </button>
            </div>

            {/* 面板内容 */}
            <div className="flex-1 bg-xuanzhi-light/60 border border-qingbi/20 shadow-card overflow-hidden" style={{ borderRadius: "2px" }}>
              {sidePanel === "task" ? (
                <TaskScroll plan={taskPlan} />
              ) : (
                <MemoryPanel memory={memory} />
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* 研思录 · 思考链抽屉 */}
      <TraceDrawer
        open={traceOpen}
        onClose={() => setTraceOpen(false)}
        traces={traces}
        isThinking={isThinking}
      />
    </div>
  );
}
