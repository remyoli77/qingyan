// 工具调用动效气泡 — 研墨 / 铺纸 / 翻书
import type { ToolInvoke as ToolInvokeType } from "@/types";

interface ToolInvokeProps {
  tool: ToolInvokeType;
}

export default function ToolInvoke({ tool }: ToolInvokeProps) {
  return (
    <div className="flex justify-start animate-liftUp">
      <div className="shrink-0 mr-3 w-10" />
      <div className="max-w-[88%] sm:max-w-[78%]">
        <div
          className="inline-flex items-center gap-3 px-4 py-2.5 bg-qingbi/8 border border-qingbi/20"
          style={{ borderRadius: "2px" }}
        >
          {/* 动效图标 */}
          <ToolIcon type={tool.type} />

          <div className="flex flex-col">
            <span className="font-song text-sm text-daiqing tracking-wider">
              {tool.label}
              <span className="ml-2 text-xs text-qingbi/60">— {tool.detail}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ToolIcon({ type }: { type: ToolInvokeType["type"] }) {
  if (type === "ink") {
    // 研墨 — 圆磨转动
    return (
      <span className="relative inline-flex items-center justify-center w-6 h-6">
        <svg viewBox="0 0 24 24" className="w-6 h-6 animate-grindInk" aria-hidden="true">
          {/* 砚台 */}
          <ellipse cx="12" cy="14" rx="9" ry="3" fill="rgb(var(--c-daiqing-rgb))" opacity="0.3" />
          {/* 墨 */}
          <circle cx="12" cy="12" r="5" fill="rgb(var(--c-daiqing-rgb))" />
          <circle cx="12" cy="12" r="5" fill="none" stroke="rgb(var(--c-qingbi-rgb))" strokeWidth="1" />
          {/* 磨杆 */}
          <line x1="12" y1="12" x2="18" y2="6" stroke="rgb(var(--c-zheshi-rgb))" strokeWidth="2" strokeLinecap="round" />
          <circle cx="18" cy="6" r="1.5" fill="rgb(var(--c-zheshi-rgb))" />
        </svg>
      </span>
    );
  }

  if (type === "paper") {
    // 铺纸 — 横向展开
    return (
      <span className="inline-flex items-center justify-center w-6 h-6">
        <svg viewBox="0 0 24 24" className="w-6 h-6" aria-hidden="true">
          <rect x="2" y="6" width="20" height="12" fill="rgb(var(--c-xuanzhi-light-rgb))" stroke="rgb(var(--c-qingbi-rgb))" strokeWidth="1.2" />
          <line x1="2" y1="10" x2="22" y2="10" stroke="rgb(var(--c-qingbi-rgb))" strokeWidth="0.6" opacity="0.5" />
          <line x1="2" y1="14" x2="22" y2="14" stroke="rgb(var(--c-qingbi-rgb))" strokeWidth="0.6" opacity="0.5" />
          <line x1="12" y1="6" x2="12" y2="18" stroke="rgb(var(--c-zheshi-rgb))" strokeWidth="1.2" />
        </svg>
      </span>
    );
  }

  // book — 翻书
  return (
    <span className="inline-flex items-center justify-center w-6 h-6">
      <svg viewBox="0 0 24 24" className="w-6 h-6" aria-hidden="true">
        <path d="M12,6 L4,8 L4,20 L12,18 Z" fill="rgb(var(--c-xuanzhi-light-rgb))" stroke="rgb(var(--c-qingbi-rgb))" strokeWidth="1.2" strokeLinejoin="round" />
        <path d="M12,6 L20,8 L20,20 L12,18 Z" fill="rgb(var(--c-xuanzhi-rgb))" stroke="rgb(var(--c-qingbi-rgb))" strokeWidth="1.2" strokeLinejoin="round" />
        <line x1="6" y1="11" x2="10" y2="10.5" stroke="rgb(var(--c-qingbi-rgb))" strokeWidth="0.6" opacity="0.6" />
        <line x1="6" y1="14" x2="10" y2="13.5" stroke="rgb(var(--c-qingbi-rgb))" strokeWidth="0.6" opacity="0.6" />
        <line x1="14" y1="10.5" x2="18" y2="11" stroke="rgb(var(--c-qingbi-rgb))" strokeWidth="0.6" opacity="0.6" />
        <line x1="14" y1="13.5" x2="18" y2="14" stroke="rgb(var(--c-qingbi-rgb))" strokeWidth="0.6" opacity="0.6" />
      </svg>
    </span>
  );
}
