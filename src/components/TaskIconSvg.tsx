// 任务节点图标 — 亭台楼阁桥船等
import type { TaskIcon } from "@/types";

interface TaskIconSvgProps {
  icon: TaskIcon;
  className?: string;
}

export default function TaskIconSvg({ icon, className = "" }: TaskIconSvgProps) {
  const stroke = "rgb(var(--c-qingbi-rgb))";
  const fill = "rgb(var(--c-xuanzhi-light-rgb))";
  const accent = "rgb(var(--c-zheshi-rgb))";

  switch (icon) {
    case "pavilion":
      // 亭
      return (
        <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
          {/* 屋顶 */}
          <path d="M8,18 L24,8 L40,18 Z" fill={stroke} stroke={stroke} strokeWidth="1.5" strokeLinejoin="round" />
          {/* 飞檐 */}
          <path d="M6,18 Q8,15 12,17 M42,18 Q40,15 36,17" fill="none" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
          {/* 柱 */}
          <line x1="14" y1="18" x2="14" y2="34" stroke={stroke} strokeWidth="1.8" />
          <line x1="34" y1="18" x2="34" y2="34" stroke={stroke} strokeWidth="1.8" />
          {/* 横梁 */}
          <line x1="10" y1="22" x2="38" y2="22" stroke={stroke} strokeWidth="1.2" />
          {/* 匾 */}
          <rect x="20" y="13" width="8" height="4" fill={accent} />
          {/* 基座 */}
          <path d="M10,34 L38,34 L36,38 L12,38 Z" fill={fill} stroke={stroke} strokeWidth="1.5" />
        </svg>
      );

    case "bridge":
      // 桥
      return (
        <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
          <path d="M4,30 Q24,12 44,30" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
          {/* 栏杆 */}
          <line x1="6" y1="30" x2="6" y2="34" stroke={stroke} strokeWidth="1.2" />
          <line x1="14" y1="22" x2="14" y2="26" stroke={stroke} strokeWidth="1.2" />
          <line x1="24" y1="18" x2="24" y2="22" stroke={stroke} strokeWidth="1.2" />
          <line x1="34" y1="22" x2="34" y2="26" stroke={stroke} strokeWidth="1.2" />
          <line x1="42" y1="30" x2="42" y2="34" stroke={stroke} strokeWidth="1.2" />
          <path d="M4,30 L44,30" stroke={stroke} strokeWidth="1.5" />
          {/* 水 */}
          <g stroke={stroke} strokeWidth="0.8" fill="none" opacity="0.5">
            <path d="M4,38 Q14,36 24,38 T44,38" />
            <path d="M4,42 Q14,40 24,42 T44,42" />
          </g>
        </svg>
      );

    case "boat":
      // 舟
      return (
        <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
          {/* 船身 */}
          <path d="M6,30 Q24,38 42,30 L38,36 L10,36 Z" fill={stroke} stroke={stroke} strokeWidth="1.5" strokeLinejoin="round" />
          {/* 桅杆 */}
          <line x1="24" y1="30" x2="24" y2="8" stroke={stroke} strokeWidth="1.5" />
          {/* 帆 */}
          <path d="M24,10 L36,26 L24,26 Z" fill={accent} stroke={stroke} strokeWidth="1" />
          {/* 水波 */}
          <g stroke={stroke} strokeWidth="0.8" fill="none" opacity="0.5">
            <path d="M2,40 Q12,38 22,40 T44,40" />
            <path d="M2,44 Q12,42 22,44 T44,44" />
          </g>
        </svg>
      );

    case "tower":
      // 楼
      return (
        <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
          {/* 顶 */}
          <path d="M14,8 L24,4 L34,8 L30,12 L18,12 Z" fill={stroke} stroke={stroke} strokeWidth="1.2" strokeLinejoin="round" />
          {/* 上层 */}
          <rect x="18" y="12" width="12" height="8" fill={fill} stroke={stroke} strokeWidth="1.5" />
          <line x1="18" y1="16" x2="30" y2="16" stroke={stroke} strokeWidth="0.8" />
          {/* 中檐 */}
          <path d="M12,20 L36,20 L32,24 L16,24 Z" fill={stroke} stroke={stroke} strokeWidth="1.2" strokeLinejoin="round" />
          {/* 下层 */}
          <rect x="16" y="24" width="16" height="10" fill={fill} stroke={stroke} strokeWidth="1.5" />
          <line x1="16" y1="29" x2="32" y2="29" stroke={stroke} strokeWidth="0.8" />
          {/* 窗 */}
          <rect x="20" y="26" width="3" height="5" fill={accent} />
          <rect x="25" y="26" width="3" height="5" fill={accent} />
          {/* 基 */}
          <path d="M14,34 L34,34 L32,38 L16,38 Z" fill={fill} stroke={stroke} strokeWidth="1.5" />
        </svg>
      );

    case "tree":
      // 树
      return (
        <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
          {/* 干 */}
          <path d="M24,42 L24,22" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
          <path d="M24,30 L18,24 M24,28 L32,22" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
          {/* 冠 */}
          <ellipse cx="24" cy="16" rx="14" ry="10" fill={stroke} fillOpacity="0.6" />
          <ellipse cx="18" cy="18" rx="6" ry="5" fill={stroke} fillOpacity="0.8" />
          <ellipse cx="30" cy="18" rx="6" ry="5" fill={stroke} fillOpacity="0.8" />
          {/* 点缀 */}
          <circle cx="20" cy="14" r="1.5" fill={accent} />
          <circle cx="28" cy="16" r="1.5" fill={accent} />
          <circle cx="24" cy="20" r="1.5" fill={accent} />
        </svg>
      );

    case "moon":
      // 月
      return (
        <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
          {/* 月 */}
          <path d="M30,8 A14,14 0 1,0 30,40 A11,11 0 1,1 30,8 Z" fill={accent} fillOpacity="0.85" stroke={stroke} strokeWidth="1.5" />
          {/* 云 */}
          <g fill={fill} stroke={stroke} strokeWidth="1" opacity="0.7">
            <path d="M6,28 Q10,24 16,26 Q22,24 24,28 Q22,32 14,32 Q8,32 6,28 Z" />
            <path d="M28,36 Q32,33 38,35 Q42,34 44,36 Q42,39 36,39 Q30,39 28,36 Z" />
          </g>
          {/* 星 */}
          <g fill={stroke}>
            <circle cx="12" cy="14" r="1" />
            <circle cx="20" cy="10" r="0.8" />
            <circle cx="42" cy="20" r="1" />
          </g>
        </svg>
      );

    default:
      return null;
  }
}
