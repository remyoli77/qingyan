import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import Home from "@/pages/Home";
import Chat from "@/pages/Chat";
import SettingsDrawer from "@/components/SettingsDrawer";
import { ensureKBSeeded } from "@/lib/kbInit";
import { useThemeStore, applyDynastyClass } from "@/store/themeStore";
import { ambience } from "@/lib/ambience";

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
      <Routes location={location}>
        <Route path="/" element={<Home onOpenSettings={onOpenSettings} />} />
        <Route path="/chat" element={<Chat onOpenSettings={onOpenSettings} />} />
        <Route path="/chat/:topic" element={<Chat onOpenSettings={onOpenSettings} />} />
      </Routes>
    </div>
  );
}

export default function App() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const dynasty = useThemeStore((s) => s.dynasty);

  // 首屏灌入华夏知识库种子
  useEffect(() => {
    void ensureKBSeeded();
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

  // basename 取 Vite 的 base · GitHub Pages 子路径部署时自动适配 · Electron/Web 根路径时为 "/"
  return (
    <Router basename={import.meta.env.BASE_URL}>
      <PageRoutes onOpenSettings={() => setSettingsOpen(true)} />
      <SettingsDrawer open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </Router>
  );
}
