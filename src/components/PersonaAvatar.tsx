// 青砚其人 · 化身头像 — 随 agentPersona 渲染四种简笔角色
// 替代 LetterPaper 中硬编码的「书童」头像 · 与设置中人设联动
import type { AgentPersona } from "@/store/settingsStore";

interface PersonaAvatarProps {
  persona: AgentPersona;
  /** 容器类名 · 默认 w-10 h-10 */
  className?: string;
  /** aria-label · 传品牌名或人设名 */
  label?: string;
}

/**
 * 四种人设的简笔 SVG 头像
 * - shutong 书童：双髻 + 圆领小衣 · 伶俐
 * - wenren 文人：幞头 + 宽袍大袖 · 风雅
 * - daozhang 道长：道冠 + 道袍蓄须 · 清虚
 * - guanyan 馆员：乌纱 + 圆领官袍 · 严谨
 *
 * 配色沿用主题 CSS 变量 · 跨朝代自适应
 */
export default function PersonaAvatar({
  persona,
  className = "w-10 h-10",
  label,
}: PersonaAvatarProps) {
  return (
    <div
      className={`${className} flex items-center justify-center bg-qingbi/15 border border-qingbi/30`}
      style={{ borderRadius: "2px" }}
      aria-label={label ?? persona}
    >
      <svg viewBox="0 0 40 40" className="w-7 h-7" aria-hidden="true">
        {persona === "shutong" && (
          <>
            {/* 双髻 · 两侧小髻 */}
            <ellipse cx="14" cy="9" rx="3" ry="2" fill="rgb(var(--c-daiqing-rgb))" />
            <ellipse cx="26" cy="9" rx="3" ry="2" fill="rgb(var(--c-daiqing-rgb))" />
            {/* 脸 */}
            <circle cx="20" cy="18" r="8" fill="rgb(var(--c-xuanzhi-rgb))" stroke="rgb(var(--c-daiqing-rgb))" strokeWidth="1.2" />
            {/* 眼 */}
            <circle cx="17" cy="17" r="0.8" fill="rgb(var(--c-daiqing-rgb))" />
            <circle cx="23" cy="17" r="0.8" fill="rgb(var(--c-daiqing-rgb))" />
            {/* 嘴 · 微笑 */}
            <path d="M18,21 Q20,22.5 22,21" fill="none" stroke="rgb(var(--c-daiqing-rgb))" strokeWidth="1" strokeLinecap="round" />
            {/* 圆领小衣 */}
            <path d="M12,28 L20,25 L28,28 L28,36 L12,36 Z" fill="rgb(var(--c-qingbi-rgb))" stroke="rgb(var(--c-daiqing-rgb))" strokeWidth="1" />
            <line x1="20" y1="25" x2="20" y2="36" stroke="rgb(var(--c-daiqing-rgb))" strokeWidth="0.8" />
          </>
        )}

        {persona === "wenren" && (
          <>
            {/* 幞头 · 文人巾帽 · 方形展角 */}
            <path d="M10,10 L30,10 L32,8 L30,6 L10,6 L8,8 Z" fill="rgb(var(--c-daiqing-rgb))" />
            <rect x="13" y="8" width="14" height="3" fill="rgb(var(--c-daiqing-rgb))" />
            {/* 脸 */}
            <circle cx="20" cy="18" r="8" fill="rgb(var(--c-xuanzhi-rgb))" stroke="rgb(var(--c-daiqing-rgb))" strokeWidth="1.2" />
            {/* 眼 · 沉静 */}
            <circle cx="17" cy="17" r="0.8" fill="rgb(var(--c-daiqing-rgb))" />
            <circle cx="23" cy="17" r="0.8" fill="rgb(var(--c-daiqing-rgb))" />
            {/* 嘴 · 含蓄 */}
            <path d="M18.5,21 L21.5,21" stroke="rgb(var(--c-daiqing-rgb))" strokeWidth="1" strokeLinecap="round" />
            {/* 山羊须 · 文人风骨 */}
            <path d="M19,22 Q20,24 21,22" fill="none" stroke="rgb(var(--c-daiqing-rgb))" strokeWidth="0.6" />
            {/* 宽袍大袖 · 交领 */}
            <path d="M10,28 L20,25 L30,28 L30,36 L10,36 Z" fill="rgb(var(--c-zheshi-rgb) / 0.85)" stroke="rgb(var(--c-daiqing-rgb))" strokeWidth="1" />
            <path d="M15,28 L20,32 L25,28" fill="none" stroke="rgb(var(--c-daiqing-rgb))" strokeWidth="0.8" />
          </>
        )}

        {persona === "daozhang" && (
          <>
            {/* 道冠 · 黄冠 · 中高两侧低 */}
            <path d="M14,10 L20,4 L26,10 Z" fill="rgb(var(--c-daiqing-rgb))" />
            <rect x="17" y="6" width="6" height="6" fill="rgb(var(--c-daiqing-rgb))" />
            {/* 脸 */}
            <circle cx="20" cy="18" r="8" fill="rgb(var(--c-xuanzhi-rgb))" stroke="rgb(var(--c-daiqing-rgb))" strokeWidth="1.2" />
            {/* 眼 · 半阖 */}
            <path d="M16,17 Q17,17.5 18,17" fill="none" stroke="rgb(var(--c-daiqing-rgb))" strokeWidth="0.8" strokeLinecap="round" />
            <path d="M22,17 Q23,17.5 24,17" fill="none" stroke="rgb(var(--c-daiqing-rgb))" strokeWidth="0.8" strokeLinecap="round" />
            {/* 嘴 · 淡然 */}
            <path d="M18.5,21 L21.5,21" stroke="rgb(var(--c-daiqing-rgb))" strokeWidth="1" strokeLinecap="round" />
            {/* 长须 · 飘逸 */}
            <path d="M18,22 Q18,28 20,30 Q22,28 22,22" fill="none" stroke="rgb(var(--c-daiqing-rgb))" strokeWidth="0.8" strokeLinecap="round" />
            {/* 道袍 · 阴阳鱼领 */}
            <path d="M10,28 L20,25 L30,28 L30,36 L10,36 Z" fill="rgb(var(--c-qingbi-deep-rgb) / 0.7)" stroke="rgb(var(--c-daiqing-rgb))" strokeWidth="1" />
            <circle cx="20" cy="32" r="2" fill="none" stroke="rgb(var(--c-xuanzhi-light-rgb))" strokeWidth="0.6" />
            <path d="M20,30 A2,2 0 0,1 20,34 A2,2 0 0,0 20,30" fill="rgb(var(--c-xuanzhi-light-rgb))" opacity="0.5" />
          </>
        )}

        {persona === "guanyan" && (
          <>
            {/* 乌纱帽 · 两翅展角 */}
            <rect x="14" y="6" width="12" height="6" fill="rgb(var(--c-daiqing-rgb))" rx="1" />
            <path d="M8,9 L14,9 L14,11 L8,11 Z" fill="rgb(var(--c-daiqing-rgb))" />
            <path d="M26,9 L32,9 L32,11 L26,11 Z" fill="rgb(var(--c-daiqing-rgb))" />
            {/* 脸 */}
            <circle cx="20" cy="18" r="8" fill="rgb(var(--c-xuanzhi-rgb))" stroke="rgb(var(--c-daiqing-rgb))" strokeWidth="1.2" />
            {/* 眼 · 严肃 */}
            <circle cx="17" cy="17" r="0.8" fill="rgb(var(--c-daiqing-rgb))" />
            <circle cx="23" cy="17" r="0.8" fill="rgb(var(--c-daiqing-rgb))" />
            {/* 嘴 · 紧抿 */}
            <path d="M18,21 L22,21" stroke="rgb(var(--c-daiqing-rgb))" strokeWidth="1" strokeLinecap="round" />
            {/* 短须 · 端正 */}
            <path d="M19,22 L19,24 M21,22 L21,24" stroke="rgb(var(--c-daiqing-rgb))" strokeWidth="0.6" strokeLinecap="round" />
            {/* 圆领官袍 · 朱色补子 */}
            <path d="M10,28 L20,25 L30,28 L30,36 L10,36 Z" fill="rgb(var(--c-zhusha-deep-rgb) / 0.75)" stroke="rgb(var(--c-daiqing-rgb))" strokeWidth="1" />
            <rect x="17" y="29" width="6" height="4" fill="rgb(var(--c-liujin-rgb) / 0.6)" stroke="rgb(var(--c-daiqing-rgb))" strokeWidth="0.4" />
          </>
        )}
      </svg>
    </div>
  );
}
