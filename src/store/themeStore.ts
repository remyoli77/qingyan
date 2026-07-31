// 朝代主题状态 — 持久化到 localStorage，切换时改变全局 CSS 变量与字体
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ambience } from "@/lib/ambience";

export type Dynasty = "song" | "ming" | "qin" | "tang";

export interface DynastyMeta {
  id: Dynasty;
  /** 朝代字 · 用于切换按钮 */
  char: string;
  /** 朝代全称 */
  name: string;
  /** 品牌名 · 首屏大字 */
  brand: string;
  /** 拼音 · 导航副标 */
  brandEn: string;
  /** 主标语 */
  slogan: string;
  /** 副标语 */
  subtitle: string;
  /** 底部 motto */
  motto: string;
  /** 拟朝印文 */
  sealText: string;
  /** 落款自称 */
  signoff: string;
  /** CSS 根类名 */
  themeClass: string;
  /** 主题意境短语 · 切换提示 */
  vibe: string;
  /** 朝代风格描述 · 注入大模型系统提示 · 指引文风与典据取向 */
  promptHint: string;
  /** 思考中提示雅词 · 取本朝文房茶事动作 · 四字 */
  thinkingHint: string;
}

export const DYNASTIES: Record<Dynasty, DynastyMeta> = {
  song: {
    id: "song",
    char: "宋",
    name: "宋朝",
    brand: "青砚",
    brandEn: "QING YAN",
    slogan: "研墨铺纸 · 与君清话",
    subtitle: "一方青砚 · 国风 AI 雅伴",
    motto: "以青绿为骨 · 以宋韵为魂",
    sealText: "拟宋",
    signoff: "青砚谨复",
    themeClass: "theme-song",
    vibe: "青绿山水 · 文人雅致",
    promptHint:
      "此刻为宋朝雅伴，以宋代文人审美为魂，尚青绿山水、淡雅简远。典据多引苏黄米蔡、范宽郭熙、《茶录》《大观茶论》，诗词重宋词清旷，茶道尚点茶之法，书画尚文人写意。回答须以宋韵为底色，文风雅正简远。",
    thinkingHint: "研墨凝思",
  },
  ming: {
    id: "ming",
    char: "明",
    name: "明朝",
    brand: "青花",
    brandEn: "QING HUA",
    slogan: "青花为骨 · 匠心为魂",
    subtitle: "一方青花 · 国风 AI 雅伴",
    motto: "以青花为骨 · 以明韵为魂",
    sealText: "拟明",
    signoff: "青花谨复",
    themeClass: "theme-ming",
    vibe: "青花瓷韵 · 富丽端庄",
    promptHint:
      "此刻为明朝雅伴，以明代吴门审美为魂，尚青花瓷韵、富丽端庄。典据多引沈周文徵明唐寅仇英、朱权《茶谱》、王阳明心学，诗词重吴中风流，茶道尚瀹泡散茶，书画尚明四家笔。回答须以明韵为底色，文风端庄而见匠心。",
    thinkingHint: "瀹茗澄心",
  },
  qin: {
    id: "qin",
    char: "秦",
    name: "秦朝",
    brand: "玄墨",
    brandEn: "XUAN MO",
    slogan: "以法为度 · 以墨为言",
    subtitle: "一方玄墨 · 国风 AI 雅伴",
    motto: "以玄墨为骨 · 以秦风为魂",
    sealText: "拟秦",
    signoff: "玄墨谨复",
    themeClass: "theme-qin",
    vibe: "玄墨竹简 · 肃穆古拙",
    promptHint:
      "此刻为秦朝雅伴，以秦代法度审美为魂，尚玄墨竹简、肃穆古拙。典据多引李斯小篆《泰山刻石》《峄山碑》、《诗经·秦风》、商鞅变法、百工法度，诗词尚四言古风，茶道考煮羹古法，书画重金石刻石。回答须以秦风为底色，文风古拙肃穆，言简而意重。",
    thinkingHint: "刻简沉吟",
  },
  tang: {
    id: "tang",
    char: "唐",
    name: "唐朝",
    brand: "紫毫",
    brandEn: "ZI HAO",
    slogan: "提笔赋咏 · 大唐风华",
    subtitle: "一方紫毫 · 国风 AI 雅伴",
    motto: "以金紫为骨 · 以唐风为魂",
    sealText: "拟唐",
    signoff: "紫毫谨复",
    themeClass: "theme-tang",
    vibe: "金碧辉煌 · 大唐气象",
    promptHint:
      "此刻为唐朝雅伴，以盛唐气象为魂，尚金碧辉煌、雍容华贵。典据多引李杜诗篇、阎立本吴道子丹青、陆羽《茶经》、曲江流饮，诗词重盛唐律声，茶道尚煎茶之法，书画尚丹青神品。回答须以唐韵为底色，文风雍容大气，气象恢弘。",
    thinkingHint: "煎茶涤虑",
  },
};

export const DYNASTY_LIST: Dynasty[] = ["song", "ming", "qin", "tang"];

interface ThemeState {
  dynasty: Dynasty;
  setDynasty: (d: Dynasty) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      dynasty: "song",
      setDynasty: (dynasty) => set({ dynasty }),
    }),
    { name: "qingyan-dynasty" },
  ),
);

/** 取当前朝美元数据 */
export function useDynastyMeta(): DynastyMeta {
  return DYNASTIES[useThemeStore((s) => s.dynasty)];
}

/** 将朝代根类名写入 <html> · 在 App 挂载时与切换时调用 */
export function applyDynastyClass(dynasty: Dynasty) {
  const meta = DYNASTIES[dynasty];
  const html = document.documentElement;
  // 清除旧主题类
  DYNASTY_LIST.forEach((d) => html.classList.remove(DYNASTIES[d].themeClass));
  html.classList.add(meta.themeClass);
}

/**
 * 切换朝代 · 墨染过渡
 * 一抹薄墨从右上角（切换按钮所在）晕开覆盖全屏 · 切换主题 · 墨色褪去
 * 儒雅如宣纸浸墨 · 不张扬
 */
export function switchDynasty(dynasty: Dynasty) {
  const meta = DYNASTIES[dynasty];
  // 已有过渡层在跑 · 直接跳过避免叠加
  if (document.getElementById("dynasty-veil")) return;

  const veil = document.createElement("div");
  veil.id = "dynasty-veil";
  veil.style.cssText = [
    "position:fixed",
    "inset:0",
    "z-index:9998",
    "pointer-events:none",
    `background:radial-gradient(circle at 88% 8%, rgb(var(--c-daiqing-rgb) / 0.55) 0%, rgb(var(--c-daiqing-rgb) / 0.3) 35%, transparent 75%)`,
    "opacity:0",
    "transition:opacity 0.45s ease-out",
  ].join(";");

  // 朝代字 · 居中淡入 · 如墨韵中的一枚印记
  const mark = document.createElement("div");
  mark.style.cssText = [
    "position:absolute",
    "inset:0",
    "display:flex",
    "align-items:center",
    "justify-content:center",
    `font-family:'Ma Shan Zheng','Noto Serif SC',serif`,
    `font-size:clamp(4rem,14vmin,9rem)`,
    `color:rgb(var(--c-zhusha-rgb) / 0.6)`,
    "opacity:0",
    "transform:scale(1.3)",
    "transition:opacity 0.5s ease-out 0.2s, transform 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.2s",
    "text-shadow:0 4px 24px rgb(var(--c-zhusha-rgb) / 0.25)",
    "letter-spacing:0.1em",
  ].join(";");
  mark.textContent = meta.char;
  veil.appendChild(mark);

  document.body.appendChild(veil);
  // 一帧后触发过渡 · 薄墨晕开 + 朝代字浮现
  requestAnimationFrame(() => {
    veil.style.opacity = "1";
    mark.style.opacity = "0.85";
    mark.style.transform = "scale(1)";
  });

  // 墨色覆满时切换主题类 · 此时被遮罩掩盖 · 无闪烁 · 同时奏一声钟磬
  setTimeout(() => {
    applyDynastyClass(dynasty);
    useThemeStore.getState().setDynasty(dynasty);
    ambience.dynastySwitch();
  }, 280);

  // 薄墨褪去 · 露出新朝代色
  setTimeout(() => {
    veil.style.opacity = "0";
    mark.style.opacity = "0";
    mark.style.transform = "scale(1.1)";
  }, 900);

  // 移除过渡层
  setTimeout(() => veil.remove(), 1400);
}
