// 案头格物 · 设置抽屉 — 从右侧滑出，含主题/纸色/墨色/书写/动效偏好
import { useEffect, useState } from "react";
import {
  useSettingsStore,
  inkDensityColor,
  paperToneBg,
  brushSpeedDelay,
  seasonAccent,
  agentPersonaMeta,
  agentToneMeta,
  modelBadge,
  modelDisplayName,
  type InkDensity,
  type PaperTone,
  type BrushSpeed,
  type SeasonTheme,
} from "@/store/settingsStore";
import AgentPanel from "@/components/AgentPanel";

interface SettingsDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function SettingsDrawer({ open, onClose }: SettingsDrawerProps) {
  const s = useSettingsStore();
  const [showAgent, setShowAgent] = useState(false);

  // ESC 关闭 — 子面板打开时优先收子面板
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (showAgent) setShowAgent(false);
      else onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, showAgent]);

  return (
    <>
      {/* 遮罩 — 半透明墨纱 */}
      <div
        className={`fixed inset-0 z-40 transition-opacity duration-500 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        style={{ backgroundColor: "rgb(var(--c-daiqing-rgb) / 0.35)", backdropFilter: "blur(2px)" }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* 抽屉 — 右侧滑入，卷轴式样 */}
      <aside
        className={`fixed top-0 right-0 z-50 h-full w-[340px] max-w-[90vw] shadow-scroll transition-transform duration-500 ease-out overflow-hidden ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        style={{
          backgroundColor: paperToneBg[s.paperTone].card,
          backgroundImage:
            "radial-gradient(circle at 80% 10%, rgb(var(--c-zheshi-rgb) / 0.06) 0%, transparent 45%), radial-gradient(circle at 20% 90%, rgb(var(--c-qingbi-rgb) / 0.05) 0%, transparent 45%)",
          borderLeft: "1px solid rgb(var(--c-zheshi-rgb) / 0.3)",
        }}
        role="dialog"
        aria-label="案头格物 · 设置"
      >
        <div className="h-full flex flex-col">
          {/* 标题栏 — 卷轴轴头式样 */}
          <div className="px-5 py-4 border-b border-qingbi/15 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="seal w-8 h-8 text-[11px] rotate-[-3deg]">格物</span>
              <div className="leading-tight">
                <div className="font-song text-base text-daiqing tracking-wider">案头格物</div>
                <div className="font-song text-[10px] text-qingbi/55 tracking-widest">SETTINGS · 雅设</div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center text-qingbi/60 hover:text-zhusha hover:bg-zhusha/8 transition-colors"
              style={{ borderRadius: "2px" }}
              aria-label="关闭"
            >
              <svg viewBox="0 0 20 20" className="w-4 h-4" aria-hidden="true">
                <path d="M5,5 L15,15 M15,5 L5,15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* 设置内容 — 可滚动 */}
          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
            {/* 青砚其人 · Agent 人设入口 — 列于首位，氛围式卡片 */}
            <Section title="青砚其人" hint="AGENT">
              <button
                onClick={() => setShowAgent(true)}
                className="w-full flex items-center gap-3 px-3.5 py-3 transition-all group relative overflow-hidden"
                style={{
                  backgroundColor: "rgb(var(--c-qingbi-rgb) / 0.05)",
                  border: "1px solid rgb(var(--c-qingbi-rgb) / 0.2)",
                  borderRadius: "2px",
                }}
              >
                {/* 当前人设小像 — 圆印章式 */}
                <span
                  className="w-10 h-10 shrink-0 flex items-center justify-center font-song text-base relative"
                  style={{
                    backgroundColor: `${agentPersonaMeta[s.agentPersona].color}18`,
                    color: agentPersonaMeta[s.agentPersona].color,
                    border: `1px solid ${agentPersonaMeta[s.agentPersona].color}55`,
                    borderRadius: "2px",
                  }}
                >
                  {agentPersonaMeta[s.agentPersona].name[0]}
                </span>

                {/* 中段 · 称呼 + 化身/语调 描述 */}
                <div className="flex-1 text-left leading-tight">
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-song text-sm text-daiqing tracking-wider">
                      {s.agentName}
                    </span>
                    <span className="font-song text-[10px] text-qingbi/50 tracking-widest">
                      · {agentPersonaMeta[s.agentPersona].name}
                    </span>
                  </div>
                  <div className="font-song text-[10px] text-qingbi/55 mt-0.5 tracking-wider">
                    {agentToneMeta[s.agentTone].name}其辞 · {agentPersonaMeta[s.agentPersona].desc.split(" · ")[0]}
                  </div>
                  <div className="font-song text-[10px] text-qingbi/65 mt-1 tracking-wider flex items-center gap-1">
                    {(() => {
                      const b = modelBadge(s.agentModel);
                      return (
                        <span
                          className="px-1 py-0.5"
                          style={{ color: b.color, backgroundColor: b.bg, borderRadius: "2px", fontSize: 9 }}
                        >
                          {b.text}
                        </span>
                      );
                    })()}
                    <span>{modelDisplayName(s.agentModel, s.agentCustomName)}</span>
                  </div>
                </div>

                {/* 右侧 · 入笺箭头 */}
                <span className="flex items-center gap-1 text-qingbi/50 group-hover:text-zheshi transition-colors shrink-0">
                  <span className="font-song text-[10px] tracking-widest">入笺</span>
                  <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" aria-hidden="true">
                    <path d="M5,3 L11,8 L5,13" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </button>
            </Section>

            {/* 四季主题 */}
            <Section title="四时之景" hint="SEASON">
              <div className="grid grid-cols-5 gap-1.5">
                {(["auto", "spring", "summer", "autumn", "winter"] as SeasonTheme[]).map((season) => {
                  const meta = seasonAccent[season];
                  const active = s.seasonTheme === season;
                  return (
                    <button
                      key={season}
                      onClick={() => s.setSeasonTheme(season)}
                      className="flex flex-col items-center gap-1.5 py-2.5 transition-all"
                      style={{
                        backgroundColor: active ? `${meta.color}18` : "transparent",
                        border: `1px solid ${active ? meta.color : "rgb(var(--c-qingbi-rgb) / 0.15)"}`,
                        borderRadius: "2px",
                      }}
                    >
                      <span
                        className="w-4 h-4 rounded-full"
                        style={{
                          backgroundColor: meta.color,
                          boxShadow: active ? `0 0 0 2px ${meta.color}33` : "none",
                        }}
                      />
                      <span
                        className="font-song text-[11px] tracking-wider"
                        style={{ color: active ? meta.color : "rgb(var(--c-qingbi-rgb) / 0.6)" }}
                      >
                        {season === "auto" ? "顺时" : meta.name}
                      </span>
                    </button>
                  );
                })}
              </div>
              <p className="font-song text-[10px] text-qingbi/50 mt-2 tracking-wider">
                · {seasonAccent[s.seasonTheme].motif}
              </p>
            </Section>

            {/* 纸色基调 */}
            <Section title="纸色基调" hint="PAPER">
              <div className="space-y-1.5">
                {(["xuanzhi", "chanyi", "qingnuan"] as PaperTone[]).map((tone) => {
                  const meta = paperToneBg[tone];
                  const labels: Record<PaperTone, string> = {
                    xuanzhi: "宣纸 · 本色",
                    chanyi: "蝉翼 · 暖黄",
                    qingnuan: "轻暖 · 赭调",
                  };
                  const active = s.paperTone === tone;
                  return (
                    <button
                      key={tone}
                      onClick={() => s.setPaperTone(tone)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 transition-all"
                      style={{
                      backgroundColor: active ? "rgb(var(--c-qingbi-rgb) / 0.06)" : "transparent",
                      border: `1px solid ${active ? "rgb(var(--c-qingbi-rgb) / 0.4)" : "rgb(var(--c-qingbi-rgb) / 0.12)"}`,
                      borderRadius: "2px",
                    }}
                    >
                      <span
                        className="w-7 h-7 shrink-0"
                        style={{
                          backgroundColor: meta.body,
                          border: `1px solid ${meta.border}`,
                          borderRadius: "2px",
                        }}
                      />
                      <span
                        className="font-song text-xs tracking-wider"
                        style={{ color: active ? "rgb(var(--c-daiqing-rgb))" : "rgb(var(--c-daiqing-rgb) / 0.65)" }}
                      >
                        {labels[tone]}
                      </span>
                      {active && (
                        <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 ml-auto text-qingbi" aria-hidden="true">
                          <path d="M3,8 L7,12 L13,4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
            </Section>

            {/* 墨色浓淡 */}
            <Section title="墨色浓淡" hint="INK">
              <div className="grid grid-cols-3 gap-1.5">
                {(["light", "normal", "dense"] as InkDensity[]).map((density) => {
                  const labels: Record<InkDensity, string> = {
                    light: "淡墨",
                    normal: "正墨",
                    dense: "浓墨",
                  };
                  const active = s.inkDensity === density;
                  return (
                    <button
                      key={density}
                      onClick={() => s.setInkDensity(density)}
                      className="flex flex-col items-center gap-2 py-3 transition-all"
                      style={{
                      backgroundColor: active ? "rgb(var(--c-zheshi-rgb) / 0.08)" : "transparent",
                      border: `1px solid ${active ? "rgb(var(--c-zheshi-rgb) / 0.5)" : "rgb(var(--c-qingbi-rgb) / 0.12)"}`,
                      borderRadius: "2px",
                    }}
                    >
                      <span
                        className="w-5 h-5 rounded-full"
                        style={{ backgroundColor: inkDensityColor[density] }}
                      />
                      <span
                        className="font-song text-[11px] tracking-wider"
                        style={{ color: active ? "rgb(var(--c-daiqing-rgb))" : "rgb(var(--c-daiqing-rgb) / 0.6)" }}
                      >
                        {labels[density]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </Section>

            {/* 书写速度 */}
            <Section title="运笔疾徐" hint="BRUSH">
              <div className="grid grid-cols-3 gap-1.5">
                {(["slow", "normal", "fast"] as BrushSpeed[]).map((speed) => {
                  const labels: Record<BrushSpeed, string> = {
                    slow: "徐徐",
                    normal: "寻常",
                    fast: "疾书",
                  };
                  const active = s.brushSpeed === speed;
                  return (
                    <button
                      key={speed}
                      onClick={() => s.setBrushSpeed(speed)}
                      className="py-2.5 font-song text-xs tracking-wider transition-all"
                      style={{
                      backgroundColor: active ? "rgb(var(--c-qingbi-rgb) / 0.1)" : "transparent",
                      border: `1px solid ${active ? "rgb(var(--c-qingbi-rgb) / 0.4)" : "rgb(var(--c-qingbi-rgb) / 0.12)"}`,
                      borderRadius: "2px",
                      color: active ? "rgb(var(--c-daiqing-rgb))" : "rgb(var(--c-daiqing-rgb) / 0.6)",
                    }}
                    >
                      {labels[speed]}
                    </button>
                  );
                })}
              </div>
              <p className="font-song text-[10px] text-qingbi/50 mt-2 tracking-wider">
                · 每字约 {brushSpeedDelay[s.brushSpeed]}ms
              </p>
            </Section>

            {/* 显隐开关 */}
            <Section title="显隐之节" hint="TOGGLE">
              <div className="space-y-1">
                <ToggleRow
                  label="水墨动效"
                  hint="卷轴展开 · 墨迹晕染"
                  value={s.showAnimations}
                  onChange={s.setShowAnimations}
                />
                <ToggleRow
                  label="朱印引用"
                  hint="典籍批注 · 朱色圈点"
                  value={s.showCitations}
                  onChange={s.setShowCitations}
                />
              </div>
            </Section>
          </div>

          {/* 底部 — 复位 */}
          <div className="px-5 py-3.5 border-t border-qingbi/15 flex items-center justify-between bg-qingbi/4">
            <span className="font-song text-[10px] text-qingbi/50 tracking-widest">
              设置存于本地 · 不外传
            </span>
            <button
              onClick={s.reset}
              className="font-song text-xs text-zhusha/80 hover:text-zhusha hover:bg-zhusha/8 px-3 py-1.5 transition-colors tracking-wider"
              style={{ borderRadius: "2px" }}
            >
              复归默认
            </button>
          </div>
        </div>

        {/* 青砚其人 · 二级子面板 — 自右侧于抽屉内滑入 */}
        <AgentPanel open={showAgent} onBack={() => setShowAgent(false)} />
      </aside>
    </>
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
        <span className="font-song text-[9px] text-qingbi/60 tracking-widest">{hint}</span>
        <span className="flex-1 h-px bg-qingbi/12 ml-1" />
      </div>
      {children}
    </section>
  );
}

function ToggleRow({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-qingbi/4 transition-colors"
      style={{ borderRadius: "2px" }}
    >
      <div className="text-left">
        <div className="font-song text-xs text-daiqing tracking-wider">{label}</div>
        <div className="font-song text-[10px] text-qingbi/50 tracking-wider">{hint}</div>
      </div>
      {/* 印章式开关 */}
      <span
        className="relative w-10 h-5 transition-colors duration-300"
        style={{
          backgroundColor: value ? "rgb(var(--c-qingbi-rgb))" : "rgb(var(--c-qingbi-rgb) / 0.18)",
          borderRadius: "10px",
        }}
      >
        <span
          className="absolute top-0.5 w-4 h-4 transition-all duration-300 flex items-center justify-center"
          style={{
            left: value ? "22px" : "2px",
            backgroundColor: value ? "rgb(var(--c-xuanzhi-light-rgb))" : "rgb(var(--c-xuanzhi-deep-rgb))",
            borderRadius: "50%",
            boxShadow: "0 1px 2px rgb(var(--c-daiqing-rgb) / 0.2)",
          }}
        >
          {value && (
            <svg viewBox="0 0 12 12" className="w-2.5 h-2.5 text-qingbi" aria-hidden="true">
              <path d="M2,6 L5,9 L10,3" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </span>
      </span>
    </button>
  );
}
