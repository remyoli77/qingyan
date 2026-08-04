// 卷轴造型输入框 — 双轴头横向卷轴 · 首页入场时自中间向两侧缓缓展开
import { useState, useRef, useEffect, type FormEvent } from "react";
import { Send } from "lucide-react";
import { ambience } from "@/lib/ambience";

interface ScrollInputProps {
  onSubmit: (text: string) => void;
  placeholder?: string;
  initialValue?: string;
  /** 是否紧凑模式（用于对话页底部）· 紧凑模式不播放展开动画 */
  compact?: boolean;
  /** 外部展开信号 · 如首页传入 section 滚入视口态 · 触发卷轴展开 */
  reveal?: boolean;
}

export default function ScrollInput({
  onSubmit,
  placeholder = "研墨铺纸，落笔所求…",
  initialValue = "",
  compact = false,
  reveal = true,
}: ScrollInputProps) {
  const [value, setValue] = useState(initialValue);
  const [focused, setFocused] = useState(false);
  const taRef = useRef<HTMLTextAreaElement>(null);
  // compact 直接展开 · 非 compact 由 reveal 控制（首页 section 可见后才展开）
  const [opened, setOpened] = useState(compact);

  useEffect(() => {
    if (compact) return;
    if (!reveal) return;
    // 双 rAF 确保初始闭合态先绘制 · 再触发展开动画
    const id = requestAnimationFrame(() => requestAnimationFrame(() => {
      setOpened(true);
      ambience.scrollOpen();
    }));
    return () => cancelAnimationFrame(id);
  }, [compact, reveal]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setValue("");
    if (taRef.current) taRef.current.style.height = "auto";
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }

  function autoGrow(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setValue(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }

  const capH = compact ? 48 : 68;

  return (
    <form
      onSubmit={handleSubmit}
      className={`relative w-full ${compact ? "" : "max-w-3xl mx-auto"}`}
    >
      <div
        className={`
          relative flex items-end gap-3 px-6 py-4
          bg-xuanzhi-light/90 backdrop-blur-sm
          border-y-2 border-qingbi/30
          shadow-scroll
          transition-all duration-500
          ${focused ? "border-qingbi shadow-[0_8px_28px_rgba(61,107,110,0.18)]" : ""}
        `}
        style={{
          // 卷轴上下边缘的暗纹 + 展开时左右内阴影模拟卷曲弧度
          backgroundImage:
            "linear-gradient(180deg, rgb(var(--c-qingbi-rgb) / 0.06) 0%, transparent 8%, transparent 92%, rgb(var(--c-qingbi-rgb) / 0.06) 100%)",
          // 展开后加左右内阴影 · 模拟纸从轴上展开的卷曲立体感
          boxShadow: opened
            ? `inset 12px 0 16px -8px rgb(var(--c-daiqing-rgb) / 0.15), inset -12px 0 16px -8px rgb(var(--c-daiqing-rgb) / 0.15), 0 8px 24px rgb(var(--c-daiqing-rgb) / 0.12)`
            : undefined,
          // 自中间向两侧缓缓展开 · clip-path 裁剪不使内容变形
          clipPath: opened ? "inset(0 0% 0 0%)" : "inset(0 50% 0 50%)",
          transition: "clip-path 1s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.6s ease-out 0.4s",
        }}
      >
        {/* 左轴头 · 固定于左端 · 始终在位 · 仅透明度随展开渐显 */}
        <span
          className="scroll-cap"
          style={{
            left: -10,
            height: capH,
            opacity: opened ? 1 : 0,
            transition: "opacity 0.5s ease-out 0.3s",
          }}
        />
        {/* 右轴头 · 固定于右端 · 与左轴头对称 */}
        <span
          className="scroll-cap"
          style={{
            right: -10,
            height: capH,
            opacity: opened ? 1 : 0,
            transition: "opacity 0.5s ease-out 0.3s",
          }}
        />

        <textarea
          ref={taRef}
          value={value}
          onChange={autoGrow}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={1}
          className={`
            flex-1 resize-none bg-transparent outline-none
            font-song text-daiqing placeholder:text-qingbi/50
            ${compact ? "text-sm leading-relaxed" : "text-base leading-relaxed"}
          `}
          style={{ minHeight: compact ? 32 : 44 }}
        />

        <button
          type="submit"
          disabled={!value.trim()}
          className={`
            shrink-0 flex items-center gap-2 px-4 py-2
            font-song text-sm tracking-wider
            transition-all duration-300
            ${value.trim()
              ? "bg-zhusha text-xuanzhi-light hover:bg-zhushaDeep shadow-seal"
              : "bg-xuanzhi-deep text-qingbi/40 cursor-not-allowed"}
          `}
          aria-label="送出"
        >
          <Send size={14} />
          <span>送出</span>
        </button>
      </div>

      {/* 落款 · 卷轴展开后延迟淡入 */}
      {!compact && (
        <div
          className="flex items-center justify-center gap-3 mt-3 text-xs text-qingbi/60 font-song transition-opacity duration-700"
          style={{ opacity: opened ? 1 : 0, transitionDelay: "0.6s" }}
        >
          <span className="signature-line w-16" />
          <span>落笔成笺 · 鸿雁传书</span>
          <span className="signature-line w-16" />
        </div>
      )}
    </form>
  );
}
