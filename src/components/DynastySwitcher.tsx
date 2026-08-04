// 朝代切换器 — 四枚小印横列，点之即换朝，融入国风氛围
import { useState } from "react";
import { useThemeStore, useDynastyMeta, switchDynasty, DYNASTIES, DYNASTY_LIST } from "@/store/themeStore";
import type { Dynasty } from "@/store/themeStore";

interface DynastySwitcherProps {
  /** 紧凑模式 · 用于导航栏 */
  compact?: boolean;
}

export default function DynastySwitcher({ compact = false }: DynastySwitcherProps) {
  const dynasty = useThemeStore((s) => s.dynasty);
  const current = useDynastyMeta();
  const [hovered, setHovered] = useState<Dynasty | null>(null);

  function handleSwitch(d: Dynasty) {
    if (d === dynasty) return;
    switchDynasty(d);
  }

  return (
    <div
      className="flex items-center gap-1.5"
      role="radiogroup"
      aria-label="朝代切换"
    >
      {/* 朝代字标 · 非紧凑模式显示当前朝代意境 */}
      {!compact && (
        <span className="font-song text-[10px] text-qingbi/50 tracking-widest mr-1 hidden lg:inline">
          {current.vibe}
        </span>
      )}

      {/* 四朝小印 */}
      <div className="flex items-center gap-1 px-1.5 py-1 bg-qingbi/5 border border-qingbi/15" style={{ borderRadius: "2px" }}>
        {DYNASTY_LIST.map((d) => {
          const meta = DYNASTIES[d];
          const active = d === dynasty;
          const isHovered = hovered === d;
          return (
            <button
              key={d}
              onClick={() => handleSwitch(d)}
              onMouseEnter={() => setHovered(d)}
              onMouseLeave={() => setHovered(null)}
              role="radio"
              aria-checked={active}
              aria-label={`${meta.name} · ${meta.vibe}`}
              className="relative flex items-center justify-center transition-all duration-300"
              style={{
                width: compact ? 24 : 28,
                height: compact ? 24 : 28,
                borderRadius: "2px",
                backgroundColor: active
                  ? "rgb(var(--c-zhusha-rgb))"
                  : isHovered
                    ? "rgb(var(--c-qingbi-rgb) / 0.12)"
                    : "transparent",
                color: active
                  ? "rgb(var(--c-xuanzhi-light-rgb))"
                  : isHovered
                    ? "rgb(var(--c-qingbi-rgb))"
                    : "rgb(var(--c-qingbi-rgb) / 0.5)",
                border: active
                  ? "1px solid rgb(var(--c-zhusha-deep-rgb))"
                  : "1px solid rgb(var(--c-qingbi-rgb) / 0.15)",
                transform: active ? "rotate(-2deg) scale(1.05)" : "rotate(0deg) scale(1)",
                boxShadow: active ? "0 2px 6px rgb(var(--c-zhusha-rgb) / 0.3)" : "none",
                fontFamily: "var(--font-seal)",
                fontSize: compact ? 12 : 14,
                fontWeight: 500,
                letterSpacing: 0,
              }}
            >
              {meta.char}

              {/* hover 预览卡 · 朝代名 + 意境短语 · 浮于下方 · CSS only */}
              {!compact && (
                <span
                  className="pointer-events-none absolute left-1/2 top-full mt-2 z-20 whitespace-nowrap px-2.5 py-1.5 bg-xuanzhi-light border border-qingbi/30 shadow-card transition-all duration-200"
                  style={{
                    borderRadius: "2px",
                    transform: `translateX(-50%) translateY(${isHovered ? "0" : "-4px"})`,
                    opacity: isHovered ? 1 : 0,
                    visibility: isHovered ? "visible" : "hidden",
                  }}
                  role="tooltip"
                >
                  <span className="block font-song text-[11px] text-daiqing tracking-wider">{meta.name}</span>
                  <span className="block font-song text-[9px] text-qingbi/70 tracking-widest mt-0.5">{meta.vibe}</span>
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
