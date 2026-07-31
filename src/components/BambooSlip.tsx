// 竹简样式消息气泡 — 用于用户消息
import type { Message } from "@/types";

interface BambooSlipProps {
  message: Message;
}

export default function BambooSlip({ message }: BambooSlipProps) {
  return (
    <div className="flex justify-end animate-liftUp">
      <div className="max-w-[78%] sm:max-w-[68%]">
        {/* 落款 */}
        <div className="flex items-center justify-end gap-2 mb-1.5 pr-1">
          <span className="font-song text-xs text-qingbi/60 tracking-wider">客 · 落笔</span>
          <span className="w-6 h-px bg-qingbi/30" />
        </div>

        {/* 竹简主体 */}
        <div
          className="relative inline-block px-5 py-3.5 shadow-card"
          style={{
            backgroundColor: "rgb(var(--c-xuanzhi-deep-rgb))",
            backgroundImage:
              // 竹简纹理：纵向竹片分隔
              "repeating-linear-gradient(90deg, rgb(var(--c-qingbi-rgb) / 0.12) 0px, rgb(var(--c-qingbi-rgb) / 0.12) 1px, transparent 1px, transparent 22px), radial-gradient(circle at 20% 30%, rgb(var(--c-zheshi-rgb) / 0.08) 0%, transparent 50%)",
            borderLeft: "2px solid rgb(var(--c-qingbi-rgb) / 0.4)",
            borderRight: "2px solid rgb(var(--c-qingbi-rgb) / 0.4)",
            borderRadius: "2px",
          }}
        >
          {/* 上下绳带 */}
          <span className="absolute left-0 right-0 top-1.5 h-px bg-zheshi/40" />
          <span className="absolute left-0 right-0 bottom-1.5 h-px bg-zheshi/40" />

          <p className="font-song text-daiqing text-sm sm:text-base leading-loose whitespace-pre-wrap break-words">
            {message.content}
          </p>
        </div>
      </div>
    </div>
  );
}
