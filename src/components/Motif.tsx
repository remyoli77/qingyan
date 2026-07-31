// 植物纹样 SVG — 梅兰竹菊松荷，用于多宝阁卡片装饰
import type { FeatureMotif } from "@/types";

interface MotifProps {
  motif: FeatureMotif;
  className?: string;
}

export default function Motif({ motif, className = "" }: MotifProps) {
  const stroke = "rgb(var(--c-qingbi-rgb))";
  const accent = "rgb(var(--c-zheshi-rgb))";

  switch (motif) {
    case "plum":
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <g fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round">
            <path d="M60,100 C58,80 50,70 38,62" />
            <path d="M60,100 C62,78 70,68 84,58" />
            <path d="M60,100 C60,85 60,72 60,55" />
            <path d="M38,62 C30,58 24,58 18,62" />
            <path d="M84,58 C92,54 98,56 104,60" />
          </g>
          {/* 梅花 — 五瓣 */}
          {[
            [60, 50], [38, 62], [84, 58], [50, 40], [72, 38],
          ].map(([cx, cy], i) => (
            <g key={i} transform={`translate(${cx},${cy})`}>
              {[0, 72, 144, 216, 288].map((deg) => (
                <ellipse
                  key={deg}
                  cx="0" cy="-6" rx="4" ry="6"
                  fill="rgb(var(--c-xuanzhi-light-rgb))"
                  stroke={accent}
                  strokeWidth="1"
                  transform={`rotate(${deg})`}
                />
              ))}
              <circle r="1.8" fill={accent} />
            </g>
          ))}
        </svg>
      );

    case "orchid":
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <g fill="none" stroke={stroke} strokeWidth="1.6" strokeLinecap="round">
            {/* 兰叶 */}
            <path d="M60,105 C55,85 45,70 30,55" />
            <path d="M60,105 C62,82 60,65 55,42" />
            <path d="M60,105 C68,85 80,72 92,55" />
            <path d="M60,105 C50,90 38,82 22,75" />
          </g>
          {/* 兰花 */}
          <g transform="translate(55,42)">
            <ellipse cx="0" cy="-8" rx="3" ry="9" fill="rgb(var(--c-xuanzhi-light-rgb))" stroke={accent} strokeWidth="1" />
            <ellipse cx="-7" cy="-3" rx="3" ry="7" fill="rgb(var(--c-xuanzhi-light-rgb))" stroke={accent} strokeWidth="1" transform="rotate(-40)" />
            <ellipse cx="7" cy="-3" rx="3" ry="7" fill="rgb(var(--c-xuanzhi-light-rgb))" stroke={accent} strokeWidth="1" transform="rotate(40)" />
            <ellipse cx="-4" cy="4" rx="2.5" ry="6" fill="rgb(var(--c-xuanzhi-light-rgb))" stroke={accent} strokeWidth="1" transform="rotate(-80)" />
            <ellipse cx="4" cy="4" rx="2.5" ry="6" fill="rgb(var(--c-xuanzhi-light-rgb))" stroke={accent} strokeWidth="1" transform="rotate(80)" />
            <circle r="2" fill={accent} />
          </g>
        </svg>
      );

    case "bamboo":
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <g fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round">
            {/* 竹竿 */}
            <path d="M55,110 L55,18" />
            <path d="M70,110 L72,28" />
            {/* 竹节 */}
            <line x1="50" y1="90" x2="60" y2="90" />
            <line x1="50" y1="65" x2="60" y2="65" />
            <line x1="50" y1="40" x2="60" y2="40" />
            <line x1="65" y1="85" x2="77" y2="85" />
            <line x1="66" y1="58" x2="78" y2="58" />
            <line x1="68" y1="38" x2="78" y2="38" />
          </g>
          {/* 竹叶 */}
          <g fill={stroke} stroke="none">
            <path d="M55,40 Q40,30 25,32 Q40,38 55,42 Z" />
            <path d="M55,40 Q70,28 88,30 Q70,38 55,42 Z" />
            <path d="M72,28 Q85,18 100,18 Q85,26 72,30 Z" />
            <path d="M55,18 Q42,8 28,10 Q42,16 55,20 Z" />
            <path d="M70,85 Q82,75 96,75 Q82,83 70,87 Z" />
          </g>
        </svg>
      );

    case "chrysanthemum":
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <g fill="none" stroke={stroke} strokeWidth="1.6" strokeLinecap="round">
            <path d="M60,108 C58,90 50,82 38,78" />
            <path d="M60,108 C62,88 70,80 82,76" />
          </g>
          {/* 菊花 — 多层花瓣 */}
          <g transform="translate(60,55)">
            {Array.from({ length: 16 }).map((_, i) => (
              <ellipse
                key={`outer-${i}`}
                cx="0" cy="-18" rx="3" ry="14"
                fill="rgb(var(--c-xuanzhi-light-rgb))"
                stroke={accent}
                strokeWidth="1"
                transform={`rotate(${i * 22.5})`}
              />
            ))}
            {Array.from({ length: 12 }).map((_, i) => (
              <ellipse
                key={`inner-${i}`}
                cx="0" cy="-10" rx="2.5" ry="9"
                fill={accent}
                fillOpacity="0.3"
                stroke={accent}
                strokeWidth="1"
                transform={`rotate(${i * 30 + 15})`}
              />
            ))}
            <circle r="4" fill={accent} />
          </g>
        </svg>
      );

    case "lotus":
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          {/* 水波 */}
          <g fill="none" stroke={stroke} strokeWidth="1" opacity="0.4">
            <path d="M10,95 Q30,90 50,95 T90,95 T110,95" />
            <path d="M15,105 Q35,100 55,105 T95,105 T115,105" />
          </g>
          {/* 荷叶 */}
          <ellipse cx="35" cy="80" rx="22" ry="8" fill={stroke} fillOpacity="0.25" stroke={stroke} strokeWidth="1.5" />
          {/* 莲花 */}
          <g transform="translate(70,55)">
            {Array.from({ length: 8 }).map((_, i) => (
              <ellipse
                key={`petal-${i}`}
                cx="0" cy="-14" rx="5" ry="14"
                fill="rgb(var(--c-xuanzhi-light-rgb))"
                stroke={accent}
                strokeWidth="1.2"
                transform={`rotate(${i * 45})`}
              />
            ))}
            {Array.from({ length: 8 }).map((_, i) => (
              <ellipse
                key={`inner-${i}`}
                cx="0" cy="-8" rx="3.5" ry="9"
                fill={accent}
                fillOpacity="0.25"
                stroke={accent}
                strokeWidth="1"
                transform={`rotate(${i * 45 + 22.5})`}
              />
            ))}
            <circle r="3.5" fill={accent} />
            <circle r="1.5" fill="rgb(var(--c-xuanzhi-light-rgb))" />
          </g>
          {/* 茎 */}
          <line x1="70" y1="68" x2="70" y2="92" stroke={stroke} strokeWidth="2" />
        </svg>
      );

    case "pine":
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <g fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round">
            {/* 主干 */}
            <path d="M60,110 C58,85 56,60 55,30" />
            <path d="M60,110 C65,88 70,68 78,48" />
            {/* 枝 */}
            <path d="M55,55 L35,45" />
            <path d="M58,40 L78,30" />
            <path d="M70,68 L92,62" />
          </g>
          {/* 松针簇 */}
          <g stroke={stroke} strokeWidth="1" fill="none">
            {[
              [35, 45], [78, 30], [92, 62], [55, 30],
            ].map(([cx, cy], idx) => (
              <g key={idx} transform={`translate(${cx},${cy})`}>
                {Array.from({ length: 10 }).map((_, i) => (
                  <line
                    key={i}
                    x1="0" y1="0"
                    x2={Math.cos((i * 36 * Math.PI) / 180) * 10}
                    y2={Math.sin((i * 36 * Math.PI) / 180) * 10}
                  />
                ))}
              </g>
            ))}
          </g>
          {/* 点缀赭石色松果 */}
          <circle cx="58" cy="50" r="2.5" fill={accent} />
          <circle cx="75" cy="42" r="2" fill={accent} />
        </svg>
      );

    default:
      return null;
  }
}
