// 信笺样式消息气泡 — 用于 AI 消息，含朱印引用 + 落款 + 心源(思考)折叠
import { useState } from "react";
import type { Message } from "@/types";
import Seal from "./Seal";
import { useDynastyMeta } from "@/store/themeStore";

interface LetterPaperProps {
  message: Message;
}

export default function LetterPaper({ message }: LetterPaperProps) {
  const [showThinking, setShowThinking] = useState(false);
  const hasThinking = message.hasThinking && message.thinking && message.thinking.trim().length > 0;
  const meta = useDynastyMeta();

  return (
    <div className="flex justify-start animate-liftUp">
      {/* Agent 头像 — 古风简笔角色 */}
      <div className="shrink-0 mr-3">
        <div
          className="w-10 h-10 flex items-center justify-center bg-qingbi/15 border border-qingbi/30"
          style={{ borderRadius: "2px" }}
          aria-label={meta.brand}
        >
          {/* 简笔书童头像 */}
          <svg viewBox="0 0 40 40" className="w-7 h-7" aria-hidden="true">
            {/* 发髻 */}
            <ellipse cx="20" cy="9" rx="6" ry="3" fill="rgb(var(--c-daiqing-rgb))" />
            {/* 脸 */}
            <circle cx="20" cy="20" r="8" fill="rgb(var(--c-xuanzhi-rgb))" stroke="rgb(var(--c-daiqing-rgb))" strokeWidth="1.2" />
            {/* 眼 */}
            <circle cx="17" cy="19" r="0.8" fill="rgb(var(--c-daiqing-rgb))" />
            <circle cx="23" cy="19" r="0.8" fill="rgb(var(--c-daiqing-rgb))" />
            {/* 嘴 */}
            <path d="M18,23 Q20,24.5 22,23" fill="none" stroke="rgb(var(--c-daiqing-rgb))" strokeWidth="1" strokeLinecap="round" />
            {/* 衣领 */}
            <path d="M12,30 L20,27 L28,30 L28,36 L12,36 Z" fill="rgb(var(--c-qingbi-rgb))" stroke="rgb(var(--c-daiqing-rgb))" strokeWidth="1" />
            <line x1="20" y1="27" x2="20" y2="36" stroke="rgb(var(--c-daiqing-rgb))" strokeWidth="0.8" />
          </svg>
        </div>
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
                backgroundColor: "rgba(138,160,168,0.06)",
                borderColor: "#8AA0A8",
              }}
            >
              <div className="flex items-center gap-1.5 mb-2">
                <svg viewBox="0 0 16 16" className="w-3 h-3 text-[#8AA0A8]" aria-hidden="true">
                  <circle cx="8" cy="8" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
                  <path d="M8,4 L8,12 M4,8 L12,8" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" />
                </svg>
                <span className="font-song text-[10px] text-[#8AA0A8] tracking-widest">心源 · 所思之迹</span>
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

          {/* 落款印章 */}
          {!message.streaming && (
            <div className="mt-4 flex items-center justify-end gap-2">
              <span className="font-song text-[10px] text-qingbi/50 tracking-widest">
                {meta.signoff} · {new Date(message.timestamp).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}
              </span>
              <Seal text={meta.brand} size={28} shape="square" rotate={4} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
