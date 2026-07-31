// 研思录 · 思考链抽屉 — 从对话区右侧滑入，收纳任务节点/工具调用/RAG来源
import { useEffect } from "react";
import type { ThinkingTrace, TaskStatus } from "@/types";
import { useDynastyMeta } from "@/store/themeStore";

interface TraceDrawerProps {
  open: boolean;
  onClose: () => void;
  traces: ThinkingTrace[];
  isThinking: boolean;
}

const KIND_META: Record<
  ThinkingTrace["kind"],
  { label: string; color: string; icon: string }
> = {
  node: { label: "行军", color: "#3D6B6E", icon: "node" },
  tool: { label: "器用", color: "#B8763E", icon: "tool" },
  kb: { label: "典籍", color: "#A4392F", icon: "book" },
  llm: { label: "灵台", color: "#8AA0A8", icon: "mind" },
  distill: { label: "蒸馏", color: "#9C7E3F", icon: "drop" },
};

const STATUS_LABEL: Record<TaskStatus, string> = {
  pending: "待行",
  running: "行进中",
  done: "已至",
};

function TraceIcon({ kind }: { kind: ThinkingTrace["kind"] }) {
  const color = KIND_META[kind].color;
  if (kind === "node") {
    return (
      <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" aria-hidden="true">
        <circle cx="8" cy="8" r="5" fill="none" stroke={color} strokeWidth="1.4" />
        <circle cx="8" cy="8" r="2" fill={color} />
      </svg>
    );
  }
  if (kind === "tool") {
    return (
      <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" aria-hidden="true">
        <path d="M3,3 L13,13 M3,13 L13,3" fill="none" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
        <circle cx="8" cy="8" r="1.6" fill={color} />
      </svg>
    );
  }
  if (kind === "kb") {
    return (
      <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" aria-hidden="true">
        <path d="M2,4 Q2,3 3,3 L7,3 L8,4 L8,13 L3,13 Q2,13 2,12 Z" fill="none" stroke={color} strokeWidth="1.2" strokeLinejoin="round" />
        <path d="M14,4 Q14,3 13,3 L9,3 L8,4 L8,13 L13,13 Q14,13 14,12 Z" fill="none" stroke={color} strokeWidth="1.2" strokeLinejoin="round" />
      </svg>
    );
  }
  if (kind === "llm") {
    return (
      <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" aria-hidden="true">
        <circle cx="8" cy="8" r="5.5" fill="none" stroke={color} strokeWidth="1.2" />
        <path d="M8,4 L8,12 M4,8 L12,8 M5.2,5.2 L10.8,10.8 M10.8,5.2 L5.2,10.8" stroke={color} strokeWidth="0.8" strokeLinecap="round" />
      </svg>
    );
  }
  // distill
  return (
    <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" aria-hidden="true">
      <path d="M8,2 L8,9 M5,9 L11,9 M4,12 L12,12" fill="none" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="8" cy="14" r="1" fill={color} />
    </svg>
  );
}

export default function TraceDrawer({ open, onClose, traces, isThinking }: TraceDrawerProps) {
  const meta = useDynastyMeta();

  // ESC 关闭
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <>
      {/* 遮罩 · 轻纱 */}
      <div
        className={`fixed inset-0 z-40 transition-opacity duration-500 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        style={{ backgroundColor: "rgb(var(--c-daiqing-rgb) / 0.22)", backdropFilter: "blur(1.5px)" }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* 抽屉 · 右侧滑入 · 卷轴册页式 */}
      <aside
        className={`fixed top-0 right-0 z-50 h-full w-[340px] max-w-[90vw] shadow-scroll transition-transform duration-500 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        style={{
          backgroundColor: "rgb(var(--c-xuanzhi-light-rgb))",
          backgroundImage:
            "radial-gradient(circle at 80% 10%, rgb(var(--c-zheshi-rgb) / 0.06) 0%, transparent 45%), radial-gradient(circle at 20% 90%, rgb(var(--c-qingbi-rgb) / 0.05) 0%, transparent 45%)",
          borderLeft: "1px solid rgb(var(--c-zheshi-rgb) / 0.3)",
        }}
        role="dialog"
        aria-label="研思录 · 思考链"
      >
        <div className="h-full flex flex-col">
          {/* 标题栏 */}
          <div className="px-5 py-4 border-b border-qingbi/15 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="seal w-8 h-8 text-[11px] rotate-[-3deg]">研思</span>
              <div className="leading-tight">
                <div className="font-song text-base text-daiqing tracking-wider">研思录</div>
                <div className="font-song text-[10px] text-qingbi/55 tracking-widest">TRACE · 思之所历</div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center text-qingbi/60 hover:text-zhusha hover:bg-zhusha/8 transition-colors"
              style={{ borderRadius: "2px" }}
              aria-label="关闭"
            >
              <svg viewBox="0 0 20 20" className="w-4 h-4" aria-hidden="true">
                <path d="M5,5 L15,15 M15,5 L5,15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* 思考链流 */}
          <div className="flex-1 overflow-y-auto px-5 py-5">
            {traces.length === 0 ? (
              <div className="h-full flex items-center justify-center text-center px-6">
                <div className="font-song text-sm text-qingbi/50 tracking-wider leading-loose">
                  <p>研思未启</p>
                  <p className="mt-1 text-xs">客有命题 · 方录所历</p>
                </div>
              </div>
            ) : (
              <div className="relative">
                {/* 山径连线 */}
                <svg
                  className="absolute left-[7px] top-2 w-0.5 h-[calc(100%-1rem)]"
                  aria-hidden="true"
                >
                  <line x1="0" y1="0" x2="0" y2="100%" stroke="rgb(var(--c-qingbi-rgb))" strokeWidth="1.5" strokeDasharray="4 6" opacity="0.35" />
                </svg>

                <ul className="space-y-3.5">
                  {traces.map((t, idx) => {
                    const meta = KIND_META[t.kind];
                    const isLive = isThinking && idx === traces.length - 1 && t.status === "running";
                    return (
                      <li
                        key={t.id}
                        className="relative pl-7 animate-liftUp"
                        style={{ animationDelay: `${Math.min(idx * 40, 400)}ms`, opacity: 0 }}
                      >
                        {/* 节点圆点 */}
                        <div
                          className="absolute left-0 top-0.5 w-4 h-4 flex items-center justify-center bg-xuanzhi-light rounded-full border"
                          style={{
                            borderColor: meta.color,
                            boxShadow: isLive ? `0 0 0 3px ${meta.color}22` : "none",
                          }}
                        >
                          <TraceIcon kind={t.kind} />
                        </div>

                        {/* 卡片 */}
                        <div
                          className="px-3 py-2 border transition-all"
                          style={{
                            backgroundColor: isLive ? `${meta.color}0d` : "rgb(var(--c-xuanzhi-light-rgb) / 0.5)",
                            borderColor: isLive ? `${meta.color}55` : "rgb(var(--c-qingbi-rgb) / 0.12)",
                            borderRadius: "2px",
                          }}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5">
                              <span
                                className="font-song text-[10px] px-1.5 py-0.5 tracking-widest"
                                style={{ color: meta.color, border: `1px solid ${meta.color}55`, borderRadius: "2px" }}
                              >
                                {meta.label}
                              </span>
                              <span className="font-song text-xs text-daiqing tracking-wider">{t.title}</span>
                            </div>
                            {t.status && (
                              <span
                                className="font-song text-[9px] px-1 py-0.5 tracking-widest"
                                style={{
                                  color: meta.color,
                                  border: `1px solid ${meta.color}55`,
                                  borderRadius: "2px",
                                }}
                              >
                                {STATUS_LABEL[t.status]}
                              </span>
                            )}
                          </div>
                          <p className="mt-1 font-sans text-[11px] text-qingbi/70 leading-relaxed">
                            {t.detail}
                          </p>
                        </div>
                      </li>
                    );
                  })}

                  {/* 进行中提示 */}
                  {isThinking && (
                    <li className="relative pl-7">
                      <div className="absolute left-0 top-1 w-4 h-4 flex items-center justify-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-qingbi animate-inkBreathe" />
                      </div>
                      <span className="font-song text-[11px] text-qingbi/60 tracking-wider animate-inkBreathe">
                        研思未已…
                      </span>
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>

          {/* 卷尾落款 */}
          <div className="px-5 py-3 border-t border-qingbi/15 bg-qingbi/4 flex items-center justify-between">
            <span className="font-song text-[10px] text-qingbi/50 tracking-widest">
              共 {traces.length} 笔 · 思之所历
            </span>
            <span className="font-song text-[10px] text-qingbi/50 tracking-widest">
              研思录 · {meta.brand}手记
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
