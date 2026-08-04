// 首页 — 山水长卷 + 卷轴对话入口 + 多宝阁功能宫格
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ScrollMountains from "@/components/ScrollMountains";
import ScrollInput from "@/components/ScrollInput";
import TreasureGrid from "@/components/TreasureGrid";
import Seal from "@/components/Seal";
import DynastySwitcher from "@/components/DynastySwitcher";
import { useDynastyMeta } from "@/store/themeStore";
import { useAppReady } from "@/lib/appReady";
import { getFeatures } from "@/data/features";

/**
 * 轻量滚动入场 · 元素进入视口时触发一次 · 之后不再重置
 * 用于首页中下段 section · 徐徐浮入如卷轴展开 · 不喧宾夺主
 * ready: 是否允许触发 · 首页需等应用就绪（开场结束）后再观察 · 否则展开发生在用户看不见时
 */
function useInView<T extends HTMLElement>(threshold = 0.15, ready = true) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!ready) return;
    const el = ref.current;
    if (!el) return;

    const trigger = () => setInView(true);

    // 已在视口内（如短页面首屏即见）· 用双 rAF 确保浏览器先绘制 opacity-0 初始态
    // 否则 React 首次渲染即终态 · 浏览器不会播放 from→to 动画
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight) {
      requestAnimationFrame(() => requestAnimationFrame(trigger));
      return;
    }
    // 未在视口内 · 滚入时触发（此时初始态已绘制 · 动画正常播放）
    const ob = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          trigger();
          ob.disconnect();
        }
      },
      { threshold, rootMargin: "0px 0px -8% 0px" },
    );
    ob.observe(el);
    return () => ob.disconnect();
  }, [threshold, ready]);
  return { ref, inView };
}

export default function Home({ onOpenSettings }: { onOpenSettings?: () => void }) {
  const navigate = useNavigate();
  const meta = useDynastyMeta();
  const appReady = useAppReady();
  const mid = useInView<HTMLElement>(0.15, appReady);
  const lower = useInView<HTMLElement>(0.15, appReady);
  // 试问词 · 取当前朝代六事雅赏的前四条 · 朝代切换时自动换新
  const prompts = getFeatures(meta.id).slice(0, 4).map((f) => f.initialQuery);

  function handleSubmit(text: string) {
    navigate("/chat", { state: { initialQuery: text } });
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* 顶部山水长卷 */}
      <section className="relative w-full overflow-hidden border-b-2 border-qingbi/20">
        <ScrollMountains className="w-full h-[42vh] min-h-[280px] block" animated />

        {/* 右上角 · 朝代切换 + 格物设置浮动按钮 — 印章式，不破坏山水沉浸感 */}
        <div className="absolute top-4 right-5 z-10 flex items-center gap-2">
          <DynastySwitcher />
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="flex items-center gap-1.5 px-3 py-2 backdrop-blur-md bg-xuanzhi/50 hover:bg-xuanzhi/75 border border-qingbi/20 transition-all group"
              style={{ borderRadius: "2px" }}
              aria-label="案头格物 · 设置"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 text-zheshi group-hover:rotate-90 transition-transform duration-500" aria-hidden="true">
                <rect x="3" y="3" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.4" rx="1" />
                <circle cx="12" cy="12" r="3.2" fill="none" stroke="currentColor" strokeWidth="1.2" />
                <path d="M12,5 L12,8 M12,16 L12,19 M5,12 L8,12 M16,12 L19,12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
              <span className="font-song text-[11px] text-daiqing/80 group-hover:text-qingbi tracking-wider">格物</span>
            </button>
          )}
        </div>

        {/* 浮层：品牌名 + slogan — 随朝代变化 · 留白至上 · 印章与落款移至底边 */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <h1
            className="font-brush text-6xl sm:text-7xl text-daiqing tracking-[0.3em] animate-inkSpread"
            style={{ animationDelay: "0.3s", opacity: 0, textShadow: "0 2px 8px rgb(var(--c-xuanzhi-light-rgb) / 0.6)" }}
          >
            {meta.brand}
          </h1>
          <p
            className="mt-5 font-song text-base sm:text-lg text-daiqing/80 tracking-[0.4em] animate-inkSpread"
            style={{ animationDelay: "0.7s", opacity: 0 }}
          >
            {meta.slogan}
          </p>
        </div>

        {/* 卷轴底边落款 — 副标 + 朝代意境 + 印文 · 淡入显于底边 */}
        <div className="absolute bottom-3 left-0 right-0 flex items-center justify-between px-6">
          <span
            className="font-song text-xs text-qingbi/70 tracking-widest animate-inkSpread"
            style={{ animationDelay: "1.1s", opacity: 0 }}
          >
            {meta.subtitle}
          </span>
          <div
            className="flex items-center gap-2 animate-inkSpread"
            style={{ animationDelay: "1.3s", opacity: 0 }}
          >
            <span className="font-song text-[10px] text-qingbi/70 tracking-widest">{meta.vibe}</span>
            <Seal text={meta.sealText} size={24} shape="round" rotate={6} />
          </div>
        </div>
      </section>

      {/* 中段：卷轴对话入口 · 滚入视口徐徐浮起 */}
      <section
        ref={mid.ref}
        className={`py-12 px-6 bg-xuanzhi/60 ${mid.inView ? "animate-sectionRise" : "opacity-0"}`}
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-2">
              <span className="w-12 h-px bg-qingbi/30" />
              <span className="font-song text-xs text-qingbi/60 tracking-widest">落笔所求</span>
              <span className="w-12 h-px bg-qingbi/30" />
            </div>
            <h2 className="font-brush text-3xl text-daiqing tracking-wider">
              有何雅事，但说无妨
            </h2>
            <p className="mt-2 font-song text-sm text-qingbi/70 tracking-wider">
              {meta.brand}可代拟诗词 · 解读书画 · 详述茶道 · 应节气 · 考琴曲 · 策划雅集
            </p>
          </div>

          <ScrollInput onSubmit={handleSubmit} reveal={mid.inView} />

          {/* 竹简提示词 · 取当前朝代六事雅赏 · 切换朝代自动换新 */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-2.5">
            <span className="font-song text-xs text-qingbi/50 mr-1 tracking-widest">试问：</span>
            {prompts.map((s, i) => (
              <button
                key={i}
                onClick={() => handleSubmit(s)}
                className="px-3 py-1.5 font-song text-xs text-daiqing/80 bg-xuanzhi-deep/60 border border-qingbi/20 hover:border-zhusha/50 hover:bg-xuanzhi-deep transition-all duration-300"
                style={{
                  borderRadius: "2px",
                  backgroundImage:
                    "repeating-linear-gradient(90deg, rgb(var(--c-qingbi-rgb) / 0.08) 0px, rgb(var(--c-qingbi-rgb) / 0.08) 1px, transparent 1px, transparent 12px)",
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 下段：多宝阁功能宫格 · 滚入视口徐徐浮起 */}
      <section
        ref={lower.ref}
        className={`py-14 px-6 bg-gradient-to-b from-xuanzhi/40 to-xuanzhi-deep/30 ${lower.inView ? "animate-sectionRise" : "opacity-0"}`}
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-3 mb-2">
              <span className="w-12 h-px bg-qingbi/30" />
              <span className="font-song text-xs text-qingbi/60 tracking-widest">多宝阁 · 雅事六品</span>
              <span className="w-12 h-px bg-qingbi/30" />
            </div>
            <h2 className="font-brush text-3xl text-daiqing tracking-wider">六事雅赏</h2>
            <p className="mt-2 font-song text-sm text-qingbi/70 tracking-wider">
              点之即问 · 卷自展开
            </p>
          </div>

          <TreasureGrid />
        </div>
      </section>

      {/* 页脚落款 — 朝代 motto */}
      <footer className="py-8 px-6 border-t border-qingbi/15 bg-xuanzhi/70">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Seal text={meta.brand} size={32} shape="square" rotate={-3} />
            <div>
              <p className="font-brush text-lg text-daiqing tracking-wider">{meta.brand}</p>
              <p className="font-song text-[10px] text-qingbi/50 tracking-widest">
                {meta.motto}
              </p>
            </div>
          </div>
          <p className="font-song text-xs text-qingbi/50 tracking-widest">
            落笔成笺 · 鸿雁传书 · 此处即山阴
          </p>
        </div>
      </footer>
    </div>
  );
}
