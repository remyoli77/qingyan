/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        // 国风配色 — 通过 CSS 变量实现三朝切换 · rgb() 格式支持透明度修饰符
        qingbi: "rgb(var(--c-qingbi-rgb) / <alpha-value>)",       // 主色 宋·青碧 / 明·青花蓝 / 秦·青铜绿
        qingbiDeep: "rgb(var(--c-qingbi-deep-rgb) / <alpha-value>)",
        qingbiLight: "rgb(var(--c-qingbi-light-rgb) / <alpha-value>)",
        daiqing: "rgb(var(--c-daiqing-rgb) / <alpha-value>)",     // 深色 宋·黛青 / 明·墨蓝 / 秦·玄黑
        daiqingSoft: "rgb(var(--c-daiqing-soft-rgb) / <alpha-value>)",
        xuanzhi: "rgb(var(--c-xuanzhi-rgb) / <alpha-value>)",     // 纸色 宋·宣纸 / 明·线装书白 / 秦·竹简黄
        xuanzhiDeep: "rgb(var(--c-xuanzhi-deep-rgb) / <alpha-value>)",
        xuanzhiLight: "rgb(var(--c-xuanzhi-light-rgb) / <alpha-value>)",
        zheshi: "rgb(var(--c-zheshi-rgb) / <alpha-value>)",       // 点缀 宋·赭石 / 明·矾红 / 秦·古铜
        zheshiLight: "rgb(var(--c-zheshi-light-rgb) / <alpha-value>)",
        zhusha: "rgb(var(--c-zhusha-rgb) / <alpha-value>)",       // 朱印 朱砂
        zhushaDeep: "rgb(var(--c-zhusha-deep-rgb) / <alpha-value>)",
        liujin: "rgb(var(--c-liujin-rgb) / <alpha-value>)",       // 洒金 宋·鎏金 / 明·帝金 / 秦·古铜金
        liujinDeep: "rgb(var(--c-liujin-deep-rgb) / <alpha-value>)",
      },
      fontFamily: {
        brush: ['var(--font-brush)', 'STKaiti', 'KaiTi', 'serif'],       // 书法体 — 朝代可变
        seal: ['var(--font-seal)', '"Noto Serif SC"', 'STSong', 'SimSun', 'serif'],  // 篆印体
        song: ['var(--font-song)', 'STSong', 'SimSun', 'Songti SC', 'serif'],        // 宋体/正体
        sans: ['"Noto Sans SC"', 'PingFang SC', 'Microsoft YaHei', 'sans-serif'],    // 黑体 — 通用
      },
      boxShadow: {
        seal: '0 2px 4px rgb(var(--c-zhusha-rgb) / 0.25)',
        scroll: '0 8px 24px rgb(var(--c-daiqing-rgb) / 0.12)',
        card: '0 4px 16px rgb(var(--c-daiqing-rgb) / 0.08)',
      },
      backgroundImage: {
        'paper-texture': "radial-gradient(circle at 20% 30%, rgb(var(--c-zheshi-rgb) / 0.04) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgb(var(--c-qingbi-rgb) / 0.04) 0%, transparent 50%)",
      },
      keyframes: {
        inkSpread: {
          '0%': { opacity: '0', filter: 'blur(8px)' },
          '100%': { opacity: '1', filter: 'blur(0)' },
        },
        scrollUnroll: {
          '0%': { transform: 'scaleX(0)', transformOrigin: 'left' },
          '100%': { transform: 'scaleX(1)', transformOrigin: 'left' },
        },
        inkBreathe: {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
        liftUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        grindInk: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        flowPath: {
          '0%': { strokeDashoffset: '200' },
          '100%': { strokeDashoffset: '0' },
        },
        dynastyFade: {
          '0%': { opacity: '0', transform: 'scale(0.92)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pageEnter: {
          '0%': { opacity: '0', transform: 'translateY(10px)', filter: 'blur(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)', filter: 'blur(0)' },
        },
        sectionRise: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        inkRipple: {
          '0%': { transform: 'scale(0.3)', opacity: '0.7' },
          '100%': { transform: 'scale(1.7)', opacity: '0' },
        },
        steamRise: {
          '0%': { transform: 'translateY(0) scaleX(1)', opacity: '0' },
          '30%': { opacity: '0.7' },
          '100%': { transform: 'translateY(-6px) scaleX(1.3)', opacity: '0' },
        },
        carveDown: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(2px)' },
        },
        flameDance: {
          '0%, 100%': { transform: 'scaleY(1) scaleX(1)', opacity: '0.85' },
          '50%': { transform: 'scaleY(1.2) scaleX(0.9)', opacity: '1' },
        },
        inkGrindOrbit: {
          '0%': { transform: 'rotate(0deg) translateX(3px) rotate(0deg)' },
          '100%': { transform: 'rotate(360deg) translateX(3px) rotate(-360deg)' },
        },
        // 墨池渐深 · 砚台研磨时墨色一浓一淡
        inkPoolDeepen: {
          '0%, 100%': { opacity: '0.75' },
          '50%': { opacity: '1' },
        },
        // 墨涟漪 · 墨锭研磨处泛起一圈细涟漪
        inkRippleMini: {
          '0%': { transform: 'scale(0.4)', opacity: '0.7' },
          '100%': { transform: 'scale(1.4)', opacity: '0' },
        },
        // 茶汤晃动 · 茶盏液面微微荡漾
        teaSway: {
          '0%, 100%': { transform: 'translateX(-0.4px) scaleX(1)' },
          '50%': { transform: 'translateX(0.4px) scaleX(1.06)' },
        },
        // 茶汤高光 · 液面反光游移
        teaGlint: {
          '0%, 100%': { opacity: '0.3', transform: 'translateX(-1px)' },
          '50%': { opacity: '0.7', transform: 'translateX(1px)' },
        },
        // 木屑掉落 · 刻简时碎屑坠落
        chipFall: {
          '0%': { transform: 'translateY(0) rotate(0deg)', opacity: '0.9' },
          '70%': { opacity: '0.7' },
          '100%': { transform: 'translateY(7px) rotate(140deg)', opacity: '0' },
        },
        // 刻痕闪现 · 刀落处新刻一笔浮现
        carveFlash: {
          '0%, 70%': { opacity: '0' },
          '80%, 100%': { opacity: '0.7' },
        },
        // 余烬上升 · 风炉火星冉冉
        emberRise: {
          '0%': { transform: 'translateY(0) scale(1)', opacity: '0.8' },
          '100%': { transform: 'translateY(-6px) scale(0.2)', opacity: '0' },
        },
      },
      animation: {
        inkSpread: 'inkSpread 1.2s ease-out forwards',
        scrollUnroll: 'scrollUnroll 1.6s ease-out forwards',
        inkBreathe: 'inkBreathe 2.4s ease-in-out infinite',
        liftUp: 'liftUp 0.6s ease-out forwards',
        grindInk: 'grindInk 2s linear infinite',
        flowPath: 'flowPath 2.5s ease-out forwards',
        dynastyFade: 'dynastyFade 0.5s ease-out forwards',
        pageEnter: 'pageEnter 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        sectionRise: 'sectionRise 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        inkRipple: 'inkRipple 1.8s ease-out infinite',
        steamRise: 'steamRise 2.2s ease-out infinite',
        carveDown: 'carveDown 0.6s ease-in-out infinite',
        flameDance: 'flameDance 0.5s ease-in-out infinite',
        inkGrindOrbit: 'inkGrindOrbit 1.5s linear infinite',
        inkPoolDeepen: 'inkPoolDeepen 2.4s ease-in-out infinite',
        inkRippleMini: 'inkRippleMini 1.5s ease-out infinite',
        teaSway: 'teaSway 2.6s ease-in-out infinite',
        teaGlint: 'teaGlint 3s ease-in-out infinite',
        chipFall: 'chipFall 1.2s ease-in infinite',
        carveFlash: 'carveFlash 1.2s ease-out infinite',
        emberRise: 'emberRise 1.6s ease-out infinite',
      },
    },
  },
  plugins: [],
};
