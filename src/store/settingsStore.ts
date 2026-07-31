// 设置偏好 — 持久化到 localStorage
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type InkDensity = "light" | "normal" | "dense";   // 墨色浓淡 → 文字主色明度
export type PaperTone = "xuanzhi" | "chanyi" | "qingnuan"; // 纸色基调
export type BrushSpeed = "slow" | "normal" | "fast";     // 书写速度
export type SeasonTheme = "auto" | "spring" | "summer" | "autumn" | "winter";

// —— 青砚其人 · Agent 人设 ——
export type AgentPersona = "shutong" | "wenren" | "daozhang" | "guanyan"; // 书童/文人/道长/馆员
export type AgentTone = "elegant" | "plain" | "playful" | "solemn";       // 雅正/平实/诙谐/庄重
export type AgentDomain = "poetry" | "painting" | "tea" | "qin" | "history" | "misc"; // 学问侧重
export type AgentDepth = "brief" | "moderate" | "detailed";               // 回复详略
export type AgentModel = "qwen" | "glm" | "deepseek" | "kimi" | "minimax" | "doubao" | "ernie" | "gpt" | "claude" | "gemini" | "custom"; // 所用大模型 · custom 为自定义

// 灵台凭据 · 每个模型各自的密钥/接口/模型标识
export interface AgentApiConfig {
  key: string;      // 密钥
  baseUrl: string;  // 接口地址 base_url
  model: string;    // 模型标识 model
}

const ALL_MODELS: AgentModel[] = ["qwen", "glm", "deepseek", "kimi", "minimax", "doubao", "ernie", "gpt", "claude", "gemini", "custom"];

// 各模型默认接口与模型标识 · 自定义留空待填
const DEFAULT_API_CONFIGS: Record<Exclude<AgentModel, "custom">, { baseUrl: string; model: string }> = {
  qwen:     { baseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1", model: "qwen-plus" },
  glm:      { baseUrl: "https://open.bigmodel.cn/api/paas/v4", model: "glm-4" },
  deepseek: { baseUrl: "https://api.deepseek.com", model: "deepseek-chat" },
  kimi:     { baseUrl: "https://api.moonshot.cn/v1", model: "moonshot-v1-8k" },
  minimax:  { baseUrl: "https://api.minimax.chat/v1", model: "abab6.5-chat" },
  doubao:   { baseUrl: "https://ark.cn-beijing.volces.com/api/v3", model: "doubao-pro-32k" },
  ernie:    { baseUrl: "https://qianfan.baidubce.com/v2", model: "ernie-4.0-8k-latest" },
  gpt:      { baseUrl: "https://api.openai.com/v1", model: "gpt-4o" },
  claude:   { baseUrl: "https://api.anthropic.com/v1", model: "claude-3-5-sonnet-20241022" },
  gemini:   { baseUrl: "https://generativelanguage.googleapis.com/v1beta", model: "gemini-1.5-pro" },
};

const buildApiConfigs = (): Record<AgentModel, AgentApiConfig> => {
  const r = {} as Record<AgentModel, AgentApiConfig>;
  ALL_MODELS.forEach((m) => {
    if (m === "custom") {
      r[m] = { key: "", baseUrl: "", model: "" };
    } else {
      const d = DEFAULT_API_CONFIGS[m];
      r[m] = { key: "", baseUrl: d.baseUrl, model: d.model };
    }
  });
  return r;
};

interface SettingsState {
  inkDensity: InkDensity;
  paperTone: PaperTone;
  brushSpeed: BrushSpeed;
  seasonTheme: SeasonTheme;
  showAnimations: boolean;
  showCitations: boolean;

  // Agent 人设
  agentPersona: AgentPersona;
  agentTone: AgentTone;
  agentDomain: AgentDomain;
  agentDepth: AgentDepth;
  agentName: string;        // 自定义称呼
  agentSignature: string;   // 自定义落款
  agentModel: AgentModel;   // 所用大模型
  agentApiConfigs: Record<AgentModel, AgentApiConfig>; // 各模型的密钥/接口/模型
  agentCustomName: string;  // 自定义模型的名号

  setInkDensity: (v: InkDensity) => void;
  setPaperTone: (v: PaperTone) => void;
  setBrushSpeed: (v: BrushSpeed) => void;
  setSeasonTheme: (v: SeasonTheme) => void;
  setShowAnimations: (v: boolean) => void;
  setShowCitations: (v: boolean) => void;
  setAgentPersona: (v: AgentPersona) => void;
  setAgentTone: (v: AgentTone) => void;
  setAgentDomain: (v: AgentDomain) => void;
  setAgentDepth: (v: AgentDepth) => void;
  setAgentName: (v: string) => void;
  setAgentSignature: (v: string) => void;
  setAgentModel: (v: AgentModel) => void;
  setAgentApiConfig: (model: AgentModel, patch: Partial<AgentApiConfig>) => void;
  setAgentCustomName: (v: string) => void;
  reset: () => void;
  resetAgent: () => void;
}

const DEFAULTS = {
  inkDensity: "normal" as InkDensity,
  paperTone: "xuanzhi" as PaperTone,
  brushSpeed: "normal" as BrushSpeed,
  seasonTheme: "auto" as SeasonTheme,
  showAnimations: true,
  showCitations: true,
  agentPersona: "shutong" as AgentPersona,
  agentTone: "elegant" as AgentTone,
  agentDomain: "misc" as AgentDomain,
  agentDepth: "moderate" as AgentDepth,
  agentName: "青砚",
  agentSignature: "青砚谨复",
  agentModel: "qwen" as AgentModel,
  agentApiConfigs: buildApiConfigs(),
  agentCustomName: "",
};

const AGENT_DEFAULTS = {
  agentPersona: "shutong" as AgentPersona,
  agentTone: "elegant" as AgentTone,
  agentDomain: "misc" as AgentDomain,
  agentDepth: "moderate" as AgentDepth,
  agentName: "青砚",
  agentSignature: "青砚谨复",
  agentModel: "qwen" as AgentModel,
  agentApiConfigs: buildApiConfigs(),
  agentCustomName: "",
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...DEFAULTS,
      setInkDensity: (inkDensity) => set({ inkDensity }),
      setPaperTone: (paperTone) => set({ paperTone }),
      setBrushSpeed: (brushSpeed) => set({ brushSpeed }),
      setSeasonTheme: (seasonTheme) => set({ seasonTheme }),
      setShowAnimations: (showAnimations) => set({ showAnimations }),
      setShowCitations: (showCitations) => set({ showCitations }),
      setAgentPersona: (agentPersona) => set({ agentPersona }),
      setAgentTone: (agentTone) => set({ agentTone }),
      setAgentDomain: (agentDomain) => set({ agentDomain }),
      setAgentDepth: (agentDepth) => set({ agentDepth }),
      setAgentName: (agentName) => set({ agentName }),
      setAgentSignature: (agentSignature) => set({ agentSignature }),
      setAgentModel: (agentModel) => set({ agentModel }),
      setAgentApiConfig: (model, patch) =>
        set((state) => ({
          agentApiConfigs: {
            ...state.agentApiConfigs,
            [model]: { ...state.agentApiConfigs[model], ...patch },
          },
        })),
      setAgentCustomName: (agentCustomName) => set({ agentCustomName }),
      reset: () => set(DEFAULTS),
      resetAgent: () => set(AGENT_DEFAULTS),
    }),
    {
      name: "qingyan-settings",
      version: 2,
      migrate: (persisted: Record<string, unknown> | undefined, version: number) => {
        // v1 → v2: agentApiConfigs 由 {key, base} 改为 {key, baseUrl, model}，并补 custom
        if (version < 2 && persisted && persisted.agentApiConfigs) {
          const fresh = buildApiConfigs();
          (Object.keys(fresh) as AgentModel[]).forEach((k) => {
            const old = (persisted.agentApiConfigs as Record<string, { key?: string; base?: string; baseUrl?: string; model?: string }>)[k];
            if (old) {
              fresh[k] = {
                key: old.key ?? "",
                baseUrl: old.base ?? old.baseUrl ?? fresh[k].baseUrl,
                model: old.model ?? fresh[k].model,
              };
            }
          });
          (persisted as Record<string, unknown>).agentApiConfigs = fresh;
        }
        return persisted;
      },
    },
  ),
);

// 墨色浓淡 → 实际色值映射
export const inkDensityColor: Record<InkDensity, string> = {
  light: "#2E4548",   // 黛青软
  normal: "#1A2E30",  // 黛青
  dense: "#0A1517",   // 深墨
};

// 纸色基调 → 背景色映射
export const paperToneBg: Record<PaperTone, { body: string; card: string; border: string }> = {
  xuanzhi:  { body: "#F2EBDC", card: "#F8F3E7", border: "rgba(61,107,110,0.2)" },  // 宣纸（默认）
  chanyi:   { body: "#EDE4D0", card: "#F2EBDC", border: "rgba(61,107,110,0.22)" }, // 蝉翼（更暖）
  qingnuan: { body: "#E8E0CC", card: "#EDE4D0", border: "rgba(184,118,62,0.25)" }, // 轻暖（赭调）
};

// 书写速度 → 每字延迟 ms
export const brushSpeedDelay: Record<BrushSpeed, number> = {
  slow: 55,
  normal: 32,
  fast: 16,
};

// 四季主题 → 装饰色映射
export const seasonAccent: Record<SeasonTheme, { name: string; color: string; motif: string }> = {
  auto:   { name: "顺时令", color: "#3D6B6E", motif: "随节气自动" },
  spring: { name: "春", color: "#E08AA8", motif: "桃夭" },
  summer: { name: "夏", color: "#5C8A8D", motif: "荷清" },
  autumn: { name: "秋", color: "#B8763E", motif: "枫丹" },
  winter: { name: "冬", color: "#8AA0A8", motif: "雪霁" },
};

// —— Agent 人设元数据 ——
export const agentPersonaMeta: Record<AgentPersona, { name: string; desc: string; color: string }> = {
  shutong:  { name: "书童",  desc: "伶俐勤谨 · 侍砚磨墨",     color: "#3D6B6E" },
  wenren:   { name: "文人",  desc: "风雅博学 · 引经据典",     color: "#B8763E" },
  daozhang: { name: "道长",  desc: "清虚冲淡 · 言简意远",     color: "#8AA0A8" },
  guanyan:  { name: "馆员",  desc: "严谨详实 · 考据分明",     color: "#A4392F" },
};

export const agentToneMeta: Record<AgentTone, { name: string; desc: string }> = {
  elegant:  { name: "雅正", desc: "文白相杂 · 典雅得宜" },
  plain:    { name: "平实", desc: "直陈其事 · 明白如话" },
  playful:  { name: "诙谐", desc: "时带谐趣 · 亦庄亦谐" },
  solemn:   { name: "庄重", desc: "肃穆严谨 · 不苟言笑" },
};

export const agentDomainMeta: Record<AgentDomain, { name: string; icon: string }> = {
  poetry:   { name: "诗词",   icon: "诗" },
  painting: { name: "书画",   icon: "画" },
  tea:      { name: "茶道",   icon: "茶" },
  qin:      { name: "琴曲",   icon: "琴" },
  history:  { name: "史籍",   icon: "史" },
  misc:     { name: "兼修",   icon: "兼" },
};

export const agentDepthMeta: Record<AgentDepth, { name: string; desc: string }> = {
  brief:    { name: "简括", desc: "三五句 · 点到即止" },
  moderate: { name: "适中", desc: "二三段 · 详略得当" },
  detailed: { name: "详尽", desc: "洋洋洒洒 · 巨细靡遗" },
};

// —— 所用大模型元数据 —— origin: cn 中 / overseas 外 / custom 自 · style: 鉴权风格
export const agentModelMeta: Record<AgentModel, { name: string; vendor: string; origin: "cn" | "overseas" | "custom"; style: "openai" | "anthropic" | "gemini" }> = {
  qwen:     { name: "通义千问", vendor: "阿里",  origin: "cn", style: "openai" },
  glm:      { name: "智谱GLM",  vendor: "智谱",  origin: "cn", style: "openai" },
  deepseek: { name: "DeepSeek", vendor: "深度求索", origin: "cn", style: "openai" },
  kimi:     { name: "Kimi",     vendor: "月之暗面", origin: "cn", style: "openai" },
  minimax:  { name: "MiniMax", vendor: "稀宇科技", origin: "cn", style: "openai" },
  doubao:   { name: "豆包",     vendor: "字节",  origin: "cn", style: "openai" },
  ernie:    { name: "文心",     vendor: "百度",  origin: "cn", style: "openai" },
  gpt:      { name: "GPT",      vendor: "OpenAI",   origin: "overseas", style: "openai" },
  claude:   { name: "Claude",   vendor: "Anthropic", origin: "overseas", style: "anthropic" },
  gemini:   { name: "Gemini",   vendor: "Google",   origin: "overseas", style: "gemini" },
  custom:   { name: "自定义",   vendor: "自定",     origin: "custom",   style: "openai" },
};

// 模型徽章 · 中/外/自
export function modelBadge(model: AgentModel): { text: string; color: string; bg: string } {
  if (model === "custom") return { text: "自", color: "#A4392F", bg: "rgba(164,57,47,0.1)" };
  const isCn = agentModelMeta[model].origin === "cn";
  return isCn
    ? { text: "中", color: "#3D6B6E", bg: "rgba(61,107,110,0.1)" }
    : { text: "外", color: "#B8763E", bg: "rgba(184,118,62,0.1)" };
}

// 取模型展示名 · 自定义用 agentCustomName
export function modelDisplayName(model: AgentModel, customName: string): string {
  return model === "custom" ? (customName || "自定义") : agentModelMeta[model].name;
}
