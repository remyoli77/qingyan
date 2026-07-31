// 研思中物象图标 · 四朝各取其静心动作的器物 · SVG + 专属动画
// 宋·研墨凝思 · 墨锭绕砚打圈 · 墨池渐深 + 研磨处涟漪
// 明·瀹茗澄心 · 茶盏蒸汽袅袅 · 茶汤晃动 + 液面高光游移
// 秦·刻简沉吟 · 刻刀落简 · 木屑坠落 + 新刻笔痕浮现
// 唐·煎茶涤虑 · 风炉火苗跳动 + 蒸汽 · 余烬冉冉上升
import type { Dynasty } from "@/store/themeStore";

export default function ThinkingIcon({ dynasty }: { dynasty: Dynasty }) {
  if (dynasty === "song") {
    // 宋 · 砚台 + 墨锭打圈研磨 · 墨池渐深 + 研磨涟漪
    return (
      <span className="relative inline-flex items-center justify-center w-6 h-6 shrink-0">
        <svg viewBox="0 0 24 24" className="w-6 h-6" aria-hidden="true">
          {/* 砚台椭圆 ·黛青 */}
          <ellipse cx="12" cy="15" rx="8" ry="3" fill="rgb(var(--c-daiqing-rgb) / 0.35)" />
          <ellipse cx="12" cy="14" rx="7" ry="2.4" fill="rgb(var(--c-daiqing-rgb) / 0.55)" stroke="rgb(var(--c-qingbi-rgb))" strokeWidth="0.8" />
          {/* 墨池 · 渐深渐淡 · 如墨色随研磨浓淡变化 */}
          <ellipse className="animate-inkPoolDeepen" style={{ transformOrigin: "12px 14px" }} cx="12" cy="14" rx="4" ry="1.4" fill="rgb(var(--c-daiqing-rgb))" />
          {/* 研磨涟漪 · 墨锭落处泛起细涟漪 · 两圈错开 */}
          <circle className="animate-inkRippleMini" style={{ transformOrigin: "12px 11px", animationDelay: "0s" }} cx="12" cy="11" r="1.6" fill="none" stroke="rgb(var(--c-qingbi-rgb) / 0.5)" strokeWidth="0.4" />
          <circle className="animate-inkRippleMini" style={{ transformOrigin: "12px 11px", animationDelay: "0.75s" }} cx="12" cy="11" r="1.6" fill="none" stroke="rgb(var(--c-qingbi-rgb) / 0.5)" strokeWidth="0.4" />
          {/* 墨锭 · 绕砚台中心打圈 · 用 g 包裹做 orbit */}
          <g className="animate-inkGrindOrbit" style={{ transformOrigin: "12px 14px" }}>
            <rect x="11" y="9" width="2" height="4" rx="0.5" fill="rgb(var(--c-daiqing-rgb))" stroke="rgb(var(--c-qingbi-rgb))" strokeWidth="0.5" />
          </g>
        </svg>
      </span>
    );
  }

  if (dynasty === "ming") {
    // 明 · 青花茶盏 + 三缕蒸汽 · 茶汤晃动 + 液面高光游移
    return (
      <span className="relative inline-flex items-center justify-center w-6 h-6 shrink-0">
        <svg viewBox="0 0 24 24" className="w-6 h-6" aria-hidden="true">
          {/* 蒸汽 · 三缕错开上升淡出 */}
          <path className="animate-steamRise" style={{ animationDelay: "0s", transformOrigin: "center" }} d="M9,8 Q8.5,6 9,4 Q9.5,2 9,0" fill="none" stroke="rgb(var(--c-qingbi-rgb) / 0.6)" strokeWidth="0.9" strokeLinecap="round" />
          <path className="animate-steamRise" style={{ animationDelay: "0.7s", transformOrigin: "center" }} d="M12,8 Q12.5,6 12,4 Q11.5,2 12,0" fill="none" stroke="rgb(var(--c-qingbi-rgb) / 0.6)" strokeWidth="0.9" strokeLinecap="round" />
          <path className="animate-steamRise" style={{ animationDelay: "1.4s", transformOrigin: "center" }} d="M15,8 Q14.5,6 15,4 Q15.5,2 15,0" fill="none" stroke="rgb(var(--c-qingbi-rgb) / 0.6)" strokeWidth="0.9" strokeLinecap="round" />
          {/* 茶盏身 · 青花纹 */}
          <path d="M6,11 Q6,17 12,18 Q18,17 18,11 Z" fill="rgb(var(--c-xuanzhi-light-rgb))" stroke="rgb(var(--c-qingbi-rgb))" strokeWidth="1" />
          {/* 青花纹饰 */}
          <path d="M8,12 Q9,13 10,12 Q11,13 12,12 Q13,13 14,12 Q15,13 16,12" fill="none" stroke="rgb(var(--c-qingbi-rgb))" strokeWidth="0.6" opacity="0.7" />
          {/* 茶汤 · 微微晃动 */}
          <ellipse className="animate-teaSway" style={{ transformOrigin: "12px 11px" }} cx="12" cy="11" rx="6" ry="1.2" fill="rgb(var(--c-zheshi-rgb) / 0.5)" />
          {/* 茶汤高光 · 液面反光游移 */}
          <ellipse className="animate-teaGlint" style={{ transformOrigin: "12px 11px" }} cx="10.5" cy="10.7" rx="1.8" ry="0.35" fill="rgb(var(--c-xuanzhi-light-rgb) / 0.8)" />
          {/* 盏托 */}
          <ellipse cx="12" cy="19" rx="7" ry="1" fill="rgb(var(--c-zheshi-rgb) / 0.4)" />
        </svg>
      </span>
    );
  }

  if (dynasty === "qin") {
    // 秦 · 竹简 + 刻刀上下刻动 · 木屑坠落 + 新刻笔痕浮现
    return (
      <span className="relative inline-flex items-center justify-center w-6 h-6 shrink-0">
        <svg viewBox="0 0 24 24" className="w-6 h-6" aria-hidden="true">
          {/* 两枚竹简 */}
          <rect x="7" y="4" width="3" height="16" rx="0.6" fill="rgb(var(--c-xuanzhi-deep-rgb))" stroke="rgb(var(--c-zheshi-rgb))" strokeWidth="0.6" />
          <rect x="14" y="4" width="3" height="16" rx="0.6" fill="rgb(var(--c-xuanzhi-deep-rgb))" stroke="rgb(var(--c-zheshi-rgb))" strokeWidth="0.6" />
          {/* 简上文字横线 */}
          <line x1="7.5" y1="7" x2="9.5" y2="7" stroke="rgb(var(--c-daiqing-rgb) / 0.6)" strokeWidth="0.5" />
          <line x1="7.5" y1="10" x2="9.5" y2="10" stroke="rgb(var(--c-daiqing-rgb) / 0.6)" strokeWidth="0.5" />
          <line x1="7.5" y1="13" x2="9.5" y2="13" stroke="rgb(var(--c-daiqing-rgb) / 0.6)" strokeWidth="0.5" />
          <line x1="7.5" y1="16" x2="9.5" y2="16" stroke="rgb(var(--c-daiqing-rgb) / 0.6)" strokeWidth="0.5" />
          <line x1="14.5" y1="7" x2="16.5" y2="7" stroke="rgb(var(--c-daiqing-rgb) / 0.6)" strokeWidth="0.5" />
          <line x1="14.5" y1="10" x2="16.5" y2="10" stroke="rgb(var(--c-daiqing-rgb) / 0.6)" strokeWidth="0.5" />
          <line x1="14.5" y1="13" x2="16.5" y2="13" stroke="rgb(var(--c-daiqing-rgb) / 0.6)" strokeWidth="0.5" />
          {/* 新刻笔痕 · 刀落处浮现一新刻横线 · 周期同步刻刀 */}
          <line className="animate-carveFlash" style={{ transformOrigin: "center" }} x1="11" y1="10.2" x2="13" y2="10.2" stroke="rgb(var(--c-daiqing-rgb))" strokeWidth="0.6" />
          {/* 刻刀 · 上下刻动 · 赭石刀身 */}
          <g className="animate-carveDown" style={{ transformOrigin: "center" }}>
            <path d="M11,9 L13,9 L13.5,11 L10.5,11 Z" fill="rgb(var(--c-zheshi-rgb))" stroke="rgb(var(--c-daiqing-rgb))" strokeWidth="0.5" />
            <rect x="11.5" y="11" width="1" height="3" fill="rgb(var(--c-liujin-deep-rgb))" />
          </g>
          {/* 木屑 · 刀尖处碎屑坠落 · 三片错开 */}
          <rect className="animate-chipFall" style={{ transformOrigin: "12px 11px", animationDelay: "0s" }} x="11.8" y="11" width="0.5" height="0.8" fill="rgb(var(--c-zheshi-rgb))" />
          <rect className="animate-chipFall" style={{ transformOrigin: "12px 11px", animationDelay: "0.4s" }} x="12.1" y="11" width="0.4" height="0.6" fill="rgb(var(--c-zheshi-rgb) / 0.8)" />
          <rect className="animate-chipFall" style={{ transformOrigin: "12px 11px", animationDelay: "0.8s" }} x="11.6" y="11" width="0.45" height="0.7" fill="rgb(var(--c-zheshi-rgb) / 0.7)" />
        </svg>
      </span>
    );
  }

  // 唐 · 风炉茶釜 + 火苗跳动 + 蒸汽 + 余烬上升
  return (
    <span className="relative inline-flex items-center justify-center w-6 h-6 shrink-0">
      <svg viewBox="0 0 24 24" className="w-6 h-6" aria-hidden="true">
        {/* 蒸汽 */}
        <path className="animate-steamRise" style={{ animationDelay: "0s", transformOrigin: "center" }} d="M10,7 Q9.5,5 10,3" fill="none" stroke="rgb(var(--c-qingbi-rgb) / 0.5)" strokeWidth="0.8" strokeLinecap="round" />
        <path className="animate-steamRise" style={{ animationDelay: "1s", transformOrigin: "center" }} d="M14,7 Q14.5,5 14,3" fill="none" stroke="rgb(var(--c-qingbi-rgb) / 0.5)" strokeWidth="0.8" strokeLinecap="round" />
        {/* 茶釜 · 圆腹 */}
        <ellipse cx="12" cy="12" rx="6" ry="4.5" fill="rgb(var(--c-daiqing-rgb) / 0.85)" stroke="rgb(var(--c-qingbi-rgb))" strokeWidth="1" />
        {/* 釜口 */}
        <ellipse cx="12" cy="8" rx="3" ry="1" fill="rgb(var(--c-daiqing-rgb))" stroke="rgb(var(--c-qingbi-rgb))" strokeWidth="0.8" />
        {/* 风炉 · 三足 */}
        <line x1="8" y1="16" x2="7" y2="20" stroke="rgb(var(--c-zheshi-rgb))" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="12" y1="16.5" x2="12" y2="20" stroke="rgb(var(--c-zheshi-rgb))" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="16" y1="16" x2="17" y2="20" stroke="rgb(var(--c-zheshi-rgb))" strokeWidth="1.2" strokeLinecap="round" />
        {/* 余烬 · 火苗旁火星冉冉上升 · 三颗错开 */}
        <circle className="animate-emberRise" style={{ transformOrigin: "10px 18px", animationDelay: "0s" }} cx="10" cy="18" r="0.5" fill="rgb(var(--c-zhusha-rgb))" />
        <circle className="animate-emberRise" style={{ transformOrigin: "14px 18px", animationDelay: "0.5s" }} cx="14" cy="18" r="0.45" fill="rgb(var(--c-zhusha-rgb) / 0.8)" />
        <circle className="animate-emberRise" style={{ transformOrigin: "12px 18px", animationDelay: "1s" }} cx="12" cy="18" r="0.4" fill="rgb(var(--c-liujin-rgb))" />
        {/* 炉膛火苗 · 双层 · 朱砂外焰 + 鎏金内焰 · 跳动 */}
        <path className="animate-flameDance" style={{ transformOrigin: "12px 19px" }} d="M12,19 Q10,17 11,15 Q11.5,16 12,15 Q12.5,16 13,15 Q14,17 12,19 Z" fill="rgb(var(--c-zhusha-rgb))" />
        <path className="animate-flameDance" style={{ transformOrigin: "12px 18px", animationDelay: "0.1s" }} d="M12,18.5 Q11,17 11.5,16 Q12,16.5 12,16 Q12,16.5 12.5,16 Q13,17 12,18.5 Z" fill="rgb(var(--c-liujin-rgb) / 0.85)" />
      </svg>
    </span>
  );
}
