// 灵台调用 · 按当前模型配置发真实请求 · 统一返回文本
import {
  agentModelMeta,
  useSettingsStore,
  type AgentModel,
  type AgentPersona,
  type AgentTone,
  type AgentDomain,
  type AgentDepth,
} from "@/store/settingsStore";
import { DYNASTIES, useThemeStore } from "@/store/themeStore";

const personaDesc: Record<AgentPersona, string> = {
  shutong: "你是书童，伶俐勤谨，侍砚磨墨，自称「小童」，对用户敬称「公子」",
  wenren: "你是文人，风雅博学，引经据典，文白相杂，自称「在下」",
  daozhang: "你是道长，清虚冲淡，言简意远，自称「贫道」",
  guanyan: "你是馆员，严谨详实，考据分明，自称「本馆」",
};

const toneDesc: Record<AgentTone, string> = {
  elegant: "语调雅正，文白相杂，典雅得宜",
  plain: "语调平实，直陈其事，明白如话",
  playful: "语调诙谐，时带谐趣，亦庄亦谐",
  solemn: "语调庄重，肃穆严谨，不苟言笑",
};

const domainHint: Record<AgentDomain, string> = {
  poetry: "侧重诗词之道",
  painting: "侧重书画之艺",
  tea: "侧重茶道之法",
  qin: "侧重琴曲之理",
  history: "侧重史籍考据",
  misc: "兼修诸艺",
};

const depthHint: Record<AgentDepth, string> = {
  brief: "回复简括，三五句点到即止",
  moderate: "回复适中，二三段详略得当",
  detailed: "回复详尽，可洋洋洒洒",
};

export interface LLMResult {
  text: string;
  ok: boolean;
  error?: string;
}

// 构造系统提示 · 注入朝代人设 · 切换朝代时文风与典据取向随之而变
function buildSystemPrompt(): string {
  const s = useSettingsStore.getState();
  const persona = personaDesc[s.agentPersona];
  const tone = toneDesc[s.agentTone];
  const domain = domainHint[s.agentDomain];
  const depth = depthHint[s.agentDepth];

  // 取当前朝美元数据 · 朝代品牌名与落款以朝代为准
  const dynasty = useThemeStore.getState().dynasty;
  const meta = DYNASTIES[dynasty];
  const name = s.agentName || meta.brand;
  const sig = s.agentSignature || meta.signoff;

  return [
    `你名为「${name}」，是一方国风 AI 雅伴。${meta.promptHint}`,
    persona + "。" + tone + "。" + domain + "。" + depth + "。",
    "回复须用中文，行文具国风雅韵，可酌用文言与典故，但须令今人可读。",
    `落款以「${sig}」收尾。`,
  ].join("\n");
}

// 主调用入口 · 返回完整文本（已聚合流式分段）
export async function chatWithLLM(
  messages: { role: "user" | "assistant" | "system"; content: string }[],
  onChunk?: (delta: string) => void,
): Promise<LLMResult> {
  const s = useSettingsStore.getState();
  const model: AgentModel = s.agentModel;
  const cfg = s.agentApiConfigs[model];
  const style = agentModelMeta[model].style;

  if (!cfg?.key.trim() || !cfg?.baseUrl.trim() || !cfg?.model.trim()) {
    return { text: "", ok: false, error: "灵台凭据不全" };
  }

  const base = cfg.baseUrl.replace(/\/+$/, "");
  const sys = buildSystemPrompt();
  const fullMessages = [{ role: "system", content: sys }, ...messages];

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 60000);

  try {
    let url = "";
    let init: RequestInit;

    if (style === "anthropic") {
      // Anthropic Messages API
      url = `${base}/messages`;
      // anthropic 不接 system 角色于 messages 数组 · 单独传 system 字段
      const userMessages = messages.map((m) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content,
      }));
      init = {
        method: "POST",
        mode: "cors",
        signal: ctrl.signal,
        headers: {
          "x-api-key": cfg.key,
          "anthropic-version": "2023-06-01",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: cfg.model,
          max_tokens: 2048,
          system: sys,
          messages: userMessages,
          stream: !!onChunk,
        }),
      };
    } else if (style === "gemini") {
      // Gemini generateContent
      const lastUser = [...messages].reverse().find((m) => m.role === "user");
      const contents = messages.map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));
      url = `${base}/models/${cfg.model}:generateContent?key=${encodeURIComponent(cfg.key)}`;
      init = {
        method: "POST",
        mode: "cors",
        signal: ctrl.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: sys }] },
          contents,
          generationConfig: { maxOutputTokens: 2048 },
        }),
      };
      void lastUser;
    } else {
      // OpenAI 兼容
      url = `${base}/chat/completions`;
      init = {
        method: "POST",
        mode: "cors",
        signal: ctrl.signal,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cfg.key}`,
        },
        body: JSON.stringify({
          model: cfg.model,
          messages: fullMessages,
          stream: !!onChunk,
          max_tokens: 2048,
        }),
      };
    }

    const res = await fetch(url, init);
    clearTimeout(timer);

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      return { text: "", ok: false, error: `灵台答 ${res.status} · ${errText.slice(0, 120)}` };
    }

    // 流式
    if (onChunk && res.body) {
      let agg = "";
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() || "";
        for (const line of lines) {
          const t = line.trim();
          if (!t || !t.startsWith("data:")) continue;
          const data = t.slice(5).trim();
          if (data === "[DONE]") continue;
          try {
            const j = JSON.parse(data);
            const delta = extractDelta(j, style);
            if (delta) {
              agg += delta;
              onChunk(delta);
            }
          } catch {
            /* 跳过非 JSON 行 */
          }
        }
      }
      return { text: agg, ok: true };
    }

    // 非流式
    const j = await res.json();
    const text = extractFull(j, style);
    return { text, ok: true };
  } catch (err) {
    clearTimeout(timer);
    if (err instanceof Error && err.name === "AbortError") return { text: "", ok: false, error: "灵台久候不至 · 超时" };
    return { text: "", ok: false, error: "灵台未通 · 跨域阻隔恐需代理" };
  }
}

// 各家 API 响应结构各异 · 此处用宽松索引签名读取 · 已知字段
type ApiResponse = Record<string, unknown>;

function extractDelta(j: ApiResponse, style: string): string {
  if (style === "anthropic") {
    if (j?.type === "content_block_delta") {
      const delta = j.delta as { text?: string } | undefined;
      return delta?.text ?? "";
    }
    return "";
  }
  if (style === "gemini") {
    const candidates = j.candidates as Array<{ content?: { parts?: Array<{ text?: string }> } }> | undefined;
    return candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  }
  // openai
  const choices = j.choices as Array<{ delta?: { content?: string } }> | undefined;
  return choices?.[0]?.delta?.content ?? "";
}

function extractFull(j: ApiResponse, style: string): string {
  if (style === "anthropic") {
    const content = (j.content as Array<{ text?: string }> | undefined) ?? [];
    return content.map((c) => c?.text ?? "").join("");
  }
  if (style === "gemini") {
    const candidates = j.candidates as Array<{ content?: { parts?: Array<{ text?: string }> } }> | undefined;
    return candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  }
  const choices = j.choices as Array<{ message?: { content?: string } }> | undefined;
  return choices?.[0]?.message?.content ?? "";
}
