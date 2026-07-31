// 远山长卷 SVG — 朝代自适应的层叠远山
interface ScrollMountainsProps {
  className?: string;
  /** 是否启用入场动效（卷轴展开） */
  animated?: boolean;
}

export default function ScrollMountains({ className = "", animated = false }: ScrollMountainsProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 1440 320"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="m-far" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgb(var(--c-qingbi-light-rgb))" stopOpacity="0.35" />
          <stop offset="100%" stopColor="rgb(var(--c-qingbi-rgb))" stopOpacity="0.12" />
        </linearGradient>
        <linearGradient id="m-mid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgb(var(--c-qingbi-rgb))" stopOpacity="0.55" />
          <stop offset="100%" stopColor="rgb(var(--c-qingbi-deep-rgb))" stopOpacity="0.25" />
        </linearGradient>
        <linearGradient id="m-near" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgb(var(--c-qingbi-deep-rgb))" stopOpacity="0.75" />
          <stop offset="100%" stopColor="rgb(var(--c-daiqing-rgb))" stopOpacity="0.45" />
        </linearGradient>
        <linearGradient id="m-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgb(var(--c-sky-top))" />
          <stop offset="60%" stopColor="rgb(var(--c-sky-mid))" />
          <stop offset="100%" stopColor="rgb(var(--c-sky-bot))" />
        </linearGradient>
      </defs>

      {/* 天空渐变 */}
      <rect x="0" y="0" width="1440" height="320" fill="url(#m-sky)" />

      {/* 远山 — 最淡 */}
      <path
        d="M0,180 L80,150 L160,170 L240,130 L340,160 L440,120 L540,150 L640,110 L740,145 L840,115 L940,150 L1040,125 L1140,155 L1240,130 L1340,160 L1440,140 L1440,320 L0,320 Z"
        fill="url(#m-far)"
        style={animated ? { animation: "inkSpread 1.6s ease-out forwards" } : undefined}
      />

      {/* 中山 */}
      <path
        d="M0,220 L100,200 L180,215 L280,180 L380,210 L480,175 L580,205 L680,170 L780,200 L880,180 L980,215 L1080,185 L1180,210 L1280,190 L1380,215 L1440,200 L1440,320 L0,320 Z"
        fill="url(#m-mid)"
        style={animated ? { animation: "inkSpread 1.8s ease-out 0.2s forwards", opacity: 0 } : undefined}
      />

      {/* 近山 — 最深 */}
      <path
        d="M0,260 L120,240 L220,255 L320,225 L420,250 L520,230 L620,255 L720,235 L820,260 L920,240 L1020,265 L1120,245 L1220,265 L1320,250 L1440,265 L1440,320 L0,320 Z"
        fill="url(#m-near)"
        style={animated ? { animation: "inkSpread 2s ease-out 0.4s forwards", opacity: 0 } : undefined}
      />

      {/* 飞鸟点缀 */}
      <g stroke="rgb(var(--c-daiqing-rgb))" strokeWidth="1.5" fill="none" opacity="0.6">
        <path d="M180,90 q4,-4 8,0 q4,-4 8,0" />
        <path d="M260,70 q3,-3 6,0 q3,-3 6,0" />
        <path d="M340,100 q3,-3 6,0 q3,-3 6,0" />
      </g>

      {/* 远帆 */}
      <g fill="rgb(var(--c-zheshi-rgb))" opacity="0.7">
        <path d="M680,275 L695,275 L692,283 L683,283 Z" />
        <line x1="687" y1="265" x2="687" y2="278" stroke="rgb(var(--c-zheshi-rgb))" strokeWidth="1" />
        <path d="M687,267 L695,275 L687,275 Z" />
      </g>
    </svg>
  );
}
