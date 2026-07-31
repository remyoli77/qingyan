// 应用就绪事件总线 · 替代直接 DOM 探测 · 解耦开场动画与各页面入场逻辑
// 任何"开场结束后才能触发的动作"都应订阅 onReady · 而非自己查 #boot-loading
import { useEffect, useState } from "react";

const READY_EVENT = "app:ready";
let ready = false;

/** 标记应用就绪 · 由开场结束处调用一次 · 幂等 */
export function markReady() {
  if (ready) return;
  ready = true;
  window.dispatchEvent(new Event(READY_EVENT));
}

/** 当前是否已就绪 */
export function isReady() {
  return ready;
}

/** 订阅就绪 · 已就绪则立即回调 · 返回取消函数 */
export function onReady(cb: () => void): () => void {
  if (ready) {
    cb();
    return () => {};
  }
  const handler = () => {
    cb();
    window.removeEventListener(READY_EVENT, handler);
  };
  window.addEventListener(READY_EVENT, handler);
  return () => window.removeEventListener(READY_EVENT, handler);
}

/** React hook · 返回是否就绪 */
export function useAppReady(): boolean {
  const [r, setR] = useState(ready);
  useEffect(() => onReady(() => setR(true)), []);
  return r;
}
