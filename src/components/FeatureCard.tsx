// 多宝阁功能卡片 — 单个卡片含小幅 SVG 画作 + 朱印标签
import { Link } from "react-router-dom";
import type { Feature } from "@/types";
import Motif from "./Motif";
import Seal from "./Seal";

interface FeatureCardProps {
  feature: Feature;
  index: number;
}

export default function FeatureCard({ feature, index }: FeatureCardProps) {
  return (
    <Link
      to={`/chat/${feature.id}`}
      className="group relative block animate-liftUp"
      style={{ animationDelay: `${index * 100}ms`, opacity: 0 }}
    >
      <div
        className="
          relative h-full overflow-hidden
          bg-xuanzhi-light/85 backdrop-blur-sm
          border border-qingbi/15
          shadow-card
          transition-all duration-500
          group-hover:-translate-y-1.5
          group-hover:shadow-scroll
          group-hover:border-qingbi/40
        "
      >
        {/* 顶部装饰条 — 木格窗式 */}
        <div className="h-2 bg-gradient-to-r from-qingbi/30 via-liujin/40 to-qingbi/30" />

        {/* 画作区 */}
        <div
          className="relative aspect-[4/3] flex items-center justify-center overflow-hidden"
          style={{
            backgroundColor: "rgb(var(--c-xuanzhi-light-rgb))",
            backgroundImage:
              "radial-gradient(circle at 30% 30%, rgb(var(--c-qingbi-rgb) / 0.08) 0%, transparent 60%)",
          }}
        >
          {/* 远山底纹 */}
          <svg
            className="absolute bottom-0 left-0 w-full opacity-30"
            viewBox="0 0 200 60"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path d="M0,50 L30,35 L60,45 L90,30 L120,42 L150,28 L180,40 L200,32 L200,60 L0,60 Z" fill="rgb(var(--c-qingbi-rgb))" opacity="0.5" />
          </svg>

          <Motif
            motif={feature.motif}
            className="relative w-2/3 h-2/3 transition-transform duration-700 group-hover:scale-110"
          />

          {/* 朱印落款 */}
          <div className="absolute bottom-2 right-2 opacity-80">
            <Seal text={feature.title} size={32} shape="square" rotate={-3} />
          </div>
        </div>

        {/* 文字区 */}
        <div className="px-4 py-3 border-t border-qingbi/15">
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="font-song text-xl text-daiqing tracking-wider">{feature.title}</h3>
            <span className="font-song text-xs text-zheshi/80 tracking-widest">{feature.subtitle}</span>
          </div>
          <p className="mt-1.5 font-sans text-xs text-qingbi/70 leading-relaxed line-clamp-1">
            {feature.initialQuery}
          </p>
        </div>

        {/* 悬浮时的呼吸光晕 */}
        <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="absolute inset-0 bg-gradient-to-tr from-zhusha/0 via-zhusha/0 to-zhusha/5" />
        </div>
      </div>
    </Link>
  );
}
