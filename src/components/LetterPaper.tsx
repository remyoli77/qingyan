// 信笺样式消息气泡 — 用于 AI 消息，含朱印引用 + 落款 + 心源(思考)折叠
import { useState } from "react";
import type { Message } from "@/types";
import Seal from "./Seal";
import PersonaAvatar from "./PersonaAvatar";
import { useDynastyMeta } from "@/store/themeStore";
import { useSettingsStore } from "@/store/settingsStore";
import { useChatStore } from "@/store/chatStore";

interface LetterPaperProps {
  message: Message;
}

export default function LetterPaper({ message }: LetterPaperProps) {
  const [showThinking, setShowThinking] = useState(false);
  const hasThinking = message.hasThinking && message.thinking && message.thinking.trim().length > 0;
  const meta = useDynastyMeta();
  const persona = useSettingsStore((s) => s.agentPersona);
  const archiveMessage = useChatStore((s) => s.archiveMessage);

  return (
    <div className="flex justify-start animate-liftUp">
      {/* Agent 头像 — 随 agentPersona 变化的简笔角色 */}
      <div className="shrink-0 mr-3">
        <PersonaAvatar persona={persona} label={`${meta.brand} · ${persona}`} />
      </div>

      <div className="max-w-[88%] sm:max-w-[78%]">
        {/* 落款 + 心源按钮 */}
        <div className="flex items-center gap-2 mb-1.5 pl-1">
          <span className="w-6 h-px bg-qingbi/30" />
          <span className="font-song text-xs text-qingbi/60 tracking-wider">{meta.brand} · 复笺</span>
          {/* 心源按钮 · 有思考过程时显示 · 默认收起 */}
          {hasThinking && !message.streaming && (
            <button
              onClick={() => setShowThinking(!showThinking)}
              className="ml-auto flex items-center gap-1 px-2 py-0.5 border border-qingbi/25 hover:border-qingbi/50 hover:bg-qingbi/6 transition-all group"
              style={{ borderRadius: "2px" }}
              aria-label="心源 · 思考过程"
              aria-expanded={showThinking}
            >
              <svg viewBox="0 0 16 16" className="w-3 h-3 text-zheshi group-hover:rotate-180 transition-transform duration-500" aria-hidden="true">
                <path d="M8,2 C5,2 3,4 3,7 C3,9 4,10 5,11 L5,13 L11,13 L11,11 C12,10 13,9 13,7 C13,4 11,2 8,2 Z" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
                <path d="M6,14 L10,14" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
              </svg>
              <span className="font-song text-[10px] text-daiqing/70 group-hover:text-qingbi tracking-wider">
                {showThinking ? "收心源" : "心源"}
              </span>
              <svg
                viewBox="0 0 12 12"
                className={`w-2.5 h-2.5 text-qingbi/60 transition-transform duration-300 ${showThinking ? "rotate-180" : ""}`}
                aria-hidden="true"
              >
                <path d="M3,4 L6,8 L9,4" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
        </div>

        {/* 信笺主体 — 宣纸质感 */}
        <div
          className="relative px-6 py-4 shadow-scroll paper-texture"
          style={{
            backgroundColor: "rgb(var(--c-paper-base))",
            backgroundImage:
              "radial-gradient(circle at 15% 22%, rgb(var(--c-zheshi-rgb) / 0.05) 0%, transparent 42%), radial-gradient(circle at 82% 78%, rgb(var(--c-qingbi-rgb) / 0.04) 0%, transparent 46%), radial-gradient(circle at 50% 50%, rgb(var(--c-liujin-rgb) / 0.03) 0%, transparent 60%), repeating-linear-gradient(92deg, transparent 0px, transparent 2px, rgb(var(--c-zheshi-rgb) / 0.012) 2px, rgb(var(--c-zheshi-rgb) / 0.012) 3px)",
            border: "1px solid rgb(var(--c-zheshi-rgb) / 0.22)",
            borderRadius: "2px",
          }}
        >
          {/* 角花 — 左上 */}
          <svg className="absolute top-1 left-1 w-6 h-6 opacity-50" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M2,2 L8,2 M2,2 L2,8 M2,2 Q6,4 8,8" fill="none" stroke="rgb(var(--c-zheshi-rgb))" strokeWidth="1" />
          </svg>
          {/* 角花 — 右下 */}
          <svg className="absolute bottom-1 right-1 w-6 h-6 opacity-50 rotate-180" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M2,2 L8,2 M2,2 L2,8 M2,2 Q6,4 8,8" fill="none" stroke="rgb(var(--c-zheshi-rgb))" strokeWidth="1" />
          </svg>

          {/* 心源 · 思考过程折叠区 · 默认隐藏 · 展开时置于正文上方 */}
          {hasThinking && showThinking && (
            <div
              className="mb-4 px-4 py-3 border-l-2 animate-liftUp"
              style={{
                backgroundColor: "rgb(var(--c-qingbi-light-rgb) / 0.08)",
                borderColor: "rgb(var(--c-qingbi-light-rgb))",
              }}
            >
              <div className="flex items-center gap-1.5 mb-2">
                <svg viewBox="0 0 16 16" className="w-3 h-3" style={{ color: "rgb(var(--c-qingbi-light-rgb))" }} aria-hidden="true">
                  <circle cx="8" cy="8" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
                  <path d="M8,4 L8,12 M4,8 L12,8" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" />
                </svg>
                <span className="font-song text-[10px] tracking-widest" style={{ color: "rgb(var(--c-qingbi-light-rgb))" }}>心源 · 所思之迹</span>
              </div>
              <p
                className="font-song text-xs text-daiqing/70 leading-relaxed whitespace-pre-wrap break-words"
                style={{ textIndent: "2em" }}
              >
                {message.thinking}
              </p>
            </div>
          )}

          <p
            className={`font-song text-daiqing text-sm sm:text-base leading-loose whitespace-pre-wrap break-words ${
              message.streaming ? "animate-inkBreathe" : ""
            }`}
            style={{ textIndent: "2em" }}
          >
            {message.content}
            {message.streaming && (
              <span className="inline-block w-0.5 h-4 bg-zhusha align-middle ml-0.5 animate-pulse" />
            )}
          </p>

          {/* 朱印引用 — 古籍批注式样 */}
          {message.citations && message.citations.length > 0 && (
            <div className="mt-4 pt-3 border-t border-qingbi/15">
              <div className="flex items-center gap-2 mb-2">
                <Seal text="引证" size={24} shape="square" rotate={-2} />
                <span className="font-song text-xs text-qingbi/70 tracking-wider">典籍所出</span>
              </div>
              <ul className="space-y-2">
                {message.citations.map((c, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 font-song text-xs text-daiqing/80 leading-relaxed"
                  >
                    {/* 朱圈 */}
                    <span
                      className="shrink-0 inline-flex items-center justify-center w-4 h-4 mt-0.5 rounded-full border border-zhusha text-[10px] text-zhusha"
                      style={{ borderRadius: "50%" }}
                    >
                      {i + 1}
                    </span>
                    <span>
                      <span className="text-zhusha/90 font-medium">《{c.source}》</span>
                      <span className="mx-1 text-qingbi/40">·</span>
                      <span className="italic">{c.snippet}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 落款印章 · 收信完成时钤印动画 · 上方墨痕定稿细线自中心向两侧铺开 */}
          {!message.streaming && (
            <div className="mt-4">
              {/* 墨痕定稿 · 笔锋收束时一道淡墨铺开 */}
              <div
                className="signature-line mb-3 animate-inkSettle"
                style={{ transformOrigin: "center center" }}
                aria-hidden="true"
              />
              <div className="flex items-center justify-end gap-2">
                <span className="font-song text-[10px] text-qingbi/60 tracking-widest">
                  {meta.signoff} · {new Date(message.timestamp).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}
                </span>
                <Seal text={meta.brand} size={28} shape="square" rotate={4} stamp />
              </div>

              {/* 收入典籍 · compatible 模式华夏相关问题回复后 · 克制印章按钮 · 点击入库 user 库 */}
              {message.canArchive && !message.archived && (
                <div className="mt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => archiveMessage(message.id)}
                    className="group flex items-center gap-1.5 px-2.5 py-1 bg-xuanzhi-deep/40 border border-qingbi/20 hover:border-zhusha/50 hover:bg-xuanzhi-deep/70 transition-all duration-300"
                    style={{ borderRadius: "2px" }}
                    aria-label="收入典籍阁"
                  >
                    {/* 小卷轴图标 */}
                    <svg viewBox="0 0 16 16" className="w-3 h-3 text-qingbi/60 group-hover:text-zhusha transition-colors" aria-hidden="true">
                      <rect x="2" y="3" width="12" height="10" rx="0.5" fill="none" stroke="currentColor" strokeWidth="0.8" />
                      <line x1="5" y1="6" x2="11" y2="6" stroke="currentColor" strokeWidth="0.6" />
                      <line x1="5" y1="8" x2="11" y2="8" stroke="currentColor" strokeWidth="0.6" />
                      <line x1="5" y1="10" x2="9" y2="10" stroke="currentColor" strokeWidth="0.6" />
                    </svg>
                    <span className="font-song text-[10px] text-qingbi/60 group-hover:text-zhusha tracking-widest transition-colors">
                      收入典籍
                    </span>
                  </button>
                </div>
              )}
              {/* 已收入 · 钤一枚小印示意 · 不再可操作 */}
              {message.archived && (
                <div className="mt-2 flex justify-end items-center gap-1.5 opacity-60">
                  <Seal text="已藏" size={18} shape="square" rotate={-3} />
                  <span className="font-song text-[10px] text-qingbi/50 tracking-widest">已入典籍阁</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
