// 手札记忆面板 — 仿线装手札样式
import type { MemoryEntry } from "@/types";
import { useDynastyMeta } from "@/store/themeStore";

interface MemoryPanelProps {
  memory: MemoryEntry[];
}

export default function MemoryPanel({ memory }: MemoryPanelProps) {
  const meta = useDynastyMeta();
  return (
    <div className="h-full flex flex-col">
      <div className="px-5 py-4 border-b border-qingbi/15 bg-qingbi/5">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-song text-xs text-qingbi/60 tracking-widest">手札 · 记忆所系</p>
            <h3 className="mt-0.5 font-brush text-xl text-daiqing tracking-wider">{meta.brand}所记</h3>
          </div>
          <span className="seal w-8 h-8 text-xs rotate-[-3deg]">手札</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        {memory.length === 0 ? (
          <div className="h-full flex items-center justify-center text-center">
            <p className="font-song text-sm text-qingbi/50 tracking-wider">
              手札尚空<br />
              <span className="text-xs">数语往来，方有所记</span>
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {memory.map((m, i) => (
              <li
                key={m.id}
                className="relative pl-5 animate-liftUp"
                style={{ animationDelay: `${i * 60}ms`, opacity: 0 }}
              >
                {/* 线装穿孔 */}
                <span className="absolute left-0 top-2 w-2 h-2 rounded-full bg-zheshi/40 border border-zheshi/60" />
                <span className="absolute left-0 top-2 w-3 h-px bg-qingbi/30 translate-x-2" />

                <div
                  className="px-3.5 py-2.5 bg-xuanzhi-light/70 border border-qingbi/15"
                  style={{ borderRadius: "2px" }}
                >
                  <div className="flex items-baseline justify-between gap-2 mb-1">
                    <span className="font-song text-xs text-zheshi tracking-widest">
                      〔{m.label}〕
                    </span>
                    <span className="font-song text-[10px] text-qingbi/50">
                      {new Date(m.ts).toLocaleString("zh-CN", {
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="font-song text-xs text-daiqing/85 leading-relaxed">
                    {m.content}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="px-5 py-2.5 border-t border-qingbi/15 bg-qingbi/5">
        <span className="font-song text-[10px] text-qingbi/50 tracking-widest">
          线装手札 · 共 {memory.length} 则
        </span>
      </div>
    </div>
  );
}
