import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import ErrorBoundary from './components/ErrorBoundary'
import { markReady } from './lib/appReady'
import './index.css'

// 开场动画 · 等毛笔书写佳话完毕 · 触发时空穿越过渡后再移除
// 时长由 index.html inline script 写入 window.__BOOT_END__（毫秒）· 并记录开始时刻
// 此处按"剩余等待 = 总时长 - 已加载耗时"计算 · 确保 JS 加载慢也不跳过动画
// 若用户已点「入境」印章跳过 · __BOOT_SKIPPED__ 为 true · wait 归零立即进入移除流程
// 开场结束 -> markReady() 广播就绪 · 各页面入场动画据此触发 · 不再耦合 DOM 探测
const boot = document.getElementById('boot-loading')
if (boot) {
  const bootWindow = window as unknown as {
    __BOOT_END__?: number
    __BOOT_START__?: number
    __BOOT_SKIPPED__?: boolean
  }
  const totalMs = bootWindow.__BOOT_END__ || 5000
  const startMs = bootWindow.__BOOT_START__ || Date.now()
  const elapsed = Date.now() - startMs
  // 已跳过则 wait=0 · 否则按剩余等待
  const wait = bootWindow.__BOOT_SKIPPED__ ? 0 : Math.max(0, totalMs - elapsed)
  const finishBoot = () => {
    boot.classList.add('boot-warp')
    setTimeout(() => {
      boot.remove()
      markReady()
    }, 1200)
  }
  if (wait === 0) {
    finishBoot()
  } else {
    setTimeout(finishBoot, wait)
  }
} else {
  // 无开场遮罩（如 HMR 重载后）· 直接就绪
  markReady()
}
// 兜底 · 极端情况下 15s 后强制就绪 · 防止开场逻辑异常导致页面永远等待
setTimeout(markReady, 15000)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
