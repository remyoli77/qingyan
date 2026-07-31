// 青砚其人 · Agent 人设子面板 — 从主设置抽屉内展开的二级面板
import { useEffect, useState } from "react";
import {
  useSettingsStore,
  agentPersonaMeta,
  agentToneMeta,
  agentDomainMeta,
  agentDepthMeta,
  agentModelMeta,
  modelBadge,
  modelDisplayName,
  paperToneBg,
  type AgentPersona,
  type AgentTone,
  type AgentDomain,
  type AgentDepth,
  type AgentModel,
} from "@/store/settingsStore";

interface AgentPanelProps {
  open: boolean;
  onBack: () => void;
}

export default function AgentPanel({ open, onBack }: AgentPanelProps) {
  const s = useSettingsStore();
  const [modelOpen, setModelOpen] = useState(false);
  // 灵台连通探查 · idle 未查 / checking 探查中 / ok 已通 / fail 未通
  const [checkStatus, setCheckStatus] = useState<"idle" | "checking" | "ok" | "fail">("idle");
  const [checkMsg, setCheckMsg] = useState("");

  // 探查当前模型连通性 · 真实鉴权探测 · 不通即不通
  // openai 风格：GET {baseUrl}/models 带 Bearer
  // anthropic 风格：POST {baseUrl}/messages 带 x-api-key + 最小 body
  // gemini 风格：GET {baseUrl}/models?key=…
  async function runCheck() {
    setCheckStatus("checking");
    setCheckMsg("");
    const cfg = s.agentApiConfigs[s.agentModel];
    if (s.agentModel === "custom" && !s.agentCustomName.trim()) {
      setCheckStatus("fail"); setCheckMsg("名号未立，灵台无主"); return;
    }
    if (!cfg?.key.trim()) { setCheckStatus("fail"); setCheckMsg("密钥未陈，灵台未启"); return; }
    if (!cfg?.baseUrl.trim()) { setCheckStatus("fail"); setCheckMsg("接口未明，无路可达"); return; }
    if (!cfg?.model.trim()) { setCheckStatus("fail"); setCheckMsg("模型未立，何所问对"); return; }

    const style = agentModelMeta[s.agentModel].style;
    const base = cfg.baseUrl.replace(/\/+$/, "");
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 8000);

    let url = "";
    const init: RequestInit = { method: "GET", mode: "cors", signal: ctrl.signal };

    try {
      if (style === "openai") {
        url = `${base}/models`;
        init.headers = { Authorization: `Bearer ${cfg.key}` };
      } else if (style === "anthropic") {
        url = `${base}/messages`;
        init.method = "POST";
        init.headers = {
          "x-api-key": cfg.key,
          "anthropic-version": "2023-06-01",
          "Content-Type": "application/json",
        };
        init.body = JSON.stringify({
          model: cfg.model,
          max_tokens: 1,
          messages: [{ role: "user", content: "ping" }],
        });
      } else {
        // gemini
        url = `${base}/models?key=${encodeURIComponent(cfg.key)}`;
      }

      const res = await fetch(url, init);
      clearTimeout(timer);

      if (res.status >= 200 && res.status < 300) {
        setCheckStatus("ok"); setCheckMsg("灵台已通 · 密钥可用");
      } else if (res.status === 401 || res.status === 403) {
        setCheckStatus("fail"); setCheckMsg(`密钥不受纳 · ${res.status}`);
      } else if (res.status === 404) {
        setCheckStatus("fail"); setCheckMsg("路径未觅 · 接口有误");
      } else if (res.status === 429) {
        setCheckStatus("ok"); setCheckMsg("灵台已通 · 唯促请稍候"); // 限流也算鉴权过了
      } else {
        setCheckStatus("fail"); setCheckMsg(`灵台未通 · 答曰 ${res.status}`);
      }
    } catch (err) {
      clearTimeout(timer);
      if (err instanceof Error && err.name === "AbortError") {
        setCheckStatus("fail"); setCheckMsg("灵台久候不至 · 超时");
      } else {
        // TypeError · 多为 CORS 拦截或网络不可达
        setCheckStatus("fail"); setCheckMsg("灵台未通 · 跨域阻隔恐需代理");
      }
    }
  }

  // 折叠展开时默认探查 · 切换模型亦重查
  useEffect(() => {
    if (modelOpen) runCheck();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelOpen, s.agentModel]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (modelOpen) {
        // 未通过探查时折叠不得收 · ESC 直退子面板以作逃生
        if (checkStatus === "ok") setModelOpen(false);
        else onBack();
      } else onBack();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onBack, modelOpen, checkStatus]);

  const persona = agentPersonaMeta[s.agentPersona];

  return (
    <div
      className={`absolute inset-0 z-10 flex flex-col transition-transform duration-400 ease-out ${
        open ? "translate-x-0" : "translate-x-full"
      }`}
      style={{
        backgroundColor: paperToneBg[s.paperTone].card,
        backgroundImage:
          "radial-gradient(circle at 80% 10%, rgb(var(--c-zheshi-rgb) / 0.06) 0%, transparent 45%), radial-gradient(circle at 20% 90%, rgb(var(--c-qingbi-rgb) / 0.05) 0%, transparent 45%)",
      }}
      role="dialog"
      aria-label="青砚其人 · Agent 人设"
    >
      {/* 标题栏 — 返回 + 人设预览 */}
      <div className="px-5 py-4 border-b border-qingbi/15 flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-8 h-8 flex items-center justify-center text-qingbi/60 hover:text-daiqing hover:bg-qingbi/8 transition-colors"
          style={{ borderRadius: "2px" }}
          aria-label="返回"
        >
          <svg viewBox="0 0 20 20" className="w-4 h-4" aria-hidden="true">
            <path d="M12,4 L6,10 L12,16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="flex items-center gap-2.5 flex-1">
          {/* 当前人设小像 */}
          <span
            className="w-9 h-9 flex items-center justify-center font-song text-sm"
            style={{
              backgroundColor: `${persona.color}18`,
              color: persona.color,
              border: `1px solid ${persona.color}55`,
              borderRadius: "2px",
            }}
          >
            {persona.name[0]}
          </span>
          <div className="leading-tight">
            <div className="font-song text-base text-daiqing tracking-wider">青砚其人</div>
            <div className="font-song text-[10px] text-qingbi/55 tracking-widest">AGENT · 人设</div>
          </div>
        </div>
      </div>

      {/* 内容 */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
        {/* 自定义称呼 + 落款 */}
        <Section title="名号落款" hint="NAME">
          <div className="space-y-3">
            <FieldInput
              label="称呼"
              value={s.agentName}
              onChange={s.setAgentName}
              placeholder="青砚"
              maxLength={6}
            />
            <FieldInput
              label="落款"
              value={s.agentSignature}
              onChange={s.setAgentSignature}
              placeholder="青砚谨复"
              maxLength={8}
            />
          </div>
        </Section>

        {/* 化身人设 */}
        <Section title="化身" hint="PERSONA">
          <div className="grid grid-cols-2 gap-1.5">
            {(["shutong", "wenren", "daozhang", "guanyan"] as AgentPersona[]).map((p) => {
              const meta = agentPersonaMeta[p];
              const active = s.agentPersona === p;
              return (
                <button
                  key={p}
                  onClick={() => s.setAgentPersona(p)}
                  className="flex flex-col items-start gap-1 p-3 transition-all text-left"
                  style={{
                    backgroundColor: active ? `${meta.color}12` : "transparent",
                    border: `1px solid ${active ? meta.color : "rgb(var(--c-qingbi-rgb) / 0.15)"}`,
                    borderRadius: "2px",
                  }}
                >
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: meta.color }}
                    />
                    <span
                      className="font-song text-sm tracking-wider"
                      style={{ color: active ? meta.color : "rgb(var(--c-daiqing-rgb))" }}
                    >
                      {meta.name}
                    </span>
                  </div>
                  <span className="font-song text-[10px] text-qingbi/55 leading-relaxed">
                    {meta.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </Section>

        {/* 语调 */}
        <Section title="语调" hint="TONE">
          <div className="space-y-1.5">
            {(["elegant", "plain", "playful", "solemn"] as AgentTone[]).map((t) => {
              const meta = agentToneMeta[t];
              const active = s.agentTone === t;
              return (
                <button
                  key={t}
                  onClick={() => s.setAgentTone(t)}
                  className="w-full flex items-center justify-between px-3 py-2.5 transition-all"
                  style={{
                    backgroundColor: active ? "rgb(var(--c-qingbi-rgb) / 0.06)" : "transparent",
                    border: `1px solid ${active ? "rgb(var(--c-qingbi-rgb) / 0.4)" : "rgb(var(--c-qingbi-rgb) / 0.12)"}`,
                    borderRadius: "2px",
                  }}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="font-song text-xs tracking-wider"
                      style={{ color: active ? "rgb(var(--c-daiqing-rgb))" : "rgb(var(--c-daiqing-rgb) / 0.65)" }}
                    >
                      {meta.name}
                    </span>
                    <span className="font-song text-[10px] text-qingbi/50">{meta.desc}</span>
                  </div>
                  {active && (
                    <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 text-qingbi" aria-hidden="true">
                      <path d="M3,8 L7,12 L13,4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </Section>

        {/* 学问侧重 */}
        <Section title="学问侧重" hint="DOMAIN">
          <div className="grid grid-cols-3 gap-1.5">
            {(["poetry", "painting", "tea", "qin", "history", "misc"] as AgentDomain[]).map((d) => {
              const meta = agentDomainMeta[d];
              const active = s.agentDomain === d;
              return (
                <button
                  key={d}
                  onClick={() => s.setAgentDomain(d)}
                  className="flex flex-col items-center gap-1.5 py-3 transition-all"
                  style={{
                    backgroundColor: active ? "rgb(var(--c-zheshi-rgb) / 0.1)" : "transparent",
                    border: `1px solid ${active ? "rgb(var(--c-zheshi-rgb) / 0.5)" : "rgb(var(--c-qingbi-rgb) / 0.12)"}`,
                    borderRadius: "2px",
                  }}
                >
                  <span
                    className="font-song text-base"
                    style={{ color: active ? "rgb(var(--c-zheshi-rgb))" : "rgb(var(--c-daiqing-rgb) / 0.55)" }}
                  >
                    {meta.icon}
                  </span>
                  <span
                    className="font-song text-[11px] tracking-wider"
                    style={{ color: active ? "rgb(var(--c-daiqing-rgb))" : "rgb(var(--c-daiqing-rgb) / 0.6)" }}
                  >
                    {meta.name}
                  </span>
                </button>
              );
            })}
          </div>
        </Section>

        {/* 回复详略 */}
        <Section title="笔墨详略" hint="DEPTH">
          <div className="grid grid-cols-3 gap-1.5">
            {(["brief", "moderate", "detailed"] as AgentDepth[]).map((dp) => {
              const meta = agentDepthMeta[dp];
              const active = s.agentDepth === dp;
              return (
                <button
                  key={dp}
                  onClick={() => s.setAgentDepth(dp)}
                  className="py-2.5 font-song text-xs tracking-wider transition-all"
                  style={{
                    backgroundColor: active ? "rgb(var(--c-qingbi-rgb) / 0.1)" : "transparent",
                    border: `1px solid ${active ? "rgb(var(--c-qingbi-rgb) / 0.4)" : "rgb(var(--c-qingbi-rgb) / 0.12)"}`,
                    borderRadius: "2px",
                    color: active ? "rgb(var(--c-daiqing-rgb))" : "rgb(var(--c-daiqing-rgb) / 0.6)",
                  }}
                >
                  {meta.name}
                </button>
              );
            })}
          </div>
          <p className="font-song text-[10px] text-qingbi/50 mt-2 tracking-wider">
            · {agentDepthMeta[s.agentDepth].desc}
          </p>
        </Section>

        {/* 灵台 · 心智所寓 — 折叠式选择，不占常驻空间 */}
        <Section title="灵台" hint="MIND">
          <p className="font-song text-[10px] text-qingbi/50 mb-2 tracking-wider">
            · 心智所寓 · 神思所出
          </p>
          {/* 当前模型 · 触发按钮 — 未通过探查则不可收 */}
          <button
            onClick={() => {
              if (!modelOpen) { setModelOpen(true); return; }
              // 收起需通过探查 · 否则保持展开，横幅自有提示
              if (checkStatus === "ok") setModelOpen(false);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 transition-all"
            style={{
              backgroundColor: modelOpen
                ? (checkStatus === "fail" ? "rgb(var(--c-zhusha-rgb) / 0.05)" : "rgb(var(--c-qingbi-rgb) / 0.06)")
                : "rgb(var(--c-qingbi-rgb) / 0.03)",
              border: `1px solid ${
                modelOpen
                  ? (checkStatus === "fail" ? "rgb(var(--c-zhusha-rgb) / 0.4)" : "rgb(var(--c-qingbi-rgb) / 0.35)")
                  : "rgb(var(--c-qingbi-rgb) / 0.18)"
              }`,
              borderRadius: "2px",
            }}
          >
            {(() => {
              const b = modelBadge(s.agentModel);
              return (
                <span
                  className="px-1.5 py-0.5 font-song text-[10px] tracking-widest shrink-0"
                  style={{ color: b.color, backgroundColor: b.bg, borderRadius: "2px" }}
                >
                  {b.text}
                </span>
              );
            })()}
            <span className="font-song text-xs text-daiqing tracking-wider truncate">
              {modelDisplayName(s.agentModel, s.agentCustomName)}
            </span>
            <span className="font-song text-[10px] text-qingbi/50 tracking-wider truncate">
              · {agentModelMeta[s.agentModel].vendor}
            </span>
            {/* 探查状态点 */}
            {modelOpen && (
              <span
                className={`w-1.5 h-1.5 rounded-full shrink-0 ${checkStatus === "checking" ? "animate-pulse" : ""}`}
                style={{
                  backgroundColor:
                    checkStatus === "ok" ? "rgb(var(--c-qingbi-rgb))"
                    : checkStatus === "fail" ? "rgb(var(--c-zhusha-rgb))"
                    : "rgb(var(--c-qingbi-rgb) / 0.4)",
                }}
                aria-hidden="true"
              />
            )}
            <svg
              viewBox="0 0 16 16"
              className="w-3.5 h-3.5 ml-auto text-qingbi/55 transition-transform duration-300 shrink-0"
              style={{ transform: modelOpen ? "rotate(180deg)" : "rotate(0deg)" }}
              aria-hidden="true"
            >
              <path d="M4,6 L8,10 L12,6" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* 折叠展开 · 探查横幅 + 模型列表 + 凭据 */}
          <div
            className="overflow-hidden transition-all duration-300 ease-out"
            style={{
              maxHeight: modelOpen ? "780px" : "0px",
              opacity: modelOpen ? 1 : 0,
            }}
          >
            {/* 探查横幅 · checking/ok/fail 三态 */}
            {modelOpen && checkStatus !== "idle" && (
              <div
                className="flex items-center gap-2 mt-2 px-2.5 py-2"
                style={{
                  backgroundColor:
                    checkStatus === "ok" ? "rgb(var(--c-qingbi-rgb) / 0.06)"
                    : checkStatus === "fail" ? "rgb(var(--c-zhusha-rgb) / 0.06)"
                    : "rgb(var(--c-zheshi-rgb) / 0.05)",
                  border: `1px solid ${
                    checkStatus === "ok" ? "rgb(var(--c-qingbi-rgb) / 0.25)"
                    : checkStatus === "fail" ? "rgb(var(--c-zhusha-rgb) / 0.3)"
                    : "rgb(var(--c-zheshi-rgb) / 0.25)"
                  }`,
                  borderRadius: "2px",
                }}
              >
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${checkStatus === "checking" ? "animate-pulse" : ""}`}
                  style={{
                    backgroundColor:
                      checkStatus === "ok" ? "rgb(var(--c-qingbi-rgb))"
                      : checkStatus === "fail" ? "rgb(var(--c-zhusha-rgb))"
                      : "rgb(var(--c-zheshi-rgb))",
                  }}
                  aria-hidden="true"
                />
                <span
                  className="font-song text-[11px] tracking-wider flex-1 truncate"
                  style={{
                    color:
                      checkStatus === "ok" ? "rgb(var(--c-qingbi-rgb))"
                      : checkStatus === "fail" ? "rgb(var(--c-zhusha-rgb))"
                      : "rgb(var(--c-zheshi-rgb))",
                  }}
                >
                  {checkStatus === "checking" ? "探查中…" : checkMsg}
                </span>
                {checkStatus !== "checking" && (
                  <button
                    onClick={runCheck}
                    className="font-song text-[10px] tracking-widest px-1.5 py-0.5 hover:bg-qingbi/8 transition-colors shrink-0"
                    style={{
                      color: checkStatus === "fail" ? "rgb(var(--c-zhusha-rgb))" : "rgb(var(--c-qingbi-rgb))",
                      borderRadius: "2px",
                    }}
                    aria-label="重新探查"
                  >
                    复探
                  </button>
                )}
              </div>
            )}

            {/* 模型列表 · 国产在前、海外次之、自定义殿后，每项末尾附 中/外/自 徽章 */}
            <div className="grid grid-cols-2 gap-1.5 pt-2">
              {(Object.keys(agentModelMeta) as AgentModel[]).map((m) => {
                const meta = agentModelMeta[m];
                const active = s.agentModel === m;
                const b = modelBadge(m);
                // 转 accent rgb
                const accent = m === "custom" ? "164,57,47" : meta.origin === "cn" ? "61,107,110" : "184,118,62";
                return (
                  <button
                    key={m}
                    onClick={() => s.setAgentModel(m)}
                    className="flex items-center justify-between px-2 py-1.5 transition-all"
                    style={{
                      backgroundColor: active ? `rgba(${accent},0.1)` : "transparent",
                      border: `1px solid ${active ? `rgba(${accent},0.45)` : "rgb(var(--c-qingbi-rgb) / 0.1)"}`,
                      borderRadius: "2px",
                    }}
                  >
                    <span
                      className="font-song text-[11px] tracking-wider truncate"
                      style={{ color: active ? "rgb(var(--c-daiqing-rgb))" : "rgb(var(--c-daiqing-rgb) / 0.65)" }}
                    >
                      {m === "custom" ? (s.agentCustomName || "自定义") : meta.name}
                    </span>
                    <span
                      className="font-song text-[9px] tracking-widest px-1 py-0.5 shrink-0 ml-1"
                      style={{ color: b.color, backgroundColor: b.bg, borderRadius: "2px" }}
                    >
                      {b.text}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* 凭据 · 当前模型的密钥/接口/模型 — 选中模型后于此填写 */}
            <div className="mt-3 pt-3 border-t border-dashed border-qingbi/15">
              <div className="flex items-baseline gap-2 mb-2.5">
                <span className="font-song text-xs text-daiqing tracking-wider">凭据</span>
                <span className="font-song text-[9px] text-qingbi/40 tracking-widest">
                  KEY · {modelDisplayName(s.agentModel, s.agentCustomName)}
                </span>
                <span className="flex-1 h-px bg-qingbi/10" />
              </div>
              <div className="space-y-2">
                {s.agentModel === "custom" && (
                  <FieldInput
                    label="名称"
                    value={s.agentCustomName}
                    onChange={s.setAgentCustomName}
                    placeholder="如 · 我的模型"
                    maxLength={16}
                  />
                )}
                <SecretInput
                  label="密钥"
                  value={s.agentApiConfigs[s.agentModel]?.key ?? ""}
                  onChange={(v) => s.setAgentApiConfig(s.agentModel, { key: v })}
                  placeholder="sk-…"
                  maxLength={500}
                />
                <FieldInput
                  label="接口"
                  value={s.agentApiConfigs[s.agentModel]?.baseUrl ?? ""}
                  onChange={(v) => s.setAgentApiConfig(s.agentModel, { baseUrl: v })}
                  placeholder="https://…"
                  maxLength={500}
                />
                <FieldInput
                  label="模型"
                  value={s.agentApiConfigs[s.agentModel]?.model ?? ""}
                  onChange={(v) => s.setAgentApiConfig(s.agentModel, { model: v })}
                  placeholder="如 · gpt-4o"
                  maxLength={200}
                />
              </div>
              <p className="font-song text-[10px] text-qingbi/45 mt-2 tracking-wider leading-relaxed">
                · 密钥仅存于本机，不外传；切回此模型时凭据仍在。
              </p>
            </div>
          </div>
        </Section>

        {/* 预览信笺 */}
        <Section title="试笺" hint="PREVIEW">
          <div
            className="px-4 py-3 relative"
            style={{
              backgroundColor: "rgb(var(--c-paper-base))",
              backgroundImage:
                "radial-gradient(circle at 15% 22%, rgb(var(--c-zheshi-rgb) / 0.05) 0%, transparent 42%), repeating-linear-gradient(92deg, transparent 0px, transparent 2px, rgb(var(--c-zheshi-rgb) / 0.012) 2px, rgb(var(--c-zheshi-rgb) / 0.012) 3px)",
              border: "1px solid rgb(var(--c-zheshi-rgb) / 0.22)",
              borderRadius: "2px",
            }}
          >
            <p className="font-song text-xs text-daiqing leading-loose" style={{ textIndent: "2em" }}>
              {getPreviewText(s.agentPersona, s.agentTone, s.agentDepth)}
            </p>
            <div className="mt-2 flex items-center justify-end gap-2">
              <span className="font-song text-[10px] text-qingbi/50 tracking-widest">
                {s.agentSignature}
              </span>
              <span
                className="seal text-[9px] w-6 h-6"
                style={{ fontSize: 9 }}
              >
                {s.agentName.slice(0, 2)}
              </span>
            </div>
          </div>
        </Section>
      </div>

      {/* 底部 — 复位 */}
      <div className="px-5 py-3.5 border-t border-qingbi/15 flex items-center justify-between bg-qingbi/4">
        <span className="font-song text-[10px] text-qingbi/50 tracking-widest">
          人设存于本地 · 随君雅意
        </span>
        <button
          onClick={s.resetAgent}
          className="font-song text-xs text-zhusha/80 hover:text-zhusha hover:bg-zhusha/8 px-3 py-1.5 transition-colors tracking-wider"
          style={{ borderRadius: "2px" }}
        >
          复归默认
        </button>
      </div>
    </div>
  );
}

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="flex items-baseline gap-2 mb-2.5">
        <span className="font-song text-sm text-daiqing tracking-wider">{title}</span>
        <span className="font-song text-[9px] text-qingbi/40 tracking-widest">{hint}</span>
        <span className="flex-1 h-px bg-qingbi/12 ml-1" />
      </div>
      {children}
    </section>
  );
}

function FieldInput({
  label,
  value,
  onChange,
  placeholder,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  maxLength: number;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="font-song text-xs text-qingbi/60 tracking-wider w-10 shrink-0">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
        placeholder={placeholder}
        className="flex-1 px-3 py-2 font-song text-sm text-daiqing bg-xuanzhi/40 border border-qingbi/20 focus:border-qingbi focus:outline-none transition-colors tracking-wider"
        style={{ borderRadius: "2px" }}
      />
      <span className="font-song text-[10px] text-qingbi/40 shrink-0">
        {value.length}/{maxLength}
      </span>
    </div>
  );
}

// 密钥输入 · 默认掩码，末尾朱印式眼睛可示形
function SecretInput({
  label,
  value,
  onChange,
  placeholder,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  maxLength: number;
}) {
  const [revealed, setRevealed] = useState(false);
  return (
    <div className="flex items-center gap-3">
      <span className="font-song text-xs text-qingbi/60 tracking-wider w-10 shrink-0">{label}</span>
      <input
        type={revealed ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck={false}
        className="flex-1 px-3 py-2 font-song text-sm text-daiqing bg-xuanzhi/40 border border-qingbi/20 focus:border-qingbi focus:outline-none transition-colors tracking-wider"
        style={{ borderRadius: "2px" }}
      />
      <button
        type="button"
        onClick={() => setRevealed((v) => !v)}
        className="w-7 h-7 shrink-0 flex items-center justify-center text-qingbi/50 hover:text-zhusha hover:bg-zhusha/8 transition-colors"
        style={{ borderRadius: "2px" }}
        aria-label={revealed ? "隐藏密钥" : "显示密钥"}
        title={revealed ? "隐藏" : "显示"}
      >
        {revealed ? (
          <svg viewBox="0 0 20 20" className="w-3.5 h-3.5" aria-hidden="true">
            <path d="M2,10 C5,5 15,5 18,10 C15,15 5,15 2,10 Z" fill="none" stroke="currentColor" strokeWidth="1.3" />
            <circle cx="10" cy="10" r="2.6" fill="none" stroke="currentColor" strokeWidth="1.3" />
            <path d="M4,4 L16,16" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
        ) : (
          <svg viewBox="0 0 20 20" className="w-3.5 h-3.5" aria-hidden="true">
            <path d="M2,10 C5,5 15,5 18,10 C15,15 5,15 2,10 Z" fill="none" stroke="currentColor" strokeWidth="1.3" />
            <circle cx="10" cy="10" r="2.6" fill="none" stroke="currentColor" strokeWidth="1.3" />
          </svg>
        )}
      </button>
    </div>
  );
}

// 根据人设/语调/详略生成预览文字
function getPreviewText(persona: AgentPersona, tone: AgentTone, depth: AgentDepth): string {
  const personaOpen: Record<AgentPersona, string> = {
    shutong: "启禀公子，",
    wenren: "雅鉴：",
    daozhang: "无量寿福。",
    guanyan: "按：",
  };
  const toneBody: Record<AgentTone, string> = {
    elegant: "此问颇有雅趣，容略陈之。观其要旨，不外乎「情景交融」四字。",
    plain: "这事说来简单。关键就一点：把景和情搭起来。",
    playful: "嘻嘻，这题倒有意思——公子可是想考我？不妨说说看。",
    solemn: "谨按典籍所载，此题当从三方面析之，不可草率。",
  };
  const depthTail: Record<AgentDepth, string> = {
    brief: "",
    moderate: "其一在象，其二在意，二者相济方得其妙。",
    detailed: "其一在象，取眼前之景以写之；其二在意，寓胸中之志于其中；其三在律，调平仄协韵脚以成声。三者备而后佳构乃成，此古法也。",
  };
  return personaOpen[persona] + toneBody[tone] + (depthTail[depth] ? depthTail[depth] : "");
}
