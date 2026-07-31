// 顶部导航 — 极简，含品牌名与返回首页 + 朝代切换 + 格物设置入口
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import DynastySwitcher from "./DynastySwitcher";
import { useDynastyMeta } from "@/store/themeStore";
import { ambience } from "@/lib/ambience";

interface NavbarProps {
  /** 是否显示返回按钮 */
  showBack?: boolean;
  /** 打开设置抽屉 */
  onOpenSettings?: () => void;
}

export default function Navbar({ showBack = false, onOpenSettings }: NavbarProps) {
  const location = useLocation();
  const isHome = location.pathname === "/";
  const meta = useDynastyMeta();
  const [muted, setMuted] = useState(ambience.isMuted());

  function toggleMute() {
    const next = !muted;
    ambience.setMuted(next);
    setMuted(next);
    if (!next) ambience.chime();
  }

  return (
    <header className="sticky top-0 z-30 backdrop-blur-md bg-xuanzhi/70 border-b border-qingbi/15">
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-baseline gap-3 group">
          {/* 品牌朱印 — 朝代品牌名 */}
          <span className="seal w-9 h-9 text-sm rotate-[-4deg] group-hover:rotate-0 transition-transform duration-500">
            {meta.brand}
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-brush text-2xl text-daiqing tracking-wider">{meta.brand}</span>
            <span className="font-song text-xs text-qingbi/70 tracking-widest">{meta.brandEn}</span>
          </div>
        </Link>

        <nav className="flex items-center gap-3 font-song text-sm text-daiqing/80">
          {showBack && !isHome && (
            <Link
              to="/"
              className="flex items-center gap-1.5 hover:text-qingbi transition-colors"
            >
              <ArrowLeft size={14} />
              <span>返首页</span>
            </Link>
          )}
          <span className="hidden sm:inline text-qingbi/50">|</span>
          <span className="hidden md:inline text-xs text-qingbi/60 tracking-widest">
            {meta.motto}
          </span>

          {/* 环境音 · 静音切换 — 钟磬式 */}
          <button
            onClick={toggleMute}
            className="flex items-center justify-center w-8 h-8 hover:bg-qingbi/8 transition-colors group"
            style={{ borderRadius: "2px" }}
            aria-label={muted ? "开启环境音" : "静音"}
            title={muted ? "开启环境音" : "静音"}
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-zheshi group-hover:scale-110 transition-transform duration-300" aria-hidden="true">
              {/* 简化钟磬 · 开声时带声波弧线 · 静音时一道斜杠 */}
              <path d="M6,10 L6,14 L10,14 L14,17 L14,7 L10,10 Z" fill="currentColor" opacity="0.85" />
              {muted ? (
                <path d="M16,9 L20,15 M20,9 L16,15" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              ) : (
                <>
                  <path d="M16,10 Q18,12 16,14" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                  <path d="M18,8 Q21,12 18,16" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
                </>
              )}
            </svg>
          </button>

          {/* 朝代切换器 · 紧凑模式 */}
          <DynastySwitcher compact />

          {/* 格物 · 设置入口 — 印章式按钮 */}
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-qingbi/8 transition-colors group"
              style={{ borderRadius: "2px" }}
              aria-label="案头格物 · 设置"
            >
              {/* 印章式齿轮图标 */}
              <span className="relative w-6 h-6 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-5 h-5 text-zheshi group-hover:rotate-90 transition-transform duration-500" aria-hidden="true">
                  {/* 外圈印章方框 */}
                  <rect x="3" y="3" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.4" rx="1" />
                  {/* 内部齿轮简化为十字 + 圆心 */}
                  <circle cx="12" cy="12" r="3.2" fill="none" stroke="currentColor" strokeWidth="1.2" />
                  <path d="M12,5 L12,8 M12,16 L12,19 M5,12 L8,12 M16,12 L19,12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
              </span>
              <span className="font-song text-xs text-daiqing/80 group-hover:text-qingbi tracking-wider hidden sm:inline">
                格物
              </span>
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
