// 竹简样式消息气泡 — 用于用户消息
// 纵向竹片 + 上下麻绳穿联 · 仿真竹简形制 · 朝代自适应配色
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

        {/* 竹简主体 · 纵向竹片 + 上下麻绳绳结 */}
        <div
          className="relative inline-block px-6 py-5 shadow-card"
          style={{
            backgroundColor: "rgb(var(--c-xuanzhi-deep-rgb))",
            backgroundImage: [
              // 纵向竹片分隔 · 每 22px 一片 · 片间细缝
              "repeating-linear-gradient(90deg, transparent 0px, transparent 20px, rgb(var(--c-daiqing-rgb) / 0.18) 20px, rgb(var(--c-daiqing-rgb) / 0.18) 22px)",
              // 竹片高光 · 每片中央一道微亮 · 立体感
              "repeating-linear-gradient(90deg, transparent 0px, transparent 9px, rgb(var(--c-xuanzhi-light-rgb) / 0.12) 9px, rgb(var(--c-xuanzhi-light-rgb) / 0.12) 11px, transparent 11px, transparent 22px)",
              // 整体晕染
              "radial-gradient(circle at 20% 30%, rgb(var(--c-zheshi-rgb) / 0.10) 0%, transparent 55%)",
              // 上下边缘竹节暗影
              "linear-gradient(180deg, rgb(var(--c-daiqing-rgb) / 0.15) 0%, transparent 12%, transparent 88%, rgb(var(--c-daiqing-rgb) / 0.15) 100%)",
            ].join(", "),
            borderLeft: "1px solid rgb(var(--c-qingbi-rgb) / 0.35)",
            borderRight: "1px solid rgb(var(--c-qingbi-rgb) / 0.35)",
            borderRadius: "2px",
          }}
        >
          {/* 上麻绳 · 横贯 + 竹片节点绳结 · 落笔时墨痕自左向右延展 */}
          <div className="absolute left-0 right-0 top-2 flex items-center pointer-events-none" aria-hidden="true">
            <span
              className="absolute left-1 right-1 h-[1.5px] bg-zheshi/55 animate-inkStretch"
              style={{ transformOrigin: "left center" }}
            />
            {/* 绳结节点 · 每隔约 44px 一个 · 模拟麻绳穿竹片 */}
            <span className="absolute left-2 w-1.5 h-1.5 rounded-full bg-zheshi/70" style={{ boxShadow: "0 0 0 1px rgb(var(--c-daiqing-rgb) / 0.3)" }} />
            <span className="absolute left-[46px] w-1.5 h-1.5 rounded-full bg-zheshi/70" style={{ boxShadow: "0 0 0 1px rgb(var(--c-daiqing-rgb) / 0.3)" }} />
            <span className="absolute left-[90px] w-1.5 h-1.5 rounded-full bg-zheshi/70" style={{ boxShadow: "0 0 0 1px rgb(var(--c-daiqing-rgb) / 0.3)" }} />
            <span className="absolute left-[134px] w-1.5 h-1.5 rounded-full bg-zheshi/70" style={{ boxShadow: "0 0 0 1px rgb(var(--c-daiqing-rgb) / 0.3)" }} />
            <span className="absolute right-2 w-1.5 h-1.5 rounded-full bg-zheshi/70" style={{ boxShadow: "0 0 0 1px rgb(var(--c-daiqing-rgb) / 0.3)" }} />
          </div>

          {/* 下麻绳 · 与上对称 · 落笔动效同步 */}
          <div className="absolute left-0 right-0 bottom-2 flex items-center pointer-events-none" aria-hidden="true">
            <span
              className="absolute left-1 right-1 h-[1.5px] bg-zheshi/55 animate-inkStretch"
              style={{ transformOrigin: "left center", animationDelay: "0.1s" }}
            />
            <span className="absolute left-2 w-1.5 h-1.5 rounded-full bg-zheshi/70" style={{ boxShadow: "0 0 0 1px rgb(var(--c-daiqing-rgb) / 0.3)" }} />
            <span className="absolute left-[46px] w-1.5 h-1.5 rounded-full bg-zheshi/70" style={{ boxShadow: "0 0 0 1px rgb(var(--c-daiqing-rgb) / 0.3)" }} />
            <span className="absolute left-[90px] w-1.5 h-1.5 rounded-full bg-zheshi/70" style={{ boxShadow: "0 0 0 1px rgb(var(--c-daiqing-rgb) / 0.3)" }} />
            <span className="absolute left-[134px] w-1.5 h-1.5 rounded-full bg-zheshi/70" style={{ boxShadow: "0 0 0 1px rgb(var(--c-daiqing-rgb) / 0.3)" }} />
            <span className="absolute right-2 w-1.5 h-1.5 rounded-full bg-zheshi/70" style={{ boxShadow: "0 0 0 1px rgb(var(--c-daiqing-rgb) / 0.3)" }} />
          </div>

          <p className="font-song text-daiqing text-sm sm:text-base leading-loose whitespace-pre-wrap break-words">
            {message.content}
          </p>
        </div>
      </div>
    </div>
  );
}
