// 朱印组件 — 可复用的印章元素
interface SealProps {
  /** 印文，1-4 字 */
  text: string;
  /** 形状 */
  shape?: "square" | "round";
  /** 尺寸 px */
  size?: number;
  /** 倾斜角度 */
  rotate?: number;
  /** 是否播放「钤印」入场动画 · 按下-轻颤-落定 · 落款印章用 */
  stamp?: boolean;
  className?: string;
}

export default function Seal({
  text,
  shape = "square",
  size = 40,
  rotate = 0,
  stamp = false,
  className = "",
}: SealProps) {
  const chars = Array.from(text).slice(0, 4);
  // 印文按 2x2 排布（篆印传统），不足补空
  while (chars.length < 4) chars.push("　");

  const isRound = shape === "round";

  return (
    <span
      className={`seal inline-flex items-center justify-center ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius: isRound ? "50%" : "4px",
        transform: `rotate(${rotate}deg)`,
        fontSize: size * 0.22,
        padding: size * 0.08,
        boxShadow: "0 2px 4px rgb(var(--c-zhusha-rgb) / 0.3), inset 0 0 0 1px rgb(var(--c-xuanzhi-light-rgb) / 0.4)",
        // 钤印动画 · stamp 时启用 · 按下-轻颤-落定
        animation: stamp ? "seal-stamp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards" : undefined,
      }}
      aria-label={`印章：${text}`}
    >
      <span
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gridTemplateRows: "1fr 1fr",
          width: "100%",
          height: "100%",
          textAlign: "center",
          alignItems: "center",
          justifyItems: "center",
          lineHeight: 1,
          gap: size * 0.04,
        }}
      >
        {chars.map((c, i) => (
          <span key={i} style={{ fontSize: size * 0.24 }}>{c}</span>
        ))}
      </span>
    </span>
  );
}
