import { lazy, Suspense, useEffect, useState } from "react";
import { HashRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import SettingsDrawer from "@/components/SettingsDrawer";
import { ensureKBSeeded } from "@/lib/kbInit";
import { useThemeStore, applyDynastyClass } from "@/store/themeStore";
import { ambience } from "@/lib/ambience";
import { validateVaultOnBoot } from "@/store/externalStore";

// 路由懒加载 · 分包减小首屏主包体积
const Home = lazy(() => import("@/pages/Home"));
const Chat = lazy(() => import("@/pages/Chat"));

/** 分包加载占位 · 以宣纸底色承接 · 避免白屏闪烁 */
function PageFallback() {
  return <div style={{ minHeight: "100vh", backgroundColor: "rgb(var(--c-xuanzhi-rgb))" }} />;
}

/**
 * 路由出口 · 以顶层路由为 key 包裹
 * Home ↔ Chat 切换时重新挂载触发墨韵入场动画
 * Chat 内 topic 变化（/chat/a ↔ /chat/b）同 key 不重挂 · 保留对话状态
 */
function PageRoutes({ onOpenSettings }: { onOpenSettings: () => void }) {
  const location = useLocation();
  const pageKey = location.pathname === "/" ? "home" : "chat";
  return (
    <div key={pageKey} className="animate-pageEnter">
      <Suspense fallback={<PageFallback />}>
        <Routes location={location}>
          <Route path="/" element={<Home onOpenSettings={onOpenSettings} />} />
          <Route path="/chat" element={<Chat onOpenSettings={onOpenSettings} />} />
          <Route path="/chat/:topic" element={<Chat onOpenSettings={onOpenSettings} />} />
        </Routes>
      </Suspense>
    </div>
  );
}

export default function App() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const dynasty = useThemeStore((s) => s.dynasty);

  // 首屏灌入华夏知识库种子 + 校验外接库配置有效性（路径失效则清空）
  useEffect(() => {
    void ensureKBSeeded();
    void validateVaultOnBoot();
  }, []);

  // 首次用户手势唤醒 AudioContext · 规避浏览器自动播放策略 · 一次即够
  useEffect(() => {
    const wake = () => ambience.resume();
    window.addEventListener("pointerdown", wake, { once: true });
    return () => window.removeEventListener("pointerdown", wake);
  }, []);

  // 朝代切换时 · 写入 <html> 根类名 · 驱动全局 CSS 变量
  useEffect(() => {
    applyDynastyClass(dynasty);
  }, [dynasty]);

  // HashRouter · hash 路由不依赖 history API · Electron file:// 协议下可正常跳转 · 兼容 GitHub Pages
  return (
    <Router>
      <PageRoutes onOpenSettings={() => setSettingsOpen(true)} />
      <SettingsDrawer open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </Router>
  );
}
